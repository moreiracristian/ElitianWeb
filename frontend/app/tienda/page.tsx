import Link from 'next/link'
import Image from 'next/image'
import { getCategorias, getProductos } from '@/lib/api'
import EstrellasBadge from '@/components/EstrellasBadge'
import { Leaf } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TiendaPage() {
  let categorias: Awaited<ReturnType<typeof getCategorias>> = []
  let destacados: Awaited<ReturnType<typeof getProductos>>['results'] = []

  try {
    const [categoriasData, destacadosData] = await Promise.all([
      getCategorias(),
      getProductos({ destacado: true, con_stock: true }),
    ])
    categorias = categoriasData
    destacados = destacadosData.results
  } catch {
    // backend no disponible — la página muestra estado vacío
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Categorías */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold text-stone-800 mb-6">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/tienda/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-stone-100 aspect-square flex items-end p-4 hover:shadow-lg transition-shadow"
            >
              {cat.imagen && (
                <Image
                  src={cat.imagen}
                  alt={cat.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <span className="relative z-10 bg-white/80 backdrop-blur-sm text-stone-800 font-medium text-sm px-3 py-1.5 rounded-full">
                {cat.nombre}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">Destacados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {destacados.map((producto) => (
              <Link
                key={producto.id}
                href={`/tienda/${producto.categoria_slug}/${producto.slug}`}
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
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-stone-200" />
                    </div>
                  )}
                  {producto.tiene_oferta && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {producto.descuento > 0 ? `${producto.descuento}% OFF` : 'Oferta'}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-stone-500 mb-0.5">{producto.marca}</p>
                  <p className="text-sm font-medium text-stone-800 line-clamp-2 mb-1">
                    {producto.nombre}
                  </p>
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
        </section>
      )}
    </main>
  )
}
