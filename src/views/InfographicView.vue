<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { FONTS } from '../fonts'
import { wrapText } from '../render'
import { useCanvasPreview } from '../lib/useCanvasPreview'
import {
  drawImageCover,
  exportCanvas,
  getImage,
  loadImage,
  roundRect,
  withAlpha,
} from '../lib/draw'
import { toast } from '../lib/toast'

const W = 1080
const PAD = 72
const INNER = W - PAD * 2
const GAP = 34
const IMG_H = Math.round((INNER * 9) / 16)

type ThemeId = 'midnight' | 'paper' | 'ember'

interface Theme {
  bg: string
  card: string
  text: string
  muted: string
  accent: string
  line: string
  display: string
  body: string
  serif: string
  mono: string
}

const THEMES: Record<ThemeId, Theme> = {
  midnight: {
    bg: '#0a0d13',
    card: '#121823',
    text: '#e9eef7',
    muted: '#8d98aa',
    accent: '#5eead4',
    line: 'rgba(255,255,255,0.08)',
    display: FONTS[0].value,
    body: FONTS[0].value,
    serif: FONTS[1].value,
    mono: FONTS[6].value,
  },
  paper: {
    bg: '#f1ece1',
    card: '#fbf7ee',
    text: '#201c16',
    muted: '#7c7261',
    accent: '#c2410c',
    line: 'rgba(32,28,22,0.10)',
    display: FONTS[1].value,
    body: FONTS[0].value,
    serif: FONTS[1].value,
    mono: FONTS[6].value,
  },
  ember: {
    bg: '#110b08',
    card: '#1e130d',
    text: '#f7e9dd',
    muted: '#b08a72',
    accent: '#ff8a4c',
    line: 'rgba(255,255,255,0.09)',
    display: FONTS[0].value,
    body: FONTS[0].value,
    serif: FONTS[1].value,
    mono: FONTS[6].value,
  },
}

const THEME_LIST: { id: ThemeId; label: string }[] = [
  { id: 'midnight', label: '午夜' },
  { id: 'paper', label: '纸感' },
  { id: 'ember', label: '余烬' },
]

type BlockKind = 'hero' | 'section' | 'stats' | 'timeline' | 'quote' | 'image'

interface HeroBlock {
  id: string
  kind: 'hero'
  eyebrow: string
  title: string
  subtitle: string
  meta: string
}
interface SectionBlock {
  id: string
  kind: 'section'
  title: string
  body: string
}
interface StatItem {
  value: string
  label: string
}
interface StatsBlock {
  id: string
  kind: 'stats'
  title: string
  items: StatItem[]
}
interface TimelineItem {
  time: string
  title: string
  desc: string
}
interface TimelineBlock {
  id: string
  kind: 'timeline'
  title: string
  items: TimelineItem[]
}
interface QuoteBlock {
  id: string
  kind: 'quote'
  text: string
  author: string
}
interface ImageBlock {
  id: string
  kind: 'image'
  src: string
  caption: string
}

type Block =
  | HeroBlock
  | SectionBlock
  | StatsBlock
  | TimelineBlock
  | QuoteBlock
  | ImageBlock

const KINDS: { id: BlockKind; label: string }[] = [
  { id: 'hero', label: '主视觉' },
  { id: 'section', label: '章节' },
  { id: 'stats', label: '数据' },
  { id: 'timeline', label: '时间线' },
  { id: 'quote', label: '引用' },
  { id: 'image', label: '图片' },
]

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label])) as Record<
  BlockKind,
  string
>

const KIND_COLOR: Record<BlockKind, string> = {
  hero: '#ff7a45',
  section: '#7dd3fc',
  stats: '#a78bfa',
  timeline: '#34d399',
  quote: '#fbbf24',
  image: '#f472b6',
}

