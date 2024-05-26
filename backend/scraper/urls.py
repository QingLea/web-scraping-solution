from django.urls import path

from .views import StartScrapingView, StopScrapingView, ForceStopScrapingView, ScrapingStatusView, ResetScrapingView

urlpatterns = [
    path('start/', StartScrapingView.as_view(), name='start_scraping'),
    path('stop/', StopScrapingView.as_view(), name='stop_scraping'),
    path('force_stop/', ForceStopScrapingView.as_view(), name='force_stop_scraping'),
    path('status/', ScrapingStatusView.as_view(), name='scraping_status'),
    path('reset/', ResetScrapingView.as_view(), name='reset_scraping'),
]
