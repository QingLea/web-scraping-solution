from django.urls import path

from .views import LoginView, SignupView, UpdateAccountView, UserProfileView

urlpatterns = [
    path("api/login/", LoginView.as_view()),
    path("api/user/", UserProfileView.as_view()),
    path("api/signup/", SignupView.as_view()),
    path("api/account/", UpdateAccountView.as_view()),
]
