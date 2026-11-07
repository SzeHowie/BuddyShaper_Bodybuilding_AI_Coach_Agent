import { foods } from '../data/foods'
import type { Food } from '../types'

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b)
  return Math.min(d, 360 - d)
}

function inRange(v: number, range: [number, number]): boolean {
  if (range[0] <= range[1]) return v >= range[0] && v <= range[1]
  return v >= range[0] || v <= range[1]
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

export async function sampleImage(url: string): Promise<{ h: number; s: number; l: number }> {
  const img = new Image()
  img.src = url
  await img.decode()
  const canvas = document.createElement('canvas')
  const size = 48
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return { h: 40, s: 0.3, l: 0.5 }
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  let hSum = 0
  let sSum = 0
  let lSum = 0
  let n = 0
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 20) continue
    const hsl = rgbToHsl(r, g, b)
    if (hsl.s < 0.05 && hsl.l > 0.9) continue
    hSum += hsl.h
    sSum += hsl.s
    lSum += hsl.l
    n++
  }
  if (!n) return { h: 40, s: 0.3, l: 0.5 }
  return { h: hSum / n, s: sSum / n, l: lSum / n }
}

export function rankFoods(sample: { h: number; s: number; l: number }, hint = ''): { food: Food; score: number }[] {
  const q = hint.toLowerCase()
  const scored = foods.map((food) => {
    let score = 0
    const midH = (food.hue[0] + food.hue[1]) / 2
    const hDist = hueDistance(sample.h, midH)
    score += Math.max(0, 40 - hDist)
    if (inRange(sample.s, food.sat)) score += 18
    if (inRange(sample.l, food.light)) score += 18
    if (q) {
      if (food.name.toLowerCase().includes(q) || food.aliases.some((a) => q.includes(a))) {
        score += 50
      }
    }
    return { food, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3)
}
