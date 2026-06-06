from rest_framework import serializers
from .models import (
    Categorias, Productos, ProductoImagen, Resena,
    ItemCarrito, Carrito, Orden, ItemOrden,
    ConfiguracionGlobal, ConfiguracionCategoriaCosto, CostoProducto, PromocionBanco,
)


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorias
        fields = ['id', 'nombre', 'slug', 'descripcion', 'imagen', 'orden']


class ProductoImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoImagen
        fields = ['id', 'imagen', 'principal', 'orden']


class ProductoListSerializer(serializers.ModelSerializer):
    imagen_principal = serializers.SerializerMethodField()
    precio_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    tiene_oferta = serializers.BooleanField(read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    categoria_slug = serializers.CharField(source='categoria.slug', read_only=True)
    calificacion_promedio = serializers.FloatField(read_only=True, allow_null=True)
    total_resenas = serializers.IntegerField(source='total_resenas_count', read_only=True)

    class Meta:
        model = Productos
        fields = [
            'id', 'codigo', 'nombre', 'slug', 'marca',
            'categoria', 'categoria_nombre', 'categoria_slug',
            'precio', 'precio_oferta', 'descuento', 'precio_final', 'tiene_oferta',
            'stock', 'destacado', 'activo', 'imagen_principal',
            'calificacion_promedio', 'total_resenas',
        ]

    def get_imagen_principal(self, obj):
        img = obj.imagen_principal
        if img and img.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.imagen.url)
            return img.imagen.url
        return None


class ProductoDetailSerializer(serializers.ModelSerializer):
    imagenes = ProductoImagenSerializer(many=True, read_only=True)
    precio_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    tiene_oferta = serializers.BooleanField(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    calificacion_promedio = serializers.SerializerMethodField()
    total_resenas = serializers.SerializerMethodField()

    class Meta:
        model = Productos
        fields = [
            'id', 'codigo', 'nombre', 'slug', 'marca', 'ofrecido',
            'categoria',
            'precio', 'precio_oferta', 'descuento', 'precio_final', 'tiene_oferta',
            'descripcion', 'ingredientes', 'modo_uso', 'conservacion', 'cont_peso_neto',
            'stock', 'destacado', 'imagenes',
            'calificacion_promedio', 'total_resenas',
            'creado', 'actualizado',
        ]

    def get_calificacion_promedio(self, obj):
        resenas = obj.resenas.filter(aprobado=True)
        if not resenas.exists():
            return None
        total = sum(r.calificacion for r in resenas)
        return round(total / resenas.count(), 1)

    def get_total_resenas(self, obj):
        return obj.resenas.filter(aprobado=True).count()


class ResenaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)

    class Meta:
        model = Resena
        fields = ['id', 'usuario_nombre', 'comentario', 'calificacion', 'creado']
        read_only_fields = ['creado']


class ResenaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resena
        fields = ['comentario', 'calificacion']

    def validate_calificacion(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('La calificación debe ser entre 1 y 5.')
        return value


class ResenaAdminSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_slug = serializers.CharField(source='producto.slug', read_only=True)
    producto_categoria_slug = serializers.CharField(source='producto.categoria.slug', read_only=True)

    class Meta:
        model = Resena
        fields = [
            'id', 'usuario_nombre', 'usuario_email',
            'producto_nombre', 'producto_slug', 'producto_categoria_slug',
            'comentario', 'calificacion', 'aprobado', 'creado',
        ]
        read_only_fields = ['creado']


class ItemCarritoSerializer(serializers.ModelSerializer):
    producto = ProductoListSerializer(read_only=True)
    producto_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ItemCarrito
        fields = ['id', 'producto', 'producto_id', 'cantidad', 'subtotal']

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError('La cantidad debe ser al menos 1.')
        return value


class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    cantidad_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Carrito
        fields = ['id', 'items', 'total', 'cantidad_items', 'actualizado']


class ItemOrdenSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ItemOrden
        fields = ['id', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']


class ProductoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productos
        fields = [
            'codigo', 'nombre', 'categoria', 'ofrecido', 'marca',
            'precio', 'precio_oferta', 'descripcion', 'ingredientes',
            'modo_uso', 'conservacion', 'cont_peso_neto',
            'destacado', 'activo', 'stock', 'descuento',
        ]


class OrdenSerializer(serializers.ModelSerializer):
    items = ItemOrdenSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Orden
        fields = [
            'id', 'usuario', 'usuario_nombre',
            'estado', 'estado_display',
            'metodo_pago', 'metodo_pago_display',
            'total', 'descuento_aplicado',
            'notas', 'items', 'creado',
            'telefono', 'direccion', 'ciudad', 'provincia', 'codigo_postal',
        ]
        read_only_fields = ['total', 'descuento_aplicado', 'creado']

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            nombre = f"{obj.usuario.first_name} {obj.usuario.last_name}".strip()
            return nombre or obj.usuario.username
        return None


class ConfiguracionGlobalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionGlobal
        fields = ['margen_ganancia', 'iva', 'recargo_tarjeta', 'transporte']


class ConfiguracionCategoriaCostoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = ConfiguracionCategoriaCosto
        fields = ['id', 'categoria', 'categoria_nombre', 'margen_ganancia', 'iva']


class CategoriaConCostoSerializer(serializers.ModelSerializer):
    config_costo = ConfiguracionCategoriaCostoSerializer(read_only=True)

    class Meta:
        model = Categorias
        fields = ['id', 'nombre', 'slug', 'config_costo']


class CostoProductoSerializer(serializers.ModelSerializer):
    precio_calculado = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    precio_con_tarjeta = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    precio_con_descuento = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    margen_efectivo = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    iva_efectivo = serializers.CharField(read_only=True)
    transporte_efectivo = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    recargo_tarjeta_efectivo = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = CostoProducto
        fields = [
            'id', 'producto',
            'costo_neto', 'descuento_proveedor', 'impuesto_interno',
            'transporte', 'margen_ganancia', 'iva',
            'descuento_promocion', 'recargo_tarjeta',
            'margen_efectivo', 'iva_efectivo', 'transporte_efectivo',
            'recargo_tarjeta_efectivo',
            'precio_calculado', 'precio_con_tarjeta', 'precio_con_descuento',
        ]


class PromocionBancoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = PromocionBanco
        fields = [
            'id', 'nombre', 'banco', 'tipo', 'tipo_display',
            'valor', 'activo', 'vigencia_desde', 'vigencia_hasta', 'descripcion',
        ]
