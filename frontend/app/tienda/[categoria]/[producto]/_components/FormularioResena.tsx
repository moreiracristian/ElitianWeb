'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { agregarResena } from '@/lib/api'

interface Props {
  productoSlug: string
  onResenaAgregada?: () => void
}

export default function FormularioResena({ productoSlug, onResenaAgregada }: Props) {
  const { access, estaAutenticado } = useAuthStore()
  const [calificacion, setCalificacion] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  if (!estaAutenticado()) {
    return (
      <div className="bg-stone-50 rounded-2xl p-6 text-center">
        <p className="text-stone-600 text-sm mb-3">
          <Link href="/cuenta/login" className="text-green-700 font-semibold hover:underline">
            Iniciá sesión
          </Link>{' '}
          para dejar tu reseña sobre este producto.
        </p>
      </div>
    )
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        <p className="font-semibold text-stone-800 mb-1">¡Gracias por tu reseña!</p>
        <p className="text-stone-500 text-sm">Será visible una vez que la aprobemos.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!access || calificacion === 0) return
    setEnviando(true)
    setError('')
    try {
      await agregarResena(productoSlug, access, { comentario, calificacion })
      setEnviado(true)
      onResenaAgregada?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la reseña')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-50 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-stone-800">Dejá tu reseña</h3>

      {/* Estrellas */}
      <div>
        <p className="text-sm text-stone-500 mb-2">Calificación</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((estrella) => (
            <button
              key={estrella}
              type="button"
              onClick={() => setCalificacion(estrella)}
              onMouseEnter={() => setHover(estrella)}
              onMouseLeave={() => setHover(0)}
              className="text-2xl leading-none transition-colors"
            >
              <span className={(hover || calificacion) >= estrella ? 'text-yellow-400' : 'text-stone-300'}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comentario */}
      <div>
        <label className="text-sm text-stone-500 block mb-1">Comentario</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          required
          placeholder="Contanos tu experiencia con el producto..."
          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={enviando || calificacion === 0}
        className="px-6 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </form>
  )
}
