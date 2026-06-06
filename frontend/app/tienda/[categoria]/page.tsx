import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCategoria, getProductos } from '@/lib/api'
import FiltroOrden from './_components/FiltroOrden'
import EstrellasBadge from '@/components/EstrellasBadge'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ page?: string; ordering?: string; search?: string }>
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria: categoriaSlug } = await params
  const { page, ordering, search } = await searchParams

  const [categoria, productosData] = await Promise.all([
    getCategoria(categoriaSlug).catch(() => null),
    getProductos({
      categoria: categoriaSlug,
      page: page ? Number(page) : 1,
      ordering,
      search,
    }),
  ])

  if (!categoria) notFound()

  const { results: productos, count, next, previous } = productosData
  const currentPage = page ? Number(page) : 1
  const totalPages = Math.ceil(count / 12)

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/tienda" className="hover:text-green-700">Tienda</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{categoria.nombre}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-semibold text-stone-800">{categoria.nombre}</h1>
        <FiltroOrden />
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          No hay productos en esta categoría todavía.
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4">{count} producto{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {productos.map((producto) => (
              <Link
                key={producto.id}
                href={`/tienda/${categoriaSlug}/${producto.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-stone-50">
                  {producto.imagen_principal ? (
                    <Image
                      src={producto.imagen_principal}
                      alt={producto.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🌿</div>
                  )}
                  {producto.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-stone-500 text-sm font-medium">Sin stock</span>
                    </div>
                  )}
                  {producto.tiene_oferta && producto.stock > 0 && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {producto.descuento > 0 ? `${producto.descuento}% OFF` : 'Oferta'}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-stone-500 mb-0.5">{producto.marca}</p>
                  <p className="text-sm font-medium text-stone-800 line-clamp-2 mb-1">{producto.nombre}</p>
                  {producto.calificacion_promedio !== null && producto.total_resenas > 0 && (
                    <div className="mb-1.5">
                      <EstrellasBadge calificacion={producto.calificacion_promedio} total={producto.total_resenas} />
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-green-700 font-semibold">${producto.precio_final}</span>
                    {producto.tiene_oferta && (
                      <span className="text-stone-400 line-through text-xs">${producto.precio}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {previous && (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-50"
                >
                  ← Anterior
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-stone-600">
                {currentPage} / {totalPages}
              </span>
              {next && (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-50"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
