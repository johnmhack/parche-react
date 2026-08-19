export function formatearFecha(fecha: string) {
  if (!fecha) return null
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function fechaADate(fecha: string) {
  if (!fecha) return new Date()
  return new Date(fecha + 'T12:00:00')
}

export function dateAFecha(date: Date) {
  return date.toISOString().split('T')[0]
}

export function diasRestantes(fecha: string | null) {
  if (!fecha) return null
  const hoy = new Date()
  const vence = new Date(fecha + 'T12:00:00')
  return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}
