import type {
  Doc,
  ImageLayer,
  ShapeLayer,
  TextLayer,
} from './types'
import { fontString } from './fonts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

const imgCache = new Map<string, HTMLImageElement>()

export function loadImage(src: string): HTMLImageElement {
  let img = imgCache.get(src)
  if (!img) {
    img = new Image()
    img.decoding = 'async'
    img.src = src
    imgCache.set(src, img)
  }
  return img
}

export async function preloadImages(doc: Doc): Promise<void> {
  const srcs: string[] = []
  if (doc.background.type === 'image' && doc.background.src) {
    srcs.push(doc.background.src)
  }
  for (const layer of doc.layers) {
    if (layer.kind === 'image' && layer.src) srcs.push(layer.src)
  }
  await Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = loadImage(src)
          if (img.complete && img.naturalWidth > 0) return resolve()
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function gradientLine(w: number, h: number, angle: number) {
  const a = (angle * Math.PI) / 180
  const cx = w / 2
  const cy = h / 2
  const len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a))
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  return {
    x0: cx - (dx * len) / 2,
    y0: cy - (dy * len) / 2,
    x1: cx + (dx * len) / 2,
    y1: cy + (dy * len) / 2,
  }
}

function drawImageFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: 'cover' | 'contain',
) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  if (!iw || !ih) return
  const cover = fit === 'cover'
  const scale = cover ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  doc: Doc,
  onReady?: () => void,
) {
  const { width: w, height: h, background: bg } = doc
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color
    ctx.fillRect(0, 0, w, h)
    return
  }
  if (bg.type === 'gradient') {
    const { x0, y0, x1, y1 } = gradientLine(w, h, bg.angle)
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, bg.from)
    g.addColorStop(1, bg.to)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    return
  }
  // image background
  ctx.fillStyle = '#101114'
  ctx.fillRect(0, 0, w, h)
  if (!bg.src) return
  const img = loadImage(bg.src)
  if (!img.complete || !img.naturalWidth) {
    img.addEventListener('load', () => onReady?.(), { once: true })
    return
  }
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()
  if (bg.blur > 0) ctx.filter = `blur(${bg.blur}px)`
  const bleed = bg.blur > 0 ? bg.blur * 1.5 : 0
  drawImageFit(
    ctx,
    img,
    -bleed,
    -bleed,
    w + bleed * 2,
    h + bleed * 2,
    bg.fit,
  )
  ctx.filter = 'none'
  if (bg.dim > 0) {
    ctx.fillStyle = `rgba(0,0,0,${bg.dim})`
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()
}

const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/

function tokenize(line: string): string[] {
  const tokens: string[] = []
  let buf = ''
  for (const ch of line) {
    if (CJK.test(ch) || ch === ' ' || ch === '\t') {
      if (buf) {
        tokens.push(buf)
        buf = ''
      }
      tokens.push(ch)
    } else {
      buf += ch
    }
  }
  if (buf) tokens.push(buf)
  return tokens
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const out: string[] = []
  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      out.push('')
      continue
    }
    const tokens = tokenize(paragraph)
    let current = ''
    for (const token of tokens) {
      if (token === ' ' && current === '') continue
      const candidate = current + token
      if (current === '' || ctx.measureText(candidate).width <= maxWidth) {
        current = candidate
      } else {
        out.push(current.trimEnd())
        current = token === ' ' ? '' : token
      }
    }
    if (current) out.push(current.trimEnd())
  }
  return out.length ? out : ['']
}

