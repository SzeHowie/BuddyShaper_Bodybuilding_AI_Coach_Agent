import { findRecipe, recipesFor } from '../data/recipes'
import { exercises, findExercise } from '../data/exercises'
import { findFood } from '../data/foods'
import type { Lang } from '../i18n/types'
import type { Exercise, Profile, Recipe } from '../types'
import { goalLine, targets } from './macros'

export function greeting(p: Profile, lang: Lang = 'en'): string {
  const t = targets(p)
  if (lang === 'zh') {
    const notes = p.diet.trim() ? ` 飲食備註我會注意：${p.diet}。` : ''
    return `嗨 ${p.name}，我是 Gymergee（俊美雞）——BuddyShaper 的小雞教練。你這個週期的方向是${goalLine(p.goal, lang)}。每日目標大約 ${t.kcal} kcal · 蛋白質 ${t.protein}g · 碳水 ${t.carbs}g · 脂肪 ${t.fat}g。${notes}\n\n傳餐盤照片記飲食、傳動作短片看姿勢，或直接問我今天吃什麼。`
  }
  const notes = p.diet.trim() ? ` Food notes I’ll respect: ${p.diet}.` : ''
  return `Hey ${p.name}. I’m Gymergee（俊美雞）— your BuddyShaper chick coach. You’re training for ${goalLine(p.goal, lang)}. Daily target is about ${t.kcal} kcal · ${t.protein}g protein · ${t.carbs}g carbs · ${t.fat}g fat.${notes}\n\nSend a plate photo to log food, a short lift clip for form cues, or ask for a meal that fits today.`
}

export function pickMeals(p: Profile): Recipe[] {
  return recipesFor(p.goal).slice(0, 3)
}

export function mealReply(p: Profile, recipe: Recipe, lang: Lang = 'en'): string {
  const t = targets(p)
  const leftover = t.kcal - recipe.macros.kcal
  if (lang === 'zh') {
    return `${recipe.name} 適合你的「${p.goal}」日（${recipe.macros.kcal} kcal、蛋白質 ${recipe.macros.protein}g、約 ${recipe.minutes} 分鐘）。今天大約還剩 ${leftover} kcal。${recipe.why}`
  }
  return `${recipe.name} fits a ${p.goal} day (${recipe.macros.kcal} kcal, ${recipe.macros.protein}g protein, ~${recipe.minutes} min). That leaves roughly ${leftover} kcal for the rest of the day. ${recipe.why}`
}

export function planReply(p: Profile, lang: Lang = 'en'): string {
  const t = targets(p)
  const lifts = exercises.slice(0, 5)
  if (lang === 'zh') {
    return [
      `${p.name}，針對${goalLine(p.goal, lang)}的簡單一週三練：`,
      `A 日：深蹲、臥推、划船。`,
      `B 日：硬舉或 RDL、推舉、引體。`,
      `C 日：弓箭步、臀推、棒式 + 一個弱項。`,
      `飲食約 ${t.kcal} kcal、蛋白質 ${t.protein}g。主蹲可先用 ${lifts[0].reps[p.goal]}。`,
    ].join('\n')
  }
  return [
    `${p.name}, a simple 3-day week for ${goalLine(p.goal, lang)}:`,
    `Day A: squat, bench, row.`,
    `Day B: deadlift or RDL, overhead press, pull-up.`,
    `Day C: lunge, hip thrust, plank + one lagging lift.`,
    `Eat around ${t.kcal} kcal with ${t.protein}g protein. ${lifts[0].reps[p.goal]} on the main squat pattern is a good default.`,
  ].join('\n')
}

export function calorieText(
  foodName: string,
  kcal: number,
  p: Profile,
  source: 'local' | 'glm' = 'local',
  lang: Lang = 'en',
): string {
  const t = targets(p)
  const pct = Math.round((kcal / t.kcal) * 100)
  if (lang === 'zh') {
    const how =
      source === 'glm'
        ? '這是 GLM 看圖後的估算，仍是近似值，不是實驗室數據。'
        : '這是依顏色與份量預設的本地估算，不是實驗室數據。'
    return `我覺得這是${foodName}——大約 ${kcal} kcal（佔今日 ${t.kcal} kcal 目標的 ${pct}%）。${how}請點最接近的選項，方便我記帳。`
  }
  const how =
    source === 'glm'
      ? 'This estimate came from GLM vision on your photo — still approximate, not a lab assay.'
      : 'This is a plate-level estimate from color + portion defaults, not a lab assay.'
  return `I’d call that ${foodName} — about ${kcal} kcal (${pct}% of your ${t.kcal} kcal target). ${how} Confirm the closest match so I can log it cleanly.`
}

