from rest_framework.response import Response
from rest_framework.views import APIView

from .scraping_controller import controller


class StartScrapingView(APIView):
    # todo uncomment the following lines to enable authentication
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = controller.start_scraping()
        return Response({"message": message})


class StopScrapingView(APIView):
    def post(self, request):
        message = controller.stop_scraping()
        return Response({"message": message})


class ForceStopScrapingView(APIView):
    def post(self, request):
        message = controller.force_stop_scraping()
        return Response({"message": message})


class ScrapingStatusView(APIView):
    def get(self, request):
        status = controller.get_status()
        return Response(status)


class ResetScrapingView(APIView):
    def post(self, request):
        message = controller.reset_scraping()
        return Response({"message": message})
