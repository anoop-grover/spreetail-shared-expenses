from django.contrib import admin

from .models import Currency, Group, GroupMembership

admin.site.register(Currency)
admin.site.register(Group)
admin.site.register(GroupMembership)
