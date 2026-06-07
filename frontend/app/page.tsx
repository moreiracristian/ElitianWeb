import Link from 'next/link'
import Image from 'next/image'
import { getCategorias, getProductos } from '@/lib/api'
import HeroCarousel from '@/components/HeroCarousel'
import { Truck, Leaf, Recycle, CreditCard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [categorias, destacadosData] = await Promise.all([
    getCategorias().catch(() => []),
    getProductos({ destacado: true, con_stock: true }).catch(() => ({ results: [] })),
  ])
  const destacados = destacadosData.results.slice(0, 8)

  return (
    <>
      {/* Hero carousel */}
      <HeroCarousel />

      {/* Beneficios */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { Icon: Truck, titulo: 'Envío gratis', desc: 'En compras +$10.000 (Resistencia)' },
            { Icon: Leaf, titulo: 'Regalá conciencia', desc: 'Productos respetuosos con el planeta' },
            { Icon: Recycle, titulo: 'Reciclamos', desc: 'Recibimos tus envases usados' },
            { Icon: CreditCard, titulo: '3 cuotas s/interés', desc: '20% OFF efectivo / transferencia' },
          ].map(({ Icon, titulo, desc }) => (
            <div key={titulo} className="flex flex-col items-center text-center gap-2">
              <Icon className="w-7 h-7 text-green-700" />
              <p className="font-semibold text-stone-800 text-sm">{titulo}</p>
              <p className="text-stone-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* Categorías */}
        {categorias.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-stone-800">Categorías</h2>
              <Link href="/tienda" className="text-sm text-green-700 hover:text-green-800 font-medium">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  <span className="relative z-10 text-white font-semibold text-sm drop-shadow">
                    {cat.nombre}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Productos destacados */}
        {destacados.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-stone-800">Destacados</h2>
              <Link href="/tienda" className="text-sm text-green-700 hover:text-green-800 font-medium">
                Ver todos →
              </Link>
            </div>
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
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Leaf className="w-10 h-10 text-stone-200" /></div>
                    )}
                    {producto.tiene_oferta && (
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {producto.descuento > 0 ? `${producto.descuento}% OFF` : 'Oferta'}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-stone-400 mb-0.5">{producto.marca}</p>
                    <p className="text-sm font-medium text-stone-800 line-clamp-2 mb-2">{producto.nombre}</p>
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

        {/* CTA Banner */}
        <section className="bg-green-800 rounded-3xl px-8 py-12 md:py-16 text-center text-white">
          <p className="text-green-300 text-sm font-medium mb-2 uppercase tracking-widest">Consumo consciente</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-xl mx-auto leading-tight">
            Cuidá tu cuerpo y el planeta al mismo tiempo
          </h2>
          <p className="text-green-100 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Todos nuestros productos son naturales, ecológicos y elaborados por emprendedores locales.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tienda"
              className="px-7 py-3 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors"
            >
              Explorar tienda
            </Link>
            <Link
              href="/conocenos"
              className="px-7 py-3 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Conocénos
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}
