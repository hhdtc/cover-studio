type Matrix = [number, number, number, number, number, number]

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

function mul(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ]
}

function num(n: number) {
  return Math.round(n * 100) / 100
}

function esc(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface Stop {
  offset: number
  color: string
}

export interface SvgGradient {
  kind: 'linear' | 'radial'
  x0: number
  y0: number
  x1: number
  y1: number
  r0: number
  r1: number
  stops: Stop[]
  addColorStop: (offset: number, color: string) => void
}

interface State {
  m: Matrix
  clip: string | null
  dash: number[]
  fill: string | SvgGradient
  stroke: string | SvgGradient
  lineWidth: number
  alpha: number
  font: string
  align: string
  baseline: string
  letter: string
  cap: string
}

/**
 * Minimal Canvas2D-compatible recorder that serializes the drawing commands
 * used by the asset generators into an SVG document. It intentionally covers
 * the subset needed here: paths, arcs/ellipses, rects, gradients, text,
 * transforms, clipping, dashes and opacity.
 */
export class SvgContext {
  width: number
  height: number

  fillStyle: string | SvgGradient = '#000000'
  strokeStyle: string | SvgGradient = '#000000'
  lineWidth = 1
  globalAlpha = 1
  font = '10px sans-serif'
  textAlign = 'left'
  textBaseline = 'alphabetic'
  lineCap = 'butt'
  letterSpacing = '0px'
  shadowColor = 'transparent'
  shadowBlur = 0

  private elements: string[] = []
  private defs: string[] = []
  private stack: State[] = []
  private path = ''
  private current: [number, number] | null = null
  private m: Matrix = [...IDENTITY]
  private clipId: string | null = null
  private dash: number[] = []
  private seq = 0
  private imageIds = new Map<string, string>()

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  save() {
    this.stack.push({
      m: [...this.m],
      clip: this.clipId,
      dash: [...this.dash],
      fill: this.fillStyle,
      stroke: this.strokeStyle,
      lineWidth: this.lineWidth,
      alpha: this.globalAlpha,
      font: this.font,
      align: this.textAlign,
      baseline: this.textBaseline,
      letter: this.letterSpacing,
      cap: this.lineCap,
    })
  }

  restore() {
    const state = this.stack.pop()
    if (!state) return
    this.m = state.m
    this.clipId = state.clip
    this.dash = state.dash
    this.fillStyle = state.fill
    this.strokeStyle = state.stroke
    this.lineWidth = state.lineWidth
    this.globalAlpha = state.alpha
    this.font = state.font
    this.textAlign = state.align
    this.textBaseline = state.baseline
    this.letterSpacing = state.letter
    this.lineCap = state.cap
  }

  translate(x: number, y: number) {
    this.m = mul(this.m, [1, 0, 0, 1, x, y])
  }

  rotate(angle: number) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    this.m = mul(this.m, [cos, sin, -sin, cos, 0, 0])
  }

  scale(x: number, y: number) {
    this.m = mul(this.m, [x, 0, 0, y, 0, 0])
  }

  setLineDash(values: number[]) {
    this.dash = [...values]
  }

  clearRect() {
    /* noop */
  }

  beginPath() {
    this.path = ''
    this.current = null
  }

  moveTo(x: number, y: number) {
    this.path += `M${num(x)} ${num(y)}`
    this.current = [x, y]
  }

  lineTo(x: number, y: number) {
    if (!this.current) this.moveTo(x, y)
    else {
      this.path += `L${num(x)} ${num(y)}`
      this.current = [x, y]
    }
  }

  closePath() {
    this.path += 'Z'
  }

  rect(x: number, y: number, w: number, h: number) {
    this.path += `M${num(x)} ${num(y)}H${num(x + w)}V${num(y + h)}H${num(x)}Z`
    this.current = [x, y]
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number) {
    const start = this.current
    if (!start) {
      this.moveTo(x1, y1)
      return
    }
    const v1x = start[0] - x1
    const v1y = start[1] - y1
    const v2x = x2 - x1
    const v2y = y2 - y1
    const l1 = Math.hypot(v1x, v1y) || 1
    const l2 = Math.hypot(v2x, v2y) || 1
    const u1x = v1x / l1
    const u1y = v1y / l1
    const u2x = v2x / l2
    const u2y = v2y / l2
    const dot = Math.max(-1, Math.min(1, u1x * u2x + u1y * u2y))
    const angle = Math.acos(dot)
    const dist = r / Math.tan(angle / 2)
    const t1x = x1 + u1x * dist
    const t1y = y1 + u1y * dist
    const t2x = x1 + u2x * dist
    const t2y = y1 + u2y * dist
    this.lineTo(t1x, t1y)
    const cross = u1x * u2y - u1y * u2x
    this.path += `A${num(r)} ${num(r)} 0 0 ${cross < 0 ? 1 : 0} ${num(t2x)} ${num(t2y)}`
    this.current = [t2x, t2y]
  }

  arc(
    cx: number,
    cy: number,
    r: number,
    a0: number,
    a1: number,
    ccw = false,
  ) {
    const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-4
    if (full) {
      this.ellipseArc(cx, cy, r, r, 0, a0, a0 + Math.PI, ccw)
      this.ellipseArc(cx, cy, r, r, 0, a0 + Math.PI, a1, ccw)
    } else {
      this.ellipseArc(cx, cy, r, r, 0, a0, a1, ccw)
    }
  }

  ellipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rot: number,
    a0: number,
    a1: number,
    ccw = false,
  ) {
    const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-4
    if (full) {
      this.ellipseArc(cx, cy, rx, ry, rot, a0, a0 + Math.PI, ccw)
      this.ellipseArc(cx, cy, rx, ry, rot, a0 + Math.PI, a1, ccw)
    } else {
      this.ellipseArc(cx, cy, rx, ry, rot, a0, a1, ccw)
    }
  }

  private ellipseArc(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rot: number,
    a0: number,
    a1: number,
    ccw: boolean,
  ) {
    const point = (a: number): [number, number] => {
      const px = Math.cos(a) * rx
      const py = Math.sin(a) * ry
      return [
        cx + px * Math.cos(rot) - py * Math.sin(rot),
        cy + px * Math.sin(rot) + py * Math.cos(rot),
      ]
    }
    const [sx, sy] = point(a0)
    const [ex, ey] = point(a1)
    if (!this.current) this.path += `M${num(sx)} ${num(sy)}`
    else this.path += `L${num(sx)} ${num(sy)}`
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
    const sweep = ccw ? 0 : 1
    this.path += `A${num(rx)} ${num(ry)} ${num((rot * 180) / Math.PI)} ${large} ${sweep} ${num(ex)} ${num(ey)}`
    this.current = [ex, ey]
  }

  clip(rule?: string) {
    const id = `c${++this.seq}`
    this.defs.push(
      `<clipPath id="${id}"><path d="${this.path}" fill-rule="${rule === 'evenodd' ? 'evenodd' : 'nonzero'}"${this.transformAttr()}/></clipPath>`,
    )
    this.clipId = id
  }

  fill(rule?: string) {
    this.emit('path', {
      d: this.path,
      fill: this.paint(this.fillStyle),
      'fill-rule': rule === 'evenodd' ? 'evenodd' : undefined,
    })
  }

  stroke() {
    this.emit('path', {
      d: this.path,
      fill: 'none',
      stroke: this.paint(this.strokeStyle),
      'stroke-width': this.lineWidth,
      'stroke-dasharray': this.dash.length ? this.dash.join(' ') : undefined,
      'stroke-linecap': this.lineCap,
    })
  }

  fillRect(x: number, y: number, w: number, h: number) {
    this.emit('rect', {
      x,
      y,
      width: w,
      height: h,
      fill: this.paint(this.fillStyle),
    })
  }

  strokeRect(x: number, y: number, w: number, h: number) {
    this.emit('rect', {
      x,
      y,
      width: w,
      height: h,
      fill: 'none',
      stroke: this.paint(this.strokeStyle),
      'stroke-width': this.lineWidth,
    })
  }

  fillText(text: string, x: number, y: number) {
    const fontMatch = /(\d+(?:\.\d+)?)px\s+(.+)$/.exec(this.font)
    const size = fontMatch ? fontMatch[1] : '10'
    const family = fontMatch ? fontMatch[2] : 'sans-serif'
    const weightMatch = /^(\d{3}|bold|normal)/.exec(this.font)
    const weight = weightMatch ? weightMatch[1] : '400'
    const anchor =
      this.textAlign === 'center'
        ? 'middle'
        : this.textAlign === 'right' || this.textAlign === 'end'
          ? 'end'
          : 'start'
    const baseline =
      this.textBaseline === 'top'
        ? 'text-before-edge'
        : this.textBaseline === 'middle'
          ? 'central'
          : 'alphabetic'
    const attrs: Record<string, string | number | undefined> = {
      x,
      y,
      fill: this.paint(this.fillStyle),
      'font-family': family,
      'font-size': size,
      'font-weight': weight,
      'text-anchor': anchor,
      'dominant-baseline': baseline,
      'letter-spacing': this.letterSpacing,
    }
    const attrStr = this.attrs(attrs)
    this.elements.push(
      `<text ${attrStr}${this.transformAttr()}${this.clipAttr()}${this.opacityAttr()}>${esc(text)}</text>`,
    )
  }

  createLinearGradient(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): SvgGradient {
    return this.gradient('linear', x0, y0, x1, y1, 0, 0)
  }

  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ): SvgGradient {
    return this.gradient('radial', x0, y0, x1, y1, r0, r1)
  }

  private gradient(
    kind: 'linear' | 'radial',
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r0: number,
    r1: number,
  ): SvgGradient {
    const grad: SvgGradient = {
      kind,
      x0,
      y0,
      x1,
      y1,
      r0,
      r1,
      stops: [],
      addColorStop(offset: number, color: string) {
        this.stops.push({ offset, color })
      },
    }
    return grad
  }

  private paint(value: string | SvgGradient): string {
    if (typeof value === 'string') return value
    const id = `g${++this.seq}`
    const stops = value.stops
      .map(
        (stop) =>
          `<stop offset="${num(stop.offset)}" stop-color="${esc(stop.color)}"/>`,
      )
      .join('')
    if (value.kind === 'linear') {
      this.defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${num(value.x0)}" y1="${num(value.y0)}" x2="${num(value.x1)}" y2="${num(value.y1)}">${stops}</linearGradient>`,
      )
    } else {
      this.defs.push(
        `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${num(value.x1)}" cy="${num(value.y1)}" r="${num(value.r1)}" fx="${num(value.x0)}" fy="${num(value.y0)}" fr="${num(value.r0)}">${stops}</radialGradient>`,
      )
    }
    return `url(#${id})`
  }

  private attrs(record: Record<string, string | number | undefined>) {
    return Object.entries(record)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}="${String(value).replace(/"/g, '&quot;')}"`)
      .join(' ')
  }

  private transformAttr() {
    if (this.m.every((v, i) => v === IDENTITY[i])) return ''
    return ` transform="matrix(${this.m.map(num).join(' ')})"`
  }

  private clipAttr() {
    return this.clipId ? ` clip-path="url(#${this.clipId})"` : ''
  }

  private opacityAttr() {
    return this.globalAlpha < 1 ? ` opacity="${num(this.globalAlpha)}"` : ''
  }

  private emit(tag: string, record: Record<string, string | number | undefined>) {
    this.elements.push(
      `<${tag} ${this.attrs(record)}${this.transformAttr()}${this.clipAttr()}${this.opacityAttr()}/>`,
    )
  }

  drawImage(
    image: { src?: string } | null,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    const href = image?.src
    if (!href) return
    let id = this.imageIds.get(href)
    if (!id) {
      id = `img${++this.seq}`
      this.imageIds.set(href, id)
      this.defs.push(
        `<symbol id="${id}" viewBox="0 0 1 1" preserveAspectRatio="none"><image href="${esc(href)}" width="1" height="1" preserveAspectRatio="none"/></symbol>`,
      )
    }
    this.emit('use', {
      href: `#${id}`,
      x,
      y,
      width: w,
      height: h,
    })
  }

  toSvg(): string {
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">`,
      this.defs.length ? `<defs>${this.defs.join('')}</defs>` : '',
      this.elements.join(''),
      '</svg>',
    ].join('')
  }
}
