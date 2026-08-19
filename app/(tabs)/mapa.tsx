import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'
import { Icono } from '../../lib/iconos'
import Ionicons from '@expo/vector-icons/Ionicons'
import ModalAlerta from '../../components/ModalAlerta'

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
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tituloAcento: {
    color: colors.secundario,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textoSub,
    marginTop: 4,
  },
  mapa: {
    flex: 1,
  },
  resumenFlotante: {
    position: 'absolute',
    top: 130,
    left: 20,
    right: 20,
    zIndex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resumenGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  resumenIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(100,228,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(100,228,188,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumenInfo: {
    flex: 1,
    gap: 2,
  },
  resumenTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resumenSub: {
    fontSize: 12,
    color: colors.textoSub,
  },
  resumenBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resumenBadgeTexto: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  callout: {
    width: 220,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  calloutNombre: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  calloutDireccion: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
    lineHeight: 17,
  },
  calloutMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calloutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calloutChipTexto: {
    fontSize: 11,
    color: '#444',
    fontWeight: '600',
  },
  calloutAccion: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primarioOscuro,
  },
  panelInferior: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 2,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  panelGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  panelIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelInfo: {
    flex: 1,
    gap: 3,
  },
  panelTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  panelSub: {
    fontSize: 12,
    color: colors.textoSub,
    lineHeight: 17,
  },
})

export default function Mapa() {
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null)
  const [alertaModal, setAlertaModal] = useState<{ titulo: string; mensaje?: string } | null>(null)

  const cargarDatos = useCallback(async () => {
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

    if (error) {
      setAlertaModal({ titulo: 'Error', mensaje: error.message })
    } else {
      setTalleres(data || [])
    }
  }, [])

  const cargando = useRecargaEnFoco('mapa', cargarDatos)

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.secundario} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ModalAlerta
        visible={!!alertaModal}
        titulo={alertaModal?.titulo ?? ''}
        mensaje={alertaModal?.mensaje}
        variante="error"
        onCerrar={() => setAlertaModal(null)}
      />

      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: ubicacion?.latitud || 4.7110,
          longitude: ubicacion?.longitud || -74.0721,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={ubicacion !== null}
        showsMyLocationButton
        userInterfaceStyle="dark"
      >
        {talleres.map((taller) => (
          <Marker
            key={taller.id}
            coordinate={{
              latitude: taller.latitud,
              longitude: taller.longitud,
            }}
            pinColor={colors.secundario}
            onCalloutPress={() => router.push({ pathname: '/taller/[id]', params: { id: taller.id } })}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <Ionicons name="construct" size={16} color={colors.primarioOscuro} />
                  <Text style={styles.calloutNombre}>{taller.nombre}</Text>
                </View>
                <Text style={styles.calloutDireccion}>{taller.direccion}</Text>
                <View style={styles.calloutMeta}>
                  {taller.calificacion_promedio > 0 && (
                    <View style={styles.calloutChip}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.calloutChipTexto}>{taller.calificacion_promedio}</Text>
                    </View>
                  )}
                  {taller.telefono ? (
                    <View style={styles.calloutChip}>
                      <Ionicons name="call-outline" size={12} color="#666" />
                      <Text style={styles.calloutChipTexto}>{taller.telefono}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.calloutAccion}>Toca para ver detalle →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.headerOverlay} pointerEvents="box-none">
        <LinearGradient
          colors={[colors.bg, 'rgba(2,13,26,0.9)', 'transparent']}
          style={styles.headerGradient}
          pointerEvents="none"
        />
        <View style={styles.header}>
          <Text style={styles.titulo}>
            Mapa de <Text style={styles.tituloAcento}>Talleres</Text>
          </Text>
          <Text style={styles.subtitulo}>
            Talleres aliados Torker cerca de ti
          </Text>
        </View>

        <View style={styles.resumenFlotante}>
          <LinearGradient
            colors={['rgba(18,24,42,0.95)', 'rgba(13,17,24,0.95)']}
            style={styles.resumenGradient}
          >
            <View style={styles.resumenIconWrap}>
              <Icono name="map" size={20} color={colors.secundario} />
            </View>
            <View style={styles.resumenInfo}>
              <Text style={styles.resumenTitulo}>
                {talleres.length === 0 ? 'Sin talleres en el mapa' : `${talleres.length} taller${talleres.length > 1 ? 'es' : ''} disponible${talleres.length > 1 ? 's' : ''}`}
              </Text>
              <Text style={styles.resumenSub}>
                {ubicacion ? 'Mostrando tu ubicación' : 'Activa GPS para ver talleres cercanos'}
              </Text>
            </View>
            <View style={styles.resumenBadge}>
              <Text style={styles.resumenBadgeTexto}>{talleres.length}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.panelInferior} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
          style={styles.panelGradient}
        >
          <View style={styles.panelIconWrap}>
            <Ionicons
              name={talleres.length > 0 ? 'location' : 'information-circle-outline'}
              size={24}
              color={colors.secundario}
            />
          </View>
          <View style={styles.panelInfo}>
            <Text style={styles.panelTitulo}>
              {talleres.length > 0 ? 'Toca un marcador' : 'Red Torker en expansión'}
            </Text>
            <Text style={styles.panelSub}>
              {talleres.length > 0
                ? 'Selecciona un taller en el mapa para ver servicios, calificación y contacto.'
                : 'Pronto verás talleres aliados registrados desde Torker en tu ciudad.'}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  )
}
