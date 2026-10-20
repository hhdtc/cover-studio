import { computed, reactive, ref, watch } from 'vue'
import type { Doc, ImageLayer, Layer, ShapeLayer, TextLayer } from './types'
import { createInitialDoc, uid } from './templates'
import { FONTS } from './fonts'

export const state = reactive<{ doc: Doc; selectedId: string | null }>({
  doc: createInitialDoc(),
  selectedId: null,
})

export const selected = computed<Layer | null>(
  () => state.doc.layers.find((l) => l.id === state.selectedId) ?? null,
)

export const selectedText = computed<TextLayer | null>(() =>
  selected.value && selected.value.kind === 'text'
    ? (selected.value as TextLayer)
    : null,
)

export function select(id: string | null) {
  state.selectedId = id
}

export function updateLayer(id: string, patch: Record<string, unknown>) {
  const layer = state.doc.layers.find((l) => l.id === id)
  if (layer) Object.assign(layer, patch)
}

export function addLayer(layer: Layer) {
  state.doc.layers.push(layer)
  state.selectedId = layer.id
}

export function removeLayer(id: string) {
  const index = state.doc.layers.findIndex((l) => l.id === id)
  if (index === -1) return
  state.doc.layers.splice(index, 1)
  if (state.selectedId === id) state.selectedId = null
}

export function removeSelected() {
  if (state.selectedId) removeLayer(state.selectedId)
}

export function toggleHidden(id: string) {
  const layer = state.doc.layers.find((l) => l.id === id)
  if (layer) layer.hidden = !layer.hidden
}

export function moveLayer(id: string, dir: -1 | 1) {
  const layers = state.doc.layers
  const index = layers.findIndex((l) => l.id === id)
  const next = index + dir
  if (index === -1 || next < 0 || next >= layers.length) return
  const [layer] = layers.splice(index, 1)
  layers.splice(next, 0, layer)
}

/* ---------------- history ---------------- */

const undoStack: string[] = []
const redoStack: string[] = []
const MAX_HISTORY = 60

export const canUndo = ref(false)
export const canRedo = ref(false)

let lastSnapshot = JSON.stringify(state.doc)
let timer: ReturnType<typeof setTimeout> | undefined
let restoring = false

function commit() {
  const snapshot = JSON.stringify(state.doc)
  if (snapshot === lastSnapshot) return
  undoStack.push(lastSnapshot)
  if (undoStack.length > MAX_HISTORY) undoStack.shift()
  redoStack.length = 0
  lastSnapshot = snapshot
  syncFlags()
}

function syncFlags() {
  canUndo.value = undoStack.length > 0
  canRedo.value = redoStack.length > 0
}

watch(
  () => state.doc,
  () => {
    if (restoring) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      commit()
    }, 320)
  },
  { deep: true },
)

function flush() {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
    commit()
  }
}

function applySnapshot(snapshot: string) {
  const doc = JSON.parse(snapshot) as Doc
  restoring = true
  state.doc = doc
  lastSnapshot = snapshot
  if (state.selectedId && !doc.layers.some((l) => l.id === state.selectedId)) {
    state.selectedId = null
  }
  requestAnimationFrame(() => {
    restoring = false
  })
  syncFlags()
}

export function undo() {
  flush()
  if (!undoStack.length) return
  redoStack.push(lastSnapshot)
  const previous = undoStack.pop() as string
  applySnapshot(previous)
}

export function redo() {
  if (!redoStack.length) return
  flush()
  const next = redoStack.pop() as string
  undoStack.push(lastSnapshot)
  applySnapshot(next)
}

export function applyTemplate(doc: Doc) {
  flush()
  undoStack.push(lastSnapshot)
  if (undoStack.length > MAX_HISTORY) undoStack.shift()
  redoStack.length = 0
  restoring = true
  state.doc = doc
  state.selectedId = null
  lastSnapshot = JSON.stringify(doc)
  requestAnimationFrame(() => {
    restoring = false
  })
  syncFlags()
}

