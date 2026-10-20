<script setup lang="ts">
import {
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  reactive,
  ref,
  watchEffect,
} from 'vue'
import Icon from '../components/Icon.vue'
import SlideThumb from '../components/SlideThumb.vue'
import { useCanvasPreview } from '../lib/useCanvasPreview'
import { exportCanvas, loadImage } from '../lib/draw'
import { toast } from '../lib/toast'
import {
  SLIDE_H,
  SLIDE_THEMES,
  SLIDE_W,
  createSlide,
  drawSlide,
  slideId,
} from '../lib/slides'
import type { Slide, SlideLayout, SlideThemeId } from '../lib/slides'

const THEME_LIST = Object.values(SLIDE_THEMES)
const LAYOUTS: { id: SlideLayout; label: string }[] = [
  { id: 'title', label: '标题' },
  { id: 'bullets', label: '要点' },
  { id: 'quote', label: '引用' },
  { id: 'image', label: '图文' },
]

function initialSlides(): Slide[] {
  return [
    {
      ...createSlide('title'),
      title: '把想法\n讲成故事',
      subtitle: '一份关于设计、叙事与表达的整理。',
    },
    {
      ...createSlide('bullets'),
      title: '三个关键动作',
      bullets: ['先写一句结论，再展开论证', '用一页只讲一件事', '留白比堆满更有力量'],
    },
    {
      ...createSlide('quote'),
      quote: '好的演示不是读完所有字，\n而是让人记住一句话。',
      author: '— 设计笔记',
    },
    {
      ...createSlide('image'),
      title: '留一点空白',
      caption: '图片可替换为你的作品或产品截图。',
    },
  ]
}

const doc = reactive<{ theme: SlideThemeId; slides: Slide[] }>({
  theme: 'midnight',
  slides: initialSlides(),
})

const current = ref(0)
const currentSlide = computed(() => doc.slides[current.value] ?? null)

const bulletsText = computed({
  get: () => currentSlide.value?.bullets.join('\n') ?? '',
  set: (value: string) => {
    if (!currentSlide.value) return
    currentSlide.value.bullets = value.split('\n')
  },
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
const imgVersion = ref(0)

useCanvasPreview(
  canvasEl,
  () => ({ width: SLIDE_W, height: SLIDE_H }),
  (ctx) => {
    void imgVersion.value
    const slide = currentSlide.value
    if (!slide) return
    drawSlide(ctx, slide, SLIDE_THEMES[doc.theme], current.value, doc.slides.length)
  },
)

/* ---------------- editing ---------------- */

function addSlide() {
  const slide = createSlide('title')
  slide.title = '新的一页'
  doc.slides.splice(current.value + 1, 0, slide)
  current.value += 1
}

function duplicateSlide() {
  const slide = currentSlide.value
  if (!slide) return
  const copy = JSON.parse(JSON.stringify(slide)) as Slide
  copy.id = slideId()
  doc.slides.splice(current.value + 1, 0, copy)
  current.value += 1
}

function deleteSlide() {
  if (doc.slides.length <= 1) {
    toast('至少保留一页')
    return
  }
  doc.slides.splice(current.value, 1)
  current.value = Math.min(current.value, doc.slides.length - 1)
}

function moveSlide(dir: -1 | 1) {
  const from = current.value
  const to = from + dir
  if (to < 0 || to >= doc.slides.length) return
  const [slide] = doc.slides.splice(from, 1)
  doc.slides.splice(to, 0, slide)
  current.value = to
}

const fileInput = ref<HTMLInputElement | null>(null)

function pickImage() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !currentSlide.value) return
  const reader = new FileReader()
  reader.onload = () => {
    const src = String(reader.result)
    if (!currentSlide.value) return
    currentSlide.value.image = src
    imgVersion.value += 1
    loadImage(src)
      .then(() => {
        imgVersion.value += 1
      })
      .catch(() => undefined)
  }
  reader.readAsDataURL(file)
}

/* ---------------- presentation ---------------- */

const playing = ref(false)
const presentIndex = ref(0)
const presentCanvas = ref<HTMLCanvasElement | null>(null)

