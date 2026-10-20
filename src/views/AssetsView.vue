<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { FONTS } from '../fonts'
import { useCanvasPreview } from '../lib/useCanvasPreview'
import {
  downloadBlob,
  exportCanvas,
  getImage,
  loadImage,
  hashString,
  luminance,
  mixColor,
  mulberry32,
  roundRect,
  withAlpha,
} from '../lib/draw'
import { toast } from '../lib/toast'
import { SvgContext } from '../lib/svg'

type Kind =
  | 'gradient'
  | 'halftone'
  | 'dots'
  | 'waves'
  | 'stripes'
  | 'contour'
  | 'concentric'
  | 'tickring'
  | 'mesh'
  | 'nested'
  | 'shapes'
  | 'globe'
  | 'grid'
  | 'hud'
  | 'barcode'
  | 'rays'
  | 'starring'
  | 'radial'
  | 'avatar'

interface Palette {
  name: string
  colors: [string, string, string, string]
}

interface GenDef {
  id: Kind
  label: string
  densityLabel: string
  angle?: boolean
}

const PALETTES: Palette[] = [
  { name: '极光', colors: ['#0b1020', '#22d3ee', '#a78bfa', '#0f172a'] },
  { name: '余烬', colors: ['#1a0b06', '#ff8a4c', '#f43f5e', '#3b0d06'] },
  { name: '深海', colors: ['#03151f', '#38bdf8', '#14b8a6', '#082f49'] },
  { name: '糖果', colors: ['#fdf2f8', '#f472b6', '#a78bfa', '#fef9c3'] },
  { name: '森林', colors: ['#0b1a12', '#4ade80', '#bef264', '#052e16'] },
  { name: '纸感', colors: ['#f5efe2', '#b45309', '#0f766e', '#e7d8bd'] },
  { name: '黑白', colors: ['#0a0a0a', '#ffffff', '#bdbdbd', '#171717'] },
  { name: '白底黑', colors: ['#ffffff', '#111111', '#7a7a7a', '#f2f2f2'] },
  { name: '灰阶', colors: ['#141414', '#d9d9d9', '#8c8c8c', '#262626'] },
]

const GEN_GROUPS: { name: string; items: GenDef[] }[] = [
  {
    name: '纹理',
    items: [
      { id: 'gradient', label: '渐变光斑', densityLabel: '光斑数量' },
      { id: 'halftone', label: '半调', densityLabel: '网点密度', angle: true },
      { id: 'dots', label: '点阵', densityLabel: '点阵密度' },
      { id: 'waves', label: '波浪', densityLabel: '波浪层数' },
      { id: 'stripes', label: '重复线条', densityLabel: '线条密度', angle: true },
      { id: 'contour', label: '等高线', densityLabel: '等高线层数' },
    ],
  },
  {
    name: '几何',
    items: [
      { id: 'concentric', label: '同心圆', densityLabel: '圆环数量' },
      { id: 'tickring', label: '刻度圆', densityLabel: '刻度数量' },
      { id: 'mesh', label: '多边形网格', densityLabel: '网格细分' },
      { id: 'nested', label: '嵌套多边形', densityLabel: '嵌套层数', angle: true },
      { id: 'shapes', label: '常见图形', densityLabel: '图形密度' },
      { id: 'globe', label: '经纬球', densityLabel: '经纬密度' },
      { id: 'grid', label: '方形网格', densityLabel: '网格密度' },
    ],
  },
  {
    name: '编排',
    items: [
      { id: 'hud', label: 'HUD 线', densityLabel: '线条密度' },
      { id: 'barcode', label: '条形码', densityLabel: '条形密度' },
      { id: 'rays', label: '射线', densityLabel: '射线数量', angle: true },
      { id: 'starring', label: '星环', densityLabel: '星星数量' },
      { id: 'radial', label: '环形排列', densityLabel: '元素数量', angle: true },
    ],
  },
  {
    name: '头像',
    items: [{ id: 'avatar', label: '像素头像', densityLabel: '网格大小' }],
  },
]

const GEN_LIST = GEN_GROUPS.flatMap((g) => g.items)

interface ExtraParam {
  key: string
  label: string
  min: number
  max: number
  step: number
  def: number
}

const EXTRAS: Record<string, ExtraParam[]> = {
  gradient: [
    { key: 'glowSize', label: '光晕大小', min: 0.15, max: 0.9, step: 0.05, def: 0.4 },
  ],
}

const extraValues = reactive<Record<string, Record<string, number>>>({})
Object.entries(EXTRAS).forEach(([kind, list]) => {
  extraValues[kind] = {}
  list.forEach((item) => {
    extraValues[kind][item.key] = item.def
  })
})

function ex(key: string): number {
  return Number(extraValues[cfg.kind]?.[key] ?? 0)
}

const currentExtras = computed(() => EXTRAS[cfg.kind] ?? [])

const SIZES = [
  { id: 'wide', label: '16:9 · 1920×1080', w: 1920, h: 1080 },
  { id: 'square', label: '1:1 · 1440×1440', w: 1440, h: 1440 },
  { id: 'portrait', label: '3:4 · 1200×1600', w: 1200, h: 1600 },
  { id: 'story', label: '9:16 · 1080×1920', w: 1080, h: 1920 },
]

const seedWords = ['aurora', 'ember', 'drift', 'mono', 'petal', 'tide', 'dusk', 'moss']

function randomSeed() {
  const word = seedWords[Math.floor(Math.random() * seedWords.length)]
  return `${word}-${Math.random().toString(36).slice(2, 6)}`
}

const cfg = reactive({
  kind: 'gradient' as Kind,
  palette: 0,
  size: 'wide',
  seed: 'aurora-0721',
  density: 6,
  angle: 0,
  grain: true,
  grid: 12,
})

const LINE_STYLES = [
  { id: 'solid', label: '实线' },
  { id: 'dashed', label: '虚线' },
  { id: 'dotted', label: '点线' },
] as const

const geo = reactive({
  count: 20,
  minR: 50,
  maxR: 400,
  innerStroke: 12,
  outerStroke: 0.1,
  sweep: 360,
  start: 0,
  lineStyle: 'solid' as 'solid' | 'dashed' | 'dotted',
  dash: 10,
  gap: 8,
  stroke: '',
  bg: '',
})

let svgMode = false

const size = computed(() => SIZES.find((s) => s.id === cfg.size) ?? SIZES[0])

const activePalette = computed(() => PALETTES[cfg.palette] ?? PALETTES[0])
const currentGen = computed(
  () => GEN_LIST.find((g) => g.id === cfg.kind) ?? GEN_LIST[0],
)

const previewSize = computed(() => {
  const { w, h } = size.value
  const k = Math.min(1, 1500 / Math.max(w, h))
  return { width: Math.round(w * k), height: Math.round(h * k) }
})

const tick = reactive({
  count: 60,
  radius: 0.36,
  start: -90,
  sweep: 360,
  majorEvery: 5,
  majorScale: 2.4,
  width: 1.2,
  color: '',
})

const barcode = reactive({
  bars: 72,
  width: 0.72,
  height: 0.3,
  color: '',
  bg: '',
  showText: true,
})

const globe = reactive({
  rx: 0.33,
  ry: 0.33,
  meridians: 14,
  parallels: 7,
  tilt: -0.16,
  color: '',
})

type LineStyle = 'solid' | 'dashed' | 'dotted'

const waveCfg = reactive({
  layers: 16,
  amp: 0.05,
  freq: 2,
  width: 1.4,
  color: '',
  dash: 'solid' as LineStyle,
})

const stripeCfg = reactive({
  count: 40,
  widthRatio: 0.4,
  angle: 0,
  color: '',
})

function applyDash(ctx: CanvasRenderingContext2D, style: LineStyle, unit: number) {
  if (style === 'solid') ctx.setLineDash([])
  else if (style === 'dotted') ctx.setLineDash([0.1, Math.max(1, unit * 0.012)])
  else ctx.setLineDash([Math.max(1, unit * 0.012), Math.max(1, unit * 0.008)])
}

const raysCfg = reactive({
  count: 40,
  start: 0,
  spread: 360,
  inner: 0,
  outer: 0.75,
  alpha: 0.1,
  color: '',
})

const starCfg = reactive({
  count: 12,
  radius: 0.31,
  size: 0.016,
  angle: 0,
  color: '',
  image: '',
})

const radialCfg = reactive({
  count: 32,
  inner: 0.14,
  length: 0.3,
  width: 0.01,
  angle: 0,
  color: '',
})

const nestCfg = reactive({
  layers: 12,
  sides: 5,
  radius: 0.42,
  spin: 0.12,
  width: 1.2,
  color: '',
})

const gridCfg = reactive({
  gap: 64,
  width: 1,
  fill: 0.35,
  color: '',
  bg: '',
})

const halfCfg = reactive({
  gap: 26,
  scale: 0.62,
  angle: 0,
  color: '',
})

const meshCfg = reactive({
  shape: 'triangle' as 'triangle' | 'hexagon' | 'wedge' | 'rect',
  edge: 60,
  scale: 100,
  fillColor: '',
  strokeColor: '',
  strokeWidth: 0,
  gridColor: '',
  showGrid: true,
  mode: 'paint' as 'paint' | 'toggle',
})

const meshState = reactive({
  cells: {} as Record<string, boolean>,
  painting: false,
})

type MeshCell = { key: string; pts: [number, number][] }

function meshCells(w: number, h: number): MeshCell[] {
  const s = Math.max(8, Math.min(160, meshCfg.edge))
  const out: MeshCell[] = []
  if (meshCfg.shape === 'triangle') {
    const hh = s * Math.sqrt(3) / 2
    const rows = Math.ceil(h / hh) + 2
    const cols = Math.ceil(w / s) + 2
    for (let r = 0; r < rows; r += 1) {
      const y = r * hh - hh
      const off = r % 2 ? s / 2 : 0
      for (let c = 0; c < cols; c += 1) {
        const x = off + c * s - s
        out.push({ key: `${r},${c},u`, pts: [[x, y], [x + s, y], [x + s / 2, y + hh]] })
        out.push({ key: `${r},${c},d`, pts: [[x + s / 2, y + hh], [x + 1.5 * s, y + hh], [x + s, y]] })
      }
    }
  } else if (meshCfg.shape === 'hexagon') {
    const hh = Math.sqrt(3) * s
    const cols = Math.ceil(w / (s * 1.5)) + 2
    const rows = Math.ceil(h / hh) + 2
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        const cx = c * s * 1.5 - s
        const cy = r * hh + (c % 2 ? hh / 2 : 0) - hh
        const pts: [number, number][] = []
        for (let k = 0; k < 6; k += 1) {
          const a = (Math.PI / 3) * k
          pts.push([cx + s * Math.cos(a), cy + s * Math.sin(a)])
        }
        out.push({ key: `${c},${r}`, pts })
      }
    }
  } else if (meshCfg.shape === 'wedge') {
    const cols = Math.ceil(w / s) + 2
    const rows = Math.ceil(h / s) + 2
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = c * s - s
        const y = r * s - s
        out.push({ key: `${r},${c},a`, pts: [[x, y], [x + s, y], [x, y + s]] })
        out.push({ key: `${r},${c},b`, pts: [[x + s, y], [x + s, y + s], [x, y + s]] })
      }
    }
  } else {
    const cols = Math.ceil(w / s) + 2
    const rows = Math.ceil(h / s) + 2
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = c * s - s
        const y = r * s - s
        out.push({ key: `${r},${c}`, pts: [[x, y], [x + s, y], [x + s, y + s], [x, y + s]] })
      }
    }
  }
  return out
}

function scaleCell(pts: [number, number][]): [number, number][] {
  const f = Math.max(0.1, Math.min(1.2, meshCfg.scale / 100))
  if (f === 1) return pts
  let cx = 0
  let cy = 0
  pts.forEach(([x, y]) => { cx += x; cy += y })
  cx /= pts.length
  cy /= pts.length
  return pts.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f] as [number, number])
}

