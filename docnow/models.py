from django.db import models

class Trend(models.Model):
    created = models.DateTimeField()
    woe_id = models.IntegerField()
    text = models.TextField()
    tweets = models.IntegerField()

class Configuration(models.Model):
    consumer_key = models.TextField()
    consumer_secret = models.TextField()