function drawText(ctx: CanvasRenderingContext2D, layer: TextLayer): Rect {
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing =
    `${layer.letterSpacing}px`
  ctx.font = fontString(layer)
  ctx.textBaseline = 'top'
  ctx.textAlign = layer.align

  const lines = wrapText(ctx, layer.text, layer.w)
  const lineHeight = layer.fontSize * layer.lineHeight
  const blockHeight = Math.max(lineHeight, lines.length * lineHeight)
  const anchorX =
    layer.align === 'left'
      ? layer.x
      : layer.align === 'center'
        ? layer.x + layer.w / 2
        : layer.x + layer.w

  if (layer.highlight) {
    const padX = layer.fontSize * 0.38
    const padY = layer.fontSize * 0.16
    ctx.save()
    ctx.fillStyle = layer.highlightColor ?? '#ff7a45'
    lines.forEach((line, i) => {
      if (!line) return
      const tw = ctx.measureText(line).width
      const left =
        layer.align === 'left'
          ? layer.x
          : layer.align === 'center'
            ? layer.x + (layer.w - tw) / 2
            : layer.x + layer.w - tw
      const top = layer.y + i * lineHeight + (lineHeight - layer.fontSize) / 2
      roundRect(
        ctx,
        left - padX,
        top - padY,
        tw + padX * 2,
        layer.fontSize + padY * 2,
        layer.fontSize * 0.18,
      )
      ctx.fill()
    })
    ctx.restore()
  }

  ctx.save()
  ctx.fillStyle = layer.color
  if (layer.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.38)'
    ctx.shadowBlur = layer.fontSize * 0.22
    ctx.shadowOffsetY = layer.fontSize * 0.05
  }
  lines.forEach((line, i) => {
    if (!line) return
    ctx.fillText(line, anchorX, layer.y + i * lineHeight)
  })
  ctx.restore()
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'

  return { x: layer.x, y: layer.y, w: layer.w, h: blockHeight }
}

function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  onReady?: () => void,
) {
  const img = loadImage(layer.src)
  ctx.save()
  if (layer.radius > 0) {
    roundRect(ctx, layer.x, layer.y, layer.w, layer.h, layer.radius)
    ctx.clip()
  }
  if (!img.complete || !img.naturalWidth) {
    img.addEventListener('load', () => onReady?.(), { once: true })
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(layer.x, layer.y, layer.w, layer.h)
    ctx.restore()
    return
  }
  drawImageFit(ctx, img, layer.x, layer.y, layer.w, layer.h, layer.fit)
  ctx.restore()
}

function drawShape(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
  ctx.fillStyle = layer.color
  if (layer.shape === 'ellipse') {
    ctx.beginPath()
    ctx.ellipse(
      layer.x + layer.w / 2,
      layer.y + layer.h / 2,
      Math.abs(layer.w / 2),
      Math.abs(layer.h / 2),
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    return
  }
  roundRect(ctx, layer.x, layer.y, layer.w, layer.h, layer.radius)
  ctx.fill()
}

export function drawDoc(
  ctx: CanvasRenderingContext2D,
  doc: Doc,
  onReady?: () => void,
): Record<string, Rect> {
  ctx.save()
  ctx.clearRect(0, 0, doc.width, doc.height)
  drawBackground(ctx, doc, onReady)
  const rects: Record<string, Rect> = {}
  for (const layer of doc.layers) {
    if (layer.hidden) continue
    ctx.save()
    ctx.globalAlpha = layer.opacity ?? 1
    if (layer.kind === 'text') {
      rects[layer.id] = drawText(ctx, layer)
    } else if (layer.kind === 'image') {
      rects[layer.id] = {
        x: layer.x,
        y: layer.y,
        w: layer.w,
        h: layer.h,
      }
      drawImageLayer(ctx, layer, onReady)
    } else {
      rects[layer.id] = {
        x: layer.x,
        y: layer.y,
        w: layer.w,
        h: layer.h,
      }
      drawShape(ctx, layer)
    }
    ctx.restore()
  }
  ctx.restore()
  return rects
}

export function exportPng(doc: Doc, scale: number): Promise<Blob | null> {
  return preloadImages(doc).then(
    () =>
      new Promise<Blob | null>((resolve) => {
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(doc.width * scale)
        canvas.height = Math.round(doc.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.setTransform(scale, 0, 0, scale, 0, 0)
        drawDoc(ctx, doc)
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      }),
  )
}
