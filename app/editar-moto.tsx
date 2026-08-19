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
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/colors'
import { borrarCache } from '../lib/carga'
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
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
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
  botonGuardar: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    marginTop: 8,
  },
  botonGuardarGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  botonEliminar: {
    width: '100%',
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.25)',
    marginBottom: 24,
  },
  botonEliminarTexto: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    marginTop: 4,
  },
  seccionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})

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

    setGuardando(true)

    const { error } = await supabase
      .from('motos')
      .update({
        placa: placaLimpia,
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: anioNum,
        cilindraje: cilindraje ? parseInt(cilindraje, 10) : null,
        color: color.trim() || null,
        kilometraje_actual: kilometraje ? parseInt(kilometraje, 10) : 0,
        soat_vencimiento: soat || null,
        tecnicomecanica_vencimiento: tecno || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', motoId)

    setGuardando(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    borrarCache('garaje')
    borrarCache('home')
    Alert.alert('¡Listo!', 'Moto actualizada', [
      { text: 'OK', onPress: () => router.back() },
    ])
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
            if (!error) {
              borrarCache('garaje')
              borrarCache('home')
              router.replace('/(tabs)/garaje')
            }
          },
        },
      ]
    )
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTexto}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Editar <Text style={styles.tituloNaranja}>Moto</Text>
        </Text>

        <Text style={styles.seccionLabel}>Datos básicos</Text>

        <Text style={styles.label}>Placa *</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="ABC123"
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
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="O escribe otra marca..."
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Modelo *</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="CB190R, FZ25..."
          value={modelo}
          onChangeText={setModelo}
        />

        <Text style={styles.label}>Año *</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="2022"
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
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="150"
          value={cilindraje}
          onChangeText={setCilindraje}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="Negro, rojo..."
          value={color}
          onChangeText={setColor}
        />

        <Text style={styles.label}>Kilometraje actual</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="15000"
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

        <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar} disabled={guardando}>
          <LinearGradient
            colors={[colors.primario, colors.primarioOscuro]}
            style={styles.botonGuardarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {guardando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.botonTexto}>Guardar cambios</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
          <Text style={styles.botonEliminarTexto}>Eliminar moto</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}
