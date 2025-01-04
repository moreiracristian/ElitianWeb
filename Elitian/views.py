from django.shortcuts import render


def index(request):
    return render(request, 'index.html')

def conocenos(request):
    return render(request, 'conocenos.html')

def recicla(request):
    return render(request, 'recicla.html')

def contacto(request):
    return render(request, 'contacto.html')