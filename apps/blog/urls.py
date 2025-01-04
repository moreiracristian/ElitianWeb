from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import blog, blog_categoria, blog_post, suscripcion

urlpatterns = [
    path('blog/', blog, name='blog'),
    path('blog/categoria/<slug:slug>/', blog_categoria, name='blog_categoria'),
    path('blog/<slug:categoria_slug>/<slug:post_slug>', blog_post, name='blog_post'),
    path('suscripcion/', suscripcion, name='suscripcion'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)