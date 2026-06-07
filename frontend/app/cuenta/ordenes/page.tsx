'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { getOrdenes } from '@/lib/api'
import type { Orden } from '@/lib/types'
import { Package } from 'lucide-react'

const ESTADO_COLORES: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  enviado:    'bg-purple-100 text-purple-700',
  entregado:  'bg-green-100 text-green-700',
  cancelado:  'bg-red-100 text-red-700',
}

export default function OrdenesPage() {
  const { access, estaAutenticado } = useAuthStore()
  const router = useRouter()
  const [ordenes, setOrdenes] = useState<Orden[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/cuenta/login?next=/cuenta/ordenes')
      return
    }
    if (!access) return
    getOrdenes(access)
      .then(setOrdenes)
      .catch(() => setError('No pudimos cargar tus pedidos. Intentá de nuevo.'))
  }, [access, estaAutenticado, router])

  if (!ordenes) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        {error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <>
            <div className="w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500 text-sm">Cargando tus pedidos...</p>
          </>
        )}
      </div>
    )
  }

  if (ordenes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-stone-300" />
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Todavía no tenés pedidos</h1>
        <p className="text-stone-500 text-sm mb-8">Explorá nuestra tienda y hacé tu primer pedido.</p>
        <Link
          href="/tienda"
          className="inline-block px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
        >
          Ir a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Mis pedidos</h1>

      <div className="space-y-4">
        {ordenes.map((orden) => (
          <Link
            key={orden.id}
            href={`/cuenta/ordenes/${orden.id}`}
            className="block bg-white rounded-2xl border border-stone-200 p-5 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-800">Pedido #{orden.id}</p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      ESTADO_COLORES[orden.estado] ?? 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {orden.estado_display}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {new Date(orden.creado).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {orden.items.length} {orden.items.length === 1 ? 'producto' : 'productos'}
                  {' · '}
                  <span className="text-stone-400 truncate max-w-xs inline-block align-bottom">
                    {orden.items.map((i) => i.producto_nombre).join(', ')}
                  </span>
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-stone-800 text-base">${orden.total}</p>
                <p className="text-xs text-green-700 mt-1">Ver detalle →</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
