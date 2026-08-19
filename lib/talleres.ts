import { supabase } from './supabase'
import type { Taller } from './types'

export async function obtenerTaller(id: string): Promise<Taller | null> {
  const { data, error } = await supabase
    .from('talleres')
    .select(
      'id, nombre, direccion, latitud, longitud, calificacion_promedio, categorias, telefono, activo'
    )
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function contarServiciosEnTaller(
  tallerId: string,
  motoIds: string[]
): Promise<number> {
  if (motoIds.length === 0) return 0

  const { count, error } = await supabase
    .from('historial_moto')
    .select('id', { count: 'exact', head: true })
    .eq('taller_id', tallerId)
    .in('moto_id', motoIds)

  if (error) return 0
  return count ?? 0
}
