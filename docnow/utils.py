from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialApp

def get_twitter_app_keys():
    apps = SocialApp.objects.filter(name="twitter")
    if apps.count() == 0:
        return None, None
    sa = apps[0]

    return (sa.client_id, sa.secret)


def get_twitter_user(user):
    accounts = user.socialaccount_set.filter(provider="twitter")
    if accounts.count() == 0:
        return None

    return accounts[0]


def get_twitter_user_keys(user):
    account = get_twitter_user(user)
    if not account:
        return None, None

    tokens = account.socialtoken_set.all()
    if tokens.count() == 0:
        return None, None

    return tokens[0].token, tokens[0].token_secret
