'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useCarritoStore } from '@/store/carrito'

interface Errores {
  username?: string
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  terminos?: string
  general?: string
}

export default function RegistroPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  })
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [cargando, setCargando] = useState(false)
  const { registro, estaAutenticado } = useAuthStore()
  const fetchCarrito = useCarritoStore((s) => s.fetchCarrito)
  const router = useRouter()

  useEffect(() => {
    if (estaAutenticado()) router.replace('/')
  }, [estaAutenticado, router])

  function validar(): boolean {
    const e: Errores = {}
    if (!form.first_name.trim()) e.first_name = 'El nombre es requerido.'
    if (!form.username.trim()) e.username = 'El usuario es requerido.'
    if (!form.email.trim()) e.email = 'El email es requerido.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido.'
    if (!form.password) e.password = 'La contraseña es requerida.'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.'
    else if (form.password !== form.password2) e.password = 'Las contraseñas no coinciden.'
    if (!aceptaTerminos) e.terminos = 'Debés aceptar los términos y condiciones para continuar.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setCargando(true)
    setErrores({})
    try {
      await registro({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      })
      await fetchCarrito()
      router.replace('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        try {
          const data = JSON.parse(err.message)
          setErrores(data)
        } catch {
          setErrores({ general: err.message })
        }
      }
    } finally {
      setCargando(false)
    }
  }

  const campo = (
    id: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = '',
    autoComplete = '',
  ) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={form[id]}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow ${
          errores[id as keyof Errores] ? 'border-red-400 bg-red-50' : 'border-stone-300'
        }`}
      />
      {errores[id as keyof Errores] && (
        <p className="mt-1 text-xs text-red-500">{errores[id as keyof Errores]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="Elitian" width={130} height={44} className="h-11 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm px-8 py-10">
          <h1 className="text-2xl font-semibold text-stone-800 text-center mb-1">Crear cuenta</h1>
          <p className="text-stone-500 text-sm text-center mb-8">Unite a la comunidad Elitian</p>

          {errores.general && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errores.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {campo('first_name', 'Nombre', 'text', 'Juan', 'given-name')}
              {campo('last_name', 'Apellido', 'text', 'García', 'family-name')}
            </div>
            {campo('username', 'Nombre de usuario', 'text', 'juan.garcia', 'username')}
            {campo('email', 'Email', 'email', 'juan@email.com', 'email')}
            {campo('password', 'Contraseña', 'password', '••••••••', 'new-password')}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Repetir contraseña
              </label>
              <input
                type="password"
                value={form.password2}
                onChange={(e) => setForm({ ...form, password2: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow ${
                  errores.password ? 'border-red-400 bg-red-50' : 'border-stone-300'
                }`}
              />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => {
                    setAceptaTerminos(e.target.checked)
                    if (e.target.checked) setErrores((prev) => ({ ...prev, terminos: undefined }))
                  }}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-green-700 cursor-pointer"
                />
                <span className="text-sm text-stone-600 leading-relaxed">
                  Leí y acepto los{' '}
                  <Link
                    href="/terminos"
                    target="_blank"
                    className="text-green-700 font-medium hover:underline"
                  >
                    Términos y Condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link
                    href="/terminos#privacidad"
                    target="_blank"
                    className="text-green-700 font-medium hover:underline"
                  >
                    Política de Privacidad
                  </Link>
                  {' '}de Elitian.
                </span>
              </label>
              {errores.terminos && (
                <p className="mt-1.5 text-xs text-red-500">{errores.terminos}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/cuenta/login" className="text-green-700 font-semibold hover:text-green-800">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}
