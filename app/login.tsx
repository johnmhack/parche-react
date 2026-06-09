import { registrarTokenPush } from '../lib/notificaciones'
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
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../lib/supabase'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080A0F',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ambientNaranja: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(255,107,26,0.12)',
  },
  ambientCyan: {
    position: 'absolute',
    bottom: 60,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0,229,255,0.06)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  // Hero
  heroWrap: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    backgroundColor: 'rgba(255,107,26,0.08)',
  },
  logoEmoji: {
    fontSize: 48,
  },
  appNombre: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 6,
  },
  appNombreNaranja: {
    color: '#FF6B1A',
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Card formulario
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  cardGradient: {
    padding: 24,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Botón
  boton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  botonGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  botonTexto: {
    color: '#fff',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerTexto: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
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
    color: '#FF6B1A',
    fontWeight: '700',
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerTexto: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1,
  },
})

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos')
      return
    }
    setCargando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      Alert.alert('Error', error.message)
      setCargando(false)
      return
    }
    setCargando(false)
    await registrarTokenPush()
    router.replace('/(tabs)/home')
  }

  return (
    <View style={styles.container}>
      {/* Fondo */}
      <LinearGradient
        colors={['#0d0500', '#080A0F', '#00080d']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.ambientNaranja} />
      <View style={styles.ambientCyan} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.heroWrap}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🏍️</Text>
            </View>
            <Text style={styles.appNombre}>
              PAR<Text style={styles.appNombreNaranja}>CHE</Text>
            </Text>
            <Text style={styles.appTagline}>El parche de los moteros</Text>
          </View>

          {/* Card formulario */}
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.cardGradient}
            >
              <Text style={styles.cardTitulo}>Bienvenido de nuevo</Text>
              <Text style={styles.cardSubtitulo}>Ingresa a tu garaje digital</Text>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Correo electrónico</Text>
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

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.boton} onPress={handleLogin} disabled={cargando}>
                <LinearGradient
                  colors={['#FF6B1A', '#e55a00']}
                  style={styles.botonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.botonTexto}>ENTRAR AL PARCHE 🏍️</Text>
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
                <Text style={styles.registroLink}>Regístrate gratis</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTexto}>HECHO CON ❤️ PARA LOS MOTEROS CO</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}