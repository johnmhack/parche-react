import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Moto = {
  id: string
  placa: string
  marca: string
  modelo: string
}

type Registro = {
  id: string
  tipo_servicio: string
  descripcion: string
  kilometraje: number
  costo: number
  fecha: string
  verificado: boolean
  taller_id: string | null
}

export default function Historial() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [motoSeleccionada, setMotoSeleccionada] = useState<Moto | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoRegistros, setCargandoRegistros] = useState(false)

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
      .select('id, placa, marca, modelo')
      .eq('dueno_id', user.id)
      .eq('activa', true)

    if (error) Alert.alert('Error', error.message)
    else {
      setMotos(data || [])
      if (data && data.length > 0) {
        setMotoSeleccionada(data[0])
        cargarRegistros(data[0].id)
      }
    }
    setCargando(false)
  }

  async function cargarRegistros(motoId: string) {
    setCargandoRegistros(true)

    const [{ data: verificados }, { data: propietario }] = await Promise.all([
      supabase.from('historial_moto').select('*').eq('moto_id', motoId).order('fecha', { ascending: false }),
      supabase.from('historial_propietario').select('*').eq('moto_id', motoId).order('fecha', { ascending: false }),
    ])

    const todos = [
      ...(verificados || []).map(r => ({ ...r, verificado: true })),
      ...(propietario || []).map(r => ({ ...r, verificado: false, taller_id: null })),
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    setRegistros(todos)
    setCargandoRegistros(false)
  }

  function seleccionarMoto(moto: Moto) {
    setMotoSeleccionada(moto)
    cargarRegistros(moto.id)
  }

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  )

  if (motos.length === 0) return (
    <View style={styles.centered}>
      <Text style={styles.vacioTexto}>No tienes motos registradas</Text>
      <TouchableOpacity style={styles.boton} onPress={() => router.push('/agregar-moto')}>
        <Text style={styles.botonTexto}>Agregar moto</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Historial</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
        {motos.map((moto) => (
          <TouchableOpacity
            key={moto.id}
            style={[styles.motoChip, motoSeleccionada?.id === moto.id && styles.motoChipActivo]}
            onPress={() => seleccionarMoto(moto)}
          >
            <Text style={[styles.motoChipTexto, motoSeleccionada?.id === moto.id && styles.motoChipTextoActivo]}>
              {moto.placa}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {cargandoRegistros ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#f97316" />
        </View>
      ) : registros.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>Sin registros aún</Text>
          <Text style={styles.vacioSub}>Agrega el primer servicio</Text>
        </View>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
  <TouchableOpacity
    style={styles.tarjeta}
    onPress={() => {
      if (!item.verificado) {
        router.push({ pathname: '/editar-historial', params: { registroId: item.id } })
      }
    }}
  >
    <View style={styles.tarjetaHeader}>
      <Text style={styles.tipoServicio}>{item.tipo_servicio}</Text>
      <View style={[styles.badge, { backgroundColor: item.verificado ? '#22c55e22' : '#88888822' }]}>
        <Text style={[styles.badgeTexto, { color: item.verificado ? '#22c55e' : '#888' }]}>
          {item.verificado ? '✓ Verificado' : 'Editar →'}
        </Text>
      </View>
    </View>
    {item.descripcion && <Text style={styles.descripcion}>{item.descripcion}</Text>}
    <View style={styles.tarjetaFooter}>
      <Text style={styles.fecha}>{new Date(item.fecha).toLocaleDateString('es-CO')}</Text>
      {item.kilometraje && <Text style={styles.km}>{item.kilometraje} km</Text>}
      {item.costo && <Text style={styles.costo}>${item.costo.toLocaleString('es-CO')}</Text>}
    </View>
  </TouchableOpacity>
)}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/agregar-historial', params: { motoId: motoSeleccionada?.id, placa: motoSeleccionada?.placa } })}
      >
        <Text style={styles.fabTexto}>+ Agregar registro</Text>
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
    marginBottom: 16,
  },
  selector: {
    marginBottom: 16,
    flexGrow: 0,
  },
  motoChip: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  motoChipActivo: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  motoChipTexto: {
    color: '#888',
    fontWeight: 'bold',
  },
  motoChipTextoActivo: {
    color: '#fff',
  },
  tarjeta: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoServicio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  descripcion: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  tarjetaFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  fecha: {
    fontSize: 12,
    color: '#888',
  },
  km: {
    fontSize: 12,
    color: '#888',
  },
  costo: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: 'bold',
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
    marginBottom: 24,
  },
  boton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
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