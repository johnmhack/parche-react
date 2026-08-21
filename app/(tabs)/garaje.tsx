import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { getCache, setCache } from '../../lib/carga'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'
import { Icono, IconoDocEstado } from '../../lib/iconos'
import Ionicons from '@expo/vector-icons/Ionicons'
import { alertaLimiteMotos, esPremium, limitesPlan } from '../../lib/planes'
import ModalAlerta from '../../components/ModalAlerta'

type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
  anio: number
  color: string | null
  kilometraje_actual: number
  soat_vencimiento: string | null
  tecnicomecanica_vencimiento: string | null
}

type GarajeCache = { motos: Moto[]; plan: string }

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
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  tituloAcento: {
    color: colors.secundario,
  },
  resumenCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.bordeSubtil,
  },
  resumenGradient: {
    padding: 18,
    gap: 14,
  },
  resumenTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumenInfo: {
    flex: 1,
    gap: 4,
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
  },
  progresoFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.secundario,
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
  motoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  motoCardGradient: {
    padding: 18,
  },
  motoCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  placaWrap: {
    backgroundColor: '#FFD600',
    borderWidth: 1,
    borderColor: '#e6c000',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  placaTexto: {
    fontWeight: '700',
    fontSize: 15,
    color: '#000000',
    letterSpacing: 2,
  },
  editarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37,255,122,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,255,122,0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qrBtnTexto: {
    color: colors.primario,
    fontSize: 12,
    fontWeight: '700',
  },
  editarTexto: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  motoMarca: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secundario,
    marginBottom: 2,
  },
  motoModelo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  detalleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detalleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detalleTexto: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  docRow: {
    flexDirection: 'row',
    gap: 8,
  },
  docBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  docBadgePeligro: {
    borderColor: 'rgba(255,107,107,0.35)',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  docBadgeWarning: {
    borderColor: 'rgba(251,191,36,0.3)',
    backgroundColor: 'rgba(251,191,36,0.08)',
  },
  docNombre: {
    fontSize: 10,
    color: colors.textoSub,
  },
  docValor: {
    fontSize: 12,
    fontWeight: '700',
  },
  vacioCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  vacioGradient: {
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  vacioIconoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
  fab: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  fabDisabled: {
    opacity: 0.45,
  },
  fabGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabTexto: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})

