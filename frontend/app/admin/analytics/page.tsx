'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import {
  getAnalytics,
  type AnalyticsData,
  type VentaDia,
  type TopProducto,
  type VentaCategoria,
  type MetodoPago,
  type StockRiesgo,
} from '@/lib/api'

const METODO_LABELS: Record<string, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pesos(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

function llenarDias(datos: VentaDia[]): VentaDia[] {
  const mapa: Record<string, VentaDia> = {}
  datos.forEach((d) => { mapa[d.fecha] = d })

  const result: VentaDia[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const fecha = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
    result.push(mapa[fecha] ?? { fecha, total: 0, cantidad: 0 })
  }
  return result
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  badge,
}: {
  label: string
  value: string
  sub?: string
  badge?: { texto: string; color: string }
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-stone-800">{value}</p>
        {badge && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mb-0.5 ${badge.color}`}>
            {badge.texto}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}

function GraficoDiario({ datos }: { datos: VentaDia[] }) {
  const dias = llenarDias(datos)
  const maxTotal = Math.max(...dias.map((d) => d.total), 1)

  return (
    <div>
      <div className="flex items-end gap-px h-28">
        {dias.map((d) => (
          <div
            key={d.fecha}
            className="relative flex-1"
            style={{ height: '100%' }}
            title={
              d.total > 0
                ? `${d.fecha.slice(5)}: ${pesos(d.total)} (${d.cantidad} orden${d.cantidad !== 1 ? 'es' : ''})`
                : d.fecha.slice(5)
            }
          >
            <div
              className="absolute bottom-0 w-full rounded-t-sm"
              style={{
                height: `${d.total > 0 ? Math.max((d.total / maxTotal) * 100, 5) : 2}%`,
                backgroundColor: d.total > 0 ? '#52a6b2' : '#e9d8c0',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-stone-400">
        <span>{dias[0]?.fecha.slice(5)}</span>
        <span>Hoy</span>
      </div>
    </div>
  )
}

function BarrasPorcentaje({
  items,
  labelKey,
  valueKey,
  formatValue,
}: {
  items: Record<string, unknown>[]
  labelKey: string
  valueKey: string
  formatValue: (v: number) => string
}) {
  const maxVal = Math.max(...items.map((i) => i[valueKey] as number), 1)

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const val = item[valueKey] as number
        const pct = (val / maxVal) * 100
        return (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-stone-600 truncate max-w-[60%]">{item[labelKey] as string}</span>
              <span className="font-semibold text-stone-800">{formatValue(val)}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TablaTopProductos({ productos }: { productos: TopProducto[] }) {
  if (productos.length === 0) {
    return <p className="text-sm text-stone-400 text-center py-6">Sin ventas en los últimos 30 días</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left text-xs text-stone-400 font-medium pb-2">Producto</th>
            <th className="text-right text-xs text-stone-400 font-medium pb-2">Uds.</th>
            <th className="text-right text-xs text-stone-400 font-medium pb-2">Ingresos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {productos.map((p) => (
            <tr key={p.slug} className="hover:bg-stone-50 transition-colors">
              <td className="py-2 pr-3">
                <Link
                  href={`/tienda/${p.categoria_slug}/${p.slug}`}
                  target="_blank"
                  className="text-stone-700 hover:text-green-700 line-clamp-1"
                >
                  {p.nombre}
                </Link>
              </td>
              <td className="py-2 text-right font-medium text-stone-700">{p.unidades}</td>
              <td className="py-2 text-right font-semibold text-green-700">{pesos(p.ingresos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaStockRiesgo({ items }: { items: StockRiesgo[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-stone-400 text-center py-6">No hay productos con stock crítico</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left text-xs text-stone-400 font-medium pb-2">Producto</th>
            <th className="text-right text-xs text-stone-400 font-medium pb-2">Stock</th>
            <th className="text-right text-xs text-stone-400 font-medium pb-2">Vendidos 30d</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {items.map((p) => (
            <tr key={p.slug} className="hover:bg-stone-50 transition-colors">
              <td className="py-2 pr-3">
                <Link
                  href={`/admin/productos`}
                  className="text-stone-700 hover:text-green-700 line-clamp-1"
                >
                  {p.nombre}
                </Link>
              </td>
              <td className="py-2 text-right">
                <span
                  className={`font-bold ${
                    p.stock === 0 ? 'text-red-600' : p.stock <= 2 ? 'text-orange-500' : 'text-yellow-600'
                  }`}
                >
                  {p.stock === 0 ? 'Agotado' : p.stock}
                </span>
              </td>
              <td className="py-2 text-right font-medium text-stone-600">{p.vendidos_30_dias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { access } = useAuthStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!access) return
    getAnalytics(access)
      .then(setData)
      .catch(() => setError(true))
  }, [access])

  if (error) {
    return (
      <div className="p-10 text-red-500 text-sm">
        Error al cargar los datos. Intentá recargar la página.
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-10 flex items-center gap-3 text-stone-400">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        Cargando analytics...
      </div>
    )
  }

  const { comparativa: cmp, ventas_diarias, top_productos, por_categoria, metodos_pago, stock_en_riesgo } = data

  const varBadge = cmp.variacion_pct !== null
    ? {
        texto: `${cmp.variacion_pct >= 0 ? '↑' : '↓'} ${Math.abs(cmp.variacion_pct)}%`,
        color: cmp.variacion_pct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
      }
    : { texto: 'Primer mes', color: 'bg-stone-100 text-stone-500' }

  const metodosMapeados: (MetodoPago & { label: string })[] = metodos_pago.map((m) => ({
    ...m,
    label: METODO_LABELS[m.metodo_pago] ?? m.metodo_pago,
  }))

  const categoriasMapeadas = por_categoria.map((c: VentaCategoria) => ({ ...c }))

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Analytics de ventas</h1>
      <p className="text-sm text-stone-400 mb-8">Últimos 30 días · solo pedidos confirmados, enviados y entregados</p>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Ventas este mes"
          value={pesos(cmp.ventas_mes_actual)}
          sub={`Mes anterior: ${pesos(cmp.ventas_mes_anterior)}`}
          badge={varBadge}
        />
        <KPICard
          label="Órdenes este mes"
          value={String(cmp.ordenes_mes_actual)}
          sub={`Mes anterior: ${cmp.ordenes_mes_anterior}`}
        />
        <KPICard
          label="Ticket promedio"
          value={pesos(cmp.ticket_promedio)}
          sub="Mes actual"
        />
        <KPICard
          label="Productos vendidos"
          value={String(top_productos.reduce((s, p) => s + p.unidades, 0))}
          sub="Últimos 30 días"
        />
      </div>

      {/* ── Gráfico diario ── */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-800 mb-4">
          Ventas diarias — últimos 30 días
        </h2>
        {ventas_diarias.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">Sin ventas en el período</p>
        ) : (
          <GraficoDiario datos={ventas_diarias} />
        )}
      </div>

      {/* ── Top productos + Categorías ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 mb-4">Top 10 productos</h2>
          <TablaTopProductos productos={top_productos} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 mb-4">Ventas por categoría</h2>
          {categoriasMapeadas.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">Sin datos</p>
          ) : (
            <BarrasPorcentaje
              items={categoriasMapeadas as unknown as Record<string, unknown>[]}
              labelKey="nombre"
              valueKey="total"
              formatValue={pesos}
            />
          )}
        </div>
      </div>

      {/* ── Métodos de pago + Stock en riesgo ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 mb-4">Métodos de pago</h2>
          {metodosMapeados.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">Sin datos</p>
          ) : (
            <BarrasPorcentaje
              items={metodosMapeados as unknown as Record<string, unknown>[]}
              labelKey="label"
              valueKey="cantidad"
              formatValue={(v) => `${v} orden${v !== 1 ? 'es' : ''}`}
            />
          )}
          {metodosMapeados.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-1">
              {metodosMapeados.map((m) => (
                <div key={m.metodo_pago} className="flex justify-between text-xs text-stone-500">
                  <span>{m.label}</span>
                  <span className="font-medium text-stone-700">{pesos(m.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 mb-1">Stock en riesgo</h2>
          <p className="text-xs text-stone-400 mb-4">Productos activos con stock ≤ 5</p>
          <TablaStockRiesgo items={stock_en_riesgo} />
          {stock_en_riesgo.length > 0 && (
            <div className="mt-4">
              <Link
                href="/admin/productos"
                className="text-xs text-green-700 hover:text-green-800 font-medium"
              >
                Ver todos los productos →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
