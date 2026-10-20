<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { FONTS } from '../fonts'
import { useCanvasPreview } from '../lib/useCanvasPreview'
import {
  drawImageCover,
  exportCanvas,
  getImage,
  hashString,
  loadImage,
  mulberry32,
  roundRect,
  withAlpha,
} from '../lib/draw'
import { toast } from '../lib/toast'

const W = 900
const H = 1260

type ThemeId = 'obsidian' | 'neon' | 'paper'

interface PassTheme {
  bg1: string
  bg2: string
  card1: string
  card2: string
  text: string
  muted: string
  accent: string
  accent2: string
  border: string
  display: string
  mono: string
}

const THEMES: Record<ThemeId, PassTheme> = {
  obsidian: {
    bg1: '#06070a',
    bg2: '#101722',
    card1: '#0d1219',
    card2: '#151e2a',
    text: '#f2f4f8',
    muted: '#8a94a6',
    accent: '#f0b35a',
    accent2: '#7dd3fc',
    border: 'rgba(255,255,255,0.10)',
    display: FONTS[0].value,
    mono: FONTS[6].value,
  },
  neon: {
    bg1: '#0b0416',
    bg2: '#1d0539',
    card1: '#170a2b',
    card2: '#251146',
    text: '#f8eeff',
    muted: '#a794c2',
    accent: '#ff4ecd',
    accent2: '#6ee7ff',
    border: 'rgba(255,255,255,0.13)',
    display: FONTS[0].value,
    mono: FONTS[6].value,
  },
  paper: {
    bg1: '#e8e1d2',
    bg2: '#d6cab4',
    card1: '#fdfaf3',
    card2: '#f3ebdd',
    text: '#221d15',
    muted: '#7c7160',
    accent: '#b45309',
    accent2: '#0f766e',
    border: 'rgba(34,29,21,0.14)',
    display: FONTS[0].value,
    mono: FONTS[6].value,
  },
}

const THEME_LIST: { id: ThemeId; label: string }[] = [
  { id: 'obsidian', label: '黑金' },
  { id: 'neon', label: '霓虹' },
  { id: 'paper', label: '纸质' },
]

const data = reactive({
  theme: 'obsidian' as ThemeId,
  name: '林见山',
  role: '视觉设计师',
  id: 'A-2049-0815',
  level: '07',
  valid: '2026.12',
  avatar: '',
  accent: '#f0b35a',
})

const theme = computed(() => ({ ...THEMES[data.theme], accent: data.accent }))

const f = (weight: number, size: number, family: string) =>
  `${weight} ${size}px ${family}`

function setTheme(id: ThemeId) {
  data.theme = id
  data.accent = THEMES[id].accent
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  family: string,
  maxSize: number,
  weight = 800,
) {
  let size = maxSize
  while (size > 18) {
    ctx.font = f(weight, size, family)
    if (ctx.measureText(text).width <= maxW) return size
    size -= 2
  }
  return size
}

function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seedText: string,
  color: string,
) {
  const rnd = mulberry32(hashString(seedText || 'pass'))
  let cursor = x
  ctx.save()
  ctx.fillStyle = color
  while (cursor < x + w) {
    const bar = 2 + Math.floor(rnd() * 5)
    const gap = 2 + Math.floor(rnd() * 4)
    if (rnd() > 0.22) ctx.fillRect(cursor, y, bar, h)
    cursor += bar + gap
  }
  ctx.restore()
}

const canvasEl = ref<HTMLCanvasElement | null>(null)
const version = ref(0)

function ensureAvatar(src: string) {
  if (!src) return null
  const img = getImage(src)
  if (!img.complete || !img.naturalWidth) {
    img.addEventListener('load', () => (version.value += 1), { once: true })
  }
  return img
}

