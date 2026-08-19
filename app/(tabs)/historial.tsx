import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
    height: 300,
    zIndex: 0,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
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
    marginBottom: 16,
  },
  tituloCyan: {
    color: colors.secundario,
  },
  // Chips selector
  selectorWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  motoChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  motoChipActivo: {
    backgroundColor: 'rgba(255,107,26,0.15)',
    borderColor: 'rgba(255,107,26,0.5)',
  },
  motoChipTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
  motoChipTextoActivo: {
    color: colors.primario,
  },
  // Lista
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Tarjeta registro
  tarjeta: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tarjetaGradient: {
    padding: 16,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipoServicio: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  badgeWrap: {
    alignItems: 'flex-end',
    gap: 3,
  },
  propietarioLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '600',
  },
  tallerNombre: {
    fontSize: 12,
    color: colors.secundario,
    marginBottom: 6,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeVerificado: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  badgeEditar: {
    backgroundColor: 'rgba(255,107,26,0.08)',
    borderColor: 'rgba(255,107,26,0.3)',
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  descripcion: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    lineHeight: 18,
  },
  tarjetaFooter: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  footerTexto: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  costoTexto: {
    fontSize: 11,
    color: colors.primario,
    fontWeight: '700',
  },
  // Vacío
  vacioIconoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(0,229,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  footerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vacioTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vacioSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  // Boton vacío
  boton: {
    backgroundColor: 'rgba(255,107,26,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  botonTexto: {
    color: colors.primario,
    fontWeight: '700',
    fontSize: 14,
  },
  // FAB
  fabWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  fab: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  fabGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fabTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})

export default function Historial() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [motoSeleccionada, setMotoSeleccionada] = useState<Moto | null>(null)
  const [registros, setRegistros] = useState<RegistroHistorial[]>([])
  const [cargandoRegistros, setCargandoRegistros] = useState(false)

  async function cargarRegistros(motoId: string, silencioso = false) {
    if (!silencioso) setCargandoRegistros(true)
    try {
      const todos = await cargarHistorialMoto(motoId)
      setRegistros(todos)
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar el historial')
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

    if (error) Alert.alert('Error', error.message)
    else {
      setMotos(data || [])
      if (data && data.length > 0) {
        setMotoSeleccionada(data[0])
        await cargarRegistros(data[0].id, silencioso)
      } else {
        setRegistros([])
      }
    }
  }, [])

  const cargando = useRecargaEnFoco('historial', cargarMotos)

  function seleccionarMoto(moto: Moto) {
    setMotoSeleccionada(moto)
    cargarRegistros(moto.id)
  }

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  if (motos.length === 0) return (
    <View style={styles.centered}>
      <View style={styles.vacioIconoWrap}>
        <Icono name="document-text" size={36} color={colors.secundario} />
      </View>
      <Text style={styles.vacioTexto}>No tienes motos registradas</Text>
      <TouchableOpacity style={styles.boton} onPress={() => router.push('/agregar-moto')}>
        <Text style={styles.botonTexto}>Agregar moto</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,229,255,0.04)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>
          <Text style={styles.tituloCyan}>Historial</Text>
        </Text>
      </View>

      {/* Chips selector motos */}
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

      {/* Lista registros */}
      {cargandoRegistros ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#f97316" />
        </View>
      ) : registros.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.vacioIconoWrap}>
            <Icono name="construct" size={36} color={colors.primario} />
          </View>
          <Text style={styles.vacioTexto}>Sin registros aún</Text>
          <Text style={styles.vacioSub}>Agrega un servicio o visita un taller aliado</Text>
        </View>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
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
                  colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                  style={styles.tarjetaGradient}
                >
                  <View style={styles.tarjetaHeader}>
                    <Text style={styles.tipoServicio}>{item.tipo_servicio}</Text>
                    <View style={styles.badgeWrap}>
                      {item.origen === 'propietario' && (
                        <Text style={styles.propietarioLabel}>Propietario</Text>
                      )}
                      <View style={[styles.badge, item.origen === 'taller' ? styles.badgeVerificado : styles.badgeEditar]}>
                        <Text style={[styles.badgeTexto, { color: item.origen === 'taller' ? '#22c55e' : colors.primario }]}>
                          {item.origen === 'taller' ? '✓ Verificado por taller' : 'Editar →'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {item.taller_nombre && (
                    <Text style={styles.tallerNombre}>{item.taller_nombre}</Text>
                  )}

                  {item.descripcion && (
                    <Text style={styles.descripcion}>{item.descripcion}</Text>
                  )}

                  <View style={styles.tarjetaFooter}>
                    <View style={styles.footerIconRow}>
                      <Icono name="calendar-outline" size={12} color={colors.textoSub} />
                      <Text style={styles.footerTexto}>
                        {new Date(item.fecha).toLocaleDateString('es-CO')}
                      </Text>
                    </View>
                    {item.kilometraje ? (
                      <View style={styles.footerIconRow}>
                        <Icono name="speedometer-outline" size={12} color={colors.textoSub} />
                        <Text style={styles.footerTexto}>{item.kilometraje} km</Text>
                      </View>
                    ) : null}
                    {item.costo ? (
                      <View style={styles.footerIconRow}>
                        <Icono name="cash-outline" size={12} color={colors.textoSub} />
                        <Text style={styles.costoTexto}>${item.costo.toLocaleString('es-CO')}</Text>
                      </View>
                    ) : null}
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push({ pathname: '/agregar-historial', params: { motoId: motoSeleccionada?.id, placa: motoSeleccionada?.placa } })}
        >
          <LinearGradient
            colors={[colors.primario, colors.primarioOscuro]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.fabTexto}>+ Agregar registro</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}