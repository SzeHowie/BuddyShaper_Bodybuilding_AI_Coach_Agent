export type Goal = 'cut' | 'bulk' | 'recomp' | 'maintain'
export type Sex = 'female' | 'male' | 'other'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'hard'

export type Profile = {
  name: string
  goal: Goal
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: Activity
  diet: string
}

export type Macros = {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export type Food = {
  id: string
  name: string
  aliases: string[]
  kcal: number
  protein: number
  carbs: number
  fat: number
  portion: string
  grams: number
  hue: [number, number]
  sat: [number, number]
  light: [number, number]
}

export type Recipe = {
  id: string
  name: string
  goals: Goal[]
  minutes: number
  macros: Macros
  why: string
  ingredients: string[]
  steps: string[]
}

export type Exercise = {
  id: string
  name: string
  aliases: string[]
  pattern: string
  setup: string[]
  reps: Record<Goal, string>
  cues: string[]
  mistakes: string[]
}

export type Attachment =
  | { kind: 'photo'; url: string; name: string }
  | { kind: 'video'; url: string; name: string }

export type RecipeCard = {
  type: 'recipe'
  recipe: Recipe
}

export type CalorieCard = {
  type: 'calories'
  guesses: { food: Food; score: number }[]
  confirmedId?: string
  photoUrl: string
}

export type FormCard = {
  type: 'form'
  exercise: Exercise
  videoUrl: string
}

export type Message = {
  id: string
  role: 'buddy' | 'you'
  text: string
  at: number
  attachment?: Attachment
  card?: RecipeCard | CalorieCard | FormCard
}
