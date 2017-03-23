from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialApp

def get_twitter_app_keys():
    apps = SocialApp.objects.filter(name="twitter")
    if apps.count() == 0:
        return None, None
    sa = apps[0]

    return (sa.client_id, sa.secret)
