<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, ref } from 'vue'
import Icon from '../components/Icon.vue'
import StageCanvas from '../components/StageCanvas.vue'
import TemplateCard from '../components/TemplateCard.vue'
import { TEMPLATES } from '../templates'
import { FONTS, WEIGHTS } from '../fonts'
import { exportPng } from '../render'
import {
  state,
  selected,
  selectedText,
  canUndo,
  canRedo,
  select,
  addText,
  addImageLayer,
  addShape,
  applyTemplate,
  undo,
  redo,
  removeLayer,
  removeSelected,
  toggleHidden,
  moveLayer,
  duplicateSelected,
  resetDoc,
  setDocSize,
  updateLayer,
} from '../store'
import type { Background, Layer } from '../types'

const tab = ref<'template' | 'text' | 'bg' | 'layers'>('template')

const TABS = [
  { id: 'template', label: '模板', icon: 'template' },
  { id: 'text', label: '文字', icon: 'text' },
  { id: 'bg', label: '背景', icon: 'image' },
  { id: 'layers', label: '图层', icon: 'layers' },
] as const

const SIZES = [
  { label: '公众号首图 · 2.35:1', w: 900, h: 383 },
  { label: '视频封面 · 16:9', w: 1280, h: 720 },
  { label: '全高清 · 16:9', w: 1920, h: 1080 },
  { label: '方形 · 1:1', w: 1080, h: 1080 },
  { label: '竖版 · 3:4', w: 1080, h: 1440 },
]

const SOLIDS = ['#f3ede1', '#ffd60a', '#111214', '#0e3d63', '#ff7a45', '#e9e4ff']
const GRADIENTS = [
  { from: '#0b0b0c', to: '#1c1812', label: '墨' },
  { from: '#ff3d81', to: '#6a2cff', label: '霓' },
  { from: '#24324a', to: '#b96a4e', label: '暮' },
  { from: '#050e1c', to: '#0e3d63', label: '海' },
  { from: '#f6d365', to: '#fda085', label: '蜜' },
  { from: '#e8e8e3', to: '#b8c6c0', label: '雾' },
]

const bg = computed(() => state.doc.background)
const layerList = computed(() => [...state.doc.layers].reverse())

const sizeKey = computed(() => {
  const match = SIZES.find(
    (s) => s.w === state.doc.width && s.h === state.doc.height,
  )
  return match ? `${match.w}x${match.h}` : 'custom'
})

function onSizeChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  if (value === 'custom') return
  const [w, h] = value.split('x').map(Number)
  if (w && h) setDocSize(w, h)
}

function onWidth(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (v >= 100) setDocSize(Math.min(v, 4000), state.doc.height)
}

function onHeight(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (v >= 100) setDocSize(state.doc.width, Math.min(v, 4000))
}

function patchSel(patch: Record<string, unknown>) {
  if (selected.value) updateLayer(selected.value.id, patch)
}

function setBgType(type: Background['type']) {
  const current = state.doc.background
  if (current.type === type) return
  if (type === 'solid') {
    state.doc.background = { type: 'solid', color: '#f3ede1' }
  } else if (type === 'gradient') {
    state.doc.background = {
      type: 'gradient',
      from: '#24324a',
      to: '#b96a4e',
      angle: 135,
    }
  } else {
    state.doc.background = {
      type: 'image',
      src: '',
      fit: 'cover',
      blur: 0,
      dim: 0.25,
    }
  }
}

function patchBg(patch: Record<string, unknown>) {
  Object.assign(state.doc.background, patch)
}

function applyGradient(g: { from: string; to: string }) {
  if (state.doc.background.type !== 'gradient') return
  Object.assign(state.doc.background, { from: g.from, to: g.to })
}

function toggleHighlight() {
  const t = selectedText.value
  if (!t) return
  t.highlight = !t.highlight
  if (t.highlight && !t.highlightColor) {
    t.highlightColor = t.color === '#ffffff' ? '#ff7a45' : '#141414'
  }
}

function layerLabel(layer: Layer) {
  if (layer.name) return layer.name
  if (layer.kind === 'text') {
    const first = layer.text.split('\n')[0].trim()
    return first ? first.slice(0, 14) : '文字'
  }
  if (layer.kind === 'image') return '图片'
  return layer.shape === 'ellipse' ? '圆形' : '矩形'
}

