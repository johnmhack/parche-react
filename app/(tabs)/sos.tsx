import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import * as Location from 'expo-location'
import { useFocusEffect, router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { colors } from '../../lib/colors'
import { Icono } from '../../lib/iconos'
import Ionicons from '@expo/vector-icons/Ionicons'
import { alertaLimiteContactosSos, esPremium, limitesPlan } from '../../lib/planes'
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
    height: 350,
    zIndex: 0,
  },
  ambientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tituloAcento: {
    color: '#ff6b6b',
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textoSub,
    lineHeight: 18,
    marginBottom: 20,
  },
  resumenCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resumenGradient: {
    padding: 18,
    gap: 12,
  },
  resumenTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumenInfo: {
    flex: 1,
    gap: 3,
  },
  resumenTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resumenSub: {
    fontSize: 12,
    color: colors.textoSub,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  planBadgeFree: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planBadgePremium: {
    backgroundColor: 'rgba(100,228,188,0.08)',
    borderColor: 'rgba(100,228,188,0.25)',
  },
  planBadgeTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  planBadgeTextoFree: {
    color: 'rgba(255,255,255,0.6)',
  },
  planBadgeTextoPremium: {
    color: colors.secundario,
  },
  progresoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progresoLabel: {
    fontSize: 12,
    color: colors.textoSub,
  },
  progresoValor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progresoBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 6,
  },
  progresoFill: {
    height: '100%',
    borderRadius: 3,
  },
  cooldownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    borderRadius: 12,
    padding: 10,
  },
  cooldownTexto: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 17,
  },
  sosWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  sosRingOuter: {
    width: 196,
    height: 196,
    borderRadius: 98,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    backgroundColor: 'rgba(255,107,107,0.04)',
  },
  sosRingInner: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.28)',
    backgroundColor: 'rgba(255,107,107,0.06)',
  },
  botonSOS: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  botonSOSDesactivado: {
    shadowOpacity: 0.15,
  },
  botonSOSTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  botonSOSSubtexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agregarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  agregarBtnDisabled: {
    opacity: 0.45,
  },
  agregarTexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
  limiteTexto: {
    fontSize: 12,
    color: colors.textoSub,
    fontWeight: '600',
  },
  contacto: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  contactoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  contactoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  contactoAvatarTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  contactoInfo: {
    flex: 1,
    gap: 2,
  },
  contactoNombre: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  contactoTelefono: {
    color: colors.textoSub,
    fontSize: 13,
  },
  eliminarBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacioCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  vacioGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  vacioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vacioSub: {
    fontSize: 12,
    color: colors.textoSub,
    textAlign: 'center',
    lineHeight: 17,
  },
  cargandoWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
})

