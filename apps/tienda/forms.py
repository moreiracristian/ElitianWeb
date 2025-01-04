from django import forms
from django.contrib.auth.forms import UserCreationForm, PasswordResetForm
from django.contrib.auth.models import User

class LoginForm(forms.Form):
    username = forms.CharField(label='Nombre de usuario')
    password = forms.CharField(label='Contraseña', widget=forms.PasswordInput)

class RegistrationForm(UserCreationForm):
    username = forms.CharField()
    first_name = forms.CharField()
    email = forms.CharField()
    password1 = forms.CharField(label='Contraseña', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Repetir contraseña', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'password1', 'password2']
    
    def clean_password2(self):
        cd = self.cleaned_data
        if cd['password1'] !=cd['password2']:
            return forms.ValidationError('Las contraseñas no son iguales')
        return cd['password2']

class CustomPasswordResetForm(PasswordResetForm):
    # Puedes personalizar este formulario si es necesario
    pass

