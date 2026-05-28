import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function Home() {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🏍️ Bienvenido a Parche</Text>
      <Text style={styles.subtitulo}>Tu garaje digital</Text>

      <TouchableOpacity style={styles.boton} onPress={handleLogout}>
        <Text style={styles.botonTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#888',
    marginBottom: 48,
  },
  boton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
  },
})