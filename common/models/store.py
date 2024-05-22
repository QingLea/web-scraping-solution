from django.db import models


class Store(models.Model):
    id = models.CharField(max_length=50, primary_key=True)

    def __str__(self):
        return self.id
