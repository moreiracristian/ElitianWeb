import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def _send(subject, body, to):
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error('Error enviando email a %s — %s: %s', to, subject, exc)


def email_orden_confirmada(orden):
    items_txt = '\n'.join(
        f'  • {item.producto.nombre} x{item.cantidad} — ${item.subtotal}'
        for item in orden.items.select_related('producto').all()
    )
    descuento_txt = (
        f'\nDescuento aplicado: -${orden.descuento_aplicado}' if orden.descuento_aplicado else ''
    )
    envio_txt = ''
    if orden.direccion:
        envio_txt = (
            f'\n\nDatos de envío:'
            f'\n  Dirección: {orden.direccion}'
            f'\n  Ciudad: {orden.ciudad}, {orden.provincia} {orden.codigo_postal}'
            f'\n  Teléfono: {orden.telefono}'
        )

    body = (
        f'¡Hola {orden.usuario.first_name or orden.usuario.username}!\n\n'
        f'Recibimos tu pedido #{orden.pk} en Elitian.\n\n'
        f'Productos:\n{items_txt}{descuento_txt}\n\nTotal: ${orden.total}'
        f'{envio_txt}\n\n'
        f'Método de pago: {orden.get_metodo_pago_display()}\n\n'
        f'Nos pondremos en contacto a la brevedad para coordinar el envío.\n\n'
        f'¡Gracias por elegirnos!\n— Equipo Elitian'
    )
    _send(f'Pedido #{orden.pk} recibido — Elitian', body, orden.usuario.email)


def email_estado_actualizado(orden):
    mensajes = {
        'confirmado': 'Tu pago fue confirmado. Estamos preparando tu pedido.',
        'enviado':    'Tu pedido está en camino. Pronto lo recibirás.',
        'entregado':  '¡Tu pedido fue entregado! Esperamos que lo disfrutes.',
        'cancelado':  'Tu pedido fue cancelado. Contactanos si tenés dudas.',
    }
    detalle = mensajes.get(orden.estado)
    if not detalle:
        return

    body = (
        f'¡Hola {orden.usuario.first_name or orden.usuario.username}!\n\n'
        f'Actualización de tu pedido #{orden.pk}:\n\n'
        f'{detalle}\n\n'
        f'Estado actual: {orden.get_estado_display()}\n\n'
        f'Podés ver el detalle en: {settings.SITE_URL}/cuenta/ordenes/{orden.pk}\n\n'
        f'— Equipo Elitian'
    )
    _send(f'Pedido #{orden.pk}: {orden.get_estado_display()} — Elitian', body, orden.usuario.email)
