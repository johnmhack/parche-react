export const LIMITES_PLAN = {
  free: { motos: 2, contactosSos: 1 },
  premium: { motos: 4, contactosSos: 5 },
} as const

export type PlanId = keyof typeof LIMITES_PLAN

export function limitesPlan(plan?: string | null) {
  return plan === 'premium' ? LIMITES_PLAN.premium : LIMITES_PLAN.free
}

export function esPremium(plan?: string | null) {
  return plan === 'premium'
}

export function alertaLimiteMotos(plan?: string | null) {
  const limite = limitesPlan(plan).motos
  return {
    titulo: esPremium(plan) ? 'Límite alcanzado' : 'Actualiza a Premium',
    mensaje: esPremium(plan)
      ? `Ya tienes ${limite} motos registradas (máximo del plan Premium).`
      : `El plan gratuito permite hasta ${limite} motos. Premium permite hasta ${LIMITES_PLAN.premium.motos}.`,
  }
}

export function alertaLimiteContactosSos(plan?: string | null) {
  const limite = limitesPlan(plan).contactosSos
  return {
    titulo: esPremium(plan) ? 'Límite alcanzado' : 'Actualiza a Premium',
    mensaje: esPremium(plan)
      ? `Ya tienes ${limite} contactos SOS (máximo del plan Premium).`
      : `El plan gratuito permite ${limite} contacto SOS. Premium permite hasta ${LIMITES_PLAN.premium.contactosSos}.`,
  }
}
