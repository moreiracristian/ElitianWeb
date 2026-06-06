'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function FiltroOrden() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleOrden = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('ordering', e.target.value)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      defaultValue={searchParams.get('ordering') ?? 'nombre'}
      onChange={handleOrden}
      className="text-sm border border-stone-300 rounded-lg px-3 py-2 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="nombre">Nombre A–Z</option>
      <option value="-nombre">Nombre Z–A</option>
      <option value="precio">Menor precio</option>
      <option value="-precio">Mayor precio</option>
      <option value="-creado">Más nuevos</option>
      <option value="-calificacion_promedio">Mejor calificados</option>
    </select>
  )
}
