<script setup lang="ts">
import {
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  reactive,
  ref,
} from 'vue'
import Icon from '../components/Icon.vue'
import { FONTS } from '../fonts'
import {
  downloadBlob,
  exportCanvas,
  getImage,
  mulberry32,
  withAlpha,
} from '../lib/draw'
import { toast } from '../lib/toast'

const W = 900
const H = 1200

type ThemeId = 'aurora' | 'ember' | 'mono'

const THEMES: Record<
  ThemeId,
  { label: string; bg1: string; bg2: string; glow1: string; glow2: string; accent: string }
> = {
  aurora: {
    label: '极光',
    bg1: '#040913',
    bg2: '#0a1a30',
    glow1: '#22d3ee',
    glow2: '#a78bfa',
    accent: '#7dd3fc',
  },
  ember: {
    label: '余烬',
    bg1: '#120705',
    bg2: '#2a0d07',
    glow1: '#fb923c',
    glow2: '#f43f5e',
    accent: '#fdba74',
  },
  mono: {
    label: '单色',
    bg1: '#08080a',
    bg2: '#161619',
    glow1: '#e5e7eb',
    glow2: '#94a3b8',
    accent: '#e5e7eb',
  },
}

const THEME_LIST = (Object.keys(THEMES) as ThemeId[]).map((id) => ({
  id,
  label: THEMES[id].label,
}))

const cfg = reactive({
  theme: 'aurora' as ThemeId,
  image: '',
  name: '无名旅人',
  subtitle: 'THE WANDERER · 2026',
  glow: '#7dd3fc',
  glowStrength: 0.6,
  parallax: 1,
  breath: 1,
  particles: 46,
  paused: false,
})

const theme = computed(() => THEMES[cfg.theme])
const canvasEl = ref<HTMLCanvasElement | null>(null)
const stageEl = ref<HTMLDivElement | null>(null)

const f = (weight: number, size: number, family: string) =>
  `${weight} ${size}px ${family}`

function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
  letter = 0,
  shadow = false,
) {
  ctx.save()
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = `${letter}px`
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.65)'
    ctx.shadowBlur = 18
  }
  ctx.fillText(str, x, y)
  ctx.restore()
}

/* ---------------- particles ---------------- */

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  phase: number
  drift: number
}

const particles: Particle[] = (() => {
  const rnd = mulberry32(20261020)
  return Array.from({ length: 90 }, () => ({
    x: rnd(),
    y: rnd(),
    size: 0.6 + rnd() * 2.2,
    speed: 0.008 + rnd() * 0.02,
    phase: rnd() * Math.PI * 2,
    drift: 0.004 + rnd() * 0.012,
  }))
})()

/* ---------------- animation ---------------- */

let raf = 0
let last = 0
let clock = 0
let targetX = 0
let targetY = 0
let mx = 0
let my = 0

function silhouette(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, -540, 0, 0)
  grad.addColorStop(0, '#1d2739')
  grad.addColorStop(0.55, '#0e1522')
  grad.addColorStop(1, '#060810')
  ctx.fillStyle = grad

  ctx.beginPath()
  ctx.moveTo(-245, 0)
  ctx.bezierCurveTo(-225, -185, -150, -275, -82, -308)
  ctx.lineTo(-70, -352)
  ctx.bezierCurveTo(-98, -400, -96, -520, 0, -520)
  ctx.bezierCurveTo(96, -520, 98, -400, 70, -352)
  ctx.lineTo(82, -308)
  ctx.bezierCurveTo(150, -275, 225, -185, 245, 0)
  ctx.closePath()
  ctx.fill()

  ctx.save()
  ctx.strokeStyle = withAlpha('#bfe3ff', 0.24)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = withAlpha(cfg.glow, 0.35)
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(0, -430, 82, 100, 0, Math.PI * 0.15, Math.PI * 0.95)
  ctx.stroke()
  ctx.restore()
}

