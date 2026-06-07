from rest_framework import serializers, viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.utils.text import slugify
from .models import Post, Categoria


class BlogCategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'slug', 'descripcion', 'imagen_cat']


class PostListSerializer(serializers.ModelSerializer):
    categoria = BlogCategoriaSerializer(read_only=True)
    autor_nombre = serializers.SerializerMethodField()
    imagen_post = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'titulo', 'subtitulo', 'slug',
            'categoria', 'autor_nombre',
            'imagen_post', 'etiqueta', 'creado',
        ]

    def get_autor_nombre(self, obj):
        nombre = f'{obj.autor.first_name} {obj.autor.last_name}'.strip()
        return nombre or obj.autor.username

    def get_imagen_post(self, obj):
        if obj.imagen_post:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen_post.url)
            return obj.imagen_post.url
        return None


class PostDetailSerializer(PostListSerializer):
    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ['contenido']


class PostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['titulo', 'subtitulo', 'categoria', 'contenido', 'imagen_post', 'etiqueta', 'slug']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'imagen_post': {'required': False, 'allow_null': True},
            'contenido': {'allow_blank': True},
        }

    def _generar_slug(self, titulo, exclude_pk=None):
        base = slugify(titulo)
        slug = base
        counter = 1
        qs = Post.objects.filter(slug=slug)
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        while qs.exists():
            slug = f'{base}-{counter}'
            counter += 1
            qs = Post.objects.filter(slug=slug)
            if exclude_pk:
                qs = qs.exclude(pk=exclude_pk)
        return slug

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = self._generar_slug(validated_data['titulo'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        slug = validated_data.pop('slug', None)
        if slug:
            validated_data['slug'] = slug
        return super().update(instance, validated_data)


class BlogCategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.filter(activo=True).order_by('nombre')
    serializer_class = BlogCategoriaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Post.objects.select_related('categoria', 'autor').order_by('-creado')
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'subtitulo', 'etiqueta']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria__slug=categoria)
        return qs


# ─── Admin views ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_blog_posts(request):
    qs = Post.objects.select_related('categoria', 'autor').order_by('-creado')
    search = request.query_params.get('search', '')
    if search:
        qs = qs.filter(titulo__icontains=search)
    return Response(PostListSerializer(qs, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_crear_post(request):
    serializer = PostWriteSerializer(data=request.data)
    if serializer.is_valid():
        post = serializer.save(autor=request.user)
        return Response(
            PostListSerializer(post, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_editar_post(request, pk):
    try:
        post = Post.objects.select_related('categoria', 'autor').get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Post no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PostDetailSerializer(post, context={'request': request}).data)

    serializer = PostWriteSerializer(post, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        post.refresh_from_db()
        return Response(PostDetailSerializer(post, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_eliminar_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Post no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if post.imagen_post:
        post.imagen_post.delete(save=False)
    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_blog_categorias(request):
    qs = Categoria.objects.all().order_by('nombre')
    return Response(BlogCategoriaSerializer(qs, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_crear_categoria(request):
    nombre = request.data.get('nombre', '').strip()
    if not nombre:
        return Response({'nombre': 'El nombre es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    base = slugify(nombre)
    slug = base
    counter = 1
    while Categoria.objects.filter(slug=slug).exists():
        slug = f'{base}-{counter}'
        counter += 1

    categoria = Categoria.objects.create(
        nombre=nombre,
        descripcion=request.data.get('descripcion', '') or None,
        slug=slug,
        activo=True,
    )
    if 'imagen_cat' in request.FILES:
        categoria.imagen_cat = request.FILES['imagen_cat']
        categoria.save()

    return Response(
        BlogCategoriaSerializer(categoria, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_editar_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk)
    except Categoria.DoesNotExist:
        return Response({'detail': 'Categoría no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(BlogCategoriaSerializer(categoria, context={'request': request}).data)

    nombre = request.data.get('nombre', categoria.nombre).strip()
    if not nombre:
        return Response({'nombre': 'El nombre es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    categoria.nombre = nombre
    descripcion = request.data.get('descripcion', '')
    categoria.descripcion = descripcion or None
    if 'imagen_cat' in request.FILES:
        if categoria.imagen_cat:
            categoria.imagen_cat.delete(save=False)
        categoria.imagen_cat = request.FILES['imagen_cat']
    categoria.save()

    return Response(BlogCategoriaSerializer(categoria, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_eliminar_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk)
    except Categoria.DoesNotExist:
        return Response({'detail': 'Categoría no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if categoria.posts.exists():
        return Response(
            {'detail': f'No se puede eliminar: tiene {categoria.posts.count()} post(s) asociado(s).'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if categoria.imagen_cat:
        categoria.imagen_cat.delete(save=False)
    categoria.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
