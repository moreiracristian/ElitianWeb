import Image from 'next/image'
import Link from 'next/link'
import { Leaf, Recycle, Heart, Target, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const metadata = {
  title: 'Conocénos | Elitian',
  description: 'Somos Eliana y Cristian. Descubrí nuestra historia, misión y valores detrás de Elitian.',
}

const VALORES: { Icono: LucideIcon; titulo: string; texto: string; bg: string; accent: string; textAccent: string }[] = [
  {
    Icono: Leaf,
    titulo: 'Autenticidad',
    texto: 'Cada producto que elegimos refleja genuinamente quiénes somos y en qué creemos.',
    bg: 'bg-green-50',
    accent: 'bg-green-200',
    textAccent: 'text-green-800',
  },
  {
    Icono: Recycle,
    titulo: 'Responsabilidad',
    texto: 'Tomamos decisiones conscientes para reducir nuestro impacto en el planeta.',
    bg: 'bg-[#f0fbfb]',
    accent: 'bg-green-300',
    textAccent: 'text-green-700',
  },
  {
    Icono: Heart,
    titulo: 'Compromiso',
    texto: 'Nos comprometemos con tu bienestar y con el cuidado de nuestro hogar común.',
    bg: 'bg-[#fdf9f4]',
    accent: 'bg-[#e9d8c0]',
    textAccent: 'text-[#6b4f2a]',
  },
  {
    Icono: Heart,
    titulo: 'Amor',
    texto: 'Este proyecto nació del amor — entre nosotros y hacia el mundo que habitamos.',
    bg: 'bg-green-100',
    accent: 'bg-green-500',
    textAccent: 'text-green-900',
  },
]

export default function ConocenosPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-green-800 text-white">
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-green-700 opacity-40" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-green-900 opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-700 opacity-10" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-700 text-green-200 text-xs font-semibold uppercase tracking-widest mb-6">
            Nuestra historia
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
            Conocénos
          </h1>
          <p className="text-green-200 text-lg max-w-xl mx-auto leading-relaxed">
            Un proyecto nacido del amor, la conciencia ambiental y el deseo de cuidarte de manera natural.
          </p>

          {/* Stat chips */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { valor: '100%', label: 'Natural' },
              { valor: 'Local', label: 'Emprendedores' },
            ].map(({ valor, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center">
                <p className="text-xl font-bold text-white">{valor}</p>
                <p className="text-green-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center">
              <div className="flex justify-center mb-0.5"><Recycle className="w-5 h-5 text-white" /></div>
              <p className="text-green-200 text-xs">Reciclamos</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-24">

        {/* ── Historia ─────────────────────────────────────────────────── */}
        <section className="grid md:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-green-600 text-sm font-semibold">
              <span className="w-8 h-px bg-green-400 block" />
              Quiénes somos
            </div>
            <h2 className="text-4xl font-bold text-stone-800 leading-tight">
              ¡Hola! Somos<br />
              <span className="text-green-600">Eliana y Cristian</span>
            </h2>
            <p className="text-stone-500 leading-relaxed text-base">
              Unimos nuestro amor y emprendimos juntos este proyecto. Nació del deseo de tomar mayor
              conciencia sobre nuestro medio ambiente y del deseo de cuidar tu piel de manera natural.
            </p>
            <p className="text-stone-500 leading-relaxed text-base">
              Ofrecemos productos de higiene y cosmética natural, pensados y elegidos cuidando nuestro
              hogar compartido: el planeta, y a vos.
            </p>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors text-sm"
            >
              Explorar productos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              {/* Círculo decorativo externo */}
              <div className="absolute -inset-4 rounded-full bg-green-100 opacity-60" />
              <div className="absolute -inset-8 rounded-full bg-[#e9d8c0] opacity-30" />
              {/* Logo */}
              <div className="relative bg-white rounded-full w-64 h-64 flex items-center justify-center shadow-xl shadow-green-100 border-4 border-green-200">
                <Image
                  src="/logo.png"
                  alt="Logo Elitian"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Misión y Visión ──────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-green-600 text-sm font-semibold mb-3">
              <span className="w-8 h-px bg-green-400 block" />
              Lo que nos mueve
              <span className="w-8 h-px bg-green-400 block" />
            </div>
            <h2 className="text-3xl font-bold text-stone-800">Misión y visión</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Misión */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-800 to-green-700 rounded-3xl p-8 text-white">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-green-600 opacity-40 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Misión</h3>
                <p className="text-green-100 leading-relaxed text-sm">
                  En Elitian nos comprometemos a contribuir nuestro granito de arena ofreciendo opciones
                  amigables y sostenibles. Nuestra propuesta es brindarte productos que nutran tu piel
                  con ingredientes naturales.
                </p>
              </div>
            </div>

            {/* Visión */}
            <div className="group relative overflow-hidden bg-[#e9d8c0] rounded-3xl p-8">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#d9c2a0] opacity-60 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className="w-14 h-14 bg-white/70 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-stone-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-3">Visión</h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  Visualizamos un mundo donde el cuidado personal se mezcla de manera equilibrada con el
                  respeto por la Tierra. Aspiramos a ser parte de tu rutina diaria, ofreciéndote productos
                  que reflejen una belleza consciente y respetuosa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Valores ──────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-green-600 text-sm font-semibold mb-3">
              <span className="w-8 h-px bg-green-400 block" />
              En qué creemos
              <span className="w-8 h-px bg-green-400 block" />
            </div>
            <h2 className="text-3xl font-bold text-stone-800 mb-3">Nuestros valores</h2>
            <p className="text-stone-400 max-w-md mx-auto text-sm leading-relaxed">
              En el corazón de Elitian están la autenticidad, la responsabilidad, el compromiso y el amor sobre todo.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {VALORES.map(({ Icono, titulo, texto, bg, accent, textAccent }) => (
              <div
                key={titulo}
                className={`${bg} rounded-3xl p-6 text-center flex flex-col items-center hover:-translate-y-1 transition-transform duration-300`}
              >
                <div className={`w-16 h-16 ${accent} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icono className={`w-8 h-8 ${textAccent}`} />
                </div>
                <h4 className={`font-bold text-base mb-2 ${textAccent}`}>{titulo}</h4>
                <p className="text-stone-500 text-xs leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Línea de tiempo / proceso ────────────────────────────────── */}
        <section className="grid md:grid-cols-3 gap-6 text-center">
          {[
            {
              num: '01',
              titulo: 'Elegimos con cuidado',
              desc: 'Seleccionamos cada producto evaluando sus ingredientes, origen y packaging sostenible.',
              color: 'bg-green-100 text-green-700',
            },
            {
              num: '02',
              titulo: 'Apoyamos lo local',
              desc: 'Trabajamos con emprendedores que comparten nuestra visión de consumo consciente.',
              color: 'bg-[#d2f1f1] text-green-800',
            },
            {
              num: '03',
              titulo: 'Cuidamos el planeta',
              desc: 'Recibimos envases usados y promovemos el reciclaje en cada compra.',
              color: 'bg-[#f7efe2] text-[#6b4f2a]',
            },
          ].map(({ num, titulo, desc, color }) => (
            <div key={num} className="flex flex-col items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${color}`}>
                {num}
              </div>
              <h4 className="font-bold text-stone-800">{titulo}</h4>
              <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        {/* ── CTA reciclaje ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl">
          {/* Fondo con gradiente cálido */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#a1dcdc] via-[#9adec5] to-green-300" />
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/20" />
          <div className="absolute -bottom-14 -left-10 w-64 h-64 rounded-full bg-white/10" />

          <div className="relative px-8 py-14 text-center">
            <div className="flex justify-center mb-5"><Recycle className="w-12 h-12 text-green-700" /></div>
            <h3 className="text-2xl font-bold text-green-900 mb-3">Cuidamos el planeta juntos</h3>
            <p className="text-green-800 max-w-md mx-auto mb-7 leading-relaxed text-sm">
              Recibimos los envases de los productos que vendemos.
              Cada gesto cuenta y hace la diferencia.
            </p>
            <Link
              href="/recicla"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors text-sm shadow-lg shadow-green-900/20"
            >
              Más sobre reciclaje
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}
