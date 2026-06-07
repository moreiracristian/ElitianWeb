'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { getAdminResenas, aprobarResena, eliminarResenaAdmin } from '@/lib/api'
import type { ResenaAdmin } from '@/lib/types'
import { Star } from 'lucide-react'

type Filtro = 'pendientes' | 'aprobadas' | 'todas'

const FILTROS: { label: string; value: Filtro }[] = [
  { label: 'Pendientes', value: 'pendientes' },
  { label: 'Aprobadas', value: 'aprobadas' },
  { label: 'Todas', value: 'todas' },
]

function Estrellas({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? 'text-yellow-400' : 'text-stone-200'}>★</span>
      ))}
    </span>
  )
}

export default function AdminResenasPage() {
  const { access } = useAuthStore()
  const [resenas, setResenas] = useState<ResenaAdmin[]>([])
  const [filtro, setFiltro] = useState<Filtro>('pendientes')
  const [cargando, setCargando] = useState(true)
  const [accionId, setAccionId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    if (!access) return
    setCargando(true)
    try {
      const aprobado = filtro === 'pendientes' ? false : filtro === 'aprobadas' ? true : undefined
      const data = await getAdminResenas(access, aprobado)
      setResenas(data)
    } finally {
      setCargando(false)
    }
  }, [access, filtro])

  useEffect(() => { cargar() }, [cargar])

  async function handleAprobar(id: number, aprobado: boolean) {
    if (!access) return
    setAccionId(id)
    try {
      const actualizada = await aprobarResena(access, id, aprobado)
      setResenas((prev) => prev.map((r) => (r.id === id ? actualizada : r)))
      if (filtro !== 'todas') cargar()
    } finally {
      setAccionId(null)
    }
  }

  async function handleEliminar(resena: ResenaAdmin) {
    if (!access) return
    if (!confirm(`¿Eliminar la reseña de ${resena.usuario_nombre}?`)) return
    setAccionId(resena.id)
    try {
      await eliminarResenaAdmin(access, resena.id)
      setResenas((prev) => prev.filter((r) => r.id !== resena.id))
    } finally {
      setAccionId(null)
    }
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Reseñas</h1>
          <p className="text-sm text-stone-400">
            {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filtro === f.value
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex items-center gap-3 text-stone-400 py-10">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          Cargando reseñas...
        </div>
      ) : resenas.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Star className="w-10 h-10 mx-auto mb-4 text-stone-300" />
          <p className="text-sm font-medium">
            {filtro === 'pendientes' ? 'No hay reseñas pendientes de aprobación' : 'No hay reseñas'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {resenas.map((resena) => (
            <div
              key={resena.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-stone-800 text-sm">{resena.usuario_nombre}</span>
                    <span className="text-xs text-stone-400">{resena.usuario_email}</span>
                  </div>
                  <Link
                    href={`/tienda/${resena.producto_categoria_slug}/${resena.producto_slug}`}
                    target="_blank"
                    className="text-xs text-green-700 hover:underline"
                  >
                    {resena.producto_nombre} →
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Estrellas n={resena.calificacion} />
                  <span className="text-xs text-stone-400">{formatFecha(resena.creado)}</span>
                </div>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed mb-4">{resena.comentario}</p>

              <div className="flex items-center gap-3">
                {resena.aprobado ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                    ✓ Aprobada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                    Pendiente
                  </span>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  {resena.aprobado ? (
                    <button
                      onClick={() => handleAprobar(resena.id, false)}
                      disabled={accionId === resena.id}
                      className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-40"
                    >
                      Desaprobar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAprobar(resena.id, true)}
                      disabled={accionId === resena.id}
                      className="text-xs font-medium text-green-700 hover:text-green-900 transition-colors disabled:opacity-40"
                    >
                      {accionId === resena.id ? 'Aprobando...' : 'Aprobar'}
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminar(resena)}
                    disabled={accionId === resena.id}
                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
