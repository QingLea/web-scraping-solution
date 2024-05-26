from django.urls import path

from .views import LoginView, SignupView, UpdateAccountView, UserProfileView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("profile/", UserProfileView.as_view()),
    path("signup/", SignupView.as_view()),
    path("account/", UpdateAccountView.as_view()),
]
