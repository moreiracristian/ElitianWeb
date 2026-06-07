'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { crearBlogCategoria, editarBlogCategoria } from '@/lib/api'
import type { BlogCategoria } from '@/lib/types'

interface Props {
  open: boolean
  categoria: BlogCategoria | null
  token: string
  onClose: () => void
  onSaved: (cat: BlogCategoria) => void
}

export default function CategoriaDrawer({ open, categoria, token, onClose, onSaved }: Props) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setNombre('')
      setDescripcion('')
      setImagenFile(null)
      setImagenPreview(null)
      setError(null)
      return
    }
    if (categoria) {
      setNombre(categoria.nombre)
      setDescripcion(categoria.descripcion ?? '')
      setImagenPreview(categoria.imagen_cat ?? null)
    }
  }, [open, categoria])

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  async function handleGuardar() {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return }
    setGuardando(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('nombre', nombre.trim())
      fd.append('descripcion', descripcion.trim())
      if (imagenFile) fd.append('imagen_cat', imagenFile)

      const result = categoria
        ? await editarBlogCategoria(token, categoria.id, fd)
        : await crearBlogCategoria(token, fd)

      onSaved(result)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-500'
  const labelCls = 'text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5 block'

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-semibold text-stone-800 text-lg">
            {categoria ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors text-lg leading-none">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* Imagen */}
          <div>
            <label className={labelCls}>Imagen (opcional)</label>
            <div
              className="relative w-full h-36 rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-200 hover:border-green-500 transition-colors cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {imagenPreview ? (
                <Image src={imagenPreview} alt="Categoría" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 text-sm gap-2">
                  <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Subir imagen</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Cambiar imagen</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagen} />
          </div>

          {/* Nombre */}
          <div>
            <label className={labelCls}>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputCls}
              placeholder="ej: Cosmética natural"
              autoFocus
            />
            <p className="text-xs text-stone-400 mt-1">El slug se genera automáticamente.</p>
          </div>

          {/* Descripción */}
          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Una breve descripción de la categoría..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-6 py-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {guardando && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {guardando ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear categoría'}
          </button>
        </div>
      </div>
    </>
  )
}
