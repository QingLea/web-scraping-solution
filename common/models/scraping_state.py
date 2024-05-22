from django.db import models


class ScrapingState(models.Model):
    from_value = models.IntegerField()
    scraped_records = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From: {self.from_value}, Scraped: {self.scraped_records}, At: {self.timestamp}"
