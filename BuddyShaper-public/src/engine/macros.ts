import type { Goal, Macros, Profile } from '../types'

const activityFactor: Record<Profile['activity'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  hard: 1.725,
}

export function tdee(p: Profile): number {
  const s = p.sex === 'female' ? -161 : 5
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s
  return Math.round(bmr * activityFactor[p.activity])
}

export function targets(p: Profile): Macros {
  const t = tdee(p)
  const kcal =
    p.goal === 'cut'
      ? t - 400
      : p.goal === 'bulk'
        ? t + 300
        : t
  const protein = Math.round(p.weightKg * (p.goal === 'cut' ? 2.0 : 1.8))
  const fat = Math.round((kcal * 0.25) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, carbs, fat }
}

export function goalLine(goal: Goal): string {
  switch (goal) {
    case 'cut':
      return 'fat loss without losing your lifts'
    case 'bulk':
      return 'a clean surplus so the extra food becomes muscle'
    case 'recomp':
      return 'holding calories near maintenance while training hard'
    case 'maintain':
      return 'steady energy and strength'
  }
}
