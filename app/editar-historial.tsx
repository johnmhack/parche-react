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

const TIPOS_SERVICIO = [
  'Cambio de aceite',
  'Frenos',
  'Suspensión',
  'Eléctrico',
  'Revisión general',
  'Llantas',
  'Transmisión',
  'Motor',
  'Otro',
]

export default function EditarHistorial() {
  const { registroId } = useLocalSearchParams<{ registroId: string }>()
  const [tipoServicio, setTipoServicio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [kilometraje, setKilometraje] = useState('')
  const [costo, setCosto] = useState('')
  const [fecha, setFecha] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarRegistro()
  }, [])

  async function cargarRegistro() {
    const { data, error } = await supabase
      .from('historial_propietario')
      .select('*')
      .eq('id', registroId)
      .single()

    if (error) {
      Alert.alert('Error', error.message)
      router.back()
      return
    }

    setTipoServicio(data.tipo_servicio || '')
    setDescripcion(data.contenido || '')
    setKilometraje(data.kilometraje?.toString() || '')
    setCosto(data.costo?.toString() || '')
    setFecha(data.fecha || '')
    setCargando(false)
  }

  async function handleGuardar() {
    if (!tipoServicio) {
      Alert.alert('Error', 'Selecciona el tipo de servicio')
      return
    }

    setGuardando(true)

    const { error } = await supabase
      .from('historial_propietario')
      .update({
        tipo_servicio: tipoServicio,
        contenido: descripcion || tipoServicio,
        kilometraje: kilometraje ? parseInt(kilometraje) : null,
        costo: costo ? parseFloat(costo) : null,
        fecha,
      })
      .eq('id', registroId)

    if (error) {
      Alert.alert('Error', error.message)
      setGuardando(false)
      return
    }

    Alert.alert('¡Listo!', 'Registro actualizado')
    router.back()
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

      <Text style={styles.titulo}>Editar registro</Text>
      <Text style={styles.subtitulo}>Solo puedes editar tus propios registros</Text>

      <Text style={styles.label}>Tipo de servicio *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {TIPOS_SERVICIO.map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.chip, tipoServicio === tipo && styles.chipActivo]}
            onPress={() => setTipoServicio(tipo)}
          >
            <Text style={[styles.chipTexto, tipoServicio === tipo && styles.chipTextoActivo]}>
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="¿Qué le hicieron a la moto?"
        placeholderTextColor="#888"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Fecha</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#888"
        value={fecha}
        onChangeText={setFecha}
      />

      <Text style={styles.label}>Kilometraje</Text>
      <TextInput
        style={styles.input}
        placeholder="ej: 15000"
        placeholderTextColor="#888"
        value={kilometraje}
        onChangeText={setKilometraje}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Costo (COP)</Text>
      <TextInput
        style={styles.input}
        placeholder="ej: 50000"
        placeholderTextColor="#888"
        value={costo}
        onChangeText={setCosto}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={guardando}>
        {guardando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>Guardar cambios</Text>
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
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: { marginBottom: 24 },
  backTexto: { color: '#f97316', fontSize: 16 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: { fontSize: 14, color: '#888', marginBottom: 8, marginTop: 8 },
  chips: { flexGrow: 0, marginBottom: 16 },
  chip: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActivo: { backgroundColor: '#f97316', borderColor: '#f97316' },
  chipTexto: { color: '#888', fontSize: 14 },
  chipTextoActivo: { color: '#fff', fontWeight: 'bold' },
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
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  boton: {
    width: '100%',
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})