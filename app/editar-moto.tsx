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
  Modal,
  Platform,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
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
  inputFocus: {
    borderColor: 'rgba(255,107,26,0.5)',
  },
  // Date picker button
  dateBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBtnActivo: {
    borderColor: 'rgba(255,107,26,0.4)',
    backgroundColor: 'rgba(255,107,26,0.06)',
  },
  dateBtnTexto: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.35)',
  },
  dateBtnTextoActivo: {
    color: '#FFFFFF',
  },
  dateBtnIcono: {
    fontSize: 16,
  },
  // Modal date picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 0,
  },
  modalGradient: {
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalConfirmar: {
    color: colors.primario,
    fontSize: 15,
    fontWeight: '700',
  },
  // Botones
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

function formatearFecha(fecha: string) {
  if (!fecha) return null
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fechaADate(fecha: string) {
  if (!fecha) return new Date()
  return new Date(fecha + 'T12:00:00')
}

function dateAFecha(date: Date) {
  return date.toISOString().split('T')[0]
}

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

  // Date picker state
  const [mostrarPickerSoat, setMostrarPickerSoat] = useState(false)
  const [mostrarPickerTecno, setMostrarPickerTecno] = useState(false)
  const [tempDateSoat, setTempDateSoat] = useState(new Date())
  const [tempDateTecno, setTempDateTecno] = useState(new Date())

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
    if (data.soat_vencimiento) setTempDateSoat(fechaADate(data.soat_vencimiento))
    if (data.tecnicomecanica_vencimiento) setTempDateTecno(fechaADate(data.tecnicomecanica_vencimiento))
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}> 
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTexto}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Editar <Text style={styles.tituloNaranja}>Moto</Text>
        </Text>

        {/* Datos básicos */}
        <Text style={styles.seccionLabel}>Datos básicos</Text>

        <Text style={styles.label}>Placa *</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="ABC123"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Marca *</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="Honda, Yamaha..."
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Modelo *</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.25)"
          placeholder="CB190, FZ25..."
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
          placeholder="Rojo, Negro..."
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

        {/* SOAT picker */}
        <Text style={styles.label}>Vencimiento SOAT</Text>
        <TouchableOpacity
          style={[styles.dateBtn, soat && styles.dateBtnActivo]}
          onPress={() => {
            setTempDateSoat(soat ? fechaADate(soat) : new Date())
            setMostrarPickerSoat(true)
          }}
        >
          <Text style={[styles.dateBtnTexto, soat && styles.dateBtnTextoActivo]}>
            {soat ? formatearFecha(soat) : 'Seleccionar fecha'}
          </Text>
          <Text style={styles.dateBtnIcono}>📅</Text>
        </TouchableOpacity>

        {/* Tecno picker */}
        <Text style={styles.label}>Vencimiento Tecnomecánica</Text>
        <TouchableOpacity
          style={[styles.dateBtn, tecno && styles.dateBtnActivo]}
          onPress={() => {
            setTempDateTecno(tecno ? fechaADate(tecno) : new Date())
            setMostrarPickerTecno(true)
          }}
        >
          <Text style={[styles.dateBtnTexto, tecno && styles.dateBtnTextoActivo]}>
            {tecno ? formatearFecha(tecno) : 'Seleccionar fecha'}
          </Text>
          <Text style={styles.dateBtnIcono}>📅</Text>
        </TouchableOpacity>

        {/* Botón guardar */}
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

        {/* Modal SOAT */}
        <Modal visible={mostrarPickerSoat} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#1a1a2e', '#0d0d1a']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>Vencimiento SOAT</Text>
                  <TouchableOpacity onPress={() => {
                    setSoat(dateAFecha(tempDateSoat))
                    setMostrarPickerSoat(false)
                  }}>
                    <Text style={styles.modalConfirmar}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDateSoat}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (event.type === 'set' && date) {
                      setSoat(dateAFecha(date))
                    }
                    setMostrarPickerSoat(false)
                  }}
                  minimumDate={new Date()}
                  themeVariant="dark"
                  locale="es-CO"
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Modal Tecno */}
        <Modal visible={mostrarPickerTecno} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#1a1a2e', '#0d0d1a']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>Vencimiento Tecnomecánica</Text>
                  <TouchableOpacity onPress={() => {
                    setTecno(dateAFecha(tempDateTecno))
                    setMostrarPickerTecno(false)
                  }}>
                    <Text style={styles.modalConfirmar}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDateTecno}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (event.type === 'set' && date) {
                      setTecno(dateAFecha(date))
                    }
                    setMostrarPickerTecno(false)
                  }}
                  minimumDate={new Date()}
                  themeVariant="dark"
                  locale="es-CO"
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>  
  )
}