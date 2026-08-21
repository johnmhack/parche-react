/** Código corto para vincular moto ↔ taller (QR / digitación). */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generarCodigoParche(largo = 6): string {
  let out = ''
  for (let i = 0; i < largo; i++) {
    out += ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
  }
  return out
}
