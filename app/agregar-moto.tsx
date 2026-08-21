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
import { borrarCache } from '../lib/carga'
import { generarCodigoParche } from '../lib/codigoParche'
import { SafeAreaView } from 'react-native-safe-area-context'
import SelectorFecha from '../components/SelectorFecha'

const MARCAS_COMUNES = ['Honda', 'Yamaha', 'Suzuki', 'Bajaj', 'AKT', 'KTM', 'Hero', 'TVS']

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
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tituloNaranja: {
    color: colors.primario,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textoSub,
    marginBottom: 28,
    lineHeight: 18,
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActivo: {
    backgroundColor: 'rgba(37,255,122,0.12)',
    borderColor: 'rgba(37,255,122,0.35)',
  },
  chipTexto: {
    color: colors.textoSub,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: colors.primario,
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
  const [soat, setSoat] = useState('')
  const [tecno, setTecno] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleAgregar() {
    const placaLimpia = placa.trim().toUpperCase()
    const anioNum = parseInt(anio, 10)

    if (!placaLimpia || !marca.trim() || !modelo.trim() || !anio) {
      Alert.alert('Error', 'Placa, marca, modelo y año son obligatorios')
      return
    }

    if (Number.isNaN(anioNum) || anioNum < 1990 || anioNum > new Date().getFullYear() + 1) {
      Alert.alert('Error', 'Ingresa un año válido')
      return
    }

    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setCargando(false)
      return
    }

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
        perfil?.plan === 'premium' ? 'Límite alcanzado' : 'Actualiza a Premium',
        perfil?.plan === 'premium'
          ? 'Ya tienes 4 motos registradas (máximo del plan Premium).'
          : 'El plan gratuito permite hasta 2 motos. Premium permite hasta 4.',
        [{ text: 'Entendido' }]
      )
      setCargando(false)
      return
    }

    const { error } = await supabase.from('motos').insert({
      dueno_id: user.id,
      placa: placaLimpia,
      codigo_parche: generarCodigoParche(6),
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio: anioNum,
      cilindraje: cilindraje ? parseInt(cilindraje, 10) : null,
      color: color.trim() || null,
      kilometraje_actual: kilometraje ? parseInt(kilometraje, 10) : 0,
      soat_vencimiento: soat || null,
      tecnicomecanica_vencimiento: tecno || null,
    })

    setCargando(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    borrarCache('garaje')
    borrarCache('home')
    Alert.alert('¡Listo!', 'Moto agregada al garaje', [
      { text: 'OK', onPress: () => router.back() },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTexto}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Agregar <Text style={styles.tituloNaranja}>Moto</Text>
        </Text>
        <Text style={styles.subtitulo}>
          Registra tu moto para llevar el historial, alertas de SOAT y tecnomecánica.
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
          maxLength={7}
        />

        <Text style={styles.label}>Marca *</Text>
        <View style={styles.chipsWrap}>
          {MARCAS_COMUNES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, marca === m && styles.chipActivo]}
              onPress={() => setMarca(m)}
            >
              <Text style={[styles.chipTexto, marca === m && styles.chipTextoActivo]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="O escribe otra marca..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Modelo *</Text>
        <TextInput
          style={styles.input}
          placeholder="CB190R, FZ25..."
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
          maxLength={4}
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
          placeholder="Negro, rojo..."
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

        <View style={styles.divider} />
        <Text style={styles.seccionLabel}>Documentos</Text>

        <SelectorFecha
          label="Vencimiento SOAT"
          value={soat}
          onChange={setSoat}
          tituloModal="Vencimiento SOAT"
        />

        <SelectorFecha
          label="Vencimiento Tecnomecánica"
          value={tecno}
          onChange={setTecno}
          tituloModal="Vencimiento Tecnomecánica"
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
              : <Text style={styles.botonTexto}>Agregar al garaje</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}
