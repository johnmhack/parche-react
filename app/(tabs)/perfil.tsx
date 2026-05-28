import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Perfil = {
  nombre: string
  email: string
  telefono: string
  ciudad: string
  tuercas_acumuladas: number
  nivel: number
  plan: string
}

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
      <Text style={styles.titulo}>Mi Perfil</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>
          {perfil?.nombre?.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.nombre}>{perfil?.nombre}</Text>
      <Text style={styles.email}>{perfil?.email}</Text>

      <View style={styles.stats}>
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
          <Text style={styles.statNumero}>{perfil?.plan === 'premium' ? '⚡' : '🆓'}</Text>
          <Text style={styles.statLabel}>{perfil?.plan === 'premium' ? 'Premium' : 'Free'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        {perfil?.telefono && (
          <View style={styles.infoFila}>
            <Text style={styles.infoLabel}>📱 Teléfono</Text>
            <Text style={styles.infoValor}>{perfil.telefono}</Text>
          </View>
        )}
        <View style={styles.infoFila}>
          <Text style={styles.infoLabel}>📍 Ciudad</Text>
          <Text style={styles.infoValor}>{perfil?.ciudad}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botonLogout} onPress={handleLogout}>
        <Text style={styles.botonLogoutTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarTexto: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  info: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValor: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  botonLogout: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  botonLogoutTexto: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
})