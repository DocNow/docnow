import time
import twarc
import logging
import datetime

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from docnow.models import Trend, User

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Capture trending statistics'

    def handle(self, *args, **options):
        while True:
            try:
                for place in settings.TWITTER_TRENDS:
                    get_trends(place['woe_id'])
            except Exception as e:
                # getting trends can fail until the superuser has 
                # created a Twitter app and linked their Twitter account
                logging.error(e)

            # 75 requests every 15 minutes
            time.sleep(15 * 60 / 75 * len(settings.TWITTER_TRENDS))

def get_trends(woe_id):
    logger.info("getting trends for %s", woe_id)

    user = User.objects.get(is_superuser=True)
    
    t = twarc.Twarc(
        user.twitter_consumer_key,
        user.twitter_consumer_secret,
        user.twitter_access_token,
        user.twitter_access_token_secret
    )
              
    created = datetime.datetime.now()
    trends = t.trends_place(woe_id)

    if len(trends) == 0 or 'trends' not in trends[0]: 
        logger.error("no trends for woe_id %s" % woe_id)
        return

    for trend in trends[0]['trends']:
        if trend['tweet_volume'] is None:
            continue
        Trend.objects.create(
            created=created,
            woe_id=woe_id,
            text=trend['name'],
            tweets=trend['tweet_volume']
        )
