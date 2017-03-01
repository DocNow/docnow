from django.db import models

class Trend(models.Model):
    created = models.DateTimeField()
    woe_id = models.IntegerField()
    text = models.TextField()
    tweets = models.IntegerField()