function drawPass(ctx: CanvasRenderingContext2D) {
  void version.value
  const t = theme.value
  const name = data.name || '未命名'

  /* background */
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, t.bg1)
  bg.addColorStop(1, t.bg2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.strokeStyle = withAlpha(t.text, data.theme === 'paper' ? 0.05 : 0.04)
  ctx.lineWidth = 1
  for (let x = -H; x < W + H; x += 54) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + H * 0.55, H)
    ctx.stroke()
  }
  ctx.restore()

  const glowA = ctx.createRadialGradient(780, 90, 0, 780, 90, 430)
  glowA.addColorStop(0, withAlpha(t.accent, 0.16))
  glowA.addColorStop(1, withAlpha(t.accent, 0))
  ctx.fillStyle = glowA
  ctx.fillRect(0, 0, W, H)

  const glowB = ctx.createRadialGradient(80, 1140, 0, 80, 1140, 400)
  glowB.addColorStop(0, withAlpha(t.accent2, 0.12))
  glowB.addColorStop(1, withAlpha(t.accent2, 0))
  ctx.fillStyle = glowB
  ctx.fillRect(0, 0, W, H)

  /* card */
  const cx = 48
  const cy = 48
  const cw = W - 96
  const ch = H - 96
  const radius = 38

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 26
  const card = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch)
  card.addColorStop(0, t.card1)
  card.addColorStop(1, t.card2)
  ctx.fillStyle = card
  roundRect(ctx, cx, cy, cw, ch, radius)
  ctx.fill()
  ctx.restore()

  ctx.save()
  roundRect(ctx, cx, cy, cw, ch, radius)
  ctx.strokeStyle = withAlpha(t.accent, 0.3)
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  ctx.save()
  roundRect(ctx, cx, cy, cw, ch, radius)
  ctx.clip()

  // holographic glow inside the card
  const holo = ctx.createRadialGradient(720, 1030, 0, 720, 1030, 210)
  holo.addColorStop(0, withAlpha(t.accent, 0.2))
  holo.addColorStop(0.55, withAlpha(t.accent2, 0.08))
  holo.addColorStop(1, withAlpha(t.accent2, 0))
  ctx.fillStyle = holo
  ctx.fillRect(0, 0, W, H)

  // top sheen
  const sheen = ctx.createLinearGradient(0, cy, 0, cy + 220)
  sheen.addColorStop(0, withAlpha(t.text, data.theme === 'paper' ? 0.035 : 0.06))
  sheen.addColorStop(1, withAlpha(t.text, 0))
  ctx.fillStyle = sheen
  ctx.fillRect(cx, cy, cw, 240)

  /* header */
  ctx.save()
  ctx.translate(110, 112)
  ctx.rotate(Math.PI / 4)
  ctx.fillStyle = t.accent
  ctx.fillRect(-9, -9, 18, 18)
  ctx.strokeStyle = withAlpha(t.accent, 0.35)
  ctx.lineWidth = 1
  ctx.strokeRect(-9, -9, 18, 18)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = t.text
  ctx.font = f(700, 14, t.mono)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '6px'
  ctx.fillText('ACCESS PASS', 140, 112)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = t.muted
  ctx.font = f(500, 10, t.mono)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '2px'
  ctx.fillText('COVER STUDIO', 790, 104)
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '2px'
  ctx.fillText('EST. 2026', 790, 122)
  ctx.restore()

  /* avatar */
  const acx = W / 2
  const acy = 352
  const ar = 140

  ctx.save()
  ctx.strokeStyle = withAlpha(t.accent, 0.32)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(acx, acy, ar + 12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = withAlpha(t.accent, 0.12)
  ctx.beginPath()
  ctx.arc(acx, acy, ar + 22, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  const avGrad = ctx.createLinearGradient(acx - ar, acy - ar, acx + ar, acy + ar)
  avGrad.addColorStop(0, withAlpha(t.accent, 0.2))
  avGrad.addColorStop(1, withAlpha(t.accent2, 0.18))
  ctx.fillStyle = avGrad
  ctx.beginPath()
  ctx.arc(acx, acy, ar, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const avatarImg = ensureAvatar(data.avatar)
  if (data.avatar && avatarImg && avatarImg.complete && avatarImg.naturalWidth) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(acx, acy, ar, 0, Math.PI * 2)
    ctx.clip()
    drawImageCover(ctx, avatarImg, acx - ar, acy - ar, ar * 2, ar * 2)
    ctx.restore()
  } else {
    const initials = Array.from(name).slice(0, 2).join('')
    const ink = ctx.createLinearGradient(acx - 120, acy, acx + 120, acy)
    ink.addColorStop(0, t.accent)
    ink.addColorStop(1, t.accent2)
    ctx.save()
    ctx.fillStyle = ink
    ctx.font = f(800, 112, t.display)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, acx, acy + 4)
    ctx.restore()
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(acx + 99, acy + 99, 11, 0, Math.PI * 2)
  ctx.fillStyle = t.accent2
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = t.card1
  ctx.stroke()
  ctx.restore()

  /* name & role */
  const nameSize = fitFont(ctx, name, 700, t.display, 54)
  ctx.save()
  ctx.fillStyle = t.text
  ctx.font = f(800, nameSize, t.display)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(name, W / 2, 524)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = t.muted
  ctx.font = f(500, 17, t.display)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '3px'
  ctx.fillText(data.role || '—', W / 2, 600)
  ctx.restore()

  /* divider */
  ctx.save()
  ctx.strokeStyle = t.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(150, 662)
  ctx.lineTo(750, 662)
  ctx.stroke()
  ctx.translate(450, 662)
  ctx.rotate(Math.PI / 4)
  ctx.fillStyle = t.accent
  ctx.fillRect(-4, -4, 8, 8)
  ctx.restore()

  /* stats */
  const cols = [
    { label: 'LEVEL', value: data.level || '—' },
    { label: 'PASS NO.', value: data.id || '—' },
    { label: 'VALID THRU', value: data.valid || '—' },
  ]
  cols.forEach((col, i) => {
    const x = 190 + i * 260
    ctx.save()
    ctx.fillStyle = t.muted
    ctx.font = f(500, 10, t.mono)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '2px'
    ctx.fillText(col.label, x, 700)
    ctx.restore()

    ctx.save()
    ctx.fillStyle = t.text
    ctx.font = f(700, 21, t.mono)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(col.value, x, 722)
    ctx.restore()
  })

  /* barcode */
  drawBarcode(ctx, 150, 808, 600, 112, data.id + data.level, withAlpha(t.text, 0.88))
  ctx.save()
  ctx.fillStyle = t.muted
  ctx.font = f(500, 12, t.mono)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '4px'
  ctx.fillText(data.id || 'A-0000-0000', 450, 936)
  ctx.restore()

  /* signature */
  ctx.save()
  ctx.strokeStyle = t.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(150, 1046)
  ctx.lineTo(750, 1046)
  ctx.stroke()
  ctx.fillStyle = t.muted
  ctx.font = f(500, 9, t.mono)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '2px'
  ctx.fillText('AUTHORIZED SIGNATURE', 150, 1056)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = withAlpha(t.text, 0.55)
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(540, 1024)
  ctx.bezierCurveTo(566, 992, 584, 1052, 610, 1022)
  ctx.bezierCurveTo(632, 998, 650, 1044, 682, 1016)
  ctx.bezierCurveTo(700, 1000, 716, 1030, 750, 1014)
  ctx.stroke()
  ctx.restore()

  /* footer */
  ctx.save()
  ctx.fillStyle = withAlpha(t.text, 0.34)
  ctx.font = f(500, 10, t.mono)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '3px'
  ctx.fillText('NON-TRANSFERABLE · 仅限本人使用', 450, 1116)
  ctx.restore()

  ctx.restore()
}

useCanvasPreview(canvasEl, () => ({ width: W, height: H }), drawPass)

/* ---------------- actions ---------------- */

const avatarInput = ref<HTMLInputElement | null>(null)

function pickAvatar() {
  avatarInput.value?.click()
}

function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    data.avatar = String(reader.result)
  }
  reader.readAsDataURL(file)
}

