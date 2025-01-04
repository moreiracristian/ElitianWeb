from django.db import models
# Create your models here.


class Categorias(models.Model):
    nombre = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True, null=True)
    activo = models.BooleanField(default = True)

    def __str__(self) -> str:
        return self.nombre
    
    class Meta:
        verbose_name_plural = 'Categoria'
    
class Productos(models.Model):
    codigo = models.CharField(max_length = 6, primary_key = True)
    nombre = models.CharField(max_length = 100)
    slug = models.SlugField(unique = True, blank=True, null=True)
    categoria = models.ForeignKey(Categorias, on_delete = models.CASCADE)
    ofrecido = models.CharField(max_length = 50, null=True)
    marca = models.CharField(max_length = 50)
    precio = models.DecimalField(max_digits = 10, decimal_places = 2, default = 0.00)
    precio_oferta = models.DecimalField(max_digits=10, decimal_places=2, default = 0.00, null=True, blank=True)
    descripcion = models.TextField(blank = True, null = True)
    ingredientes = models.TextField(blank = True, null = True)
    modo_uso = models.TextField(blank = True, null = True)
    conservacion = models.TextField(blank = True, null = True)
    cont_peso_neto = models.CharField(max_length = 10, default=0)
    destacado = models.BooleanField(default = True)
    activo = models.BooleanField(default = True)
    stock = models.PositiveIntegerField(default= 0)
    descuento = models.IntegerField(default = 0)
    imagen = models.ImageField(upload_to='tienda_images/productos', null=True)
    imagen2 = models.ImageField(upload_to='tienda_images/productos', null=True)
    imagen3 = models.ImageField(upload_to='tienda_images/productos', null=True)
    
    def tiene_stock_disponible(self, cantidad):
        return self.stock >= cantidad

    def __str__(self) -> str:
        return self.nombre
    
    class Meta:
        verbose_name_plural = 'Producto'
