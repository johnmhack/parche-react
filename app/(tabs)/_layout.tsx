import { Redirect, Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '../../lib/colors'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { guardarSesionCache, obtenerSesionCache } from '../../lib/carga'

export default function TabsLayout() {
  const [session, setSession] = useState<Session | null | undefined>(obtenerSesionCache())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      guardarSesionCache(session)
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      guardarSesionCache(session)
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/login" />
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.bg,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.06)',
              height: 62,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: colors.primario,
            tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 0.3,
            },
          }}
        >
          <Tabs.Screen name="home" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
          <Tabs.Screen name="garaje" options={{ title: 'Garaje', tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
          <Tabs.Screen name="historial" options={{ title: 'Historial', tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} /> }} />
          <Tabs.Screen name="sos" options={{ title: 'SOS', tabBarIcon: ({ color, size }) => <Ionicons name="warning" size={size} color={color} /> }} />
          <Tabs.Screen name="mapa" options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} /> }} />
          <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
