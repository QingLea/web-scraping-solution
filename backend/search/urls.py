from django.urls import path

from .views import ProductDetailView, ProductsView, CategoryView

urlpatterns = [
    path("", ProductsView.as_view()),
    path("<int:product_id>/", ProductDetailView.as_view()),
    path("category/", CategoryView.as_view()),
]
