from django.shortcuts import render
from django.views.generic.base import TemplateView

from docnow.models import Trend

def home(request):
    return render(request, 'home.html')
    
