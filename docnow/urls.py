from django.conf.urls import include, url
from django.views.generic import TemplateView
from django.contrib import admin

from docnow import api
from docnow import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^accounts/profile/$', views.profile, name='profile'),

    url(r'^api/v1/trends$', api.trends, name='api_trends'),
    url(r'^api/v1/user$', api.user, name='api_user'),

    url(r'^accounts/', include('allauth.urls')),
    url(r'^admin/', admin.site.urls),
]
