from django.db import models

from .store import Store


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class SubCategory(models.Model):
    id = models.AutoField(primary_key=True)
    # unique=True is not used because there can be multiple sub-categories with the same category: "Uutuustuotteet"
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Product(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    sub_category = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    comparison_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    comparison_unit = models.CharField(max_length=50, null=True, blank=True)
    currency = models.CharField(max_length=10)
    image = models.URLField(max_length=255)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-updated", "-created"]
