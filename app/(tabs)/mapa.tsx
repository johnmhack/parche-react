import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import * as Location from 'expo-location'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Taller = {
  id: string
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  calificacion_promedio: number
  categorias: string[]
  telefono: string
}

type Ubicacion = {
  latitud: number
  longitud: number
}

export default function Mapa() {
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null)
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      cargarDatos()
    }, [])
  )

  async function cargarDatos() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({})
      setUbicacion({
        latitud: loc.coords.latitude,
        longitud: loc.coords.longitude,
      })
    }

    const { data, error } = await supabase
      .from('talleres')
      .select('id, nombre, direccion, latitud, longitud, calificacion_promedio, categorias, telefono')
      .eq('activo', true)
      .not('latitud', 'is', null)
      .not('longitud', 'is', null)

    if (error) Alert.alert('Error', error.message)
    else setTalleres(data || [])
    setCargando(false)
  }

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🗺️ Talleres</Text>
        <Text style={styles.subtitulo}>{talleres.length} talleres disponibles</Text>
      </View>

      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: ubicacion?.latitud || 4.7110,
          longitude: ubicacion?.longitud || -74.0721,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={ubicacion !== null}
        showsMyLocationButton={true}
      >
        {talleres.map((taller) => (
          <Marker
            key={taller.id}
            coordinate={{
              latitude: taller.latitud,
              longitude: taller.longitud,
            }}
            pinColor="#f97316"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutNombre}>{taller.nombre}</Text>
                <Text style={styles.calloutDireccion}>{taller.direccion}</Text>
                {taller.calificacion_promedio > 0 && (
                  <Text style={styles.calloutCalificacion}>⭐ {taller.calificacion_promedio}</Text>
                )}
                {taller.telefono && (
                  <Text style={styles.calloutTelefono}>📱 {taller.telefono}</Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {talleres.length === 0 && (
        <View style={styles.sinTalleres}>
          <Text style={styles.sinTalleresTexto}>No hay talleres registrados aún</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  mapa: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  calloutDireccion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutCalificacion: {
    fontSize: 12,
    color: '#f97316',
  },
  calloutTelefono: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sinTalleres: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sinTalleresTexto: {
    color: '#888',
    fontSize: 14,
  },
})