function drawScene(ctx: CanvasRenderingContext2D, showRec = false) {
  const t = theme.value

  ctx.clearRect(0, 0, W, H)

  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
  bg.addColorStop(0, t.bg2)
  bg.addColorStop(0.55, t.bg1)
  bg.addColorStop(1, '#020306')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ambient glows
  const g1x = W * 0.3 + Math.sin(clock * 0.35) * 60
  const g1y = H * 0.22 + Math.cos(clock * 0.28) * 40
  const glow1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, 560)
  glow1.addColorStop(0, withAlpha(t.glow1, 0.2))
  glow1.addColorStop(1, withAlpha(t.glow1, 0))
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, W, H)

  const g2x = W * 0.78 + Math.cos(clock * 0.24) * 50
  const g2y = H * 0.7 + Math.sin(clock * 0.31) * 60
  const glow2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, 480)
  glow2.addColorStop(0, withAlpha(t.glow2, 0.16))
  glow2.addColorStop(1, withAlpha(t.glow2, 0))
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  // particles (behind)
  const count = Math.min(cfg.particles, particles.length)
  for (let i = 0; i < count; i += 1) {
    const p = particles[i]
    const y = (((p.y - clock * p.speed) % 1) + 1) % 1
    const x = p.x + Math.sin(clock * 0.4 + p.phase) * p.drift
    const alpha = 0.12 + 0.32 * (0.5 + 0.5 * Math.sin(clock * 1.3 + p.phase))
    ctx.fillStyle = withAlpha(i % 6 === 0 ? '#ffffff' : cfg.glow, alpha)
    ctx.beginPath()
    ctx.arc(x * W, y * H, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // floor glow
  ctx.save()
  const floor = ctx.createRadialGradient(W / 2, H * 0.95, 0, W / 2, H * 0.95, 420)
  floor.addColorStop(0, withAlpha(cfg.glow, 0.18 * cfg.glowStrength))
  floor.addColorStop(1, withAlpha(cfg.glow, 0))
  ctx.fillStyle = floor
  ctx.beginPath()
  ctx.ellipse(W / 2, H * 0.95, 420, 120, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // aura behind character
  const aura = ctx.createRadialGradient(
    W / 2,
    H * 0.52,
    0,
    W / 2,
    H * 0.52,
    500,
  )
  aura.addColorStop(
    0,
    withAlpha(cfg.glow, (0.16 + 0.05 * Math.sin(clock * 1.2)) * cfg.glowStrength),
  )
  aura.addColorStop(1, withAlpha(cfg.glow, 0))
  ctx.fillStyle = aura
  ctx.fillRect(0, 0, W, H)

  // character
  const bob = Math.sin(clock * 1.1 * cfg.breath) * 6
  const breath = 1 + Math.sin(clock * 1.6 * cfg.breath) * 0.012
  const px = mx * 34 * cfg.parallax
  const py = my * 22 * cfg.parallax

  ctx.save()
  ctx.translate(W / 2 + px, H * 0.985 + py + bob)
  ctx.rotate(mx * 0.014 * cfg.parallax)
  ctx.scale(breath, breath)

  const img = cfg.image ? getImage(cfg.image) : null
  if (img && img.complete && img.naturalWidth) {
    const scale = Math.min((W * 0.92) / img.naturalWidth, (H * 0.94) / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.save()
    ctx.shadowColor = withAlpha(cfg.glow, 0.4 * cfg.glowStrength)
    ctx.shadowBlur = 46
    ctx.drawImage(img, -dw / 2, -dh, dw, dh)
    ctx.restore()
  } else {
    silhouette(ctx)
  }
  ctx.restore()

  // foreground particles
  for (let i = 0; i < Math.min(14, count); i += 1) {
    const p = particles[(i * 7 + 3) % particles.length]
    const y = (((p.y - clock * p.speed * 1.6) % 1) + 1) % 1
    ctx.fillStyle = withAlpha('#ffffff', 0.18)
    ctx.beginPath()
    ctx.arc(p.x * W, y * H, p.size * 1.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // scanlines + vignette
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.014)'
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1)
  ctx.restore()

  const vignette = ctx.createRadialGradient(
    W / 2,
    H * 0.46,
    H * 0.16,
    W / 2,
    H * 0.5,
    H * 0.78,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)

  // frame
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  ctx.strokeRect(26, 26, W - 52, H - 52)
  ctx.strokeStyle = withAlpha(t.accent, 0.4)
  ctx.lineWidth = 2
  const tick = 22
  const off = 26
  const corners: [number, number, number, number][] = [
    [off, off, 1, 1],
    [W - off, off, -1, 1],
    [off, H - off, 1, -1],
    [W - off, H - off, -1, -1],
  ]
  corners.forEach(([x, y, sx, sy]) => {
    ctx.beginPath()
    ctx.moveTo(x, y + sy * tick)
    ctx.lineTo(x, y)
    ctx.lineTo(x + sx * tick, y)
    ctx.stroke()
  })
  ctx.restore()

  // header
  ctx.save()
  ctx.translate(64, 62)
  ctx.rotate(Math.PI / 4)
  ctx.fillStyle = t.accent
  ctx.fillRect(-5, -5, 10, 10)
  ctx.restore()
  text(ctx, 'LIVING PORTRAIT / 01', 86, 54, f(600, 11, FONTS[6].value), withAlpha('#e9eef7', 0.75), 'left', 3)

  if (showRec) {
    ctx.save()
    ctx.fillStyle = '#ff4757'
    ctx.beginPath()
    ctx.arc(W - 150, 72, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    text(ctx, 'REC', W - 136, 64, f(700, 11, FONTS[6].value), '#ff8b95', 'left', 2)
  }

  // caption
  ctx.save()
  ctx.fillStyle = t.accent
  ctx.fillRect(64, H - 176, 44, 3)
  ctx.restore()
  text(ctx, cfg.name || '未命名', 64, H - 158, f(800, 44, FONTS[0].value), '#f4f7fb', 'left', 0, true)
  text(
    ctx,
    cfg.subtitle,
    64,
    H - 96,
    f(500, 11, FONTS[6].value),
    withAlpha('#f4f7fb', 0.62),
    'left',
    4,
    true,
  )
}

function loop(now: number) {
  if (!last) last = now
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  if (!cfg.paused) clock += dt

  mx += (targetX - mx) * Math.min(1, dt * 5)
  my += (targetY - my) * Math.min(1, dt * 5)

  const el = canvasEl.value
  if (el) {
    const ctx = el.getContext('2d')
    if (ctx) drawScene(ctx, recording.value)
  }
  raf = requestAnimationFrame(loop)
}

function startLoop() {
  if (raf) return
  last = 0
  raf = requestAnimationFrame(loop)
}

function stopLoop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function onPointerMove(e: PointerEvent) {
  const el = stageEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  targetX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1))
  targetY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1))
}

