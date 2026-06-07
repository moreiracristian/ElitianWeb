'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCarritoStore } from '@/store/carrito'
import { useAuthStore } from '@/store/auth'
import { ShoppingBag, ShoppingCart, Leaf, CreditCard, Banknote, Truck } from 'lucide-react'

export default function CarritoPage() {
  const { carrito, fetchCarrito, actualizar, eliminar } = useCarritoStore()
  const autenticado = useAuthStore((s) => s.estaAutenticado())

  useEffect(() => {
    fetchCarrito()
  }, [fetchCarrito])

  if (!autenticado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-6 text-stone-300" />
        <h1 className="text-2xl font-semibold text-stone-800 mb-3">Tu carrito te espera</h1>
        <p className="text-stone-500 mb-8">Iniciá sesión para ver y guardar tus productos.</p>
        <Link
          href="/cuenta/login"
          className="inline-block px-8 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-12 h-12 mx-auto mb-6 text-stone-300" />
        <h1 className="text-2xl font-semibold text-stone-800 mb-3">Tu carrito está vacío</h1>
        <p className="text-stone-500 mb-8">Explorá nuestra tienda y encontrá productos naturales para vos.</p>
        <Link
          href="/tienda"
          className="inline-block px-8 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
        >
          Ir a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-stone-800 mb-8">Tu carrito</h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Lista de items */}
        <div className="lg:col-span-2 space-y-4">
          {carrito.items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white rounded-2xl border border-stone-200 p-4">
              {/* Imagen */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-stone-50">
                {item.producto.imagen_principal ? (
                  <Image
                    src={item.producto.imagen_principal}
                    alt={item.producto.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Leaf className="w-7 h-7 text-stone-200" /></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-400 mb-0.5">{item.producto.marca}</p>
                <Link
                  href={`/tienda/${item.producto.categoria_nombre.toLowerCase()}/${item.producto.slug}`}
                  className="text-sm font-medium text-stone-800 hover:text-green-700 line-clamp-2 transition-colors"
                >
                  {item.producto.nombre}
                </Link>
                <p className="text-green-700 font-semibold mt-1">${item.producto.precio_final}</p>
              </div>

              {/* Cantidad + eliminar */}
              <div className="flex flex-col items-end justify-between gap-2">
                <button
                  onClick={() => eliminar(item.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="Eliminar"
                >
                  ×
                </button>

                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden text-sm">
                  <button
                    onClick={() => actualizar(item.id, item.cantidad - 1)}
                    className="px-2.5 py-1.5 hover:bg-stone-50 text-stone-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-3 py-1.5 font-medium text-stone-800">{item.cantidad}</span>
                  <button
                    onClick={() => actualizar(item.id, item.cantidad + 1)}
                    className="px-2.5 py-1.5 hover:bg-stone-50 text-stone-600 transition-colors"
                    disabled={item.cantidad >= item.producto.stock}
                  >
                    +
                  </button>
                </div>

                <p className="text-sm font-semibold text-stone-700">${item.subtotal}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-stone-800 mb-5">Resumen del pedido</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-stone-600">
                <span>Productos ({carrito.cantidad_items})</span>
                <span>${carrito.total}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Envío</span>
                <span className="text-green-600 font-medium">A calcular</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold text-stone-800 text-base">
                <span>Total</span>
                <span>${carrito.total}</span>
              </div>
            </div>

            {/* Beneficios */}
            <div className="bg-green-50 rounded-xl p-3 text-xs text-green-800 space-y-1 mb-5">
              <p className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 shrink-0" /> 3 cuotas sin interés</p>
              <p className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 shrink-0" /> 20% OFF efectivo / transferencia</p>
              <p className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 shrink-0" /> Envío gratis en compras +$10.000 (Resistencia)</p>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center py-3.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors"
            >
              Finalizar compra
            </Link>
            <Link
              href="/tienda"
              className="block w-full text-center py-3 mt-3 text-stone-500 hover:text-stone-700 text-sm transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
