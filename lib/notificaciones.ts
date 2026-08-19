import Constants, { ExecutionEnvironment } from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from './supabase'

/** Push solo en build de producción. En Expo Go / desarrollo no hace nada. */
function pushDisponible() {
  if (__DEV__) return false
  if (Constants.appOwnership === 'expo') return false
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return false
  return true
}

export async function registrarTokenPush() {
  if (!pushDisponible()) return null

  try {
    const Notifications = await import('expo-notifications')

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') return null

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: '99235be3-fc0e-44a8-94bc-f9acc7eb5c34',
      })
    ).data

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('perfiles').update({ push_token: token }).eq('id', user.id)
    }

    return token
  } catch {
    return null
  }
}
