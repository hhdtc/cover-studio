<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { state, select } from '../store'
import { drawDoc, type Rect } from '../render'

const stage = ref<HTMLDivElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const layout = ref<Record<string, Rect>>({})
const scale = ref(0.5)
const dragging = ref(false)
const dpr = Math.min(window.devicePixelRatio || 1, 2)

let raf = 0
let observer: ResizeObserver | null = null
let drag: {
  id: string
  startX: number
  startY: number
  ox: number
  oy: number
} | null = null
let pointerId: number | null = null

const size = computed(() => ({
  width: Math.max(1, Math.round(state.doc.width * scale.value)),
  height: Math.max(1, Math.round(state.doc.height * scale.value)),
}))

const selectedRect = computed(() => {
  const id = state.selectedId
  return id ? (layout.value[id] ?? null) : null
})

const boxStyle = computed(() => {
  const r = selectedRect.value
  if (!r) return {}
  return {
    left: `${r.x * scale.value}px`,
    top: `${r.y * scale.value}px`,
    width: `${r.w * scale.value}px`,
    height: `${r.h * scale.value}px`,
  }
})

function schedule() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    paint()
  })
}

function paint() {
  const el = canvas.value
  if (!el) return
  const doc = state.doc
  const cssW = Math.max(1, Math.round(doc.width * scale.value))
  const cssH = Math.max(1, Math.round(doc.height * scale.value))
  const bw = Math.round(cssW * dpr)
  const bh = Math.round(cssH * dpr)
  if (el.width !== bw || el.height !== bh) {
    el.width = bw
    el.height = bh
  }
  const ctx = el.getContext('2d')
  if (!ctx) return
  ctx.setTransform((dpr * cssW) / doc.width, 0, 0, (dpr * cssH) / doc.height, 0, 0)
  layout.value = drawDoc(ctx, doc, schedule)
}

function fit() {
  const el = stage.value
  if (!el) return
  const doc = state.doc
  const padding = 88
  const availableW = Math.max(160, el.clientWidth - padding)
  const availableH = Math.max(160, el.clientHeight - padding)
  scale.value = Math.min(availableW / doc.width, availableH / doc.height, 1.15)
  schedule()
}

function toDoc(e: PointerEvent) {
  const el = canvas.value
  if (!el) return { x: 0, y: 0 }
  const r = el.getBoundingClientRect()
  return {
    x: ((e.clientX - r.left) / r.width) * state.doc.width,
    y: ((e.clientY - r.top) / r.height) * state.doc.height,
  }
}

function hit(p: { x: number; y: number }) {
  const layers = state.doc.layers
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i]
    if (layer.hidden) continue
    const r = layout.value[layer.id]
    if (!r) continue
    if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) {
      return layer
    }
  }
  return null
}

function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  const p = toDoc(e)
  const layer = hit(p)
  if (!layer) {
    select(null)
    return
  }
  select(layer.id)
  drag = {
    id: layer.id,
    startX: p.x,
    startY: p.y,
    ox: layer.x,
    oy: layer.y,
  }
  dragging.value = true
  canvas.value?.setPointerCapture(e.pointerId)
  pointerId = e.pointerId
  e.preventDefault()
}

function onMove(e: PointerEvent) {
  if (!drag) return
  const p = toDoc(e)
  const layer = state.doc.layers.find((l) => l.id === drag?.id)
  if (!layer) return
  let nx = drag.ox + (p.x - drag.startX)
  let ny = drag.oy + (p.y - drag.startY)
  if (e.shiftKey) {
    if (Math.abs(p.x - drag.startX) > Math.abs(p.y - drag.startY)) ny = drag.oy
    else nx = drag.ox
  }
  layer.x = Math.round(nx)
  layer.y = Math.round(ny)
}

function onUp() {
  if (!drag) return
  drag = null
  dragging.value = false
  if (pointerId !== null) {
    try {
      canvas.value?.releasePointerCapture(pointerId)
    } catch {
      /* noop */
    }
    pointerId = null
  }
}

watch(() => state.doc, schedule, { deep: true })
watch(() => state.selectedId, schedule)
watch(() => [state.doc.width, state.doc.height], fit)

onMounted(() => {
  observer = new ResizeObserver(() => fit())
  if (stage.value) observer.observe(stage.value)
  fit()
  if (document.fonts?.ready) document.fonts.ready.then(schedule)
})

onActivated(() => {
  fit()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <main ref="stage" class="stage" :class="{ dragging }">
    <div ref="wrap" class="canvas-wrap" :style="size">
      <canvas
        ref="canvas"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      />
      <div v-if="selectedRect" class="sel-box" :style="boxStyle">
        <i class="handle tl" />
        <i class="handle tr" />
        <i class="handle bl" />
        <i class="handle br" />
      </div>
    </div>
    <div class="stage-meta">
      <span>{{ state.doc.width }} × {{ state.doc.height }}</span>
      <span class="dot" />
      <span>{{ Math.round(scale * 100) }}%</span>
      <span class="dot" />
      <span class="hint">拖动可移动图层 · 方向键微调</span>
    </div>
  </main>
</template>
