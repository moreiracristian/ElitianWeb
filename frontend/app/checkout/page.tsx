'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCarritoStore } from '@/store/carrito'
import { useAuthStore } from '@/store/auth'
import { crearOrden, crearPreferenciaMP } from '@/lib/api'
import { Landmark, Banknote, CreditCard, ShoppingCart, Leaf } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const METODOS_PAGO: { id: string; label: string; desc: string; Icon: LucideIcon }[] = [
  { id: 'transferencia', label: 'Transferencia bancaria', desc: '20% OFF — Te enviamos el CBU por WhatsApp', Icon: Landmark },
  { id: 'efectivo', label: 'Efectivo al retirar', desc: '20% OFF — Coordinamos punto de entrega', Icon: Banknote },
  { id: 'tarjeta', label: 'Pago online con MercadoPago', desc: 'Tarjeta de crédito, débito o dinero en cuenta MP', Icon: CreditCard },
]

export default function CheckoutPage() {
  const [notas, setNotas] = useState('')
  const [metodoPago, setMetodoPago] = useState('transferencia')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { carrito, fetchCarrito } = useCarritoStore()
  const { estaAutenticado, access, usuario } = useAuthStore()

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/cuenta/login?next=/checkout')
      return
    }
    fetchCarrito()
  }, [estaAutenticado, fetchCarrito, router])

  async function handleConfirmar() {
    if (!access) return
    if (!carrito?.items.length) {
      setError('Tu carrito está vacío.')
      return
    }
    if (!telefono.trim() || !direccion.trim() || !ciudad.trim() || !provincia.trim()) {
      setError('Completá los datos de envío para continuar.')
      return
    }
    setCargando(true)
    setError('')
    try {
      const orden = await crearOrden(access, metodoPago, notas, {
        telefono, direccion, ciudad, provincia, codigo_postal: codigoPostal,
      })
      useCarritoStore.setState({ carrito: null })

      if (metodoPago === 'tarjeta') {
        const preferencia = await crearPreferenciaMP(orden.id, access)
        const isDev = process.env.NODE_ENV === 'development'
        window.location.href = isDev
          ? preferencia.sandbox_init_point
          : preferencia.init_point
        return
      }

      router.push(`/checkout/exito?orden=${orden.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error. Intentá de nuevo.')
      setCargando(false)
    }
  }

  if (!carrito) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Cargando tu pedido...</p>
      </div>
    )
  }

  if (carrito.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-stone-300" />
        <h1 className="text-xl font-semibold text-stone-800 mb-3">Tu carrito está vacío</h1>
        <Link href="/tienda" className="inline-block px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors">
          Ir a la tienda
        </Link>
      </div>
    )
  }

  const metodoSeleccionado = METODOS_PAGO.find((m) => m.id === metodoPago)!

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-stone-800 mb-2">Finalizar compra</h1>
      <p className="text-stone-500 text-sm mb-8">
        Revisá tu pedido y elegí cómo pagarlo. Te contactamos por WhatsApp para coordinar.
      </p>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── Columna izquierda ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Datos del comprador */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">1</span>
              Tus datos
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-stone-50 rounded-xl px-4 py-3">
                <p className="text-stone-400 text-xs mb-0.5">Nombre</p>
                <p className="font-medium text-stone-800">
                  {usuario?.first_name} {usuario?.last_name}
                </p>
              </div>
              <div className="bg-stone-50 rounded-xl px-4 py-3">
                <p className="text-stone-400 text-xs mb-0.5">Email</p>
                <p className="font-medium text-stone-800 truncate">{usuario?.email}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-400">
              ¿Datos incorrectos?{' '}
              <Link href="/cuenta/perfil" className="text-green-700 hover:underline">
                Editá tu perfil
              </Link>
            </p>
          </div>

          {/* Datos de envío */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">2</span>
              Datos de envío
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-stone-500 mb-1">Dirección <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle y número"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Ciudad <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Resistencia"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Provincia <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  placeholder="Chaco"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Código postal</label>
                <input
                  type="text"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  placeholder="3500"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Teléfono <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+54 362 4..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">3</span>
              Método de pago
            </h2>
            <div className="space-y-3">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    metodoPago === m.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value={m.id}
                    checked={metodoPago === m.id}
                    onChange={() => setMetodoPago(m.id)}
                    className="mt-1 accent-green-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm flex items-center gap-2">
                      <m.Icon className="w-4 h-4 text-stone-500 shrink-0" /> {m.label}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">{m.desc}</p>
                  </div>
                  {metodoPago === m.id && (m.id === 'transferencia' || m.id === 'efectivo') && (
                    <span className="flex-shrink-0 text-xs bg-green-600 text-white font-semibold px-2 py-0.5 rounded-full">
                      20% OFF
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">4</span>
              Notas adicionales <span className="text-stone-400 font-normal text-sm">(opcional)</span>
            </h2>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Entregar en horario de tarde, alérgica a ciertos ingredientes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* ── Columna derecha — Resumen ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24 space-y-5">
            <h2 className="font-semibold text-stone-800">Resumen del pedido</h2>

            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {carrito.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-stone-50">
                    {item.producto.imagen_principal ? (
                      <Image src={item.producto.imagen_principal} alt={item.producto.nombre} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Leaf className="w-6 h-6 text-stone-200" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 line-clamp-1">{item.producto.nombre}</p>
                    <p className="text-xs text-stone-400">x{item.cantidad}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-700 flex-shrink-0">${item.subtotal}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal ({carrito.cantidad_items} {carrito.cantidad_items === 1 ? 'producto' : 'productos'})</span>
                <span>${carrito.total}</span>
              </div>

              {(metodoPago === 'transferencia' || metodoPago === 'efectivo') && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Descuento 20% OFF</span>
                  <span>- ${(Number(carrito.total) * 0.2).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500">
                <span>Envío</span>
                <span className="text-green-600 font-medium">A calcular</span>
              </div>

              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-800 text-base">
                <span>Total estimado</span>
                <span>
                  ${(metodoPago === 'transferencia' || metodoPago === 'efectivo')
                    ? (Number(carrito.total) * 0.8).toFixed(2)
                    : carrito.total}
                </span>
              </div>
            </div>

            {/* Método seleccionado */}
            <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 flex items-center gap-2">
              <metodoSeleccionado.Icon className="w-4 h-4 text-stone-500 shrink-0" />
              <span>{metodoSeleccionado.label}</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmar}
              disabled={cargando}
              className="w-full py-4 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirmando...
                </span>
              ) : (
                'Confirmar pedido'
              )}
            </button>

            <p className="text-center text-xs text-stone-400 leading-relaxed">
              Al confirmar te contactamos por WhatsApp para coordinar el pago y envío.
            </p>

            <Link href="/carrito" className="block text-center text-sm text-stone-400 hover:text-stone-600 transition-colors">
              ← Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
