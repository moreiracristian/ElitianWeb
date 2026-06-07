'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { getAdminOrdenes, updateOrdenEstado } from '@/lib/api'
import type { Orden } from '@/lib/types'
import { Package } from 'lucide-react'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const ESTADO_COLORES: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  enviado:    'bg-purple-100 text-purple-700',
  entregado:  'bg-green-100 text-green-700',
  cancelado:  'bg-red-100 text-red-700',
}

export default function AdminOrdenesPage() {
  const { access } = useAuthStore()
  const searchParams = useSearchParams()
  const estadoParam = searchParams.get('estado') ?? ''

  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [filtroEstado, setFiltroEstado] = useState(estadoParam)
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    if (!access) return
    setCargando(true)
    try {
      const data = await getAdminOrdenes(access, filtroEstado || undefined)
      setOrdenes(data)
    } finally {
      setCargando(false)
    }
  }, [access, filtroEstado])

  useEffect(() => { cargar() }, [cargar])

  async function handleEstado(orden: Orden, nuevoEstado: string) {
    if (!access) return
    setActualizando(orden.id)
    try {
      const updated = await updateOrdenEstado(access, orden.id, nuevoEstado)
      setOrdenes((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } finally {
      setActualizando(null)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Pedidos</h1>
      <p className="text-sm text-stone-400 mb-6">Gestioná el estado de cada orden</p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            onClick={() => setFiltroEstado(e.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtroEstado === e.value
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex items-center gap-3 text-stone-400 py-10">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          Cargando pedidos...
        </div>
      ) : ordenes.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Package className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          <p className="text-sm">No hay pedidos con este filtro.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">#</th>
                <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">Fecha</th>
                <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">Items</th>
                <th className="text-right px-5 py-3 text-xs text-stone-400 font-medium">Total</th>
                <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">Estado</th>
                <th className="px-5 py-3 text-xs text-stone-400 font-medium">Cambiar a</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {ordenes.map((orden) => (
                <tr key={orden.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-stone-700">#{orden.id}</td>
                  <td className="px-5 py-3.5 text-stone-600 max-w-[140px] truncate">
                    {orden.usuario_nombre ?? `Usuario #${orden.usuario}`}
                  </td>
                  <td className="px-5 py-3.5 text-stone-400 whitespace-nowrap">
                    {new Date(orden.creado).toLocaleDateString('es-AR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-stone-500">{orden.items.length}</td>
                  <td className="px-5 py-3.5 font-semibold text-stone-800 text-right">${orden.total}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLORES[orden.estado] ?? 'bg-stone-100 text-stone-600'}`}>
                      {orden.estado_display}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={orden.estado}
                      onChange={(e) => handleEstado(orden, e.target.value)}
                      disabled={actualizando === orden.id}
                      className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 cursor-pointer"
                    >
                      {ESTADOS.filter((e) => e.value).map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
