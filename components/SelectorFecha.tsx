import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Pressable,
} from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '../lib/colors'
import { dateAFecha, fechaADate, formatearFecha } from '../lib/fechas'

type Props = {
  label: string
  value: string
  onChange: (fecha: string) => void
  tituloModal: string
  opcional?: boolean
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
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
    flex: 1,
  },
  dateBtnTextoActivo: {
    color: '#FFFFFF',
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
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  modalAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalCancelar: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmar: {
    color: colors.primario,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerWrap: {
    alignItems: 'center',
  },
})

export default function SelectorFecha({
  label,
  value,
  onChange,
  tituloModal,
  opcional = true,
}: Props) {
  const [visible, setVisible] = useState(false)
  const [tempDate, setTempDate] = useState(() => (value ? fechaADate(value) : new Date()))

  function abrir() {
    setTempDate(value ? fechaADate(value) : new Date())
    setVisible(true)
  }

  function cerrar() {
    setVisible(false)
  }

  function confirmar() {
    onChange(dateAFecha(tempDate))
    cerrar()
  }

  function onPickerChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      cerrar()
      if (event.type === 'set' && date) {
        onChange(dateAFecha(date))
      }
      return
    }
    if (date) setTempDate(date)
  }

  return (
    <View>
      <Text style={styles.label}>
        {label}
        {!opcional ? ' *' : ''}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <TouchableOpacity
          style={[styles.dateBtn, value && styles.dateBtnActivo, { flex: 1 }]}
          onPress={abrir}
        >
          <Text style={[styles.dateBtnTexto, value && styles.dateBtnTextoActivo]}>
            {value ? formatearFecha(value) : 'Seleccionar fecha'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.primario} />
        </TouchableOpacity>
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Android: picker nativo del sistema (sin modal) */}
      {Platform.OS === 'android' && visible && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onPickerChange}
        />
      )}

      {/* iOS: modal con spinner */}
      {Platform.OS === 'ios' && (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar}>
          <Pressable style={styles.modalOverlay} onPress={cerrar}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <LinearGradient colors={['#1a1a2e', '#0d0d1a']} style={styles.modalGradient}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>{tituloModal}</Text>
                  <View style={styles.modalAcciones}>
                    <TouchableOpacity onPress={cerrar} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                      <Text style={styles.modalCancelar}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmar} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                      <Text style={styles.modalConfirmar}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerWrap}>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onPickerChange}
                    themeVariant="dark"
                    locale="es-CO"
                    style={{ width: '100%' }}
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  )
}
