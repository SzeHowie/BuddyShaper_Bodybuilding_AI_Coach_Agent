import type { Activity, Goal, Sex } from '../types'
import type { Lang } from './types'

export type MessageKey = keyof typeof en

const en = {
  brandTagline: 'Gymergee coaches food, form & fuel',
  meetKicker: 'Meet Gymergee · 俊美雞',
  onboardTitle: 'Your cartoon coach for this training block.',
  onboardBlurb:
    'Tell Gymergee your stats. We’ll set calories, then you chat: plate photos, lift clips, recipes — with a chick that celebrates every PR.',
  name: 'Name',
  goal: 'Goal',
  sex: 'Sex',
  age: 'Age',
  height: 'Height (cm)',
  weight: 'Weight (kg)',
  trainingLoad: 'Training load',
  foodNotes: 'Food notes',
  select: 'Select',
  sexFemale: 'Female',
  sexMale: 'Male',
  sexOther: 'Other / skip',
  activitySedentary: 'Desk, 0–1 sessions',
  activityLight: '2–3 sessions',
  activityModerate: '4–5 sessions',
  activityHard: '6+ or physical job',
  startTrain: 'Train with Gymergee',
  editBody: 'Edit body',
  plateEstimate: 'Plate estimate',
  logged: 'logged',
  match: 'match',
  setup: 'Setup',
  cues: 'Cues for this clip',
  mistakes: 'Fix these first',
  prescription: 'Prescription',
  watching: 'Gymergee is watching…',
  quickMeal: 'Meal for my goal',
  quickPlan: 'Lift plan',
  quickMacros: 'Macros',
  photo: 'Photo',
  clip: 'Clip',
  send: 'Send',
  askPlaceholder: 'Ask Gymergee, or attach a plate / lift clip',
  photoTitle: 'Food photo',
  clipTitle: 'Lift video',
  disclaimer:
    'Coaching estimates only — not medical or dietetic advice. With VITE_AI_PROVIDER=glm, photos and chat call Zhipu GLM; otherwise a local color matcher is used.',
  platePhoto: 'Plate photo',
  liftClip: 'Lift clip',
  langEn: 'EN',
  langZh: '中文',
  goalCut: 'cut',
  goalBulk: 'bulk',
  goalRecomp: 'recomp',
  goalMaintain: 'maintain',
  glmChatFail:
    'GLM chat failed. Check VITE_GLM_API_KEY / model, or set VITE_AI_PROVIDER=none for the local demo.',
  visionFailPrefix: 'GLM vision failed',
  visionFailSuffix: 'I couldn’t read that image. Tell me what you ate and I’ll still estimate.',
  clipUnknownPrefix: 'I pulled your clip. If this isn’t a',
  clipUnknownSuffix: ', tap the right pattern below.',
  formClipHint: ' Drop a 5–15s clip when you want this matched to your film.',
  quickMealPrompt: 'What should I eat today?',
  quickPlanPrompt: 'Give me a weekly lift plan',
  quickMacrosPrompt: 'Show my macros',
} as const

const zh: Record<MessageKey, string> = {
  brandTagline: '俊美雞陪你練飲食、動作與熱量',
  meetKicker: '認識 Gymergee · 俊美雞',
  onboardTitle: '這個訓練週期的卡通教練。',
  onboardBlurb:
    '先告訴俊美雞你的身體數據，我們會算出熱量目標，接著就能聊天：餐盤照片、動作短片、食譜——每個人 PR 都值得慶祝。',
  name: '暱稱',
  goal: '目標',
  sex: '性別',
  age: '年齡',
  height: '身高（公分）',
  weight: '體重（公斤）',
  trainingLoad: '訓練量',
  foodNotes: '飲食備註',
  select: '請選擇',
  sexFemale: '女',
  sexMale: '男',
  sexOther: '其他／略過',
  activitySedentary: '久坐，每週 0–1 練',
  activityLight: '每週 2–3 練',
  activityModerate: '每週 4–5 練',
  activityHard: '每週 6+ 或體力工作',
  startTrain: '開始與俊美雞訓練',
  editBody: '修改身體資料',
  plateEstimate: '餐盤估算',
  logged: '已記錄',
  match: '匹配',
  setup: '準備姿勢',
  cues: '本支影片提示',
  mistakes: '先改這些',
  prescription: '建議組數',
  watching: '俊美雞正在看…',
  quickMeal: '符合目標的餐',
  quickPlan: '訓練計畫',
  quickMacros: '熱量宏量',
  photo: '拍照',
  clip: '影片',
  send: '送出',
  askPlaceholder: '問俊美雞，或附上餐盤／動作短片',
  photoTitle: '食物照片',
  clipTitle: '動作影片',
  disclaimer:
    '僅供教練式估算，非醫療或營養師建議。若 VITE_AI_PROVIDER=glm，照片與聊天會呼叫智譜 GLM；否則使用本地顏色匹配。',
  platePhoto: '餐盤照片',
  liftClip: '動作短片',
  langEn: 'EN',
  langZh: '中文',
  goalCut: '減脂',
  goalBulk: '增肌',
  goalRecomp: '重組',
  goalMaintain: '維持',
  glmChatFail: 'GLM 聊天失敗。請檢查 VITE_GLM_API_KEY／模型，或把 VITE_AI_PROVIDER 設為 none 使用本地 demo。',
  visionFailPrefix: 'GLM 圖像辨識失敗',
  visionFailSuffix: '我讀不到這張圖。告訴我你吃了什麼，我仍可以幫你估。',
  clipUnknownPrefix: '我看了你的短片。若不是',
  clipUnknownSuffix: '，請點下方正確動作。',
  formClipHint: ' 想對片分析時，再傳一段 5–15 秒短片即可。',
  quickMealPrompt: '今天該吃什麼？',
  quickPlanPrompt: '給我一週訓練計畫',
  quickMacrosPrompt: '顯示我的宏量營養',
}

const tables: Record<Lang, Record<MessageKey, string>> = { en, zh }

export function t(lang: Lang, key: MessageKey): string {
  return tables[lang][key] ?? en[key]
}

export function goalLabel(lang: Lang, goal: Goal): string {
  const map: Record<Goal, MessageKey> = {
    cut: 'goalCut',
    bulk: 'goalBulk',
    recomp: 'goalRecomp',
    maintain: 'goalMaintain',
  }
  return t(lang, map[goal])
}

export function sexLabel(lang: Lang, sex: Sex): string {
  if (sex === 'female') return t(lang, 'sexFemale')
  if (sex === 'male') return t(lang, 'sexMale')
  return t(lang, 'sexOther')
}

export function activityLabel(lang: Lang, activity: Activity): string {
  const map: Record<Activity, MessageKey> = {
    sedentary: 'activitySedentary',
    light: 'activityLight',
    moderate: 'activityModerate',
    hard: 'activityHard',
  }
  return t(lang, map[activity])
}
