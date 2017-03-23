from django.db import models
from django.contrib.auth.models import AbstractUser

class Trend(models.Model):
    created = models.DateTimeField()
    woe_id = models.IntegerField()
    text = models.TextField()
    tweets = models.IntegerField()

class User(AbstractUser):

    def get_twitter_avatar_url(self):
        account = self.get_twitter_account()
        if not account:
            return None
        return account.get_avatar_url()

    def get_twitter_keys(self):
        keys = (None, None, None, None)

        account = self.get_twitter_account()
        if account is None:
            return keys

        tokens = account.socialtoken_set.all()
        if tokens.count() == 0:
            return keys

        return (
            token.app.client_id,
            token.app.secret,
            token.token, 
            token.token_secret
        )

    def get_twitter_account(self):
        accounts = self.socialaccount_set.filter(provider="twitter")
        if accounts.count() == 0:
            return None
        return accounts[0]