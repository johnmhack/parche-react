import { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../lib/colors'
import { supabase } from '../../lib/supabase'
import { contarServiciosEnTaller, obtenerTaller } from '../../lib/talleres'
import type { Taller } from '../../lib/types'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.blanco,
  },
  scroll: {
    padding: 20,
    paddingTop: 8,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borde,
  },
  cardGradient: {
    padding: 20,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.blanco,
    marginBottom: 6,
  },
  aliadoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37,255,122,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,255,122,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  aliadoTexto: {
    color: colors.primario,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  direccion: {
    fontSize: 14,
    color: colors.textoSub,
    marginBottom: 12,
    lineHeight: 20,
  },
  calificacion: {
    fontSize: 14,
    color: colors.primario,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoriaChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoriaTexto: {
    color: colors.texto,
    fontSize: 12,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secundario,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textoSub,
    marginTop: 4,
    textAlign: 'center',
  },
  boton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  botonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  botonTexto: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  botonSecundario: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borde,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: colors.textoSub,
    fontSize: 13,
    fontWeight: '600',
  },
  notaHistorial: {
    fontSize: 12,
    color: colors.textoSub,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  errorTexto: {
    color: colors.textoSub,
    fontSize: 15,
  },
})

export default function TallerDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [taller, setTaller] = useState<Taller | null>(null)
  const [serviciosCount, setServiciosCount] = useState(0)

  const cargarTaller = useCallback(async () => {
    if (!id) return
    const data = await obtenerTaller(id)
    setTaller(data)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: motos } = await supabase
        .from('motos')
        .select('id')
        .eq('dueno_id', user.id)
        .eq('activa', true)

      const motoIds = (motos ?? []).map((m) => m.id)
      const count = await contarServiciosEnTaller(id, motoIds)
      setServiciosCount(count)
    }
  }, [id])

  const cargando = useRecargaEnFoco(`taller-${id}`, cargarTaller)

  function llamar() {
    if (!taller?.telefono) return
    Linking.openURL(`tel:${taller.telefono}`).catch(() =>
      Alert.alert('Error', 'No se pudo abrir el teléfono')
    )
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    )
  }

  if (!taller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.blanco} />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Taller</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorTexto}>Taller no encontrado</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Taller aliado</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(37,255,122,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.cardGradient}
          >
            <View style={styles.aliadoBadge}>
              <Text style={styles.aliadoTexto}>TALLER ALIADO PARCHE</Text>
            </View>
            <Text style={styles.nombre}>{taller.nombre}</Text>
            <Text style={styles.direccion}>{taller.direccion}</Text>
            {taller.calificacion_promedio > 0 && (
              <Text style={styles.calificacion}>⭐ {taller.calificacion_promedio.toFixed(1)}</Text>
            )}
            {taller.categorias?.length > 0 && (
              <View style={styles.categoriasWrap}>
                {taller.categorias.map((cat) => (
                  <View key={cat} style={styles.categoriaChip}>
                    <Text style={styles.categoriaTexto}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumero}>{serviciosCount}</Text>
            <Text style={styles.statLabel}>Servicios en tus motos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumero}>{taller.categorias?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Especialidades</Text>
          </View>
        </View>

        {taller.telefono && (
          <TouchableOpacity style={styles.boton} onPress={llamar}>
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.botonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="call" size={18} color="#000" />
              <Text style={styles.botonTexto}>Llamar al taller</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={() => router.push('/(tabs)/historial')}
        >
          <Text style={styles.botonSecundarioTexto}>Ver historial clínico →</Text>
        </TouchableOpacity>

        <Text style={styles.notaHistorial}>
          Los servicios que registre este taller aparecerán en tu historial como verificados.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