function diasRestantes(fecha: string | null) {
  if (!fecha) return null
  const hoy = new Date()
  const vence = new Date(fecha)
  return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

function colorDoc(dias: number | null) {
  if (dias === null) return '#888'
  if (dias <= 0) return '#ff6b6b'
  if (dias <= 30) return '#fbbf24'
  return '#22c55e'
}

function textoDoc(dias: number | null) {
  if (dias === null) return 'Sin fecha'
  if (dias <= 0) return 'Vencido'
  return `${dias}d`
}

export default function Garaje() {
  const cacheInicial = getCache<GarajeCache>('garaje')
  const [motos, setMotos] = useState<Moto[]>(cacheInicial?.motos ?? [])
  const [plan, setPlan] = useState(cacheInicial?.plan ?? 'free')
  const [alertaModal, setAlertaModal] = useState<{ titulo: string; mensaje?: string; variante?: 'error' | 'premium' } | null>(null)

  const cargarMotos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const planActual = perfilData?.plan ?? 'free'
    if (perfilData) setPlan(planActual)

    const { data, error } = await supabase
      .from('motos')
      .select('id, placa, marca, modelo, anio, color, kilometraje_actual, soat_vencimiento, tecnicomecanica_vencimiento')
      .eq('dueno_id', user.id)
      .eq('activa', true)

    if (error) {
      setAlertaModal({ titulo: 'Error', mensaje: error.message, variante: 'error' })
    } else {
      const lista = data || []
      setMotos(lista)
      setCache('garaje', { motos: lista, plan: planActual })
    }
  }, [])

  const cargandoRemoto = useRecargaEnFoco('garaje', cargarMotos)
  const cargando = cargandoRemoto && motos.length === 0

  const limites = limitesPlan(plan)
  const premium = esPremium(plan)
  const enLimite = motos.length >= limites.motos
  const pctMotos = Math.min(100, (motos.length / limites.motos) * 100)

  function irAgregarMoto() {
    if (enLimite) {
      const { titulo, mensaje } = alertaLimiteMotos(plan)
      setAlertaModal({ titulo, mensaje, variante: 'premium' })
      return
    }
    router.push('/agregar-moto')
  }

  function renderMoto({ item }: { item: Moto }) {
    const diasSoat = diasRestantes(item.soat_vencimiento)
    const diasTecno = diasRestantes(item.tecnicomecanica_vencimiento)

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/editar-moto', params: { motoId: item.id } })}
      >
        <View style={styles.motoCard}>
          <LinearGradient
            colors={['#12182a', '#0d1118']}
            style={styles.motoCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.motoCardTop}>
              <View style={styles.placaWrap}>
                <Text style={styles.placaTexto}>{item.placa}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  style={styles.qrBtn}
                  onPress={(e) => {
                    e.stopPropagation?.()
                    router.push({ pathname: '/moto-codigo', params: { motoId: item.id } })
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="qr-code-outline" size={18} color={colors.primario} />
                  <Text style={styles.qrBtnTexto}>QR</Text>
                </TouchableOpacity>
                <View style={styles.editarBtn}>
                  <Text style={styles.editarTexto}>Editar</Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.45)" />
                </View>
              </View>
            </View>

            <Text style={styles.motoMarca}>{item.marca}</Text>
            <Text style={styles.motoModelo}>{item.modelo} {item.anio}</Text>

            <View style={styles.detalleRow}>
              {item.color ? (
                <View style={styles.detalleBadge}>
                  <Ionicons name="color-palette-outline" size={14} color={colors.textoSub} />
                  <Text style={styles.detalleTexto}>{item.color}</Text>
                </View>
              ) : null}
              <View style={styles.detalleBadge}>
                <Icono name="speedometer-outline" size={14} color={colors.textoSub} />
                <Text style={styles.detalleTexto}>
                  {item.kilometraje_actual.toLocaleString('es-CO')} km
                </Text>
              </View>
            </View>

            <View style={styles.docRow}>
              <View style={[
                styles.docBadge,
                diasSoat !== null && diasSoat <= 0 && styles.docBadgePeligro,
                diasSoat !== null && diasSoat > 0 && diasSoat <= 30 && styles.docBadgeWarning,
              ]}>
                <IconoDocEstado dias={diasSoat} />
                <View>
                  <Text style={styles.docNombre}>SOAT</Text>
                  <Text style={[styles.docValor, { color: colorDoc(diasSoat) }]}>{textoDoc(diasSoat)}</Text>
                </View>
              </View>
              <View style={[
                styles.docBadge,
                diasTecno !== null && diasTecno <= 0 && styles.docBadgePeligro,
                diasTecno !== null && diasTecno > 0 && diasTecno <= 30 && styles.docBadgeWarning,
              ]}>
                <IconoDocEstado dias={diasTecno} />
                <View>
                  <Text style={styles.docNombre}>Tecno</Text>
                  <Text style={[styles.docValor, { color: colorDoc(diasTecno) }]}>{textoDoc(diasTecno)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    )
  }

  const header = (
    <>
      <Text style={styles.titulo}>
        Mi <Text style={styles.tituloAcento}>Garaje</Text>
      </Text>

      <View style={styles.resumenCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.resumenGradient}
        >
          <View style={styles.resumenTop}>
            <View style={styles.resumenInfo}>
              <Text style={styles.resumenTitulo}>
                {motos.length === 0 ? 'Sin motos registradas' : `${motos.length} moto${motos.length > 1 ? 's' : ''} activa${motos.length > 1 ? 's' : ''}`}
              </Text>
              <Text style={styles.resumenSub}>
                {premium ? 'Plan Premium · hasta 4 motos' : 'Plan Free · hasta 2 motos'}
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
              <Text style={styles.progresoValor}>{motos.length} / {limites.motos}</Text>
            </View>
            <View style={[styles.progresoBar, { marginTop: 6 }]}>
              <View style={[styles.progresoFill, {
                width: `${pctMotos}%`,
                backgroundColor: enLimite ? '#ff6b6b' : colors.secundario,
              }]} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {motos.length > 0 && (
        <Text style={styles.seccionTitulo}>Tus motos</Text>
      )}
    </>
  )

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ModalAlerta
        visible={!!alertaModal}
        titulo={alertaModal?.titulo ?? ''}
        mensaje={alertaModal?.mensaje}
        variante={alertaModal?.variante ?? 'error'}
        onCerrar={() => setAlertaModal(null)}
      />
      <LinearGradient
        colors={['rgba(100,228,188,0.04)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.02)', 'transparent']}
        style={styles.ambientBottom}
        start={{ x: 0.8, y: 1 }}
        end={{ x: 0.2, y: 0.5 }}
        pointerEvents="none"
      />

      <FlatList
        data={motos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.vacioCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.vacioGradient}
            >
              <View style={styles.vacioIconoWrap}>
                <Icono name="speedometer" size={36} color={colors.secundario} />
              </View>
              <Text style={styles.vacioTitulo}>Agrega tu primera moto</Text>
              <Text style={styles.vacioSub}>
                Registra placa, marca, SOAT y tecnomecánica para llevar el control de tu garaje.
              </Text>
            </LinearGradient>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.fab, enLimite && styles.fabDisabled]}
            onPress={irAgregarMoto}
          >
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" />
              <Text style={styles.fabTexto}>Agregar moto</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
        renderItem={renderMoto}
      />
    </View>
  )
}
