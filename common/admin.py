from django.contrib import admin

from .models import Product, Store, ScrapingState, Category, SubCategory

admin.site.register(Product)
admin.site.register(Store)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(ScrapingState)
