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
import { router, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'

type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
}

type Registro = {
  id: string
  tipo_servicio: string
  descripcion: string
  kilometraje: number
  costo: number
  fecha: string
  verificado: boolean
  taller_id: string | null
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
  vacioEmoji: {
    fontSize: 44,
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
  const [registros, setRegistros] = useState<Registro[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoRegistros, setCargandoRegistros] = useState(false)

  useFocusEffect(
    useCallback(() => {
      cargarMotos()
    }, [])
  )

  async function cargarMotos() {
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
        cargarRegistros(data[0].id)
      }
    }
    setCargando(false)
  }

  async function cargarRegistros(motoId: string) {
    setCargandoRegistros(true)

    const [{ data: verificados }, { data: propietario }] = await Promise.all([
      supabase.from('historial_moto').select('*').eq('moto_id', motoId).order('fecha', { ascending: false }),
      supabase.from('historial_propietario').select('*').eq('moto_id', motoId).order('fecha', { ascending: false }),
    ])

    const todos = [
      ...(verificados || []).map(r => ({ ...r, verificado: true })),
      ...(propietario || []).map(r => ({ ...r, verificado: false, taller_id: null })),
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    setRegistros(todos)
    setCargandoRegistros(false)
  }

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
      <Text style={styles.vacioEmoji}>📋</Text>
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
          <Text style={styles.tituloCyan}>Historial</Text> 📋
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
          <Text style={styles.vacioEmoji}>🔧</Text>
          <Text style={styles.vacioTexto}>Sin registros aún</Text>
          <Text style={styles.vacioSub}>Agrega el primer servicio</Text>
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
                if (!item.verificado) {
                  router.push({ pathname: '/editar-historial', params: { registroId: item.id } })
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
                      {!item.verificado && (
                        <Text style={styles.propietarioLabel}>Propietario</Text>
                      )}
                      <View style={[styles.badge, item.verificado ? styles.badgeVerificado : styles.badgeEditar]}>
                        <Text style={[styles.badgeTexto, { color: item.verificado ? '#22c55e' : colors.primario }]}>
                          {item.verificado ? '✓ Verificado' : 'Editar →'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {item.descripcion && (
                    <Text style={styles.descripcion}>{item.descripcion}</Text>
                  )}

                  <View style={styles.tarjetaFooter}>
                    <View style={styles.footerBadge}>
                      <Text>📅</Text>
                      <Text style={styles.footerTexto}>
                        {new Date(item.fecha).toLocaleDateString('es-CO')}
                      </Text>
                    </View>
                    {item.kilometraje && (
                      <View style={styles.footerBadge}>
                        <Text>📍</Text>
                        <Text style={styles.footerTexto}>{item.kilometraje} km</Text>
                      </View>
                    )}
                    {item.costo && (
                      <View style={styles.footerBadge}>
                        <Text>💰</Text>
                        <Text style={styles.costoTexto}>${item.costo.toLocaleString('es-CO')}</Text>
                      </View>
                    )}
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