function openPresent() {
  presentIndex.value = current.value
  playing.value = true
}

function closePresent() {
  current.value = presentIndex.value
  playing.value = false
}

function nextPresent() {
  presentIndex.value = Math.min(doc.slides.length - 1, presentIndex.value + 1)
}

function prevPresent() {
  presentIndex.value = Math.max(0, presentIndex.value - 1)
}

watchEffect(
  () => {
    if (!playing.value) return
    const el = presentCanvas.value
    if (!el) return
    const slide = doc.slides[presentIndex.value]
    if (!slide) return
    void imgVersion.value
    el.width = 1920
    el.height = 1080
    const ctx = el.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1.5, 0, 0, 1.5, 0, 0)
    drawSlide(
      ctx,
      slide,
      SLIDE_THEMES[doc.theme],
      presentIndex.value,
      doc.slides.length,
    )
  },
  { flush: 'post' },
)

/* ---------------- keyboard & export ---------------- */

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (!t) return false
  return (
    t.tagName === 'INPUT' ||
    t.tagName === 'TEXTAREA' ||
    t.tagName === 'SELECT' ||
    t.isContentEditable
  )
}

function onKey(e: KeyboardEvent) {
  if (playing.value) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closePresent()
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault()
      nextPresent()
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      prevPresent()
    }
    return
  }
  if (isTyping(e)) return
  if (e.key === 'ArrowRight') {
    current.value = Math.min(doc.slides.length - 1, current.value + 1)
  } else if (e.key === 'ArrowLeft') {
    current.value = Math.max(0, current.value - 1)
  }
}

