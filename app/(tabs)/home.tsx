import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'
import { cargarUltimoServicio } from '../../lib/historial'
import type { RegistroHistorial } from '../../lib/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { Icono, IconoDocEstado } from '../../lib/iconos'
import Ionicons from '@expo/vector-icons/Ionicons'

const BANNER_VISTOS_KEY = 'anuncios_banner_vistos'
const ANCHO_PANTALLA = Dimensions.get('window').width
const ANCHO_CARRUSEL = ANCHO_PANTALLA - 40
const ALERTAS_VISIBLES = 2

type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
  soat_vencimiento: string | null
  tecnicomecanica_vencimiento: string | null
}

type Perfil = {
  nombre: string
  tuercas_acumuladas: number
  nivel: number
  plan: string
}

type Anuncio = {
  id: string
  titulo: string
  mensaje: string
  dirigido_a: string
  imagen_url: string | null
}

type AlertaDoc = {
  id: string
  tipo: 'SOAT' | 'Tecno'
  placa: string
  dias: number
  vencido: boolean
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
    height: 300,
    zIndex: 0,
  },
  ambientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    zIndex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  saludo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  saludoNombre: {
    color: colors.primario,
  },
  subtitulo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  tuercasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,26,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tuercasBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tuercasNumero: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.primario,
  },
  garajeSeccion: {
    marginBottom: 24,
  },
  motoCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    minHeight: 180,
  },
  motoCardCarrusel: {
    marginRight: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActivo: {
    width: 18,
    backgroundColor: colors.primario,
  },
  garajeHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginTop: 8,
  },
  motoGlowNaranja: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    zIndex: 0,
  },
  motoCardBorder: {
    position: 'absolute',
    borderRadius: 24,
    zIndex: 0,
  },
  motoCardContent: {
    padding: 20,
    zIndex: 1,
    minHeight: 180,
  },
  motoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  motoCyan: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secundario,
    lineHeight: 24,
  },
  motoModelo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  placaBadge: {
    backgroundColor: '#FFD600',
    borderWidth: 1,
    borderColor: '#e6c000',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  placaTexto: {
    fontWeight: '700',
    fontSize: 13,
    color: '#000000',
    letterSpacing: 2,
  },
  motoIconoWrap: {
    position: 'absolute',
    right: 16,
    bottom: 48,
    opacity: 0.25,
  },
  motoBottom: {
    marginTop: 40,
  },
  docRow: {
    flexDirection: 'row',
    gap: 10,
  },
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  docBadgePeligro: {
    borderColor: 'rgba(255,61,61,0.4)',
    backgroundColor: 'rgba(255,61,61,0.08)',
  },
  docBadgeWarning: {
    borderColor: 'rgba(255,107,26,0.4)',
    backgroundColor: 'rgba(255,107,26,0.08)',
  },
  docIcon: {
    fontSize: 14,
  },
  docNombre: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  docValor: {
    fontSize: 13,
    fontWeight: '700',
  },
  seccion: {
    marginBottom: 24,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seccionTitulo: {
    fontWeight: '700',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  accesosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accesoCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    minHeight: 90,
  },
  accesoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accesoNaranja: {
    backgroundColor: 'rgba(255,107,26,0.15)',
  },
  accesoCyan: {
    backgroundColor: 'rgba(0,229,255,0.1)',
  },
  accesoVerde: {
    backgroundColor: 'rgba(0,230,118,0.1)',
  },
  accesoPurpura: {
    backgroundColor: 'rgba(180,0,255,0.1)',
  },
  accesoIcono: {
    // contenedor para Ionicons
  },
  accesoNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  anuncioCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  anuncioGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  anuncioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primario,
    marginBottom: 4,
  },
  anuncioMensaje: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 19,
  },
  // Banner modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bannerCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bannerImagen: {
    width: '100%',
    aspectRatio: 0.65,
  },
  bannerFooter: {
    padding: 16,
  },
  bannerTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerMensaje: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 19,
  },
  bannerCerrar: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  bannerCerrarTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  alertasWrap: {
    marginBottom: 20,
    gap: 10,
  },
  alertasHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginLeft: 4,
    gap: 12,
  },
  alertasHeaderIzq: {
    flex: 1,
    gap: 4,
  },
  alertasHeaderFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertasHeaderTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alertasResumen: {
    fontSize: 12,
    color: colors.textoSub,
    marginLeft: 24,
  },
  alertasBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  alertasBadgeTexto: {
    fontSize: 13,
    fontWeight: '800',
  },
  alertasExpandirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 2,
  },
  alertasExpandirTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primario,
  },
  alertaItem: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  alertaItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  alertaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  alertaContenido: {
    flex: 1,
    gap: 2,
  },
  alertaFilaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertaTipo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alertaPlaca: {
    backgroundColor: '#FFD600',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  alertaPlacaTexto: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  alertaDetalle: {
    fontSize: 12,
    lineHeight: 17,
  },
  vacioCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  vacioGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  vacioIconoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(37,255,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacioTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.blanco,
    textAlign: 'center',
  },
  vacioSub: {
    fontSize: 13,
    color: colors.textoSub,
    textAlign: 'center',
    lineHeight: 19,
  },
  vacioBoton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  vacioBotonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  vacioBotonTexto: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  servicioCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  servicioTipo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.blanco,
    marginBottom: 4,
  },
  servicioMeta: {
    fontSize: 12,
    color: colors.textoSub,
    marginBottom: 6,
  },
  servicioBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  servicioBadgeTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22c55e',
  },
})

