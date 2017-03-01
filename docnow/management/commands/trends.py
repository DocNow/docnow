import twarc
import logging

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

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
        trends = t.trends_place(settings.TWITTER_WOE_ID)
        if len(trends) == 0 or 'trends' not in trends[0]: 
            logger.error("no trends for woe_id %s" % settings.TWITTER_WOE_ID)
            return
        for trend in trends[0]['trends']:
            if trend['tweet_volume'] is None:
                continue
            print(trend['name'], trend['tweet_volume'])



        """
[
  {
    "trends": [
      {
        "name": "#ApuracaoRJ",
        "url": "http://twitter.com/search?q=%23ApuracaoRJ",
        "promoted_content": null,
        "query": "%23ApuracaoRJ",
        "tweet_volume": 104920
        """

        