export default function SOS() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [plan, setPlan] = useState('free')
  const [enviando, setEnviando] = useState(false)
  const [enCooldown, setEnCooldown] = useState(false)
  const [minutosRestantes, setMinutosRestantes] = useState(0)
  const [alertaModal, setAlertaModal] = useState<AlertaModal | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, [])
  )

  async function verificarCooldown() {
    const ultimoSOS = await AsyncStorage.getItem('ultimo_sos')
    if (!ultimoSOS) {
      setEnCooldown(false)
      setMinutosRestantes(0)
      return
    }

    const diff = Date.now() - parseInt(ultimoSOS, 10)
    const treintaMinutos = 30 * 60 * 1000

    if (diff < treintaMinutos) {
      const restante = Math.ceil((treintaMinutos - diff) / 60000)
      setEnCooldown(true)
      setMinutosRestantes(restante)

      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        const diff2 = Date.now() - parseInt(ultimoSOS, 10)
        if (diff2 >= treintaMinutos) {
          setEnCooldown(false)
          setMinutosRestantes(0)
          if (intervalRef.current) clearInterval(intervalRef.current)
        } else {
          setMinutosRestantes(Math.ceil((treintaMinutos - diff2) / 60000))
        }
      }, 60000)
    } else {
      setEnCooldown(false)
      setMinutosRestantes(0)
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
    if (!user) {
      setEnviando(false)
      return
    }

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

  const limites = limitesPlan(plan)
  const premium = esPremium(plan)
  const enLimiteContactos = contactos.length >= limites.contactosSos
  const pctContactos = Math.min(100, (contactos.length / limites.contactosSos) * 100)

  const header = (
    <>
      <Text style={styles.titulo}>
        Ayuda en <Text style={styles.tituloAcento}>ruta</Text>
      </Text>
      <Text style={styles.subtitulo}>
        Mantén presionado 3 segundos para enviar tu ubicación GPS a tus contactos.
      </Text>

      <View style={styles.resumenCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.resumenGradient}
        >
          <View style={styles.resumenTop}>
            <View style={styles.resumenInfo}>
              <Text style={styles.resumenTitulo}>
                {contactos.length === 0 ? 'Sin contactos SOS' : `${contactos.length} contacto${contactos.length > 1 ? 's' : ''} activo${contactos.length > 1 ? 's' : ''}`}
              </Text>
              <Text style={styles.resumenSub}>
                {premium ? 'Hasta 5 contactos en Premium' : 'Hasta 1 contacto en Free'}
              </Text>
            </View>
            <View style={[styles.planBadge, premium ? styles.planBadgePremium : styles.planBadgeFree]}>
              <Ionicons
                name={premium ? 'diamond' : 'person-outline'}
                size={14}
                color={premium ? colors.secundario : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.planBadgeTexto, premium ? styles.planBadgeTextoPremium : styles.planBadgeTextoFree]}>
                {premium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>
          <View>
            <View style={styles.progresoHeader}>
              <Text style={styles.progresoLabel}>Espacio del plan</Text>
              <Text style={styles.progresoValor}>{contactos.length} / {limites.contactosSos}</Text>
            </View>
            <View style={styles.progresoBar}>
              <View style={[styles.progresoFill, {
                width: `${pctContactos}%`,
                backgroundColor: enLimiteContactos ? '#ff6b6b' : colors.secundario,
              }]} />
            </View>
          </View>
          {enCooldown && (
            <View style={styles.cooldownBanner}>
              <Ionicons name="time-outline" size={18} color="#ff6b6b" />
              <Text style={styles.cooldownTexto}>
                Botón en pausa · podrás volver a pedir ayuda en {minutosRestantes} min
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      <View style={styles.sosWrap}>
        <View style={styles.sosRingOuter}>
          <View style={styles.sosRingInner}>
            <TouchableOpacity
              onLongPress={enCooldown ? undefined : handleSOS}
              delayLongPress={3000}
              disabled={enviando || enCooldown}
              activeOpacity={0.9}
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

      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Contactos de emergencia</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.limiteTexto}>{contactos.length} / {limites.contactosSos}</Text>
          <TouchableOpacity
            style={[styles.agregarBtn, enLimiteContactos && styles.agregarBtnDisabled]}
            onPress={agregarContacto}
          >
            <Ionicons name="add" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={styles.agregarTexto}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )

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
        colors={['rgba(255,107,107,0.05)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.02)', 'transparent']}
        style={styles.ambientBottom}
        pointerEvents="none"
      />

      <FlatList
        data={contactos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          cargando ? (
            <View style={styles.cargandoWrap}>
              <ActivityIndicator color={colors.secundario} />
            </View>
          ) : (
            <View style={styles.vacioCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.vacioGradient}
              >
                <Ionicons name="people-outline" size={28} color={colors.textoSub} />
                <Text style={styles.vacioTitulo}>Sin contactos de emergencia</Text>
                <Text style={styles.vacioSub}>
                  Agrega a alguien de confianza para recibir tu ubicación si necesitas ayuda en ruta.
                </Text>
              </LinearGradient>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.contacto}>
            <LinearGradient
              colors={['#12182a', '#0d1118']}
              style={styles.contactoGradient}
            >
              <View style={styles.contactoAvatar}>
                <Text style={styles.contactoAvatarTexto}>
                  {item.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactoInfo}>
                <Text style={styles.contactoNombre}>{item.nombre}</Text>
                <Text style={styles.contactoTelefono}>{item.telefono}</Text>
              </View>
              <TouchableOpacity style={styles.eliminarBtn} onPress={() => eliminarContacto(item.id)}>
                <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      />
    </View>
  )
}
