from django.contrib import admin

from .models import Expense, ExpenseHistory, ExpenseParticipant

admin.site.register(Expense)
admin.site.register(ExpenseParticipant)
admin.site.register(ExpenseHistory)
