from django.conf.urls import include, url
from django.views.generic import TemplateView

from docnow import api
from docnow import views

urlpatterns = [
    url(r'^$', views.home, name='home'),

    url(r'^api/v1/trends$', api.trends, name='api_trends'),
]
