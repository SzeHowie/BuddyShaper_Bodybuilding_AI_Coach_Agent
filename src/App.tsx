import { useEffect, useMemo, useRef, useState } from 'react'
import { Gymergee } from './components/Gymergee'
import { exercises, findExercise } from './data/exercises'
import { foods } from './data/foods'
import { findRecipe, recipesFor } from './data/recipes'
import {
  calorieText,
  chatReply,
  formReply,
  greeting,
  mealReply,
  parseIntent,
  pickMeals,
  planReply,
} from './engine/coach'
import { env } from './config/env'
import { chatWithGlm } from './engine/glmChat'
import { identifyFoodWithGlm } from './engine/glmVision'
import { targets } from './engine/macros'
import { rankFoods, sampleImage } from './engine/vision'
import { LangSwitch, useI18n } from './i18n/I18nContext'
import { goalLabel } from './i18n/messages'
import type { Activity, Exercise, Goal, Message, Profile, Sex } from './types'

const STORAGE = 'buddyshaper.profile'

/** Empty onboarding draft — user fills everything. */
type Draft = {
  name: string
  goal: Goal | ''
  sex: Sex | ''
  age: string
  heightCm: string
  weightKg: string
  activity: Activity | ''
  diet: string
}

const blank: Draft = {
  name: '',
  goal: '',
  sex: '',
  age: '',
  heightCm: '',
  weightKg: '',
  activity: '',
  diet: '',
}

function draftReady(d: Draft): boolean {
  const age = Number(d.age)
  const heightCm = Number(d.heightCm)
  const weightKg = Number(d.weightKg)
  return (
    Boolean(d.name.trim()) &&
    Boolean(d.goal) &&
    Boolean(d.sex) &&
    Boolean(d.activity) &&
    Number.isFinite(age) &&
    age >= 16 &&
    age <= 80 &&
    Number.isFinite(heightCm) &&
    heightCm > 0 &&
    Number.isFinite(weightKg) &&
    weightKg > 0
  )
}

function toProfile(d: Draft): Profile {
  return {
    name: d.name.trim(),
    goal: d.goal as Goal,
    sex: d.sex as Sex,
    age: Number(d.age),
    heightCm: Number(d.heightCm),
    weightKg: Number(d.weightKg),
    activity: d.activity as Activity,
    diet: d.diet.trim(),
  }
}

function toDraft(p: Profile): Draft {
  return {
    name: p.name,
    goal: p.goal,
    sex: p.sex,
    age: String(p.age),
    heightCm: String(p.heightCm),
    weightKg: String(p.weightKg),
    activity: p.activity,
    diet: p.diet,
  }
}

function uid() {
  return crypto.randomUUID()
}

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

