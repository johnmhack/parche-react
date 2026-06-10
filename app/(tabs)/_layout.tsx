import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '../../lib/colors'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'


export default function TabsLayout() {
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