function pointInCell(x: number, y: number, pts: [number, number][]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

let meshPainting = false

function meshHit(e: PointerEvent) {
  const el = canvasEl.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const { width, height } = previewSize.value
  const x = ((e.clientX - rect.left) / rect.width) * width
  const y = ((e.clientY - rect.top) / rect.height) * height
  for (const cell of meshCells(width, height)) {
    if (pointInCell(x, y, cell.pts)) return cell
  }
  return null
}

const contourCfg = reactive({
  levels: 12,
  wobble: 0.14,
  width: 1.2,
  color: '',
  fill: 'none' as 'none' | 'solid' | 'dots' | 'hatch',
  fillOpacity: 0.25,
  fillColor: '',
})

const dotsCfg = reactive({
  gap: 30,
  size: 0.26,
  color: '',
  image: '',
})

const dotState = reactive({
  cols: 24,
  rows: 14,
  points: {} as Record<string, boolean>,
  edit: false,
  erase: false,
})

function seedDots() {
  dotState.points = {}
  for (let r = 0; r < dotState.rows; r += 1) {
    for (let c = 0; c < dotState.cols; c += 1) {
      if (Math.sin(c * 0.55) + Math.cos(r * 0.6) > -0.1) {
        dotState.points[`${c},${r}`] = true
      }
    }
  }
}
seedDots()

const SHAPE_KINDS = ['circle', 'square', 'triangle', 'diamond', 'cross', 'arc', 'image'] as const
type ShapeKind = (typeof SHAPE_KINDS)[number]

const SHAPE_LABELS: Record<ShapeKind, string> = {
  circle: '圆形',
  square: '方形',
  triangle: '三角',
  diamond: '菱形',
  cross: '十字',
  arc: '圆弧',
  image: '图片',
}

const shapeState = reactive({
  cols: 6,
  rows: 4,
  cells: {} as Record<string, ShapeKind>,
  edit: false,
  brush: 'circle' as ShapeKind,
  erase: false,
  size: 0.32,
  width: 1.4,
  color: '',
  image: '',
})

function seedShapes() {
  shapeState.cells = {}
  for (let r = 0; r < shapeState.rows; r += 1) {
    for (let c = 0; c < shapeState.cols; c += 1) {
      if ((r + c) % 2 === 0) {
        shapeState.cells[`${c},${r}`] = SHAPE_KINDS[(r * shapeState.cols + c) % SHAPE_KINDS.length]
      }
    }
  }
}
seedShapes()

const hudCfg = reactive({
  lines: 12,
  length: 0.4,
  bracket: 0.06,
  labels: true,
  grid: true,
  frame: 'corner' as 'corner' | 'bracket' | 'dashed' | 'none',
  arrows: true,
  arrowSize: 14,
  color: '',
  bg: '',
})

const terrain = reactive({
  mode: '2d' as '2d' | '3d',
  size: 40,
  heights: [] as number[],
  yaw: -0.6,
  pitch: 0.55,
  zoom: 1,
  heightScale: 1.1,
  levels: 12,
  brush: 0.05,
})

function generateTerrain() {
  const n = terrain.size
  const rnd = mulberry32(hashString(`terrain-${cfg.seed}`))
  const octaves = [
    { f: 1.2, a: 0.55, px: rnd() * 10, py: rnd() * 10 },
    { f: 2.4, a: 0.28, px: rnd() * 10, py: rnd() * 10 },
    { f: 4.8, a: 0.12, px: rnd() * 10, py: rnd() * 10 },
    { f: 9.6, a: 0.05, px: rnd() * 10, py: rnd() * 10 },
  ]
  const arr: number[] = []
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      const u = c / (n - 1)
      const v = r / (n - 1)
      let h = 0
      for (const o of octaves) {
        h +=
          Math.sin((u * o.f + o.px) * Math.PI * 2) *
          Math.cos((v * o.f + o.py) * Math.PI * 2) *
          o.a
      }
      arr.push(Math.max(0, Math.min(1, 0.5 + h * 0.5)))
    }
  }
  terrain.heights = arr
}
generateTerrain()

function randomTerrain() {
  cfg.seed = randomSeed()
  generateTerrain()
}

const gridState = reactive({
  cols: 8,
  rows: 5,
  cells: {} as Record<string, boolean>,
  edit: false,
  erase: false,
})

function seedGrid() {
  gridState.cells = {}
  for (let r = 0; r < gridState.rows; r += 1) {
    for (let c = 0; c < gridState.cols; c += 1) {
      if ((r + c) % 3 === 0) gridState.cells[`${c},${r}`] = true
    }
  }
}
seedGrid()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const exportScale = ref(1)
const collapsed = ref(false)

/* ---------------- shared drawing ---------------- */

const f = (weight: number, size: number, family: string) =>
  `${weight} ${size}px ${family}`

function isDark(p: Palette) {
  return luminance(p.colors[3]) < 0.5
}

function inkColor(p: Palette) {
  return isDark(p) ? '#f2f6ff' : '#0c0c10'
}

function base(ctx: CanvasRenderingContext2D, w: number, h: number, p: Palette) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, p.colors[0])
  g.addColorStop(1, p.colors[3])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, withAlpha(color, alpha))
  g.addColorStop(1, withAlpha(color, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rnd: () => number,
  p: Palette,
) {
  if (!cfg.grain || svgMode) return
  const dark = isDark(p)
  ctx.save()
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'
  ctx.globalAlpha = 0.055
  const count = Math.round((w * h) / 1500)
  for (let i = 0; i < count; i += 1) {
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2)
  }
  ctx.restore()
}

function finish(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  const dark = isDark(p)
  const vig = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.18,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.72,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, dark ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0.14)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)
  drawGrain(ctx, w, h, rnd, p)
}

function stroke(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
}

function polygonPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  sides: number,
  rot: number,
) {
  ctx.beginPath()
  for (let i = 0; i < sides; i += 1) {
    const a = rot + (i * Math.PI * 2) / sides
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function sparklePath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath()
  for (let i = 0; i < 8; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 4
    const rr = i % 2 === 0 ? r : r * 0.2
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function hudText(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'left',
) {
  ctx.save()
  ctx.font = f(500, size, FONTS[6].value)
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '1px'
  ctx.fillText(str, x, y)
  ctx.restore()
}

let dotPainting = false
let dotPaintValue = true

function dotKeyAt(e: PointerEvent) {
  const el = canvasEl.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const { width, height } = previewSize.value
  const x = ((e.clientX - rect.left) / rect.width) * width
  const y = ((e.clientY - rect.top) / rect.height) * height
  const cols = Math.max(2, Math.round(dotState.cols))
  const rows = Math.max(2, Math.round(dotState.rows))
  const c = Math.floor((x / width) * cols)
  const r = Math.floor((y / height) * rows)
  if (c < 0 || c >= cols || r < 0 || r >= rows) return null
  return `${c},${r}`
}

function applyDot(e: PointerEvent) {
  const key = dotKeyAt(e)
  if (!key) return
  if (dotPaintValue) dotState.points[key] = true
  else delete dotState.points[key]
}

let shapePainting = false

function shapeKeyAt(e: PointerEvent) {
  const el = canvasEl.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const { width, height } = previewSize.value
  const x = ((e.clientX - rect.left) / rect.width) * width
  const y = ((e.clientY - rect.top) / rect.height) * height
  const cols = Math.max(1, Math.round(shapeState.cols))
  const rows = Math.max(1, Math.round(shapeState.rows))
  const c = Math.floor((x / width) * cols)
  const r = Math.floor((y / height) * rows)
  if (c < 0 || c >= cols || r < 0 || r >= rows) return null
  return `${c},${r}`
}

function applyShape(e: PointerEvent) {
  const key = shapeKeyAt(e)
  if (!key) return
  if (shapeState.erase) delete shapeState.cells[key]
  else shapeState.cells[key] = shapeState.brush
}

const dotOutlineInput = ref<HTMLInputElement | null>(null)

function onDotOutline(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const src = String(reader.result)
    loadImage(src)
      .then(() => {
        dotsCfg.outline = src
      })
      .catch(() => undefined)
  }
  reader.readAsDataURL(file)
}

const starImageInput = ref<HTMLInputElement | null>(null)
const shapeImageInput = ref<HTMLInputElement | null>(null)

function onStarImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    starCfg.image = String(reader.result)
    starCfg.count = starCfg.count
  }
  reader.readAsDataURL(file)
}

function onShapeImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    shapeState.image = String(reader.result)
    shapeState.brush = 'image'
  }
  reader.readAsDataURL(file)
}

const dotImageInput = ref<HTMLInputElement | null>(null)

function onDotImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    dotsCfg.image = String(reader.result)
  }
  reader.readAsDataURL(file)
}

let gridPainting = false
let gridPaintValue = true

function gridKeyAt(e: PointerEvent) {
  const el = canvasEl.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const { width, height } = previewSize.value
  const x = ((e.clientX - rect.left) / rect.width) * width
  const y = ((e.clientY - rect.top) / rect.height) * height
  const cols = Math.max(2, Math.round(gridState.cols))
  const rows = Math.max(2, Math.round(gridState.rows))
  const c = Math.floor((x / width) * cols)
  const r = Math.floor((y / height) * rows)
  if (c < 0 || c >= cols || r < 0 || r >= rows) return null
  return `${c},${r}`
}

function applyGrid(e: PointerEvent) {
  const key = gridKeyAt(e)
  if (!key) return
  if (gridPaintValue) gridState.cells[key] = true
  else delete gridState.cells[key]
}

function clearGrid() {
  gridState.cells = {}
}

function fillGrid() {
  for (let r = 0; r < gridState.rows; r += 1) {
    for (let c = 0; c < gridState.cols; c += 1) gridState.cells[`${c},${r}`] = true
  }
}

let terrainDrag: { x: number; y: number; sculpt: boolean } | null = null

function onDotDown(e: PointerEvent) {
  if (cfg.kind === 'mesh') {
    const cell = meshHit(e)
    if (cell) {
      meshPainting = true
      if (meshCfg.mode === 'toggle') meshState.cells[cell.key] = !meshState.cells[cell.key]
      else meshState.cells[cell.key] = true
    }
    e.preventDefault()
    return
  }
  if (cfg.kind === 'contour' && terrain.mode === '3d') {
    terrainDrag = { x: e.clientX, y: e.clientY, sculpt: e.shiftKey }
    if (e.shiftKey) sculptTerrainAt(e, e.altKey ? -1 : 1)
    e.preventDefault()
    return
  }
  if (cfg.kind === 'dots' && dotState.edit) {
    dotPainting = true
    dotPaintValue = !dotState.erase
    applyDot(e)
    e.preventDefault()
  } else if (cfg.kind === 'shapes' && shapeState.edit) {
    shapePainting = true
    applyShape(e)
    e.preventDefault()
  } else if (cfg.kind === 'grid' && gridState.edit) {
    gridPainting = true
    gridPaintValue = !gridState.erase
    applyGrid(e)
    e.preventDefault()
  }
}

function onDotMove(e: PointerEvent) {
  if (meshPainting && meshCfg.mode === 'paint') {
    const cell = meshHit(e)
    if (cell) meshState.cells[cell.key] = true
    return
  }
  if (gridPainting) applyGrid(e)
  if (terrainDrag) {
    if (terrainDrag.sculpt) {
      sculptTerrainAt(e, e.altKey ? -1 : 1)
    } else {
      terrain.yaw -= (e.clientX - terrainDrag.x) * 0.008
      terrain.pitch = Math.max(0.12, Math.min(1.35, terrain.pitch + (e.clientY - terrainDrag.y) * 0.005))
    }
    terrainDrag.x = e.clientX
    terrainDrag.y = e.clientY
    return
  }
  if (dotPainting) applyDot(e)
  if (shapePainting) applyShape(e)
}

function onDotUp() {
  dotPainting = false
  shapePainting = false
  gridPainting = false
  meshPainting = false
  terrainDrag = null
}

function clearShapes() {
  shapeState.cells = {}
}

function fillShapes() {
  for (let r = 0; r < shapeState.rows; r += 1) {
    for (let c = 0; c < shapeState.cols; c += 1) {
      shapeState.cells[`${c},${r}`] = shapeState.brush
    }
  }
}

function clearDots() {
  dotState.points = {}
}

function fillDots() {
  for (let r = 0; r < dotState.rows; r += 1) {
    for (let c = 0; c < dotState.cols; c += 1) dotState.points[`${c},${r}`] = true
  }
}

/* ---------------- generators ---------------- */

function drawGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const maxR = Math.hypot(w, h) * 0.55
  for (let i = 0; i < cfg.density; i += 1) {
    const cx = rnd() * w
    const cy = rnd() * h
    const radius = maxR * ex('glowSize') * (0.7 + rnd() * 0.6)
    const color = p.colors[1 + Math.floor(rnd() * 3)] ?? p.colors[1]
    glow(ctx, cx, cy, radius, color, 0.5)
  }

  ctx.save()
  stroke(ctx, withAlpha(p.colors[1], 0.16), Math.max(1, w * 0.0012))
  for (let i = 0; i < 3; i += 1) {
    const cx = w * (0.2 + rnd() * 0.6)
    const cy = h * (0.2 + rnd() * 0.6)
    const radius = Math.min(w, h) * (0.16 + rnd() * 0.24)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
  finish(ctx, w, h, p, rnd)
}

