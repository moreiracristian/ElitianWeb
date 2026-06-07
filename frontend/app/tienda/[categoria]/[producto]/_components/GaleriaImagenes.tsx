'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import type { ProductoImagen } from '@/lib/types'

interface Props {
  imagenes: ProductoImagen[]
  nombre: string
}

export default function GaleriaImagenes({ imagenes, nombre }: Props) {
  const [activa, setActiva] = useState(0)

  if (imagenes.length === 0) {
    return (
      <div className="aspect-square bg-stone-100 rounded-2xl flex items-center justify-center">
        <Leaf className="w-16 h-16 text-stone-200" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50">
        <Image
          src={imagenes[activa].imagen}
          alt={nombre}
          fill
          className="object-cover"
          priority
        />
      </div>
      {imagenes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiva(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activa ? 'border-green-600' : 'border-transparent hover:border-stone-300'
              }`}
            >
              <Image src={img.imagen} alt={`${nombre} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