let seq = 0
const bid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`

function createBlock(kind: BlockKind): Block {
  switch (kind) {
    case 'hero':
      return {
        id: bid(),
        kind,
        eyebrow: 'NEW SECTION',
        title: '新的主视觉标题',
        subtitle: '一句补充说明，讲清这一页要表达什么。',
        meta: 'COVER STUDIO',
      }
    case 'section':
      return {
        id: bid(),
        kind,
        title: '新的章节',
        body: '在这里输入正文内容。支持换行与自动折行，适合放背景说明、观点或结论。',
      }
    case 'stats':
      return {
        id: bid(),
        kind,
        title: '关键数据',
        items: [
          { value: '01', label: '指标一' },
          { value: '02', label: '指标二' },
          { value: '03', label: '指标三' },
        ],
      }
    case 'timeline':
      return {
        id: bid(),
        kind,
        title: '时间线',
        items: [
          { time: '01', title: '第一步', desc: '补充这一步的关键信息。' },
          { time: '02', title: '第二步', desc: '补充这一步的关键信息。' },
          { time: '03', title: '第三步', desc: '补充这一步的关键信息。' },
        ],
      }
    case 'quote':
      return {
        id: bid(),
        kind,
        text: '一句值得被记住的话。',
        author: '— 作者',
      }
    case 'image':
      return { id: bid(), kind, src: '', caption: '图片说明' }
  }
}

function initialBlocks(): Block[] {
  return [
    {
      id: bid(),
      kind: 'hero',
      eyebrow: 'INFO FLOW / 2026',
      title: '把一件事\n讲清楚',
      subtitle: '一页长图，装下背景、数据、过程与结论。',
      meta: 'COVER STUDIO · 一图流',
    },
    {
      id: bid(),
      kind: 'section',
      title: '为什么是一图流',
      body: '信息密度高的内容，适合用纵向长图一次讲完。读者只需向下滚动，就能按顺序接收全部信息。',
    },
    {
      id: bid(),
      kind: 'stats',
      title: '一页装下',
      items: [
        { value: '6', label: '内容区块' },
        { value: '1080', label: '画布宽度' },
        { value: '2×', label: '导出倍率' },
      ],
    },
    {
      id: bid(),
      kind: 'timeline',
      title: '制作流程',
      items: [
        { time: '01', title: '确定主题', desc: '先写一句能被记住的结论。' },
        { time: '02', title: '拆分信息', desc: '按背景、数据、步骤、结论分块。' },
        { time: '03', title: '排版导出', desc: '调整节奏，导出高清长图。' },
      ],
    },
    {
      id: bid(),
      kind: 'quote',
      text: '好的长图不是信息的堆叠，\n而是一次有节奏的讲述。',
      author: '— 设计笔记',
    },
  ]
}

const doc = reactive<{ theme: ThemeId; blocks: Block[] }>({
  theme: 'midnight',
  blocks: initialBlocks(),
})

const selectedId = ref<string | null>(doc.blocks[0]?.id ?? null)
const sel = computed(() => doc.blocks.find((b) => b.id === selectedId.value) ?? null)

function pick(id: string) {
  selectedId.value = id
}

function addBlock(kind: BlockKind) {
  const block = createBlock(kind)
  const index = doc.blocks.findIndex((b) => b.id === selectedId.value)
  if (index >= 0) doc.blocks.splice(index + 1, 0, block)
  else doc.blocks.push(block)
  selectedId.value = block.id
}

function removeBlock(id: string) {
  const index = doc.blocks.findIndex((b) => b.id === id)
  if (index === -1) return
  doc.blocks.splice(index, 1)
  if (selectedId.value === id) {
    selectedId.value = doc.blocks[Math.min(index, doc.blocks.length - 1)]?.id ?? null
  }
}

function moveBlock(id: string, dir: -1 | 1) {
  const index = doc.blocks.findIndex((b) => b.id === id)
  const next = index + dir
  if (index === -1 || next < 0 || next >= doc.blocks.length) return
  const [block] = doc.blocks.splice(index, 1)
  doc.blocks.splice(next, 0, block)
}

function blockLabel(block: Block): string {
  switch (block.kind) {
    case 'hero':
      return block.title.split('\n')[0] || '主视觉'
    case 'section':
      return block.title || '章节'
    case 'stats':
      return block.title || '数据'
    case 'timeline':
      return block.title || '时间线'
    case 'quote':
      return block.text.replace(/\n/g, ' ').slice(0, 14) || '引用'
    case 'image':
      return block.caption || '图片'
  }
}

/* ---------------- layout ---------------- */

const measureCanvas = document.createElement('canvas')
const mctx = measureCanvas.getContext('2d') as CanvasRenderingContext2D

const f = (weight: number, size: number, family: string, italic = false) =>
  `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`

function fonts(t: Theme) {
  return {
    eyebrow: f(600, 15, t.mono),
    hero: f(800, 84, t.display),
    heroSub: f(400, 26, t.body),
    meta: f(500, 12, t.mono),
    sectionTitle: f(700, 36, t.display),
    body: f(400, 21, t.body),
    cardTitle: f(600, 22, t.display),
    statValue: f(800, 54, t.display),
    statLabel: f(500, 13, t.body),
    time: f(600, 12, t.mono),
    itemTitle: f(600, 22, t.display),
    itemDesc: f(400, 16, t.body),
    quote: f(500, 34, t.serif),
    quoteMark: f(700, 120, t.serif),
    quoteAuthor: f(400, 15, t.body),
    caption: f(400, 14, t.body),
    footer: f(500, 11, t.mono),
  }
}

type Fonts = ReturnType<typeof fonts>

function measureLines(text: string, font: string, maxW: number): string[] {
  mctx.save()
  mctx.font = font
  const lines = wrapText(mctx, text || '', maxW)
  mctx.restore()
  return lines
}

function measureBlock(block: Block): number {
  const t = THEMES[doc.theme]
  const F = fonts(t)
  switch (block.kind) {
    case 'hero': {
      const titleLines = measureLines(block.title, F.hero, INNER - 80).length
      const subLines = measureLines(block.subtitle, F.heroSub, INNER * 0.72).length
      return 78 + titleLines * 92 + 14 + subLines * 44 + 54
    }
    case 'section': {
      const titleLines = measureLines(block.title, F.sectionTitle, INNER - 26).length
      const bodyLines = measureLines(block.body, F.body, INNER - 26).length
      return 6 + titleLines * 48 + 18 + bodyLines * 40 + 10
    }
    case 'stats':
      return 292
    case 'timeline':
      return 96 + block.items.length * 108 + 20
    case 'quote': {
      const lines = measureLines(block.text, F.quote, INNER - 120).length
      return 96 + lines * 50 + 100
    }
    case 'image':
      return IMG_H + (block.caption ? 44 : 0)
  }
}

function layout() {
  const items: { block: Block; y: number; h: number }[] = []
  let y = PAD
  for (const block of doc.blocks) {
    const h = measureBlock(block)
    items.push({ block, y, h })
    y += h + GAP
  }
  const footerY = y - GAP + 44
  return { total: footerY + 70, footerY, items }
}

/* ---------------- drawing ---------------- */

const canvasEl = ref<HTMLCanvasElement | null>(null)
const imgTick = ref(0)
const pending = new Set<string>()

function ensureImage(src: string) {
  if (!src) return null
  const img = getImage(src)
  if (!img.complete || !img.naturalWidth) {
    if (!pending.has(src)) {
      pending.add(src)
      img.addEventListener(
        'load',
        () => {
          pending.delete(src)
          imgTick.value += 1
        },
        { once: true },
      )
      img.addEventListener('error', () => pending.delete(src), { once: true })
    }
  }
  return img
}

function drawText(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  font: string,
  color: string,
  opts: { align?: CanvasTextAlign; letter?: number } = {},
) {
  ctx.save()
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = opts.align ?? 'left'
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = `${opts.letter ?? 0}px`
  ctx.fillText(str, x, y)
  ctx.restore()
}

function drawParagraph(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  maxW: number,
  font: string,
  color: string,
  lineH: number,
  letter = 0,
): number {
  ctx.save()
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = `${letter}px`
  const lines = wrapText(ctx, str || '', maxW)
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineH))
  ctx.restore()
  return lines.length * lineH
}

function card(ctx: CanvasRenderingContext2D, y: number, h: number, t: Theme) {
  ctx.save()
  ctx.fillStyle = t.card
  roundRect(ctx, PAD, y, INNER, h, 26)
  ctx.fill()
  ctx.strokeStyle = t.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  b: HeroBlock,
  y: number,
  h: number,
  t: Theme,
  F: Fonts,
) {
  drawText(ctx, b.eyebrow || 'INFO FLOW', PAD, y + 18, F.eyebrow, t.accent, {
    letter: 5,
  })

  ctx.save()
  ctx.strokeStyle = withAlpha(t.accent, 0.14)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(W - 70, y + 150, 180, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = withAlpha(t.accent, 0.8)
  ctx.beginPath()
  ctx.arc(W - 300, y + 40, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const lines = measureLines(b.title, F.hero, INNER - 80)
  let cy = y + 78
  ctx.save()
  ctx.font = F.hero
  ctx.fillStyle = t.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line) => {
    ctx.fillText(line, PAD, cy)
    cy += 92
  })
  ctx.restore()

  cy += 14
  drawParagraph(ctx, b.subtitle, PAD, cy, INNER * 0.72, F.heroSub, t.muted, 44)
  drawText(ctx, b.meta, PAD, y + h - 28, F.meta, withAlpha(t.text, 0.45), {
    letter: 2,
  })
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  b: SectionBlock,
  y: number,
  t: Theme,
  F: Fonts,
) {
  const titleLines = measureLines(b.title, F.sectionTitle, INNER - 26)
  const cy0 = y + 6
  ctx.save()
  ctx.fillStyle = t.accent
  roundRect(ctx, PAD, cy0 + 9, 5, Math.min(34, titleLines.length * 34), 2.5)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.font = F.sectionTitle
  ctx.fillStyle = t.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  titleLines.forEach((line, i) => ctx.fillText(line, PAD + 26, cy0 + i * 48))
  ctx.restore()

  const bodyTop = cy0 + titleLines.length * 48 + 18
  drawParagraph(ctx, b.body, PAD + 26, bodyTop, INNER - 26, F.body, withAlpha(t.text, 0.72), 40)
}

function drawStats(
  ctx: CanvasRenderingContext2D,
  b: StatsBlock,
  y: number,
  h: number,
  t: Theme,
  F: Fonts,
) {
  card(ctx, y, h, t)
  const px = PAD + 40
  const pw = INNER - 80
  drawText(ctx, b.title, px, y + 36, F.cardTitle, t.text)

  const items = b.items.slice(0, 3)
  const colW = pw / Math.max(items.length, 1)
  const top = y + 118
  items.forEach((item, i) => {
    const cx = px + i * colW
    if (i > 0) {
      ctx.save()
      ctx.fillStyle = t.line
      ctx.fillRect(cx - 14, top - 6, 1, 132)
      ctx.restore()
    }
    drawText(ctx, item.value || '—', cx, top, F.statValue, t.accent)
    drawText(ctx, item.label, cx, top + 82, F.statLabel, t.muted, { letter: 1 })
  })
}

function drawTimeline(
  ctx: CanvasRenderingContext2D,
  b: TimelineBlock,
  y: number,
  h: number,
  t: Theme,
  F: Fonts,
) {
  card(ctx, y, h, t)
  const px = PAD + 40
  const pw = INNER - 80
  drawText(ctx, b.title, px, y + 36, F.cardTitle, t.text)

  const items = b.items.slice(0, 3)
  const lineX = px + 12
  const firstY = y + 104
  const lastY = firstY + (items.length - 1) * 108

  if (items.length > 1) {
    ctx.save()
    ctx.strokeStyle = t.line
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(lineX, firstY + 6)
    ctx.lineTo(lineX, lastY + 6)
    ctx.stroke()
    ctx.restore()
  }

  items.forEach((item, i) => {
    const iy = firstY + i * 108
    ctx.save()
    ctx.fillStyle = t.accent
    ctx.beginPath()
    ctx.arc(lineX, iy + 6, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    drawText(ctx, item.time, px + 34, iy - 4, F.time, t.accent, { letter: 1 })
    drawText(ctx, item.title, px + 34, iy + 18, F.itemTitle, t.text)
    drawParagraph(ctx, item.desc, px + 34, iy + 52, pw - 40, F.itemDesc, t.muted, 24)
  })
}

function drawQuote(
  ctx: CanvasRenderingContext2D,
  b: QuoteBlock,
  y: number,
  h: number,
  t: Theme,
  F: Fonts,
) {
  card(ctx, y, h, t)
  const px = PAD + 48
  drawText(ctx, '“', px - 4, y + 10, F.quoteMark, withAlpha(t.accent, 0.3))

  const lines = measureLines(b.text, F.quote, INNER - 120)
  let cy = y + 96
  ctx.save()
  ctx.font = F.quote
  ctx.fillStyle = t.text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line) => {
    ctx.fillText(line, px, cy)
    cy += 50
  })
  ctx.restore()

  drawText(ctx, b.author, px, cy + 18, F.quoteAuthor, t.muted, { letter: 1 })
}

function drawImageBlock(
  ctx: CanvasRenderingContext2D,
  b: ImageBlock,
  y: number,
  t: Theme,
  F: Fonts,
) {
  const img = ensureImage(b.src)
  if (img && img.complete && img.naturalWidth) {
    drawImageCover(ctx, img, PAD, y, INNER, IMG_H, 24)
  } else {
    ctx.save()
    ctx.fillStyle = t.card
    roundRect(ctx, PAD, y, INNER, IMG_H, 24)
    ctx.fill()
    ctx.strokeStyle = t.line
    ctx.setLineDash([8, 8])
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
    drawText(
      ctx,
      b.src ? '图片加载中…' : '上传一张图片',
      PAD + INNER / 2,
      y + IMG_H / 2 - 8,
      F.caption,
      t.muted,
      { align: 'center' },
    )
  }

  if (b.caption) {
    drawText(ctx, b.caption, PAD, y + IMG_H + 14, F.caption, t.muted)
  }
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  y: number,
  h: number,
  t: Theme,
  F: Fonts,
) {
  switch (block.kind) {
    case 'hero':
      drawHero(ctx, block, y, h, t, F)
      break
    case 'section':
      drawSection(ctx, block, y, t, F)
      break
    case 'stats':
      drawStats(ctx, block, y, h, t, F)
      break
    case 'timeline':
      drawTimeline(ctx, block, y, h, t, F)
      break
    case 'quote':
      drawQuote(ctx, block, y, h, t, F)
      break
    case 'image':
      drawImageBlock(ctx, block, y, t, F)
      break
  }
}

function drawPage(ctx: CanvasRenderingContext2D) {
  void imgTick.value
  const t = THEMES[doc.theme]
  const F = fonts(t)
  const L = layout()

  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, W, L.total)

  const glow = ctx.createRadialGradient(W * 0.78, 0, 0, W * 0.78, 0, 900)
  glow.addColorStop(0, withAlpha(t.accent, 0.12))
  glow.addColorStop(1, withAlpha(t.accent, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, 900)

  for (const item of L.items) {
    drawBlock(ctx, item.block, item.y, item.h, t, F)
  }

  const fy = L.footerY
  ctx.fillStyle = t.line
  ctx.fillRect(PAD, fy, INNER, 1)
  ctx.fillStyle = t.accent
  ctx.fillRect(PAD, fy + 28, 6, 6)
  drawText(ctx, 'COVER STUDIO · INFO FLOW', PAD + 18, fy + 23, F.footer, t.muted, {
    letter: 3,
  })
  drawText(
    ctx,
    String(new Date().getFullYear()),
    PAD + INNER,
    fy + 23,
    F.footer,
    t.muted,
    { align: 'right', letter: 2 },
  )
}

useCanvasPreview(canvasEl, () => ({ width: W, height: layout().total }), drawPage)

/* ---------------- actions ---------------- */

const fileInput = ref<HTMLInputElement | null>(null)

function pickImage() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  const block = sel.value
  if (!file || !block || block.kind !== 'image') return
  const reader = new FileReader()
  reader.onload = () => {
    block.src = String(reader.result)
  }
  reader.readAsDataURL(file)
}

const exporting = ref(false)

async function doExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    const L = layout()
    const images = doc.blocks.filter(
      (b): b is ImageBlock => b.kind === 'image' && !!b.src,
    )
    await Promise.all(images.map((b) => loadImage(b.src).catch(() => null)))
    const ok = await exportCanvas(
      W,
      L.total,
      2,
      drawPage,
      `infoflow-${Date.now()}.png`,
    )
    toast(ok ? '已导出一图流 · 2×' : '导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

function reset() {
  doc.blocks = initialBlocks()
  doc.theme = 'midnight'
  selectedId.value = doc.blocks[0]?.id ?? null
}
</script>

<template>
  <div class="view">
    <header class="view-toolbar">
      <div class="view-title">
        <span class="view-kicker">TOOL 02</span>
        <strong>一图流</strong>
      </div>
      <span class="view-sub">纵向长图 · 自动排版 · 高清导出</span>
      <div class="toolbar-actions">
        <button class="ghost-btn" @click="reset">重置</button>
        <button class="primary-btn" :disabled="exporting" @click="doExport">
          <Icon name="download" :size="16" />
          <span>{{ exporting ? '导出中…' : '导出长图' }}</span>
          <em>2×</em>
        </button>
      </div>
    </header>

    <div class="view-body">
      <aside class="panel">
        <div class="panel-scroll">
          <div class="field">
            <span class="label">主题</span>
            <div class="seg">
              <button
                v-for="th in THEME_LIST"
                :key="th.id"
                :class="{ active: doc.theme === th.id }"
                @click="doc.theme = th.id"
              >
                {{ th.label }}
              </button>
            </div>
          </div>

          <div class="section">
            <div class="field-row">
              <span class="section-title">内容区块</span>
              <span class="hint">{{ doc.blocks.length }} 块</span>
            </div>

            <div class="block-list">
              <div
                v-for="b in doc.blocks"
                :key="b.id"
                class="block-row"
                :class="{ active: b.id === selectedId }"
                @click="pick(b.id)"
              >
                <span
                  class="block-dot"
                  :style="{ background: KIND_COLOR[b.kind] }"
                />
                <span class="block-label">{{ blockLabel(b) }}</span>
                <span class="block-kind">{{ KIND_LABEL[b.kind] }}</span>
                <button
                  class="mini-btn"
                  title="上移"
                  @click.stop="moveBlock(b.id, -1)"
                >
                  <Icon name="chevron-up" :size="13" />
                </button>
                <button
                  class="mini-btn"
                  title="下移"
                  @click.stop="moveBlock(b.id, 1)"
                >
                  <Icon name="chevron-down" :size="13" />
                </button>
                <button
                  class="mini-btn"
                  title="删除"
                  @click.stop="removeBlock(b.id)"
                >
                  <Icon name="trash" :size="13" />
                </button>
              </div>
            </div>

            <div class="block-add">
              <button
                v-for="k in KINDS"
                :key="k.id"
                class="soft-btn"
                @click="addBlock(k.id)"
              >
                + {{ k.label }}
              </button>
            </div>
          </div>

          <div v-if="sel" class="section">
            <h3 class="section-title">{{ KIND_LABEL[sel.kind] }}内容</h3>

            <template v-if="sel.kind === 'hero'">
              <div class="field">
                <span class="label">小标签</span>
                <input v-model="sel.eyebrow" class="ti" />
              </div>
              <div class="field">
                <span class="label">主标题</span>
                <textarea v-model="sel.title" rows="2" />
              </div>
              <div class="field">
                <span class="label">副标题</span>
                <textarea v-model="sel.subtitle" rows="2" />
              </div>
              <div class="field">
                <span class="label">页脚标记</span>
                <input v-model="sel.meta" class="ti" />
              </div>
            </template>

            <template v-else-if="sel.kind === 'section'">
              <div class="field">
                <span class="label">章节标题</span>
                <input v-model="sel.title" class="ti" />
              </div>
              <div class="field">
                <span class="label">正文</span>
                <textarea v-model="sel.body" rows="6" />
              </div>
            </template>

            <template v-else-if="sel.kind === 'stats'">
              <div class="field">
                <span class="label">区块标题</span>
                <input v-model="sel.title" class="ti" />
              </div>
              <div
                v-for="(item, i) in sel.items"
                :key="i"
                class="item-editor"
              >
                <span class="item-index">{{ i + 1 }}</span>
                <input v-model="item.value" class="ti" placeholder="数值" />
                <input v-model="item.label" class="ti" placeholder="说明" />
              </div>
            </template>

            <template v-else-if="sel.kind === 'timeline'">
              <div class="field">
                <span class="label">区块标题</span>
                <input v-model="sel.title" class="ti" />
              </div>
              <div
                v-for="(item, i) in sel.items"
                :key="i"
                class="item-editor col"
              >
                <div class="item-head">
                  <span class="item-index">{{ i + 1 }}</span>
                  <input v-model="item.time" class="ti" placeholder="01" />
                </div>
                <input v-model="item.title" class="ti" placeholder="标题" />
                <input v-model="item.desc" class="ti" placeholder="说明" />
              </div>
            </template>

            <template v-else-if="sel.kind === 'quote'">
              <div class="field">
                <span class="label">引用内容</span>
                <textarea v-model="sel.text" rows="4" />
              </div>
              <div class="field">
                <span class="label">署名</span>
                <input v-model="sel.author" class="ti" />
              </div>
            </template>

            <template v-else-if="sel.kind === 'image'">
              <template v-if="!sel.src">
                <button class="upload sm" @click="pickImage">
                  <Icon name="image" :size="22" />
                  <strong>上传图片</strong>
                  <small>JPG / PNG · 本地处理</small>
                </button>
              </template>
              <template v-else>
                <div class="thumb-sm">
                  <img :src="sel.src" alt="" />
                </div>
                <div class="btn-row">
                  <button class="soft-btn" @click="pickImage">更换图片</button>
                  <button class="soft-btn" @click="sel.src = ''">移除</button>
                </div>
              </template>
              <div class="field">
                <span class="label">图片说明</span>
                <input v-model="sel.caption" class="ti" />
              </div>
            </template>
          </div>

          <p class="tip">
            区块内容会自动测量高度，越长的文字会把画布撑得更高。导出为 2× 高清 PNG。
          </p>
        </div>
      </aside>

      <div class="preview-stage scroll">
        <canvas ref="canvasEl" class="preview-canvas" />
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />
  </div>
</template>
