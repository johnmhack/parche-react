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
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/colors'
 import { SafeAreaView } from 'react-native-safe-area-context'

type Anuncio = {
  id: string
  titulo: string
  mensaje: string
  dirigido_a: string
  activo: boolean
  created_at: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  ambientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
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
  tituloNaranja: {
    color: colors.primario,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,26,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 28,
    marginTop: 8,
  },
  adminBadgeTexto: {
    color: colors.primario,
    fontSize: 12,
    fontWeight: '700',
  },
  // Sección
  seccion: {
    marginBottom: 28,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  // Card formulario
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  cardGradient: {
    padding: 18,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputMultiline: {
    height: 90,
    textAlignVertical: 'top',
  },
  // Chips
  chipsWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActivo: {
    backgroundColor: 'rgba(255,107,26,0.15)',
    borderColor: 'rgba(255,107,26,0.4)',
  },
  chipTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: colors.primario,
    fontWeight: '700',
  },
  // Botones
  botonPublicar: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  botonPublicarGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  botonNotificacion: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.4)',
    backgroundColor: 'rgba(255,107,26,0.08)',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  botonTextoNaranja: {
    color: colors.primario,
    fontSize: 15,
    fontWeight: '700',
  },
  // Tarjeta anuncio
  tarjeta: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tarjetaGradient: {
    padding: 16,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tarjetaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeActivo: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  badgeInactivo: {
    backgroundColor: 'rgba(136,136,136,0.08)',
    borderColor: 'rgba(136,136,136,0.2)',
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  tarjetaMensaje: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
    lineHeight: 18,
  },
  tarjetaDirigido: {
    fontSize: 11,
    color: colors.primario,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tarjetaAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  accionBoton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  accionEliminar: {
    borderColor: 'rgba(255,68,68,0.3)',
    backgroundColor: 'rgba(255,68,68,0.06)',
  },
  accionTexto: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  accionTextoEliminar: {
    color: '#ff4444',
    fontSize: 13,
    fontWeight: '600',
  },
  vacio: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 28,
  },
})

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
    await supabase.from('anuncios').update({ activo: !activo }).eq('id', id)
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
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,107,26,0.05)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backTexto}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>
            Panel <Text style={styles.tituloNaranja}>Admin</Text> ⚙️
          </Text>

          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeTexto}>🔐 Acceso restringido</Text>
          </View>

          {/* Crear anuncio */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Crear anuncio</Text>
            <View style={styles.card}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.cardGradient}
              >
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Título del anuncio"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={titulo}
                  onChangeText={setTitulo}
                />

                <Text style={styles.label}>Mensaje *</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Contenido del anuncio..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={mensaje}
                  onChangeText={setMensaje}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Dirigido a</Text>
                <View style={styles.chipsWrap}>
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

                <TouchableOpacity style={styles.botonPublicar} onPress={handleCrearAnuncio} disabled={guardando}>
                  <LinearGradient
                    colors={[colors.primario, colors.primarioOscuro]}
                    style={styles.botonPublicarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {guardando
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.botonTexto}>Publicar anuncio</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botonNotificacion} onPress={handleNotificacionMasiva} disabled={guardando}>
                  <Text style={styles.botonTextoNaranja}>📣 Enviar como notificación</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Lista anuncios */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Anuncios publicados</Text>
            {anuncios.length === 0 ? (
              <Text style={styles.vacio}>No hay anuncios</Text>
            ) : (
              <FlatList
                data={anuncios}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.tarjeta}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                      style={styles.tarjetaGradient}
                    >
                      <View style={styles.tarjetaHeader}>
                        <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
                        <View style={[styles.badge, item.activo ? styles.badgeActivo : styles.badgeInactivo]}>
                          <Text style={[styles.badgeTexto, { color: item.activo ? '#22c55e' : '#888' }]}>
                            {item.activo ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.tarjetaMensaje}>{item.mensaje}</Text>
                      <Text style={styles.tarjetaDirigido}>→ {item.dirigido_a.toUpperCase()}</Text>
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
                          <Text style={styles.accionTextoEliminar}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                )}
              />
            )}
          </View>

        </ScrollView>
      </SafeAreaView>  
    </View>
  )
}