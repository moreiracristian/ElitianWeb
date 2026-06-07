import type {
  Categoria,
  ProductoList,
  ProductoDetail,
  ProductoImagen,
  Resena,
  ResenaAdmin,
  Carrito,
  Orden,
  PaginatedResponse,
  BlogCategoria,
  BlogPost,
  BlogPostDetail,
  ConfiguracionGlobal,
  CategoriaConCosto,
  ConfiguracionCategoriaCosto,
  CostoProducto,
  PromocionBanco,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail ?? 'Error en la API')
  }

  if (res.status === 204) return null as T
  return res.json()
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  const data = await apiFetch<PaginatedResponse<Categoria>>('/categorias/')
  return data.results
}

export async function getCategoria(slug: string): Promise<Categoria> {
  return apiFetch<Categoria>(`/categorias/${slug}/`)
}

// ─── Productos ────────────────────────────────────────────────────────────────

export interface ProductosFiltros {
  categoria?: string
  search?: string
  ordering?: string
  page?: number
  destacado?: boolean
  con_stock?: boolean
  precio_min?: number
  precio_max?: number
}

export async function getProductos(
  filtros: ProductosFiltros = {},
): Promise<PaginatedResponse<ProductoList>> {
  const params = new URLSearchParams()
  if (filtros.categoria) params.set('categoria', filtros.categoria)
  if (filtros.search) params.set('search', filtros.search)
  if (filtros.ordering) params.set('ordering', filtros.ordering)
  if (filtros.page) params.set('page', String(filtros.page))
  if (filtros.destacado) params.set('destacado', 'true')
  if (filtros.con_stock) params.set('con_stock', 'true')
  if (filtros.precio_min) params.set('precio_min', String(filtros.precio_min))
  if (filtros.precio_max) params.set('precio_max', String(filtros.precio_max))

  const query = params.toString()
  return apiFetch<PaginatedResponse<ProductoList>>(`/productos/${query ? `?${query}` : ''}`)
}

export async function getProducto(slug: string): Promise<ProductoDetail> {
  return apiFetch<ProductoDetail>(`/productos/${slug}/`)
}

export async function getProductosRelacionados(slug: string): Promise<ProductoList[]> {
  return apiFetch<ProductoList[]>(`/productos/${slug}/relacionados/`)
}

export async function getMasVendidosCategoria(slug: string): Promise<ProductoList[]> {
  return apiFetch<ProductoList[]>(`/productos/${slug}/mas_vendidos_categoria/`)
}

export async function getResenas(slug: string): Promise<Resena[]> {
  return apiFetch<Resena[]>(`/productos/${slug}/resenas/`)
}

// ─── Carrito ──────────────────────────────────────────────────────────────────

export async function getCarrito(token: string): Promise<Carrito> {
  return apiFetch<Carrito>('/carrito/', {}, token)
}

export async function agregarAlCarrito(
  productoId: number,
  cantidad: number,
  token: string,
): Promise<Carrito> {
  return apiFetch<Carrito>(
    '/carrito/agregar/',
    { method: 'POST', body: JSON.stringify({ producto_id: productoId, cantidad }) },
    token,
  )
}

export async function actualizarCarrito(
  itemId: number,
  cantidad: number,
  token: string,
): Promise<Carrito> {
  return apiFetch<Carrito>(
    '/carrito/actualizar/',
    { method: 'PATCH', body: JSON.stringify({ item_id: itemId, cantidad }) },
    token,
  )
}

export async function eliminarDelCarrito(itemId: number, token: string): Promise<Carrito> {
  return apiFetch<Carrito>(
    '/carrito/eliminar/',
    { method: 'DELETE', body: JSON.stringify({ item_id: itemId }) },
    token,
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access: string
  refresh: string
  user?: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_staff: boolean
  }
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  return apiFetch('/auth/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function registro(data: {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}): Promise<AuthResponse> {
  return apiFetch('/auth/registro/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  return apiFetch('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  })
}

export async function getMe(token: string): Promise<AuthResponse['user']> {
  return apiFetch('/auth/me/', {}, token)
}

export async function updateMe(
  token: string,
  data: { first_name: string; last_name: string; email: string },
): Promise<AuthResponse['user']> {
  return apiFetch('/auth/me/', { method: 'PATCH', body: JSON.stringify(data) }, token)
}

export async function cambiarPassword(
  token: string,
  data: { password_actual: string; password_nueva: string },
): Promise<void> {
  return apiFetch('/auth/cambiar-password/', { method: 'POST', body: JSON.stringify(data) }, token)
}

// ─── Órdenes ─────────────────────────────────────────────────────────────────

export interface DatosEnvio {
  telefono: string
  direccion: string
  ciudad: string
  provincia: string
  codigo_postal: string
}

export async function crearOrden(
  token: string,
  metodo_pago: string,
  notas?: string,
  envio?: DatosEnvio,
): Promise<Orden> {
  return apiFetch<Orden>(
    '/ordenes/crear/',
    { method: 'POST', body: JSON.stringify({ metodo_pago, notas: notas ?? '', ...envio }) },
    token,
  )
}

