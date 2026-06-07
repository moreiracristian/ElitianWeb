'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { getAdminProductos, toggleProductoActivo } from '@/lib/api'
import type { ProductoList } from '@/lib/types'
import ProductoDrawer from './_components/ProductoDrawer'
import { Package, Leaf } from 'lucide-react'

export default function AdminProductosPage() {
  const { access } = useAuthStore()
  const searchParams = useSearchParams()

  const [productos, setProductos] = useState<ProductoList[]>([])
  const [search, setSearch] = useState('')
  const [filtroActivo, setFiltroActivo] = useState(searchParams.get('activo') ?? '')
  const [cargando, setCargando] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerProductoId, setDrawerProductoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    if (!access) return
    setCargando(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (filtroActivo) params.activo = filtroActivo
      const data = await getAdminProductos(access, params)
      setProductos(data)
    } finally {
      setCargando(false)
    }
  }, [access, search, filtroActivo])

  useEffect(() => {
    const t = setTimeout(cargar, 300)
    return () => clearTimeout(t)
  }, [cargar])

  async function handleToggle(id: number) {
    if (!access) return
    setToggling(id)
    try {
      const res = await toggleProductoActivo(access, id)
      setProductos((prev) =>
        prev.map((p) => (p.id === res.id ? { ...p, activo: res.activo } : p)),
      )
    } finally {
      setToggling(null)
    }
  }

  function abrirNuevo() {
    setDrawerProductoId(null)
    setDrawerOpen(true)
  }

  function abrirEditar(id: number) {
    setDrawerProductoId(id)
    setDrawerOpen(true)
  }

  function handleDrawerSaved() {
    cargar()
  }

  function stockBadge(stock: number) {
    if (stock === 0)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
          Sin stock
        </span>
      )
    if (stock < 5)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          {stock}
        </span>
      )
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
        {stock}
      </span>
    )
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1">Productos</h1>
            <p className="text-sm text-stone-400">Gestioná el catálogo de la tienda</p>
          </div>
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Nuevo producto
          </button>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2">
            {[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Activos' },
              { value: 'false', label: 'Inactivos' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroActivo(f.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  filtroActivo === f.value
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="flex items-center gap-3 text-stone-400 py-10">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            Cargando productos...
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm">No hay productos con este filtro.</p>
            <button
              onClick={abrirNuevo}
              className="mt-4 text-sm text-green-700 hover:underline"
            >
              Crear el primero →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">
                    Producto
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-stone-400 font-medium">
                    Categoría
                  </th>
                  <th className="text-right px-5 py-3 text-xs text-stone-400 font-medium">
                    Precio
                  </th>
                  <th className="text-center px-5 py-3 text-xs text-stone-400 font-medium">
                    Stock
                  </th>
                  <th className="text-center px-5 py-3 text-xs text-stone-400 font-medium">
                    Activo
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                          {producto.imagen_principal ? (
                            <Image
                              src={producto.imagen_principal}
                              alt={producto.nombre}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Leaf className="w-5 h-5 text-stone-200" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 truncate max-w-[180px]">
                            {producto.nombre}
                          </p>
                          <p className="text-xs text-stone-400">{producto.marca}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 capitalize">
                      {producto.categoria_nombre}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold text-stone-800">
                        ${producto.precio_final}
                      </span>
                      {producto.tiene_oferta && (
                        <span className="block text-xs text-stone-400 line-through">
                          ${producto.precio}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">{stockBadge(producto.stock)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleToggle(producto.id)}
                        disabled={toggling === producto.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                          producto.activo ? 'bg-green-500' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            producto.activo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => abrirEditar(producto.id)}
                          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <Link
                          href={`/tienda/${producto.categoria_slug}/${producto.slug}`}
                          target="_blank"
                          className="text-xs text-stone-400 hover:text-green-700 transition-colors"
                        >
                          Ver →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {access && (
        <ProductoDrawer
          open={drawerOpen}
          productoId={drawerProductoId}
          token={access}
          onClose={() => setDrawerOpen(false)}
          onSaved={handleDrawerSaved}
        />
      )}
    </>
  )
}
