from django.contrib import admin

from .models import ImportAnomaly, ImportSession

admin.site.register(ImportSession)
admin.site.register(ImportAnomaly)