function drawHalftone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
  rad: number,
) {
  base(ctx, w, h, p)
  const gap = Math.max(6, Math.min(80, halfCfg.gap))
  const centers = [
    { x: rnd() * w, y: rnd() * h, r: Math.min(w, h) * (0.3 + rnd() * 0.25) },
    { x: rnd() * w, y: rnd() * h, r: Math.min(w, h) * (0.28 + rnd() * 0.25) },
  ]
  const angle = rad + (halfCfg.angle * Math.PI) / 180
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const diag = Math.hypot(w, h)
  const scale = Math.max(0.05, Math.min(1.2, halfCfg.scale))
  for (let j = -diag; j < diag; j += gap) {
    for (let i = -diag; i < diag; i += gap) {
      const x = w / 2 + i * ca - j * sa
      const y = h / 2 + i * sa + j * ca
      if (x < -gap || x > w + gap || y < -gap || y > h + gap) continue
      let field = 0
      for (const c of centers) field += Math.sin((Math.hypot(x - c.x, y - c.y) / c.r) * Math.PI)
      field /= centers.length
      const t = Math.max(0, Math.min(1, (field + 1) / 2))
      const radius = gap * scale * t
      if (radius < 0.4) continue
      const color = halfCfg.color || (t > 0.5 ? p.colors[2] : p.colors[1])
      ctx.fillStyle = withAlpha(color, 0.18 + 0.6 * t)
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  finish(ctx, w, h, p, rnd)
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const cols = Math.max(2, Math.min(80, Math.round(dotState.cols)))
  const rows = Math.max(2, Math.min(60, Math.round(dotState.rows)))
  const cw = w / cols
  const ch = h / rows
  const radius = Math.min(cw, ch) * Math.max(0.03, Math.min(0.45, dotsCfg.size))

  if (dotState.edit && !svgMode) {
    stroke(ctx, withAlpha(inkColor(p), 0.08), 1)
    for (let c = 1; c < cols; c += 1) {
      ctx.beginPath()
      ctx.moveTo(c * cw, 0)
      ctx.lineTo(c * cw, h)
      ctx.stroke()
    }
    for (let r = 1; r < rows; r += 1) {
      ctx.beginPath()
      ctx.moveTo(0, r * ch)
      ctx.lineTo(w, r * ch)
      ctx.stroke()
    }
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!dotState.points[`${c},${r}`]) continue
      if (dotsCfg.outline) {
        const oi = getImage(dotsCfg.outline)
        if (oi.complete) ensureOutline(oi)
        if (outlinePixels && outlineAlphaAt((c + 0.5) / cols, (r + 0.5) / rows) < 20) continue
      }
      const color = dotsCfg.color || mixColor(p.colors[1], p.colors[2], (c / cols) * 0.6 + (r / rows) * 0.4)
      const cx = (c + 0.5) * cw
      const cy = (r + 0.5) * ch
      const shape = dotsCfg.image ? getImage(dotsCfg.image) : null
      if (shape && shape.complete && shape.naturalWidth) {
        ctx.drawImage(shape, cx - radius, cy - radius, radius * 2, radius * 2)
      } else {
        ctx.fillStyle = withAlpha(color, 0.85)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  finish(ctx, w, h, p, rnd)
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const layers = Math.max(2, Math.min(40, Math.round(waveCfg.layers)))
  const unit = Math.min(w, h)
  for (let i = 0; i < layers; i += 1) {
    const y0 = h * (0.06 + (0.88 * i) / Math.max(layers - 1, 1))
    const amp = h * Math.max(0.005, waveCfg.amp) * (0.75 + rnd() * 0.5)
    const freq = Math.max(0.2, waveCfg.freq) * (0.75 + rnd() * 0.5)
    const phase = rnd() * Math.PI * 2
    const color = waveCfg.color || (i % 2 === 0 ? p.colors[1] : p.colors[2])
    applyDash(ctx, waveCfg.dash, unit)
    stroke(ctx, withAlpha(color, 0.32 + rnd() * 0.4), Math.max(0.4, waveCfg.width * (i % 4 === 0 ? 1.3 : 0.7)))
    ctx.beginPath()
    for (let x = 0; x <= w; x += 4) {
      const y =
        y0 +
        Math.sin((x / w) * Math.PI * 2 * freq + phase) * amp +
        Math.sin((x / w) * Math.PI * 6 + phase * 0.5) * amp * 0.25
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.setLineDash([])

  const bottom = h * (0.66 + rnd() * 0.1)
  const grad = ctx.createLinearGradient(0, bottom, 0, h)
  grad.addColorStop(0, withAlpha(p.colors[2], 0.16))
  grad.addColorStop(1, withAlpha(p.colors[1], 0.02))
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(0, bottom)
  for (let x = 0; x <= w; x += 8) {
    ctx.lineTo(x, bottom + Math.sin((x / w) * Math.PI * 2 * 1.6 + 1.2) * h * 0.04 + Math.sin((x / w) * Math.PI * 4) * h * 0.02)
  }
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()
  finish(ctx, w, h, p, rnd)
}

function drawStripes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const unit = Math.min(w, h)
  const diag = Math.hypot(w, h)
  const count = Math.max(4, Math.min(120, Math.round(stripeCfg.count)))
  const gap = (diag * 2) / count
  const rad = (stripeCfg.angle * Math.PI) / 180
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(rad)
  for (let i = 0; i < count; i += 1) {
    const x = -diag + i * gap
    const width = gap * stripeCfg.widthRatio * (0.5 + rnd() * 0.8)
    const color = stripeCfg.color || (rnd() > 0.68 ? p.colors[2] : p.colors[1])
    ctx.fillStyle = withAlpha(color, 0.14 + rnd() * 0.5)
    ctx.fillRect(x, -diag, width, diag * 2)
  }
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = withAlpha(stripeCfg.color || p.colors[2], 0.5)
    ctx.fillRect(-diag * 0.6 + rnd() * diag * 1.2, -diag, 2 + rnd() * 3, diag * 2)
  }
  ctx.restore()
  void unit
  finish(ctx, w, h, p, rnd)
}

function contourLoop(
  ctx: CanvasRenderingContext2D,
  c: { x: number; y: number; s: number },
  baseR: number,
  phases: number[],
  ci: number,
  wobbleSize: number,
) {
  const first = true
  for (let th = 0; th <= Math.PI * 2 + 0.05; th += 0.035) {
    const wobble =
      1 +
      wobbleSize * Math.sin(3 * th + phases[0] + ci) +
      wobbleSize * 0.64 * Math.sin(5 * th + phases[1]) +
      wobbleSize * 0.36 * Math.sin(8 * th + phases[2])
    const r = baseR * wobble
    const x = c.x + Math.cos(th) * r
    const y = c.y + Math.sin(th) * r
    if (th === 0 && first) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function paintBand(
  ctx: CanvasRenderingContext2D,
  c: { x: number; y: number; s: number },
  outer: number,
  inner: number,
  phases: number[],
  ci: number,
  wobbleSize: number,
  w: number,
  p: Palette,
) {
  ctx.beginPath()
  contourLoop(ctx, c, outer, phases, ci, wobbleSize)
  contourLoop(ctx, c, Math.max(inner, 0.1), phases, ci, wobbleSize)
  ctx.fillStyle = withAlpha(contourCfg.fillColor || p.colors[2], contourCfg.fillOpacity)
  ctx.fill('evenodd')

  if (contourCfg.fill === 'dots' || contourCfg.fill === 'hatch') {
    ctx.save()
    ctx.clip('evenodd')
    if (contourCfg.fill === 'dots') {
      const gap = Math.max(6, Math.min(w, w) * 0.018)
      ctx.fillStyle = withAlpha(contourCfg.fillColor || p.colors[1], 0.55)
      for (let y = 0; y < c.s * 2; y += gap) {
        for (let x = 0; x < c.s * 2; x += gap) {
          ctx.beginPath()
          ctx.arc(c.x - c.s + x, c.y - c.s + y, 1.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else {
      stroke(ctx, withAlpha(contourCfg.fillColor || p.colors[1], 0.4), 1)
      const gap = Math.max(8, c.s * 0.05)
      for (let i = -c.s * 2; i < c.s * 2; i += gap) {
        ctx.beginPath()
        ctx.moveTo(c.x - c.s + i, c.y - c.s)
        ctx.lineTo(c.x - c.s + i + c.s * 2, c.y + c.s)
        ctx.stroke()
      }
    }
    ctx.restore()
  }
}

function drawContour(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const centers = [
    { x: w * (0.32 + rnd() * 0.2), y: h * (0.34 + rnd() * 0.2), s: Math.min(w, h) * (0.34 + rnd() * 0.1) },
    { x: w * (0.64 + rnd() * 0.16), y: h * (0.62 + rnd() * 0.16), s: Math.min(w, h) * (0.26 + rnd() * 0.12) },
  ]
  const levels = Math.max(2, Math.min(40, Math.round(contourCfg.levels)))
  const wobbleSize = Math.max(0.005, Math.min(0.5, contourCfg.wobble))
  const phases = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28]

  if (contourCfg.fill !== 'none' && contourCfg.fillOpacity > 0) {
    centers.forEach((c, ci) => {
      for (let l = 1; l < levels; l += 1) {
        const outer = c.s * (0.1 + (0.88 * l) / levels)
        const inner = c.s * (0.1 + (0.88 * (l - 1)) / levels)
        paintBand(ctx, c, outer, inner, phases, ci, wobbleSize, w, p)
      }
    })
  }

  centers.forEach((c, ci) => {
    for (let l = 0; l < levels; l += 1) {
      const baseR = c.s * (0.1 + (0.88 * l) / levels)
      const color = contourCfg.color || (l % 2 === 0 ? p.colors[1] : p.colors[2])
      stroke(ctx, withAlpha(color, 0.3 + 0.3 * (1 - l / levels)), Math.max(0.3, contourCfg.width * (1 - l / levels * 0.4)))
      ctx.beginPath()
      contourLoop(ctx, c, baseR, phases, ci, wobbleSize)
      ctx.stroke()
    }
  })
  finish(ctx, w, h, p, rnd)
}

function drawConcentric(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  void p
  void rnd
  const strokeColor = geo.stroke || p.colors[1]
  const bgColor = geo.bg || p.colors[0]
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)

  const k = Math.min(w, h) / 1080
  const cx = w / 2
  const cy = h / 2
  const count = Math.min(100, Math.max(1, Math.round(geo.count)))
  const start = (geo.start * Math.PI) / 180
  const sweep = (Math.max(1, Math.min(360, geo.sweep)) * Math.PI) / 180
  const minR = Math.min(2000, Math.max(0, geo.minR)) * k
  const maxR = Math.min(2000, Math.max(geo.minR, geo.maxR)) * k
  const dash = Math.max(0.1, geo.dash * k)
  const gap = Math.max(0.5, geo.gap * k)

  ctx.save()
  ctx.lineCap = geo.lineStyle === 'dotted' ? 'round' : 'butt'
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1)
    const r = minR + (maxR - minR) * t
    const width = Math.max(
      0.1,
      Math.min(30, geo.innerStroke + (geo.outerStroke - geo.innerStroke) * t) * k,
    )
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = width
    if (geo.lineStyle === 'solid') ctx.setLineDash([])
    else if (geo.lineStyle === 'dashed') ctx.setLineDash([dash, gap])
    else ctx.setLineDash([0.01 * k, gap])
    ctx.beginPath()
    ctx.arc(cx, cy, r, start, start + sweep)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.restore()
}

function drawTickRing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)
  const R = unit * Math.min(0.46, Math.max(0.15, tick.radius))
  const count = Math.max(3, Math.min(360, Math.round(tick.count)))
  const start = (tick.start * Math.PI) / 180
  const sweep = (Math.max(1, Math.min(360, tick.sweep)) * Math.PI) / 180
  const lineColor = tick.color || p.colors[1]

  glow(ctx, cx, cy, R * 2.1, lineColor, 0.12)

  for (let i = 0; i < count; i += 1) {
    const a = start + (sweep * i) / count
    const major = tick.majorEvery > 0 && i % Math.round(tick.majorEvery) === 0
    const len = major ? unit * 0.045 * tick.majorScale : unit * 0.018
    stroke(
      ctx,
      withAlpha(major ? p.colors[2] : lineColor, major ? 0.9 : 0.5),
      Math.max(0.4, tick.width * (major ? 1.6 : 0.8)),
    )
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R)
    ctx.lineTo(cx + Math.cos(a) * (R + len), cy + Math.sin(a) * (R + len))
    ctx.stroke()
  }

  stroke(ctx, withAlpha(lineColor, 0.7), tick.width)
  ctx.beginPath()
  ctx.arc(cx, cy, R, start, start + sweep)
  ctx.stroke()

  if (sweep < Math.PI * 2 - 0.01) {
    ;[start, start + sweep].forEach((a) => {
      stroke(ctx, withAlpha(p.colors[2], 0.8), tick.width * 1.4)
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * (R - unit * 0.02), cy + Math.sin(a) * (R - unit * 0.02))
      ctx.lineTo(cx + Math.cos(a) * (R + unit * 0.06), cy + Math.sin(a) * (R + unit * 0.06))
      ctx.stroke()
    })
  }

  if (sweep >= Math.PI * 2 - 0.01 && count >= 12) {
    for (let i = 0; i < 12; i += 1) {
      const a = start + (Math.PI * 2 * i) / 12
      hudText(
        ctx,
        String(i * 30),
        cx + Math.cos(a) * (R - unit * 0.055),
        cy + Math.sin(a) * (R - unit * 0.055) - 6,
        Math.max(9, unit * 0.014),
        withAlpha(inkColor(p), 0.45),
        'center',
      )
    }
  }

  ctx.fillStyle = withAlpha(p.colors[2], 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(2, unit * 0.006), 0, Math.PI * 2)
  ctx.fill()
  finish(ctx, w, h, p, rnd)
}

function drawMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const cells = meshCells(w, h)
  const gridColor = meshCfg.gridColor || inkColor(p)
  const fillColor = meshCfg.fillColor || p.colors[1]
  const strokeColor = meshCfg.strokeColor || p.colors[2]

  if (meshCfg.showGrid) {
    stroke(ctx, withAlpha(gridColor, 0.2), 1)
    ctx.beginPath()
    cells.forEach((cell) => {
      cell.pts.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
    })
    ctx.stroke()
  }

  cells.forEach((cell) => {
    if (!meshState.cells[cell.key]) return
    const pts = scaleCell(cell.pts)
    ctx.beginPath()
    pts.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fillStyle = withAlpha(fillColor, 0.85)
    ctx.fill()
    if (meshCfg.strokeWidth > 0) {
      stroke(ctx, withAlpha(strokeColor, 0.9), meshCfg.strokeWidth)
      ctx.stroke()
    }
  })
  finish(ctx, w, h, p, rnd)
}

function drawNested(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
  rad: number,
) {
  base(ctx, w, h, p)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)
  const sides = Math.max(3, Math.min(16, Math.round(nestCfg.sides)))
  const layers = Math.max(2, Math.min(40, Math.round(nestCfg.layers)))
  const baseR = unit * Math.min(0.55, Math.max(0.1, nestCfg.radius))
  const color = nestCfg.color

  glow(ctx, cx, cy, baseR * 1.6, color || p.colors[1], 0.1)
  for (let i = 0; i < layers; i += 1) {
    const t = i / layers
    const r = baseR * (1 - t * 0.88)
    const c = color || (i % 2 === 0 ? p.colors[1] : p.colors[2])
    stroke(ctx, withAlpha(c, 0.28 + 0.55 * (1 - t)), Math.max(0.3, nestCfg.width * (1 - t * 0.5)))
    polygonPath(ctx, cx, cy, r, sides, rad + i * nestCfg.spin)
    ctx.stroke()
  }
  ctx.fillStyle = withAlpha(color || p.colors[2], 0.85)
  ctx.beginPath()
  ctx.arc(cx, cy, unit * 0.008, 0, Math.PI * 2)
  ctx.fill()
  finish(ctx, w, h, p, rnd)
}

