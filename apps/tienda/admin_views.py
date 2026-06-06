import zoneinfo

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta

from django.core.mail import send_mail
from django.conf import settings as django_settings

from .models import (
    Productos, Orden, ItemOrden, ProductoImagen, Resena,
    ConfiguracionGlobal, ConfiguracionCategoriaCosto, CostoProducto, PromocionBanco, Categorias,
)
from .emails import email_estado_actualizado
from .serializers import (
    OrdenSerializer, ProductoListSerializer, ProductoDetailSerializer,
    ProductoWriteSerializer, ProductoImagenSerializer,
    ConfiguracionGlobalSerializer, ConfiguracionCategoriaCostoSerializer,
    CategoriaConCostoSerializer, CostoProductoSerializer, PromocionBancoSerializer,
    ResenaAdminSerializer,
)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def stats(request):
    hoy = timezone.now()
    hace_30 = hoy - timedelta(days=30)

    ordenes_qs = Orden.objects.all()
    ordenes_mes = ordenes_qs.filter(creado__gte=hace_30)

    total_ventas = ordenes_qs.filter(
        estado__in=['confirmado', 'enviado', 'entregado']
    ).aggregate(total=Sum('total'))['total'] or 0

    ventas_mes = ordenes_mes.filter(
        estado__in=['confirmado', 'enviado', 'entregado']
    ).aggregate(total=Sum('total'))['total'] or 0

    return Response({
        'ordenes_total': ordenes_qs.count(),
        'ordenes_pendientes': ordenes_qs.filter(estado='pendiente').count(),
        'ordenes_mes': ordenes_mes.count(),
        'ventas_total': float(total_ventas),
        'ventas_mes': float(ventas_mes),
        'productos_total': Productos.objects.count(),
        'productos_sin_stock': Productos.objects.filter(stock=0).count(),
        'usuarios_total': User.objects.filter(is_staff=False).count(),
        'estados': list(
            ordenes_qs.values('estado').annotate(cantidad=Count('id'))
        ),
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def ordenes_admin(request):
    estado = request.query_params.get('estado', '')
    qs = Orden.objects.select_related('usuario').prefetch_related('items__producto').order_by('-creado')
    if estado:
        qs = qs.filter(estado=estado)
    serializer = OrdenSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def orden_estado(request, pk):
    try:
        orden = Orden.objects.get(pk=pk)
    except Orden.DoesNotExist:
        return Response({'detail': 'Orden no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado', '')
    estados_validos = [e[0] for e in Orden.ESTADO_CHOICES]
    if nuevo_estado not in estados_validos:
        return Response({'detail': 'Estado inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    orden.estado = nuevo_estado
    orden.save()
    email_estado_actualizado(orden)
    return Response(OrdenSerializer(orden).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def productos_admin(request):
    search = request.query_params.get('search', '')
    activo = request.query_params.get('activo', '')
    qs = Productos.objects.select_related('categoria').order_by('-creado')
    if search:
        qs = qs.filter(nombre__icontains=search)
    if activo in ('true', 'false'):
        qs = qs.filter(activo=activo == 'true')
    serializer = ProductoListSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def producto_toggle(request, pk):
    try:
        producto = Productos.objects.get(pk=pk)
    except Productos.DoesNotExist:
        return Response({'detail': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    producto.activo = not producto.activo
    producto.save()
    return Response({'id': producto.id, 'activo': producto.activo})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_producto(request):
    serializer = ProductoWriteSerializer(data=request.data)
    if serializer.is_valid():
        producto = serializer.save()
        return Response(
            ProductoListSerializer(producto, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def editar_producto(request, pk):
    try:
        producto = Productos.objects.select_related('categoria').prefetch_related('imagenes').get(pk=pk)
    except Productos.DoesNotExist:
        return Response({'detail': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductoDetailSerializer(producto, context={'request': request}).data)

    serializer = ProductoWriteSerializer(producto, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        producto.refresh_from_db()
        return Response(ProductoDetailSerializer(producto, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def subir_imagen(request, pk):
    try:
        producto = Productos.objects.get(pk=pk)
    except Productos.DoesNotExist:
        return Response({'detail': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    archivo = request.FILES.get('imagen')
    if not archivo:
        return Response({'detail': 'No se recibió imagen.'}, status=status.HTTP_400_BAD_REQUEST)

    es_primera = not producto.imagenes.exists()
    imagen = ProductoImagen.objects.create(
        producto=producto,
        imagen=archivo,
        principal=es_primera,
        orden=producto.imagenes.count(),
    )
    return Response(
        ProductoImagenSerializer(imagen, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_imagen(request, img_pk):
    try:
        imagen = ProductoImagen.objects.select_related('producto').get(pk=img_pk)
    except ProductoImagen.DoesNotExist:
        return Response({'detail': 'Imagen no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    era_principal = imagen.principal
    producto = imagen.producto
    imagen.imagen.delete(save=False)
    imagen.delete()

    if era_principal:
        siguiente = producto.imagenes.order_by('orden').first()
        if siguiente:
            siguiente.principal = True
            siguiente.save()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def set_imagen_principal(request, img_pk):
    try:
        imagen = ProductoImagen.objects.select_related('producto').get(pk=img_pk)
    except ProductoImagen.DoesNotExist:
        return Response({'detail': 'Imagen no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    imagen.producto.imagenes.update(principal=False)
    imagen.principal = True
    imagen.save()
    return Response(ProductoImagenSerializer(imagen, context={'request': request}).data)


# ── Costos ──────────────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def costos_global(request):
    cfg = ConfiguracionGlobal.obtener()
    if request.method == 'PATCH':
        serializer = ConfiguracionGlobalSerializer(cfg, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(ConfiguracionGlobalSerializer(cfg).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def costos_categorias(request):
    cats = Categorias.objects.prefetch_related('config_costo').order_by('orden', 'nombre')
    return Response(CategoriaConCostoSerializer(cats, many=True).data)


@api_view(['POST', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def costos_categoria_detalle(request, categoria_id):
    try:
        categoria = Categorias.objects.get(pk=categoria_id)
    except Categorias.DoesNotExist:
        return Response({'detail': 'Categoría no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        try:
            categoria.config_costo.delete()
        except ConfiguracionCategoriaCosto.DoesNotExist:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)

    try:
        cfg = categoria.config_costo
        serializer = ConfiguracionCategoriaCostoSerializer(cfg, data=request.data, partial=True)
    except ConfiguracionCategoriaCosto.DoesNotExist:
        data = {**request.data, 'categoria': categoria_id}
        serializer = ConfiguracionCategoriaCostoSerializer(data=data)

    if serializer.is_valid():
        serializer.save(categoria=categoria)
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAdminUser])
def costos_producto(request, pk):
    try:
        producto = Productos.objects.get(pk=pk)
    except Productos.DoesNotExist:
        return Response({'detail': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            costo = producto.costo
            return Response(CostoProductoSerializer(costo).data)
        except CostoProducto.DoesNotExist:
            return Response({})

    try:
        costo = producto.costo
        serializer = CostoProductoSerializer(costo, data=request.data, partial=True)
    except CostoProducto.DoesNotExist:
        data = {**request.data, 'producto': pk}
        serializer = CostoProductoSerializer(data=data)

    if serializer.is_valid():
        serializer.save(producto=producto)
        costo = serializer.instance
        # Sincronizar precio del producto con el calculado por la estructura de costos
        producto.precio = costo.precio_calculado
        producto.precio_oferta = costo.precio_con_descuento if costo.descuento_promocion else None
        producto.save(update_fields=['precio', 'precio_oferta'])
        return Response(CostoProductoSerializer(costo).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def costos_bancos(request):
    if request.method == 'POST':
        serializer = PromocionBancoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    qs = PromocionBanco.objects.all()
    return Response(PromocionBancoSerializer(qs, many=True).data)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def costo_banco_detalle(request, pk):
    try:
        promo = PromocionBanco.objects.get(pk=pk)
    except PromocionBanco.DoesNotExist:
        return Response({'detail': 'Promoción no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        promo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = PromocionBancoSerializer(promo, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Reseñas ──────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_resenas(request):
    aprobado = request.query_params.get('aprobado', '')
    qs = Resena.objects.select_related('usuario', 'producto__categoria').order_by('-creado')
    if aprobado == 'true':
        qs = qs.filter(aprobado=True)
    elif aprobado == 'false':
        qs = qs.filter(aprobado=False)
    return Response(ResenaAdminSerializer(qs, many=True).data)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_resena_detalle(request, pk):
    try:
        resena = Resena.objects.select_related('usuario', 'producto__categoria').get(pk=pk)
    except Resena.DoesNotExist:
        return Response({'detail': 'Reseña no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        resena.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = ResenaAdminSerializer(resena, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Analytics ────────────────────────────────────────────────────────────────

AR_TZ = zoneinfo.ZoneInfo('America/Argentina/Buenos_Aires')
ESTADOS_VALIDOS = ['confirmado', 'enviado', 'entregado']


@api_view(['GET'])
@permission_classes([IsAdminUser])
def analytics(request):
    hoy = timezone.now()

    # Primer día del mes actual (UTC)
    inicio_mes_actual = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    # Primer día del mes anterior
    ultimo_mes_anterior = inicio_mes_actual - timedelta(days=1)
    inicio_mes_anterior = ultimo_mes_anterior.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    hace_30 = hoy - timedelta(days=30)

    ordenes_validas = Orden.objects.filter(estado__in=ESTADOS_VALIDOS)

    # ── Ventas diarias — últimos 30 días ──────────────────────────────────────
    ventas_diarias_qs = (
        ordenes_validas
        .filter(creado__gte=hace_30)
        .annotate(dia=TruncDay('creado', tzinfo=AR_TZ))
        .values('dia')
        .annotate(total=Sum('total'), cantidad=Count('id'))
        .order_by('dia')
    )
    ventas_diarias = [
        {
            'fecha': item['dia'].strftime('%Y-%m-%d'),
            'total': float(item['total']),
            'cantidad': item['cantidad'],
        }
        for item in ventas_diarias_qs
    ]

    # ── Comparativa mes actual vs anterior ────────────────────────────────────
    mes_actual = ordenes_validas.filter(creado__gte=inicio_mes_actual).aggregate(
        total=Sum('total'), ordenes=Count('id')
    )
    mes_anterior = ordenes_validas.filter(
        creado__gte=inicio_mes_anterior, creado__lt=inicio_mes_actual
    ).aggregate(total=Sum('total'), ordenes=Count('id'))

    total_actual = float(mes_actual['total'] or 0)
    total_anterior = float(mes_anterior['total'] or 0)
    ordenes_actual = mes_actual['ordenes'] or 0

    variacion_pct = None
    if total_anterior > 0:
        variacion_pct = round((total_actual - total_anterior) / total_anterior * 100, 1)

    ticket_promedio = round(total_actual / ordenes_actual, 2) if ordenes_actual > 0 else 0

    # ── Top 10 productos — últimos 30 días ────────────────────────────────────
    top_qs = (
        ItemOrden.objects
        .filter(orden__estado__in=ESTADOS_VALIDOS, orden__creado__gte=hace_30)
        .values('producto__nombre', 'producto__slug', 'producto__categoria__slug')
        .annotate(
            unidades=Sum('cantidad'),
            ingresos=Sum(F('precio_unitario') * F('cantidad')),
        )
        .order_by('-unidades')[:10]
    )
    top_productos = [
        {
            'nombre': p['producto__nombre'],
            'slug': p['producto__slug'],
            'categoria_slug': p['producto__categoria__slug'],
            'unidades': p['unidades'],
            'ingresos': float(p['ingresos']),
        }
        for p in top_qs
    ]

    # ── Ventas por categoría — últimos 30 días ────────────────────────────────
    cat_qs = (
        ItemOrden.objects
        .filter(orden__estado__in=ESTADOS_VALIDOS, orden__creado__gte=hace_30)
        .values('producto__categoria__nombre')
        .annotate(
            total=Sum(F('precio_unitario') * F('cantidad')),
            unidades=Sum('cantidad'),
        )
        .order_by('-total')
    )
    por_categoria = [
        {
            'nombre': c['producto__categoria__nombre'],
            'total': float(c['total']),
            'unidades': c['unidades'],
        }
        for c in cat_qs
    ]

    # ── Métodos de pago — últimos 30 días ─────────────────────────────────────
    metodos_qs = (
        ordenes_validas
        .filter(creado__gte=hace_30)
        .values('metodo_pago')
        .annotate(cantidad=Count('id'), total=Sum('total'))
        .order_by('-cantidad')
    )
    metodos_pago = [
        {
            'metodo_pago': m['metodo_pago'],
            'cantidad': m['cantidad'],
            'total': float(m['total']),
        }
        for m in metodos_qs
    ]

    # ── Stock en riesgo (stock ≤ 5, activos) ──────────────────────────────────
    vendidos_map = dict(
        ItemOrden.objects
        .filter(orden__estado__in=ESTADOS_VALIDOS, orden__creado__gte=hace_30)
        .values('producto_id')
        .annotate(vendidos=Sum('cantidad'))
        .values_list('producto_id', 'vendidos')
    )
    productos_bajo_stock = (
        Productos.objects
        .filter(stock__lte=5, activo=True)
        .select_related('categoria')
        .values('id', 'nombre', 'slug', 'stock', 'categoria__slug')[:30]
    )
    stock_en_riesgo = sorted(
        [
            {
                'nombre': p['nombre'],
                'slug': p['slug'],
                'categoria_slug': p['categoria__slug'],
                'stock': p['stock'],
                'vendidos_30_dias': vendidos_map.get(p['id'], 0),
            }
            for p in productos_bajo_stock
        ],
        key=lambda x: -x['vendidos_30_dias'],
    )

    return Response({
        'ventas_diarias': ventas_diarias,
        'comparativa': {
            'ventas_mes_actual': total_actual,
            'ventas_mes_anterior': total_anterior,
            'variacion_pct': variacion_pct,
            'ordenes_mes_actual': ordenes_actual,
            'ordenes_mes_anterior': mes_anterior['ordenes'] or 0,
            'ticket_promedio': float(ticket_promedio),
        },
        'top_productos': top_productos,
        'por_categoria': por_categoria,
        'metodos_pago': metodos_pago,
        'stock_en_riesgo': stock_en_riesgo,
    })


# ─── Contacto ─────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([])
def contacto(request):
    nombre = request.data.get('nombre', '').strip()
    email = request.data.get('email', '').strip()
    mensaje = request.data.get('mensaje', '').strip()

    if not nombre or not email or not mensaje:
        return Response({'detail': 'Nombre, email y mensaje son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

    body = f'Mensaje de contacto recibido desde el sitio web.\n\nNombre: {nombre}\nEmail: {email}\n\nMensaje:\n{mensaje}'
    send_mail(
        subject=f'Contacto desde Elitian — {nombre}',
        message=body,
        from_email=django_settings.DEFAULT_FROM_EMAIL,
        recipient_list=[django_settings.DEFAULT_FROM_EMAIL],
        fail_silently=True,
    )
    return Response({'detail': 'Mensaje enviado correctamente.'}, status=status.HTTP_200_OK)
