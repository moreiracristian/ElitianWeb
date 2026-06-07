'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCarritoStore } from '@/store/carrito'
import { useAuthStore } from '@/store/auth'
import type { Categoria } from '@/lib/types'
import { Home, Leaf, ShoppingBag, Recycle, FileText, Mail, Package, Settings, LogOut } from 'lucide-react'

interface Props {
  categorias: Categoria[]
}

export default function NavbarClient({ categorias }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [tiendaAbierta, setTiendaAbierta] = useState(false)
  const [usuarioAbierto, setUsuarioAbierto] = useState(false)
  const usuarioRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const cantidadItems = useCarritoStore((s) => s.cantidadTotal())
  const fetchCarrito = useCarritoStore((s) => s.fetchCarrito)
  const { usuario, estaAutenticado, logout } = useAuthStore()

  useEffect(() => { fetchCarrito() }, [fetchCarrito])

  useEffect(() => {
    setMenuAbierto(false)
    setTiendaAbierta(false)
    setUsuarioAbierto(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAbierto])

  // Cerrar dropdown usuario al click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (usuarioRef.current && !usuarioRef.current.contains(e.target as Node)) {
        setUsuarioAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    useCarritoStore.setState({ carrito: null })
    router.push('/')
  }

  const autenticado = estaAutenticado()

  return (
    <div className="flex items-center gap-2">

      {/* Botón carrito */}
      <Link
        href="/carrito"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-stone-100 transition-colors"
        aria-label="Ver carrito"
      >
        <Image src="/cart.svg" alt="Carrito" width={20} height={20} className="opacity-70" />
        {cantidadItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cantidadItems > 99 ? '99+' : cantidadItems}
          </span>
        )}
      </Link>

      {/* Menú usuario — solo desktop */}
      {autenticado ? (
        <div className="relative hidden md:block" ref={usuarioRef}>
          <button
            onClick={() => setUsuarioAbierto((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700"
          >
            <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-xs">
              {usuario?.first_name?.[0]?.toUpperCase() ?? usuario?.username?.[0]?.toUpperCase() ?? 'U'}
            </span>
            <span className="max-w-25 truncate">
              {usuario?.first_name || usuario?.username}
            </span>
            <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform ${usuarioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {usuarioAbierto && (
            <div className="absolute top-full right-0 pt-2 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-2 min-w-45">
                {usuario?.is_staff && (
                  <>
                    <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-green-700 font-medium hover:bg-green-50 transition-colors">
                      <Settings className="w-4 h-4" /> Panel admin
                    </Link>
                    <div className="my-1 border-t border-stone-100" />
                  </>
                )}
                <Link href="/cuenta/ordenes" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                  <Package className="w-4 h-4" /> Mis pedidos
                </Link>
                <div className="my-1 border-t border-stone-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/cuenta/login"
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
        >
          Ingresar
        </Link>
      )}

      {/* Botón hamburguesa — solo mobile */}
      <button
        onClick={() => setMenuAbierto((v) => !v)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-stone-100 transition-colors"
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
      >
        <span className="flex flex-col gap-1.25 w-5">
          <span className={`block h-0.5 bg-stone-700 rounded transition-all duration-200 origin-center ${menuAbierto ? 'rotate-45 translate-y-1.75' : ''}`} />
          <span className={`block h-0.5 bg-stone-700 rounded transition-all duration-200 ${menuAbierto ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-0.5 bg-stone-700 rounded transition-all duration-200 origin-center ${menuAbierto ? '-rotate-45 -translate-y-1.75' : ''}`} />
        </span>
      </button>

      {/* Overlay mobile */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Drawer mobile */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${menuAbierto ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-stone-100">
          <Image src="/logo.png" alt="Elitian" width={90} height={30} className="h-7 w-auto" />
          <button onClick={() => setMenuAbierto(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100">
            <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Usuario mobile */}
        {autenticado && usuario && (
          <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-semibold text-sm">
              {usuario.first_name?.[0]?.toUpperCase() ?? usuario.username[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{usuario.first_name || usuario.username}</p>
              <p className="text-xs text-stone-500 truncate">{usuario.email}</p>
            </div>
          </div>
        )}

        {/* Links del drawer */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm font-medium text-stone-700">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors">
            <Home className="w-4 h-4 text-stone-500" /> Inicio
          </Link>
          <Link href="/conocenos" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors">
            <Leaf className="w-4 h-4 text-stone-500" /> Conocénos
          </Link>

          {/* Tienda accordion */}
          <div>
            <button
              onClick={() => setTiendaAbierta((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-stone-500" /> Tienda</span>
              <svg className={`w-4 h-4 text-stone-400 transition-transform ${tiendaAbierta ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {tiendaAbierta && (
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-green-100 pl-3">
                <Link href="/tienda" className="flex items-center px-3 py-2.5 rounded-lg text-green-700 font-semibold hover:bg-green-50 text-sm transition-colors">
                  Ver todo
                </Link>
                {categorias.map((cat) => (
                  <Link key={cat.id} href={`/tienda/${cat.slug}`} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-50 text-sm transition-colors">
                    <span className="text-green-500 text-xs">›</span>
                    {cat.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/recicla" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors">
            <Recycle className="w-4 h-4 text-stone-500" /> Reciclá
          </Link>
          <Link href="/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors">
            <FileText className="w-4 h-4 text-stone-500" /> Blog
          </Link>
          <Link href="/contacto" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors">
            <Mail className="w-4 h-4 text-stone-500" /> Contacto
          </Link>
          {autenticado && (
            <Link href="/cuenta/ordenes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors">
              <Package className="w-4 h-4 text-stone-500" /> Mis pedidos
            </Link>
          )}
          {usuario?.is_staff && (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-green-700 font-medium transition-colors">
              <Settings className="w-4 h-4" /> Panel admin
            </Link>
          )}
        </nav>

        {/* Footer del drawer */}
        <div className="px-5 py-4 border-t border-stone-100 space-y-2">
          <Link
            href="/carrito"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-700 text-white font-semibold text-sm hover:bg-green-800 transition-colors"
          >
            <Image src="/cart.svg" alt="" width={16} height={16} className="brightness-0 invert" />
            Carrito
            {cantidadItems > 0 && (
              <span className="bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cantidadItems}
              </span>
            )}
          </Link>
          {autenticado ? (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-colors"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/cuenta/login"
              className="block text-center w-full py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
