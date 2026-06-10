import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import * as Location from 'expo-location'
import { useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tituloVerde: {
    color: '#00E676',
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  mapa: {
    flex: 1,
  },
  // Callout
  callout: {
    width: 200,
    padding: 10,
    borderRadius: 8,
  },
  calloutNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  calloutDireccion: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  calloutCalificacion: {
    fontSize: 12,
    color: colors.primario,
    fontWeight: '600',
  },
  calloutTelefono: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  // Sin talleres
  sinTalleres: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sinTalleresGradient: {
    padding: 16,
    alignItems: 'center',
  },
  sinTalleresTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
})

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

      {/* Header flotante sobre el mapa */}
      <LinearGradient
        colors={[colors.bg, 'rgba(8,10,15,0.85)', 'transparent']}
        style={styles.headerGradient}
        pointerEvents="none"
      />
      <View style={styles.header}>
        <Text style={styles.titulo}>
          <Text style={styles.tituloVerde}>Talleres</Text> 🗺️
        </Text>
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
        userInterfaceStyle="dark"
      >
        {talleres.map((taller) => (
          <Marker
            key={taller.id}
            coordinate={{
              latitude: taller.latitud,
              longitude: taller.longitud,
            }}
            pinColor="#00E676"
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
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
            style={styles.sinTalleresGradient}
          >
            <Text style={styles.sinTalleresTexto}>No hay talleres registrados aún</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  )
}