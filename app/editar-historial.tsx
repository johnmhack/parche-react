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
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

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

function formatearFecha(fecha: string) {
  if (!fecha) return ''
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function dateAFecha(date: Date) {
  return date.toISOString().split('T')[0]
}

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
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tituloCyan: {
    color: colors.secundario,
  },
  subtituloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  propietarioBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  propietarioTexto: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
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
  chipsWrap: {
    flexGrow: 0,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActivo: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderColor: 'rgba(0,229,255,0.4)',
  },
  chipTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: colors.secundario,
    fontWeight: '700',
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
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    marginTop: 4,
  },
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
  dateBtnTexto: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  dateBtnIcono: {
    fontSize: 16,
  },
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

export default function EditarHistorial() {
  const { registroId } = useLocalSearchParams<{ registroId: string }>()
  const [tipoServicio, setTipoServicio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [kilometraje, setKilometraje] = useState('')
  const [costo, setCosto] = useState('')
  const [fecha, setFecha] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mostrarPicker, setMostrarPicker] = useState(false)
  const [tempDate, setTempDate] = useState(new Date())

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
    if (data.fecha) setTempDate(new Date(data.fecha + 'T12:00:00'))
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTexto}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Editar <Text style={styles.tituloCyan}>Registro</Text>
        </Text>

        <View style={styles.subtituloBadge}>
          <View style={styles.propietarioBadge}>
            <Text style={styles.propietarioTexto}>👤 Solo puedes editar tus propios registros</Text>
          </View>
        </View>

        <Text style={styles.seccionLabel}>Tipo de servicio *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsWrap}>
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

        <View style={styles.divider} />
        <Text style={styles.seccionLabel}>Detalles</Text>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="¿Qué le hicieron a la moto?"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => {
            setTempDate(fecha ? new Date(fecha + 'T12:00:00') : new Date())
            setMostrarPicker(true)
          }}
        >
          <Text style={styles.dateBtnTexto}>
            {fecha ? formatearFecha(fecha) : 'Seleccionar fecha'}
          </Text>
          <Text style={styles.dateBtnIcono}>📅</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Kilometraje</Text>
        <TextInput
          style={styles.input}
          placeholder="15000"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={kilometraje}
          onChangeText={setKilometraje}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Costo (COP)</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={costo}
          onChangeText={setCosto}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={guardando}>
          <LinearGradient
            colors={[colors.primario, colors.primarioOscuro]}
            style={styles.botonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {guardando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.botonTexto}>Guardar cambios 📋</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <Modal visible={mostrarPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#1a1a2e', '#0d0d1a']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>Fecha del servicio</Text>
                  <TouchableOpacity onPress={() => setMostrarPicker(false)}>
                    <Text style={styles.modalConfirmar}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (event.type === 'set' && date) {
                      setFecha(dateAFecha(date))
                    }
                    setMostrarPicker(false)
                  }}
                  maximumDate={new Date()}
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