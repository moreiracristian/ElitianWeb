from django import forms
from .models import Suscriptor

class SuscripcionForm(forms.ModelForm):
    class Meta:
        model = Suscriptor
        fields = ['email']