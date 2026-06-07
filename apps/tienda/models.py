from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator

IVA_OPCIONES = [
    ('0', '0% — Exento'),
    ('10.5', '10.5% — Tasa reducida'),
    ('21', '21% — Tasa general'),
]


class Categorias(models.Model):
    nombre = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)
    descripcion = models.CharField(max_length=300, blank=True)
    imagen = models.ImageField(upload_to='tienda_images/categorias', null=True, blank=True)
    activo = models.BooleanField(default=True)
    orden = models.PositiveSmallIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('tienda_categoria', kwargs={'slug': self.slug})

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['orden', 'nombre']


class Productos(models.Model):
    codigo = models.CharField(max_length=6, unique=True)
    nombre = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    categoria = models.ForeignKey(
        Categorias, on_delete=models.PROTECT, related_name='productos'
    )
    ofrecido = models.CharField(max_length=50, blank=True)
    marca = models.CharField(max_length=50)
    precio = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0'))]
    )
    precio_oferta = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    descripcion = models.TextField(blank=True)
    ingredientes = models.TextField(blank=True)
    modo_uso = models.TextField(blank=True)
    conservacion = models.TextField(blank=True)
    cont_peso_neto = models.CharField(max_length=10, blank=True)
    destacado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)
    descuento = models.PositiveSmallIntegerField(default=0)  # porcentaje 0–100
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    @property
    def precio_final(self):
        if self.precio_oferta:
            return self.precio_oferta
        if self.descuento:
            return round(self.precio * (1 - self.descuento / 100), 2)
        return self.precio

    @property
    def tiene_oferta(self):
        return bool(self.precio_oferta or self.descuento)

    @property
    def imagen_principal(self):
        img = self.imagenes.filter(principal=True).first()
        return img or self.imagenes.first()

    def tiene_stock_disponible(self, cantidad=1):
        return self.stock >= cantidad

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('tienda_producto', kwargs={
            'categoria_slug': self.categoria.slug,
            'producto_slug': self.slug,
        })

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['nombre']


class ProductoImagen(models.Model):
    producto = models.ForeignKey(
        Productos, on_delete=models.CASCADE, related_name='imagenes'
    )
    imagen = models.ImageField(upload_to='tienda_images/productos')
    principal = models.BooleanField(default=False)
    orden = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return f'Imagen de {self.producto.nombre}'

    class Meta:
        ordering = ['-principal', 'orden']
        verbose_name = 'Imagen'
        verbose_name_plural = 'Imágenes'


class Resena(models.Model):
    producto = models.ForeignKey(
        Productos, on_delete=models.CASCADE, related_name='resenas'
    )
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    comentario = models.TextField()
    calificacion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    creado = models.DateTimeField(auto_now_add=True)
    aprobado = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.usuario} — {self.producto} ({self.calificacion}★)'

    class Meta:
        unique_together = ('producto', 'usuario')
        verbose_name = 'Reseña'
        verbose_name_plural = 'Reseñas'
        ordering = ['-creado']


class Carrito(models.Model):
    usuario = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, blank=True
    )
    session_key = models.CharField(max_length=40, null=True, blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.select_related('producto').all())

    @property
    def cantidad_items(self):
        return sum(item.cantidad for item in self.items.all())

    def __str__(self):
        ident = self.usuario or self.session_key
        return f'Carrito de {ident}'

    class Meta:
        verbose_name = 'Carrito'
        verbose_name_plural = 'Carritos'


class ItemCarrito(models.Model):
    carrito = models.ForeignKey(
        Carrito, on_delete=models.CASCADE, related_name='items'
    )
    producto = models.ForeignKey(Productos, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    @property
    def subtotal(self):
        return self.producto.precio_final * self.cantidad

    def __str__(self):
        return f'{self.cantidad}x {self.producto.nombre}'

    class Meta:
        unique_together = ('carrito', 'producto')
        verbose_name = 'Ítem de carrito'
        verbose_name_plural = 'Ítems de carrito'


class Orden(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]
    METODO_PAGO_CHOICES = [
        ('transferencia', 'Transferencia bancaria'),
        ('efectivo', 'Efectivo al retirar'),
        ('tarjeta', 'Tarjeta de crédito'),
    ]
    METODOS_CON_DESCUENTO = {'transferencia', 'efectivo'}
    DESCUENTO_PORCENTAJE = 20

    usuario = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='ordenes'
    )
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default='pendiente'
    )
    metodo_pago = models.CharField(
        max_length=20, choices=METODO_PAGO_CHOICES, default='transferencia'
    )
    total = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_aplicado = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    creado = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(blank=True)
    mp_preference_id = models.CharField(max_length=200, blank=True)
    mp_payment_id = models.CharField(max_length=100, blank=True)
    mp_estado_pago = models.CharField(max_length=50, blank=True)
    # Datos de envío
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=200, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    provincia = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f'Orden #{self.pk} — {self.usuario} [{self.get_estado_display()}]'

    class Meta:
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'
        ordering = ['-creado']


