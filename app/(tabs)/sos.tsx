import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native'
import * as Location from 'expo-location'
import { useFocusEffect, router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../lib/colors'

type Contacto = {
  id: string
  nombre: string
  telefono: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  ambientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 0,
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tituloRojo: {
    color: '#ff4444',
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  // Botón SOS
  sosWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sosRingOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.2)',
    backgroundColor: 'rgba(255,68,68,0.04)',
  },
  sosRingInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    backgroundColor: 'rgba(255,68,68,0.06)',
  },
  botonSOS: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  botonSOSDesactivado: {
    shadowOpacity: 0.2,
  },
  botonSOSTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  botonSOSSubtexto: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  // Sección contactos
  seccion: {
    width: '100%',
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  agregarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,26,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  agregarTexto: {
    color: colors.primario,
    fontSize: 12,
    fontWeight: '700',
  },
  vacio: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  // Contacto
  contacto: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  contactoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  contactoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    backgroundColor: 'rgba(255,68,68,0.1)',
  },
  contactoAvatarTexto: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: '700',
  },
  contactoNombre: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  contactoTelefono: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 2,
  },
  eliminarBtn: {
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  eliminarTexto: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '700',
  },
})

export default function SOS() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [progreso, setProgreso] = useState(0)
  const [enCooldown, setEnCooldown] = useState(false)
  const [minutosRestantes, setMinutosRestantes] = useState(0)
  const intervalRef = useRef<any>(null)
  const progresoRef = useRef<any>(null)

  useFocusEffect(
    useCallback(() => {
      cargarContactos()
      verificarCooldown()
    }, [])
  )

  async function verificarCooldown() {
    const ultimoSOS = await AsyncStorage.getItem('ultimo_sos')
    if (!ultimoSOS) return

    const diff = Date.now() - parseInt(ultimoSOS)
    const treintaMinutos = 30 * 60 * 1000

    if (diff < treintaMinutos) {
      const restante = Math.ceil((treintaMinutos - diff) / 60000)
      setEnCooldown(true)
      setMinutosRestantes(restante)

      intervalRef.current = setInterval(async () => {
        const diff2 = Date.now() - parseInt(ultimoSOS)
        if (diff2 >= treintaMinutos) {
          setEnCooldown(false)
          setMinutosRestantes(0)
          clearInterval(intervalRef.current)
        } else {
          setMinutosRestantes(Math.ceil((treintaMinutos - diff2) / 60000))
        }
      }, 60000)
    }
  }

  async function cargarContactos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('contactos_sos')
      .select('*')
      .eq('usuario_id', user.id)

    setContactos(data || [])
    setCargando(false)
  }

  async function handleSOS() {
    if (contactos.length === 0) {
      Alert.alert('Sin contactos', 'Agrega contactos de emergencia primero')
      return
    }
    await enviarSOS()
  }

  async function enviarSOS() {
    setEnviando(true)
    await AsyncStorage.setItem('ultimo_sos', Date.now().toString())
    setEnCooldown(true)
    setMinutosRestantes(30)

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Error', 'Necesitamos acceso a tu ubicación')
      setEnviando(false)
      return
    }

    const location = await Location.getCurrentPositionAsync({})
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('mensajes_sos').insert({
      usuario_id: user.id,
      latitud: location.coords.latitude,
      longitud: location.coords.longitude,
      mensaje: '¡Necesito ayuda! Esta es mi ubicación.',
    })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('✅ SOS Enviado', 'Tu ubicación fue enviada a tus contactos de emergencia.')
    }

    setEnviando(false)
  }

  function agregarContacto() {
    router.push('/agregar-contacto-sos')
  }

  async function eliminarContacto(id: string) {
    Alert.alert('Eliminar contacto', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('contactos_sos').delete().eq('id', id)
          cargarContactos()
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,68,68,0.06)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.titulo}>
            <Text style={styles.tituloRojo}>SOS</Text> 🆘
          </Text>
          <Text style={styles.subtitulo}>Emergencias en ruta</Text>
        </View>

        {/* Botón SOS */}
        <View style={styles.sosWrap}>
          <View style={styles.sosRingOuter}>
            <View style={styles.sosRingInner}>
              <TouchableOpacity
                onLongPress={enCooldown ? undefined : handleSOS}
                delayLongPress={3000}
                disabled={enviando || enCooldown}
              >
                <LinearGradient
                  colors={enviando || enCooldown ? ['#5a1a1a', '#3a0a0a'] : ['#ff4444', '#cc0000']}
                  style={[styles.botonSOS, (enviando || enCooldown) && styles.botonSOSDesactivado]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {enviando ? (
                    <ActivityIndicator color="#fff" size="large" />
                  ) : enCooldown ? (
                    <>
                      <Text style={styles.botonSOSTexto}>🔒</Text>
                      <Text style={styles.botonSOSSubtexto}>{minutosRestantes} min</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.botonSOSTexto}>PEDIR{'\n'}AYUDA</Text>
                      <Text style={styles.botonSOSSubtexto}>Mantén 3 seg</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contactos */}
        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Text style={styles.seccionTitulo}>Contactos de emergencia</Text>
            <TouchableOpacity style={styles.agregarBtn} onPress={agregarContacto}>
              <Text style={styles.agregarTexto}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {cargando ? (
            <ActivityIndicator color="#f97316" />
          ) : contactos.length === 0 ? (
            <Text style={styles.vacio}>No tienes contactos de emergencia</Text>
          ) : (
            <FlatList
              data={contactos}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.contacto}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                    style={styles.contactoGradient}
                  >
                    <View style={styles.contactoAvatar}>
                      <Text style={styles.contactoAvatarTexto}>
                        {item.nombre.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactoNombre}>{item.nombre}</Text>
                      <Text style={styles.contactoTelefono}>{item.telefono}</Text>
                    </View>
                    <TouchableOpacity style={styles.eliminarBtn} onPress={() => eliminarContacto(item.id)}>
                      <Text style={styles.eliminarTexto}>Eliminar</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}
            />
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}