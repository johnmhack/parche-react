import type { Session } from '@supabase/supabase-js'

/** Evita spinner de pantalla completa al volver atrás (cache por sesión). */
const pantallasListas = new Set<string>()

let sesionCache: Session | null = null
let tabsInicializadas = false

const datosCache = new Map<string, unknown>()

export function debeMostrarSpinner(pantalla: string) {
  return !pantallasListas.has(pantalla)
}

export function marcarPantallaLista(pantalla: string) {
  pantallasListas.add(pantalla)
}

/** Sesión cacheada para no mostrar spinner al remontar tabs. */
export function obtenerSesionCache(): Session | null | undefined {
  if (!tabsInicializadas) return undefined
  return sesionCache
}

export function guardarSesionCache(session: Session | null) {
  sesionCache = session
  tabsInicializadas = true
}

export function getCache<T>(key: string): T | undefined {
  return datosCache.get(key) as T | undefined
}

export function setCache(key: string, value: unknown) {
  datosCache.set(key, value)
}

export function borrarCache(key: string) {
  datosCache.delete(key)
}

export function reiniciarCacheCarga() {
  pantallasListas.clear()
  sesionCache = null
  tabsInicializadas = false
  datosCache.clear()
}
