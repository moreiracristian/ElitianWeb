'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <svg className="w-14 h-14 text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Algo salió mal</h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        Ocurrió un error inesperado. Podés intentarlo de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors text-sm"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
