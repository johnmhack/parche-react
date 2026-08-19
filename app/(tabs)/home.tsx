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
  motoCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    minHeight: 180,
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
  alertaCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.35)',
  },
  alertaGradient: {
    padding: 14,
    gap: 4,
  },
  alertaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b6b',
  },
  alertaTexto: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
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

  function alertasDocumentos() {
    const alertas: string[] = []
    for (const moto of motos) {
      const diasSoat = diasRestantes(moto.soat_vencimiento)
      const diasTecno = diasRestantes(moto.tecnicomecanica_vencimiento)
      if (diasSoat !== null && diasSoat <= 30) {
        alertas.push(
          `SOAT de ${moto.placa} ${diasSoat <= 0 ? 'vencido' : `vence en ${diasSoat} días`}`
        )
      }
      if (diasTecno !== null && diasTecno <= 30) {
        alertas.push(
          `Tecnomecánica de ${moto.placa} ${diasTecno <= 0 ? 'vencida' : `vence en ${diasTecno} días`}`
        )
      }
    }
    return alertas
  }

  const alertas = alertasDocumentos()

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

        {alertas.length > 0 && (
          <View style={styles.alertaCard}>
            <LinearGradient
              colors={['rgba(255,68,68,0.12)', 'rgba(255,68,68,0.04)']}
              style={styles.alertaGradient}
            >
              <Text style={styles.alertaTitulo}>Documentos por vencer</Text>
              {alertas.map((a) => (
                <Text key={a} style={styles.alertaTexto}>• {a}</Text>
              ))}
            </LinearGradient>
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
        ) : (
          motos.map((moto) => {
          const diasSoat = diasRestantes(moto.soat_vencimiento)
          const diasTecno = diasRestantes(moto.tecnicomecanica_vencimiento)
          return (
            <View key={moto.id} style={styles.motoCard}>
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
                  <View>
                    <Text style={styles.motoCyan}>{moto.marca}</Text>
                    <Text style={styles.motoModelo}>{moto.modelo}</Text>
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
            </View>
          )
          })
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