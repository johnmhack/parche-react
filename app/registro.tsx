import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
    top: -60,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,107,26,0.1)',
  },
  ambientCyan: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.3)',
    backgroundColor: 'rgba(255,107,26,0.08)',
  },
  logoEmoji: {
    fontSize: 42,
  },
  appNombre: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 4,
  },
  appNombreNaranja: {
    color: '#FF6B1A',
  },
  appTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
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
  boton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  botonGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
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
  loginWrap: {
    alignItems: 'center',
  },
  loginTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF6B1A',
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerTexto: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,107,26,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  planTexto: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
    lineHeight: 18,
  },
})

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleRegistro() {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Nombre, correo y contraseña son obligatorios')
      return
    }
    setCargando(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      Alert.alert('Error', error.message)
      setCargando(false)
      return
    }

    if (data.user) {
      const { error: perfilError } = await supabase.from('perfiles').insert({
        id: data.user.id,
        rol: 'motero',
        nombre,
        telefono,
        ciudad: 'Bogotá',
      })

      if (perfilError) {
        Alert.alert('Error', perfilError.message)
        setCargando(false)
        return
      }
    }

    Alert.alert('¡Listo!', 'Cuenta creada exitosamente')
    setCargando(false)
  }

  return (
    <View style={styles.container}>
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
            <Text style={styles.appTagline}>Únete al parche</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.cardGradient}
            >
              <Text style={styles.cardTitulo}>Crea tu cuenta</Text>
              <Text style={styles.cardSubtitulo}>Gratis para siempre en el plan básico</Text>

              {/* Badge plan gratis */}
              <View style={styles.planBadge}>
                <Text>🆓</Text>
                <Text style={styles.planTexto}>
                  Plan gratuito incluye 2 motos y 1 contacto SOS. Actualiza a Premium cuando quieras.
                </Text>
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Nombre completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Correo electrónico *</Text>
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
                <Text style={styles.label}>Teléfono (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="300 000 0000"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.boton} onPress={handleRegistro} disabled={cargando}>
                <LinearGradient
                  colors={['#FF6B1A', '#e55a00']}
                  style={styles.botonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {cargando
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.botonTexto}>UNIRME AL PARCHE 🏍️</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Divider */}
          <View style={styles.dividerWrap}>
            <View style={styles.dividerLinea} />
            <Text style={styles.dividerTexto}>¿YA TIENES CUENTA?</Text>
            <View style={styles.dividerLinea} />
          </View>

          {/* Login */}
          <View style={styles.loginWrap}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginTexto}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTexto}>HECHO CON ❤️ PARA LOS MOTEROS CO</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}