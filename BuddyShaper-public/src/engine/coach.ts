import { findRecipe, recipesFor } from '../data/recipes'
import { exercises, findExercise } from '../data/exercises'
import { findFood } from '../data/foods'
import type { Exercise, Profile, Recipe } from '../types'
import { goalLine, targets } from './macros'

export function greeting(p: Profile): string {
  const t = targets(p)
  const notes = p.diet.trim() ? ` Food notes I’ll respect: ${p.diet}.` : ''
  return `Hey ${p.name}. I’m Gymergee（俊美雞）— your BuddyShaper chick coach. You’re training for ${goalLine(p.goal)}. Daily target is about ${t.kcal} kcal · ${t.protein}g protein · ${t.carbs}g carbs · ${t.fat}g fat.${notes}\n\nSend a plate photo to log food, a short lift clip for form cues, or ask for a meal that fits today.`
}

export function pickMeals(p: Profile): Recipe[] {
  return recipesFor(p.goal).slice(0, 3)
}

export function mealReply(p: Profile, recipe: Recipe): string {
  const t = targets(p)
  const leftover = t.kcal - recipe.macros.kcal
  return `${recipe.name} fits a ${p.goal} day (${recipe.macros.kcal} kcal, ${recipe.macros.protein}g protein, ~${recipe.minutes} min). That leaves roughly ${leftover} kcal for the rest of the day. ${recipe.why}`
}

export function planReply(p: Profile): string {
  const t = targets(p)
  const lifts = exercises.slice(0, 5)
  return [
    `${p.name}, a simple 3-day week for ${goalLine(p.goal)}:`,
    `Day A: squat, bench, row.`,
    `Day B: deadlift or RDL, overhead press, pull-up.`,
    `Day C: lunge, hip thrust, plank + one lagging lift.`,
    `Eat around ${t.kcal} kcal with ${t.protein}g protein. ${lifts[0].reps[p.goal]} on the main squat pattern is a good default.`,
  ].join('\n')
}

export function calorieText(foodName: string, kcal: number, p: Profile): string {
  const t = targets(p)
  const pct = Math.round((kcal / t.kcal) * 100)
  return `I’d call that ${foodName} — about ${kcal} kcal (${pct}% of your ${t.kcal} kcal target). This is a plate-level estimate from color + portion defaults, not a lab assay. Confirm the closest match so I can log it cleanly.`
}

export function formReply(p: Profile, ex: Exercise): string {
  return [
    `Watching your ${ex.name} clip. Pattern: ${ex.pattern}.`,
    `For your ${p.goal} block, use ${ex.reps[p.goal]}.`,
    `I’ll pin setup, the three cues that usually fix the video, and the mistakes I look for first.`,
  ].join(' ')
}

export function parseIntent(text: string): {
  kind: 'meal' | 'plan' | 'form' | 'calories' | 'macros' | 'chat'
  exercise?: Exercise
} {
  const q = text.toLowerCase()
  const ex = findExercise(q)
  if (q.includes('macro') || q.includes('tdee') || (q.includes('target') && q.includes('macro'))) {
    return { kind: 'macros' }
  }
  if (q.includes('plan') || q.includes('workout') || q.includes('program') || q.includes('split')) {
    return { kind: 'plan' }
  }
  if (
    findRecipe(q) ||
    q.includes('recipe') ||
    q.includes('meal') ||
    q.includes('eat') ||
    q.includes('dinner') ||
    q.includes('breakfast') ||
    q.includes('lunch')
  ) {
    return { kind: 'meal' }
  }
  if (
    q.includes('calorie') ||
    q.includes('kcal') ||
    q.includes('i ate') ||
    q.includes('food photo') ||
    findFood(q)
  ) {
    return { kind: 'calories' }
  }
  if (
    q.includes('form') ||
    q.includes('technique') ||
    q.includes('cue') ||
    q.includes('clip') ||
    ex
  ) {
    return { kind: 'form', exercise: ex }
  }
  return { kind: 'chat' }
}

export function chatReply(p: Profile, text: string): string {
  const intent = parseIntent(text)
  const t = targets(p)
  if (intent.kind === 'macros') {
    return `Targets for ${p.goal}: ${t.kcal} kcal, ${t.protein}g protein, ${t.carbs}g carbs, ${t.fat}g fat. Built from Mifflin-St Jeor × activity, then a ${p.goal === 'cut' ? '400 kcal deficit' : p.goal === 'bulk' ? '300 kcal surplus' : 'maintenance'} adjustment.`
  }
  if (intent.kind === 'plan') return planReply(p)
  if (intent.kind === 'meal') {
    const meal = pickMeals(p)[0]
    return mealReply(p, meal) + '\n\nI attached the full recipe. Ask for another if you want a swap.'
  }
  if (intent.kind === 'form' && intent.exercise) {
    return formReply(p, intent.exercise) + ' Upload a 5–15s clip and I’ll walk the same cues against your video.'
  }
  if (intent.kind === 'form') {
    return 'Upload a short clip of one lift (squat, hinge, press, pull, or lunge). I’ll match it to a pattern and give setup, cues, and the mistakes that show up most on first-week film.'
  }
  if (intent.kind === 'calories') {
    const food = findFood(text)
    if (food) {
      return calorieText(food.name, food.kcal, p)
    }
    return 'Snap the plate — or tell me what it is. I’ll estimate calories against today’s target.'
  }
  return `I’m here for three jobs: meals that match your ${p.goal}, form from a short video, and calories from a photo. What do you want to shape today?`
}
