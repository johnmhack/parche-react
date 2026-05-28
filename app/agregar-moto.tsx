import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function AgregarMoto() {
  const [placa, setPlaca] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anio, setAnio] = useState('')
  const [cilindraje, setCilindraje] = useState('')
  const [color, setColor] = useState('')
  const [kilometraje, setKilometraje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleAgregar() {
    if (!placa || !marca || !modelo || !anio) {
      Alert.alert('Error', 'Placa, marca, modelo y año son obligatorios')
      return
    }

    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('motos').insert({
      dueno_id: user.id,
      placa: placa.toUpperCase(),
      marca,
      modelo,
      anio: parseInt(anio),
      cilindraje: cilindraje ? parseInt(cilindraje) : null,
      color,
      kilometraje_actual: kilometraje ? parseInt(kilometraje) : 0,
    })

    if (error) {
      Alert.alert('Error', error.message)
      setCargando(false)
      return
    }

    Alert.alert('¡Listo!', 'Moto agregada al garaje')
    router.back()
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backTexto}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Agregar moto</Text>

      <TextInput
        style={styles.input}
        placeholder="Placa *"
        placeholderTextColor="#888"
        value={placa}
        onChangeText={setPlaca}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Marca * (ej: Honda)"
        placeholderTextColor="#888"
        value={marca}
        onChangeText={setMarca}
      />
      <TextInput
        style={styles.input}
        placeholder="Modelo * (ej: CB 190)"
        placeholderTextColor="#888"
        value={modelo}
        onChangeText={setModelo}
      />
      <TextInput
        style={styles.input}
        placeholder="Año * (ej: 2022)"
        placeholderTextColor="#888"
        value={anio}
        onChangeText={setAnio}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Cilindraje (ej: 190)"
        placeholderTextColor="#888"
        value={cilindraje}
        onChangeText={setCilindraje}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Color"
        placeholderTextColor="#888"
        value={color}
        onChangeText={setColor}
      />
      <TextInput
        style={styles.input}
        placeholder="Kilometraje actual"
        placeholderTextColor="#888"
        value={kilometraje}
        onChangeText={setKilometraje}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.boton} onPress={handleAgregar} disabled={cargando}>
        {cargando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>Agregar al garaje</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 24,
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
    backgroundColor: '#f97316',
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