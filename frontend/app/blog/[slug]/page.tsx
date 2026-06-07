import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/api'
import { Leaf } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug).catch(() => null)
  if (!post) return {}
  const descripcion = post.subtitulo?.slice(0, 155) || `${post.titulo} — Blog de Elitian`
  return {
    title: post.titulo,
    description: descripcion,
    openGraph: {
      title: `${post.titulo} | Blog Elitian`,
      description: descripcion,
      ...(post.imagen_post ? { images: [{ url: post.imagen_post }] } : {}),
    },
  }
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const [post, recientesData] = await Promise.all([
    getBlogPost(slug).catch(() => null),
    getBlogPosts().catch(() => ({ results: [] })),
  ])

  if (!post) notFound()

  const relacionados = recientesData.results.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <>
      {/* Hero del post */}
      <section className="relative bg-green-900 text-white">
        {post.imagen_post && (
          <div className="absolute inset-0">
            <Image
              src={post.imagen_post}
              alt={post.titulo}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Link
              href={`/blog?categoria=${post.categoria.slug}`}
              className="bg-green-500/30 hover:bg-green-500/50 text-green-200 text-xs font-semibold px-3 py-1 rounded-full transition-colors"
            >
              {post.categoria.nombre}
            </Link>
            {post.etiqueta && (
              <span className="text-green-300 text-xs">{post.etiqueta}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {post.titulo}
          </h1>
          <p className="text-green-100 text-lg leading-relaxed mb-6">{post.subtitulo}</p>
          <div className="flex items-center justify-center gap-3 text-sm text-green-300">
            <span className="font-medium text-white">{post.autor_nombre}</span>
            <span>·</span>
            <span>{formatFecha(post.creado)}</span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="text-sm text-stone-400 mb-10 flex items-center gap-2">
          <Link href="/blog" className="hover:text-green-700 transition-colors">Blog</Link>
          <span>/</span>
          <Link
            href={`/blog?categoria=${post.categoria.slug}`}
            className="hover:text-green-700 transition-colors"
          >
            {post.categoria.nombre}
          </Link>
          <span>/</span>
          <span className="text-stone-600 line-clamp-1">{post.titulo}</span>
        </nav>

        {/* Contenido del post */}
        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.contenido }}
        />

        {/* Compartir / volver */}
        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Volver al blog
          </Link>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Compartir
          </a>
        </div>

        {/* Posts relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Seguí leyendo</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relacionados.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video bg-stone-100">
                    {p.imagen_post ? (
                      <Image
                        src={p.imagen_post}
                        alt={p.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-50"><Leaf className="w-12 h-12 text-green-200" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-green-700 font-medium">{p.categoria.nombre}</span>
                    <h3 className="text-sm font-semibold text-stone-800 mt-1 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {p.titulo}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  )
}
