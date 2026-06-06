export interface Categoria {
  id: number
  nombre: string
  slug: string
  descripcion: string
  imagen: string | null
  orden: number
}

export interface ProductoImagen {
  id: number
  imagen: string
  principal: boolean
  orden: number
}

export interface ProductoList {
  id: number
  codigo: string
  nombre: string
  slug: string
  marca: string
  categoria: number
  categoria_nombre: string
  categoria_slug: string
  precio: string
  precio_oferta: string | null
  descuento: number
  precio_final: string
  tiene_oferta: boolean
  stock: number
  destacado: boolean
  activo: boolean
  imagen_principal: string | null
  calificacion_promedio: number | null
  total_resenas: number
}

export interface ProductoDetail extends Omit<ProductoList, 'categoria'> {
  categoria: Categoria
  ofrecido: string
  descripcion: string
  ingredientes: string
  modo_uso: string
  conservacion: string
  cont_peso_neto: string
  imagenes: ProductoImagen[]
  calificacion_promedio: number | null
  total_resenas: number
  creado: string
  actualizado: string
}

export interface Resena {
  id: number
  usuario_nombre: string
  comentario: string
  calificacion: number
  creado: string
}

export interface ResenaAdmin {
  id: number
  usuario_nombre: string
  usuario_email: string
  producto_nombre: string
  producto_slug: string
  producto_categoria_slug: string
  comentario: string
  calificacion: number
  aprobado: boolean
  creado: string
}

export interface ItemCarrito {
  id: number
  producto: ProductoList
  cantidad: number
  subtotal: string
}

export interface Carrito {
  id: number
  items: ItemCarrito[]
  total: string
  cantidad_items: number
  actualizado: string
}

export interface ItemOrden {
  id: number
  producto_nombre: string
  cantidad: number
  precio_unitario: string
  subtotal: string
}

export interface Orden {
  id: number
  usuario: number
  usuario_nombre: string | null
  estado: string
  estado_display: string
  metodo_pago: string
  metodo_pago_display: string
  total: string
  descuento_aplicado: string
  notas: string
  items: ItemOrden[]
  creado: string
}

export interface BlogCategoria {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  imagen_cat: string | null
}

export interface BlogPost {
  id: number
  titulo: string
  subtitulo: string
  slug: string
  categoria: BlogCategoria
  autor_nombre: string
  imagen_post: string | null
  etiqueta: string
  creado: string
}

export interface BlogPostDetail extends BlogPost {
  contenido: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type IVAOpcion = '0' | '10.5' | '21'

export interface ConfiguracionGlobal {
  margen_ganancia: string
  iva: IVAOpcion
  recargo_tarjeta: string
  transporte: string
}

export interface ConfiguracionCategoriaCosto {
  id: number
  categoria: number
  categoria_nombre: string
  margen_ganancia: string
  iva: IVAOpcion | ''
}

export interface CategoriaConCosto {
  id: number
  nombre: string
  slug: string
  config_costo: ConfiguracionCategoriaCosto | null
}

export interface CostoProducto {
  id: number
  producto: number
  costo_neto: string
  descuento_proveedor: string
  impuesto_interno: string
  transporte: string | null
  margen_ganancia: string | null
  iva: IVAOpcion | ''
  descuento_promocion: string
  recargo_tarjeta: string | null
  // computed
  margen_efectivo: string
  iva_efectivo: string
  transporte_efectivo: string
  recargo_tarjeta_efectivo: string
  precio_calculado: string
  precio_con_tarjeta: string
  precio_con_descuento: string
}

export interface PromocionBanco {
  id: number
  nombre: string
  banco: string
  tipo: 'descuento' | 'cuotas'
  tipo_display: string
  valor: string
  activo: boolean
  vigencia_desde: string | null
  vigencia_hasta: string | null
  descripcion: string
}
