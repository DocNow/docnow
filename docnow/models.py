from django.db import models
from django.contrib.auth.models import AbstractUser

class Trend(models.Model):
    created = models.DateTimeField()
    woe_id = models.IntegerField()
    text = models.TextField()
    tweets = models.IntegerField()

class User(AbstractUser):

    twitter_screen_name = None
    twitter_avatar_url = None
    twitter_consumer_key = None
    twitter_consumer_secret = None
    twitter_access_token = None
    twitter_access_token_secret= None

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)
        self._get_twitter_info()

    def as_dict(self):
        return {
            "username": self.username,
            "twitter_avatar_url": self.twitter_avatar_url,
            "twitter_screen_name": self.twitter_screen_name
        }

    def _get_twitter_info(self):
        accounts = self.socialaccount_set.filter(provider="twitter")
        if accounts.count() == 0:
            return

        account = accounts[0]
        provider = account.get_provider_account()
        self.twitter_screen_name = provider.get_screen_name()
        self.twitter_avatar_url = provider.get_avatar_url()

        token = account.socialtoken_set.all()[0]
        self.twitter_access_token = token.token
        self.twitter_access_token_secret = token.token_secret

        app = token.app
        self.twitter_consumer_key = app.client_id
        self.twitter_consumer_secret = app.secret
