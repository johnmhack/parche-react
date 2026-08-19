import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useRecargaEnFoco } from '../../lib/useRecargaEnFoco'
import { reiniciarCacheCarga } from '../../lib/carga'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/colors'
import { Icono } from '../../lib/iconos'
import Ionicons from '@expo/vector-icons/Ionicons'

type Perfil = {
  nombre: string
  email: string
  telefono: string
  ciudad: string
  tuercas_acumuladas: number
  nivel: number
  plan: string
  rol: string
}

type ResumenUso = {
  motos: number
  contactosSos: number
}

const LIMITES = {
  free: { motos: 2, contactos: 1 },
  premium: { motos: 4, contactos: 5 },
} as const

function limitesPlan(plan: string) {
  return plan === 'premium' ? LIMITES.premium : LIMITES.free
}

function progresoNivel(tuercas: number, nivel: number) {
  const base = Math.max(0, (nivel - 1) * 100)
  const meta = nivel * 100
  const pct = meta > base ? Math.min(100, Math.max(0, ((tuercas - base) / (meta - base)) * 100)) : 100
  const faltan = Math.max(0, meta - tuercas)
  return { pct, faltan }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  ambientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    zIndex: 0,
  },
  ambientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  tituloAcento: {
    color: colors.primario,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#0a1a14',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borde,
  },
  avatarTexto: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primario,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 13,
    color: colors.textoSub,
    marginBottom: 12,
    textAlign: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  planBadgeFree: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planBadgePremium: {
    backgroundColor: 'rgba(37,255,122,0.1)',
    borderColor: colors.borde,
  },
  planBadgeTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  planBadgeTextoFree: {
    color: 'rgba(255,255,255,0.6)',
  },
  planBadgeTextoPremium: {
    color: colors.primario,
  },
  seccion: {
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.bordeSubtil,
  },
  cardGradient: {
    padding: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumero: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primario,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textoSub,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  progresoWrap: {
    gap: 6,
  },
  progresoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progresoLabel: {
    fontSize: 12,
    color: colors.textoSub,
  },
  progresoPct: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primario,
  },
  progresoBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primario,
  },
  usoFila: {
    marginBottom: 14,
  },
  usoFilaLast: {
    marginBottom: 0,
  },
  usoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usoLabelTexto: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  usoValor: {
    fontSize: 13,
    color: colors.textoSub,
    fontWeight: '600',
  },
  infoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoFilaLast: {
    borderBottomWidth: 0,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37,255,122,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContenido: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textoSub,
    marginBottom: 2,
  },
  infoValor: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  premiumCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  premiumGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(37,255,122,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTextos: {
    flex: 1,
    gap: 2,
  },
  premiumTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumSub: {
    fontSize: 12,
    color: colors.textoSub,
    lineHeight: 17,
  },
  botonAdmin: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  botonAdminGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botonAdminTexto: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  botonLogout: {
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.25)',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  botonLogoutTexto: {
    color: colors.rojo,
    fontSize: 16,
    fontWeight: '700',
  },
})

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [uso, setUso] = useState<ResumenUso>({ motos: 0, contactosSos: 0 })

  const cargarPerfil = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data, error }, { count: motosCount }, { count: contactosCount }] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', user.id).single(),
      supabase.from('motos').select('*', { count: 'exact', head: true }).eq('dueno_id', user.id).eq('activa', true),
      supabase.from('contactos_sos').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id),
    ])

    if (error) Alert.alert('Error', error.message)
    else {
      setPerfil({ ...data, email: user.email || '' })
      setUso({ motos: motosCount ?? 0, contactosSos: contactosCount ?? 0 })
    }
  }, [])

  const cargando = useRecargaEnFoco('perfil', cargarPerfil)

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          reiniciarCacheCarga()
          router.replace('/login')
        },
      },
    ])
  }

  function mostrarPremium() {
    Alert.alert(
      'Premium',
      'Próximamente podrás activar Premium con Wompi: 4 motos, 5 contactos SOS, historial verificado y estadísticas.',
    )
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    )
  }

  const esPremium = perfil?.plan === 'premium'
  const limites = limitesPlan(perfil?.plan || 'free')
  const { pct, faltan } = progresoNivel(perfil?.tuercas_acumuladas ?? 0, perfil?.nivel ?? 1)
  const pctMotos = Math.min(100, (uso.motos / limites.motos) * 100)
  const pctContactos = Math.min(100, (uso.contactosSos / limites.contactos) * 100)

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(37,255,122,0.06)', 'transparent']}
        style={styles.ambientTop}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(100,228,188,0.03)', 'transparent']}
        style={styles.ambientBottom}
        start={{ x: 0.8, y: 1 }}
        end={{ x: 0.2, y: 0.5 }}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>
          Mi <Text style={styles.tituloAcento}>Perfil</Text>
        </Text>

        {/* Hero */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#0a1a14', '#0d0d1a']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.avatarRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarTexto}>
                  {perfil?.nombre?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </View>
            </LinearGradient>
            <Text style={styles.nombre}>{perfil?.nombre}</Text>
            <Text style={styles.email}>{perfil?.email}</Text>
            <View style={[styles.planBadge, esPremium ? styles.planBadgePremium : styles.planBadgeFree]}>
              <Ionicons
                name={esPremium ? 'diamond' : 'person-outline'}
                size={14}
                color={esPremium ? colors.primario : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.planBadgeTexto, esPremium ? styles.planBadgeTextoPremium : styles.planBadgeTextoFree]}>
                Plan {esPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Gamificación */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Mis tuercas</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(37,255,122,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.cardGradient}
            >
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Icono name="construct" size={20} color={colors.primario} />
                  <Text style={styles.statNumero}>{perfil?.tuercas_acumuladas ?? 0}</Text>
                  <Text style={styles.statLabel}>Tuercas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Icono name="star" size={20} color={colors.secundario} />
                  <Text style={styles.statNumero}>{perfil?.nivel ?? 1}</Text>
                  <Text style={styles.statLabel}>Nivel</Text>
                </View>
              </View>
              <View style={styles.progresoWrap}>
                <View style={styles.progresoHeader}>
                  <Text style={styles.progresoLabel}>
                    {faltan > 0 ? `${faltan} tuercas para nivel ${(perfil?.nivel ?? 1) + 1}` : '¡Nivel completado!'}
                  </Text>
                  <Text style={styles.progresoPct}>{Math.round(pct)}%</Text>
                </View>
                <View style={styles.progresoBar}>
                  <View style={[styles.progresoFill, { width: `${pct}%` }]} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Uso del plan */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Uso del plan</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
              style={styles.cardGradient}
            >
              <View style={styles.usoFila}>
                <View style={styles.usoHeader}>
                  <View style={styles.usoLabel}>
                    <Icono name="speedometer-outline" size={18} color={colors.primario} />
                    <Text style={styles.usoLabelTexto}>Motos</Text>
                  </View>
                  <Text style={styles.usoValor}>{uso.motos} / {limites.motos}</Text>
                </View>
                <View style={styles.progresoBar}>
                  <View style={[styles.progresoFill, { width: `${pctMotos}%` }]} />
                </View>
              </View>
              <View style={[styles.usoFila, styles.usoFilaLast]}>
                <View style={styles.usoHeader}>
                  <View style={styles.usoLabel}>
                    <Icono name="people-outline" size={18} color={colors.secundario} />
                    <Text style={styles.usoLabelTexto}>Contactos SOS</Text>
                  </View>
                  <Text style={styles.usoValor}>{uso.contactosSos} / {limites.contactos}</Text>
                </View>
                <View style={styles.progresoBar}>
                  <View style={[styles.progresoFill, { width: `${pctContactos}%`, backgroundColor: colors.secundario }]} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Premium upsell */}
        {!esPremium && (
          <TouchableOpacity style={styles.premiumCard} activeOpacity={0.85} onPress={mostrarPremium}>
            <LinearGradient
              colors={['rgba(37,255,122,0.12)', 'rgba(37,255,122,0.04)']}
              style={styles.premiumGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.premiumIconWrap}>
                <Ionicons name="diamond" size={22} color={colors.primario} />
              </View>
              <View style={styles.premiumTextos}>
                <Text style={styles.premiumTitulo}>Pasa a Premium</Text>
                <Text style={styles.premiumSub}>
                  4 motos, 5 contactos SOS, historial verificado y estadísticas.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primario} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Datos personales */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Datos personales</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
              style={{ padding: 4 }}
            >
              <View style={styles.infoFila}>
                <View style={styles.infoIconWrap}>
                  <Icono name="mail-outline" size={18} />
                </View>
                <View style={styles.infoContenido}>
                  <Text style={styles.infoLabel}>Correo</Text>
                  <Text style={styles.infoValor}>{perfil?.email || '—'}</Text>
                </View>
              </View>
              <View style={styles.infoFila}>
                <View style={styles.infoIconWrap}>
                  <Icono name="call-outline" size={18} />
                </View>
                <View style={styles.infoContenido}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValor}>{perfil?.telefono || 'Sin registrar'}</Text>
                </View>
              </View>
              <View style={[styles.infoFila, styles.infoFilaLast]}>
                <View style={styles.infoIconWrap}>
                  <Icono name="location-outline" size={18} />
                </View>
                <View style={styles.infoContenido}>
                  <Text style={styles.infoLabel}>Ciudad</Text>
                  <Text style={styles.infoValor}>{perfil?.ciudad || 'Sin registrar'}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {perfil?.rol === 'admin' && (
          <TouchableOpacity style={styles.botonAdmin} onPress={() => router.push('/admin')}>
            <LinearGradient
              colors={[colors.primario, colors.primarioOscuro]}
              style={styles.botonAdminGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icono name="settings-outline" size={20} color="#000" />
              <Text style={styles.botonAdminTexto}>Panel Admin</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.botonLogout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.rojo} />
          <Text style={styles.botonLogoutTexto}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}
