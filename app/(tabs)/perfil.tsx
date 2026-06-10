import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'

type Perfil = {
  nombre: string
  email: string
  telefono: string
  ciudad: string
  tuercas_acumuladas: number
  nivel: number
  plan: string
  rol: string
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
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    alignSelf: 'flex-start',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  tituloNaranja: {
    color: colors.primario,
  },
  // Avatar
  avatarWrap: {
    marginBottom: 16,
    alignItems: 'center',
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#1a0a00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,107,26,0.3)',
  },
  avatarTexto: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primario,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 24,
    textAlign: 'center',
  },
  // Stats
  statsCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.2)',
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumero: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primario,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  // Info
  infoCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoGradient: {
    padding: 4,
  },
  infoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoFilaLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  infoValor: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Botones
  botonAdmin: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  botonAdminGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonAdminTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  botonLogout: {
    width: '100%',
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.25)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  botonLogoutTexto: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '700',
  },
})

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      cargarPerfil()
    }, [])
  )

  async function cargarPerfil() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) Alert.alert('Error', error.message)
    else setPerfil({ ...data, email: user.email || '' })
    setCargando(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.titulo}>
          Mi <Text style={styles.tituloNaranja}>Perfil</Text>
        </Text>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={[colors.primario, colors.primarioOscuro]}
            style={styles.avatarRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarTexto}>
                {perfil?.nombre?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.nombre}>{perfil?.nombre}</Text>
        <Text style={styles.email}>{perfil?.email}</Text>

        {/* Stats */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['#1a0a00', '#0d0d1a']}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.stat}>
              <Text style={styles.statNumero}>{perfil?.tuercas_acumuladas}</Text>
              <Text style={styles.statLabel}>🔩 Tuercas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumero}>{perfil?.nivel}</Text>
              <Text style={styles.statLabel}>⭐ Nivel</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumero}>
                {perfil?.plan === 'premium' ? '⚡' : '🆓'}
              </Text>
              <Text style={styles.statLabel}>
                {perfil?.plan === 'premium' ? 'Premium' : 'Free'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
            style={styles.infoGradient}
          >
            {perfil?.telefono && (
              <View style={styles.infoFila}>
                <Text style={styles.infoLabel}>📱 Teléfono</Text>
                <Text style={styles.infoValor}>{perfil.telefono}</Text>
              </View>
            )}
            <View style={[styles.infoFila, styles.infoFilaLast]}>
              <Text style={styles.infoLabel}>📍 Ciudad</Text>
              <Text style={styles.infoValor}>{perfil?.ciudad}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Botón Admin */}
        {perfil?.rol === 'admin' && (
          <TouchableOpacity style={styles.botonAdmin} onPress={() => router.push('/admin')}>
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.botonAdminGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.botonAdminTexto}>⚙️ Panel Admin</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.botonLogout} onPress={handleLogout}>
          <Text style={styles.botonLogoutTexto}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}