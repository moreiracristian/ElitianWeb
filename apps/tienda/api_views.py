import hashlib
import hmac
from decimal import Decimal

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

import mercadopago

from .models import Categorias, Productos, Resena, Carrito, ItemCarrito, Orden, ItemOrden
from .emails import email_orden_confirmada, email_estado_actualizado
from .serializers import (
    CategoriaSerializer,
    ProductoListSerializer,
    ProductoDetailSerializer,
    ResenaSerializer,
    ResenaCreateSerializer,
    CarritoSerializer,
    ItemCarritoSerializer,
    OrdenSerializer,
)


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categorias.objects.filter(activo=True)
    serializer_class = CategoriaSerializer
    lookup_field = 'slug'


class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Productos.objects.filter(activo=True).select_related('categoria').prefetch_related('imagenes')
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'marca', 'descripcion']
    ordering_fields = ['precio', 'nombre', 'creado']
    ordering = ['nombre']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductoDetailSerializer
        return ProductoListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        categoria = self.request.query_params.get('categoria')
        destacado = self.request.query_params.get('destacado')
        con_stock = self.request.query_params.get('con_stock')
        precio_min = self.request.query_params.get('precio_min')
        precio_max = self.request.query_params.get('precio_max')

        if categoria:
            qs = qs.filter(categoria__slug=categoria)
        if destacado == 'true':
            qs = qs.filter(destacado=True)
        if con_stock == 'true':
            qs = qs.filter(stock__gt=0)
        if precio_min:
            qs = qs.filter(precio__gte=precio_min)
        if precio_max:
            qs = qs.filter(precio__lte=precio_max)
        return qs

    @action(detail=True, methods=['get'])
    def resenas(self, request, slug=None):
        producto = self.get_object()
        resenas = producto.resenas.filter(aprobado=True)
        serializer = ResenaSerializer(resenas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def agregar_resena(self, request, slug=None):
        producto = self.get_object()
        if producto.resenas.filter(usuario=request.user).exists():
            return Response(
                {'detail': 'Ya dejaste una reseña para este producto.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ResenaCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(producto=producto, usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def relacionados(self, request, slug=None):
        producto = self.get_object()
        relacionados = Productos.objects.filter(
            categoria=producto.categoria, activo=True, stock__gt=0
        ).exclude(pk=producto.pk).prefetch_related('imagenes')[:4]
        serializer = ProductoListSerializer(relacionados, many=True, context={'request': request})
        return Response(serializer.data)


class CarritoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_carrito(self, user):
        carrito, _ = Carrito.objects.get_or_create(usuario=user)
        return carrito

    def list(self, request):
        carrito = self._get_carrito(request.user)
        serializer = CarritoSerializer(carrito, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def agregar(self, request):
        carrito = self._get_carrito(request.user)
        producto_id = request.data.get('producto_id')
        cantidad = int(request.data.get('cantidad', 1))

        producto = get_object_or_404(Productos, pk=producto_id, activo=True)

        if not producto.tiene_stock_disponible(cantidad):
            return Response(
                {'detail': f'Stock insuficiente. Disponible: {producto.stock}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item, created = ItemCarrito.objects.get_or_create(
            carrito=carrito, producto=producto,
            defaults={'cantidad': cantidad},
        )
        if not created:
            nueva_cantidad = item.cantidad + cantidad
            if not producto.tiene_stock_disponible(nueva_cantidad):
                return Response(
                    {'detail': f'Stock insuficiente. Disponible: {producto.stock}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.cantidad = nueva_cantidad
            item.save()

        serializer = CarritoSerializer(carrito, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def actualizar(self, request):
        carrito = self._get_carrito(request.user)
        item_id = request.data.get('item_id')
        cantidad = int(request.data.get('cantidad', 1))

        item = get_object_or_404(ItemCarrito, pk=item_id, carrito=carrito)

        if cantidad < 1:
            item.delete()
        else:
            if not item.producto.tiene_stock_disponible(cantidad):
                return Response(
                    {'detail': f'Stock insuficiente. Disponible: {item.producto.stock}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.cantidad = cantidad
            item.save()

        serializer = CarritoSerializer(carrito, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def eliminar(self, request):
        carrito = self._get_carrito(request.user)
        item_id = request.data.get('item_id')
        item = get_object_or_404(ItemCarrito, pk=item_id, carrito=carrito)
        item.delete()
        serializer = CarritoSerializer(carrito, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def vaciar(self, request):
        carrito = self._get_carrito(request.user)
        carrito.items.all().delete()
        serializer = CarritoSerializer(carrito, context={'request': request})
        return Response(serializer.data)


class OrdenViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrdenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Orden.objects.filter(usuario=self.request.user).prefetch_related('items__producto')

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def crear(self, request):
        carrito = get_object_or_404(Carrito, usuario=request.user)

        if not carrito.items.exists():
            return Response(
                {'detail': 'El carrito está vacío.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar stock antes de crear la orden
        for item in carrito.items.select_related('producto').all():
            if not item.producto.tiene_stock_disponible(item.cantidad):
                return Response(
                    {'detail': f'Sin stock suficiente para "{item.producto.nombre}".'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        metodo_pago = request.data.get('metodo_pago', 'transferencia')
        if metodo_pago not in {c[0] for c in Orden.METODO_PAGO_CHOICES}:
            metodo_pago = 'transferencia'

        telefono = request.data.get('telefono', '').strip()
        direccion = request.data.get('direccion', '').strip()
        ciudad = request.data.get('ciudad', '').strip()
        provincia = request.data.get('provincia', '').strip()
        codigo_postal = request.data.get('codigo_postal', '').strip()

        total_base = carrito.total
        if metodo_pago in Orden.METODOS_CON_DESCUENTO:
            descuento = round(total_base * Decimal(Orden.DESCUENTO_PORCENTAJE) / 100, 2)
        else:
            descuento = Decimal('0')
        total_final = total_base - descuento

        orden = Orden.objects.create(
            usuario=request.user,
            metodo_pago=metodo_pago,
            total=total_final,
            descuento_aplicado=descuento,
            notas=request.data.get('notas', ''),
            telefono=telefono,
            direccion=direccion,
            ciudad=ciudad,
            provincia=provincia,
            codigo_postal=codigo_postal,
        )

        for item in carrito.items.select_related('producto').all():
            ItemOrden.objects.create(
                orden=orden,
                producto=item.producto,
                cantidad=item.cantidad,
                precio_unitario=item.producto.precio_final,
            )
            # Descontar stock
            item.producto.stock -= item.cantidad
            item.producto.save(update_fields=['stock'])

        carrito.items.all().delete()
        email_orden_confirmada(orden)

        serializer = OrdenSerializer(orden)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def crear_preferencia_mp(self, request, pk=None):
        orden = get_object_or_404(Orden, pk=pk, usuario=request.user)

        if orden.metodo_pago != 'tarjeta':
            return Response(
                {'detail': 'Solo aplica para pago con tarjeta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        site_url = settings.SITE_URL

        items = []
        for item in orden.items.select_related('producto').all():
            items.append({
                'title': item.producto.nombre,
                'quantity': item.cantidad,
                'unit_price': float(item.precio_unitario),
                'currency_id': 'ARS',
            })

        preference_data = {
            'items': items,
            'external_reference': str(orden.id),
            'back_urls': {
                'success': f'{site_url}/checkout/mp-retorno?status=approved&orden={orden.id}',
                'failure': f'{site_url}/checkout/mp-retorno?status=failure&orden={orden.id}',
                'pending': f'{site_url}/checkout/mp-retorno?status=pending&orden={orden.id}',
            },
            'auto_return': 'approved',
            'notification_url': f'{settings.WEBHOOK_URL}/api/v1/mp/webhook/',
        }

        result = sdk.preference().create(preference_data)
        preference = result.get('response', {})

        if result.get('status') not in (200, 201):
            return Response(
                {'detail': 'Error al crear preferencia en MercadoPago.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        orden.mp_preference_id = preference.get('id', '')
        orden.save(update_fields=['mp_preference_id'])

        return Response({
            'init_point': preference.get('init_point'),
            'sandbox_init_point': preference.get('sandbox_init_point'),
            'preference_id': preference.get('id'),
        })


def _verificar_firma_mp(request):
    """Valida la firma HMAC-SHA256 enviada por MercadoPago en x-signature."""
    secret = settings.MP_WEBHOOK_SECRET
    if not secret:
        return True  # sin secret configurado, se omite la validación (dev)

    x_signature = request.headers.get('x-signature', '')
    x_request_id = request.headers.get('x-request-id', '')
    data_id = request.data.get('data', {}).get('id', '')

    ts = ''
    received_hash = ''
    for part in x_signature.split(','):
        key, _, val = part.partition('=')
        if key.strip() == 'ts':
            ts = val.strip()
        elif key.strip() == 'v1':
            received_hash = val.strip()

    if not ts or not received_hash:
        return False

    manifest = f'id:{data_id};request-id:{x_request_id};ts:{ts};'
    expected = hmac.new(secret.encode(), manifest.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received_hash)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mp_webhook(request):
    if not _verificar_firma_mp(request):
        return Response({'detail': 'Firma inválida.'}, status=status.HTTP_401_UNAUTHORIZED)

    topic = request.query_params.get('topic') or request.data.get('type')
    resource_id = (
        request.query_params.get('id')
        or request.data.get('data', {}).get('id')
    )

    if topic not in ('payment', 'merchant_order') or not resource_id:
        return Response(status=status.HTTP_200_OK)

    sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
    payment_info = sdk.payment().get(resource_id)

    if payment_info.get('status') != 200:
        return Response(status=status.HTTP_200_OK)

    response = payment_info.get('response', {})
    mp_status = response.get('status', '')
    external_ref = response.get('external_reference', '')

    if not external_ref:
        return Response(status=status.HTTP_200_OK)

    try:
        orden = Orden.objects.get(pk=int(external_ref))
    except (Orden.DoesNotExist, ValueError):
        return Response(status=status.HTTP_200_OK)

    orden.mp_payment_id = str(resource_id)
    orden.mp_estado_pago = mp_status

    if mp_status == 'approved' and orden.estado == 'pendiente':
        orden.estado = 'confirmado'

    orden.save(update_fields=['mp_payment_id', 'mp_estado_pago', 'estado'])

    return Response(status=status.HTTP_200_OK)
