import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../lib/supabase'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080A0F',
    padding: 20,
    paddingTop: 60,
  },
  ambientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  back: {
    marginBottom: 24,
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  backTexto: {
    color: '#FF6B1A',
    fontSize: 15,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
    zIndex: 1,
  },
  tituloRojo: {
    color: '#ff4444',
  },
  subtituloBadge: {
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 32,
    zIndex: 1,
  },
  subtituloTexto: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 1,
  },
  boton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    zIndex: 1,
  },
  botonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})

export default function AgregarContactoSOS() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleAgregar() {
    if (!nombre || !telefono) {
      Alert.alert('Error', 'Nombre y teléfono son obligatorios')
      return
    }

    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('contactos_sos').insert({
      usuario_id: user.id,
      nombre,
      telefono,
    })

    if (error) {
      Alert.alert('Error', error.message)
      setCargando(false)
      return
    }

    Alert.alert('¡Listo!', 'Contacto agregado')
    router.back()
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,68,68,0.06)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backTexto}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>
        Contacto <Text style={styles.tituloRojo}>SOS</Text> 🆘
      </Text>

      <View style={styles.subtituloBadge}>
        <Text style={styles.subtituloTexto}>
          🔴 Esta persona recibirá tu ubicación en caso de emergencia en ruta
        </Text>
      </View>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="rgba(255,255,255,0.25)"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Teléfono *</Text>
      <TextInput
        style={styles.input}
        placeholder="300 000 0000"
        placeholderTextColor="rgba(255,255,255,0.25)"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.boton} onPress={handleAgregar} disabled={cargando}>
        <LinearGradient
          colors={['#ff4444', '#cc0000']}
          style={styles.botonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botonTexto}>Agregar contacto 🆘</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}