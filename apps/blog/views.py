from django.shortcuts import render, get_object_or_404
from .models import Post, Categoria
from .forms import SuscripcionForm
from django.views.decorators.csrf import csrf_protect


def blog(request):
    posts_recientes = Post.objects.order_by('-creado')[:3]
    categorias = Categoria.objects.all()
    contexto = {'posts_recientes': posts_recientes, 'categorias': categorias}
    return render(request, 'blog/blog.html', contexto)

def blog_categoria(request, slug):
    categoria = get_object_or_404(Categoria, slug=slug)
    posts = categoria.posts.all()
    contexto = {'categoria': categoria, 'posts': posts}
    return render(request, 'blog/blog_categoria.html', contexto)

def blog_post(request, categoria_slug, post_slug):
    categoria = get_object_or_404(Categoria, slug=categoria_slug)
    post = get_object_or_404(Post, slug=post_slug, categoria=categoria)
    contexto = {'categoria': categoria, 'post': post}
    return render(request, 'blog/blog_post.html', contexto)

@csrf_protect
def suscripcion(request):
    if request.method == 'POST':
        form = SuscripcionForm(request.POST)
        if form.is_valid():
            form.save()
            return render(request, 'suscripcion.html', {'exito': True})
    else:
        form = SuscripcionForm()

    return render(request, 'suscripcion.html', {'form': form})