function onPointerLeave() {
  targetX = 0
  targetY = 0
}

/* ---------------- recording & export ---------------- */

const recording = ref(false)
const canRecord =
  typeof MediaRecorder !== 'undefined' &&
  typeof HTMLCanvasElement !== 'undefined' &&
  'captureStream' in HTMLCanvasElement.prototype

let recorder: MediaRecorder | null = null
let recTimer: ReturnType<typeof setTimeout> | undefined

function record() {
  const el = canvasEl.value
  if (!el || recording.value) return
  if (!canRecord) {
    toast('当前浏览器不支持录制，请使用 Chrome / Edge')
    return
  }
  try {
    const stream = el.captureStream(30)
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm'
    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 8_000_000,
    })
    const chunks: BlobPart[] = []
    rec.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data)
    }
    rec.onstop = () => {
      if (recTimer) clearTimeout(recTimer)
      recording.value = false
      const blob = new Blob(chunks, { type: 'video/webm' })
      downloadBlob(blob, `portrait-${Date.now()}.webm`)
      toast('已导出 5 秒动态立绘 · WebM')
    }
    recorder = rec
    recording.value = true
    rec.start(250)
    recTimer = setTimeout(() => {
      if (rec.state !== 'inactive') rec.stop()
    }, 5000)
    toast('开始录制，5 秒后自动保存')
  } catch {
    recording.value = false
    toast('录制启动失败，请重试')
  }
}

const exporting = ref(false)

