import type { Goal, Recipe } from '../types'

export const recipes: Recipe[] = [
  {
    id: 'lemon-chicken',
    name: 'Lemon herb chicken bowl',
    goals: ['cut', 'recomp', 'maintain'],
    minutes: 25,
    macros: { kcal: 430, protein: 48, carbs: 32, fat: 12 },
    why: 'High protein, low oil, keeps you full on a cut without starving training.',
    ingredients: [
      '180g chicken breast',
      '120g cooked jasmine rice or cauliflower rice',
      'steamed broccoli + cucumber',
      'lemon, garlic, oregano, salt',
    ],
    steps: [
      'Season chicken with lemon, garlic, oregano.',
      'Pan-sear 5–6 min per side until 74°C inside.',
      'Plate over rice and greens. Squeeze extra lemon.',
    ],
  },
  {
    id: 'egg-oats',
    name: 'Savory egg oats',
    goals: ['cut', 'recomp', 'maintain'],
    minutes: 12,
    macros: { kcal: 380, protein: 28, carbs: 36, fat: 12 },
    why: 'Cheap breakfast that hits protein without a shake.',
    ingredients: [
      '50g oats',
      '2 eggs + 1 egg white',
      'spinach, chili flakes',
      'optional 20g feta',
    ],
    steps: [
      'Simmer oats in water or broth until thick.',
      'Stir in eggs off the heat until creamy.',
      'Fold spinach. Salt, pepper, chili.',
    ],
  },
  {
    id: 'tuna-crunch',
    name: 'Tuna crunch salad',
    goals: ['cut'],
    minutes: 8,
    macros: { kcal: 290, protein: 36, carbs: 10, fat: 11 },
    why: 'No-cook lunch when you need protein and volume.',
    ingredients: [
      '1 can tuna in water',
      'Greek yogurt + mustard',
      'celery, apple, lettuce',
    ],
    steps: [
      'Mix tuna with yogurt and mustard.',
      'Fold in chopped celery and apple.',
      'Serve over a big lettuce pile.',
    ],
  },
  {
    id: 'beef-rice',
    name: 'Ginger beef rice',
    goals: ['bulk', 'recomp', 'maintain'],
    minutes: 20,
    macros: { kcal: 720, protein: 46, carbs: 78, fat: 22 },
    why: 'Easy surplus meal: dense carbs plus enough protein to grow.',
    ingredients: [
      '150g lean beef mince',
      '200g cooked rice',
      'frozen mixed veg',
      'soy, ginger, sesame oil',
    ],
    steps: [
      'Brown beef. Add ginger and veg.',
      'Stir in rice and soy. Finish with a few drops of sesame oil.',
    ],
  },
  {
    id: 'overnight-mass',
    name: 'Overnight mass oats',
    goals: ['bulk'],
    minutes: 5,
    macros: { kcal: 780, protein: 42, carbs: 95, fat: 22 },
    why: 'Set-and-forget calories for hard gainers who skip breakfast.',
    ingredients: [
      '90g oats',
      '1 scoop whey',
      '250ml milk',
      'banana, peanut butter 20g',
    ],
    steps: [
      'Mix everything in a jar.',
      'Fridge overnight. Eat cold or warm 60 seconds.',
    ],
  },
  {
    id: 'salmon-potato',
    name: 'Salmon and sweet potato',
    goals: ['recomp', 'maintain', 'bulk'],
    minutes: 30,
    macros: { kcal: 560, protein: 40, carbs: 44, fat: 22 },
    why: 'Training-day plate: carbs for the session, fats for hormones, protein for repair.',
    ingredients: [
      '150g salmon',
      '1 medium sweet potato',
      'asparagus or green beans',
      'olive oil 1 tsp',
    ],
    steps: [
      'Roast potato at 200°C for 25 min.',
      'Bake salmon 12–14 min with greens.',
    ],
  },
  {
    id: 'tofu-stir',
    name: 'Crispy tofu stir-fry',
    goals: ['cut', 'recomp', 'maintain'],
    minutes: 18,
    macros: { kcal: 410, protein: 28, carbs: 34, fat: 16 },
    why: 'Plant option that still clears 25g+ protein.',
    ingredients: [
      '200g extra-firm tofu',
      'mixed peppers + broccoli',
      'soy, garlic, chili',
      '80g cooked rice optional',
    ],
    steps: [
      'Press tofu, cube, pan-crisp.',
      'Stir-fry veg hot and fast. Combine with sauce.',
    ],
  },
  {
    id: 'yogurt-berry',
    name: 'Berry yogurt protein cup',
    goals: ['cut', 'recomp', 'maintain'],
    minutes: 4,
    macros: { kcal: 240, protein: 28, carbs: 22, fat: 4 },
    why: 'Snack that replaces dessert without blowing the day.',
    ingredients: ['200g 0% Greek yogurt', 'berries', 'cinnamon', 'optional honey 1 tsp'],
    steps: ['Layer yogurt and berries. Dust cinnamon.'],
  },
]

export function recipesFor(goal: Goal): Recipe[] {
  return recipes.filter((r) => r.goals.includes(goal))
}

export function findRecipe(query: string): Recipe | undefined {
  const q = query.toLowerCase()
  return recipes.find((r) => r.name.toLowerCase().includes(q) || q.includes(r.name.toLowerCase()))
}
