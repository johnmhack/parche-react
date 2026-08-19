/** Origen del registro en el historial clínico de la moto */
export type OrigenHistorial = 'taller' | 'propietario'

export type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
}

export type Taller = {
  id: string
  nombre: string
  direccion: string
  latitud: number | null
  longitud: number | null
  calificacion_promedio: number
  categorias: string[]
  telefono: string | null
  activo?: boolean
}

export type RegistroHistorial = {
  id: string
  moto_id: string
  tipo_servicio: string
  descripcion: string | null
  kilometraje: number | null
  costo: number | null
  fecha: string
  origen: OrigenHistorial
  taller_id: string | null
  taller_nombre: string | null
  editable: boolean
  moto_placa?: string | null
}
