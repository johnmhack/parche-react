import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import * as Location from 'expo-location'
import { useFocusEffect, router } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Contacto = {
  id: string
  nombre: string
  telefono: string
}

export default function SOS() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      cargarContactos()
    }, [])
  )

  async function cargarContactos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('contactos_sos')
      .select('*')
      .eq('usuario_id', user.id)

    setContactos(data || [])
    setCargando(false)
  }

  async function handleSOS() {
    if (contactos.length === 0) {
      Alert.alert('Sin contactos', 'Agrega contactos de emergencia primero')
      return
    }

    Alert.alert(
      '🆘 Activar SOS',
      '¿Confirmas que necesitas ayuda? Se enviará tu ubicación a tus contactos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'SÍ, NECESITO AYUDA', style: 'destructive', onPress: enviarSOS },
      ]
    )
  }

  async function enviarSOS() {
    setEnviando(true)

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Error', 'Necesitamos acceso a tu ubicación')
      setEnviando(false)
      return
    }

    const location = await Location.getCurrentPositionAsync({})
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('mensajes_sos').insert({
      usuario_id: user.id,
      latitud: location.coords.latitude,
      longitud: location.coords.longitude,
      mensaje: '¡Necesito ayuda! Esta es mi ubicación.',
    })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('✅ SOS Enviado', 'Tu ubicación fue enviada a tus contactos de emergencia.')
    }

    setEnviando(false)
  }

  function agregarContacto() {
  router.push('/agregar-contacto-sos')
}
async function eliminarContacto(id: string) {
  Alert.alert('Eliminar contacto', '¿Estás seguro?', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Eliminar',
      style: 'destructive',
      onPress: async () => {
        await supabase.from('contactos_sos').delete().eq('id', id)
        cargarContactos()
      }
    }
  ])
}
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🆘 SOS</Text>
      <Text style={styles.subtitulo}>Emergencias en ruta</Text>

      <TouchableOpacity
        style={[styles.botonSOS, enviando && styles.botonSOSDesactivado]}
        onPress={handleSOS}
        disabled={enviando}
      >
        {enviando
          ? <ActivityIndicator color="#fff" size="large" />
          : <Text style={styles.botonSOSTexto}>PEDIR AYUDA</Text>
        }
      </TouchableOpacity>

      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Text style={styles.seccionTitulo}>Contactos de emergencia</Text>
          <TouchableOpacity onPress={agregarContacto}>
            <Text style={styles.agregar}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator color="#f97316" />
        ) : contactos.length === 0 ? (
          <Text style={styles.vacio}>No tienes contactos de emergencia</Text>
        ) : (
          <FlatList
            data={contactos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.contacto}>
                <View style={styles.contactoAvatar}>
                  <Text style={styles.contactoAvatarTexto}>
                    {item.nombre.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactoNombre}>{item.nombre}</Text>
                  <Text style={styles.contactoTelefono}>{item.telefono}</Text>
                </View>
                <TouchableOpacity onPress={() => eliminarContacto(item.id)}>
                  <Text style={{ color: '#ff4444', fontSize: 14, fontWeight: 'bold' }}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
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
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  botonSOS: {
    backgroundColor: '#ff4444',
    borderRadius: 100,
    width: 180,
    height: 180,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  botonSOSDesactivado: {
    backgroundColor: '#882222',
  },
  botonSOSTexto: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  seccion: {
    flex: 1,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  agregar: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vacio: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  contacto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  contactoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactoAvatarTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactoNombre: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  contactoTelefono: {
    color: '#888',
    fontSize: 14,
  },
})