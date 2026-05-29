import { useState, useEffect } from 'react'
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
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function EditarMoto() {
  const { motoId } = useLocalSearchParams<{ motoId: string }>()
  const [placa, setPlaca] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anio, setAnio] = useState('')
  const [cilindraje, setCilindraje] = useState('')
  const [color, setColor] = useState('')
  const [kilometraje, setKilometraje] = useState('')
  const [soat, setSoat] = useState('')
  const [tecno, setTecno] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarMoto()
  }, [])

  async function cargarMoto() {
    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .eq('id', motoId)
      .single()

    if (error) {
      Alert.alert('Error', error.message)
      router.back()
      return
    }

    setPlaca(data.placa || '')
    setMarca(data.marca || '')
    setModelo(data.modelo || '')
    setAnio(data.anio?.toString() || '')
    setCilindraje(data.cilindraje?.toString() || '')
    setColor(data.color || '')
    setKilometraje(data.kilometraje_actual?.toString() || '')
    setSoat(data.soat_vencimiento || '')
    setTecno(data.tecnicomecanica_vencimiento || '')
    setCargando(false)
  }

  async function handleGuardar() {
    if (!placa || !marca || !modelo || !anio) {
      Alert.alert('Error', 'Placa, marca, modelo y año son obligatorios')
      return
    }

    setGuardando(true)

    const { error } = await supabase
      .from('motos')
      .update({
        placa: placa.toUpperCase(),
        marca,
        modelo,
        anio: parseInt(anio),
        cilindraje: cilindraje ? parseInt(cilindraje) : null,
        color,
        kilometraje_actual: kilometraje ? parseInt(kilometraje) : 0,
        soat_vencimiento: soat || null,
        tecnicomecanica_vencimiento: tecno || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', motoId)

    if (error) {
      Alert.alert('Error', error.message)
      setGuardando(false)
      return
    }

    Alert.alert('¡Listo!', 'Moto actualizada')
    router.back()
  }

  async function handleEliminar() {
    Alert.alert(
      'Eliminar moto',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('motos')
              .update({ activa: false })
              .eq('id', motoId)

            if (!error) router.replace('/(tabs)/garaje')
          }
        }
      ]
    )
  }

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backTexto}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Editar moto</Text>

      <TextInput style={styles.input} placeholder="Placa *" placeholderTextColor="#888" value={placa} onChangeText={setPlaca} autoCapitalize="characters" />
      <TextInput style={styles.input} placeholder="Marca *" placeholderTextColor="#888" value={marca} onChangeText={setMarca} />
      <TextInput style={styles.input} placeholder="Modelo *" placeholderTextColor="#888" value={modelo} onChangeText={setModelo} />
      <TextInput style={styles.input} placeholder="Año *" placeholderTextColor="#888" value={anio} onChangeText={setAnio} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Cilindraje" placeholderTextColor="#888" value={cilindraje} onChangeText={setCilindraje} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Color" placeholderTextColor="#888" value={color} onChangeText={setColor} />
      <TextInput style={styles.input} placeholder="Kilometraje actual" placeholderTextColor="#888" value={kilometraje} onChangeText={setKilometraje} keyboardType="numeric" />
      
      <Text style={styles.label}>Vencimiento SOAT (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="ej: 2025-12-31" placeholderTextColor="#888" value={soat} onChangeText={setSoat} />
      
      <Text style={styles.label}>Vencimiento Tecnomecánica (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="ej: 2025-12-31" placeholderTextColor="#888" value={tecno} onChangeText={setTecno} />

      <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={guardando}>
        {guardando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>Guardar cambios</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
        <Text style={styles.botonEliminarTexto}>Eliminar moto</Text>
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
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: { marginBottom: 24 },
  backTexto: { color: '#f97316', fontSize: 16 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  label: { fontSize: 14, color: '#888', marginBottom: 8 },
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
    marginBottom: 12,
  },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonEliminar: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  botonEliminarTexto: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
})