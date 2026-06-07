import Link from 'next/link'
import Image from 'next/image'
import { CreditCard, Truck, Banknote, Smartphone, MapPin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      {/* Banda de beneficios */}
      <div className="bg-green-800 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-center gap-x-8 gap-y-1 text-center">
          <span className="inline-flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> 3 cuotas sin interés</span>
          <span className="inline-flex items-center gap-1.5"><Truck className="w-4 h-4" /> Envíos gratis +$10.000 (Resistencia)</span>
          <span className="inline-flex items-center gap-1.5"><Banknote className="w-4 h-4" /> 20% OFF efectivo / transferencia</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Logo + descripción */}
        <div className="lg:col-span-1">
          <Link href="/">
            <Image src="/logo-w.png" alt="Elitian" width={120} height={40} className="h-10 w-auto mb-4" />
          </Link>
          <p className="text-sm leading-relaxed text-stone-400">
            Tienda de productos naturales y ecológicos para el cuidado personal.
            Consumo consciente, bienestar real.
          </p>
          {/* Redes */}
          <div className="flex gap-3 mt-5">
            <a href="https://instagram.com/tienda.elitian" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-green-700 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://wa.me/+5493624135017" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-green-700 transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Navegación</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/conocenos', label: 'Conocénos' },
              { href: '/tienda', label: 'Tienda' },
              { href: '/recicla', label: 'Reciclá' },
              { href: '/blog', label: 'Blog' },
              { href: '/contacto', label: 'Contacto' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-green-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mi cuenta */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Mi cuenta</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/cuenta/login', label: 'Iniciar sesión' },
              { href: '/cuenta/registro', label: 'Registrarme' },
              { href: '/cuenta/ordenes', label: 'Mis pedidos' },
              { href: '/carrito', label: 'Mi carrito' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-green-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Contacto</h3>
          <ul className="space-y-3 text-sm text-stone-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-stone-500" />
              <span>Resistencia, Chaco, Argentina</span>
            </li>
            <li className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 shrink-0 text-stone-500" />
              <a href="https://wa.me/+5493624135017" className="hover:text-green-400 transition-colors">
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-stone-500" />
              <a href="mailto:hola@elitian.com.ar" className="hover:text-green-400 transition-colors">
                hola@elitian.com.ar
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-stone-800 py-5 px-4 text-center text-xs text-stone-500 space-y-1">
        <p>© {new Date().getFullYear()} Elitian. Todos los derechos reservados.</p>
        <p>
          Desarrollado por{' '}
          <span className="text-stone-400 font-medium">2moreit</span>
          {' '}en colaboración con{' '}
          <span className="text-stone-400 font-medium">Elitian</span>
        </p>
      </div>
    </footer>
  )
}
