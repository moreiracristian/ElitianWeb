from django.shortcuts import render, get_object_or_404
from .models import Categorias, Productos
#create your views here.

def tienda(request):
    categorias_list = Categorias.objects.all()
    return render(request, 'tienda/tienda.html', {'categorias_list': categorias_list})

def tienda_categoria(request, slug):
    categoria = get_object_or_404(Categorias, slug=slug)
    productos_list = Productos.objects.filter(categoria=categoria)
    return render(request, 'tienda/tienda_categoria.html', {'categoria': categoria, 'productos_list': productos_list})

def tienda_producto(request, categoria_slug, producto_slug):
    categoria = get_object_or_404(Categorias, slug=categoria_slug)
    producto = get_object_or_404(Productos, slug=producto_slug, categoria=categoria)
    imagenes = [producto.imagen]
    return render(request, 'tienda/tienda_producto.html', {'categoria': categoria, 'producto': producto, 'imagenes': imagenes})