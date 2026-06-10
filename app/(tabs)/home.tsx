import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'

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
  tuercasEmoji: {
    fontSize: 16,
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
  motoEmoji: {
    fontSize: 56,
    position: 'absolute',
    right: 16,
    bottom: 48,
    transform: [{ scaleX: -1 }],
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
    fontSize: 20,
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
})

export default function Home() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [motos, setMotos] = useState<Moto[]>([])
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      cargarDatos()
    }, [])
  )

  async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: perfilData }, { data: motosData }, { data: anunciosData }] = await Promise.all([
      supabase.from('perfiles').select('nombre, tuercas_acumuladas, nivel, plan').eq('id', user.id).single(),
      supabase.from('motos').select('id, placa, marca, modelo, soat_vencimiento, tecnicomecanica_vencimiento').eq('dueno_id', user.id).eq('activa', true),
      supabase.from('anuncios').select('id, titulo, mensaje, dirigido_a').eq('activo', true),
    ])

    if (perfilData) setPerfil(perfilData)
    if (motosData) setMotos(motosData)
    if (anunciosData) {
      const filtrados = anunciosData.filter(a =>
        a.dirigido_a === 'todos' || a.dirigido_a === (perfilData?.plan || 'free')
      )
      setAnuncios(filtrados)
    }
    setCargando(false)
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

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  return (
    <View style={styles.container}>
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
              Hola, <Text style={styles.saludoNombre}>{perfil?.nombre?.split(' ')[0]}</Text> 👋
            </Text>
            <Text style={styles.subtitulo}>Tu garaje digital</Text>
          </View>
          <View style={styles.tuercasBadge}>
            <Text style={styles.tuercasEmoji}>🔩</Text>
            <Text style={styles.tuercasNumero}>{perfil?.tuercas_acumuladas}</Text>
          </View>
        </View>

        {motos.length > 0 && motos.map((moto) => {
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

                <Text style={styles.motoEmoji}>🏍️</Text>

                <View style={styles.motoBottom}>
                  <View style={styles.docRow}>
                    <View style={[styles.docBadge, diasSoat !== null && diasSoat <= 0 && styles.docBadgePeligro, diasSoat !== null && diasSoat > 0 && diasSoat <= 30 && styles.docBadgeWarning]}>
                      <Text style={styles.docIcon}>{diasSoat !== null && diasSoat <= 0 ? '🚨' : diasSoat !== null && diasSoat <= 30 ? '⚠️' : '✅'}</Text>
                      <View>
                        <Text style={styles.docNombre}>SOAT</Text>
                        <Text style={[styles.docValor, { color: colorAlerta(diasSoat) }]}>
                          {diasSoat === null ? 'Sin fecha' : diasSoat <= 0 ? 'Vencido' : `${diasSoat}d`}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.docBadge, diasTecno !== null && diasTecno <= 0 && styles.docBadgePeligro, diasTecno !== null && diasTecno > 0 && diasTecno <= 30 && styles.docBadgeWarning]}>
                      <Text style={styles.docIcon}>{diasTecno !== null && diasTecno <= 0 ? '🚨' : diasTecno !== null && diasTecno <= 30 ? '⚠️' : '✅'}</Text>
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
        })}

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Text style={styles.seccionTitulo}>Accesos rápidos</Text>
          </View>
          <View style={styles.accesosGrid}>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/garaje')}>
              <View style={[styles.accesoIconWrap, styles.accesoNaranja]}>
                <Text style={styles.accesoIcono}>🏍️</Text>
              </View>
              <Text style={styles.accesoNombre}>Mi Garaje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/historial')}>
              <View style={[styles.accesoIconWrap, styles.accesoCyan]}>
                <Text style={styles.accesoIcono}>📋</Text>
              </View>
              <Text style={styles.accesoNombre}>Historial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/mapa')}>
              <View style={[styles.accesoIconWrap, styles.accesoVerde]}>
                <Text style={styles.accesoIcono}>🗺️</Text>
              </View>
              <Text style={styles.accesoNombre}>Talleres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accesoCard} onPress={() => router.push('/(tabs)/perfil')}>
              <View style={[styles.accesoIconWrap, styles.accesoPurpura]}>
                <Text style={styles.accesoIcono}>🔩</Text>
              </View>
              <Text style={styles.accesoNombre}>Mis Tuercas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {anuncios.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>📢 Novedades</Text>
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