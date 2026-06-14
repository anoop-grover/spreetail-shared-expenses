"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

import type { Group } from "@/types/domain";

type Expense = {
  id: number;
  group: number;
  description: string;
  amount: string;
  expense_date: string;
  paid_by: number;
  split_type?: string;
  currency?: number;
};

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [debts, setDebts] = useState<any[]>([]);

  const [balanceTrace, setBalanceTrace] =
  useState<any[]>([]);

  const [showSettlementModal,
  setShowSettlementModal] =
  useState(false);

const [settlementAmount,
  setSettlementAmount] =
  useState("");

const [settlementFrom,
  setSettlementFrom] =
  useState("");

const [settlementTo,
  setSettlementTo] =
  useState("");

  const [showDebtsModal, setShowDebtsModal] =
  useState(false);

const [showBalancesModal, setShowBalancesModal] =
  useState(false);

  const [users, setUsers] = useState<any[]>([]);
const [showMemberModal, setShowMemberModal] = useState(false);
const [selectedUser, setSelectedUser] = useState("");

  const [group, setGroup] =
    useState<Group | null>(null);

const [expenses, setExpenses] =
  useState<Expense[]>([]);

const [showExpenseModal, setShowExpenseModal] =
  useState(false);

const [expenseDescription, setExpenseDescription] =
  useState("");

const [expenseAmount, setExpenseAmount] =
  useState("");

const [paidBy, setPaidBy] =
  useState("");

const [balances, setBalances] =
  useState<any[]>([]);

const [selectedParticipants, setSelectedParticipants] =
  useState<number[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadGroup() {
      const token =
  localStorage.getItem("accessToken");

if (!token) {
  router.replace("/login");
  return;
}

 try {
      const usersData =
        await api("/users/", { token });

      setUsers(usersData);

      const data =
        await api<Group>(
          `/groups/${params.id}/`,
          { token }
        );

      setGroup(data);

      const expensesData =
        await api<Expense[]>(
          "/expenses/",
          { token }
        );

      setExpenses(
        expensesData.filter(
          (expense) =>
            expense.group === Number(params.id)
        )
      );
    } catch {
      router.replace("/groups");
    } finally {
      setLoading(false);
    }
  }

  loadGroup();
}, [params.id, router]);

  async function loadDebts() {
  const token =
    localStorage.getItem("accessToken");

  if (!token || !group) return;

  try {
    const result =
      await api<any>(
        `/groups/${group.id}/simplified-debts/`,
        { token }
      );

    setDebts(result.transfers || []);
    setShowDebtsModal(true);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to load debts"
    );
  }
}

async function loadBalances() {
  const token =
    localStorage.getItem("accessToken");

  if (!token || !group) return;

  try {
    const result =
      await api<any>(
        `/groups/${group.id}/balances/`,
        { token }
      );

    setBalances(
      result.balances || []
    );

    setBalanceTrace(
      result.trace || []
    );

    setShowBalancesModal(true);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to load balances"
    );
  }
}

async function createSettlement() {
  const token =
    localStorage.getItem("accessToken");

  if (
    !token ||
    !group ||
    !settlementAmount ||
    !settlementFrom ||
    !settlementTo
  ) {
    alert("Fill all fields");
    return;
  }

  try {
    await api("/settlements/", {
      method: "POST",
      token,
      body: JSON.stringify({
        group: group.id,
        paid_by:
          Number(settlementFrom),
        paid_to:
          Number(settlementTo),
        currency: 1,
        amount: settlementAmount,
        settlement_date:
          new Date().toISOString(),
      }),
    });

    alert(
      "Settlement recorded"
    );

    setShowSettlementModal(
      false
    );

    setSettlementAmount("");
    setSettlementFrom("");
    setSettlementTo("");

  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed"
    );
  }
}