function layerIcon(layer: Layer) {
  if (layer.kind === 'text') return 'text'
  if (layer.kind === 'image') return 'image'
  return 'shape'
}

function onOpacity(e: Event) {
  patchSel({ opacity: Number((e.target as HTMLInputElement).value) })
}

/* ---------- uploads ---------- */

const bgInput = ref<HTMLInputElement | null>(null)
const imgInput = ref<HTMLInputElement | null>(null)
const imgMode = ref<'add' | 'replace'>('add')

function pickImage() {
  imgMode.value = 'add'
  imgInput.value?.click()
}

function replaceImage() {
  imgMode.value = 'replace'
  imgInput.value?.click()
}

function onImageFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const src = String(reader.result)
    if (imgMode.value === 'replace' && selected.value?.kind === 'image') {
      updateLayer(selected.value.id, { src })
    } else {
      addImageLayer(src)
    }
  }
  reader.readAsDataURL(file)
}

function onBgFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const src = String(reader.result)
    if (state.doc.background.type === 'image') {
      state.doc.background.src = src
    } else {
      state.doc.background = { type: 'image', src, fit: 'cover', blur: 0, dim: 0.25 }
    }
  }
  reader.readAsDataURL(file)
}

function clearBgImage() {
  if (state.doc.background.type === 'image') state.doc.background.src = ''
}

/* ---------- export ---------- */

const exporting = ref(false)
const message = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

function toast(text: string) {
  message.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    message.value = ''
  }, 2200)
}

async function doExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    const blob = await exportPng(state.doc, 2)
    if (!blob) throw new Error('render failed')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-${state.doc.width}x${state.doc.height}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 3000)
    toast('已导出 PNG · 2×')
  } catch {
    toast('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

/* ---------- keyboard ---------- */

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
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    if (e.shiftKey) redo()
    else undo()
    return
  }
  if (mod && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    redo()
    return
  }
  if (mod && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    duplicateSelected()
    return
  }
  if (isTyping(e)) return
  if (e.key === 'Escape') {
    select(null)
    return
  }
  const layer = selected.value
  if ((e.key === 'Delete' || e.key === 'Backspace') && layer) {
    e.preventDefault()
    removeSelected()
    return
  }
  if (!layer) return
  const step = e.shiftKey ? 10 : 1
  if (e.key === 'ArrowLeft') {
    layer.x -= step
    e.preventDefault()
  } else if (e.key === 'ArrowRight') {
    layer.x += step
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    layer.y -= step
    e.preventDefault()
  } else if (e.key === 'ArrowDown') {
    layer.y += step
    e.preventDefault()
  }
}

