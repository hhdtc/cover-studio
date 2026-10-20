export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

const imageCache = new Map<string, HTMLImageElement>()

export function getImage(src: string): HTMLImageElement {
  let img = imageCache.get(src)
  if (!img) {
    img = new Image()
    img.decoding = 'async'
    img.src = src
    imageCache.set(src, img)
  }
  return img
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = getImage(src)
    if (img.complete && img.naturalWidth) return resolve(img)
    img.addEventListener('load', () => resolve(img), { once: true })
    img.addEventListener('error', () => reject(new Error('image load failed')), {
      once: true,
    })
  })
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0,
) {
  if (!img.naturalWidth) return
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.save()
  if (radius > 0) {
    roundRect(ctx, x, y, w, h, radius)
    ctx.clip()
  } else {
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
  }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  ctx.restore()
}

export function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!img.naturalWidth) return
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hexToRgb(hex: string): [number, number, number] {
  let value = hex.replace('#', '').trim()
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const n = parseInt(value, 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

export function mixColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const k = Math.max(0, Math.min(1, t))
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * k))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}

export async function exportCanvas(
  width: number,
  height: number,
  scale: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  filename: string,
): Promise<boolean> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  draw(ctx)
  const blob = await canvasToBlob(canvas)
  if (!blob) return false
  downloadBlob(blob, filename)
  return true
}
