from django.contrib import admin
from .models import Categoria, Post

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'imagen_cat', 'activo')
    search_fields = ('nombre',)
    prepopulated_fields = {'slug': ('nombre',)}

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('autor', 'titulo', 'subtitulo', 'categoria', 'contenido', 'imagen_post', 'creado', 'etiqueta')
    search_fields = ('titulo', 'contenido', 'autor__username', 'categoria__nombre')
    list_filter = ('categoria', 'creado')
    prepopulated_fields = {'slug': ('titulo',)}

