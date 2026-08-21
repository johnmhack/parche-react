import { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Share,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/colors'
import { generarCodigoParche } from '../lib/codigoParche'
import { useCargaInicial } from '../lib/useRecargaEnFoco'

export default function MotoCodigo() {
  const { motoId } = useLocalSearchParams<{ motoId: string }>()
  const [placa, setPlaca] = useState('')
  const [codigo, setCodigo] = useState('')

  const cargar = useCallback(async () => {
    if (!motoId) return
    const { data, error } = await supabase
      .from('motos')
      .select('id, placa, codigo_parche')
      .eq('id', motoId)
      .single()

    if (error || !data) {
      Alert.alert('Error', 'No se pudo cargar la moto')
      return
    }

    setPlaca(data.placa || '')
    let code = (data.codigo_parche as string | null)?.trim().toUpperCase() || ''

    if (!code) {
      for (let intento = 0; intento < 5; intento++) {
        code = generarCodigoParche(6)
        const { error: upErr } = await supabase
          .from('motos')
          .update({ codigo_parche: code })
          .eq('id', motoId)
        if (!upErr) break
        code = ''
      }
    }

    setCodigo(code)
  }, [motoId])

  const cargando = useCargaInicial(`moto-codigo-${motoId}`, cargar)

  const qrUri = codigo
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(codigo)}`
    : null

  async function compartir() {
    if (!codigo) return
    await Share.share({
      message: `Código Parche de mi moto ${placa}: ${codigo}`,
    })
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backTexto}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>
        Código <Text style={styles.acento}>Parche</Text>
      </Text>
      <Text style={styles.sub}>
        Muéstralo en el taller. Solo con este código pueden buscar tu moto (no con la placa).
      </Text>

      {qrUri ? (
        <View style={styles.qrWrap}>
          <Image source={{ uri: qrUri }} style={styles.qr} />
        </View>
      ) : null}

      <Text style={styles.codigo}>{codigo || '—'}</Text>
      <Text style={styles.hint}>El taller lo escribe en Parche · Motos</Text>

      <TouchableOpacity style={styles.btn} onPress={compartir} disabled={!codigo}>
        <Text style={styles.btnTexto}>Compartir código</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    marginTop: 8,
    marginBottom: 20,
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
    color: '#fff',
    marginBottom: 8,
  },
  acento: {
    color: colors.primario,
  },
  sub: {
    color: colors.textoSub,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },
  qrWrap: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  qr: {
    width: 220,
    height: 220,
  },
  codigo: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.primario,
    marginBottom: 8,
  },
  hint: {
    textAlign: 'center',
    color: colors.textoMuted,
    fontSize: 12,
    marginBottom: 28,
  },
  btn: {
    backgroundColor: colors.primario,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnTexto: {
    color: '#02140c',
    fontWeight: '700',
    fontSize: 15,
  },
})