export default function App() {
  const { lang, tr } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())
  const [draft, setDraft] = useState<Draft>(blank)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const macros = useMemo(() => (profile ? targets(profile) : null), [profile])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    if (!profile) return
    setMessages((m) =>
      m.length
        ? m
        : [
            {
              id: uid(),
              role: 'buddy',
              text: greeting(profile, lang),
              at: Date.now(),
            },
          ],
    )
  }, [profile, lang])

  function saveProfile(p: Profile) {
    localStorage.setItem(STORAGE, JSON.stringify(p))
    setProfile(p)
  }

  function push(msg: Omit<Message, 'id' | 'at'>) {
    setMessages((m) => [...m, { ...msg, id: uid(), at: Date.now() }])
  }

  async function handleSend(raw?: string) {
    if (!profile) return
    const value = (raw ?? text).trim()
    if (!value) return
    setText('')
    push({ role: 'you', text: value })
    setBusy(true)
    await wait()
    const intent = parseIntent(value)
    if (intent.kind === 'meal') {
      const recipe = findRecipe(value) ?? pickMeals(profile)[0]
      push({
        role: 'buddy',
        text: mealReply(profile, recipe, lang),
        card: { type: 'recipe', recipe },
      })
    } else if (intent.kind === 'plan') {
      push({ role: 'buddy', text: planReply(profile, lang) })
    } else if (intent.kind === 'form' && intent.exercise) {
      push({
        role: 'buddy',
        text: formReply(profile, intent.exercise, lang) + tr('formClipHint'),
        card: { type: 'form', exercise: intent.exercise, videoUrl: '' },
      })
    } else if (intent.kind === 'calories') {
      const named = foods.find(
        (f) =>
          value.toLowerCase().includes(f.name.toLowerCase()) ||
          f.aliases.some((a) => value.toLowerCase().includes(a)),
      )
      if (named) {
        push({
          role: 'buddy',
          text: calorieText(named.name, named.kcal, profile, 'local', lang),
          card: {
            type: 'calories',
            guesses: [{ food: named, score: 100 }],
            confirmedId: named.id,
            photoUrl: '',
          },
        })
      } else if (env.aiProvider === 'glm' && env.glm.apiKey) {
        try {
          push({ role: 'buddy', text: await chatWithGlm(profile, value, lang) })
        } catch {
          push({ role: 'buddy', text: tr('glmChatFail') })
        }
      } else {
        push({ role: 'buddy', text: chatReply(profile, value, lang) })
      }
    } else if (env.aiProvider === 'glm' && env.glm.apiKey) {
      try {
        push({ role: 'buddy', text: await chatWithGlm(profile, value, lang) })
      } catch {
        push({ role: 'buddy', text: tr('glmChatFail') })
      }
    } else {
      push({ role: 'buddy', text: chatReply(profile, value, lang) })
    }
    setBusy(false)
  }

  async function onPhoto(file: File) {
    if (!profile) return
    const url = URL.createObjectURL(file)
    push({
      role: 'you',
      text: tr('platePhoto'),
      attachment: { kind: 'photo', url, name: file.name },
    })
    setBusy(true)
    await wait(400)
    try {
      if (env.aiProvider === 'glm' && env.glm.apiKey) {
        const guesses = await identifyFoodWithGlm(file, lang)
        const top = guesses[0].food
        push({
          role: 'buddy',
          text: calorieText(top.name, top.kcal, profile, 'glm', lang),
          card: { type: 'calories', guesses, photoUrl: url },
        })
      } else {
        const sample = await sampleImage(url)
        const guesses = rankFoods(sample, text)
        const top = guesses[0].food
        push({
          role: 'buddy',
          text: calorieText(top.name, top.kcal, profile, 'local', lang),
          card: { type: 'calories', guesses, photoUrl: url },
        })
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : ''
      push({
        role: 'buddy',
        text:
          (env.aiProvider === 'glm'
            ? `${tr('visionFailPrefix')}${detail ? `: ${detail}` : ''}. `
            : '') + tr('visionFailSuffix'),
      })
    }
    setBusy(false)
  }

  async function onVideo(file: File) {
    if (!profile) return
    const url = URL.createObjectURL(file)
    push({
      role: 'you',
      text: tr('liftClip'),
      attachment: { kind: 'video', url, name: file.name },
    })
    setBusy(true)
    await wait(600)
    const hinted = findExercise(text) ?? findExercise(file.name.replace(/[-_]/g, ' '))
    const ex = hinted ?? exercises[0]
    push({
      role: 'buddy',
      text: hinted
        ? formReply(profile, hinted, lang)
        : `${tr('clipUnknownPrefix')} ${ex.name}${tr('clipUnknownSuffix')} ` +
          formReply(profile, ex, lang),
      card: { type: 'form', exercise: ex, videoUrl: url },
    })
    setBusy(false)
  }

  function confirmFood(messageId: string, foodId: string) {
    if (!profile) return
    setMessages((all) =>
      all.map((m) => {
        if (m.id !== messageId || m.card?.type !== 'calories') return m
        const fromCard = m.card.guesses.find((g) => g.food.id === foodId)?.food
        const food = fromCard ?? foods.find((f) => f.id === foodId)
        if (!food) return m
        const pct = Math.round((food.kcal / targets(profile).kcal) * 100)
        const logged =
          lang === 'zh'
            ? `已記錄：${food.name} · ${food.kcal} kcal · 蛋白質 ${food.protein}g（${food.portion}）。約佔今日熱量目標 ${pct}%。`
            : `Logged: ${food.name} · ${food.kcal} kcal · ${food.protein}g protein (${food.portion}). ${pct}% of today’s calorie target.`
        return {
          ...m,
          text: logged,
          card: { ...m.card, confirmedId: foodId },
        }
      }),
    )
  }

  function setFormExercise(messageId: string, exercise: Exercise) {
    if (!profile) return
    setMessages((all) =>
      all.map((m) => {
        if (m.id !== messageId || m.card?.type !== 'form') return m
        return {
          ...m,
          text: formReply(profile, exercise, lang),
          card: { ...m.card, exercise },
        }
      }),
    )
  }

  if (!profile) {
    return (
      <main className="app">
        <header className="topbar">
          <div className="brand">
            <div className="mark" aria-hidden="true">
              <Gymergee size="sm" />
            </div>
            <div>
              <h1>BuddyShaper</h1>
              <p>{tr('brandTagline')}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <LangSwitch />
          </div>
        </header>
        <section className="onboard">
          <div className="onboard-hero">
            <div className="onboard-mascot">
              <p className="onboard-brand">BuddyShaper</p>
              <Gymergee size="hero" bounce />
            </div>
            <p className="onboard-kicker">{tr('meetKicker')}</p>
            <h2>{tr('onboardTitle')}</h2>
          </div>
          <p className="fine">{tr('onboardBlurb')}</p>
          <div className="grid">
            <label className="field span">
              <span>{tr('name')}</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder=""
                autoComplete="nickname"
              />
            </label>
            <div className="field span">
              <span>{tr('goal')}</span>
              <div className="goals">
                {(['cut', 'bulk', 'recomp', 'maintain'] as const).map((g) => (
                  <button
                    key={g}
                    className={draft.goal === g ? 'chip on' : 'chip'}
                    type="button"
                    onClick={() => setDraft({ ...draft, goal: g })}
                  >
                    {goalLabel(lang, g)}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>{tr('sex')}</span>
              <select
                value={draft.sex}
                onChange={(e) => setDraft({ ...draft, sex: e.target.value as Sex | '' })}
              >
                <option value="">{tr('select')}</option>
                <option value="female">{tr('sexFemale')}</option>
                <option value="male">{tr('sexMale')}</option>
                <option value="other">{tr('sexOther')}</option>
              </select>
            </label>
            <label className="field">
              <span>{tr('age')}</span>
              <input
                type="number"
                min={16}
                max={80}
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                placeholder=""
              />
            </label>
            <label className="field">
              <span>{tr('height')}</span>
              <input
                type="number"
                value={draft.heightCm}
                onChange={(e) => setDraft({ ...draft, heightCm: e.target.value })}
                placeholder=""
              />
            </label>
            <label className="field">
              <span>{tr('weight')}</span>
              <input
                type="number"
                value={draft.weightKg}
                onChange={(e) => setDraft({ ...draft, weightKg: e.target.value })}
                placeholder=""
              />
            </label>
            <label className="field">
              <span>{tr('trainingLoad')}</span>
              <select
                value={draft.activity}
                onChange={(e) =>
                  setDraft({ ...draft, activity: e.target.value as Activity | '' })
                }
              >
                <option value="">{tr('select')}</option>
                <option value="sedentary">{tr('activitySedentary')}</option>
                <option value="light">{tr('activityLight')}</option>
                <option value="moderate">{tr('activityModerate')}</option>
                <option value="hard">{tr('activityHard')}</option>
              </select>
            </label>
            <label className="field">
              <span>{tr('foodNotes')}</span>
              <input
                value={draft.diet}
                onChange={(e) => setDraft({ ...draft, diet: e.target.value })}
                placeholder=""
              />
            </label>
          </div>
          <button
            className="primary"
            type="button"
            disabled={!draftReady(draft)}
            onClick={() => saveProfile(toProfile(draft))}
          >
            {tr('startTrain')}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="mark" aria-hidden="true">
            <Gymergee size="sm" />
          </div>
          <div>
            <h1>BuddyShaper</h1>
            <p>
              {profile.name} · {goalLabel(lang, profile.goal)} · {macros?.kcal} kcal
            </p>
          </div>
        </div>
        <div className="topbar-actions">
          <LangSwitch />
          <button
            className="ghost"
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE)
              setProfile(null)
              setMessages([])
              setDraft(toDraft(profile))
            }}
          >
            {tr('editBody')}
          </button>
        </div>
      </header>

      <div className="thread">
        {messages.map((m) => (
          <article key={m.id} className={m.role === 'you' ? 'row you' : 'row'}>
            {m.role === 'buddy' ? (
              <div className="avatar" aria-hidden="true">
                <Gymergee size="sm" />
              </div>
            ) : null}
            <div className="bubble">
              {m.attachment?.kind === 'photo' ? (
                <img className="media" src={m.attachment.url} alt={m.attachment.name} />
              ) : null}
              {m.attachment?.kind === 'video' ? (
                <video className="media" src={m.attachment.url} controls />
              ) : null}
              {m.text}
              {m.card?.type === 'recipe' ? (
                <div className="card">
                  <h3>{m.card.recipe.name}</h3>
                  <div className="meta">
                    <span>{m.card.recipe.minutes} min</span>
                    <span>
                      {m.card.recipe.macros.kcal} kcal · {m.card.recipe.macros.protein}p /{' '}
                      {m.card.recipe.macros.carbs}c / {m.card.recipe.macros.fat}f
                    </span>
                  </div>
                  <ol className="list">
                    {m.card.recipe.ingredients.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ol>
                  <ol className="list">
                    {m.card.recipe.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {m.card?.type === 'calories' ? (
                <div className="card">
                  {m.card.photoUrl ? <img className="media" src={m.card.photoUrl} alt="" /> : null}
                  <h3>{tr('plateEstimate')}</h3>
                  <div className="guesses">
                    {m.card.guesses.map(({ food, score }) => (
                      <button
                        key={food.id}
                        className="guess"
                        type="button"
                        onClick={() => confirmFood(m.id, food.id)}
                      >
                        <strong>
                          {food.name}
                          {m.card && m.card.type === 'calories' && m.card.confirmedId === food.id
                            ? ` · ${tr('logged')}`
                            : ''}
                        </strong>
                        {food.kcal} kcal · {food.protein}g protein · {food.portion}
                        <span className="fine">
                          {' '}
                          {tr('match')} {Math.round(score)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {m.card?.type === 'form' ? (
                <div className="card">
                  {m.card.videoUrl ? <video className="media" src={m.card.videoUrl} controls /> : null}
                  <h3>{m.card.exercise.name}</h3>
                  <div className="meta">
                    {exercises.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        className={
                          m.card?.type === 'form' && m.card.exercise.id === ex.id
                            ? 'chip on'
                            : 'chip'
                        }
                        onClick={() => setFormExercise(m.id, ex)}
                      >
                        {ex.name}
                      </button>
                    ))}
                  </div>
                  <p className="fine">{tr('setup')}</p>
                  <ul className="list">
                    {m.card.exercise.setup.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="fine">{tr('cues')}</p>
                  <ul className="list">
                    {m.card.exercise.cues.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="fine">{tr('mistakes')}</p>
                  <ul className="list">
                    {m.card.exercise.mistakes.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p>
                    {tr('prescription')}: <strong>{m.card.exercise.reps[profile.goal]}</strong>
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
        {busy ? (
          <article className="row">
            <div className="avatar" aria-hidden="true">
              <Gymergee size="sm" bounce />
            </div>
            <div className="bubble busy-bubble">{tr('watching')}</div>
          </article>
        ) : null}
        <div ref={bottom} />
      </div>

      <footer className="composer">
        <div className="quick">
          <button
            className="chip"
            type="button"
            onClick={() => handleSend(tr('quickMealPrompt'))}
          >
            {tr('quickMeal')}
          </button>
          <button
            className="chip"
            type="button"
            onClick={() => handleSend(tr('quickPlanPrompt'))}
          >
            {tr('quickPlan')}
          </button>
          <button
            className="chip"
            type="button"
            onClick={() => handleSend(tr('quickMacrosPrompt'))}
          >
            {tr('quickMacros')}
          </button>
          {recipesFor(profile.goal)
            .slice(1, 3)
            .map((r) => (
              <button key={r.id} className="chip" type="button" onClick={() => handleSend(r.name)}>
                {r.name}
              </button>
            ))}
        </div>
        <div className="bar">
          <button
            className="iconbtn"
            type="button"
            title={tr('photoTitle')}
            onClick={() => photoRef.current?.click()}
          >
            {tr('photo')}
          </button>
          <button
            className="iconbtn"
            type="button"
            title={tr('clipTitle')}
            onClick={() => videoRef.current?.click()}
          >
            {tr('clip')}
          </button>
          <textarea
            value={text}
            placeholder={tr('askPlaceholder')}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
          />
          <button className="primary" type="button" onClick={() => void handleSend()}>
            {tr('send')}
          </button>
        </div>
        <p className="disclaimer">{tr('disclaimer')}</p>
        <input
          ref={photoRef}
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void onPhoto(file)
            e.target.value = ''
          }}
        />
        <input
          ref={videoRef}
          className="hidden"
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void onVideo(file)
            e.target.value = ''
          }}
        />
      </footer>
    </main>
  )
}

function wait(ms = 420) {
  return new Promise((r) => setTimeout(r, ms))
}
