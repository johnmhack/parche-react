import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
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
  anio: number
  color: string
  kilometraje_actual: number
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
  },
  scroll: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tituloNaranja: {
    color: colors.primario,
  },
  limiteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  limiteTexto: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  planBadgeFree: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planBadgePremium: {
    backgroundColor: 'rgba(255,107,26,0.1)',
    borderColor: 'rgba(255,107,26,0.3)',
  },
  planTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  planTextoFree: {
    color: 'rgba(255,255,255,0.6)',
  },
  planTextoPremium: {
    color: colors.primario,
  },
  // Moto card
  motoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.2)',
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
    fontSize: 16,
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
  editarTexto: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  motoNombre: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  motoCyan: {
    color: colors.secundario,
  },
  motoCardBottom: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detalleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detalleTexto: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  // Vacío
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  vacioEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  vacioTexto: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vacioSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  // FAB
  fab: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
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

export default function Garaje() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [plan, setPlan] = useState('free')
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      cargarMotos()
    }, [])
  )

  async function cargarMotos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (perfilData) setPlan(perfilData.plan)

    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .eq('dueno_id', user.id)
      .eq('activa', true)

    if (error) Alert.alert('Error', error.message)
    else setMotos(data || [])
    setCargando(false)
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

      <FlatList
        data={motos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.titulo}>
              Mi <Text style={styles.tituloNaranja}>Garaje</Text> 🏍️
            </Text>
            <View style={styles.limiteBadge}>
              <Text style={styles.limiteTexto}>
                {motos.length} / {plan === 'premium' ? 4 : 2} motos
              </Text>
              <View style={[styles.planBadge, plan === 'premium' ? styles.planBadgePremium : styles.planBadgeFree]}>
                <Text style={[styles.planTexto, plan === 'premium' ? styles.planTextoPremium : styles.planTextoFree]}>
                  {plan === 'premium' ? '⚡ Premium' : '🆓 Free'}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioEmoji}>🏍️</Text>
            <Text style={styles.vacioTexto}>No tienes motos registradas</Text>
            <Text style={styles.vacioSub}>Agrega tu primera moto</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/agregar-moto')}
          >
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.fabTexto}>+ Agregar moto</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/editar-moto', params: { motoId: item.id } })}
          >
            <View style={styles.motoCard}>
              <LinearGradient
                colors={[colors.card, '#0d0d1a']}
                style={styles.motoCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.motoCardTop}>
                  <View style={styles.placaWrap}>
                    <Text style={styles.placaTexto}>{item.placa}</Text>
                  </View>
                  <View style={styles.editarBtn}>
                    <Text style={styles.editarTexto}>Editar →</Text>
                  </View>
                </View>

                <Text style={styles.motoNombre}>
                  <Text style={styles.motoCyan}>{item.marca}</Text> {item.modelo} {item.anio}
                </Text>

                <View style={styles.motoCardBottom}>
                  <View style={styles.detalleBadge}>
                    <Text>🎨</Text>
                    <Text style={styles.detalleTexto}>{item.color}</Text>
                  </View>
                  <View style={styles.detalleBadge}>
                    <Text>📍</Text>
                    <Text style={styles.detalleTexto}>{item.kilometraje_actual} km</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}