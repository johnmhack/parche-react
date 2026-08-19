import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { debeMostrarSpinner } from '../../lib/carga'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'
import { cargarHistorialMoto } from '../../lib/historial'
import { Icono } from '../../lib/iconos'
import Ionicons from '@expo/vector-icons/Ionicons'
import ModalAlerta from '../../components/ModalAlerta'
import type { Moto, RegistroHistorial } from '../../lib/types'

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
    padding: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  tituloAcento: {
    color: colors.secundario,
  },
  resumenCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resumenGradient: {
    padding: 18,
    gap: 14,
  },
  resumenTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resumenIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(100,228,188,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(100,228,188,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumenInfo: {
    flex: 1,
    gap: 3,
  },
  resumenPlaca: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD600',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 2,
  },
  resumenPlacaTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  resumenMoto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resumenSub: {
    fontSize: 12,
    color: colors.textoSub,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 2,
  },
  statNumero: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textoSub,
    fontWeight: '600',
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  selectorWrap: {
    marginBottom: 16,
  },
  motoChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  motoChipActivo: {
    backgroundColor: 'rgba(100,228,188,0.1)',
    borderColor: 'rgba(100,228,188,0.35)',
  },
  motoChipTexto: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  motoChipTextoActivo: {
    color: colors.secundario,
  },
  tarjeta: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tarjetaGradient: {
    padding: 16,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  tarjetaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjetaIconWrapTaller: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.25)',
  },
  tarjetaHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  tipoServicio: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tallerNombre: {
    fontSize: 12,
    color: colors.secundario,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeVerificado: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  badgePropietario: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeTexto: {
    fontSize: 10,
    fontWeight: '700',
  },
  descripcion: {
    fontSize: 13,
    color: colors.textoSub,
    marginBottom: 12,
    lineHeight: 18,
    marginLeft: 52,
  },
  tarjetaFooter: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginLeft: 52,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  footerTexto: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  costoTexto: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  vacioCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 8,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
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
  cargandoLista: {
    paddingVertical: 40,
    alignItems: 'center',
  },
})

