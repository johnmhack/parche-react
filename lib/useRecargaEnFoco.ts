import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { debeMostrarSpinner, marcarPantallaLista } from './carga'

/** Recarga datos al enfocar la pantalla; spinner solo la primera vez por sesión. */
export function useRecargaEnFoco(pantallaId: string, cargar: () => Promise<void>) {
  const [cargando, setCargando] = useState(() => debeMostrarSpinner(pantallaId))
  const cargarRef = useRef(cargar)
  cargarRef.current = cargar

  useFocusEffect(
    useCallback(() => {
      let activo = true

      ;(async () => {
        const mostrarSpinner = debeMostrarSpinner(pantallaId)
        if (mostrarSpinner) setCargando(true)

        try {
          await cargarRef.current()
        } finally {
          if (activo) {
            marcarPantallaLista(pantallaId)
            setCargando(false)
          }
        }
      })()

      return () => {
        activo = false
      }
    }, [pantallaId])
  )

  return cargando
}

/** Carga al montar; spinner solo la primera vez por sesión (pantallas del stack). */
export function useCargaInicial(pantallaId: string, cargar: () => Promise<void>) {
  const [cargando, setCargando] = useState(() => debeMostrarSpinner(pantallaId))
  const cargarRef = useRef(cargar)
  cargarRef.current = cargar

  useEffect(() => {
    let activo = true

    ;(async () => {
      if (debeMostrarSpinner(pantallaId)) setCargando(true)
      try {
        await cargarRef.current()
      } finally {
        if (activo) {
          marcarPantallaLista(pantallaId)
          setCargando(false)
        }
      }
    })()

    return () => {
      activo = false
    }
  }, [pantallaId])

  return cargando
}
