from django.contrib import admin
from .models import Categorias, Productos

@admin.register(Categorias)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'activo']
    prepopulated_fields = {'slug': ('nombre',)}

@admin.register(Productos)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'categoria', 'precio', 'precio_oferta', 'ofrecido', 'marca', 'descripcion', 'ingredientes', 'modo_uso', 'conservacion', 'cont_peso_neto', 'destacado', 'activo', 'imagen', 'imagen2', 'imagen3']
    list_filter = ['categoria', 'activo']
    search_fields = ['nombre', 'codigo']
    prepopulated_fields = {'slug': ('nombre',)}