onActivated(() => window.addEventListener('keydown', onKey))
onDeactivated(() => window.removeEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const exporting = ref(false)

async function renderSlide(index: number, filename: string) {
  const slide = doc.slides[index]
  if (!slide) return false
  if (slide.image) await loadImage(slide.image).catch(() => null)
  return exportCanvas(
    SLIDE_W,
    SLIDE_H,
    2,
    (ctx) => drawSlide(ctx, slide, SLIDE_THEMES[doc.theme], index, doc.slides.length),
    filename,
  )
}

async function exportCurrent() {
  if (!currentSlide.value) return
  const ok = await renderSlide(current.value, `slide-${current.value + 1}.png`)
  toast(ok ? '已导出本页 · 2×' : '导出失败，请重试')
}

async function exportAll() {
  if (exporting.value) return
  exporting.value = true
  try {
    let count = 0
    for (let i = 0; i < doc.slides.length; i += 1) {
      const ok = await renderSlide(
        i,
        `slide-${String(i + 1).padStart(2, '0')}.png`,
      )
      if (ok) count += 1
      await new Promise((resolve) => setTimeout(resolve, 320))
    }
    toast(`已导出 ${count} 页幻灯片`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="view">
    <header class="view-toolbar">
      <div class="view-title">
        <span class="view-kicker">TOOL 04</span>
        <strong>幻灯片</strong>
      </div>

      <select v-model="doc.theme" class="size-select" title="配色">
        <option v-for="t in THEME_LIST" :key="t.id" :value="t.id">
          {{ t.label }}
        </option>
      </select>
      <span class="view-sub">{{ doc.slides.length }} 页 · 16:9</span>

      <div class="toolbar-actions">
        <button class="ghost-btn" @click="openPresent">
          <Icon name="play" :size="14" />
          播放
        </button>
        <button class="ghost-btn" :disabled="exporting" @click="exportAll">
          {{ exporting ? '导出中…' : '全部导出' }}
        </button>
        <button class="primary-btn" @click="exportCurrent">
          <Icon name="download" :size="16" />
          导出本页
        </button>
      </div>
    </header>

    <div class="view-body">
      <aside class="panel sm">
        <div class="panel-header">
          <h3>页面</h3>
          <span class="count">{{ doc.slides.length }} 页</span>
        </div>

        <div class="panel-scroll slide-list">
          <button
            v-for="(s, i) in doc.slides"
            :key="s.id"
            class="slide-row"
            :class="{ active: i === current }"
            @click="current = i"
          >
            <span class="slide-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <SlideThumb
              :slide="s"
              :theme="doc.theme"
              :index="i"
              :total="doc.slides.length"
            />
          </button>
        </div>

        <div class="panel-footer">
          <button class="soft-btn" @click="addSlide">+ 新建</button>
          <button class="soft-btn" @click="duplicateSlide">复制</button>
          <button class="soft-btn" title="上移" @click="moveSlide(-1)">↑</button>
          <button class="soft-btn" title="下移" @click="moveSlide(1)">↓</button>
          <button class="soft-btn danger" @click="deleteSlide">删除</button>
        </div>
      </aside>

      <div class="preview-stage">
        <canvas ref="canvasEl" class="preview-canvas" />
      </div>

      <aside class="panel lg">
        <div class="panel-header">
          <h3>本页内容</h3>
          <span class="count">{{ current + 1 }} / {{ doc.slides.length }}</span>
        </div>

        <div v-if="currentSlide" class="panel-scroll">
          <div class="field">
            <span class="label">版式</span>
            <div class="seg four">
              <button
                v-for="l in LAYOUTS"
                :key="l.id"
                :class="{ active: currentSlide.layout === l.id }"
                @click="currentSlide.layout = l.id"
              >
                {{ l.label }}
              </button>
            </div>
          </div>

          <template v-if="currentSlide.layout === 'title'">
            <div class="field">
              <span class="label">标题</span>
              <textarea v-model="currentSlide.title" rows="2" />
            </div>
            <div class="field">
              <span class="label">副标题</span>
              <textarea v-model="currentSlide.subtitle" rows="2" />
            </div>
          </template>

          <template v-else-if="currentSlide.layout === 'bullets'">
            <div class="field">
              <span class="label">标题</span>
              <input v-model="currentSlide.title" class="ti" />
            </div>
            <div class="field">
              <div class="field-row">
                <span class="label">要点</span>
                <span class="hint">每行一条</span>
              </div>
              <textarea v-model="bulletsText" rows="6" />
            </div>
          </template>

          <template v-else-if="currentSlide.layout === 'quote'">
            <div class="field">
              <span class="label">引用内容</span>
              <textarea v-model="currentSlide.quote" rows="4" />
            </div>
            <div class="field">
              <span class="label">署名</span>
              <input v-model="currentSlide.author" class="ti" />
            </div>
          </template>

          <template v-else>
            <div class="field">
              <span class="label">标题</span>
              <textarea v-model="currentSlide.title" rows="2" />
            </div>

            <template v-if="!currentSlide.image">
              <button class="upload sm" @click="pickImage">
                <Icon name="image" :size="22" />
                <strong>上传图片</strong>
                <small>JPG / PNG · 本地处理</small>
              </button>
            </template>
            <template v-else>
              <div class="thumb-sm">
                <img :src="currentSlide.image" alt="" />
              </div>
              <div class="btn-row">
                <button class="soft-btn" @click="pickImage">更换图片</button>
                <button class="soft-btn" @click="currentSlide.image = ''">移除</button>
              </div>
            </template>

            <div class="field">
              <span class="label">图片说明</span>
              <input v-model="currentSlide.caption" class="ti" />
            </div>
          </template>

          <p class="tip">
            放映时使用方向键翻页，Esc 退出。导出的每一页都是 2× 高清 PNG。
          </p>
        </div>
      </aside>
    </div>

    <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />

    <Teleport to="body">
      <div v-if="playing" class="present">
        <canvas
          ref="presentCanvas"
          class="present-canvas"
          @click="nextPresent"
        />
        <div class="present-top">
          <span>{{ presentIndex + 1 }} / {{ doc.slides.length }}</span>
          <button class="present-close" title="退出放映" @click="closePresent">
            <Icon name="close" :size="18" />
          </button>
        </div>
        <div class="present-bottom">
          <button class="present-nav" title="上一页" @click="prevPresent">
            <Icon name="arrow-left" :size="18" />
          </button>
          <span class="present-hint">← → 切换 · Esc 退出</span>
          <button class="present-nav" title="下一页" @click="nextPresent">
            <Icon name="arrow-right" :size="18" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