async function addExpense() {
  const token =
    localStorage.getItem("accessToken");

  if (
    !token ||
    !group ||
    !expenseDescription ||
    !expenseAmount ||
    !paidBy ||
    selectedParticipants.length === 0
  ) {
    alert("Fill all fields");
    return;
  }

  try {
    await api("/expenses/", {
      method: "POST",
      token,
      body: JSON.stringify({
        group: group.id,
        paid_by: Number(paidBy),
        currency: 1,
        amount: expenseAmount,
        description: expenseDescription,
        split_type: "equal",
        expense_date:
          new Date().toISOString(),
        participants:
          selectedParticipants.map(
            (id) => ({
              user: id,
            })
          ),
      }),
    });

    const expensesData =
      await api<Expense[]>(
        "/expenses/",
        { token }
      );

    setExpenses(
      expensesData.filter(
        (expense) =>
          expense.group === group.id
      )
    );

    setShowExpenseModal(false);

    setExpenseDescription("");
    setExpenseAmount("");
    setPaidBy("");
    setSelectedParticipants([]);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to add expense"
    );
  }
}

async function addMember() {
  const token =
    localStorage.getItem("accessToken");

  if (
    !token ||
    !group ||
    !selectedUser
  ) {
    return;
  }

  try {
    await api("/memberships/", {
      method: "POST",
      token,
      body: JSON.stringify({
        group: group.id,
        user: Number(selectedUser),
        joined_at: new Date().toISOString(),
      }),
    });

    const updatedGroup =
      await api<Group>(
        `/groups/${group.id}/`,
        { token }
      );

    setGroup(updatedGroup);

    setShowMemberModal(false);
    setSelectedUser("");
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to add member"
    );
  }
}

async function deleteGroup() {
  const token =
    localStorage.getItem("accessToken");

  if (!token || !group) {
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete this group?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api(
      `/groups/${group.id}/`,
      {
        method: "DELETE",
        token,
      }
    );

    router.push("/groups");
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete group"
    );
  }
}

async function removeMember(
  membershipId: number
) {
  const token =
    localStorage.getItem("accessToken");

  if (!token || !group) {
    return;
  }

  const confirmed = confirm(
    "Remove this member?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api(
      `/memberships/${membershipId}/`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({
          left_at:
            new Date().toISOString(),
        }),
      }
    );

    const updatedGroup =
      await api<Group>(
        `/groups/${group.id}/`,
        { token }
      );

    setGroup(updatedGroup);
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to remove member"
    );
  }
}

async function deleteExpense(
  expenseId: number
) {
  const token =
    localStorage.getItem("accessToken");

  if (!token || !group) {
    return;
  }

  try {
    await api(
      `/expenses/${expenseId}/`,
      {
        method: "DELETE",
        token,
      }
    );

    setExpenses(
      expenses.filter(
        (e) => e.id !== expenseId
      )
    );
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete expense"
    );
  }
}

function getUserName(userId: number) {
  const user = users.find(
    (u) => u.id === userId
  );

  return (
    user?.full_name ||
    user?.name ||
    user?.email ||
    `User ${userId}`
  );
}

if (loading) {
    return (
      <AppShell>
        <div className="p-8">
          Loading group...
        </div>
      </AppShell>
    );
  }

  if (!group) {
    return null;
  }
  const totalExpenses =
  expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  return (
    <AppShell>
      {showMemberModal && group && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-xl bg-white p-6">

      <h2 className="mb-4 text-xl font-semibold">
        Add Member
      </h2>

      <select
        value={selectedUser}
        onChange={(e) =>
          setSelectedUser(e.target.value)
        }
        className="w-full rounded border p-3"
      >
        <option value="">
          Select User
        </option>

        {users
          .filter(
            (user) =>
              !group.memberships.some(
                (member) =>
                  member.user === user.id
              )
          )
          .map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.full_name ||
                user.email}
            </option>
          ))}
      </select>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() =>
            setShowMemberModal(false)
          }
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>

        <button
          onClick={addMember}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Add
        </button>
      </div>
    </div>
  </div>
)}
        {showExpenseModal && group && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Add Expense
      </h2>

      <input
        placeholder="Description"
        value={expenseDescription}
        onChange={(e) =>
          setExpenseDescription(
            e.target.value
          )
        }
        className="mb-3 w-full rounded border p-3"
      />

      <input
        type="number"
        placeholder="Amount"
        value={expenseAmount}
        onChange={(e) =>
          setExpenseAmount(
            e.target.value
          )
        }
        className="mb-3 w-full rounded border p-3"
      />

      <select
        value={paidBy}
        onChange={(e) =>
          setPaidBy(e.target.value)
        }
        className="mb-3 w-full rounded border p-3"
      >
        <option value="">
          Who Paid?
        </option>

        {group.memberships
  .filter(
    (member) =>
      member.left_at === null
  )
  .map(
          (member) => (
            <option
              key={member.user}
              value={member.user}
            >
              {member.user_name ||
                member.user_email}
            </option>
          )
        )}
      </select>

      <div className="mb-3">
        <div className="mb-2 font-medium">
          Participants
        </div>

        {group.memberships
  .filter(
    (member) =>
      member.left_at === null
  )
  .map(
          (member) => (
            <label
              key={member.user}
              className="mb-2 flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectedParticipants.includes(
                  member.user
                )}
                onChange={(e) => {
                  if (
                    e.target.checked
                  ) {
                    setSelectedParticipants(
                      [
                        ...selectedParticipants,
                        member.user,
                      ]
                    );
                  } else {
                    setSelectedParticipants(
                      selectedParticipants.filter(
                        (id) =>
                          id !==
                          member.user
                      )
                    );
                  }
                }}
              />

              {member.user_name ||
                member.user_email}
            </label>
          )
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() =>
            setShowExpenseModal(false)
          }
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>

        <button
          onClick={addExpense}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Save Expense
        </button>
      </div>
    </div>
  </div>
)}

{showBalancesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

      <h2 className="mb-4 text-xl font-semibold">
        Individual Balances
      </h2>

      <div className="space-y-3">
        {balances.map((balance) => (
          <div
            key={balance.user_id}
            className="rounded-xl border p-4 flex items-center justify-between"
          >
            <div>
              {getUserName(balance.user_id)}
            </div>

            <div
              className={`font-semibold ${
                Number(balance.net) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{balance.net}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 mb-3 text-lg font-semibold">
        Balance Trace
      </h3>

      <div className="space-y-3">
        {balanceTrace.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border p-4"
          >
            <div>
              User: {getUserName(item.user_id)}
            </div>

            <div>
              Type: {item.type}
            </div>

            <div>
              Expense ID: {item.expense_id}
            </div>

            <div>
              Delta: ₹{item.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() =>
            setShowBalancesModal(false)
          }
          className="rounded bg-gray-200 px-4 py-2"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{showSettlementModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6">

      <h2 className="mb-4 text-xl font-semibold">
        Record Payment
      </h2>

      <select
        value={settlementFrom}
        onChange={(e) =>
          setSettlementFrom(
            e.target.value
          )
        }
        className="mb-3 w-full rounded border p-3"
      >
        <option value="">
          Who Paid?
        </option>

        {group.memberships.map(
          (member) => (
            <option
              key={member.user}
              value={member.user}
            >
              {member.user_name}
            </option>
          )
        )}
      </select>

      <select
        value={settlementTo}
        onChange={(e) =>
          setSettlementTo(
            e.target.value
          )
        }
        className="mb-3 w-full rounded border p-3"
      >
        <option value="">
          Paid To?
        </option>

        {group.memberships.map(
          (member) => (
            <option
              key={member.user}
              value={member.user}
            >
              {member.user_name}
            </option>
          )
        )}
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={settlementAmount}
        onChange={(e) =>
          setSettlementAmount(
            e.target.value
          )
        }
        className="mb-3 w-full rounded border p-3"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() =>
            setShowSettlementModal(
              false
            )
          }
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>

        <button
          onClick={
            createSettlement
          }
          className="rounded bg-purple-600 px-4 py-2 text-white"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{showDebtsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white p-6">

      <h2 className="mb-4 text-xl font-semibold">
        Simplified Debts
      </h2>

      <div className="space-y-3">
        {debts.map((debt, index) => (
          <div
            key={index}
            className="rounded-xl border p-4"
          >
            {getUserName(debt.from_user_id)}
            {" → "}
            {getUserName(debt.to_user_id)}

            <div className="font-semibold text-green-600">
              ₹{debt.amount}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() =>
            setShowDebtsModal(false)
          }
          className="rounded bg-gray-200 px-4 py-2"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      <div className="mb-8">
        <button
          onClick={() =>
            router.push("/groups")
          }
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Groups
        </button>

        <h1 className="text-4xl font-bold">
          {group.name}
        </h1>

        <p className="mt-2 text-slate-500">
          {group.description ||
            "No description provided"}
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">
              Members
            </div>

            <div className="mt-2 text-2xl font-bold">
              {group.memberships.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">
              Currency
            </div>

            <div className="mt-2 text-2xl font-bold">
              {
                group.default_currency_code
              }
            </div>
          </CardContent>
        </Card>

        <Card>
  <CardContent className="p-4">
    <div className="text-sm text-slate-500">
      Total Expenses
    </div>

    <div className="mt-2 text-2xl font-bold">
      ₹{totalExpenses}
    </div>
  </CardContent>
</Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">
              Status
            </div>

            <div className="mt-2 text-xl font-bold text-green-600">
              Active
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
  <button
  onClick={() =>
    setShowMemberModal(true)
  }
  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
>
  Add Member
</button>

  <button
  onClick={() =>
    setShowExpenseModal(true)
  }
  className="rounded-lg bg-green-600 px-4 py-2 text-white"
>
  Add Expense
</button>

  <button
  onClick={loadDebts}
  className="rounded-lg bg-orange-600 px-4 py-2 text-white"
>
  Simplify Debts
</button>

<button
  onClick={loadBalances}
  className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
>
  View Balances
</button>

<button
  onClick={() =>
    setShowSettlementModal(
      true
    )
  }
  className="rounded-lg bg-purple-600 px-4 py-2 text-white"
>
  Record Payment
</button>

  <button
  onClick={deleteGroup}
  className="rounded-lg bg-red-600 px-4 py-2 text-white"
>
  Delete Group
</button>
</div>


      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Members
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {group.memberships
  .filter(
    (member) =>
      member.left_at === null
  )
  .map(
    (member) => (
                <div
                  key={member.id}
                  className="rounded-xl border p-4"
                >
                  <div className="font-medium">
                    {member.user_name ||
                      member.user_email}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Joined{" "}
                    {new Date(
                      member.joined_at
                    ).toLocaleDateString()}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {!member.left_at && (
  <button
    onClick={() =>
      removeMember(member.id)
    }
    className="mt-3 rounded bg-red-100 px-3 py-1 text-xs text-red-700"
  >
    Remove Member
  </button>
)}
                    {member.left_at ? (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                        Left
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
  <CardContent className="p-6">
    <h2 className="mb-4 text-xl font-semibold">
      Former Members
    </h2>

    {group.memberships.filter(
      (member) => member.left_at
    ).length === 0 ? (
      <div className="text-slate-500">
        No former members
      </div>
    ) : (
      <div className="space-y-3">
        {group.memberships
          .filter(
            (member) => member.left_at
          )
          .map((member) => (
            <div
              key={member.id}
              className="rounded-xl border p-4"
            >
              <div className="font-medium">
                {member.user_name ||
                  member.user_email}
              </div>

              <div className="text-sm text-slate-500">
                Joined:
                {" "}
                {new Date(
                  member.joined_at
                ).toLocaleDateString()}
              </div>

              <div className="text-sm text-slate-500">
                Left:
                {" "}
                {new Date(
                  member.left_at!
                ).toLocaleDateString()}
              </div>
            </div>
          ))}
      </div>
    )}
  </CardContent>
</Card>

      <Card className="mt-6">
  <CardContent className="p-6">
    <h2 className="mb-4 text-xl font-semibold">
      Expense History
    </h2>
    {expenses.length === 0 ? (
      <div className="text-slate-500">
        No expenses yet
      </div>
    ) : (
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-xl border p-4"
          >
            <div className="font-semibold">
              {expense.description}
            </div>

            <div className="mt-1 text-green-600 font-medium">
              ₹{expense.amount}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {new Date(
                expense.expense_date
              ).toLocaleDateString()}
            </div>
            <button
  onClick={() =>
    deleteExpense(expense.id)
  }
  className="mt-3 rounded bg-red-100 px-3 py-1 text-xs text-red-700"
>
  Delete Expense
</button>
          </div>
        ))}
      </div>
    )}
      </CardContent>
</Card>
    </AppShell>
  );
}