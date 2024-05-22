# store/models.py

from django.db import models


class Store(models.Model):
    store_id = models.CharField(max_length=50, primary_key=True)

    def __str__(self):
        return self.store_id


class Product(models.Model):
    item_id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    sub_category = models.CharField(max_length=255, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10)
    image = models.URLField(max_length=255)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
