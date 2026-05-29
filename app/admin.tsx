import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../lib/supabase'

type Anuncio = {
  id: string
  titulo: string
  mensaje: string
  dirigido_a: string
  activo: boolean
  created_at: string
}

export default function Admin() {
  const [rol, setRol] = useState<string | null>(null)
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [dirigidoA, setDirigidoA] = useState('todos')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useFocusEffect(
    useCallback(() => {
      verificarAdmin()
    }, [])
  )

  async function verificarAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login')
      return
    }

    const { data } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (data?.rol !== 'admin') {
      Alert.alert('Acceso denegado', 'No tienes permisos para esta pantalla')
      router.back()
      return
    }

    setRol(data.rol)
    cargarAnuncios()
  }

  async function cargarAnuncios() {
    const { data } = await supabase
      .from('anuncios')
      .select('*')
      .order('created_at', { ascending: false })

    setAnuncios(data || [])
    setCargando(false)
  }

  async function handleCrearAnuncio() {
    if (!titulo || !mensaje) {
      Alert.alert('Error', 'Título y mensaje son obligatorios')
      return
    }

    setGuardando(true)

    const { error } = await supabase.from('anuncios').insert({
      titulo,
      mensaje,
      dirigido_a: dirigidoA,
      activo: true,
    })

    if (error) {
      Alert.alert('Error', error.message)
      setGuardando(false)
      return
    }

    setTitulo('')
    setMensaje('')
    setDirigidoA('todos')
    cargarAnuncios()
    setGuardando(false)
    Alert.alert('✅ Listo', 'Anuncio publicado')
  }

  async function handleToggleAnuncio(id: string, activo: boolean) {
    await supabase
      .from('anuncios')
      .update({ activo: !activo })
      .eq('id', id)
    cargarAnuncios()
  }

  async function handleEliminarAnuncio(id: string) {
    Alert.alert('Eliminar', '¿Eliminar este anuncio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('anuncios').delete().eq('id', id)
          cargarAnuncios()
        }
      }
    ])
  }

  async function handleNotificacionMasiva() {
    Alert.alert(
      '📣 Notificación masiva',
      `¿Enviar "${titulo}" a usuarios ${dirigidoA}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setGuardando(true)

            const query = supabase
              .from('perfiles')
              .select('push_token')
              .not('push_token', 'is', null)

            if (dirigidoA !== 'todos') {
              query.eq('plan', dirigidoA)
            }

            const { data: usuarios } = await query

            if (!usuarios || usuarios.length === 0) {
              Alert.alert('Sin usuarios', 'No hay usuarios con token registrado')
              setGuardando(false)
              return
            }

            const tokens = usuarios.map(u => u.push_token).filter(Boolean)

            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tokens.map(token => ({
                to: token,
                title: titulo,
                body: mensaje,
                sound: 'default',
              }))),
            })

            setGuardando(false)
            Alert.alert('✅ Enviado', `Notificación enviada a ${tokens.length} usuarios`)
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backTexto}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>⚙️ Panel Admin</Text>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Crear anuncio</Text>

        <TextInput
          style={styles.input}
          placeholder="Título *"
          placeholderTextColor="#888"
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Mensaje *"
          placeholderTextColor="#888"
          value={mensaje}
          onChangeText={setMensaje}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Dirigido a:</Text>
        <View style={styles.chips}>
          {['todos', 'free', 'premium'].map((opcion) => (
            <TouchableOpacity
              key={opcion}
              style={[styles.chip, dirigidoA === opcion && styles.chipActivo]}
              onPress={() => setDirigidoA(opcion)}
            >
              <Text style={[styles.chipTexto, dirigidoA === opcion && styles.chipTextoActivo]}>
                {opcion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.boton} onPress={handleCrearAnuncio} disabled={guardando}>
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botonTexto}>Publicar anuncio</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonNotificacion} onPress={handleNotificacionMasiva} disabled={guardando}>
          <Text style={styles.botonTexto}>📣 Enviar como notificación</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Anuncios activos</Text>
        {anuncios.length === 0 ? (
          <Text style={styles.vacio}>No hay anuncios</Text>
        ) : (
          <FlatList
            data={anuncios}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tarjeta}>
                <View style={styles.tarjetaHeader}>
                  <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
                  <View style={[styles.badge, { backgroundColor: item.activo ? '#22c55e22' : '#88888822' }]}>
                    <Text style={[styles.badgeTexto, { color: item.activo ? '#22c55e' : '#888' }]}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.tarjetaMensaje}>{item.mensaje}</Text>
                <Text style={styles.tarjetaDirigido}>→ {item.dirigido_a}</Text>
                <View style={styles.tarjetaAcciones}>
                  <TouchableOpacity
                    style={styles.accionBoton}
                    onPress={() => handleToggleAnuncio(item.id, item.activo)}
                  >
                    <Text style={styles.accionTexto}>{item.activo ? 'Desactivar' : 'Activar'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.accionBoton, styles.accionEliminar]}
                    onPress={() => handleEliminarAnuncio(item.id)}
                  >
                    <Text style={[styles.accionTexto, { color: '#ff4444' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60 },
  centered: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  back: { marginBottom: 24 },
  backTexto: { color: '#f97316', fontSize: 16 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  seccion: { marginBottom: 32 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  label: { fontSize: 14, color: '#888', marginBottom: 8 },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActivo: { backgroundColor: '#f97316', borderColor: '#f97316' },
  chipTexto: { color: '#888', fontSize: 14 },
  chipTextoActivo: { color: '#fff', fontWeight: 'bold' },
  boton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  botonNotificacion: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tarjeta: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tarjetaTitulo: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },
  tarjetaMensaje: { fontSize: 14, color: '#aaa', marginBottom: 8 },
  tarjetaDirigido: { fontSize: 12, color: '#f97316', marginBottom: 12 },
  tarjetaAcciones: { flexDirection: 'row', gap: 8 },
  accionBoton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  accionEliminar: { borderWidth: 1, borderColor: '#ff4444' },
  accionTexto: { color: '#fff', fontSize: 14 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeTexto: { fontSize: 12, fontWeight: 'bold' },
  vacio: { color: '#888', fontSize: 14, textAlign: 'center' },
})