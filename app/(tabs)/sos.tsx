import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native'
import * as Location from 'expo-location'
import { useFocusEffect, router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { colors } from '../../lib/colors'
import { Icono } from '../../lib/iconos'
import { alertaLimiteContactosSos, limitesPlan } from '../../lib/planes'
import ModalAlerta, { BotonModalAlerta } from '../../components/ModalAlerta'

type AlertaModal = {
  titulo: string
  mensaje?: string
  variante?: 'info' | 'exito' | 'error' | 'premium'
  botones?: BotonModalAlerta[]
}

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
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tituloAcento: {
    color: '#ff4444',
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    lineHeight: 18,
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
    backgroundColor: 'rgba(37,255,122,0.1)',
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  agregarTexto: {
    color: colors.primario,
    fontSize: 12,
    fontWeight: '700',
  },
  agregarBtnDisabled: {
    opacity: 0.45,
  },
  limiteTexto: {
    fontSize: 12,
    color: colors.textoSub,
    fontWeight: '600',
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
  const [plan, setPlan] = useState('free')
  const [enviando, setEnviando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [enCooldown, setEnCooldown] = useState(false)
  const [minutosRestantes, setMinutosRestantes] = useState(0)
  const [alertaModal, setAlertaModal] = useState<AlertaModal | null>(null)
  const intervalRef = useRef<any>(null)
  const progresoRef = useRef<any>(null)

  const cargarContactos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: perfil }, { data }] = await Promise.all([
      supabase.from('perfiles').select('plan').eq('id', user.id).single(),
      supabase.from('contactos_sos').select('*').eq('usuario_id', user.id),
    ])

    setPlan(perfil?.plan ?? 'free')
    setContactos(data || [])
  }, [])

  const cargando = useRecargaEnFoco('sos', cargarContactos)

  useFocusEffect(
    useCallback(() => {
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

  async function handleSOS() {
    if (contactos.length === 0) {
      setAlertaModal({
        titulo: 'Sin contactos',
        mensaje: 'Agrega al menos un contacto de emergencia antes de pedir ayuda.',
        variante: 'info',
      })
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
      setAlertaModal({
        titulo: 'Ubicación requerida',
        mensaje: 'Necesitamos acceso a tu ubicación para enviar tu posición a tus contactos.',
        variante: 'error',
      })
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
      setAlertaModal({ titulo: 'No se pudo enviar', mensaje: error.message, variante: 'error' })
    } else {
      setAlertaModal({
        titulo: 'Ayuda enviada',
        mensaje: 'Tu ubicación fue compartida con tus contactos de emergencia.',
        variante: 'exito',
      })
    }

    setEnviando(false)
  }

  function agregarContacto() {
    const limite = limitesPlan(plan).contactosSos
    if (contactos.length >= limite) {
      const { titulo, mensaje } = alertaLimiteContactosSos(plan)
      setAlertaModal({ titulo, mensaje, variante: 'premium' })
      return
    }
    router.push('/agregar-contacto-sos')
  }

  function eliminarContacto(id: string) {
    setAlertaModal({
      titulo: 'Eliminar contacto',
      mensaje: 'Este contacto dejará de recibir tus alertas de emergencia.',
      variante: 'error',
      botones: [
        { texto: 'Cancelar', estilo: 'secundario' },
        {
          texto: 'Eliminar',
          estilo: 'destructivo',
          onPress: async () => {
            await supabase.from('contactos_sos').delete().eq('id', id)
            cargarContactos()
          },
        },
      ],
    })
  }

  const limiteContactos = limitesPlan(plan).contactosSos
  const enLimiteContactos = contactos.length >= limiteContactos

  return (
    <View style={styles.container}>
      <ModalAlerta
        visible={!!alertaModal}
        titulo={alertaModal?.titulo ?? ''}
        mensaje={alertaModal?.mensaje}
        variante={alertaModal?.variante}
        botones={alertaModal?.botones}
        onCerrar={() => setAlertaModal(null)}
      />
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
            Ayuda en <Text style={styles.tituloAcento}>ruta</Text>
          </Text>
          <Text style={styles.subtitulo}>
            Mantén presionado 3 segundos para enviar tu ubicación GPS a tus contactos.
          </Text>
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
                      <Icono name="lock-closed" size={28} color="#fff" />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.limiteTexto}>
                {contactos.length} / {limiteContactos}
              </Text>
              <TouchableOpacity
                style={[styles.agregarBtn, enLimiteContactos && styles.agregarBtnDisabled]}
                onPress={agregarContacto}
              >
                <Text style={styles.agregarTexto}>+ Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {cargando ? (
            <ActivityIndicator color={colors.primario} />
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