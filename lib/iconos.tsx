import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from './colors'

type IconoProps = {
  name: React.ComponentProps<typeof Ionicons>['name']
  size?: number
  color?: string
}

export function Icono({ name, size = 20, color = colors.primario }: IconoProps) {
  return <Ionicons name={name} size={size} color={color} />
}

export function IconoDocEstado({ dias }: { dias: number | null }) {
  if (dias === null) return <Icono name="help-circle-outline" size={16} color="#888" />
  if (dias <= 0) return <Icono name="close-circle" size={16} color="#ff4444" />
  if (dias <= 30) return <Icono name="warning" size={16} color={colors.primario} />
  return <Icono name="checkmark-circle" size={16} color="#22c55e" />
}