function randomId() {
  const part = () => Math.floor(1000 + Math.random() * 9000)
  data.id = `A-${part()}-${part()}`
}

const exporting = ref(false)

async function doExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    if (data.avatar) {
      await loadImage(data.avatar).catch(() => null)
    }
    const ok = await exportCanvas(
      W,
      H,
      2,
      drawPass,
      `pass-${Date.now()}.png`,
    )
    toast(ok ? '已导出通行证 · 2×' : '导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

function reset() {
  Object.assign(data, {
    theme: 'obsidian',
    name: '林见山',
    role: '视觉设计师',
    id: 'A-2049-0815',
    level: '07',
    valid: '2026.12',
    avatar: '',
    accent: '#f0b35a',
  })
}
</script>

<template>
  <div class="view">
    <header class="view-toolbar">
      <div class="view-title">
        <span class="view-kicker">TOOL 03</span>
        <strong>通行证</strong>
      </div>
      <span class="view-sub">工牌 / 通行证 · 头衔与编号可编辑</span>
      <div class="toolbar-actions">
        <button class="ghost-btn" @click="reset">重置</button>
        <button class="primary-btn" :disabled="exporting" @click="doExport">
          <Icon name="download" :size="16" />
          <span>{{ exporting ? '导出中…' : '导出 PNG' }}</span>
          <em>2×</em>
        </button>
      </div>
    </header>

    <div class="view-body">
      <aside class="panel">
        <div class="panel-scroll">
          <div class="field">
            <span class="label">配色</span>
            <div class="seg">
              <button
                v-for="th in THEME_LIST"
                :key="th.id"
                :class="{ active: data.theme === th.id }"
                @click="setTheme(th.id)"
              >
                {{ th.label }}
              </button>
            </div>
          </div>

          <div class="field">
            <span class="label">头像</span>
            <div class="avatar-row">
              <div class="avatar-preview" @click="pickAvatar">
                <img v-if="data.avatar" :src="data.avatar" alt="" />
                <span v-else>上传</span>
              </div>
              <div class="avatar-hint">
                建议使用正方形图片，<br />
                会自动裁切为圆形。
              </div>
              <button
                v-if="data.avatar"
                class="mini-btn"
                title="移除头像"
                @click="data.avatar = ''"
              >
                <Icon name="trash" :size="14" />
              </button>
            </div>
          </div>

          <div class="field">
            <span class="label">姓名</span>
            <input v-model="data.name" class="ti" maxlength="12" />
          </div>

          <div class="field">
            <span class="label">头衔 / 职业</span>
            <input v-model="data.role" class="ti" maxlength="20" />
          </div>

          <div class="field">
            <div class="field-row">
              <span class="label">通行证编号</span>
              <button class="link-btn" @click="randomId">随机</button>
            </div>
            <input v-model="data.id" class="ti" maxlength="16" />
          </div>

          <div class="field-row two">
            <div class="field">
              <span class="label">等级</span>
              <input v-model="data.level" class="ti" maxlength="4" />
            </div>
            <div class="field">
              <span class="label">有效期</span>
              <input v-model="data.valid" class="ti" maxlength="10" />
            </div>
          </div>

          <div class="field">
            <div class="field-row">
              <span class="label">点缀色</span>
              <div class="color-row">
                <input v-model="data.accent" type="color" />
                <span class="hex">{{ data.accent }}</span>
              </div>
            </div>
          </div>

          <p class="tip">
            编号同时决定底部的条形码图案，改动编号即可生成新的条码。
          </p>
        </div>
      </aside>

      <div class="preview-stage">
        <canvas ref="canvasEl" class="preview-canvas" />
      </div>
    </div>

    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      hidden
      @change="onAvatarChange"
    />
  </div>
</template>