onActivated(() => window.addEventListener('keydown', onKey))
onDeactivated(() => window.removeEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="view-title">
        <span class="view-kicker">COVER</span>
        <strong>封面编辑器</strong>
      </div>

      <div class="doc-meta">
        <select class="size-select" :value="sizeKey" @change="onSizeChange">
          <option v-for="s in SIZES" :key="s.label" :value="`${s.w}x${s.h}`">
            {{ s.label }}
          </option>
          <option value="custom">自定义尺寸</option>
        </select>
        <span class="dims">{{ state.doc.width }} × {{ state.doc.height }}</span>
      </div>

      <div class="actions">
        <button
          class="icon-btn"
          title="撤销 (Ctrl+Z)"
          :disabled="!canUndo"
          @click="undo"
        >
          <Icon name="undo" />
        </button>
        <button
          class="icon-btn"
          title="重做 (Ctrl+Shift+Z)"
          :disabled="!canRedo"
          @click="redo"
        >
          <Icon name="redo" />
        </button>
        <span class="top-divider" />
        <button class="ghost-btn" @click="resetDoc">重置</button>
        <button class="primary-btn" :disabled="exporting" @click="doExport">
          <Icon name="download" :size="16" />
          <span>{{ exporting ? '导出中…' : '导出 PNG' }}</span>
          <em>2×</em>
        </button>
      </div>
    </header>

    <div class="workspace">
      <aside class="panel">
        <nav class="tabs">
          <button
            v-for="t in TABS"
            :key="t.id"
            :class="{ active: tab === t.id }"
            @click="tab = t.id"
          >
            <Icon :name="t.icon" :size="17" />
            <span>{{ t.label }}</span>
          </button>
        </nav>

        <div class="panel-body">
          <!-- templates -->
          <section v-if="tab === 'template'" class="pane">
            <div class="pane-head">
              <h2>封面模板</h2>
              <p>选一个起点，再换成你的内容。</p>
            </div>
            <div class="tpl-grid">
              <TemplateCard
                v-for="t in TEMPLATES"
                :key="t.id"
                :template="t"
                @apply="applyTemplate(t.build())"
              />
            </div>
            <p class="tip">应用模板会替换当前画布，可用 Ctrl+Z 撤销。</p>
          </section>

          <!-- text -->
          <section v-if="tab === 'text'" class="pane">
            <div class="pane-head">
              <h2>文字</h2>
              <p>添加图层，或编辑选中的文字。</p>
            </div>
            <div class="add-row">
              <button class="soft-btn" @click="addText('title')">+ 大标题</button>
              <button class="soft-btn" @click="addText('subtitle')">+ 副标题</button>
              <button class="soft-btn" @click="addText('body')">+ 正文</button>
            </div>

            <template v-if="selectedText">
              <div class="field">
                <div class="field-row">
                  <span class="label">内容</span>
                  <span class="hint">Enter 换行</span>
                </div>
                <textarea v-model="selectedText.text" rows="3" />
              </div>

              <div class="field">
                <span class="label">字体</span>
                <select v-model="selectedText.fontFamily">
                  <option v-for="f in FONTS" :key="f.label" :value="f.value">
                    {{ f.label }}
                  </option>
                </select>
              </div>

              <div class="field">
                <div class="field-row">
                  <span class="label">字号</span>
                  <input
                    v-model.number="selectedText.fontSize"
                    class="num"
                    type="number"
                    min="10"
                    max="320"
                  />
                </div>
                <input
                  v-model.number="selectedText.fontSize"
                  type="range"
                  min="10"
                  max="320"
                  step="1"
                />
              </div>

              <div class="field-row two">
                <div class="field">
                  <span class="label">字重</span>
                  <select v-model.number="selectedText.fontWeight">
                    <option v-for="w in WEIGHTS" :key="w.value" :value="w.value">
                      {{ w.label }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <span class="label">颜色</span>
                  <div class="color-row">
                    <input v-model="selectedText.color" type="color" />
                    <span class="hex">{{ selectedText.color }}</span>
                  </div>
                </div>
              </div>

              <div class="field">
                <span class="label">对齐与样式</span>
                <div class="btn-row">
                  <div class="seg small">
                    <button
                      :class="{ active: selectedText.align === 'left' }"
                      @click="selectedText.align = 'left'"
                    >
                      左
                    </button>
                    <button
                      :class="{ active: selectedText.align === 'center' }"
                      @click="selectedText.align = 'center'"
                    >
                      中
                    </button>
                    <button
                      :class="{ active: selectedText.align === 'right' }"
                      @click="selectedText.align = 'right'"
                    >
                      右
                    </button>
                  </div>
                  <button
                    class="toggle"
                    :class="{ active: selectedText.italic }"
                    @click="selectedText.italic = !selectedText.italic"
                  >
                    斜体
                  </button>
                  <button
                    class="toggle"
                    :class="{ active: selectedText.shadow }"
                    @click="selectedText.shadow = !selectedText.shadow"
                  >
                    阴影
                  </button>
                </div>
              </div>

              <div class="field-row two">
                <div class="field">
                  <div class="field-row">
                    <span class="label">行高</span>
                    <span class="hint">{{ selectedText.lineHeight.toFixed(2) }}</span>
                  </div>
                  <input
                    v-model.number="selectedText.lineHeight"
                    type="range"
                    min="0.8"
                    max="2.6"
                    step="0.02"
                  />
                </div>
                <div class="field">
                  <div class="field-row">
                    <span class="label">字距</span>
                    <span class="hint">{{ selectedText.letterSpacing }}px</span>
                  </div>
                  <input
                    v-model.number="selectedText.letterSpacing"
                    type="range"
                    min="-4"
                    max="24"
                    step="0.5"
                  />
                </div>
              </div>

              <div class="field">
                <div class="field-row">
                  <span class="label">文字高亮</span>
                  <button
                    class="switch"
                    :class="{ on: selectedText.highlight }"
                    @click="toggleHighlight"
                  />
                </div>
                <div v-if="selectedText.highlight" class="color-row">
                  <input v-model="selectedText.highlightColor" type="color" />
                  <span class="hex">高亮底色</span>
                </div>
              </div>

              <div class="field">
                <div class="field-row">
                  <span class="label">文字宽度</span>
                  <input
                    v-model.number="selectedText.w"
                    class="num"
                    type="number"
                    min="60"
                    max="4000"
                  />
                </div>
                <input
                  v-model.number="selectedText.w"
                  type="range"
                  min="60"
                  :max="state.doc.width"
                  step="1"
                />
              </div>
            </template>

            <div v-else class="empty">
              <Icon name="text" :size="22" />
              <p>还没有选中文字图层</p>
              <small>点画布上的文字，或从上方添加一个</small>
            </div>
          </section>

          <!-- background -->
          <section v-if="tab === 'bg'" class="pane">
            <div class="pane-head">
              <h2>背景</h2>
              <p>纯色、渐变，或上传一张图片。</p>
            </div>

            <div class="seg">
              <button :class="{ active: bg.type === 'solid' }" @click="setBgType('solid')">
                纯色
              </button>
              <button
                :class="{ active: bg.type === 'gradient' }"
                @click="setBgType('gradient')"
              >
                渐变
              </button>
              <button :class="{ active: bg.type === 'image' }" @click="setBgType('image')">
                图片
              </button>
            </div>

            <template v-if="bg.type === 'solid'">
              <div class="field">
                <span class="label">颜色</span>
                <div class="color-row">
                  <input v-model="bg.color" type="color" />
                  <span class="hex">{{ bg.color }}</span>
                </div>
              </div>
              <div class="swatches">
                <button
                  v-for="c in SOLIDS"
                  :key="c"
                  :style="{ background: c }"
                  @click="patchBg({ color: c })"
                />
              </div>
            </template>

            <template v-else-if="bg.type === 'gradient'">
              <div class="grad-preview" :style="{ background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` }" />
              <div class="field-row two">
                <div class="field">
                  <span class="label">起始色</span>
                  <input v-model="bg.from" type="color" />
                </div>
                <div class="field">
                  <span class="label">结束色</span>
                  <input v-model="bg.to" type="color" />
                </div>
              </div>
              <div class="field">
                <div class="field-row">
                  <span class="label">角度</span>
                  <span class="hint">{{ bg.angle }}°</span>
                </div>
                <input v-model.number="bg.angle" type="range" min="0" max="360" step="1" />
              </div>
              <div class="swatches grad">
                <button
                  v-for="g in GRADIENTS"
                  :key="g.label"
                  :title="g.label"
                  :style="{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }"
                  @click="applyGradient(g)"
                />
              </div>
            </template>

            <template v-else>
              <div v-if="!bg.src" class="upload" @click="bgInput?.click()">
                <Icon name="image" :size="26" />
                <strong>选择背景图片</strong>
                <small>JPG / PNG / WebP · 本地处理，不会上传</small>
              </div>
              <template v-else>
                <div class="bg-thumb">
                  <img :src="bg.src" alt="背景预览" />
                </div>
                <div class="btn-row">
                  <button class="soft-btn" @click="bgInput?.click()">更换图片</button>
                  <button class="soft-btn" @click="clearBgImage">移除</button>
                </div>
              </template>

              <div class="field">
                <span class="label">填充方式</span>
                <div class="seg small">
                  <button :class="{ active: bg.fit === 'cover' }" @click="bg.fit = 'cover'">
                    填满
                  </button>
                  <button
                    :class="{ active: bg.fit === 'contain' }"
                    @click="bg.fit = 'contain'"
                  >
                    完整
                  </button>
                </div>
              </div>
              <div class="field">
                <div class="field-row">
                  <span class="label">模糊</span>
                  <span class="hint">{{ bg.blur }}px</span>
                </div>
                <input v-model.number="bg.blur" type="range" min="0" max="40" step="1" />
              </div>
              <div class="field">
                <div class="field-row">
                  <span class="label">暗化</span>
                  <span class="hint">{{ Math.round(bg.dim * 100) }}%</span>
                </div>
                <input
                  v-model.number="bg.dim"
                  type="range"
                  min="0"
                  max="0.85"
                  step="0.01"
                />
              </div>
            </template>

            <div class="section">
              <h3 class="section-title">画布尺寸</h3>
              <div class="field-row two">
                <label class="mini-field">
                  <span>宽</span>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    :value="state.doc.width"
                    @change="onWidth"
                  />
                </label>
                <label class="mini-field">
                  <span>高</span>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    :value="state.doc.height"
                    @change="onHeight"
                  />
                </label>
              </div>
            </div>
          </section>

          <!-- layers -->
          <section v-if="tab === 'layers'" class="pane">
            <div class="pane-head">
              <h2>图层</h2>
              <p>从上到下就是绘制顺序。</p>
            </div>

            <div class="add-row">
              <button class="soft-btn" @click="addShape('ellipse')">+ 圆形</button>
              <button class="soft-btn" @click="addShape('rect')">+ 矩形</button>
              <button class="soft-btn" @click="pickImage">+ 图片</button>
            </div>

            <div class="layer-list">
              <div
                v-for="l in layerList"
                :key="l.id"
                class="layer-row"
                :class="{ active: l.id === state.selectedId, dimmed: l.hidden }"
                @click="select(l.id)"
              >
                <span class="layer-icon"><Icon :name="layerIcon(l)" :size="14" /></span>
                <span class="layer-name">{{ layerLabel(l) }}</span>
                <button
                  class="mini-btn"
                  :title="l.hidden ? '显示' : '隐藏'"
                  @click.stop="toggleHidden(l.id)"
                >
                  <Icon :name="l.hidden ? 'eye-off' : 'eye'" :size="14" />
                </button>
                <button class="mini-btn" title="删除" @click.stop="removeLayer(l.id)">
                  <Icon name="trash" :size="14" />
                </button>
              </div>
            </div>

            <div v-if="!state.doc.layers.length" class="empty">
              <Icon name="layers" :size="22" />
              <p>画布还是空的</p>
              <small>从「文字」或上方按钮添加图层</small>
            </div>

            <template v-if="selected">
              <div class="row-btns">
                <button class="soft-btn" @click="moveLayer(selected.id, 1)">上移</button>
                <button class="soft-btn" @click="moveLayer(selected.id, -1)">下移</button>
                <button class="soft-btn" @click="duplicateSelected">复制</button>
                <button class="soft-btn danger" @click="removeSelected">删除</button>
              </div>

              <div class="section">
                <h3 class="section-title">位置与尺寸</h3>
                <div class="grid-2">
                  <label class="mini-field"><span>X</span><input v-model.number="selected.x" type="number" /></label>
                  <label class="mini-field"><span>Y</span><input v-model.number="selected.y" type="number" /></label>
                  <label class="mini-field"><span>宽</span><input v-model.number="selected.w" type="number" min="1" /></label>
                  <label v-if="selected.kind !== 'text'" class="mini-field">
                    <span>高</span><input v-model.number="selected.h" type="number" min="1" />
                  </label>
                </div>
              </div>

              <div class="field">
                <div class="field-row">
                  <span class="label">不透明度</span>
                  <span class="hint">{{ Math.round((selected.opacity ?? 1) * 100) }}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  :value="selected.opacity ?? 1"
                  @input="onOpacity"
                />
              </div>

              <div v-if="selected.kind === 'image'" class="section">
                <h3 class="section-title">图片</h3>
                <div class="btn-row">
                  <button class="soft-btn" @click="replaceImage">替换图片</button>
                </div>
                <div class="field">
                  <span class="label">填充</span>
                  <div class="seg small">
                    <button :class="{ active: selected.fit === 'cover' }" @click="selected.fit = 'cover'">
                      填满
                    </button>
                    <button
                      :class="{ active: selected.fit === 'contain' }"
                      @click="selected.fit = 'contain'"
                    >
                      完整
                    </button>
                  </div>
                </div>
                <div class="field">
                  <div class="field-row">
                    <span class="label">圆角</span>
                    <span class="hint">{{ selected.radius }}px</span>
                  </div>
                  <input v-model.number="selected.radius" type="range" min="0" max="160" step="1" />
                </div>
              </div>

              <div v-if="selected.kind === 'shape'" class="field">
                <span class="label">颜色</span>
                <div class="color-row">
                  <input v-model="selected.color" type="color" />
                  <span class="hex">{{ selected.color }}</span>
                </div>
              </div>
            </template>
          </section>
        </div>
      </aside>

      <StageCanvas />
    </div>

    <input ref="bgInput" type="file" accept="image/*" hidden @change="onBgFile" />
    <input ref="imgInput" type="file" accept="image/*" hidden @change="onImageFile" />

    <Transition name="toast">
      <div v-if="message" class="toast">{{ message }}</div>
    </Transition>
  </div>
</template>
