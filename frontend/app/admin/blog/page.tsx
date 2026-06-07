'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { getAdminBlogPosts, eliminarBlogPost } from '@/lib/api'
import type { BlogPost } from '@/lib/types'
import PostDrawer from './_components/PostDrawer'
import { FileText, Leaf } from 'lucide-react'

export default function AdminBlogPage() {
  const { access } = useAuthStore()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [search, setSearch] = useState('')
  const [cargando, setCargando] = useState(true)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPostId, setDrawerPostId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    if (!access) return
    setCargando(true)
    try {
      const data = await getAdminBlogPosts(access, search || undefined)
      setPosts(data)
    } finally {
      setCargando(false)
    }
  }, [access, search])

  useEffect(() => {
    const t = setTimeout(cargar, 300)
    return () => clearTimeout(t)
  }, [cargar])

  function abrirNuevo() {
    setDrawerPostId(null)
    setDrawerOpen(true)
  }

  function abrirEditar(id: number) {
    setDrawerPostId(id)
    setDrawerOpen(true)
  }

  async function handleEliminar(post: BlogPost) {
    if (!access) return
    if (!confirm(`¿Eliminar "${post.titulo}"? Esta acción no se puede deshacer.`)) return
    setEliminandoId(post.id)
    try {
      await eliminarBlogPost(access, post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setEliminandoId(null)
    }
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1">Blog</h1>
            <p className="text-sm text-stone-400">
              {posts.length} {posts.length === 1 ? 'artículo publicado' : 'artículos publicados'}
            </p>
          </div>
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Nuevo post
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Contenido */}
        {cargando ? (
          <div className="flex items-center gap-3 text-stone-400 py-10">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            Cargando artículos...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <FileText className="w-10 h-10 mx-auto mb-4 text-stone-300" />
            <p className="text-sm font-medium mb-1">No hay artículos todavía</p>
            <p className="text-xs mb-5">Empezá publicando tu primer post</p>
            <button
              onClick={abrirNuevo}
              className="text-sm text-green-700 font-medium hover:underline"
            >
              Crear primer post →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 flex gap-5 hover:shadow-sm transition-shadow"
              >
                {/* Imagen */}
                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-stone-100">
                  {post.imagen_post ? (
                    <Image src={post.imagen_post} alt={post.titulo} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-7 h-7 text-stone-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.etiqueta && (
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            {post.etiqueta}
                          </span>
                        )}
                        <span className="text-xs text-stone-400">{post.categoria.nombre}</span>
                      </div>
                      <h3 className="font-semibold text-stone-800 truncate">{post.titulo}</h3>
                      <p className="text-sm text-stone-500 truncate mt-0.5">{post.subtitulo}</p>
                    </div>
                    <span className="text-xs text-stone-400 shrink-0">{formatFecha(post.creado)}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => abrirEditar(post.id)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1"
                    >
                      ✏️ Editar
                    </button>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors"
                    >
                      Ver →
                    </Link>
                    <button
                      onClick={() => handleEliminar(post)}
                      disabled={eliminandoId === post.id}
                      className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 ml-auto"
                    >
                      {eliminandoId === post.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {access && (
        <PostDrawer
          open={drawerOpen}
          postId={drawerPostId}
          token={access}
          onClose={() => setDrawerOpen(false)}
          onSaved={cargar}
        />
      )}
    </>
  )
}