export function setDocSize(width: number, height: number) {
  state.doc.width = Math.round(width)
  state.doc.height = Math.round(height)
}

/* ---------------- layer factory ---------------- */

function averageColor(doc: Doc): string {
  if (doc.background.type === 'solid') return doc.background.color
  if (doc.background.type === 'gradient') {
    const parse = (hex: string) => {
      const v = hex.replace('#', '')
      return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
    }
    try {
      const a = parse(doc.background.from)
      const b = parse(doc.background.to)
      const mix = a.map((n, i) => Math.round((n + b[i]) / 2))
      return `#${mix.map((n) => n.toString(16).padStart(2, '0')).join('')}`
    } catch {
      return '#000000'
    }
  }
  return '#101114'
}

export function textOnBackground(doc: Doc): string {
  const hex = averageColor(doc)
  const v = hex.replace('#', '')
  if (v.length !== 6) return '#ffffff'
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#141414' : '#ffffff'
}

export function addText(kind: 'title' | 'subtitle' | 'body') {
  const doc = state.doc
  const width = Math.round(doc.width * 0.72)
  const x = Math.round((doc.width - width) / 2)
  const y = Math.round(doc.height * (kind === 'title' ? 0.36 : 0.54))
  const color = textOnBackground(doc)
  const common = {
    id: uid(),
    kind: 'text' as const,
    x,
    y,
    w: width,
    fontFamily: FONTS[0].value,
    color,
  }
  let layer: TextLayer
  if (kind === 'title') {
    layer = {
      ...common,
      name: '标题',
      text: '在这里输入标题',
      fontSize: Math.round(doc.height * 0.085),
      fontWeight: 800,
      lineHeight: 1.16,
      letterSpacing: 0,
      align: 'center',
    }
  } else if (kind === 'subtitle') {
    layer = {
      ...common,
      name: '副标题',
      text: '一句补充说明文字',
      fontSize: Math.round(doc.height * 0.038),
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 1,
      align: 'center',
    }
  } else {
    layer = {
      ...common,
      name: '正文',
      text: '在这里输入正文内容，支持换行与自动折行。',
      fontSize: Math.round(doc.height * 0.026),
      fontWeight: 400,
      lineHeight: 1.8,
      letterSpacing: 0.5,
      align: 'left',
    }
  }
  addLayer(layer)
}

export function addImageLayer(src: string) {
  const doc = state.doc
  const img = new Image()
  img.onload = () => {
    const maxW = doc.width * 0.5
    const maxH = doc.height * 0.5
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1)
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const layer: ImageLayer = {
      id: uid(),
      kind: 'image',
      name: '图片',
      x: Math.round((doc.width - w) / 2),
      y: Math.round((doc.height - h) / 2),
      w,
      h,
      src,
      fit: 'cover',
      radius: 0,
    }
    addLayer(layer)
  }
  img.src = src
}

export function addShape(shape: 'ellipse' | 'rect') {
  const doc = state.doc
  const size = Math.round(Math.min(doc.width, doc.height) * 0.24)
  const layer: ShapeLayer = {
    id: uid(),
    kind: 'shape',
    name: shape === 'ellipse' ? '圆形' : '矩形',
    shape,
    x: Math.round((doc.width - size) / 2),
    y: Math.round((doc.height - size) / 2),
    w: size,
    h: size,
    color: '#ff7a45',
    radius: shape === 'rect' ? 24 : 0,
    opacity: 0.9,
  }
  addLayer(layer)
}

export function duplicateSelected() {  const layer = selected.value
  if (!layer) return
  const copy = JSON.parse(JSON.stringify(layer)) as Layer
  copy.id = uid()
  copy.x += Math.round(state.doc.width * 0.02)
  copy.y += Math.round(state.doc.height * 0.02)
  if (copy.kind === 'text' && copy.name) copy.name = `${copy.name} 副本`
  addLayer(copy)
}

export function resetDoc() {
  applyTemplate(createInitialDoc())
}
