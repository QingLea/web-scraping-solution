from rest_framework import authentication, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .scraping_controller import controller


class StartScrapingView(APIView):
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = controller.start_scraping()
        return Response({"detail": message})


class StopScrapingView(APIView):
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = controller.stop_scraping()
        return Response({"detail": message})


class ForceStopScrapingView(APIView):
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = controller.force_stop_scraping()
        return Response({"detail": message})


class ScrapingStatusView(APIView):
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status = controller.get_status()
        return Response(status)


class ResetScrapingView(APIView):
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = controller.reset_scraping()
        return Response({"detail": message})
