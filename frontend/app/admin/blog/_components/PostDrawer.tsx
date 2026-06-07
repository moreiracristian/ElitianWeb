'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  getAdminBlogCategorias,
  getAdminBlogPostDetalle,
  crearBlogPost,
  editarBlogPost,
} from '@/lib/api'
import type { BlogCategoria } from '@/lib/types'
import TiptapEditor from './TiptapEditor'

interface PostForm {
  titulo: string
  subtitulo: string
  categoria: number | ''
  etiqueta: string
  contenido: string
}

const FORM_INICIAL: PostForm = {
  titulo: '',
  subtitulo: '',
  categoria: '',
  etiqueta: '',
  contenido: '',
}

interface Props {
  open: boolean
  postId: number | null
  token: string
  onClose: () => void
  onSaved: () => void
}

export default function PostDrawer({ open, postId, token, onClose, onSaved }: Props) {
  const [form, setForm] = useState<PostForm>(FORM_INICIAL)
  const [categorias, setCategorias] = useState<BlogCategoria[]>([])
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [imagenActual, setImagenActual] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAdminBlogCategorias(token).then(setCategorias).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!open) {
      setForm(FORM_INICIAL)
      setImagenFile(null)
      setImagenPreview(null)
      setImagenActual(null)
      setError(null)
      return
    }
    if (!postId) return

    setCargando(true)
    getAdminBlogPostDetalle(token, postId)
      .then((p) => {
        setForm({
          titulo: p.titulo,
          subtitulo: p.subtitulo,
          categoria: p.categoria.id,
          etiqueta: p.etiqueta ?? '',
          contenido: p.contenido ?? '',
        })
        setImagenActual(p.imagen_post ?? null)
      })
      .catch(() => setError('Error al cargar el post'))
      .finally(() => setCargando(false))
  }, [open, postId, token])

  function set(field: keyof PostForm, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  async function handleGuardar() {
    if (!form.titulo || !form.categoria || !form.contenido) {
      setError('Título, categoría y contenido son requeridos')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('titulo', form.titulo)
      fd.append('subtitulo', form.subtitulo)
      fd.append('categoria', String(form.categoria))
      fd.append('etiqueta', form.etiqueta)
      fd.append('contenido', form.contenido)
      if (imagenFile) fd.append('imagen_post', imagenFile)

      if (postId) {
        await editarBlogPost(token, postId, fd)
      } else {
        await crearBlogPost(token, fd)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-500'
  const labelCls = 'text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5 block'

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-semibold text-stone-800 text-lg">
            {postId ? 'Editar post' : 'Nuevo post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {cargando ? (
            <div className="flex items-center justify-center h-full text-stone-400 gap-3">
              <span className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              Cargando...
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              {/* Imagen de portada */}
              <div>
                <label className={labelCls}>Imagen de portada</label>
                <div
                  className="relative w-full h-40 rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-200 hover:border-green-500 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagenPreview || imagenActual ? (
                    <Image
                      src={imagenPreview ?? imagenActual!}
                      alt="Portada"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 text-sm gap-2">
                      <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Subir imagen de portada</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Cambiar imagen</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagen}
                />
              </div>

              {/* Título */}
              <div>
                <label className={labelCls}>Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => set('titulo', e.target.value)}
                  className={inputCls}
                  placeholder="El título del artículo"
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className={labelCls}>Subtítulo</label>
                <input
                  type="text"
                  value={form.subtitulo}
                  onChange={(e) => set('subtitulo', e.target.value)}
                  className={inputCls}
                  placeholder="Un resumen corto del artículo"
                />
              </div>

              {/* Categoría + Etiqueta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => set('categoria', Number(e.target.value))}
                    className={`${inputCls} bg-white`}
                  >
                    <option value="">Seleccioná una categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Etiqueta</label>
                  <input
                    type="text"
                    value={form.etiqueta}
                    onChange={(e) => set('etiqueta', e.target.value)}
                    className={inputCls}
                    placeholder="ej: Nutrición, Bienestar..."
                  />
                </div>
              </div>

              {/* Contenido — editor WYSIWYG */}
              <div>
                <label className={labelCls}>Contenido *</label>
                <TiptapEditor
                  value={form.contenido}
                  onChange={(html) => set('contenido', html)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {guardando && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {guardando ? 'Guardando...' : postId ? 'Actualizar post' : 'Publicar post'}
          </button>
        </div>
      </div>
    </>
  )
}