function drawCellShape(
  ctx: CanvasRenderingContext2D,
  kind: ShapeKind,
  cx: number,
  cy: number,
  size: number,
  color: string,
  width: number,
) {
  ctx.save()
  ctx.strokeStyle = withAlpha(color, 0.9)
  ctx.lineWidth = Math.max(0.3, width)
  ctx.fillStyle = withAlpha(color, 0.12)
  if (kind === 'circle') {
    ctx.beginPath()
    ctx.arc(cx, cy, size, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else if (kind === 'square') {
    ctx.fillRect(cx - size, cy - size, size * 2, size * 2)
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2)
  } else if (kind === 'triangle') {
    ctx.beginPath()
    ctx.moveTo(cx, cy - size)
    ctx.lineTo(cx + size, cy + size)
    ctx.lineTo(cx - size, cy + size)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (kind === 'diamond') {
    ctx.beginPath()
    ctx.moveTo(cx, cy - size)
    ctx.lineTo(cx + size, cy)
    ctx.lineTo(cx, cy + size)
    ctx.lineTo(cx - size, cy)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (kind === 'cross') {
    ctx.beginPath()
    ctx.moveTo(cx - size, cy)
    ctx.lineTo(cx + size, cy)
    ctx.moveTo(cx, cy - size)
    ctx.lineTo(cx, cy + size)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(cx, cy, size, 0, Math.PI)
    ctx.stroke()
  }
  ctx.restore()
}

function drawShapes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const cols = Math.max(1, Math.min(16, Math.round(shapeState.cols)))
  const rows = Math.max(1, Math.min(12, Math.round(shapeState.rows)))
  const cw = w / cols
  const ch = h / rows

  if (shapeState.edit && !svgMode) {
    stroke(ctx, withAlpha(inkColor(p), 0.08), 1)
    for (let c = 1; c < cols; c += 1) {
      ctx.beginPath()
      ctx.moveTo(c * cw, 0)
      ctx.lineTo(c * cw, h)
      ctx.stroke()
    }
    for (let r = 1; r < rows; r += 1) {
      ctx.beginPath()
      ctx.moveTo(0, r * ch)
      ctx.lineTo(w, r * ch)
      ctx.stroke()
    }
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const kind = shapeState.cells[`${c},${r}`]
      if (!kind) continue
      const color = shapeState.color || ((r + c) % 2 === 0 ? p.colors[1] : p.colors[2])
      const cellSize = Math.min(cw, ch) * Math.max(0.05, Math.min(0.5, shapeState.size))
      if (kind === 'image') {
        const img = shapeState.image ? getImage(shapeState.image) : null
        if (img && img.complete && img.naturalWidth) {
          ctx.save()
          ctx.globalAlpha = 0.95
          ctx.drawImage(img, (c + 0.5) * cw - cellSize, (r + 0.5) * ch - cellSize, cellSize * 2, cellSize * 2)
          ctx.restore()
        } else {
          drawCellShape(ctx, 'circle', (c + 0.5) * cw, (r + 0.5) * ch, cellSize, color, shapeState.width)
        }
        continue
      }
      drawCellShape(
        ctx,
        kind,
        (c + 0.5) * cw,
        (r + 0.5) * ch,
        cellSize,
        color,
        shapeState.width,
      )
    }
  }
  finish(ctx, w, h, p, rnd)
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
  rad: number,
) {
  base(ctx, w, h, p)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)
  const rx = unit * Math.min(0.55, Math.max(0.1, globe.rx))
  const ry = unit * Math.min(0.55, Math.max(0.1, globe.ry))
  const line = globe.color || p.colors[1]
  glow(ctx, cx, cy, Math.max(rx, ry) * 2, line, 0.15)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(globe.tilt + rad * 0.15)
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.clip()

  const nLat = Math.max(1, Math.round(globe.parallels))
  const nLon = Math.max(2, Math.round(globe.meridians))
  stroke(ctx, withAlpha(line, 0.34), Math.max(0.6, unit * 0.001))

  for (let i = 1; i < nLat; i += 1) {
    const lat = -Math.PI / 2 + (Math.PI * i) / nLat
    const y = Math.sin(lat) * ry
    const rxi = Math.cos(lat) * rx
    ctx.beginPath()
    ctx.ellipse(0, y, Math.max(rxi, 0.1), Math.max(rxi * 0.1, 0.6), 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  for (let i = 0; i < nLon; i += 1) {
    const rxi = rx * Math.sin((Math.PI * i) / nLon)
    ctx.beginPath()
    ctx.ellipse(0, 0, Math.max(Math.abs(rxi), 0.1), ry, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()

  stroke(ctx, withAlpha(p.colors[2], 0.7), Math.max(1, unit * 0.0018))
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rad + 0.35)
  ctx.setLineDash([Math.max(3, unit * 0.005), Math.max(4, unit * 0.007)])
  stroke(ctx, withAlpha(p.colors[2], 0.4), 1.2)
  ctx.beginPath()
  ctx.ellipse(0, 0, rx * 1.2, Math.max(ry * 0.22, 2), 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  for (let i = 0; i < 24; i += 1) {
    const a = rnd() * Math.PI * 2
    const rr = Math.max(rx, ry) * (1.15 + rnd() * 0.6)
    ctx.fillStyle = withAlpha(inkColor(p), 0.25 + rnd() * 0.4)
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.8 + rnd() * 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
  finish(ctx, w, h, p, rnd)
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  if (gridCfg.bg) {
    ctx.fillStyle = gridCfg.bg
    ctx.fillRect(0, 0, w, h)
  } else {
    base(ctx, w, h, p)
  }
  const ink = gridCfg.color || inkColor(p)
  const lw = Math.max(0.3, gridCfg.width)

  if (gridState.edit) {
    const cols = Math.max(2, Math.min(24, Math.round(gridState.cols)))
    const rows = Math.max(2, Math.min(16, Math.round(gridState.rows)))
    const cw = w / cols
    const ch = h / rows
    stroke(ctx, withAlpha(ink, 0.12), 1)
    for (let c = 1; c < cols; c += 1) {
      ctx.beginPath()
      ctx.moveTo(c * cw, 0)
      ctx.lineTo(c * cw, h)
      ctx.stroke()
    }
    for (let r = 1; r < rows; r += 1) {
      ctx.beginPath()
      ctx.moveTo(0, r * ch)
      ctx.lineTo(w, r * ch)
      ctx.stroke()
    }
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (!gridState.cells[`${c},${r}`]) continue
        ctx.fillStyle = withAlpha(gridCfg.color || p.colors[1], 0.42)
        ctx.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4)
      }
    }
    finish(ctx, w, h, p, rnd)
    return
  }

  const gap = Math.max(16, Math.min(220, gridCfg.gap))

  for (let x = gap; x < w; x += gap) {
    const major = Math.round(x / gap) % 4 === 0
    stroke(ctx, withAlpha(ink, major ? 0.4 : 0.16), lw * (major ? 1.5 : 0.8))
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = gap; y < h; y += gap) {
    const major = Math.round(y / gap) % 4 === 0
    stroke(ctx, withAlpha(ink, major ? 0.4 : 0.16), lw * (major ? 1.5 : 0.8))
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  for (let y = 0; y < h; y += gap * 2) {
    for (let x = 0; x < w; x += gap * 2) {
      if (rnd() < gridCfg.fill) {
        ctx.fillStyle = withAlpha(p.colors[1], 0.12 + rnd() * 0.16)
        ctx.fillRect(x + gap * 0.1, y + gap * 0.1, gap * 0.8, gap * 0.8)
      }
      if (rnd() > 0.82) {
        ctx.fillStyle = withAlpha(ink, 0.7)
        ctx.fillRect(x - 2, y - 2, 4, 4)
      }
    }
  }
  finish(ctx, w, h, p, rnd)
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  if (hudCfg.bg) {
    ctx.fillStyle = hudCfg.bg
    ctx.fillRect(0, 0, w, h)
  } else {
    base(ctx, w, h, p)
  }
  const ink = hudCfg.color || inkColor(p)
  const c1 = p.colors[1]
  const c2 = p.colors[2]
  const unit = Math.min(w, h)
  const scale = w / 1600
  const m = unit * 0.045
  const corner = unit * Math.max(0.01, Math.min(0.14, hudCfg.bracket))

  if (hudCfg.grid) {
    stroke(ctx, withAlpha(ink, 0.07), 1)
    for (let i = 1; i < 6; i += 1) {
      ctx.beginPath()
      ctx.moveTo((w / 6) * i, 0)
      ctx.lineTo((w / 6) * i, h)
      ctx.stroke()
    }
    for (let i = 1; i < 4; i += 1) {
      ctx.beginPath()
      ctx.moveTo(0, (h / 4) * i)
      ctx.lineTo(w, (h / 4) * i)
      ctx.stroke()
    }
  }

  ctx.save()
  if (hudCfg.frame === 'dashed') {
    ctx.setLineDash([10, 8])
    stroke(ctx, withAlpha(ink, 0.25), 1)
    ctx.strokeRect(m, m, w - m * 2, h - m * 2)
    ctx.setLineDash([])
  } else if (hudCfg.frame !== 'none') {
    stroke(ctx, withAlpha(ink, 0.2), 1)
    ctx.strokeRect(m, m, w - m * 2, h - m * 2)
    ctx.strokeStyle = withAlpha(c1, 0.75)
    ctx.lineWidth = 1.6
    const corners: [number, number, number, number][] = [
      [m, m, 1, 1],
      [w - m, m, -1, 1],
      [m, h - m, 1, -1],
      [w - m, h - m, -1, -1],
    ]
    corners.forEach(([x, y, sx, sy]) => {
      ctx.beginPath()
      if (hudCfg.frame === 'bracket') {
        ctx.moveTo(x + sx * corner, y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y + sy * corner)
        ctx.moveTo(x + sx * corner * 0.6, y + sy * 4)
        ctx.lineTo(x + sx * 4, y + sy * 4)
      } else {
        ctx.moveTo(x, y + sy * corner)
        ctx.lineTo(x, y)
        ctx.lineTo(x + sx * corner, y)
      }
      ctx.stroke()
    })
    ctx.fillStyle = withAlpha(c2, 0.85)
    corners.forEach(([x, y, sx, sy]) => {
      ctx.beginPath()
      ctx.arc(x + sx * corner * 0.5, y + sy * corner * 0.5, 2, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  ctx.restore()

  const lines = Math.max(1, Math.min(60, Math.round(hudCfg.lines)))
  for (let i = 0; i < lines; i += 1) {
    const y = m + rnd() * (h - m * 2)
    const x1 = m + rnd() * w * 0.45
    const len = w * Math.max(0.02, Math.min(0.9, hudCfg.length)) * (0.4 + rnd() * 0.9)
    const x2 = Math.min(w - m, x1 + len)
    const color = i % 3 === 0 ? c2 : c1
    stroke(ctx, withAlpha(color, 0.18 + rnd() * 0.3), 1)
    ctx.beginPath()
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
    if (hudCfg.arrows) {
      const a = Math.max(4, hudCfg.arrowSize * scale)
      ctx.fillStyle = withAlpha(color, 0.6)
      ctx.beginPath()
      ctx.moveTo(x2, y)
      ctx.lineTo(x2 - a, y - a * 0.45)
      ctx.lineTo(x2 - a, y + a * 0.45)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(x2, y - 4 * scale)
      ctx.lineTo(x2, y + 4 * scale)
      ctx.stroke()
    }
    ctx.fillStyle = withAlpha(color, 0.55)
    ctx.beginPath()
    ctx.arc(x1, y, 1.4 * scale, 0, Math.PI * 2)
    ctx.fill()
  }

  const cx = w * 0.3
  const cy = h * 0.34
  const R = unit * 0.1
  stroke(ctx, withAlpha(c1, 0.7), 1.2)
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - R * 1.3, cy)
  ctx.lineTo(cx + R * 1.3, cy)
  ctx.moveTo(cx, cy - R * 1.3)
  ctx.lineTo(cx, cy + R * 1.3)
  ctx.stroke()
  ctx.fillStyle = withAlpha(c2, 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, 2 * scale, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.setLineDash([6 * scale, 6 * scale])
  stroke(ctx, withAlpha(c2, 0.45), 1)
  ctx.beginPath()
  ctx.arc(w * 0.72, h * 0.62, unit * 0.12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  if (hudCfg.labels) {
    const labels = [
      `0x${Math.floor(rnd() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`,
      `LAT ${(-90 + rnd() * 180).toFixed(2)}`,
      `SCAN ${String(Math.floor(rnd() * 1000)).padStart(3, '0')}`,
      `SYS.${rnd() > 0.4 ? 'OK' : 'RUN'}`,
      `GAIN ${(rnd() * 9).toFixed(2)}`,
      `CH.${String(Math.floor(rnd() * 24)).padStart(2, '0')}`,
    ]
    labels.forEach((label, i) => {
      hudText(ctx, label, m + (12 + i * 2) * scale, m + (16 + i * 16) * scale, 9.5 * scale, withAlpha(i % 2 === 0 ? c1 : c2, 0.65))
    })
    hudText(ctx, 'SYSTEM / PANEL 04', w - m - 12 * scale, m + 14 * scale, 10 * scale, withAlpha(ink, 0.5), 'right')
    hudText(ctx, 'X 042.897  Y 118.204', w - m - 12 * scale, h - m - 26 * scale, 9.5 * scale, withAlpha(ink, 0.42), 'right')
  }
  finish(ctx, w, h, p, rnd)
}

function drawBarcode(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  if (barcode.bg) {
    ctx.fillStyle = barcode.bg
    ctx.fillRect(0, 0, w, h)
  } else {
    base(ctx, w, h, p)
  }
  const ink = barcode.color || inkColor(p)
  const bw = w * Math.min(0.95, Math.max(0.2, barcode.width))
  const bh = h * Math.min(0.6, Math.max(0.08, barcode.height))
  const x0 = (w - bw) / 2
  const y0 = (h - bh) / 2
  const bars = Math.max(10, Math.min(220, Math.round(barcode.bars)))
  const weights = Array.from({ length: bars }, () => 0.35 + rnd() * 1.5)
  const total = weights.reduce((a, b) => a + b, 0)
  const unit = bw / total

  ctx.save()
  ctx.fillStyle = withAlpha(ink, 0.05)
  roundRect(ctx, x0 - 18, y0 - 18, bw + 36, bh + (barcode.showText ? 96 : 36), 16)
  ctx.fill()
  ctx.strokeStyle = withAlpha(ink, 0.16)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()

  let cursor = x0
  ctx.fillStyle = withAlpha(ink, 0.92)
  weights.forEach((weight, i) => {
    const barW = Math.max(1, weight * unit * 0.6)
    if (i % 9 !== 4) ctx.fillRect(cursor, y0, barW, bh)
    cursor += barW + weight * unit * 0.4
  })

  if (barcode.showText) {
    const hex = Math.floor(rnd() * 0xffff).toString(16).toUpperCase().padStart(4, '0')
    hudText(ctx, `SERIES ${String(bars).padStart(2, '0')} / 0x${hex}`, w / 2, y0 + bh + 26, 11 * (w / 1600), withAlpha(ink, 0.6), 'center')
    hudText(ctx, String(Date.now()).slice(-8), w / 2, y0 + bh + 44, 9 * (w / 1600), withAlpha(ink, 0.32), 'center')
  }
  finish(ctx, w, h, p, rnd)
}

function drawRays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
  rad: number,
) {
  base(ctx, w, h, p)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)
  const count = Math.max(3, Math.min(180, Math.round(raysCfg.count)))
  const start = (raysCfg.start * Math.PI) / 180 + rad
  const spread = (Math.max(5, Math.min(360, raysCfg.spread)) * Math.PI) / 180
  const inner = unit * Math.min(0.4, Math.max(0, raysCfg.inner))
  const outer = Math.max(inner + 10, Math.hypot(w, h) * Math.min(1.4, Math.max(0.15, raysCfg.outer)))
  const color = raysCfg.color

  glow(ctx, cx, cy, inner + unit * 0.2, color || p.colors[1], 0.16)

  for (let i = 0; i < count; i += 1) {
    const a0 = start + (spread * i) / count
    const a1 = a0 + (spread / count) * 0.55
    const len = outer * (0.72 + rnd() * 0.28)
    const fill = color || (i % 2 === 0 ? p.colors[1] : p.colors[2])
    ctx.fillStyle = withAlpha(fill, raysCfg.alpha * (0.5 + rnd()))
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a0) * inner, cy + Math.sin(a0) * inner)
    ctx.lineTo(cx + Math.cos(a0) * len, cy + Math.sin(a0) * len)
    ctx.lineTo(cx + Math.cos(a1) * len, cy + Math.sin(a1) * len)
    ctx.lineTo(cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner)
    ctx.closePath()
    ctx.fill()
  }

  for (let i = 0; i < count; i += 4) {
    const a = start + (spread * i) / count
    stroke(ctx, withAlpha(color || p.colors[2], 0.35), 1)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer)
    ctx.stroke()
  }

  ctx.fillStyle = withAlpha(color || p.colors[2], 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(3, unit * 0.007), 0, Math.PI * 2)
  ctx.fill()
  finish(ctx, w, h, p, rnd)
}

function drawStarring(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
  rad: number,
) {
  base(ctx, w, h, p)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)
  const R = unit * Math.min(0.5, Math.max(0.1, starCfg.radius))
  const color = starCfg.color
  const count = Math.max(3, Math.min(60, Math.round(starCfg.count)))
  const tilt = rad + (starCfg.angle * Math.PI) / 180

  glow(ctx, cx, cy, R * 1.8, color || p.colors[1], 0.16)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tilt)
  ctx.setLineDash([5, 7])
  stroke(ctx, withAlpha(color || p.colors[1], 0.4), 1)
  ctx.beginPath()
  ctx.ellipse(0, 0, R, R * 0.34, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  for (let i = 0; i < count; i += 1) {
    const a = tilt + (i / count) * Math.PI * 2 + 0.18
    const rr = R * (0.92 + rnd() * 0.16)
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr * 0.9
    const starR = unit * starCfg.size * (0.6 + rnd() * 1.3)
    const fill = color || (i % 3 === 0 ? p.colors[2] : p.colors[1])
    const starImg = starCfg.image ? getImage(starCfg.image) : null
    if (starImg && starImg.complete && starImg.naturalWidth) {
      ctx.save()
      ctx.globalAlpha = 0.95
      ctx.drawImage(starImg, x - starR, y - starR, starR * 2, starR * 2)
      ctx.restore()
    } else {
      ctx.save()
      ctx.shadowColor = withAlpha(p.colors[2], 0.8)
      ctx.shadowBlur = starR * 2
      ctx.fillStyle = withAlpha(fill, 0.92)
      sparklePath(ctx, x, y, starR)
      ctx.fill()
      ctx.restore()
    }

    const a2 = a + Math.PI / count
    const dx = cx + Math.cos(a2) * rr
    const dy = cy + Math.sin(a2) * rr * 0.9
    ctx.fillStyle = withAlpha(inkColor(p), 0.5)
    ctx.beginPath()
    ctx.arc(dx, dy, Math.max(1, starR * 0.16), 0, Math.PI * 2)
    ctx.fill()
  }
  finish(ctx, w, h, p, rnd)
}

function drawRadial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
  rad: number,
) {
  base(ctx, w, h, p)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)
  const count = Math.max(3, Math.min(120, Math.round(radialCfg.count)))
  const inner = unit * Math.min(0.4, Math.max(0.02, radialCfg.inner))
  const maxLen = unit * Math.min(0.6, Math.max(0.03, radialCfg.length))
  const width = unit * Math.min(0.06, Math.max(0.002, radialCfg.width))
  const start = (radialCfg.angle * Math.PI) / 180 + rad
  const color = radialCfg.color

  ctx.save()
  ctx.setLineDash([4, 8])
  stroke(ctx, withAlpha(inkColor(p), 0.18), 1)
  ctx.beginPath()
  ctx.arc(cx, cy, inner, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, inner + maxLen, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  for (let i = 0; i < count; i += 1) {
    const a = start + (i / count) * Math.PI * 2
    const len = maxLen * (0.3 + rnd() * 0.7)
    const barW = width * (0.5 + rnd() * 1.2)
    const fill = color || (i % 2 === 0 ? p.colors[1] : p.colors[2])
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(a)
    ctx.fillStyle = withAlpha(fill, 0.55 + rnd() * 0.35)
    roundRect(ctx, inner, -barW / 2, len, barW, barW / 2)
    ctx.fill()
    ctx.restore()

    const tipX = cx + Math.cos(a) * (inner + len)
    const tipY = cy + Math.sin(a) * (inner + len)
    ctx.fillStyle = withAlpha(fill, 0.9)
    ctx.beginPath()
    ctx.arc(tipX, tipY, Math.max(1.5, barW * 0.6), 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = withAlpha(color || p.colors[2], 0.9)
  ctx.beginPath()
  ctx.arc(cx, cy, unit * 0.018, 0, Math.PI * 2)
  ctx.fill()
  finish(ctx, w, h, p, rnd)
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  rnd: () => number,
) {
  base(ctx, w, h, p)
  const side = Math.min(w, h) * 0.82
  const ox = (w - side) / 2
  const oy = (h - side) / 2
  const n = cfg.grid
  const cell = side / n

  glow(ctx, w / 2, h / 2, side * 0.8, p.colors[1], 0.18)

  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  roundRect(ctx, ox - cell * 0.6, oy - cell * 0.6, side + cell * 1.2, side + cell * 1.2, cell * 0.6)
  ctx.fill()
  ctx.restore()

  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < Math.ceil(n / 2); x += 1) {
      if (rnd() > 0.52) {
        ctx.fillStyle = rnd() > 0.5 ? p.colors[1] : p.colors[2]
        const cw = cell * 0.84
        const cx1 = ox + x * cell + cell * 0.08
        const cx2 = ox + (n - 1 - x) * cell + cell * 0.08
        const cy = oy + y * cell + cell * 0.08
        roundRect(ctx, cx1, cy, cw, cw, cw * 0.18)
        ctx.fill()
        if (x !== n - 1 - x) {
          roundRect(ctx, cx2, cy, cw, cw, cw * 0.18)
          ctx.fill()
        }
      }
    }
  }

  ctx.save()
  ctx.strokeStyle = withAlpha(p.colors[1], 0.35)
  ctx.lineWidth = Math.max(1, w * 0.002)
  roundRect(ctx, ox - 8, oy - 8, side + 16, side + 16, 14)
  ctx.stroke()
  ctx.restore()
  finish(ctx, w, h, p, rnd)
}

/* ---------------- render ---------------- */

function drawAsset(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const p = PALETTES[cfg.palette] ?? PALETTES[0]
  const rnd = mulberry32(
    hashString(
      `${cfg.kind}|${cfg.seed}|${cfg.palette}|${cfg.density}|${cfg.angle}|${cfg.grid}`,
    ),
  )
  const rad = (cfg.angle * Math.PI) / 180

  switch (cfg.kind) {
    case 'gradient':
      drawGradient(ctx, w, h, p, rnd)
      break
    case 'halftone':
      drawHalftone(ctx, w, h, p, rnd, rad)
      break
    case 'dots':
      drawDots(ctx, w, h, p, rnd)
      break
    case 'waves':
      drawWaves(ctx, w, h, p, rnd)
      break
    case 'stripes':
      drawStripes(ctx, w, h, p, rnd, rad)
      break
    case 'contour':
      if (terrain.mode === '3d') drawTerrain(ctx, w, h, p, rnd)
      else drawContour(ctx, w, h, p, rnd)
      break
    case 'concentric':
      drawConcentric(ctx, w, h, p, rnd)
      break
    case 'tickring':
      drawTickRing(ctx, w, h, p, rnd)
      break
    case 'mesh':
      drawMesh(ctx, w, h, p, rnd)
      break
    case 'nested':
      drawNested(ctx, w, h, p, rnd, rad)
      break
    case 'shapes':
      drawShapes(ctx, w, h, p, rnd)
      break
    case 'globe':
      drawGlobe(ctx, w, h, p, rnd, rad)
      break
    case 'grid':
      drawGrid(ctx, w, h, p, rnd)
      break
    case 'hud':
      drawHud(ctx, w, h, p, rnd)
      break
    case 'barcode':
      drawBarcode(ctx, w, h, p, rnd)
      break
    case 'rays':
      drawRays(ctx, w, h, p, rnd, rad)
      break
    case 'starring':
      drawStarring(ctx, w, h, p, rnd, rad)
      break
    case 'radial':
      drawRadial(ctx, w, h, p, rnd, rad)
      break
    case 'avatar':
      drawAvatar(ctx, w, h, p, rnd)
      break
  }
}

useCanvasPreview(
  canvasEl,
  () => previewSize.value,
  (ctx) => drawAsset(ctx, previewSize.value.width, previewSize.value.height),
)

const exporting = ref(false)

async function doExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    const { w, h } = size.value
    const scale = exportScale.value
    const ok = await exportCanvas(
      w,
      h,
      scale,
      (ctx) => drawAsset(ctx, w, h),
      `${cfg.kind}-${cfg.seed}-${w * scale}x${h * scale}.png`,
    )
    toast(ok ? `已导出 ${w * scale}×${h * scale} PNG` : '导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const svgExporting = ref(false)

async function doExportSvg() {
  if (svgExporting.value) return
  svgExporting.value = true
  svgMode = true
  try {
    const { w, h } = size.value
    const ctx = new SvgContext(w, h)
    drawAsset(ctx as unknown as CanvasRenderingContext2D, w, h)
    const svg = ctx.toSvg()
    downloadBlob(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${cfg.kind}-${cfg.seed}-${w}x${h}.svg`,
    )
    toast('已导出 SVG · 矢量')
  } catch (error) {
    console.error(error)
    toast('SVG 导出失败')
  } finally {
    svgMode = false
    svgExporting.value = false
  }
}

function setKind(kind: Kind) {
  cfg.kind = kind
  if (kind === 'avatar') cfg.size = 'square'
}

function shuffle() {
  cfg.seed = randomSeed()
}

function reset() {
  cfg.kind = 'gradient'
  cfg.palette = 0
  cfg.size = 'wide'
  cfg.seed = 'aurora-0721'
  cfg.density = 6
  cfg.angle = 0
  cfg.grain = true
  cfg.grid = 12
}
</script>

<template>
  <div class="view">
    <header class="view-toolbar">
      <div class="view-title">
        <span class="view-kicker">TOOL 06</span>
        <strong>素材生成</strong>
      </div>
      <span class="view-sub">{{ size.w }} × {{ size.h }} · {{ GEN_LIST.length }} 种图样 · 同种子可复现</span>

      <div class="toolbar-actions">
        <select v-model.number="exportScale" class="size-select" title="导出倍率">
          <option :value="1">1×</option>
          <option :value="2">2×</option>
          <option :value="3">3×</option>
        </select>
        <button class="ghost-btn" @click="collapsed = !collapsed">
          {{ collapsed ? '展开面板' : '收起面板' }}
        </button>
        <button class="ghost-btn" @click="reset">重置</button>
        <button class="ghost-btn" @click="shuffle">
          <Icon name="shuffle" :size="14" />
          换一批
        </button>
        <button class="ghost-btn" :disabled="svgExporting" @click="doExportSvg">
          导出 SVG
        </button>
        <button class="primary-btn" :disabled="exporting" @click="doExport">
          <Icon name="download" :size="16" />
          {{ exporting ? '导出中…' : '导出 PNG' }}
        </button>
      </div>
    </header>

    <div class="view-body" :class="{ collapsed }">
      <aside class="panel">
        <div class="panel-scroll">
          <div class="field">
            <div class="field-row">
              <span class="label">生成器</span>
              <span class="chip">{{ currentGen.label }}</span>
            </div>
            <div class="gen-groups">
              <div v-for="group in GEN_GROUPS" :key="group.name" class="gen-group">
                <span class="gen-title">{{ group.name }}</span>
                <div class="gen-grid">
                  <button
                    v-for="gen in group.items"
                    :key="gen.id"
                    class="gen-chip"
                    :class="{ active: cfg.kind === gen.id }"
                    @click="setKind(gen.id)"
                  >
                    {{ gen.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <template v-if="cfg.kind === 'concentric'">
              <div class="field">
                <div class="field-row">
                  <span class="label">圆数量</span>
                  <input
                    v-model.number="geo.count"
                    class="num"
                    type="number"
                    min="1"
                    max="100"
                  />
                </div>
                <input
                  v-model.number="geo.count"
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                />
              </div>

              <div class="field-row two">
                <div class="field">
                  <div class="field-row">
                    <span class="label">最小半径</span>
                    <input
                      v-model.number="geo.minR"
                      class="num"
                      type="number"
                      min="0"
                      max="2000"
                    />
                  </div>
                  <input
                    v-model.number="geo.minR"
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                  />
                </div>
                <div class="field">
                  <div class="field-row">
                    <span class="label">最大半径</span>
                    <input
                      v-model.number="geo.maxR"
                      class="num"
                      type="number"
                      min="0"
                      max="2000"
                    />
                  </div>
                  <input
                    v-model.number="geo.maxR"
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                  />
                </div>
              </div>

              <div class="field-row two">
                <div class="field">
                  <div class="field-row">
                    <span class="label">最内圈描边</span>
                    <input
                      v-model.number="geo.innerStroke"
                      class="num"
                      type="number"
                      min="0.1"
                      max="30"
                      step="0.1"
                    />
                  </div>
                  <input
                    v-model.number="geo.innerStroke"
                    type="range"
                    min="0.1"
                    max="30"
                    step="0.1"
                  />
                </div>
                <div class="field">
                  <div class="field-row">
                    <span class="label">最外圈描边</span>
                    <input
                      v-model.number="geo.outerStroke"
                      class="num"
                      type="number"
                      min="0"
                      max="30"
                      step="0.1"
                    />
                  </div>
                  <input
                    v-model.number="geo.outerStroke"
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                  />
                </div>
              </div>

              <div class="field-row two">
                <div class="field">
                  <div class="field-row">
                    <span class="label">起始角度</span>
                    <span class="hint">{{ geo.start }}°</span>
                  </div>
                  <input
                    v-model.number="geo.start"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                  />
                </div>
                <div class="field">
                  <div class="field-row">
                    <span class="label">绘制角度</span>
                    <span class="hint">{{ geo.sweep }}°</span>
                  </div>
                  <input
                    v-model.number="geo.sweep"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                  />
                </div>
              </div>

              <div class="field">
                <span class="label">线条类型</span>
                <div class="seg small">
                  <button
                    v-for="item in LINE_STYLES"
                    :key="item.id"
                    :class="{ active: geo.lineStyle === item.id }"
                    @click="geo.lineStyle = item.id"
                  >
                    {{ item.label }}
                  </button>
                </div>
              </div>

              <div v-if="geo.lineStyle !== 'solid'" class="field-row two">
                <div class="field">
                  <div class="field-row">
                    <span class="label">虚线长度</span>
                    <span class="hint">{{ geo.dash }}</span>
                  </div>
                  <input
                    v-model.number="geo.dash"
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                  />
                </div>
                <div class="field">
                  <div class="field-row">
                    <span class="label">虚线间隔</span>
                    <span class="hint">{{ geo.gap }}</span>
                  </div>
                  <input
                    v-model.number="geo.gap"
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                  />
                </div>
              </div>

              <div class="field-row two">
                <div class="field">
                  <span class="label">描边颜色</span>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="geo.stroke || activePalette.colors[1]"
                      @input="geo.stroke = ($event.target as HTMLInputElement).value"
                    />
                    <button class="link-btn" @click="geo.stroke = ''">跟随配色</button>
                  </div>
                  <span class="hex">{{ geo.stroke || activePalette.colors[1] }}</span>
                </div>
                <div class="field">
                  <span class="label">背景颜色</span>
                  <div class="color-row">
                    <input
                      type="color"
                      :value="geo.bg || activePalette.colors[0]"
                      @input="geo.bg = ($event.target as HTMLInputElement).value"
                    />
                    <button class="link-btn" @click="geo.bg = ''">跟随配色</button>
                  </div>
                  <span class="hex">{{ geo.bg || activePalette.colors[0] }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'hud'">
              <div class="field">
                <div class="field-row"><span class="label">线条数量</span><input v-model.number="hudCfg.lines" class="num" type="number" min="1" max="60" /></div>
                <input v-model.number="hudCfg.lines" type="range" min="1" max="60" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">线长比例</span><span class="hint">{{ hudCfg.length.toFixed(2) }}</span></div>
                <input v-model.number="hudCfg.length" type="range" min="0.02" max="0.9" step="0.01" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">角标大小</span><span class="hint">{{ hudCfg.bracket.toFixed(3) }}</span></div>
                <input v-model.number="hudCfg.bracket" type="range" min="0.01" max="0.14" step="0.005" />
              </div>
              <div class="field-row">
                <span class="label">显示数据标签</span>
                <button class="switch" :class="{ on: hudCfg.labels }" @click="hudCfg.labels = !hudCfg.labels" />
              </div>
              <div class="field-row">
                <span class="label">辅助网格</span>
                <button class="switch" :class="{ on: hudCfg.grid }" @click="hudCfg.grid = !hudCfg.grid" />
              </div>
              <div class="field">
                <span class="label">边框样式</span>
                <div class="seg small">
                  <button :class="{ active: hudCfg.frame === 'corner' }" @click="hudCfg.frame = 'corner'">角标</button>
                  <button :class="{ active: hudCfg.frame === 'bracket' }" @click="hudCfg.frame = 'bracket'">方括号</button>
                  <button :class="{ active: hudCfg.frame === 'dashed' }" @click="hudCfg.frame = 'dashed'">虚线</button>
                  <button :class="{ active: hudCfg.frame === 'none' }" @click="hudCfg.frame = 'none'">无</button>
                </div>
              </div>
              <div class="field-row">
                <span class="label">线条箭头</span>
                <button class="switch" :class="{ on: hudCfg.arrows }" @click="hudCfg.arrows = !hudCfg.arrows" />
              </div>
              <div v-if="hudCfg.arrows" class="field">
                <div class="field-row"><span class="label">箭头大小</span><span class="hint">{{ hudCfg.arrowSize }}</span></div>
                <input v-model.number="hudCfg.arrowSize" type="range" min="4" max="40" step="1" />
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="hudCfg.color" type="color" />
                  <button class="link-btn" @click="hudCfg.color = ''">跟随配色</button>
                </div>
              </div>
              <div class="field">
                <span class="label">背景颜色</span>
                <div class="color-row">
                  <input v-model="hudCfg.bg" type="color" />
                  <button class="link-btn" @click="hudCfg.bg = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'shapes'">
              <div class="field-row">
                <span class="label">图形编辑</span>
                <button class="soft-btn" @click="shapeState.edit = !shapeState.edit">
                  {{ shapeState.edit ? '结束编辑' : '开始编辑' }}
                </button>
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="clearShapes">清空</button>
                <button class="soft-btn" @click="fillShapes">填满</button>
                <button class="soft-btn" @click="seedShapes">随机</button>
              </div>
              <div class="field">
                <span class="label">当前图形</span>
                <div class="seg small">
                  <button
                    v-for="kind in SHAPE_KINDS"
                    :key="kind"
                    :class="{ active: shapeState.brush === kind }"
                    @click="shapeState.brush = kind"
                  >
                    {{ SHAPE_LABELS[kind] }}
                  </button>
                </div>
              </div>
              <div class="field">
                <span class="label">自定义图形</span>
                <div class="btn-row">
                  <button class="soft-btn" @click="shapeImageInput?.click()">{{ shapeState.image ? '更换图片' : '上传 PNG / SVG' }}</button>
                  <button v-if="shapeState.image" class="soft-btn" @click="shapeState.image = ''">移除</button>
                </div>
                <div v-if="shapeState.image" class="thumb-sm"><img :src="shapeState.image" alt="" /></div>
              </div>
              <div class="field-row">
                <span class="label">擦除模式</span>
                <button class="switch" :class="{ on: shapeState.erase }" @click="shapeState.erase = !shapeState.erase" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">列数</span><input v-model.number="shapeState.cols" class="num" type="number" min="1" max="16" /></div>
                  <input v-model.number="shapeState.cols" type="range" min="1" max="16" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">行数</span><input v-model.number="shapeState.rows" class="num" type="number" min="1" max="12" /></div>
                  <input v-model.number="shapeState.rows" type="range" min="1" max="12" step="1" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">图形大小</span><span class="hint">{{ shapeState.size.toFixed(2) }}</span></div>
                <input v-model.number="shapeState.size" type="range" min="0.05" max="0.5" step="0.01" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">描边宽度</span><span class="hint">{{ shapeState.width.toFixed(1) }}</span></div>
                <input v-model.number="shapeState.width" type="range" min="0.3" max="5" step="0.1" />
              </div>
              <div class="field">
                <span class="label">图形颜色</span>
                <div class="color-row">
                  <input v-model="shapeState.color" type="color" />
                  <button class="link-btn" @click="shapeState.color = ''">跟随配色</button>
                </div>
              </div>
              <p class="tip">点击画布放置当前图形；按住拖动连续绘制，擦除模式可连续删除。</p>
            </template>

            <template v-else-if="cfg.kind === 'contour'">
              <div class="field">
                <span class="label">等高线模式</span>
                <div class="seg">
                  <button :class="{ active: terrain.mode === '2d' }" @click="terrain.mode = '2d'">平面纹理</button>
                  <button :class="{ active: terrain.mode === '3d' }" @click="terrain.mode = '3d'">3D 地形</button>
                </div>
              </div>

              <template v-if="terrain.mode === '2d'">
                <div class="field">
                  <div class="field-row"><span class="label">等高线层数</span><input v-model.number="contourCfg.levels" class="num" type="number" min="2" max="40" /></div>
                  <input v-model.number="contourCfg.levels" type="range" min="2" max="40" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">起伏</span><span class="hint">{{ contourCfg.wobble.toFixed(2) }}</span></div>
                  <input v-model.number="contourCfg.wobble" type="range" min="0.01" max="0.5" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">线宽</span><span class="hint">{{ contourCfg.width.toFixed(1) }}</span></div>
                  <input v-model.number="contourCfg.width" type="range" min="0.3" max="4" step="0.1" />
                </div>
                <div class="field">
                  <span class="label">线条颜色</span>
                  <div class="color-row">
                    <input v-model="contourCfg.color" type="color" />
                    <button class="link-btn" @click="contourCfg.color = ''">跟随配色</button>
                  </div>
                </div>
                <div class="field">
                  <span class="label">带状填充</span>
                  <div class="seg small">
                    <button :class="{ active: contourCfg.fill === 'none' }" @click="contourCfg.fill = 'none'">无</button>
                    <button :class="{ active: contourCfg.fill === 'solid' }" @click="contourCfg.fill = 'solid'">纯色</button>
                    <button :class="{ active: contourCfg.fill === 'dots' }" @click="contourCfg.fill = 'dots'">点阵</button>
                    <button :class="{ active: contourCfg.fill === 'hatch' }" @click="contourCfg.fill = 'hatch'">斜线</button>
                  </div>
                </div>
                <template v-if="contourCfg.fill !== 'none'">
                  <div class="field">
                    <div class="field-row"><span class="label">填充不透明度</span><span class="hint">{{ Math.round(contourCfg.fillOpacity * 100) }}%</span></div>
                    <input v-model.number="contourCfg.fillOpacity" type="range" min="0" max="0.8" step="0.01" />
                  </div>
                  <div class="field">
                    <span class="label">填充颜色</span>
                    <div class="color-row">
                      <input v-model="contourCfg.fillColor" type="color" />
                      <button class="link-btn" @click="contourCfg.fillColor = ''">跟随配色</button>
                    </div>
                  </div>
                </template>
              </template>

              <template v-else>
                <div class="field">
                  <div class="field-row"><span class="label">等高线层数</span><input v-model.number="terrain.levels" class="num" type="number" min="2" max="40" /></div>
                  <input v-model.number="terrain.levels" type="range" min="2" max="40" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">地形高度</span><span class="hint">{{ terrain.heightScale.toFixed(2) }}</span></div>
                  <input v-model.number="terrain.heightScale" type="range" min="0.3" max="2.5" step="0.05" />
                </div>
                <div class="field-row two">
                  <div class="field">
                    <div class="field-row"><span class="label">旋转</span><span class="hint">{{ terrain.yaw.toFixed(2) }}</span></div>
                    <input v-model.number="terrain.yaw" type="range" min="-3.14" max="3.14" step="0.01" />
                  </div>
                  <div class="field">
                    <div class="field-row"><span class="label">俯仰</span><span class="hint">{{ terrain.pitch.toFixed(2) }}</span></div>
                    <input v-model.number="terrain.pitch" type="range" min="0.12" max="1.35" step="0.01" />
                  </div>
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">缩放</span><span class="hint">{{ terrain.zoom.toFixed(2) }}</span></div>
                  <input v-model.number="terrain.zoom" type="range" min="0.4" max="2" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">雕刻强度</span><span class="hint">{{ terrain.brush.toFixed(2) }}</span></div>
                  <input v-model.number="terrain.brush" type="range" min="0.01" max="0.2" step="0.01" />
                </div>
                <div class="btn-row">
                  <button class="soft-btn" @click="randomTerrain">随机地形</button>
                  <button class="soft-btn" @click="generateTerrain">重置地形</button>
                </div>
                <p class="tip">拖动旋转视角；Shift + 拖动抬高地形，Alt 降低；参数和雕刻结果都会进入导出。</p>
              </template>
            </template>

            <template v-else-if="cfg.kind === 'shapes'">
              <div class="field-row">
                <span class="label">图形编辑</span>
                <button class="soft-btn" @click="shapeState.edit = !shapeState.edit">
                  {{ shapeState.edit ? '结束编辑' : '开始编辑' }}
                </button>
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="clearShapes">清空</button>
                <button class="soft-btn" @click="fillShapes">填满</button>
                <button class="soft-btn" @click="seedShapes">随机</button>
              </div>
              <div class="field">
                <span class="label">当前图形</span>
                <div class="seg small">
                  <button
                    v-for="kind in SHAPE_KINDS"
                    :key="kind"
                    :class="{ active: shapeState.brush === kind }"
                    @click="shapeState.brush = kind"
                  >
                    {{ SHAPE_LABELS[kind] }}
                  </button>
                </div>
              </div>
              <div class="field-row">
                <span class="label">擦除模式</span>
                <button class="switch" :class="{ on: shapeState.erase }" @click="shapeState.erase = !shapeState.erase" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">列数</span><input v-model.number="shapeState.cols" class="num" type="number" min="1" max="16" /></div>
                  <input v-model.number="shapeState.cols" type="range" min="1" max="16" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">行数</span><input v-model.number="shapeState.rows" class="num" type="number" min="1" max="12" /></div>
                  <input v-model.number="shapeState.rows" type="range" min="1" max="12" step="1" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">图形大小</span><span class="hint">{{ shapeState.size.toFixed(2) }}</span></div>
                <input v-model.number="shapeState.size" type="range" min="0.05" max="0.5" step="0.01" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">描边宽度</span><span class="hint">{{ shapeState.width.toFixed(1) }}</span></div>
                <input v-model.number="shapeState.width" type="range" min="0.3" max="5" step="0.1" />
              </div>
              <div class="field">
                <span class="label">图形颜色</span>
                <div class="color-row">
                  <input v-model="shapeState.color" type="color" />
                  <button class="link-btn" @click="shapeState.color = ''">跟随配色</button>
                </div>
              </div>
              <p class="tip">点击画布放置当前图形；按住拖动连续绘制，擦除模式可连续删除。</p>
            </template>

            <template v-else-if="cfg.kind === 'contour'">
              <div class="field">
                <div class="field-row"><span class="label">等高线层数</span><input v-model.number="contourCfg.levels" class="num" type="number" min="2" max="40" /></div>
                <input v-model.number="contourCfg.levels" type="range" min="2" max="40" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">起伏</span><span class="hint">{{ contourCfg.wobble.toFixed(2) }}</span></div>
                <input v-model.number="contourCfg.wobble" type="range" min="0.01" max="0.5" step="0.01" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">线宽</span><span class="hint">{{ contourCfg.width.toFixed(1) }}</span></div>
                <input v-model.number="contourCfg.width" type="range" min="0.3" max="4" step="0.1" />
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="contourCfg.color" type="color" />
                  <button class="link-btn" @click="contourCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'dots'">
              <div class="field-row">
                <span class="label">点阵编辑</span>
                <button class="soft-btn" @click="dotState.edit = !dotState.edit">
                  {{ dotState.edit ? '结束编辑' : '开始编辑' }}
                </button>
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="clearDots">清空</button>
                <button class="soft-btn" @click="fillDots">填满</button>
                <button class="soft-btn" @click="seedDots">随机</button>
              </div>
              <div class="field-row">
                <span class="label">擦除模式</span>
                <button class="switch" :class="{ on: dotState.erase }" @click="dotState.erase = !dotState.erase" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">列数</span><input v-model.number="dotState.cols" class="num" type="number" min="2" max="80" /></div>
                  <input v-model.number="dotState.cols" type="range" min="2" max="80" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">行数</span><input v-model.number="dotState.rows" class="num" type="number" min="2" max="60" /></div>
                  <input v-model.number="dotState.rows" type="range" min="2" max="60" step="1" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">点大小</span><span class="hint">{{ dotsCfg.size.toFixed(2) }}</span></div>
                <input v-model.number="dotsCfg.size" type="range" min="0.03" max="0.45" step="0.01" />
              </div>
              <div class="field">
                <span class="label">点颜色</span>
                <div class="color-row">
                  <input v-model="dotsCfg.color" type="color" />
                  <button class="link-btn" @click="dotsCfg.color = ''">跟随配色</button>
                </div>
              </div>
              <div class="field">
                <span class="label">自定义点形状</span>
                <div class="btn-row">
                  <button class="soft-btn" @click="dotImageInput?.click()">
                    {{ dotsCfg.image ? '更换图片' : '上传 PNG / SVG' }}
                  </button>
                  <button v-if="dotsCfg.image" class="soft-btn" @click="dotsCfg.image = ''">移除</button>
                </div>
                <div v-if="dotsCfg.image" class="thumb-sm">
                  <img :src="dotsCfg.image" alt="" />
                </div>
                <p class="tip">上传后每个点会用这张图片绘制；SVG 导出会以内嵌图片保留。</p>
              </div>
              <div class="field">
                <span class="label">轮廓图片</span>
                <div class="btn-row">
                  <button class="soft-btn" @click="dotOutlineInput?.click()">
                    {{ dotsCfg.outline ? '更换轮廓' : '上传轮廓 PNG / SVG' }}
                  </button>
                  <button v-if="dotsCfg.outline" class="soft-btn" @click="dotsCfg.outline = ''">移除</button>
                </div>
                <div v-if="dotsCfg.outline" class="thumb-sm"><img :src="dotsCfg.outline" alt="" /></div>
                <div v-if="dotsCfg.outline" class="field-row">
                  <span class="label">轮廓缩放</span>
                  <span class="hint">{{ dotsCfg.outlineScale.toFixed(2) }}</span>
                </div>
                <input v-if="dotsCfg.outline" v-model.number="dotsCfg.outlineScale" type="range" min="0.2" max="3" step="0.01" />
                <p class="tip">透明度决定点的显隐：图片不透明处保留点，透明处留空。</p>
              </div>
              <p class="tip">点击画布增删点；按住左键拖动可连续绘制，开启擦除模式可连续擦除。</p>
            </template>

            <template v-else-if="cfg.kind === 'halftone'">
              <div class="field">
                <div class="field-row"><span class="label">网点间距</span><input v-model.number="halfCfg.gap" class="num" type="number" min="6" max="80" /></div>
                <input v-model.number="halfCfg.gap" type="range" min="6" max="80" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">网点大小</span><span class="hint">{{ halfCfg.scale.toFixed(2) }}</span></div>
                <input v-model.number="halfCfg.scale" type="range" min="0.05" max="1.2" step="0.01" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">旋转角度</span><span class="hint">{{ halfCfg.angle }}°</span></div>
                <input v-model.number="halfCfg.angle" type="range" min="0" max="360" step="1" />
              </div>
              <div class="field">
                <span class="label">网点颜色</span>
                <div class="color-row">
                  <input v-model="halfCfg.color" type="color" />
                  <button class="link-btn" @click="halfCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'mesh'">
              <div class="field">
                <span class="label">单元形状</span>
                <div class="seg small">
                  <button :class="{ active: meshCfg.shape === 'triangle' }" @click="meshCfg.shape = 'triangle'">三角</button>
                  <button :class="{ active: meshCfg.shape === 'hexagon' }" @click="meshCfg.shape = 'hexagon'">六边</button>
                  <button :class="{ active: meshCfg.shape === 'wedge' }" @click="meshCfg.shape = 'wedge'">楔形</button>
                  <button :class="{ active: meshCfg.shape === 'rect' }" @click="meshCfg.shape = 'rect'">矩形</button>
                </div>
              </div>
              <div class="field">
                <span class="label">绘制模式</span>
                <div class="seg">
                  <button :class="{ active: meshCfg.mode === 'toggle' }" @click="meshCfg.mode = 'toggle'">点选切换</button>
                  <button :class="{ active: meshCfg.mode === 'paint' }" @click="meshCfg.mode = 'paint'">按住绘制</button>
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">边长</span><input v-model.number="meshCfg.edge" class="num" type="number" min="8" max="160" /></div>
                <input v-model.number="meshCfg.edge" type="range" min="8" max="160" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">图形大小</span><span class="hint">{{ meshCfg.scale }}%</span></div>
                <input v-model.number="meshCfg.scale" type="range" min="10" max="120" step="1" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <span class="label">填充颜色</span>
                  <div class="color-row">
                    <input v-model="meshCfg.fillColor" type="color" />
                    <button class="link-btn" @click="meshCfg.fillColor = ''">跟随配色</button>
                  </div>
                </div>
                <div class="field">
                  <span class="label">描边颜色</span>
                  <div class="color-row">
                    <input v-model="meshCfg.strokeColor" type="color" />
                    <button class="link-btn" @click="meshCfg.strokeColor = ''">跟随配色</button>
                  </div>
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">描边宽度</span><span class="hint">{{ meshCfg.strokeWidth }}</span></div>
                <input v-model.number="meshCfg.strokeWidth" type="range" min="0" max="10" step="0.5" />
              </div>
              <div class="field">
                <span class="label">网格线颜色</span>
                <div class="color-row">
                  <input v-model="meshCfg.gridColor" type="color" />
                  <button class="link-btn" @click="meshCfg.gridColor = ''">跟随配色</button>
                </div>
              </div>
              <div class="field-row">
                <span class="label">显示网格线</span>
                <button class="switch" :class="{ on: meshCfg.showGrid }" @click="meshCfg.showGrid = !meshCfg.showGrid" />
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="meshState.cells = {}">清空填充</button>
              </div>
              <p class="tip">点选切换模式点击单元增删；按住绘制模式按住左键批量填充，擦除请切回点选模式。</p>
            </template>

            <template v-else-if="cfg.kind === 'nested'">
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">嵌套层数</span><input v-model.number="nestCfg.layers" class="num" type="number" min="2" max="40" /></div>
                  <input v-model.number="nestCfg.layers" type="range" min="2" max="40" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">边数</span><input v-model.number="nestCfg.sides" class="num" type="number" min="3" max="16" /></div>
                  <input v-model.number="nestCfg.sides" type="range" min="3" max="16" step="1" />
                </div>
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">最大半径</span><span class="hint">{{ nestCfg.radius.toFixed(2) }}</span></div>
                  <input v-model.number="nestCfg.radius" type="range" min="0.1" max="0.55" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">旋转步进</span><span class="hint">{{ nestCfg.spin.toFixed(2) }}</span></div>
                  <input v-model.number="nestCfg.spin" type="range" min="0" max="0.4" step="0.01" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">描边宽度</span><span class="hint">{{ nestCfg.width.toFixed(1) }}</span></div>
                <input v-model.number="nestCfg.width" type="range" min="0.3" max="5" step="0.1" />
              </div>
              <div class="field">
                <span class="label">描边颜色</span>
                <div class="color-row">
                  <input v-model="nestCfg.color" type="color" />
                  <button class="link-btn" @click="nestCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'grid'">
              <div class="field-row">
                <span class="label">网格编辑</span>
                <button class="soft-btn" @click="gridState.edit = !gridState.edit">
                  {{ gridState.edit ? '结束编辑' : '开始编辑' }}
                </button>
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="clearGrid">清空</button>
                <button class="soft-btn" @click="fillGrid">填满</button>
                <button class="soft-btn" @click="seedGrid">随机</button>
              </div>
              <div class="field-row">
                <span class="label">擦除模式</span>
                <button class="switch" :class="{ on: gridState.erase }" @click="gridState.erase = !gridState.erase" />
              </div>
              <div v-if="gridState.edit" class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">列数</span><input v-model.number="gridState.cols" class="num" type="number" min="2" max="24" /></div>
                  <input v-model.number="gridState.cols" type="range" min="2" max="24" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">行数</span><input v-model.number="gridState.rows" class="num" type="number" min="2" max="16" /></div>
                  <input v-model.number="gridState.rows" type="range" min="2" max="16" step="1" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">网格间距</span><input v-model.number="gridCfg.gap" class="num" type="number" min="16" max="220" /></div>
                <input v-model.number="gridCfg.gap" type="range" min="16" max="220" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">线宽</span><span class="hint">{{ gridCfg.width.toFixed(1) }}</span></div>
                <input v-model.number="gridCfg.width" type="range" min="0.3" max="4" step="0.1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">填充比例</span><span class="hint">{{ Math.round(gridCfg.fill * 100) }}%</span></div>
                <input v-model.number="gridCfg.fill" type="range" min="0" max="0.8" step="0.01" />
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="gridCfg.color" type="color" />
                  <button class="link-btn" @click="gridCfg.color = ''">跟随配色</button>
                </div>
              </div>
              <div class="field">
                <span class="label">背景颜色</span>
                <div class="color-row">
                  <input v-model="gridCfg.bg" type="color" />
                  <button class="link-btn" @click="gridCfg.bg = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'rays'">
              <div class="field">
                <div class="field-row"><span class="label">射线数量</span><input v-model.number="raysCfg.count" class="num" type="number" min="3" max="180" /></div>
                <input v-model.number="raysCfg.count" type="range" min="3" max="180" step="1" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">起始角度</span><span class="hint">{{ raysCfg.start }}°</span></div>
                  <input v-model.number="raysCfg.start" type="range" min="0" max="360" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">扇形跨度</span><span class="hint">{{ raysCfg.spread }}°</span></div>
                  <input v-model.number="raysCfg.spread" type="range" min="10" max="360" step="1" />
                </div>
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">内半径</span><span class="hint">{{ raysCfg.inner.toFixed(2) }}</span></div>
                  <input v-model.number="raysCfg.inner" type="range" min="0" max="0.4" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">外半径</span><span class="hint">{{ raysCfg.outer.toFixed(2) }}</span></div>
                  <input v-model.number="raysCfg.outer" type="range" min="0.15" max="1.4" step="0.01" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">射线强度</span><span class="hint">{{ raysCfg.alpha.toFixed(2) }}</span></div>
                <input v-model.number="raysCfg.alpha" type="range" min="0.02" max="0.35" step="0.01" />
              </div>
              <div class="field">
                <span class="label">射线颜色</span>
                <div class="color-row">
                  <input v-model="raysCfg.color" type="color" />
                  <button class="link-btn" @click="raysCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'starring'">
              <div class="field">
                <div class="field-row"><span class="label">星星数量</span><input v-model.number="starCfg.count" class="num" type="number" min="3" max="60" /></div>
                <input v-model.number="starCfg.count" type="range" min="3" max="60" step="1" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">星环半径</span><span class="hint">{{ starCfg.radius.toFixed(2) }}</span></div>
                  <input v-model.number="starCfg.radius" type="range" min="0.1" max="0.5" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">星星大小</span><span class="hint">{{ starCfg.size.toFixed(3) }}</span></div>
                  <input v-model.number="starCfg.size" type="range" min="0.004" max="0.04" step="0.001" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">旋转角度</span><span class="hint">{{ starCfg.angle }}°</span></div>
                <input v-model.number="starCfg.angle" type="range" min="0" max="360" step="1" />
              </div>
              <div class="field">
                <span class="label">星星颜色</span>
                <div class="color-row">
                  <input v-model="starCfg.color" type="color" />
                  <button class="link-btn" @click="starCfg.color = ''">跟随配色</button>
                </div>
              </div>
              <div class="field">
                <span class="label">自定义星形</span>
                <div class="btn-row">
                  <button class="soft-btn" @click="starImageInput?.click()">{{ starCfg.image ? '更换图片' : '上传 PNG / SVG' }}</button>
                  <button v-if="starCfg.image" class="soft-btn" @click="starCfg.image = ''">移除</button>
                </div>
                <div v-if="starCfg.image" class="thumb-sm"><img :src="starCfg.image" alt="" /></div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'radial'">
              <div class="field">
                <div class="field-row"><span class="label">元素数量</span><input v-model.number="radialCfg.count" class="num" type="number" min="3" max="120" /></div>
                <input v-model.number="radialCfg.count" type="range" min="3" max="120" step="1" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">内半径</span><span class="hint">{{ radialCfg.inner.toFixed(2) }}</span></div>
                  <input v-model.number="radialCfg.inner" type="range" min="0.02" max="0.4" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">长度</span><span class="hint">{{ radialCfg.length.toFixed(2) }}</span></div>
                  <input v-model.number="radialCfg.length" type="range" min="0.03" max="0.6" step="0.01" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">元素宽度</span><span class="hint">{{ radialCfg.width.toFixed(3) }}</span></div>
                <input v-model.number="radialCfg.width" type="range" min="0.002" max="0.06" step="0.002" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">旋转角度</span><span class="hint">{{ radialCfg.angle }}°</span></div>
                <input v-model.number="radialCfg.angle" type="range" min="0" max="360" step="1" />
              </div>
              <div class="field">
                <span class="label">元素颜色</span>
                <div class="color-row">
                  <input v-model="radialCfg.color" type="color" />
                  <button class="link-btn" @click="radialCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'waves'">
              <div class="field">
                <div class="field-row"><span class="label">波浪层数</span><input v-model.number="waveCfg.layers" class="num" type="number" min="2" max="40" /></div>
                <input v-model.number="waveCfg.layers" type="range" min="2" max="40" step="1" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">振幅</span><span class="hint">{{ waveCfg.amp.toFixed(3) }}</span></div>
                  <input v-model.number="waveCfg.amp" type="range" min="0.005" max="0.15" step="0.005" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">频率</span><span class="hint">{{ waveCfg.freq.toFixed(1) }}</span></div>
                  <input v-model.number="waveCfg.freq" type="range" min="0.2" max="6" step="0.1" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">线条宽度</span><span class="hint">{{ waveCfg.width.toFixed(1) }}</span></div>
                <input v-model.number="waveCfg.width" type="range" min="0.4" max="5" step="0.1" />
              </div>
              <div class="field">
                <span class="label">线条类型</span>
                <div class="seg small">
                  <button v-for="item in LINE_STYLES" :key="item.id" :class="{ active: waveCfg.dash === item.id }" @click="waveCfg.dash = item.id">{{ item.label }}</button>
                </div>
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="waveCfg.color" type="color" />
                  <button class="link-btn" @click="waveCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'stripes'">
              <div class="field">
                <div class="field-row"><span class="label">线条数量</span><input v-model.number="stripeCfg.count" class="num" type="number" min="4" max="120" /></div>
                <input v-model.number="stripeCfg.count" type="range" min="4" max="120" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">线条宽度</span><span class="hint">{{ stripeCfg.widthRatio.toFixed(2) }}</span></div>
                <input v-model.number="stripeCfg.widthRatio" type="range" min="0.05" max="0.95" step="0.01" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">旋转角度</span><span class="hint">{{ stripeCfg.angle }}°</span></div>
                <input v-model.number="stripeCfg.angle" type="range" min="0" max="360" step="1" />
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="stripeCfg.color" type="color" />
                  <button class="link-btn" @click="stripeCfg.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'barcode'">
              <div class="field">
                <div class="field-row"><span class="label">条形数量</span><input v-model.number="barcode.bars" class="num" type="number" min="10" max="220" /></div>
                <input v-model.number="barcode.bars" type="range" min="10" max="220" step="1" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">宽度比例</span><span class="hint">{{ barcode.width.toFixed(2) }}</span></div>
                  <input v-model.number="barcode.width" type="range" min="0.2" max="0.95" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">高度比例</span><span class="hint">{{ barcode.height.toFixed(2) }}</span></div>
                  <input v-model.number="barcode.height" type="range" min="0.08" max="0.6" step="0.01" />
                </div>
              </div>
              <div class="field-row two">
                <div class="field">
                  <span class="label">条码颜色</span>
                  <div class="color-row">
                    <input v-model="barcode.color" type="color" />
                    <button class="link-btn" @click="barcode.color = ''">跟随配色</button>
                  </div>
                </div>
                <div class="field">
                  <span class="label">背景颜色</span>
                  <div class="color-row">
                    <input v-model="barcode.bg" type="color" />
                    <button class="link-btn" @click="barcode.bg = ''">跟随配色</button>
                  </div>
                </div>
              </div>
              <div class="field-row">
                <span class="label">显示编号</span>
                <button class="switch" :class="{ on: barcode.showText }" @click="barcode.showText = !barcode.showText" />
              </div>
            </template>

            <template v-else-if="cfg.kind === 'globe'">
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">长轴（垂直）</span><span class="hint">{{ globe.ry.toFixed(2) }}</span></div>
                  <input v-model.number="globe.ry" type="range" min="0.1" max="0.5" step="0.01" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">短轴（水平）</span><span class="hint">{{ globe.rx.toFixed(2) }}</span></div>
                  <input v-model.number="globe.rx" type="range" min="0.1" max="0.5" step="0.01" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">经线数量</span><span class="hint">{{ globe.meridians }}</span></div>
                <input v-model.number="globe.meridians" type="range" min="2" max="40" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">纬线数量</span><span class="hint">{{ globe.parallels }}</span></div>
                <input v-model.number="globe.parallels" type="range" min="1" max="20" step="1" />
              </div>
              <div class="field">
                <div class="field-row"><span class="label">倾斜</span><span class="hint">{{ globe.tilt.toFixed(2) }}</span></div>
                <input v-model.number="globe.tilt" type="range" min="-0.6" max="0.6" step="0.02" />
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="globe.color" type="color" />
                  <button class="link-btn" @click="globe.color = ''">跟随配色</button>
                </div>
              </div>
            </template>

            <template v-else-if="cfg.kind === 'tickring'">
              <div class="field">
                <div class="field-row">
                  <span class="label">刻度数量</span>
                  <input v-model.number="tick.count" class="num" type="number" min="3" max="360" />
                </div>
                <input v-model.number="tick.count" type="range" min="3" max="360" step="1" />
              </div>
              <div class="field">
                <div class="field-row">
                  <span class="label">半径比例</span>
                  <span class="hint">{{ tick.radius.toFixed(2) }}</span>
                </div>
                <input v-model.number="tick.radius" type="range" min="0.15" max="0.46" step="0.01" />
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">起始角度</span><span class="hint">{{ tick.start }}°</span></div>
                  <input v-model.number="tick.start" type="range" min="-180" max="180" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">圆弧跨度</span><span class="hint">{{ tick.sweep }}°</span></div>
                  <input v-model.number="tick.sweep" type="range" min="10" max="360" step="1" />
                </div>
              </div>
              <div class="field-row two">
                <div class="field">
                  <div class="field-row"><span class="label">主刻度间隔</span><span class="hint">每 {{ tick.majorEvery }} 格</span></div>
                  <input v-model.number="tick.majorEvery" type="range" min="1" max="20" step="1" />
                </div>
                <div class="field">
                  <div class="field-row"><span class="label">主刻度倍率</span><span class="hint">{{ tick.majorScale.toFixed(1) }}×</span></div>
                  <input v-model.number="tick.majorScale" type="range" min="0.5" max="4" step="0.1" />
                </div>
              </div>
              <div class="field">
                <div class="field-row"><span class="label">线条宽度</span><span class="hint">{{ tick.width.toFixed(1) }}</span></div>
                <input v-model.number="tick.width" type="range" min="0.2" max="5" step="0.1" />
              </div>
              <div class="field">
                <span class="label">线条颜色</span>
                <div class="color-row">
                  <input v-model="tick.color" type="color" />
                  <button class="link-btn" @click="tick.color = ''">跟随配色</button>
                </div>
              </div>
            </template>
            <template v-else-if="cfg.kind === 'avatar'">
              <div class="field">
                <div class="field-row">
                  <span class="label">网格</span>
                  <span class="hint">{{ cfg.grid }} × {{ cfg.grid }}</span>
                </div>
                <input
                  v-model.number="cfg.grid"
                  type="range"
                  min="6"
                  max="18"
                  step="1"
                />
              </div>
            </template>

            <template v-else>
              <div class="field">
                <div class="field-row">
                  <span class="label">{{ currentGen.densityLabel }}</span>
                  <span class="hint">{{ cfg.density }}</span>
                </div>
                <input
                  v-model.number="cfg.density"
                  type="range"
                  min="2"
                  max="14"
                  step="1"
                />
              </div>

              <div v-if="currentGen.angle" class="field">
                <div class="field-row">
                  <span class="label">旋转角度</span>
                  <span class="hint">{{ cfg.angle }}°</span>
                </div>
                <input
                  v-model.number="cfg.angle"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                />
              </div>
            </template>

            <template v-if="cfg.kind !== 'concentric'">
              <div
                v-for="item in currentExtras"
                :key="item.key"
                class="field"
              >
                <div class="field-row">
                  <span class="label">{{ item.label }}</span>
                  <span class="hint">{{ extraValues[cfg.kind][item.key] }}</span>
                </div>
                <input
                  v-model.number="extraValues[cfg.kind][item.key]"
                  type="range"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step"
                />
              </div>
            </template>

            <div v-if="cfg.kind !== 'concentric'" class="field-row">
              <span class="label">颗粒质感</span>
              <button
                class="switch"
                :class="{ on: cfg.grain }"
                @click="cfg.grain = !cfg.grain"
              />
            </div>
          </div>

          <div class="field">
            <span class="label">调色板</span>
            <div class="palette-grid">
              <button
                v-for="(p, i) in PALETTES"
                :key="p.name"
                class="palette-btn"
                :class="{ active: cfg.palette === i }"
                @click="cfg.palette = i"
              >
                <span
                  class="strip"
                  :style="{
                    background: `linear-gradient(90deg, ${p.colors[0]}, ${p.colors[1]}, ${p.colors[2]}, ${p.colors[3]})`,
                  }"
                />
                <span class="palette-name">{{ p.name }}</span>
              </button>
            </div>
          </div>

          <div class="field">
            <span class="label">尺寸</span>
            <select v-model="cfg.size" class="size-select full">
              <option v-for="s in SIZES" :key="s.id" :value="s.id">
                {{ s.label }}
              </option>
            </select>
          </div>

          <div class="field">
            <span class="label">种子</span>
            <div class="seed-row">
              <input v-model="cfg.seed" class="ti" spellcheck="false" />
              <button class="soft-btn" title="随机种子" @click="shuffle">
                <Icon name="shuffle" :size="14" />
              </button>
            </div>
          </div>

          <p class="tip">
            所有图样均由算法实时生成；同心圆支持完整参数与 SVG 矢量导出，其余图样也可一键导出 SVG。
          </p>
        </div>
      </aside>

      <div class="preview-stage asset-stage">
        <canvas
          ref="canvasEl"
          class="preview-canvas"
          :class="{ editing: (cfg.kind === 'dots' && dotState.edit) || (cfg.kind === 'shapes' && shapeState.edit) || (cfg.kind === 'grid' && gridState.edit) || (cfg.kind === 'contour' && terrain.mode === '3d') }"
          @pointerdown="onDotDown"
          @pointermove="onDotMove"
          @pointerup="onDotUp"
          @pointerleave="onDotUp"
        />
      </div>
    </div>
  </div>
<input ref="dotImageInput" type="file" accept="image/png,image/svg+xml" hidden @change="onDotImage" />
<input ref="starImageInput" type="file" accept="image/png,image/svg+xml" hidden @change="onStarImage" />
<input ref="shapeImageInput" type="file" accept="image/png,image/svg+xml" hidden @change="onShapeImage" />
<input ref="dotOutlineInput" type="file" accept="image/png,image/svg+xml" hidden @change="onDotOutline" />
</template>
