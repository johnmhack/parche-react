import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '../lib/supabase'
import { colors } from '../lib/colors'
import { SafeAreaView } from 'react-native-safe-area-context'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020d1a',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ambientVerde: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(37,255,122,0.04)',
  },
  ambientVerde2: {
    position: 'absolute',
    bottom: 80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(100,228,188,0.04)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  // Hero
  heroWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: 200,
    height: 200,
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  taglineLinea: {
    width: 28,
    height: 2,
    backgroundColor: colors.primario,
    borderRadius: 2,
  },
  appTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Card
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 24,
  },
  cardGradient: {
    padding: 24,
  },
  cardTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 24,
  },
  // Inputs
  inputWrap: {
    marginBottom: 14,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginLeft: 2,
  },
  label: {
    fontSize: 11,
    color: colors.primario,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Recordarme y olvidaste
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  recordarmeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  checkboxActivo: {
    borderColor: colors.primario,
    backgroundColor: 'rgba(37,255,122,0.15)',
  },
  checkboxMarca: {
    color: colors.primario,
    fontSize: 11,
    fontWeight: '800',
  },
  recordarmeTexto: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  olvidasteTexto: {
    color: colors.primario,
    fontSize: 13,
    fontWeight: '600',
  },
  // Botón
  boton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  botonGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  botonTexto: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Divider
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLinea: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dividerTexto: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    letterSpacing: 1,
  },
  // Registro
  registroWrap: {
    alignItems: 'center',
  },
  registroTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  registroLink: {
    color: colors.primario,
    fontWeight: '700',
  },
  registroFlecha: {
    color: colors.primario,
    fontWeight: '700',
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerTexto: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 1,
  },
})

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [recordarme, setRecordarme] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  async function handleLogin() {
    const correo = email.trim().toLowerCase()
    if (!correo || !password) {
      Alert.alert('Error', 'Completa todos los campos')
      return
    }
    setCargando(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password,
      })

      if (error) {
        const mensaje =
          error.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos'
            : error.message === 'Email not confirmed'
              ? 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja.'
              : error.message
        Alert.alert('Error', mensaje)
        return
      }

      if (!data.session) {
        Alert.alert(
          'Error',
          'No se pudo iniciar sesión. Si acabas de registrarte, confirma tu correo en Supabase o revisa tu email.'
        )
        return
      }

      router.replace('/(tabs)/home')
    } catch {
      Alert.alert('Error', 'No se pudo conectar. Revisa tu internet e intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#010e1a', '#020d1a', '#01120f']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.ambientVerde} />
      <View style={styles.ambientVerde2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero */}
            <View style={styles.heroWrap}>
              <Image
                source={require('../assets/images/logo-completo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.taglineWrap}>
                <View style={styles.taglineLinea} />
                <Text style={styles.appTagline}>El parche de los moteros</Text>
                <View style={styles.taglineLinea} />
              </View>
            </View>

            {/* Card formulario */}
            <View style={styles.card}>
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitulo}>¡Bienvenido de nuevo!</Text>
                <Text style={styles.cardSubtitulo}>Ingresa a tu garaje digital</Text>

                {/* Email */}
                <View style={styles.inputWrap}>
                  <View style={styles.labelWrap}>
                    <Ionicons name="mail" size={13} color={colors.primario} />
                    <Text style={styles.label}>Correo electrónico</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@correo.com"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Contraseña */}
                <View style={styles.inputWrap}>
                  <View style={styles.labelWrap}>
                    <Ionicons name="lock-closed" size={13} color={colors.primario} />
                    <Text style={styles.label}>Contraseña</Text>
                  </View>
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!mostrarPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setMostrarPassword(!mostrarPassword)}
                      style={{ position: 'absolute', right: 16, top: 16 }}
                    >
                      <Ionicons
                        name={mostrarPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="rgba(255,255,255,0.3)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Recordarme y olvidaste */}
                <View style={styles.extraRow}>
                  <TouchableOpacity
                    style={styles.recordarmeWrap}
                    onPress={() => setRecordarme(!recordarme)}
                  >
                    <View style={[styles.checkbox, recordarme && styles.checkboxActivo]}>
                      {recordarme && <Text style={styles.checkboxMarca}>✓</Text>}
                    </View>
                    <Text style={styles.recordarmeTexto}>Recordarme</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.olvidasteTexto}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                </View>

                {/* Botón */}
                <TouchableOpacity style={styles.boton} onPress={handleLogin} disabled={cargando}>
                  <LinearGradient
                    colors={[colors.primario, colors.secundario]}
                    style={styles.botonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {cargando
                      ? <ActivityIndicator color="#000" />
                      : <Text style={styles.botonTexto}>ENTRAR AL PARCHE</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Divider */}
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLinea} />
              <Text style={styles.dividerTexto}>¿NUEVO POR ACÁ?</Text>
              <View style={styles.dividerLinea} />
            </View>

            {/* Registro */}
            <View style={styles.registroWrap}>
              <TouchableOpacity onPress={() => router.push('/registro')}>
                <Text style={styles.registroTexto}>
                  ¿No tienes cuenta?{' '}
                  <Text style={styles.registroLink}>Regístrate gratis →</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerTexto}>HECHO CON ❤️ PARA LOS MOTEROS CO</Text>
            </View>

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  )
}