async function doExport() {
  if (exporting.value || recording.value) return
  exporting.value = true
  try {
    const ok = await exportCanvas(
      W,
      H,
      2,
      (ctx) => drawScene(ctx, false),
      `portrait-${Date.now()}.png`,
    )
    toast(ok ? '已导出立绘 · 2×' : '导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

function setTheme(id: ThemeId) {
  cfg.theme = id
  cfg.glow = THEMES[id].accent
}

const imageInput = ref<HTMLInputElement | null>(null)

function pickImage() {
  imageInput.value?.click()
}

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    cfg.image = String(reader.result)
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  startLoop()
})

onActivated(() => {
  startLoop()
})

onDeactivated(() => {
  stopLoop()
  if (recorder && recorder.state !== 'inactive') recorder.stop()
})

onBeforeUnmount(() => {
  stopLoop()
  if (recorder && recorder.state !== 'inactive') recorder.stop()
})
</script>

<template>
  <div class="view">
    <header class="view-toolbar">
      <div class="view-title">
        <span class="view-kicker">TOOL 05</span>
        <strong>动态立绘</strong>
      </div>
      <span class="view-sub">呼吸 · 视差 · 粒子 · WebM 录制</span>

      <div class="toolbar-actions">
        <button class="ghost-btn" @click="cfg.paused = !cfg.paused">
          <Icon :name="cfg.paused ? 'play' : 'pause'" :size="14" />
          {{ cfg.paused ? '继续' : '暂停' }}
        </button>
        <button
          class="ghost-btn"
          :disabled="recording || !canRecord"
          @click="record"
        >
          <Icon name="record" :size="14" />
          {{ recording ? '录制中…' : '录制 5 秒' }}
        </button>
        <button
          class="primary-btn"
          :disabled="exporting || recording"
          @click="doExport"
        >
          <Icon name="download" :size="16" />
          {{ exporting ? '导出中…' : '导出 PNG' }}
          <em>2×</em>
        </button>
      </div>
    </header>

    <div class="view-body">
      <aside class="panel">
        <div class="panel-scroll">
          <div class="field">
            <span class="label">氛围</span>
            <div class="seg">
              <button
                v-for="th in THEME_LIST"
                :key="th.id"
                :class="{ active: cfg.theme === th.id }"
                @click="setTheme(th.id)"
              >
                {{ th.label }}
              </button>
            </div>
          </div>

          <div class="field">
            <span class="label">立绘图片</span>
            <template v-if="!cfg.image">
              <button class="upload sm" @click="pickImage">
                <Icon name="portrait" :size="22" />
                <strong>上传立绘</strong>
                <small>建议透明背景 PNG</small>
              </button>
            </template>
            <template v-else>
              <div class="thumb-sm contain">
                <img :src="cfg.image" alt="" />
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="pickImage">更换立绘</button>
                <button class="soft-btn" @click="cfg.image = ''">移除</button>
              </div>
            </template>
          </div>

          <div class="field">
            <span class="label">角色名</span>
            <input v-model="cfg.name" class="ti" maxlength="14" />
          </div>

          <div class="field">
            <span class="label">副标题</span>
            <input v-model="cfg.subtitle" class="ti" maxlength="32" />
          </div>

          <div class="section">
            <div class="field">
              <div class="field-row">
                <span class="label">光晕颜色</span>
                <div class="color-row">
                  <input v-model="cfg.glow" type="color" />
                  <span class="hex">{{ cfg.glow }}</span>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="field-row">
                <span class="label">光晕强度</span>
                <span class="hint">{{ Math.round(cfg.glowStrength * 100) }}%</span>
              </div>
              <input
                v-model.number="cfg.glowStrength"
                type="range"
                min="0"
                max="1"
                step="0.02"
              />
            </div>

            <div class="field">
              <div class="field-row">
                <span class="label">视差幅度</span>
                <span class="hint">{{ cfg.parallax.toFixed(1) }}</span>
              </div>
              <input
                v-model.number="cfg.parallax"
                type="range"
                min="0"
                max="2.5"
                step="0.1"
              />
            </div>

            <div class="field">
              <div class="field-row">
                <span class="label">呼吸速度</span>
                <span class="hint">{{ cfg.breath.toFixed(1) }}</span>
              </div>
              <input
                v-model.number="cfg.breath"
                type="range"
                min="0"
                max="2.5"
                step="0.1"
              />
            </div>

            <div class="field">
              <div class="field-row">
                <span class="label">粒子数量</span>
                <span class="hint">{{ cfg.particles }}</span>
              </div>
              <input
                v-model.number="cfg.particles"
                type="range"
                min="0"
                max="90"
                step="1"
              />
            </div>
          </div>

          <p class="tip">
            移动鼠标可以改变立绘的朝向与视差；录制会捕捉 5 秒画面并保存为 WebM。
            未上传图片时会显示默认剪影。
          </p>
        </div>
      </aside>

      <div
        ref="stageEl"
        class="preview-stage portrait-stage"
        @pointermove="onPointerMove"
        @pointerleave="onPointerLeave"
      >
        <canvas
          ref="canvasEl"
          class="preview-canvas"
          :width="W"
          :height="H"
        />
      </div>
    </div>

    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      hidden
      @change="onImageChange"
    />
  </div>
</template>
