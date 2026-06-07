import Image from 'next/image'
import Link from 'next/link'
import { getBlogPosts, getBlogCategorias } from '@/lib/api'
import { Leaf } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog | Elitian',
  description: 'Artículos sobre cosmética natural, cuidado personal, sustentabilidad y vida consciente.',
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const [postsData, categorias] = await Promise.all([
    getBlogPosts().catch(() => ({ results: [], count: 0, next: null, previous: null })),
    getBlogCategorias().catch(() => []),
  ])

  const posts = postsData.results
  const [featured, ...resto] = posts

  return (
    <>
      {/* Hero */}
      <section className="bg-green-800 text-white py-20 px-4 text-center">
        <p className="text-green-300 text-sm font-medium uppercase tracking-widest mb-3">Nuestro blog</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Vida natural & consciente
        </h1>
        <p className="text-green-100 text-lg max-w-xl mx-auto leading-relaxed">
          Artículos sobre cosmética natural, ingredientes, sustentabilidad y todo lo que te ayuda
          a cuidarte mejor.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">✍️</p>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Próximamente</h2>
            <p className="text-stone-500">Estamos preparando contenido. ¡Volvé pronto!</p>
          </div>
        ) : (
          <>
            {/* Filtro por categoría */}
            {categorias.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <Link
                  href="/blog"
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-700 text-white"
                >
                  Todos
                </Link>
                {categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?categoria=${cat.slug}`}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    {cat.nombre}
                  </Link>
                ))}
              </div>
            )}

            {/* Post destacado */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid md:grid-cols-2 gap-0 bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow mb-12"
              >
                <div className="relative aspect-video md:aspect-auto bg-stone-100">
                  {featured.imagen_post ? (
                    <Image
                      src={featured.imagen_post}
                      alt={featured.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full min-h-64 flex items-center justify-center bg-green-50">
                      <Leaf className="w-14 h-14 text-green-200" />
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {featured.categoria.nombre}
                    </span>
                    {featured.etiqueta && (
                      <span className="text-stone-400 text-xs">{featured.etiqueta}</span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3 group-hover:text-green-700 transition-colors leading-snug">
                    {featured.titulo}
                  </h2>
                  <p className="text-stone-500 mb-6 leading-relaxed">{featured.subtitulo}</p>
                  <div className="flex items-center gap-3 text-sm text-stone-400">
                    <span className="font-medium text-stone-600">{featured.autor_nombre}</span>
                    <span>·</span>
                    <span>{formatFecha(featured.creado)}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid de posts */}
            {resto.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {resto.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="relative aspect-video bg-stone-100">
                      {post.imagen_post ? (
                        <Image
                          src={post.imagen_post}
                          alt={post.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                          <Leaf className="w-10 h-10 text-green-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {post.categoria.nombre}
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-800 mb-2 group-hover:text-green-700 transition-colors leading-snug line-clamp-2">
                        {post.titulo}
                      </h3>
                      <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
                        {post.subtitulo}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-400 border-t border-stone-100 pt-4">
                        <span className="font-medium text-stone-500">{post.autor_nombre}</span>
                        <span>·</span>
                        <span>{formatFecha(post.creado)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Newsletter */}
        <section className="mt-20 bg-green-50 border border-green-100 rounded-3xl px-8 py-12 text-center">
          <p className="text-3xl mb-4">💌</p>
          <h2 className="text-2xl font-semibold text-stone-800 mb-3">
            ¿Querés recibir nuestro contenido?
          </h2>
          <p className="text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
            Escribinos por WhatsApp y te avisamos cuando publiquemos nuevos artículos.
          </p>
          <a
            href="https://wa.me/+5493624135017"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Avisame por WhatsApp
          </a>
        </section>

      </div>
    </>
  )
}
