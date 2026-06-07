import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogCategoria, getBlogCategorias, getBlogPosts } from '@/lib/api'
import { Leaf, Calendar, Clock, ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoria = await getBlogCategoria(slug).catch(() => null)
  if (!categoria) return {}
  return {
    title: `${categoria.nombre} | Blog Elitian`,
    description: categoria.descripcion ?? `Artículos sobre ${categoria.nombre} en el blog de Elitian.`,
  }
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function estimarLectura(texto: string) {
  const palabras = texto.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(palabras / 200))
}

export default async function BlogCategoriaPage({ params }: Props) {
  const { slug } = await params

  const [categoria, postsData, todasCategorias] = await Promise.all([
    getBlogCategoria(slug).catch(() => null),
    getBlogPosts({ categoria: slug }).catch(() => ({ results: [], count: 0, next: null, previous: null })),
    getBlogCategorias().catch(() => []),
  ])

  if (!categoria) notFound()

  const posts = postsData.results

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero de categoría ────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-green-800 to-green-600 text-white overflow-hidden">
        {/* Imagen de fondo si la categoría tiene una */}
        {categoria.imagen_cat && (
          <div className="absolute inset-0">
            <Image
              src={categoria.imagen_cat}
              alt={categoria.nombre}
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}

        {/* Círculos decorativos */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative max-w-6xl mx-auto px-4 py-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-green-200 text-sm hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-2">Categoría</p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{categoria.nombre}</h1>
              {categoria.descripcion && (
                <p className="text-green-100 mt-3 max-w-xl leading-relaxed">{categoria.descripcion}</p>
              )}
            </div>
            <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center">
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-green-200 text-xs mt-0.5">{posts.length === 1 ? 'artículo' : 'artículos'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Columna principal ─────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {posts.length === 0 ? (
              <div className="text-center py-24">
                <Leaf className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                <h2 className="text-xl font-semibold text-stone-800 mb-2">Sin artículos aún</h2>
                <p className="text-stone-500 mb-6">Todavía no hay contenido en esta categoría.</p>
                <Link href="/blog" className="text-sm text-green-700 hover:underline">
                  ← Ver todos los artículos
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col sm:flex-row gap-0 bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-md transition-shadow"
                  >
                    {/* Imagen */}
                    <div className="sm:w-72 shrink-0 relative aspect-video sm:aspect-auto bg-stone-100 overflow-hidden">
                      {post.imagen_post ? (
                        <Image
                          src={post.imagen_post}
                          alt={post.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full min-h-44 flex items-center justify-center bg-green-50">
                          <Leaf className="w-10 h-10 text-green-200" />
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-col justify-center p-6 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {post.categoria.nombre}
                        </span>
                        {post.etiqueta && (
                          <span className="text-stone-400 text-xs">{post.etiqueta}</span>
                        )}
                      </div>

                      <h2 className="font-bold text-stone-800 text-lg leading-snug mb-2 group-hover:text-green-700 transition-colors line-clamp-2">
                        {post.titulo}
                      </h2>

                      <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-4">
                        {post.subtitulo}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-400">
                        <span className="font-medium text-stone-500">{post.autor_nombre}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {estimarLectura(post.subtitulo)} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatFecha(post.creado)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>

          {/* ── Sidebar — otras categorías ────────────────────────────── */}
          {todasCategorias.length > 1 && (
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
                <h3 className="font-bold text-stone-800 mb-4 text-sm uppercase tracking-wide">
                  Otras categorías
                </h3>
                <nav className="space-y-1">
                  {todasCategorias.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/blog/categoria/${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                        cat.slug === slug
                          ? 'bg-green-700 text-white font-semibold'
                          : 'text-stone-600 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <span>{cat.nombre}</span>
                      {cat.slug === slug && (
                        <span className="w-2 h-2 rounded-full bg-white/60" />
                      )}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 pt-5 border-t border-stone-100">
                  <Link
                    href="/blog"
                    className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-green-700 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Ver todos
                  </Link>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  )
}
