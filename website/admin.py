from django.contrib import admin

from .models import User, Establishment, Volunteer, Donation

admin.site.register(User)
admin.site.register(Establishment)
admin.site.register(Volunteer)
admin.site.register(Donation)
