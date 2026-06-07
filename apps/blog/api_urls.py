from django.urls import path
from rest_framework.routers import DefaultRouter
from .api_views import (
    BlogCategoriaViewSet, PostViewSet,
    admin_blog_posts, admin_crear_post, admin_editar_post,
    admin_eliminar_post, admin_blog_categorias,
    admin_crear_categoria, admin_editar_categoria, admin_eliminar_categoria,
)

router = DefaultRouter()
router.register('blog/categorias', BlogCategoriaViewSet, basename='blog-categoria')
router.register('blog/posts', PostViewSet, basename='blog-post')

urlpatterns = router.urls + [
    path('admin/blog/posts/', admin_blog_posts, name='admin-blog-posts'),
    path('admin/blog/posts/crear/', admin_crear_post, name='admin-blog-crear'),
    path('admin/blog/posts/<int:pk>/editar/', admin_editar_post, name='admin-blog-editar'),
    path('admin/blog/posts/<int:pk>/eliminar/', admin_eliminar_post, name='admin-blog-eliminar'),
    path('admin/blog/categorias/', admin_blog_categorias, name='admin-blog-categorias'),
    path('admin/blog/categorias/crear/', admin_crear_categoria, name='admin-blog-categoria-crear'),
    path('admin/blog/categorias/<int:pk>/editar/', admin_editar_categoria, name='admin-blog-categoria-editar'),
    path('admin/blog/categorias/<int:pk>/eliminar/', admin_eliminar_categoria, name='admin-blog-categoria-eliminar'),
]
