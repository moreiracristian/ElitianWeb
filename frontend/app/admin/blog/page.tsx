'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import {
  getAdminBlogPosts, eliminarBlogPost,
  getAdminBlogCategorias, eliminarBlogCategoria,
} from '@/lib/api'
import type { BlogPost, BlogCategoria } from '@/lib/types'
import PostDrawer from './_components/PostDrawer'
import CategoriaDrawer from './_components/CategoriaDrawer'
import { FileText, Leaf, Tag, Edit2, Trash2 } from 'lucide-react'

type Tab = 'posts' | 'categorias'

export default function AdminBlogPage() {
  const { access } = useAuthStore()
  const [tab, setTab] = useState<Tab>('posts')

  // ── Posts ──────────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [search, setSearch] = useState('')
  const [cargandoPosts, setCargandoPosts] = useState(true)
  const [eliminandoPostId, setEliminandoPostId] = useState<number | null>(null)
  const [drawerPostOpen, setDrawerPostOpen] = useState(false)
  const [drawerPostId, setDrawerPostId] = useState<number | null>(null)

  // ── Categorías ─────────────────────────────────────────────────────────────
  const [categorias, setCategorias] = useState<BlogCategoria[]>([])
  const [cargandoCats, setCargandoCats] = useState(false)
  const [eliminandoCatId, setEliminandoCatId] = useState<number | null>(null)
  const [drawerCatOpen, setDrawerCatOpen] = useState(false)
  const [drawerCat, setDrawerCat] = useState<BlogCategoria | null>(null)

  // ── Carga posts ────────────────────────────────────────────────────────────
  const cargarPosts = useCallback(async () => {
    if (!access) return
    setCargandoPosts(true)
    try {
      const data = await getAdminBlogPosts(access, search || undefined)
      setPosts(data)
    } finally {
      setCargandoPosts(false)
    }
  }, [access, search])

  useEffect(() => {
    const t = setTimeout(cargarPosts, 300)
    return () => clearTimeout(t)
  }, [cargarPosts])

  // ── Carga categorías ───────────────────────────────────────────────────────
  const cargarCategorias = useCallback(async () => {
    if (!access) return
    setCargandoCats(true)
    try {
      const data = await getAdminBlogCategorias(access)
      setCategorias(data)
    } finally {
      setCargandoCats(false)
    }
  }, [access])

  useEffect(() => {
    if (tab === 'categorias') cargarCategorias()
  }, [tab, cargarCategorias])

  // ── Handlers posts ─────────────────────────────────────────────────────────
  async function handleEliminarPost(post: BlogPost) {
    if (!access) return
    if (!confirm(`¿Eliminar "${post.titulo}"? Esta acción no se puede deshacer.`)) return
    setEliminandoPostId(post.id)
    try {
      await eliminarBlogPost(access, post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setEliminandoPostId(null)
    }
  }

  // ── Handlers categorías ────────────────────────────────────────────────────
  async function handleEliminarCat(cat: BlogCategoria) {
    if (!access) return
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    setEliminandoCatId(cat.id)
    try {
      await eliminarBlogCategoria(access, cat.id)
      setCategorias((prev) => prev.filter((c) => c.id !== cat.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setEliminandoCatId(null)
    }
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1">Blog</h1>
            <p className="text-sm text-stone-400">
              {tab === 'posts'
                ? `${posts.length} ${posts.length === 1 ? 'artículo' : 'artículos'}`
                : `${categorias.length} ${categorias.length === 1 ? 'categoría' : 'categorías'}`}
            </p>
          </div>
          <button
            onClick={() => {
              if (tab === 'posts') { setDrawerPostId(null); setDrawerPostOpen(true) }
              else { setDrawerCat(null); setDrawerCatOpen(true) }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            {tab === 'posts' ? 'Nuevo post' : 'Nueva categoría'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-stone-200">
          {([['posts', 'Posts', FileText], ['categorias', 'Categorías', Tag]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Panel Posts ─────────────────────────────────────────────────── */}
        {tab === 'posts' && (
          <>
            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {cargandoPosts ? (
              <div className="flex items-center gap-3 text-stone-400 py-10">
                <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                Cargando artículos...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <FileText className="w-10 h-10 mx-auto mb-4 text-stone-300" />
                <p className="text-sm font-medium mb-1">No hay artículos todavía</p>
                <p className="text-xs mb-5">Empezá publicando tu primer post</p>
                <button onClick={() => { setDrawerPostId(null); setDrawerPostOpen(true) }} className="text-sm text-green-700 font-medium hover:underline">
                  Crear primer post →
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex gap-5 hover:shadow-sm transition-shadow">
                    <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-stone-100">
                      {post.imagen_post
                        ? <Image src={post.imagen_post} alt={post.titulo} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Leaf className="w-7 h-7 text-stone-200" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {post.etiqueta && (
                              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{post.etiqueta}</span>
                            )}
                            <span className="text-xs text-stone-400">{post.categoria.nombre}</span>
                          </div>
                          <h3 className="font-semibold text-stone-800 truncate">{post.titulo}</h3>
                          <p className="text-sm text-stone-500 truncate mt-0.5">{post.subtitulo}</p>
                        </div>
                        <span className="text-xs text-stone-400 shrink-0">{formatFecha(post.creado)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => { setDrawerPostId(post.id); setDrawerPostOpen(true) }} className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1">
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors">
                          Ver →
                        </Link>
                        <button
                          onClick={() => handleEliminarPost(post)}
                          disabled={eliminandoPostId === post.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 ml-auto flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {eliminandoPostId === post.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Panel Categorías ─────────────────────────────────────────────── */}
        {tab === 'categorias' && (
          <>
            {cargandoCats ? (
              <div className="flex items-center gap-3 text-stone-400 py-10">
                <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                Cargando categorías...
              </div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <Tag className="w-10 h-10 mx-auto mb-4 text-stone-300" />
                <p className="text-sm font-medium mb-1">No hay categorías todavía</p>
                <p className="text-xs mb-5">Las categorías agrupan los posts del blog</p>
                <button onClick={() => { setDrawerCat(null); setDrawerCatOpen(true) }} className="text-sm text-green-700 font-medium hover:underline">
                  Crear primera categoría →
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-sm transition-shadow">
                    {/* Imagen o placeholder */}
                    <div className="relative h-28 bg-stone-100">
                      {cat.imagen_cat
                        ? <Image src={cat.imagen_cat} alt={cat.nombre} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Tag className="w-8 h-8 text-stone-200" /></div>}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-stone-800 mb-0.5">{cat.nombre}</h3>
                      {cat.descripcion && (
                        <p className="text-xs text-stone-500 line-clamp-2 mb-3">{cat.descripcion}</p>
                      )}
                      <p className="text-xs text-stone-400 font-mono mb-3">/{cat.slug}</p>

                      <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
                        <button
                          onClick={() => { setDrawerCat(cat); setDrawerCatOpen(true) }}
                          className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <Link
                          href={`/blog/categoria/${cat.slug}`}
                          target="_blank"
                          className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors"
                        >
                          Ver →
                        </Link>
                        <button
                          onClick={() => handleEliminarCat(cat)}
                          disabled={eliminandoCatId === cat.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          {eliminandoCatId === cat.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {/* Drawers */}
      {access && (
        <>
          <PostDrawer
            open={drawerPostOpen}
            postId={drawerPostId}
            token={access}
            onClose={() => setDrawerPostOpen(false)}
            onSaved={cargarPosts}
          />
          <CategoriaDrawer
            open={drawerCatOpen}
            categoria={drawerCat}
            token={access}
            onClose={() => setDrawerCatOpen(false)}
            onSaved={(cat) => {
              setCategorias((prev) => {
                const idx = prev.findIndex((c) => c.id === cat.id)
                return idx >= 0 ? prev.map((c) => c.id === cat.id ? cat : c) : [...prev, cat]
              })
            }}
          />
        </>
      )}
    </>
  )
}
