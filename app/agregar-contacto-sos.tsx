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
import { supabase } from '../lib/supabase'

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
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backTexto}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Agregar contacto</Text>
      <Text style={styles.subtitulo}>Esta persona recibirá tu ubicación en emergencias</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre *"
        placeholderTextColor="#888"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono *"
        placeholderTextColor="#888"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.boton} onPress={handleAgregar} disabled={cargando}>
        {cargando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>Agregar contacto</Text>
        }
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
  },
  back: {
    marginBottom: 24,
  },
  backTexto: {
    color: '#f97316',
    fontSize: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  boton: {
    width: '100%',
    backgroundColor: '#ff4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})