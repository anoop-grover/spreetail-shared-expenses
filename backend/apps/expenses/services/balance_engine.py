from collections import defaultdict
from decimal import Decimal

from apps.expenses.models import Expense
from apps.settlements.models import Settlement


class BalanceEngine:
    def __init__(self, group):
        self.group = group

    def calculate(self):
        balances = defaultdict(lambda: Decimal("0.00"))
        traces = []
        expenses = (
            Expense.objects.filter(group=self.group, deleted_at__isnull=True)
            .select_related("paid_by", "currency")
            .prefetch_related("participants__user")
        )
        for expense in expenses:
            paid_delta = expense.amount_in_group_currency
            balances[expense.paid_by_id] += paid_delta
            traces.append({
                "type": "expense_paid",
                "expense_id": expense.id,
                "user_id": expense.paid_by_id,
                "source_amount": str(expense.amount),
                "source_currency": expense.currency.code,
                "exchange_rate_to_group": str(expense.exchange_rate_to_group),
                "delta": str(paid_delta),
            })
            for participant in expense.participants.all():
                share_delta = participant.share_amount_in_group_currency
                balances[participant.user_id] -= share_delta
                traces.append({
                    "type": "expense_share",
                    "expense_id": expense.id,
                    "user_id": participant.user_id,
                    "source_share": str(participant.share_amount),
                    "source_currency": expense.currency.code,
                    "exchange_rate_to_group": str(expense.exchange_rate_to_group),
                    "delta": str(-share_delta),
                })

        settlements = Settlement.objects.filter(group=self.group).select_related("paid_by", "paid_to")
        for settlement in settlements:
            balances[settlement.paid_by_id] += settlement.amount
            balances[settlement.paid_to_id] -= settlement.amount
            traces.append({"type": "settlement_paid", "settlement_id": settlement.id, "user_id": settlement.paid_by_id, "delta": str(settlement.amount)})
            traces.append({"type": "settlement_received", "settlement_id": settlement.id, "user_id": settlement.paid_to_id, "delta": str(-settlement.amount)})

        return {
            "group_id": self.group.id,
            "currency": self.group.default_currency.code,
            "balances": [{"user_id": user_id, "net": str(amount.quantize(Decimal("0.01")))} for user_id, amount in sorted(balances.items())],
            "trace": traces,
        }

    def simplify_debts(self):
        balances = {row["user_id"]: Decimal(row["net"]) for row in self.calculate()["balances"]}
        creditors = sorted([(u, a) for u, a in balances.items() if a > 0], key=lambda x: x[1], reverse=True)
        debtors = sorted([(u, -a) for u, a in balances.items() if a < 0], key=lambda x: x[1], reverse=True)
        transfers = []
        i = j = 0
        while i < len(debtors) and j < len(creditors):
            debtor, debt = debtors[i]
            creditor, credit = creditors[j]
            amount = min(debt, credit).quantize(Decimal("0.01"))
            if amount > 0:
                transfers.append({"from_user_id": debtor, "to_user_id": creditor, "amount": str(amount)})
            debtors[i] = (debtor, debt - amount)
            creditors[j] = (creditor, credit - amount)
            if debtors[i][1] == 0:
                i += 1
            if creditors[j][1] == 0:
                j += 1
        return {"group_id": self.group.id, "currency": self.group.default_currency.code, "transfers": transfers}
