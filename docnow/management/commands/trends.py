import time
import twarc
import logging
import datetime

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from docnow.models import Trend

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Capture trending statistics'

    def handle(self, *args, **options):
        t = twarc.Twarc(
            settings.TWITTER_CONSUMER_KEY,
            settings.TWITTER_CONSUMER_SECRET,
            settings.TWITTER_ACCESS_TOKEN,
            settings.TWITTER_ACCESS_TOKEN_SECRET
        )
        while True:
            created = datetime.datetime.utcnow()
            trends = t.trends_place(settings.TWITTER_WOE_ID)
            if len(trends) == 0 or 'trends' not in trends[0]: 
                logger.error("no trends for woe_id %s" % settings.TWITTER_WOE_ID)
                return

            for trend in trends[0]['trends']:
                if trend['tweet_volume'] is None:
                    continue
                Trend.objects.create(
                    created=created,
                    woe_id=settings.TWITTER_WOE_ID,
                    text=trend['name'],
                    tweets=trend['tweet_volume']
                )
            time.sleep(30)
