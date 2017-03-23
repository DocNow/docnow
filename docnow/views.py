from django.conf import settings
from django.shortcuts import render, redirect
from django.views.generic.base import TemplateView
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.contrib.auth.decorators import login_required, permission_required

from docnow.models import Trend, User
from docnow.utils import get_twitter_app_keys

def home(request):
    if User.objects.count() == 0:
        return redirect("account_signup")
    return render(request, 'home.html')

@login_required
def profile(request):
    # first user to login is promomted to admin
    u = request.user
    if not u.is_superuser and User.objects.count() == 1:
        u.is_superuser = True
        u.save()

    # save provided app keys if the user is the superuser
    if request.user.is_superuser and request.method == 'POST':
        # remove existing Twitter App
        SocialApp.objects.filter(name="twitter").delete()
    
        # create new Twitter App
        app = SocialApp(
            provider="twitter",
            name="twitter",
            client_id=request.POST['consumer_key'],
            secret=request.POST['consumer_secret'],
        )
        site = Site.objects.get(id=1)
        app.save()
        app.sites.add(site)
        app.save()

    app_keys = get_twitter_app_keys()

    return render(request, 'profile.html', {
        "consumer_key": app_keys[0],
        "consumer_secret": app_keys[1],
        "twitter_user": request.user
    })