export default function Home() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [motos, setMotos] = useState<Moto[]>([])
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [bannerVisible, setBannerVisible] = useState(false)
  const [bannerAnuncio, setBannerAnuncio] = useState<Anuncio | null>(null)
  const [ultimoServicio, setUltimoServicio] = useState<RegistroHistorial | null>(null)
  const [motoIndex, setMotoIndex] = useState(0)
  const [alertasExpandidas, setAlertasExpandidas] = useState(false)

  const cargarDatos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: perfilData }, { data: motosData }, { data: anunciosData }] = await Promise.all([
      supabase.from('perfiles').select('nombre, tuercas_acumuladas, nivel, plan').eq('id', user.id).single(),
      supabase.from('motos').select('id, placa, marca, modelo, soat_vencimiento, tecnicomecanica_vencimiento').eq('dueno_id', user.id).eq('activa', true),
      supabase.from('anuncios').select('id, titulo, mensaje, dirigido_a, imagen_url').eq('activo', true),
    ])

    if (perfilData) setPerfil(perfilData)
    if (motosData) {
      setMotos(motosData)
      const ultimo = await cargarUltimoServicio(motosData.map((m) => m.id))
      setUltimoServicio(ultimo)
    } else {
      setMotos([])
      setUltimoServicio(null)
    }
    if (anunciosData) {
      const filtrados = anunciosData.filter(a =>
        a.dirigido_a === 'todos' || a.dirigido_a === (perfilData?.plan || 'free')
      )
      setAnuncios(filtrados)
      const conImagen = filtrados.find(a => a.imagen_url)
      if (conImagen) {
        setBannerAnuncio(conImagen)
        try {
          const raw = await AsyncStorage.getItem(BANNER_VISTOS_KEY)
          const vistos: string[] = raw ? JSON.parse(raw) : []
          setBannerVisible(!vistos.includes(conImagen.id))
        } catch {
          setBannerVisible(true)
        }
      }
    }
  }, [])

  const cargando = useRecargaEnFoco('home', cargarDatos)

  async function cerrarBanner() {
    setBannerVisible(false)
    if (!bannerAnuncio) return
    try {
      const raw = await AsyncStorage.getItem(BANNER_VISTOS_KEY)
      const vistos: string[] = raw ? JSON.parse(raw) : []
      if (!vistos.includes(bannerAnuncio.id)) {
        vistos.push(bannerAnuncio.id)
        await AsyncStorage.setItem(BANNER_VISTOS_KEY, JSON.stringify(vistos))
      }
    } catch {
      // ignorar error de storage
    }
  }

  function diasRestantes(fecha: string | null) {
    if (!fecha) return null
    const hoy = new Date()
    const vence = new Date(fecha)
    const diff = Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  function colorAlerta(dias: number | null) {
    if (dias === null) return '#888'
    if (dias <= 30) return '#ff4444'
    if (dias <= 60) return colors.primario
    return '#22c55e'
  }

  function onCarruselScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const indice = Math.round(e.nativeEvent.contentOffset.x / (ANCHO_CARRUSEL + 12))
    setMotoIndex(indice)
  }

  function renderTarjetaMoto(moto: Moto, enCarrusel = false) {
    const diasSoat = diasRestantes(moto.soat_vencimiento)
    const diasTecno = diasRestantes(moto.tecnicomecanica_vencimiento)
    return (
      <TouchableOpacity
        key={moto.id}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/editar-moto', params: { motoId: moto.id } })}
        style={[
          styles.motoCard,
          enCarrusel && { width: ANCHO_CARRUSEL },
          enCarrusel && styles.motoCardCarrusel,
        ]}
      >
        <LinearGradient
          colors={['#1a0a00', '#0a0a1a', '#001a1a']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(255,107,26,0.25)', 'transparent']}
          style={styles.motoGlowNaranja}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
        />
        <View style={styles.motoCardBorder} />
        <View style={styles.motoCardContent}>
          <View style={styles.motoTop}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.motoCyan}>{moto.marca}</Text>
              <Text style={styles.motoModelo} numberOfLines={1}>{moto.modelo}</Text>
            </View>
            <View style={styles.placaBadge}>
              <Text style={styles.placaTexto}>{moto.placa}</Text>
            </View>
          </View>

          <View style={styles.motoIconoWrap}>
            <Icono name="speedometer" size={56} color={colors.primario} />
          </View>

          <View style={styles.motoBottom}>
            <View style={styles.docRow}>
              <View style={[styles.docBadge, diasSoat !== null && diasSoat <= 0 && styles.docBadgePeligro, diasSoat !== null && diasSoat > 0 && diasSoat <= 30 && styles.docBadgeWarning]}>
                <IconoDocEstado dias={diasSoat} />
                <View>
                  <Text style={styles.docNombre}>SOAT</Text>
                  <Text style={[styles.docValor, { color: colorAlerta(diasSoat) }]}>
                    {diasSoat === null ? 'Sin fecha' : diasSoat <= 0 ? 'Vencido' : `${diasSoat}d`}
                  </Text>
                </View>
              </View>
              <View style={[styles.docBadge, diasTecno !== null && diasTecno <= 0 && styles.docBadgePeligro, diasTecno !== null && diasTecno > 0 && diasTecno <= 30 && styles.docBadgeWarning]}>
                <IconoDocEstado dias={diasTecno} />
                <View>
                  <Text style={styles.docNombre}>Tecno</Text>
                  <Text style={[styles.docValor, { color: colorAlerta(diasTecno) }]}>
                    {diasTecno === null ? 'Sin fecha' : diasTecno <= 0 ? 'Vencida' : `${diasTecno}d`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  function alertasDocumentos(): AlertaDoc[] {
    const alertas: AlertaDoc[] = []
    for (const moto of motos) {
      const diasSoat = diasRestantes(moto.soat_vencimiento)
      const diasTecno = diasRestantes(moto.tecnicomecanica_vencimiento)
      if (diasSoat !== null && diasSoat <= 30) {
        alertas.push({
          id: `${moto.id}-soat`,
          tipo: 'SOAT',
          placa: moto.placa,
          dias: diasSoat,
          vencido: diasSoat <= 0,
        })
      }
      if (diasTecno !== null && diasTecno <= 30) {
        alertas.push({
          id: `${moto.id}-tecno`,
          tipo: 'Tecno',
          placa: moto.placa,
          dias: diasTecno,
          vencido: diasTecno <= 0,
        })
      }
    }
    return alertas
  }

  function ordenarAlertas(alertas: AlertaDoc[]) {
    return [...alertas].sort((a, b) => {
      if (a.vencido !== b.vencido) return a.vencido ? -1 : 1
      return a.dias - b.dias
    })
  }

  function resumenAlertas(alertas: AlertaDoc[]) {
    const vencidos = alertas.filter((a) => a.vencido).length
    const porVencer = alertas.length - vencidos
    if (vencidos > 0 && porVencer > 0) {
      return `${vencidos} vencido${vencidos > 1 ? 's' : ''} · ${porVencer} por vencer`
    }
    if (vencidos > 0) return `${vencidos} documento${vencidos > 1 ? 's' : ''} vencido${vencidos > 1 ? 's' : ''}`
    return `${alertas.length} documento${alertas.length > 1 ? 's' : ''} por vencer`
  }

  function renderAlertaDoc(alerta: AlertaDoc) {
    const color = colorAlertaDoc(alerta)
    return (
      <View
        key={alerta.id}
        style={[styles.alertaItem, { borderColor: `${color}35` }]}
      >
        <LinearGradient
          colors={[`${color}14`, 'rgba(255,255,255,0.02)']}
          style={styles.alertaItemGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.alertaIconWrap, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}>
            <Ionicons
              name={alerta.vencido ? 'close-circle' : 'warning'}
              size={22}
              color={color}
            />
          </View>
          <View style={styles.alertaContenido}>
            <View style={styles.alertaFilaTop}>
              <Text style={styles.alertaTipo}>{alerta.tipo}</Text>
              <View style={styles.alertaPlaca}>
                <Text style={styles.alertaPlacaTexto}>{alerta.placa}</Text>
              </View>
            </View>
            <Text style={[styles.alertaDetalle, { color: `${color}cc` }]}>
              {textoAlertaDoc(alerta)}
            </Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  function colorAlertaDoc(alerta: AlertaDoc) {
    if (alerta.vencido) return '#ff6b6b'
    if (alerta.dias <= 7) return '#ff6b6b'
    return colors.primario
  }

  function textoAlertaDoc(alerta: AlertaDoc) {
    if (alerta.vencido) return alerta.tipo === 'SOAT' ? 'SOAT vencido — renueva ya' : 'Tecnomecánica vencida — renueva ya'
    if (alerta.dias === 1) return 'Vence mañana'
    return `Vence en ${alerta.dias} días`
  }

  const alertasOrdenadas = ordenarAlertas(alertasDocumentos())
  const hayMasAlertas = alertasOrdenadas.length > ALERTAS_VISIBLES
  const alertasVisibles = alertasExpandidas || !hayMasAlertas
    ? alertasOrdenadas
    : alertasOrdenadas.slice(0, ALERTAS_VISIBLES)
  const peorAlerta = alertasOrdenadas[0]
  const colorPeor = peorAlerta ? colorAlertaDoc(peorAlerta) : colors.primario

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Banner Modal */}
    <Modal visible={bannerVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.bannerCard}>
          <LinearGradient
            colors={[colors.card, colors.bg]}
            style={{ borderRadius: 24 }}
          >
            {bannerAnuncio?.imagen_url && (
              <Image
                source={{ uri: bannerAnuncio.imagen_url }}
                style={styles.bannerImagen}
                resizeMode="cover"
              />
            )}
            <View style={styles.bannerFooter}>
              <Text style={styles.bannerTitulo}>{bannerAnuncio?.titulo}</Text>
              <Text style={styles.bannerMensaje}>{bannerAnuncio?.mensaje}</Text>
            </View>
          </LinearGradient>
          <TouchableOpacity
            style={styles.bannerCerrar}
            onPress={cerrarBanner}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
      <LinearGradient
        colors={['rgba(255,107,26,0.06)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,229,255,0.03)', 'transparent']}
        style={styles.ambientBottom}
        start={{ x: 0.8, y: 0.8 }}
        end={{ x: 0.2, y: 1 }}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>
              Hola, <Text style={styles.saludoNombre}>{perfil?.nombre?.split(' ')[0]}</Text>
            </Text>
            <Text style={styles.subtitulo}>Tu garaje digital</Text>
          </View>
          <View style={styles.tuercasBadge}>
            <View style={styles.tuercasBadgeInner}>
              <Icono name="construct" size={16} color={colors.primario} />
              <Text style={styles.tuercasNumero}>{perfil?.tuercas_acumuladas}</Text>
            </View>
          </View>
        </View>

        {alertasOrdenadas.length > 0 && (
          <View style={styles.alertasWrap}>
            <View style={styles.alertasHeader}>
              <View style={styles.alertasHeaderIzq}>
                <View style={styles.alertasHeaderFila}>
                  <Ionicons name="notifications" size={16} color={colorPeor} />
                  <Text style={styles.alertasHeaderTexto}>Documentos por vencer</Text>
                </View>
                <Text style={styles.alertasResumen}>{resumenAlertas(alertasOrdenadas)}</Text>
              </View>
              <View style={[styles.alertasBadge, { backgroundColor: `${colorPeor}18`, borderColor: `${colorPeor}40` }]}>
                <Text style={[styles.alertasBadgeTexto, { color: colorPeor }]}>
                  {alertasOrdenadas.length}
                </Text>
              </View>
            </View>
            {alertasVisibles.map(renderAlertaDoc)}
            {hayMasAlertas && (
              <TouchableOpacity
                style={styles.alertasExpandirBtn}
                onPress={() => setAlertasExpandidas(!alertasExpandidas)}
              >
                <Text style={styles.alertasExpandirTexto}>
                  {alertasExpandidas
                    ? 'Ver menos'
                    : `Ver ${alertasOrdenadas.length - ALERTAS_VISIBLES} alerta${alertasOrdenadas.length - ALERTAS_VISIBLES > 1 ? 's' : ''} más`}
                </Text>
                <Ionicons
                  name={alertasExpandidas ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.primario}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {motos.length === 0 ? (
          <View style={styles.vacioCard}>
            <LinearGradient
              colors={['rgba(37,255,122,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.vacioGradient}
            >
              <View style={styles.vacioIconoWrap}>
                <Icono name="speedometer" size={36} color={colors.primario} />
              </View>
              <Text style={styles.vacioTitulo}>Agrega tu primera moto</Text>
              <Text style={styles.vacioSub}>
                Registra tu moto para llevar el historial, alertas de SOAT y mucho más.
              </Text>
              <TouchableOpacity
                style={styles.vacioBoton}
                onPress={() => router.push('/agregar-moto')}
              >
                <LinearGradient
                  colors={[colors.primario, colors.primarioOscuro]}
                  style={styles.vacioBotonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.vacioBotonTexto}>+ Agregar moto</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : motos.length === 1 ? (
          <View style={{ marginBottom: 24 }}>{renderTarjetaMoto(motos[0])}</View>
        ) : (
          <View style={styles.garajeSeccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Mi garaje · {motos.length} motos</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/garaje')}>
                <Text style={{ color: colors.primario, fontSize: 12, fontWeight: '600' }}>Ver todo →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={ANCHO_CARRUSEL + 12}
              snapToAlignment="start"
              onMomentumScrollEnd={onCarruselScroll}
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {motos.map((moto) => renderTarjetaMoto(moto, true))}
            </ScrollView>
            <View style={styles.dotsRow}>
              {motos.map((moto, i) => (
                <View
                  key={moto.id}
                  style={[styles.dot, i === motoIndex && styles.dotActivo]}
                />
              ))}
            </View>
            <Text style={styles.garajeHint}>Desliza para ver tus otras motos</Text>
          </View>
        )}

        {ultimoServicio && (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Último servicio</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/historial')}>
                <Text style={{ color: colors.primario, fontSize: 12, fontWeight: '600' }}>Ver todo →</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.servicioCard}
              onPress={() => router.push('/(tabs)/historial')}
            >
              <Text style={styles.servicioTipo}>{ultimoServicio.tipo_servicio}</Text>
              <Text style={styles.servicioMeta}>
                {new Date(ultimoServicio.fecha).toLocaleDateString('es-CO')}
                {ultimoServicio.taller_nombre ? ` · ${ultimoServicio.taller_nombre}` : ''}
              </Text>
              {ultimoServicio.origen === 'taller' && (
                <View style={styles.servicioBadge}>
                  <Text style={styles.servicioBadgeTexto}>✓ Verificado por taller</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Text style={styles.seccionTitulo}>Accesos rápidos</Text>
          </View>
          <View style={styles.accesosGrid}>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/garaje')}>
              <View style={[styles.accesoIconWrap, styles.accesoNaranja]}>
                <Icono name="speedometer" size={22} color={colors.primario} />
              </View>
              <Text style={styles.accesoNombre}>Mi Garaje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/historial')}>
              <View style={[styles.accesoIconWrap, styles.accesoCyan]}>
                <Icono name="document-text" size={22} color={colors.secundario} />
              </View>
              <Text style={styles.accesoNombre}>Historial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/mapa')}>
              <View style={[styles.accesoIconWrap, styles.accesoVerde]}>
                <Icono name="map" size={22} color="#00E676" />
              </View>
              <Text style={styles.accesoNombre}>Talleres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/perfil')}>
              <View style={[styles.accesoIconWrap, styles.accesoPurpura]}>
                <Icono name="construct" size={22} color="#b400ff" />
              </View>
              <Text style={styles.accesoNombre}>Mis Tuercas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {anuncios.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Novedades</Text>
            </View>
            {anuncios.map((anuncio) => (
              <View key={anuncio.id} style={styles.anuncioCard}>
                <View style={styles.anuncioGlow} />
                <Text style={styles.anuncioTitulo}>{anuncio.titulo}</Text>
                <Text style={styles.anuncioMensaje}>{anuncio.mensaje}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}