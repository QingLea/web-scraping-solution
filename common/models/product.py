from django.db import models

from .store import Store


class Product(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    sub_category = models.CharField(max_length=255, null=True, blank=True)
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
