from django.urls import path
from rest_framework.routers import DefaultRouter
from . import api_views, admin_views

router = DefaultRouter()
router.register('categorias', api_views.CategoriaViewSet, basename='categoria')
router.register('productos', api_views.ProductoViewSet, basename='producto')
router.register('carrito', api_views.CarritoViewSet, basename='carrito')
router.register('ordenes', api_views.OrdenViewSet, basename='orden')

urlpatterns = router.urls + [
    path('mp/webhook/', api_views.mp_webhook, name='mp-webhook'),
    path('admin/stats/', admin_views.stats, name='admin-stats'),
    path('admin/ordenes/', admin_views.ordenes_admin, name='admin-ordenes'),
    path('admin/ordenes/<int:pk>/estado/', admin_views.orden_estado, name='admin-orden-estado'),
    path('admin/productos/', admin_views.productos_admin, name='admin-productos'),
    path('admin/productos/crear/', admin_views.crear_producto, name='admin-producto-crear'),
    path('admin/productos/<int:pk>/toggle/', admin_views.producto_toggle, name='admin-producto-toggle'),
    path('admin/productos/<int:pk>/editar/', admin_views.editar_producto, name='admin-producto-editar'),
    path('admin/productos/<int:pk>/imagenes/', admin_views.subir_imagen, name='admin-producto-imagen'),
    path('admin/imagenes/<int:img_pk>/eliminar/', admin_views.eliminar_imagen, name='admin-imagen-eliminar'),
    path('admin/imagenes/<int:img_pk>/principal/', admin_views.set_imagen_principal, name='admin-imagen-principal'),
    # Costos
    path('admin/costos/global/', admin_views.costos_global, name='admin-costos-global'),
    path('admin/costos/categorias/', admin_views.costos_categorias, name='admin-costos-categorias'),
    path('admin/costos/categorias/<int:categoria_id>/', admin_views.costos_categoria_detalle, name='admin-costos-categoria'),
    path('admin/costos/productos/<int:pk>/', admin_views.costos_producto, name='admin-costos-producto'),
    path('admin/costos/bancos/', admin_views.costos_bancos, name='admin-costos-bancos'),
    path('admin/costos/bancos/<int:pk>/', admin_views.costo_banco_detalle, name='admin-costos-banco-detalle'),
    # Analytics
    path('admin/analytics/', admin_views.analytics, name='admin-analytics'),
    # Reseñas
    path('admin/resenas/', admin_views.admin_resenas, name='admin-resenas'),
    path('admin/resenas/<int:pk>/', admin_views.admin_resena_detalle, name='admin-resena-detalle'),
    # Contacto (público)
    path('contacto/', admin_views.contacto, name='api-contacto'),
]
