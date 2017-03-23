import datetime

from docnow.models import Trend
from django.conf import settings
from django.db.models import Max
from django.http import JsonResponse

locations = settings.TWITTER_TRENDS

def user(request):
    user_info = {}
    if request.user.is_authenticated():
        user_info =  request.user.as_dict()
    return JsonResponse(user_info)

def trends(request):
    places = []
    for place in settings.TWITTER_TRENDS:
        places.append(get_trends(place))
    return JsonResponse({"places": places})

def get_trends(loc):
    try:
        trends = Trend.objects.filter(woe_id=loc['woe_id'])
        latest = trends.latest('created').created
        trends = trends.filter(created=latest).order_by('-tweets')
    except Trend.DoesNotExist:
        latest = datetime.datetime.now()
        trends = []
    return {
        "created": latest,
        "name": loc["name"],
        "trends": [{"text": t.text, "tweets": t.tweets} for t in trends]
    }