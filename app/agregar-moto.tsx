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
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: 20,
    paddingTop: 60,
  },
  back: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backTexto: {
    color: colors.primario,
    fontSize: 15,
    fontWeight: '600',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  tituloNaranja: {
    color: colors.primario,
  },
  seccionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    marginTop: 4,
  },
  boton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
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

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const { count } = await supabase
      .from('motos')
      .select('*', { count: 'exact', head: true })
      .eq('dueno_id', user.id)
      .eq('activa', true)

    const limite = perfil?.plan === 'premium' ? 4 : 2

    if ((count || 0) >= limite) {
      Alert.alert(
        perfil?.plan === 'premium' ? 'Límite alcanzado' : '¡Actualiza a Premium!',
        perfil?.plan === 'premium'
          ? 'Ya tienes 4 motos registradas, ese es el límite del plan Premium.'
          : 'El plan gratuito permite hasta 2 motos. Actualiza a Premium para registrar hasta 4.',
        [{ text: 'Entendido' }]
      )
      setCargando(false)
      return
    }

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTexto}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Agregar <Text style={styles.tituloNaranja}>Moto</Text>
        </Text>

        <Text style={styles.seccionLabel}>Datos básicos</Text>

        <Text style={styles.label}>Placa *</Text>
        <TextInput
          style={styles.input}
          placeholder="ABC123"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Marca *</Text>
        <TextInput
          style={styles.input}
          placeholder="Honda, Yamaha..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Modelo *</Text>
        <TextInput
          style={styles.input}
          placeholder="CB190, FZ25..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={modelo}
          onChangeText={setModelo}
        />

        <Text style={styles.label}>Año *</Text>
        <TextInput
          style={styles.input}
          placeholder="2022"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={anio}
          onChangeText={setAnio}
          keyboardType="numeric"
        />

        <View style={styles.divider} />
        <Text style={styles.seccionLabel}>Detalles</Text>

        <Text style={styles.label}>Cilindraje (cc)</Text>
        <TextInput
          style={styles.input}
          placeholder="150"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={cilindraje}
          onChangeText={setCilindraje}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          placeholder="Rojo, Negro..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={color}
          onChangeText={setColor}
        />

        <Text style={styles.label}>Kilometraje actual</Text>
        <TextInput
          style={styles.input}
          placeholder="15000"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={kilometraje}
          onChangeText={setKilometraje}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.boton} onPress={handleAgregar} disabled={cargando}>
          <LinearGradient
            colors={[colors.primario, colors.primarioOscuro]}
            style={styles.botonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {cargando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.botonTexto}>Agregar al garaje 🏍️</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>    
  )
}