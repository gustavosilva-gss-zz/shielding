from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("volunteer", views.volunteer_view, name="volunteer"),
    path("volunteer/profile", views.volunteer_profile, name="volunteer_profile"),
    path("establishment/<int:id>", views.establishment_profile, name="establishment"),
    path("establishment/manage", views.establishment_manage, name="establishment_manage"),
    path('open-chat', views.open_chat, name='open_chat'),

    # AUTHENTICATION

    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.user_register, name="user_register"),
    path("establishment/register", views.establishment_register, name="establishment_register"),
    path("volunteer/register", views.volunteer_register, name="volunteer_register"),

    # API ONLY
    # here are some paths whose classification fall only under API category
    # this means some paths of authentication were left out
    path("establishments", views.establishments, name="establishments"),
    path("donate", views.donate, name="donate"),
    path("edit-establishment/<str:field>", views.edit_establishment, name="edit_establishment"),
    path("donation/<int:id>", views.donation, name="donation"),
    path("edit-donation/<int:id>", views.edit_donation, name="edit_donation"),
    path("edit-volunteer/<str:field>", views.edit_volunteer, name="edit_volunteer"),
]
