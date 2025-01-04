from django.db import models
from django.contrib.auth.models import User
from ckeditor.fields import RichTextField
from django.utils.safestring import mark_safe

# Modelo para la categoría del blog
class Categoria(models.Model):
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=500, null=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    imagen_cat = models.ImageField(upload_to='blog_images', blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.nombre

    class Meta:
        verbose_name_plural = 'Categorías'

# Modelo para los posteos del blog
class Post(models.Model):
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=150)
    subtitulo = models.CharField(max_length=100)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='posts')
    contenido = RichTextField()
    imagen_post = models.ImageField(upload_to='blog_images', null=True, blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    etiqueta = models.CharField(max_length=50)

    def fecha_creacion_formato(self):
        return self.creado.strftime('%Y-%m-%d %H:%M:%S')

    def __str__(self):
        return f'{self.titulo} - {self.categoria.nombre}'
    
    def formatted_html(self):
        return mark_safe(self.contenido)

class Suscriptor(models.Model):
    email = models.EmailField(unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Suscriptor: {self.email} - Registrado el {self.fecha_registro.strftime("%Y-%m-%d %H:%M:%S")}'