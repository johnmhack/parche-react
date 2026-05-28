import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
  soat_vencimiento: string | null
  tecnicomecanica_vencimiento: string | null
}

type Perfil = {
  nombre: string
  tuercas_acumuladas: number
  nivel: number
}

export default function Home() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [motos, setMotos] = useState<Moto[]>([])
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      cargarDatos()
    }, [])
  )

  async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: perfilData }, { data: motosData }] = await Promise.all([
      supabase.from('perfiles').select('nombre, tuercas_acumuladas, nivel').eq('id', user.id).single(),
      supabase.from('motos').select('id, placa, marca, modelo, soat_vencimiento, tecnicomecanica_vencimiento').eq('dueno_id', user.id).eq('activa', true),
    ])

    if (perfilData) setPerfil(perfilData)
    if (motosData) setMotos(motosData)
    setCargando(false)
  }

  function diasRestantes(fecha: string | null) {
    if (!fecha) return null
    const hoy = new Date()
    const vence = new Date(fecha)
    const diff = Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  function colorAlerta(dias: number | null) {
    if (dias === null) return '#888'
    if (dias <= 30) return '#ff4444'
    if (dias <= 60) return '#f97316'
    return '#22c55e'
  }

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.header}>
        <View>
          <Text style={styles.saludo}>Hola, {perfil?.nombre?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitulo}>Tu garaje digital</Text>
        </View>
        <View style={styles.tuercas}>
          <Text style={styles.tuercasNumero}>{perfil?.tuercas_acumuladas}</Text>
          <Text style={styles.tuercasLabel}>🔩</Text>
        </View>
      </View>

      {motos.length > 0 && (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Alertas de documentos</Text>
          {motos.map((moto) => {
            const diasSoat = diasRestantes(moto.soat_vencimiento)
            const diasTecno = diasRestantes(moto.tecnicomecanica_vencimiento)
            return (
              <View key={moto.id} style={styles.alertaTarjeta}>
                <Text style={styles.alertaMoto}>{moto.placa} · {moto.marca} {moto.modelo}</Text>
                <View style={styles.alertaFila}>
                  <Text style={styles.alertaLabel}>SOAT</Text>
                  <Text style={[styles.alertaValor, { color: colorAlerta(diasSoat) }]}>
                    {diasSoat === null ? 'Sin fecha' : diasSoat <= 0 ? 'Vencido' : `${diasSoat} días`}
                  </Text>
                </View>
                <View style={styles.alertaFila}>
                  <Text style={styles.alertaLabel}>Tecnomecánica</Text>
                  <Text style={[styles.alertaValor, { color: colorAlerta(diasTecno) }]}>
                    {diasTecno === null ? 'Sin fecha' : diasTecno <= 0 ? 'Vencida' : `${diasTecno} días`}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Accesos rápidos</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/(tabs)/garaje')}>
            <Text style={styles.gridIcono}>🏍️</Text>
            <Text style={styles.gridLabel}>Mi Garaje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/(tabs)/perfil')}>
            <Text style={styles.gridIcono}>👤</Text>
            <Text style={styles.gridLabel}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  saludo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  tuercas: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  tuercasNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  tuercasLabel: {
    fontSize: 16,
  },
  seccion: {
    marginBottom: 24,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  alertaTarjeta: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  alertaMoto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 8,
  },
  alertaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  alertaLabel: {
    color: '#888',
    fontSize: 14,
  },
  alertaValor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  gridIcono: {
    fontSize: 28,
    marginBottom: 8,
  },
  gridLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
})