export function formReply(p: Profile, ex: Exercise, lang: Lang = 'en'): string {
  if (lang === 'zh') {
    return [
      `正在看你的「${ex.name}」短片。動作模式：${ex.pattern}。`,
      `依你的 ${p.goal} 週期，建議 ${ex.reps[p.goal]}。`,
      `下面是準備姿勢、常用提示，以及我最先會抓的錯誤。`,
    ].join(' ')
  }
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
  if (
    q.includes('macro') ||
    q.includes('tdee') ||
    q.includes('宏量') ||
    q.includes('熱量目標') ||
    (q.includes('target') && q.includes('macro'))
  ) {
    return { kind: 'macros' }
  }
  if (
    q.includes('plan') ||
    q.includes('workout') ||
    q.includes('program') ||
    q.includes('split') ||
    q.includes('訓練') ||
    q.includes('計畫') ||
    q.includes('计划')
  ) {
    return { kind: 'plan' }
  }
  if (
    findRecipe(q) ||
    q.includes('recipe') ||
    q.includes('meal') ||
    q.includes('eat') ||
    q.includes('dinner') ||
    q.includes('breakfast') ||
    q.includes('lunch') ||
    q.includes('吃') ||
    q.includes('餐') ||
    q.includes('食譜') ||
    q.includes('食谱')
  ) {
    return { kind: 'meal' }
  }
  if (
    q.includes('calorie') ||
    q.includes('kcal') ||
    q.includes('i ate') ||
    q.includes('food photo') ||
    q.includes('卡路里') ||
    q.includes('熱量') ||
    q.includes('热量') ||
    findFood(q)
  ) {
    return { kind: 'calories' }
  }
  if (
    q.includes('form') ||
    q.includes('technique') ||
    q.includes('cue') ||
    q.includes('clip') ||
    q.includes('姿勢') ||
    q.includes('姿势') ||
    q.includes('動作') ||
    q.includes('动作') ||
    ex
  ) {
    return { kind: 'form', exercise: ex }
  }
  return { kind: 'chat' }
}

export function chatReply(p: Profile, text: string, lang: Lang = 'en'): string {
  const intent = parseIntent(text)
  const t = targets(p)
  if (intent.kind === 'macros') {
    if (lang === 'zh') {
      const adj =
        p.goal === 'cut' ? '約 400 kcal 赤字' : p.goal === 'bulk' ? '約 300 kcal 盈餘' : '維持'
      return `「${p.goal}」目標：${t.kcal} kcal、蛋白質 ${t.protein}g、碳水 ${t.carbs}g、脂肪 ${t.fat}g。以 Mifflin-St Jeor × 活動量再套用${adj}調整。`
    }
    return `Targets for ${p.goal}: ${t.kcal} kcal, ${t.protein}g protein, ${t.carbs}g carbs, ${t.fat}g fat. Built from Mifflin-St Jeor × activity, then a ${p.goal === 'cut' ? '400 kcal deficit' : p.goal === 'bulk' ? '300 kcal surplus' : 'maintenance'} adjustment.`
  }
  if (intent.kind === 'plan') return planReply(p, lang)
  if (intent.kind === 'meal') {
    const meal = pickMeals(p)[0]
    return (
      mealReply(p, meal, lang) +
      (lang === 'zh' ? '\n\n完整食譜已附上。想換一餐跟我說。' : '\n\nI attached the full recipe. Ask for another if you want a swap.')
    )
  }
  if (intent.kind === 'form' && intent.exercise) {
    return (
      formReply(p, intent.exercise, lang) +
      (lang === 'zh'
        ? ' 上傳 5–15 秒短片，我可以用同一套提示對片說明。'
        : ' Upload a 5–15s clip and I’ll walk the same cues against your video.')
    )
  }
  if (intent.kind === 'form') {
    return lang === 'zh'
      ? '上傳一個動作短片（深蹲、硬拉、推、拉或弓箭步）。我會對應模式，並給準備姿勢、提示與常見錯誤。'
      : 'Upload a short clip of one lift (squat, hinge, press, pull, or lunge). I’ll match it to a pattern and give setup, cues, and the mistakes that show up most on first-week film.'
  }
  if (intent.kind === 'calories') {
    const food = findFood(text)
    if (food) {
      return calorieText(food.name, food.kcal, p, 'local', lang)
    }
    return lang === 'zh'
      ? '拍一下餐盤——或告訴我是什麼。我會對照今日目標估算熱量。'
      : 'Snap the plate — or tell me what it is. I’ll estimate calories against today’s target.'
  }
  return lang === 'zh'
    ? `我主要幫三件事：符合「${p.goal}」的餐、短片看姿勢、照片估熱量。今天想先練哪一塊？`
    : `I’m here for three jobs: meals that match your ${p.goal}, form from a short video, and calories from a photo. What do you want to shape today?`
}
