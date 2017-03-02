from docnow.models import Trend
from django.db.models import Max
from django.http import JsonResponse

import random

def trends(request):
    latest = Trend.objects.latest('created').created
    trends = Trend.objects.filter(created=latest).order_by('-tweets')
    trends = list(trends)
    i = random.randint(0, len(trends) - 2)
    t = trends[i]
    trends[i] = trends[i+1]
    trends[i+1] = t
    data = {
        "created": latest,
        "trends": [{"text": t.text, "tweets": t.tweets} for t in trends]
    }
    return JsonResponse(data)
    
