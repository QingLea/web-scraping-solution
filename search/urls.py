from django.urls import path

from .views import ProductDetailView, ProductsView

urlpatterns = [
    path("", ProductsView.as_view()),
    path("<str:product_id>/", ProductDetailView.as_view()),
]