class ItemOrden(models.Model):
    orden = models.ForeignKey(
        Orden, on_delete=models.CASCADE, related_name='items'
    )
    producto = models.ForeignKey(Productos, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.precio_unitario * self.cantidad

    def __str__(self):
        return f'{self.cantidad}x {self.producto.nombre} @ ${self.precio_unitario}'

    class Meta:
        verbose_name = 'Ítem de orden'
        verbose_name_plural = 'Ítems de orden'


class ConfiguracionGlobal(models.Model):
    """Singleton — siempre pk=1. Configura defaults globales de costos."""
    margen_ganancia = models.DecimalField(
        max_digits=5, decimal_places=2, default=30,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('1000'))],
        help_text='Margen de ganancia global en %'
    )
    iva = models.CharField(max_length=5, choices=IVA_OPCIONES, default='21')
    recargo_tarjeta = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='Recargo por pago con tarjeta de crédito en %'
    )
    transporte = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='Costo de transporte fijo por defecto (en $)'
    )

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def obtener(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Configuración global de costos'

    class Meta:
        verbose_name = 'Configuración global'
        verbose_name_plural = 'Configuración global'


class ConfiguracionCategoriaCosto(models.Model):
    """Margen por categoría — override del global."""
    categoria = models.OneToOneField(
        Categorias, on_delete=models.CASCADE, related_name='config_costo'
    )
    margen_ganancia = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('1000'))],
        help_text='Margen de ganancia para esta categoría en %'
    )
    iva = models.CharField(
        max_length=5, choices=IVA_OPCIONES, blank=True,
        help_text='IVA específico para esta categoría (vacío = usar global)'
    )

    def __str__(self):
        return f'Costo categoría: {self.categoria.nombre}'

    class Meta:
        verbose_name = 'Config. costo por categoría'
        verbose_name_plural = 'Config. costos por categoría'


class CostoProducto(models.Model):
    """Estructura de costos detallada por producto."""
    producto = models.OneToOneField(
        Productos, on_delete=models.CASCADE, related_name='costo'
    )
    costo_neto = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='Costo de compra al proveedor sin IVA'
    )
    descuento_proveedor = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        help_text='Descuento otorgado por el proveedor en %'
    )
    impuesto_interno = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='Impuesto interno adicional en %'
    )
    transporte = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='Costo de transporte en $ (vacío = usar global)'
    )
    margen_ganancia = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('1000'))],
        help_text='Margen de ganancia en % (vacío = usar categoría o global)'
    )
    iva = models.CharField(
        max_length=5, choices=IVA_OPCIONES, blank=True,
        help_text='IVA de este producto (vacío = usar categoría o global)'
    )
    descuento_promocion = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        help_text='Descuento promocional al consumidor final en %'
    )
    recargo_tarjeta = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='Recargo tarjeta de crédito en % (vacío = usar global)'
    )

    @property
    def margen_efectivo(self):
        if self.margen_ganancia is not None:
            return self.margen_ganancia
        try:
            cat_cfg = self.producto.categoria.config_costo
            return cat_cfg.margen_ganancia
        except ConfiguracionCategoriaCosto.DoesNotExist:
            pass
        return ConfiguracionGlobal.obtener().margen_ganancia

    @property
    def iva_efectivo(self):
        if self.iva:
            return self.iva
        try:
            cat_cfg = self.producto.categoria.config_costo
            if cat_cfg.iva:
                return cat_cfg.iva
        except ConfiguracionCategoriaCosto.DoesNotExist:
            pass
        return ConfiguracionGlobal.obtener().iva

    @property
    def transporte_efectivo(self):
        if self.transporte is not None:
            return self.transporte
        return ConfiguracionGlobal.obtener().transporte

    @property
    def recargo_tarjeta_efectivo(self):
        if self.recargo_tarjeta is not None:
            return self.recargo_tarjeta
        return ConfiguracionGlobal.obtener().recargo_tarjeta

    @property
    def precio_calculado(self):
        """Precio de venta sugerido sin descuento promocional ni recargo tarjeta."""
        base = self.costo_neto
        if self.descuento_proveedor:
            base = base * (1 - self.descuento_proveedor / 100)
        base = base + self.transporte_efectivo
        if self.impuesto_interno:
            base = base * (1 + self.impuesto_interno / 100)
        margen = self.margen_efectivo
        base = base * (1 + margen / 100)
        iva_pct = Decimal(self.iva_efectivo)
        if iva_pct:
            base = base * (1 + iva_pct / 100)
        return round(base, 2)

    @property
    def precio_con_tarjeta(self):
        return round(self.precio_calculado * (1 + self.recargo_tarjeta_efectivo / 100), 2)

    @property
    def precio_con_descuento(self):
        if self.descuento_promocion:
            return round(self.precio_calculado * (1 - self.descuento_promocion / 100), 2)
        return self.precio_calculado

    def __str__(self):
        return f'Costo de {self.producto.nombre}'

    class Meta:
        verbose_name = 'Costo de producto'
        verbose_name_plural = 'Costos de productos'


class PromocionBanco(models.Model):
    TIPO_CHOICES = [
        ('descuento', 'Descuento'),
        ('cuotas', 'Cuotas sin interés'),
    ]
    nombre = models.CharField(max_length=100)
    banco = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='descuento')
    valor = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(Decimal('0'))],
        help_text='% de descuento o cantidad de cuotas según tipo'
    )
    activo = models.BooleanField(default=True)
    vigencia_desde = models.DateField(null=True, blank=True)
    vigencia_hasta = models.DateField(null=True, blank=True)
    descripcion = models.CharField(max_length=300, blank=True)

    def __str__(self):
        return f'{self.nombre} — {self.banco}'

    class Meta:
        verbose_name = 'Promoción bancaria'
        verbose_name_plural = 'Promociones bancarias'
        ordering = ['-activo', 'banco', 'nombre']
