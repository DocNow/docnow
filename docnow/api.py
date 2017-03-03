import datetime

from docnow.models import Trend
from django.db.models import Max
from django.http import JsonResponse

def trends(request):
    try:
        latest = Trend.objects.latest('created').created
        trends = Trend.objects.filter(created=latest).order_by('-tweets')
    except Trend.DoesNotExist:
        latest = datetime.datetime.now()
        trends = []

    data = {
        "created": latest,
        "trends": [{"text": t.text, "tweets": t.tweets} for t in trends]
    }
    return JsonResponse(data)
