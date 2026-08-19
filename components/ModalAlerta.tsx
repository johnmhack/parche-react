import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '../lib/colors'

export type BotonModalAlerta = {
  texto: string
  estilo?: 'primario' | 'secundario' | 'destructivo'
  onPress?: () => void
}

type Variante = 'info' | 'exito' | 'error' | 'premium'

type Props = {
  visible: boolean
  titulo: string
  mensaje?: string
  variante?: Variante
  botones?: BotonModalAlerta[]
  onCerrar: () => void
}

const ICONOS: Record<Variante, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  exito: 'checkmark-circle',
  error: 'alert-circle',
  premium: 'diamond',
}

const COLORES: Record<Variante, string> = {
  info: colors.secundario,
  exito: colors.primario,
  error: '#ff6b6b',
  premium: colors.primario,
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardInner: {
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  mensaje: {
    fontSize: 14,
    color: colors.textoSub,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  botones: {
    width: '100%',
    gap: 10,
  },
  botonPrimario: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  botonPrimarioGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  botonSecundario: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  botonSecundarioTexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '600',
  },
  botonDestructivo: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.35)',
    backgroundColor: 'rgba(255,68,68,0.1)',
  },
  botonDestructivoTexto: {
    color: '#ff6b6b',
    fontSize: 15,
    fontWeight: '700',
  },
})

export default function ModalAlerta({
  visible,
  titulo,
  mensaje,
  variante = 'info',
  botones = [{ texto: 'Entendido', estilo: 'primario' }],
  onCerrar,
}: Props) {
  const color = COLORES[variante]

  function handleBoton(boton: BotonModalAlerta) {
    onCerrar()
    boton.onPress?.()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.overlay} onPress={onCerrar}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <LinearGradient colors={['#12182a', '#0a0f1a']} style={styles.cardInner}>
            <View style={[styles.iconWrap, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
              <Ionicons name={ICONOS[variante]} size={28} color={color} />
            </View>
            <Text style={styles.titulo}>{titulo}</Text>
            {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
            <View style={styles.botones}>
              {botones.map((boton) => {
                if (boton.estilo === 'destructivo') {
                  return (
                    <TouchableOpacity
                      key={boton.texto}
                      style={styles.botonDestructivo}
                      onPress={() => handleBoton(boton)}
                    >
                      <Text style={styles.botonDestructivoTexto}>{boton.texto}</Text>
                    </TouchableOpacity>
                  )
                }
                if (boton.estilo === 'secundario') {
                  return (
                    <TouchableOpacity
                      key={boton.texto}
                      style={styles.botonSecundario}
                      onPress={() => handleBoton(boton)}
                    >
                      <Text style={styles.botonSecundarioTexto}>{boton.texto}</Text>
                    </TouchableOpacity>
                  )
                }
                return (
                  <TouchableOpacity
                    key={boton.texto}
                    style={styles.botonPrimario}
                    onPress={() => handleBoton(boton)}
                  >
                    <LinearGradient
                      colors={[colors.primario, colors.primarioOscuro]}
                      style={styles.botonPrimarioGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.botonPrimarioTexto}>{boton.texto}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )
              })}
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
