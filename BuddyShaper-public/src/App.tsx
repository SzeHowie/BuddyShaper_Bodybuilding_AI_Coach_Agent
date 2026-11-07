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
import { targets } from './engine/macros'
import { rankFoods, sampleImage } from './engine/vision'
import type { Exercise, Message, Profile } from './types'

const STORAGE = 'buddyshaper.profile'

const blank: Profile = {
  name: '',
  goal: 'recomp',
  sex: 'other',
  age: 28,
  heightCm: 170,
  weightKg: 70,
  activity: 'moderate',
  diet: '',
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
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())
  const [draft, setDraft] = useState<Profile>(blank)
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
              text: greeting(profile),
              at: Date.now(),
            },
          ],
    )
  }, [profile])

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
        text: mealReply(profile, recipe),
        card: { type: 'recipe', recipe },
      })
    } else if (intent.kind === 'plan') {
      push({ role: 'buddy', text: planReply(profile) })
    } else if (intent.kind === 'form' && intent.exercise) {
      push({
        role: 'buddy',
        text: formReply(profile, intent.exercise) + ' Drop a 5–15s clip when you want this matched to your film.',
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
          text: calorieText(named.name, named.kcal, profile),
          card: {
            type: 'calories',
            guesses: [{ food: named, score: 100 }],
            confirmedId: named.id,
            photoUrl: '',
          },
        })
      } else {
        push({ role: 'buddy', text: chatReply(profile, value) })
      }
    } else {
      push({ role: 'buddy', text: chatReply(profile, value) })
    }
    setBusy(false)
  }

  async function onPhoto(file: File) {
    if (!profile) return
    const url = URL.createObjectURL(file)
    push({
      role: 'you',
      text: 'Plate photo',
      attachment: { kind: 'photo', url, name: file.name },
    })
    setBusy(true)
    await wait(700)
    try {
      const sample = await sampleImage(url)
      const guesses = rankFoods(sample, text)
      const top = guesses[0].food
      push({
        role: 'buddy',
        text: calorieText(top.name, top.kcal, profile),
        card: { type: 'calories', guesses, photoUrl: url },
      })
    } catch {
      push({
        role: 'buddy',
        text: 'I couldn’t read that image. Tell me what you ate and I’ll still estimate.',
      })
    }
    setBusy(false)
  }

  async function onVideo(file: File) {
    if (!profile) return
    const url = URL.createObjectURL(file)
    push({
      role: 'you',
      text: 'Lift clip',
      attachment: { kind: 'video', url, name: file.name },
    })
    setBusy(true)
    await wait(600)
    const hinted = findExercise(text) ?? findExercise(file.name.replace(/[-_]/g, ' '))
    const ex = hinted ?? exercises[0]
    push({
      role: 'buddy',
      text:
        (hinted
          ? formReply(profile, hinted)
          : `I pulled your clip. If this isn’t a ${ex.name}, tap the right pattern below. ` +
            formReply(profile, ex)),
      card: { type: 'form', exercise: ex, videoUrl: url },
    })
    setBusy(false)
  }

  function confirmFood(messageId: string, foodId: string) {
    if (!profile) return
    const food = foods.find((f) => f.id === foodId)
    if (!food) return
    setMessages((all) =>
      all.map((m) => {
        if (m.id !== messageId || m.card?.type !== 'calories') return m
        return {
          ...m,
          text: `Logged: ${food.name} · ${food.kcal} kcal · ${food.protein}g protein (${food.portion}). ${Math.round((food.kcal / targets(profile).kcal) * 100)}% of today’s calorie target.`,
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
          text: formReply(profile, exercise),
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
              <p>Gymergee coaches food, form & fuel</p>
            </div>
          </div>
        </header>
        <section className="onboard">
          <div className="onboard-hero">
            <div className="onboard-mascot">
              <p className="onboard-brand">BuddyShaper</p>
              <Gymergee size="hero" bounce />
            </div>
            <p className="onboard-kicker">Meet Gymergee · 俊美雞</p>
            <h2>Your cartoon coach for this training block.</h2>
          </div>
          <p className="fine">
            Tell Gymergee your stats. We’ll set calories, then you chat: plate photos, lift clips,
            recipes — with a chick that celebrates every PR.
          </p>
          <div className="grid">
            <label className="field span">
              <span>Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Howie"
              />
            </label>
            <div className="field span">
              <span>Goal</span>
              <div className="goals">
                {(['cut', 'bulk', 'recomp', 'maintain'] as const).map((g) => (
                  <button
                    key={g}
                    className={draft.goal === g ? 'chip on' : 'chip'}
                    type="button"
                    onClick={() => setDraft({ ...draft, goal: g })}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Sex</span>
              <select
                value={draft.sex}
                onChange={(e) => setDraft({ ...draft, sex: e.target.value as Profile['sex'] })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other / skip</option>
              </select>
            </label>
            <label className="field">
              <span>Age</span>
              <input
                type="number"
                min={16}
                max={80}
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Height (cm)</span>
              <input
                type="number"
                value={draft.heightCm}
                onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Weight (kg)</span>
              <input
                type="number"
                value={draft.weightKg}
                onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Training load</span>
              <select
                value={draft.activity}
                onChange={(e) =>
                  setDraft({ ...draft, activity: e.target.value as Profile['activity'] })
                }
              >
                <option value="sedentary">Desk, 0–1 sessions</option>
                <option value="light">2–3 sessions</option>
                <option value="moderate">4–5 sessions</option>
                <option value="hard">6+ or physical job</option>
              </select>
            </label>
            <label className="field">
              <span>Food notes</span>
              <input
                value={draft.diet}
                onChange={(e) => setDraft({ ...draft, diet: e.target.value })}
                placeholder="eg. no dairy, vegetarian"
              />
            </label>
          </div>
          <button
            className="primary"
            type="button"
            disabled={!draft.name.trim()}
            onClick={() => saveProfile({ ...draft, name: draft.name.trim() })}
          >
            Train with Gymergee
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
              {profile.name} · {profile.goal} · {macros?.kcal} kcal
            </p>
          </div>
        </div>
        <button
          className="ghost"
          type="button"
          onClick={() => {
            localStorage.removeItem(STORAGE)
            setProfile(null)
            setMessages([])
            setDraft(profile)
          }}
        >
          Edit body
        </button>
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
                  <h3>Plate estimate</h3>
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
                            ? ' · logged'
                            : ''}
                        </strong>
                        {food.kcal} kcal · {food.protein}g protein · {food.portion}
                        <span className="fine"> match {Math.round(score)}</span>
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
                  <p className="fine">Setup</p>
                  <ul className="list">
                    {m.card.exercise.setup.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="fine">Cues for this clip</p>
                  <ul className="list">
                    {m.card.exercise.cues.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="fine">Fix these first</p>
                  <ul className="list">
                    {m.card.exercise.mistakes.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p>
                    Prescription: <strong>{m.card.exercise.reps[profile.goal]}</strong>
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
            <div className="bubble busy-bubble">Gymergee is watching…</div>
          </article>
        ) : null}
        <div ref={bottom} />
      </div>

      <footer className="composer">
        <div className="quick">
          <button className="chip" type="button" onClick={() => handleSend('What should I eat today?')}>
            Meal for my goal
          </button>
          <button className="chip" type="button" onClick={() => handleSend('Give me a weekly lift plan')}>
            Lift plan
          </button>
          <button className="chip" type="button" onClick={() => handleSend('Show my macros')}>
            Macros
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
          <button className="iconbtn" type="button" title="Food photo" onClick={() => photoRef.current?.click()}>
            Photo
          </button>
          <button className="iconbtn" type="button" title="Lift video" onClick={() => videoRef.current?.click()}>
            Clip
          </button>
          <textarea
            value={text}
            placeholder="Ask Gymergee, or attach a plate / lift clip"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
          />
          <button className="primary" type="button" onClick={() => void handleSend()}>
            Send
          </button>
        </div>
        <p className="disclaimer">
          Coaching estimates only — not medical or dietetic advice. Photo calories are a demo matcher
          (color + portion defaults) until a vision API is wired.
        </p>
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
