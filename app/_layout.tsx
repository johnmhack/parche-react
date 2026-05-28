import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="agregar-moto" />
      <Stack.Screen name="agregar-historial" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}