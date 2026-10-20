import { FONTS } from '../fonts'
import { wrapText } from '../render'
import { drawImageCover, getImage, roundRect, withAlpha } from './draw'

export const SLIDE_W = 1280
export const SLIDE_H = 720

export type SlideLayout = 'title' | 'bullets' | 'quote' | 'image'
export type SlideThemeId = 'midnight' | 'cream' | 'sunset'

export interface Slide {
  id: string
  layout: SlideLayout
  title: string
  subtitle: string
  bullets: string[]
  quote: string
  author: string
  image: string
  caption: string
}

export interface SlideTheme {
  id: SlideThemeId
  label: string
  bg: string
  bg2: string
  text: string
  muted: string
  accent: string
  accent2: string
  serif: string
  sans: string
  mono: string
  dark: boolean
}

export const SLIDE_THEMES: Record<SlideThemeId, SlideTheme> = {
  midnight: {
    id: 'midnight',
    label: '午夜',
    bg: '#0b0f16',
    bg2: '#121a27',
    text: '#eef2f8',
    muted: '#93a1b5',
    accent: '#5eead4',
    accent2: '#60a5fa',
    serif: FONTS[1].value,
    sans: FONTS[0].value,
    mono: FONTS[6].value,
    dark: true,
  },
  cream: {
    id: 'cream',
    label: '奶油',
    bg: '#f6f0e3',
    bg2: '#efe3cd',
    text: '#241f18',
    muted: '#7e7361',
    accent: '#b45309',
    accent2: '#0f766e',
    serif: FONTS[1].value,
    sans: FONTS[0].value,
    mono: FONTS[6].value,
    dark: false,
  },
  sunset: {
    id: 'sunset',
    label: '落日',
    bg: '#1e1b4b',
    bg2: '#4c1d3d',
    text: '#fdf2f8',
    muted: '#d8b4c8',
    accent: '#fbbf24',
    accent2: '#f472b6',
    serif: FONTS[1].value,
    sans: FONTS[0].value,
    mono: FONTS[6].value,
    dark: true,
  },
}

let seq = 0
export const slideId = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`

export function createSlide(layout: SlideLayout = 'title'): Slide {
  return {
    id: slideId(),
    layout,
    title: '新的一页',
    subtitle: '在右侧补充这一页的内容',
    bullets: ['第一条要点', '第二条要点', '第三条要点'],
    quote: '一句值得被记住的话。',
    author: '— 作者',
    image: '',
    caption: '图片说明',
  }
}

function f(weight: number, size: number, family: string) {
  return `${weight} ${size}px ${family}`
}

function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
  letter = 0,
) {
  ctx.save()
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = `${letter}px`
  ctx.fillText(str, x, y)
  ctx.restore()
}

function fitText(
  ctx: CanvasRenderingContext2D,
  str: string,
  family: string,
  weight: number,
  start: number,
  min: number,
  maxW: number,
  maxLines: number,
) {
  let size = start
  while (size >= min) {
    ctx.font = f(weight, size, family)
    const lines = wrapText(ctx, str || ' ', maxW)
    if (lines.length <= maxLines) return { size, lines }
    size -= 6
  }
  ctx.font = f(weight, min, family)
  return { size: min, lines: wrapText(ctx, str || ' ', maxW) }
}

function truncate(
  ctx: CanvasRenderingContext2D,
  str: string,
  font: string,
  maxW: number,
) {
  ctx.save()
  ctx.font = font
  if (ctx.measureText(str).width <= maxW) {
    ctx.restore()
    return str
  }
  let cut = str
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxW) {
    cut = cut.slice(0, -1)
  }
  ctx.restore()
  return `${cut}…`
}

function background(ctx: CanvasRenderingContext2D, t: SlideTheme) {
  const g = ctx.createLinearGradient(0, 0, SLIDE_W, SLIDE_H)
  g.addColorStop(0, t.bg)
  g.addColorStop(1, t.bg2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)

  const glow = ctx.createRadialGradient(
    SLIDE_W * 0.82,
    SLIDE_H * 0.14,
    0,
    SLIDE_W * 0.82,
    SLIDE_H * 0.14,
    560,
  )
  glow.addColorStop(0, withAlpha(t.accent, t.dark ? 0.13 : 0.1))
  glow.addColorStop(1, withAlpha(t.accent, 0))

  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)

  ctx.save()
  ctx.strokeStyle = withAlpha(t.text, t.dark ? 0.035 : 0.045)
  ctx.lineWidth = 1
  for (let x = 80; x < SLIDE_W; x += 80) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, SLIDE_H)
    ctx.stroke()
  }
  ctx.restore()
}

function pageFooter(
  ctx: CanvasRenderingContext2D,
  t: SlideTheme,
  index: number,
  total: number,
  overImage = false,
) {
  ctx.save()
  if (overImage) {
    ctx.shadowColor = 'rgba(0,0,0,0.65)'
    ctx.shadowBlur = 12
  }
  text(ctx, 'COVER STUDIO', 96, 664, f(500, 11, t.mono), withAlpha(t.text, 0.42), 'left', 3)
  text(
    ctx,
    `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
    1184,
    664,
    f(500, 11, t.mono),
    withAlpha(t.text, 0.55),
    'right',
    2,
  )
  ctx.restore()

  ctx.save()
  ctx.fillStyle = t.accent
  ctx.fillRect(96, 644, 18, 3)
  ctx.restore()
}

