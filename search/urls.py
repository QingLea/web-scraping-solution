from django.urls import path

from .views import ProductView, ProductsView

urlpatterns = [
    path("", ProductsView.as_view()),
    path("<str:product_id>/", ProductView.as_view()),
]
