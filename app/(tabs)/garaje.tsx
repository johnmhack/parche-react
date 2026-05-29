import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
  anio: number
  color: string
  kilometraje_actual: number
}

export default function Garaje() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [cargando, setCargando] = useState(true)

  useFocusEffect(
  useCallback(() => {
    cargarMotos()
  }, [])
)

  async function cargarMotos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('motos')
      .select('*')
      .eq('dueno_id', user.id)
      .eq('activa', true)

    if (error) Alert.alert('Error', error.message)
    else setMotos(data || [])
    setCargando(false)
  }

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🏍️ Mi Garaje</Text>

      {motos.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No tienes motos registradas</Text>
          <Text style={styles.vacioSub}>Agrega tu primera moto</Text>
        </View>
      ) : (
        <FlatList
          data={motos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
  <TouchableOpacity
    style={styles.tarjeta}
    onPress={() => router.push({ pathname: '/editar-moto', params: { motoId: item.id } })}
  >
    <View style={styles.tarjetaHeader}>
      <Text style={styles.placa}>{item.placa}</Text>
      <Text style={styles.editar}>Editar →</Text>
    </View>
    <Text style={styles.moto}>{item.marca} {item.modelo} {item.anio}</Text>
    <Text style={styles.detalle}>{item.color} · {item.kilometraje_actual} km</Text>
  </TouchableOpacity>
)}
/>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/agregar-moto')}
      >
        <Text style={styles.fabTexto}>+ Agregar moto</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  tarjeta: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  placa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 4,
  },
  moto: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  detalle: {
    fontSize: 14,
    color: '#888',
  },
  tarjetaHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
},
editar: {
  color: '#f97316',
  fontSize: 14,
},
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacioTexto: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  vacioSub: {
    fontSize: 14,
    color: '#888',
  },
  fab: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  fabTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})