export function drawSlide(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  t: SlideTheme,
  index: number,
  total: number,
) {
  background(ctx, t)

  if (slide.layout === 'image') {
    const rightW = 620
    const rx = SLIDE_W - rightW
    const img = slide.image ? getImage(slide.image) : null
    if (img && img.complete && img.naturalWidth) {
      drawImageCover(ctx, img, rx, 0, rightW, SLIDE_H)
    } else {
      const ph = ctx.createLinearGradient(rx, 0, SLIDE_W, SLIDE_H)
      ph.addColorStop(0, withAlpha(t.accent, 0.18))
      ph.addColorStop(1, withAlpha(t.accent2, 0.22))
      ctx.fillStyle = ph
      ctx.fillRect(rx, 0, rightW, SLIDE_H)
      text(
        ctx,
        slide.image ? '图片加载中…' : '上传一张图片',
        rx + rightW / 2,
        SLIDE_H / 2 - 10,
        f(500, 16, t.sans),
        withAlpha(t.text, 0.6),
        'center',
      )
    }

    const fade = ctx.createLinearGradient(rx - 80, 0, rx + 200, 0)
    fade.addColorStop(0, t.bg)
    fade.addColorStop(1, withAlpha(t.bg, 0))
    ctx.fillStyle = fade
    ctx.fillRect(rx - 80, 0, 280, SLIDE_H)
  }

  const isImage = slide.layout === 'image'
  const contentW = isImage ? 500 : 960

  if (slide.layout === 'title') {
    ctx.save()
    ctx.strokeStyle = withAlpha(t.accent, 0.16)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(SLIDE_W - 150, SLIDE_H / 2, 230, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  const kicker =
    slide.layout === 'title'
      ? 'PRESENTATION / 2026'
      : slide.layout === 'bullets'
        ? 'KEY POINTS'
        : slide.layout === 'quote'
          ? 'QUOTE'
          : 'FEATURE'
  text(ctx, kicker, 96, 64, f(600, 12, t.mono), t.accent, 'left', 4)
  ctx.save()
  ctx.fillStyle = t.accent
  ctx.fillRect(96, 92, 46, 3)
  ctx.restore()

  if (slide.layout === 'title') {
    const fit = fitText(ctx, slide.title, t.sans, 800, 92, 52, 980, 3)
    let y = 236
    ctx.save()
    ctx.font = f(800, fit.size, t.sans)
    ctx.fillStyle = t.text
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    fit.lines.forEach((line) => {
      ctx.fillText(line, 96, y)
      y += fit.size * 1.12
    })
    ctx.restore()

    const subSize = 24
    ctx.save()
    ctx.font = f(400, subSize, t.sans)
    ctx.fillStyle = t.muted
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    wrapText(ctx, slide.subtitle, 760)
      .slice(0, 2)
      .forEach((line, i) => ctx.fillText(line, 96, y + 24 + i * 38))
    ctx.restore()
  } else if (slide.layout === 'bullets') {
    const fit = fitText(ctx, slide.title, t.sans, 700, 58, 40, 980, 2)
    let y = 150
    ctx.save()
    ctx.font = f(700, fit.size, t.sans)
    ctx.fillStyle = t.text
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    fit.lines.forEach((line) => {
      ctx.fillText(line, 96, y)
      y += fit.size * 1.2
    })
    ctx.restore()

    y += 16
    ctx.save()
    ctx.fillStyle = withAlpha(t.text, 0.1)
    ctx.fillRect(96, y, 1088, 1)
    ctx.restore()

    const items = slide.bullets.map((item) => item.trim()).filter(Boolean)
    const list = items.length ? items : ['在右侧添加要点']
    const startY = y + 44
    const step = Math.min(82, 470 / Math.max(items.length, 1))
    list.slice(0, 6).forEach((item, i) => {
      const iy = startY + i * step
      text(
        ctx,
        String(i + 1).padStart(2, '0'),
        96,
        iy + 4,
        f(600, 14, t.mono),
        t.accent,
        'left',
        1,
      )
      const body = truncate(ctx, item, f(400, 25, t.sans), 970)
      text(ctx, body, 156, iy - 2, f(400, 25, t.sans), withAlpha(t.text, 0.9))
    })
  } else if (slide.layout === 'quote') {
    text(ctx, '“', 92, 148, f(700, 150, t.serif), withAlpha(t.accent, 0.3))

    const fit = fitText(ctx, slide.quote, t.serif, 500, 62, 42, 1000, 4)
    let y = 300
    ctx.save()
    ctx.font = f(500, fit.size, t.serif)
    ctx.fillStyle = t.text
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    fit.lines.forEach((line) => {
      ctx.fillText(line, 100, y)
      y += fit.size * 1.36
    })
    ctx.restore()

    text(ctx, slide.author, 100, y + 22, f(500, 18, t.sans), t.muted, 'left', 1)
  } else {
    const fit = fitText(ctx, slide.title, t.sans, 800, 64, 40, contentW, 3)
    let y = 220
    ctx.save()
    ctx.font = f(800, fit.size, t.sans)
    ctx.fillStyle = t.text
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    fit.lines.forEach((line) => {
      ctx.fillText(line, 96, y)
      y += fit.size * 1.14
    })
    ctx.restore()

    ctx.save()
    ctx.fillStyle = withAlpha(t.text, 0.1)
    ctx.fillRect(96, y + 10, 120, 1)
    ctx.restore()

    text(ctx, slide.caption, 96, y + 30, f(400, 18, t.sans), t.muted)
  }

  pageFooter(ctx, t, index, total, isImage)
}