export async function getOrdenes(token: string): Promise<Orden[]> {
  const data = await apiFetch<PaginatedResponse<Orden>>('/ordenes/', {}, token)
  return data.results
}

export async function getOrden(id: number, token: string): Promise<Orden> {
  return apiFetch<Orden>(`/ordenes/${id}/`, {}, token)
}

export async function crearPreferenciaMP(
  ordenId: number,
  token: string,
): Promise<{ init_point: string; sandbox_init_point: string; preference_id: string }> {
  return apiFetch(
    `/ordenes/${ordenId}/crear_preferencia_mp/`,
    { method: 'POST' },
    token,
  )
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getBlogCategorias(): Promise<BlogCategoria[]> {
  const data = await apiFetch<PaginatedResponse<BlogCategoria>>('/blog/categorias/')
  return data.results
}

export async function getBlogPosts(filtros: { categoria?: string; search?: string; page?: number } = {}): Promise<PaginatedResponse<BlogPost>> {
  const params = new URLSearchParams()
  if (filtros.categoria) params.set('categoria', filtros.categoria)
  if (filtros.search) params.set('search', filtros.search)
  if (filtros.page) params.set('page', String(filtros.page))
  const query = params.toString()
  return apiFetch<PaginatedResponse<BlogPost>>(`/blog/posts/${query ? `?${query}` : ''}`)
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail> {
  return apiFetch<BlogPostDetail>(`/blog/posts/${slug}/`)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  ordenes_total: number
  ordenes_pendientes: number
  ordenes_mes: number
  ventas_total: number
  ventas_mes: number
  productos_total: number
  productos_sin_stock: number
  usuarios_total: number
  estados: { estado: string; cantidad: number }[]
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats/', {}, token)
}

export async function getAdminOrdenes(token: string, estado?: string): Promise<Orden[]> {
  const q = estado ? `?estado=${estado}` : ''
  return apiFetch<Orden[]>(`/admin/ordenes/${q}`, {}, token)
}

export async function updateOrdenEstado(token: string, id: number, estado: string): Promise<Orden> {
  return apiFetch<Orden>(`/admin/ordenes/${id}/estado/`, { method: 'PATCH', body: JSON.stringify({ estado }) }, token)
}

export async function getAdminProductos(token: string, params?: { search?: string; activo?: string }): Promise<ProductoList[]> {
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return apiFetch<ProductoList[]>(`/admin/productos/${q ? `?${q}` : ''}`, {}, token)
}

export async function toggleProductoActivo(token: string, id: number): Promise<{ id: number; activo: boolean }> {
  return apiFetch(`/admin/productos/${id}/toggle/`, { method: 'PATCH' }, token)
}

export async function getProductoAdminDetalle(token: string, id: number): Promise<ProductoDetail> {
  return apiFetch<ProductoDetail>(`/admin/productos/${id}/editar/`, {}, token)
}

export async function crearProductoAdmin(
  token: string,
  data: Record<string, unknown>,
): Promise<ProductoList> {
  return apiFetch<ProductoList>('/admin/productos/crear/', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function editarProductoAdmin(
  token: string,
  id: number,
  data: Record<string, unknown>,
): Promise<ProductoDetail> {
  return apiFetch<ProductoDetail>(`/admin/productos/${id}/editar/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function subirImagenProducto(
  token: string,
  productoId: number,
  file: File,
): Promise<ProductoImagen> {
  const formData = new FormData()
  formData.append('imagen', file)
  const res = await fetch(`${BASE_URL}/admin/productos/${productoId}/imagenes/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Error al subir imagen')
  }
  return res.json()
}

export async function eliminarImagenProducto(token: string, imgId: number): Promise<null> {
  return apiFetch<null>(`/admin/imagenes/${imgId}/eliminar/`, { method: 'DELETE' }, token)
}

export async function setImagenPrincipal(token: string, imgId: number): Promise<ProductoImagen> {
  return apiFetch<ProductoImagen>(`/admin/imagenes/${imgId}/principal/`, { method: 'PATCH' }, token)
}

// ─── Admin Blog ───────────────────────────────────────────────────────────────

export async function getAdminBlogPosts(token: string, search?: string): Promise<BlogPost[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<BlogPost[]>(`/admin/blog/posts/${q}`, {}, token)
}

export async function getAdminBlogPostDetalle(token: string, id: number): Promise<BlogPostDetail> {
  return apiFetch<BlogPostDetail>(`/admin/blog/posts/${id}/editar/`, {}, token)
}

export async function getAdminBlogCategorias(token: string): Promise<BlogCategoria[]> {
  return apiFetch<BlogCategoria[]>('/admin/blog/categorias/', {}, token)
}

async function fetchBlogMultipart<T>(url: string, method: string, token: string, data: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Error en la operación')
  }
  if (res.status === 204) return null as T
  return res.json()
}

export async function crearBlogPost(token: string, data: FormData): Promise<BlogPost> {
  return fetchBlogMultipart<BlogPost>('/admin/blog/posts/crear/', 'POST', token, data)
}

export async function editarBlogPost(token: string, id: number, data: FormData): Promise<BlogPostDetail> {
  return fetchBlogMultipart<BlogPostDetail>(`/admin/blog/posts/${id}/editar/`, 'PATCH', token, data)
}

export async function eliminarBlogPost(token: string, id: number): Promise<null> {
  return apiFetch<null>(`/admin/blog/posts/${id}/eliminar/`, { method: 'DELETE' }, token)
}

// ── Costos ────────────────────────────────────────────────────────────────────

export async function getCostosGlobal(token: string): Promise<ConfiguracionGlobal> {
  return apiFetch<ConfiguracionGlobal>('/admin/costos/global/', {}, token)
}

export async function updateCostosGlobal(token: string, data: Partial<ConfiguracionGlobal>): Promise<ConfiguracionGlobal> {
  return apiFetch<ConfiguracionGlobal>('/admin/costos/global/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function getCostesCategorias(token: string): Promise<CategoriaConCosto[]> {
  return apiFetch<CategoriaConCosto[]>('/admin/costos/categorias/', {}, token)
}

export async function saveCostoCategoria(
  token: string,
  categoriaId: number,
  data: { margen_ganancia: string; iva: string }
): Promise<ConfiguracionCategoriaCosto> {
  return apiFetch<ConfiguracionCategoriaCosto>(`/admin/costos/categorias/${categoriaId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function deleteCostoCategoria(token: string, categoriaId: number): Promise<null> {
  return apiFetch<null>(`/admin/costos/categorias/${categoriaId}/`, { method: 'DELETE' }, token)
}

export async function getCostoProducto(token: string, productoId: number): Promise<CostoProducto | null> {
  return apiFetch<CostoProducto | null>(`/admin/costos/productos/${productoId}/`, {}, token)
}

export async function saveCostoProducto(
  token: string,
  productoId: number,
  data: Partial<CostoProducto>
): Promise<CostoProducto> {
  return apiFetch<CostoProducto>(`/admin/costos/productos/${productoId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function getPromocionBancos(token: string): Promise<PromocionBanco[]> {
  return apiFetch<PromocionBanco[]>('/admin/costos/bancos/', {}, token)
}

export async function crearPromocionBanco(token: string, data: Omit<PromocionBanco, 'id' | 'tipo_display'>): Promise<PromocionBanco> {
  return apiFetch<PromocionBanco>('/admin/costos/bancos/', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function updatePromocionBanco(token: string, id: number, data: Partial<PromocionBanco>): Promise<PromocionBanco> {
  return apiFetch<PromocionBanco>(`/admin/costos/bancos/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function deletePromocionBanco(token: string, id: number): Promise<null> {
  return apiFetch<null>(`/admin/costos/bancos/${id}/`, { method: 'DELETE' }, token)
}

// ─── Reseñas ──────────────────────────────────────────────────────────────────

export async function agregarResena(
  slug: string,
  token: string,
  data: { comentario: string; calificacion: number },
): Promise<Resena> {
  return apiFetch<Resena>(
    `/productos/${slug}/agregar_resena/`,
    { method: 'POST', body: JSON.stringify(data) },
    token,
  )
}

export async function getAdminResenas(token: string, aprobado?: boolean): Promise<ResenaAdmin[]> {
  const q = aprobado !== undefined ? `?aprobado=${aprobado}` : ''
  return apiFetch<ResenaAdmin[]>(`/admin/resenas/${q}`, {}, token)
}

export async function aprobarResena(token: string, id: number, aprobado: boolean): Promise<ResenaAdmin> {
  return apiFetch<ResenaAdmin>(
    `/admin/resenas/${id}/`,
    { method: 'PATCH', body: JSON.stringify({ aprobado }) },
    token,
  )
}

export async function eliminarResenaAdmin(token: string, id: number): Promise<null> {
  return apiFetch<null>(`/admin/resenas/${id}/`, { method: 'DELETE' }, token)
}

// ─── Contacto ─────────────────────────────────────────────────────────────────

export async function enviarContacto(data: {
  nombre: string
  email: string
  mensaje: string
}): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>('/contacto/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface VentaDia {
  fecha: string
  total: number
  cantidad: number
}

export interface TopProducto {
  nombre: string
  slug: string
  categoria_slug: string
  unidades: number
  ingresos: number
}

export interface VentaCategoria {
  nombre: string
  total: number
  unidades: number
}

export interface MetodoPago {
  metodo_pago: string
  cantidad: number
  total: number
}

export interface StockRiesgo {
  nombre: string
  slug: string
  categoria_slug: string
  stock: number
  vendidos_30_dias: number
}

export interface Comparativa {
  ventas_mes_actual: number
  ventas_mes_anterior: number
  variacion_pct: number | null
  ordenes_mes_actual: number
  ordenes_mes_anterior: number
  ticket_promedio: number
}

export interface AnalyticsData {
  ventas_diarias: VentaDia[]
  comparativa: Comparativa
  top_productos: TopProducto[]
  por_categoria: VentaCategoria[]
  metodos_pago: MetodoPago[]
  stock_en_riesgo: StockRiesgo[]
}

export async function getAnalytics(token: string): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>('/admin/analytics/', {}, token)
}