export default function Historial() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [motoSeleccionada, setMotoSeleccionada] = useState<Moto | null>(null)
  const [registros, setRegistros] = useState<RegistroHistorial[]>([])
  const [cargandoRegistros, setCargandoRegistros] = useState(false)
  const [alertaModal, setAlertaModal] = useState<{ titulo: string; mensaje?: string } | null>(null)
  const motoIdRef = useRef<string | null>(null)

  async function cargarRegistros(motoId: string, silencioso = false) {
    if (!silencioso) setCargandoRegistros(true)
    try {
      const todos = await cargarHistorialMoto(motoId)
      setRegistros(todos)
    } catch (error) {
      setAlertaModal({
        titulo: 'Error',
        mensaje: error instanceof Error ? error.message : 'No se pudo cargar el historial',
      })
    }
    setCargandoRegistros(false)
  }

  const cargarMotos = useCallback(async () => {
    const silencioso = !debeMostrarSpinner('historial')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('motos')
      .select('id, placa, marca, modelo')
      .eq('dueno_id', user.id)
      .eq('activa', true)

    if (error) {
      setAlertaModal({ titulo: 'Error', mensaje: error.message })
    } else {
      setMotos(data || [])
      if (data && data.length > 0) {
        const next = data.find((m) => m.id === motoIdRef.current) ?? data[0]
        motoIdRef.current = next.id
        setMotoSeleccionada(next)
        await cargarRegistros(next.id, silencioso)
      } else {
        motoIdRef.current = null
        setMotoSeleccionada(null)
        setRegistros([])
      }
    }
  }, [])

  const cargando = useRecargaEnFoco('historial', cargarMotos)

  function seleccionarMoto(moto: Moto) {
    motoIdRef.current = moto.id
    setMotoSeleccionada(moto)
    cargarRegistros(moto.id)
  }

  const verificados = registros.filter((r) => r.origen === 'taller').length
  const propios = registros.length - verificados

  function renderRegistro({ item }: { item: RegistroHistorial }) {
    const esTaller = item.origen === 'taller'
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (item.editable) {
            router.push({ pathname: '/editar-historial', params: { registroId: item.id } })
          } else if (item.taller_id) {
            router.push({ pathname: '/taller/[id]', params: { id: item.taller_id } })
          }
        }}
      >
        <View style={styles.tarjeta}>
          <LinearGradient
            colors={['#12182a', '#0d1118']}
            style={styles.tarjetaGradient}
          >
            <View style={styles.tarjetaHeader}>
              <View style={[styles.tarjetaIconWrap, esTaller && styles.tarjetaIconWrapTaller]}>
                <Icono
                  name={esTaller ? 'checkmark-circle' : 'construct-outline'}
                  size={20}
                  color={esTaller ? '#22c55e' : colors.textoSub}
                />
              </View>
              <View style={styles.tarjetaHeaderInfo}>
                <Text style={styles.tipoServicio}>{item.tipo_servicio}</Text>
                {item.taller_nombre ? (
                  <Text style={styles.tallerNombre}>{item.taller_nombre}</Text>
                ) : null}
                <View style={[styles.badge, esTaller ? styles.badgeVerificado : styles.badgePropietario]}>
                  {esTaller ? (
                    <Ionicons name="shield-checkmark" size={11} color="#22c55e" />
                  ) : (
                    <Ionicons name="person-outline" size={11} color="rgba(255,255,255,0.5)" />
                  )}
                  <Text style={[styles.badgeTexto, { color: esTaller ? '#22c55e' : 'rgba(255,255,255,0.55)' }]}>
                    {esTaller ? 'Verificado por taller' : 'Registro propio'}
                  </Text>
                </View>
              </View>
              {item.editable && (
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.25)" />
              )}
            </View>

            {item.descripcion ? (
              <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
            ) : null}

            <View style={styles.tarjetaFooter}>
              <View style={styles.footerBadge}>
                <Icono name="calendar-outline" size={12} color={colors.textoSub} />
                <Text style={styles.footerTexto}>
                  {new Date(item.fecha).toLocaleDateString('es-CO')}
                </Text>
              </View>
              {item.kilometraje ? (
                <View style={styles.footerBadge}>
                  <Icono name="speedometer-outline" size={12} color={colors.textoSub} />
                  <Text style={styles.footerTexto}>{item.kilometraje.toLocaleString('es-CO')} km</Text>
                </View>
              ) : null}
              {item.costo ? (
                <View style={styles.footerBadge}>
                  <Icono name="cash-outline" size={12} color={colors.textoSub} />
                  <Text style={styles.costoTexto}>${item.costo.toLocaleString('es-CO')}</Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    )
  }

  const header = (
    <>
      <Text style={styles.titulo}>
        Mi <Text style={styles.tituloAcento}>Historial</Text>
      </Text>

      {motoSeleccionada && (
        <View style={styles.resumenCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
            style={styles.resumenGradient}
          >
            <View style={styles.resumenTop}>
              <View style={styles.resumenIconWrap}>
                <Icono name="document-text" size={22} color={colors.secundario} />
              </View>
              <View style={styles.resumenInfo}>
                <View style={styles.resumenPlaca}>
                  <Text style={styles.resumenPlacaTexto}>{motoSeleccionada.placa}</Text>
                </View>
                <Text style={styles.resumenMoto}>
                  {motoSeleccionada.marca} {motoSeleccionada.modelo}
                </Text>
                <Text style={styles.resumenSub}>
                  {registros.length === 0
                    ? 'Sin servicios registrados'
                    : `${registros.length} servicio${registros.length > 1 ? 's' : ''} en total`}
                </Text>
              </View>
            </View>
            {registros.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Text style={styles.statNumero}>{verificados}</Text>
                  <Text style={styles.statLabel}>Verificados</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statNumero}>{propios}</Text>
                  <Text style={styles.statLabel}>Propios</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      )}

      {motos.length > 1 && (
        <>
          <Text style={styles.seccionTitulo}>Seleccionar moto</Text>
          <View style={styles.selectorWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {motos.map((moto) => (
                <TouchableOpacity
                  key={moto.id}
                  style={[styles.motoChip, motoSeleccionada?.id === moto.id && styles.motoChipActivo]}
                  onPress={() => seleccionarMoto(moto)}
                >
                  <Text style={[styles.motoChipTexto, motoSeleccionada?.id === moto.id && styles.motoChipTextoActivo]}>
                    {moto.placa}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {!cargandoRegistros && registros.length > 0 && (
        <Text style={styles.seccionTitulo}>Registros</Text>
      )}
    </>
  )

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.secundario} size="large" />
      </View>
    )
  }

  if (motos.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(100,228,188,0.04)', 'transparent']}
          style={styles.ambientTop}
          pointerEvents="none"
        />
        <View style={styles.centered}>
          <View style={styles.vacioCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.vacioGradient}
            >
              <View style={styles.vacioIconoWrap}>
                <Icono name="document-text" size={36} color={colors.secundario} />
              </View>
              <Text style={styles.vacioTitulo}>Sin motos registradas</Text>
              <Text style={styles.vacioSub}>
                Agrega una moto para empezar a llevar el historial de servicios.
              </Text>
            </LinearGradient>
          </View>
          <TouchableOpacity
            style={[styles.fab, { alignSelf: 'stretch', marginTop: 16 }]}
            onPress={() => router.push('/agregar-moto')}
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
        </View>
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
        data={cargandoRegistros ? [] : registros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          cargandoRegistros ? (
            <View style={styles.cargandoLista}>
              <ActivityIndicator color={colors.secundario} />
            </View>
          ) : (
            <View style={styles.vacioCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.vacioGradient}
              >
                <View style={styles.vacioIconoWrap}>
                  <Icono name="construct-outline" size={36} color={colors.secundario} />
                </View>
                <Text style={styles.vacioTitulo}>Sin registros aún</Text>
                <Text style={styles.vacioSub}>
                  Agrega un servicio manualmente o visita un taller aliado Torker.
                </Text>
              </LinearGradient>
            </View>
          )
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push({
              pathname: '/agregar-historial',
              params: { motoId: motoSeleccionada?.id, placa: motoSeleccionada?.placa },
            })}
          >
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" />
              <Text style={styles.fabTexto}>Agregar registro</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
        renderItem={renderRegistro}
      />
    </View>
  )
}
