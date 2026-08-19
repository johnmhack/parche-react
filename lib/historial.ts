import { supabase } from './supabase'
import type { RegistroHistorial } from './types'

type HistorialMotoRow = {
  id: string
  moto_id: string
  tipo_servicio: string
  descripcion: string | null
  kilometraje: number | null
  costo: number | null
  fecha: string
  taller_id: string | null
}

type HistorialPropietarioRow = {
  id: string
  moto_id: string
  tipo_servicio: string
  contenido: string | null
  kilometraje: number | null
  costo: number | null
  fecha: string
}

export async function cargarHistorialMoto(motoId: string): Promise<RegistroHistorial[]> {
  const [{ data: verificados, error: errTaller }, { data: propietario, error: errProp }] =
    await Promise.all([
      supabase
        .from('historial_moto')
        .select('id, moto_id, tipo_servicio, descripcion, kilometraje, costo, fecha, taller_id')
        .eq('moto_id', motoId)
        .order('fecha', { ascending: false }),
      supabase
        .from('historial_propietario')
        .select('id, moto_id, tipo_servicio, contenido, kilometraje, costo, fecha')
        .eq('moto_id', motoId)
        .order('fecha', { ascending: false }),
    ])

  if (errProp) throw errProp

  const registrosVerificados = errTaller ? [] : (verificados ?? [])

  const tallerIds = [
    ...new Set(
      registrosVerificados
        .map((r) => r.taller_id)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const talleresMap = new Map<string, string>()
  if (tallerIds.length > 0) {
    const { data: talleres } = await supabase
      .from('talleres')
      .select('id, nombre')
      .in('id', tallerIds)

    for (const t of talleres ?? []) {
      talleresMap.set(t.id, t.nombre)
    }
  }

  const registrosTaller: RegistroHistorial[] = registrosVerificados.map((r: HistorialMotoRow) => ({
    ...r,
    origen: 'taller' as const,
    taller_nombre: r.taller_id ? talleresMap.get(r.taller_id) ?? null : null,
    editable: false,
  }))

  const registrosPropietario: RegistroHistorial[] = (propietario ?? []).map(
    (r: HistorialPropietarioRow) => ({
      id: r.id,
      moto_id: r.moto_id,
      tipo_servicio: r.tipo_servicio,
      descripcion: r.contenido,
      kilometraje: r.kilometraje,
      costo: r.costo,
      fecha: r.fecha,
      origen: 'propietario' as const,
      taller_id: null,
      taller_nombre: null,
      editable: true,
    })
  )

  return [...registrosTaller, ...registrosPropietario].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )
}

const CAMPOS_HISTORIAL =
  'id, moto_id, tipo_servicio, descripcion, kilometraje, costo, fecha, taller_id'

export async function cargarUltimoServicio(motoIds: string[]): Promise<RegistroHistorial | null> {
  if (motoIds.length === 0) return null

  const [{ data: verificados }, { data: propietario }] = await Promise.all([
    supabase
      .from('historial_moto')
      .select(CAMPOS_HISTORIAL)
      .in('moto_id', motoIds)
      .order('fecha', { ascending: false })
      .limit(1),
    supabase
      .from('historial_propietario')
      .select('id, moto_id, tipo_servicio, contenido, kilometraje, costo, fecha')
      .in('moto_id', motoIds)
      .order('fecha', { ascending: false })
      .limit(1),
  ])

  const ultimoTaller = verificados?.[0] as HistorialMotoRow | undefined
  const ultimoProp = propietario?.[0] as HistorialPropietarioRow | undefined

  if (!ultimoTaller && !ultimoProp) return null

  let elegido: RegistroHistorial
  if (
    ultimoTaller &&
    (!ultimoProp || new Date(ultimoTaller.fecha) >= new Date(ultimoProp.fecha))
  ) {
    let tallerNombre: string | null = null
    if (ultimoTaller.taller_id) {
      const { data: taller } = await supabase
        .from('talleres')
        .select('nombre')
        .eq('id', ultimoTaller.taller_id)
        .single()
      tallerNombre = taller?.nombre ?? null
    }
    elegido = {
      ...ultimoTaller,
      origen: 'taller',
      taller_nombre: tallerNombre,
      editable: false,
    }
  } else if (ultimoProp) {
    elegido = {
      id: ultimoProp.id,
      moto_id: ultimoProp.moto_id,
      tipo_servicio: ultimoProp.tipo_servicio,
      descripcion: ultimoProp.contenido,
      kilometraje: ultimoProp.kilometraje,
      costo: ultimoProp.costo,
      fecha: ultimoProp.fecha,
      origen: 'propietario',
      taller_id: null,
      taller_nombre: null,
      editable: true,
    }
  } else {
    return null
  }

  return elegido
}
