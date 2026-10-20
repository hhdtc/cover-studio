<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { t } from '../i18n'

const props = defineProps<{ id: string; label: string }>()

const albums = [
  { title: '日光留声', artist: 'RHINE', bg: 'linear-gradient(135deg,#f6c47b,#b74b32)' },
  { title: '夜航', artist: 'LANE 04', bg: 'linear-gradient(135deg,#20304f,#0a101d)' },
  { title: '雾中回声', artist: 'MIST', bg: 'linear-gradient(135deg,#b9c7cf,#5d7482)' },
  { title: '红色房间', artist: 'ROOM 9', bg: 'linear-gradient(135deg,#c1443c,#33100e)' },
  { title: '慢速星球', artist: 'ORBIT', bg: 'linear-gradient(135deg,#7f9f89,#20352c)' },
]

const shelfIndex = ref(0)
const cdOpen = ref(false)
const tab = ref<'library' | 'display'>('library')
const volume = ref(62)
const motion = ref(70)
const playing = ref(false)
const progress = ref(38)
const rulerValue = ref(5)
const rulerEl = ref<HTMLElement | null>(null)
const navScrubbing = ref(false)
const navAlbum = computed(() => albums[rulerValue.value % albums.length])
const theme = ref<'day' | 'night'>('night')
const query = ref('')
const lyricIndex = ref(1)
const selectedArtist = ref(2)
const queue = ref(['日光留声 · 01 雾中回声', '夜航 · 03 慢速星球', '雾中回声 · 02 潮汐'])
const albumIndex = ref(2)
const albumTotal = 8
const genreIndex = ref(0)
const genres = ['氛围音乐', '电子', '爵士', '器乐']
const fps = ref(35)
const efTheme = ref<'light' | 'dark'>('dark')
const efAccent = ref<'yellow' | 'cyan'>('yellow')
const efCheck = ref(true)
const efSeg = ref(0)
const efDialog = ref(false)
const efMotionKey = ref(0)
const demoKey = ref(0)
const nasaEra = ref<'mercury' | 'gemini' | 'apollo'>('apollo')
const aureolePart = ref(0)
const aureoleQuery = ref('')
const aureoleDensity = ref(68)
const aureoleParallax = ref(true)
const aureoleReduced = ref(false)
const aureoleLabels = ref(true)
const aureoleExport = ref('')
const aureoleParts = [
  { code: '01', name: 'SAINT / 圣徒', desc: 'Silver mantle, arc halo and a silent observation axis.' },
  { code: '02', name: 'AUREOLE / 光晕', desc: 'Concentric calibration rings around the head.' },
  { code: '03', name: 'RELIC / 圣器', desc: 'A floating instrument anchored by three leads.' },
]
const aureoleSpecimens = [
  { name: 'SAINT', code: '01', en: 'SANCTUS' },
  { name: 'FLIGHT', code: '02', en: 'PENNA' },
  { name: 'RELIC', code: '03', en: 'VAS' },
]
const aureoleFiltered = computed(() =>
  aureoleSpecimens.filter(
    (item) =>
      !aureoleQuery.value.trim() ||
      `${item.name} ${item.code} ${item.en}`.toLowerCase().includes(aureoleQuery.value.trim().toLowerCase()),
  ),
)
function exportAureole(kind: 'config' | 'specimen') {
  const payload =
    kind === 'config'
      ? { mode: 'observation', labels: aureoleLabels.value, parallax: aureoleParallax.value, reduced: aureoleReduced.value, density: aureoleDensity.value }
      : aureoleSpecimens[aureolePart.value % aureoleSpecimens.length]
  aureoleExport.value = JSON.stringify(payload)
}
const demoRoot = ref<HTMLElement | null>(null)
let demoObserver: IntersectionObserver | undefined
const openAlbum = ref(false)
const hudHover = ref(false)
const currentAlbum = computed(() => albums[(albumIndex.value - 1) % albums.length])
const artists = ['RHINE', 'LANE', 'MIST', 'ROOM', 'ORBIT', 'NOVA', 'ASH', 'TIDE']

const lyrics = [
  '沿着没有尽头的走廊',
  '把唱片放进光里',
  '让声音替我们记住',
  '这一刻的晨雾',
]

const filtered = computed(() =>
  albums.filter(
    (a) =>
      !query.value.trim() ||
      a.title.includes(query.value.trim()) ||
      a.artist.toLowerCase().includes(query.value.trim().toLowerCase()),
  ),
)

let timer: number | undefined
let fpsTimer: number | undefined

function onHudKey(e: KeyboardEvent) {
  if (props.id !== 'navhud' || !hudHover.value) return
  if (e.key === 'Escape') {
    openAlbum.value = false
    return
  }
  if (openAlbum.value) return
  if (e.key === 'ArrowUp') {
    albumIndex.value = albumIndex.value > 1 ? albumIndex.value - 1 : albumTotal
    e.preventDefault()
  } else if (e.key === 'ArrowDown') {
    albumIndex.value = albumIndex.value < albumTotal ? albumIndex.value + 1 : 1
    e.preventDefault()
  } else if (e.key === 'ArrowLeft') {
    genreIndex.value = (genreIndex.value + genres.length - 1) % genres.length
    e.preventDefault()
  } else if (e.key === 'ArrowRight') {
    genreIndex.value = (genreIndex.value + 1) % genres.length
    e.preventDefault()
  } else if (e.key === 'Enter') {
    openAlbum.value = true
    e.preventDefault()
  }
}

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    demoObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) demoKey.value++
      },
      { threshold: 0.35 },
    )
    if (demoRoot.value) demoObserver.observe(demoRoot.value)
  }
  window.addEventListener('keydown', onHudKey)
  timer = window.setInterval(() => {
    if (playing.value) progress.value = (progress.value + 1) % 100
  }, 650)
  fpsTimer = window.setInterval(() => {
    fps.value = 33 + Math.round(Math.random() * 5)
  }, 900)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (fpsTimer) clearInterval(fpsTimer)
  window.removeEventListener('keydown', onHudKey)
  demoObserver?.disconnect()
})

watch(
  () => props.id,
  () => {
    demoKey.value++
  },
)

const pad = (n: number) => String(n).padStart(2, '0')

function setRulerFromX(clientX: number) {
  const el = rulerEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left - 6) / Math.max(1, rect.width - 12)))
  rulerValue.value = Math.round(ratio * 12)
}

function startScrub(e: PointerEvent) {
  navScrubbing.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  setRulerFromX(e.clientX)
  e.preventDefault()
}

function moveScrub(e: PointerEvent) {
  if (navScrubbing.value) setRulerFromX(e.clientX)
}

function endScrub(e: PointerEvent) {
  navScrubbing.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
}

function nudgeRuler(delta: number) {
  rulerValue.value = Math.max(0, Math.min(12, rulerValue.value + delta))
}

function onRulerWheel(e: WheelEvent) {
  nudgeRuler(e.deltaY > 0 ? 1 : -1)
}

function onRulerKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    nudgeRuler(-1)
    e.preventDefault()
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nudgeRuler(1)
    e.preventDefault()
  } else if (e.key === 'Home') {
    rulerValue.value = 0
    e.preventDefault()
  } else if (e.key === 'End') {
    rulerValue.value = 12
    e.preventDefault()
  }
}

function moveQueue(index: number, dir: -1 | 1) {
  const next = index + dir
  if (next < 0 || next >= queue.value.length) return
  const copy = [...queue.value]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  queue.value = copy
}
</script>

<template>
  <div ref="demoRoot" class="mdemo" :class="`mdemo--${theme}`" @mouseenter="hudHover = true" @mouseleave="hudHover = false">
    <div class="mdemo-head">
      <span class="mdemo-kicker">VISUAL DEMO / INTERACTIVE</span>
      <div class="mdemo-head-right">
        <span class="mdemo-label">{{ label }}</span>
        <button class="mdemo-replay" @click="demoKey++">↻ {{ t('重播', 'Replay') }}</button>
      </div>
    </div>

    <div :key="demoKey" class="mdemo-stage">
      <!-- 3D shelf -->
      <template v-if="id === 'shelf'">
        <div class="shelf-row">
          <button
            v-for="(a, i) in albums"
            :key="a.title"
            class="shelf-album"
            :class="{ active: i === shelfIndex }"
            :style="{ '--i': i, background: a.bg }"
            @click="shelfIndex = i"
          >
            <span class="shelf-cover">{{ a.title.slice(0, 2) }}</span>
            <span class="shelf-name">{{ a.title }}</span>
          </button>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('← → 浏览 · 点击专辑', '← → browse · click an album') }}</span>
          <strong>{{ String(shelfIndex + 1).padStart(2, '0') }} / {{ String(albums.length).padStart(2, '0') }}</strong>
        </div>
      </template>

      <!-- CD case -->
      <template v-else-if="id === 'cd-case'">
        <button class="cd-stage" @click="cdOpen = !cdOpen">
          <span class="cd-case" :class="{ open: cdOpen }">
            <span class="cd-spine">RHINE LAB</span>
            <span class="cd-cover" :style="{ background: albums[shelfIndex].bg }">
              <em>{{ albums[shelfIndex].title }}</em>
              <small>{{ albums[shelfIndex].artist }}</small>
            </span>
            <span class="cd-shine" />
          </span>
        </button>
        <div class="mdemo-foot">
          <span>{{ t('玻璃盒 / 侧条 / 反光', 'Glass case / spine / reflection') }}</span>
          <strong>{{ cdOpen ? t('打开', 'Open') : t('合上', 'Close') }}</strong>
        </div>
      </template>

      <!-- overview -->
      <template v-else-if="id === 'overview'">
        <div class="artist-grid">
          <button
            v-for="(a, i) in artists"
            :key="a"
            class="artist-cell"
            :class="{ active: i === selectedArtist }"
            @click="selectedArtist = i"
          >
            <span class="artist-dot">{{ a.slice(0, 2) }}</span>
            <small>{{ a }}</small>
          </button>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('缩略图总览 · 歌手网格', 'Thumbnail overview · artist grid') }}</span>
          <strong>{{ artists[selectedArtist] }}</strong>
        </div>
      </template>

      <!-- settings -->
      <template v-else-if="id === 'settings'">
        <div class="mock-panel">
          <div class="mock-tabs">
            <button :class="{ active: tab === 'library' }" @click="tab = 'library'">{{ t('音乐库设置', 'Library') }}</button>
            <button :class="{ active: tab === 'display' }" @click="tab = 'display'">{{ t('画面与声音', 'Display & audio') }}</button>
          </div>
          <template v-if="tab === 'library'">
            <div class="mock-row"><span>{{ t('真实专辑列', 'Real album columns') }}</span><i class="mock-switch on" /></div>
            <div class="mock-text">{{ t('保留每列浏览位置', 'Keep position per column') }}</div>
            <div class="mock-row"><span>{{ t('专辑介绍', 'Album notes') }}</span><i class="mock-switch" /></div>
            <div class="mock-text">{{ t('文件夹与扫描 · 排列与浏览', 'Folders & scan · order & browsing') }}</div>
          </template>
          <template v-else>
            <div class="mock-row"><span>{{ t('音量', 'Volume') }}</span><b>{{ volume }}%</b></div>
            <input v-model.number="volume" type="range" min="0" max="100" />
            <div class="mock-row"><span>{{ t('动效强度', 'Motion') }}</span><b>{{ motion }}%</b></div>
            <input v-model.number="motion" type="range" min="0" max="100" />
          </template>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('双页设置 · 状态保留', 'Two-page settings · state kept') }}</span>
          <strong>{{ tab === 'library' ? 'LIBRARY' : 'DISPLAY' }}</strong>
        </div>
      </template>

      <!-- player -->
      <template v-else-if="id === 'player'">
        <div class="mock-player">
          <div class="mock-now">
            <span class="mock-cover" :style="{ background: albums[0].bg }" />
            <div>
              <strong>{{ albums[0].title }}</strong>
              <small>{{ albums[0].artist }} · 02 潮汐</small>
            </div>
          </div>
          <div class="mock-progress">
            <span :style="{ width: progress + '%' }" />
          </div>
          <div class="mock-transport">
            <button>⏮</button>
            <button class="play" @click="playing = !playing">{{ playing ? '⏸' : '▶' }}</button>
            <button>⏭</button>
            <span>{{ playing ? 'PLAYING' : 'PAUSED' }}</span>
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('播放进度 · 切歌动画', 'Progress · track transition') }}</span>
          <strong>{{ progress }}%</strong>
        </div>
      </template>

      <!-- navigation -->
      <template v-else-if="id === 'navigation'">
        <div
          ref="rulerEl"
          class="mock-ruler"
          :class="{ scrubbing: navScrubbing }"
          tabindex="0"
          @pointerdown="startScrub"
          @pointermove="moveScrub"
          @pointerup="endScrub"
          @pointercancel="endScrub"
          @wheel.prevent="onRulerWheel"
          @keydown="onRulerKey"
        >
          <div class="ruler-ticks">
            <button
              v-for="i in 13"
              :key="i"
              :class="{ active: rulerValue === i - 1 }"
              :style="{ height: i % 4 === 1 ? '22px' : '12px' }"
              @click="rulerValue = i - 1"
            />
          </div>
          <div class="ruler-pointer" :style="{ left: (rulerValue / 12) * 100 + '%' }" />
          <div class="ruler-caption">
            ALBUM {{ String(rulerValue + 1).padStart(2, '0') }} / 13
            <span>· {{ navAlbum.title }}</span>
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('点击 / 拖动 / 滚轮 / ← →', 'Click / drag / wheel / ← →') }}</span>
          <strong>{{ String(rulerValue + 1).padStart(2, '0') }} / 13</strong>
        </div>
      </template>

      <!-- theme -->
      <template v-else-if="id === 'theme'">
        <div class="theme-stage" :class="theme">
          <span class="theme-eyebrow">ONE ALBUM AT A TIME</span>
          <strong>{{ theme === 'day' ? t('晨雾', 'Morning Mist') : t('月影', 'Moon Shadow') }}</strong>
          <small>{{ theme === 'day' ? t('暖灰玻璃与清透封面', 'Warm glass and clear covers') : t('深蓝底色与冷白光感', 'Deep blue with cold light') }}</small>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('主题过渡 · 开场标语', 'Theme transition · opening line') }}</span>
          <button class="mdemo-btn" @click="theme = theme === 'day' ? 'night' : 'day'">
            {{ t('切换到', 'Switch to') }}{{ theme === 'day' ? t('月影', ' Moon Shadow') : t('晨雾', ' Morning Mist') }}
          </button>
        </div>
      </template>

      <!-- bottom navigation HUD -->
      <template v-else-if="id === 'navhud'">
        <div
          class="hud-demo"
          :style="{ '--album': albumIndex, '--genre': genreIndex }"
        >
          <div class="hud-shelves" aria-hidden="true">
            <span
              v-for="n in 9"
              :key="n"
              :class="{ on: n === albumIndex }"
            />
          </div>

          <div class="hud-content">
          <div class="hud-row">
            <div class="hud-counter">
              <span class="hud-eyebrow">ALBUM / SELECT</span>
              <div class="hud-number">
                <b :key="albumIndex">{{ pad(albumIndex) }}</b>
                <span>/ <i>{{ pad(albumTotal) }}</i></span>
              </div>
            </div>

            <div class="hud-stepper">
              <button aria-label="上一个专辑" @click="albumIndex = albumIndex > 1 ? albumIndex - 1 : albumTotal">↑</button>
              <span class="hud-track">
                <i v-for="n in albumTotal" :key="n" :class="{ on: n === albumIndex }" />
              </span>
              <button aria-label="下一个专辑" @click="albumIndex = albumIndex < albumTotal ? albumIndex + 1 : 1">↓</button>
            </div>

            <div class="hud-genre">
              <button aria-label="上一个流派" @click="genreIndex = (genreIndex + genres.length - 1) % genres.length">←</button>
              <div>
                <small>GENRE {{ pad(genreIndex + 1) }} / {{ pad(genres.length) }}</small>
                <strong :key="genreIndex">{{ genres[genreIndex] }}</strong>
              </div>
              <button aria-label="下一个流派" @click="genreIndex = (genreIndex + 1) % genres.length">→</button>
            </div>
          </div>

          <div class="hud-hint">
            {{ t('← → 流派', '← → genre') }} <span>／</span> {{ t('↑ ↓ 专辑', '↑ ↓ album') }} <span>／</span>
            <button class="hud-enter" @click="openAlbum = true">{{ t('ENTER 打开专辑', 'ENTER open album') }}</button>
          </div>

          <div class="hud-bottom">
            <span>LOCAL COLLECTION <i>·</i> DEMONSTRATION</span>
            <span class="hud-runtime">{{ t('rAF诊断', 'rAF') }} {{ fps }} FPS / 1228×668 / {{ t('深夜', 'Night') }} / WebGL 2 {{ t('显卡加速', 'GPU accelerated') }}</span>
          </div>
          </div>

          <Transition name="hud-detail">
            <div v-if="openAlbum" class="hud-album-detail">
              <button class="hud-back" @click="openAlbum = false">{{ t('← 返回专辑架', '← Back to shelf') }} <kbd>ESC</kbd></button>
              <div class="hud-detail-card">
                <span class="hud-detail-cover" :style="{ background: currentAlbum.bg }">
                  {{ currentAlbum.title.slice(0, 2) }}
                </span>
                <small>ALBUM {{ String(albumIndex).padStart(2, '0') }}</small>
                <strong>{{ currentAlbum.title }}</strong>
                <em>{{ currentAlbum.artist }}</em>
                <span class="hud-detail-meta">2026 · 12 TRACKS · 00:48:12</span>
              </div>
            </div>
          </Transition>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('计数滚动 · 箭头步进 · 流派淡入', 'Counter roll · stepper · genre fade') }}</span>
          <strong>ALBUM 0{{ albumIndex }} / GENRE 0{{ genreIndex + 1 }}</strong>
        </div>
      </template>

      <!-- search -->
      <template v-else-if="id === 'search'">
        <div class="mock-search">
          <input v-model="query" :placeholder="t('搜索专辑、歌手或流派…', 'Search albums, artists or genres…')" />
          <ul>
            <li v-for="a in filtered" :key="a.title">
              <span class="search-dot" :style="{ background: a.bg }" />
              <div><strong>{{ a.title }}</strong><small>{{ a.artist }}</small></div>
            </li>
            <li v-if="!filtered.length" class="empty">{{ t('没有匹配结果', 'No matches') }}</li>
          </ul>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('输入即筛选 · 定位不播放', 'Filter as you type · locate without playing') }}</span>
          <strong>{{ filtered.length }} RESULTS</strong>
        </div>
      </template>

      <!-- lyrics -->
      <template v-else-if="id === 'lyrics'">
        <div class="mock-lyrics">
          <p v-for="(line, i) in lyrics" :key="line" :class="{ active: i === lyricIndex }">
            {{ line }}
          </p>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('LRC 同步 · 点击定位', 'LRC sync · click to seek') }}</span>
          <button class="mdemo-btn" @click="lyricIndex = (lyricIndex + 1) % lyrics.length">{{ t('下一句', 'Next line') }}</button>
        </div>
      </template>

      <!-- queue -->
      <template v-else-if="id === 'queue'">
        <ul class="mock-queue">
          <li v-for="(item, i) in queue" :key="item">
            <span class="queue-index">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="queue-title">{{ item }}</span>
            <button @click="moveQueue(i, -1)">↑</button>
            <button @click="moveQueue(i, 1)">↓</button>
          </li>
        </ul>
        <div class="mdemo-foot">
          <span>{{ t('播放队列 · 拖动排序的替身', 'Queue · reorder by buttons') }}</span>
          <strong>{{ queue.length }} TRACKS</strong>
        </div>
      </template>

      <!-- performance -->
      <template v-else-if="id === 'performance'">
        <div class="atlas">
          <span
            v-for="i in 24"
            :key="i"
            :style="{
              background: `linear-gradient(${i * 15}deg,hsl(${i * 14},42%,${25 + (i % 5) * 8}%),#0b0e15)`,
              animationDelay: `${i * 16}ms`,
            }"
          />
        </div>
        <div class="atlas-stats">
          <span>ATLAS 2D</span>
          <span>INSTANCED DRAW</span>
          <span>UV TILES</span>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('封面图集 · 实例化专辑架', 'Cover atlas · instanced shelf') }}</span>
          <strong>1 DRAW</strong>
        </div>
      </template>

      <!-- endfield foundations -->
      <template v-else-if="id === 'ef-foundations'">
        <div
          class="ef-stage"
          :class="efTheme"
          :style="{ '--ef-accent': efAccent === 'yellow' ? '#f2c94c' : '#5fd6c5' }"
        >
          <div class="ef-swatches">
            <span class="paper" /><span class="ink" /><span class="accent" /><span class="smoke" />
          </div>
          <div class="ef-type">
            <small>DESIGN TOKENS / INDUSTRIAL EDITORIAL</small>
            <strong>{{ t('工业编辑风', 'Industrial editorial') }}</strong>
            <em>Paper / Ink / Signal</em>
          </div>
          <div class="ef-actions">
            <button class="ef-btn ghost" @click="efTheme = efTheme === 'dark' ? 'light' : 'dark'">{{ t('切换亮暗', 'Toggle theme') }}</button>
            <button class="ef-btn ghost" @click="efAccent = efAccent === 'yellow' ? 'cyan' : 'yellow'">{{ t('切换强调色', 'Toggle accent') }}</button>
          </div>
        </div>
        <div class="mdemo-foot"><span>{{ t('纸白 / 烟黑 / 信号黄', 'Paper / smoke / signal yellow') }}</span><strong>{{ efTheme.toUpperCase() }}</strong></div>
      </template>

      <!-- endfield controls -->
      <template v-else-if="id === 'ef-controls'">
        <div class="ef-stage dark">
          <div class="ef-panel">
            <span class="ef-kicker">SECTION 04 / COMPONENTS</span>
            <h3>{{ t('基础控件', 'Core controls') }}</h3>
            <div class="ef-btn-row">
              <button class="ef-btn solid">{{ t('确认', 'Confirm') }}</button>
              <button class="ef-btn ghost">{{ t('取消', 'Cancel') }}</button>
              <span class="ef-tag">SIGNAL</span>
              <span class="ef-tag pair">PAIR <i>02</i></span>
            </div>
            <div class="ef-kbd">{{ t('按下', 'Press') }} <kbd>ESC</kbd> {{ t('关闭', 'to close') }} · <kbd>⌘K</kbd> {{ t('搜索', 'to search') }}</div>
          </div>
        </div>
        <div class="mdemo-foot"><span>Button / Tag / Panel / Kbd</span><strong>CUT &amp; BRACKET</strong></div>
      </template>

      <!-- endfield forms -->
      <template v-else-if="id === 'ef-forms'">
        <div class="ef-stage dark">
          <div class="ef-form">
            <label class="ef-field">
              <span>{{ t('CALLSIGN / 呼号', 'CALLSIGN') }}</span>
              <input value="RHINE-07" />
              <i />
            </label>
            <div class="ef-checkrow">
              <button class="ef-check" :class="{ on: efCheck }" @click="efCheck = !efCheck">✓</button>
              <span>{{ t('自动同步并保留浏览位置', 'Sync automatically and keep position') }}</span>
            </div>
            <div class="ef-seg">
              <button :class="{ active: efSeg === 0 }" @click="efSeg = 0">{{ t('亮色', 'Light') }}</button>
              <button :class="{ active: efSeg === 1 }" @click="efSeg = 1">{{ t('暗色', 'Dark') }}</button>
              <button :class="{ active: efSeg === 2 }" @click="efSeg = 2">{{ t('跟随系统', 'System') }}</button>
            </div>
          </div>
        </div>
        <div class="mdemo-foot"><span>Input / Checkbox / Segmented</span><strong>{{ ['LIGHT','DARK','SYSTEM'][efSeg] }}</strong></div>
      </template>

      <!-- endfield feedback -->
      <template v-else-if="id === 'ef-feedback'">
        <div class="ef-stage dark">
          <div class="ef-alert"><b>!</b><span>{{ t('数据已同步到本地索引', 'Synced to the local index') }}</span><small>12:04</small></div>
          <div class="ef-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" />
              <circle class="on" cx="40" cy="40" r="32" pathLength="100" />
            </svg>
            <strong>72%</strong>
          </div>
          <button class="ef-btn solid" @click="efDialog = true">{{ t('打开 Dialog', 'Open dialog') }}</button>
          <Transition name="hud-detail">
            <div v-if="efDialog" class="ef-dialog">
              <small>{{ t('CONFIRM / 确认', 'CONFIRM') }}</small>
              <strong>{{ t('提交这次更改？', 'Submit this change?') }}</strong>
              <p>{{ t('更改只在本地生效，可以随时撤销。', 'Changes apply locally and can be undone.') }}</p>
              <div>
                <button class="ef-btn ghost" @click="efDialog = false">{{ t('取消', 'Cancel') }}</button>
                <button class="ef-btn solid" @click="efDialog = false">{{ t('确认', 'Confirm') }}</button>
              </div>
            </div>
          </Transition>
        </div>
        <div class="mdemo-foot"><span>Alert / Progress / Dialog</span><strong>0.2–0.3s</strong></div>
      </template>

      <!-- endfield display -->
      <template v-else-if="id === 'ef-display'">
        <div class="ef-stage dark">
          <div class="ef-rail">
            <span class="on">▤</span><span>◈</span><span>▦</span><span>⚙</span>
          </div>
          <div class="ef-display">
            <div class="ef-item-grid">
              <span v-for="i in 4" :key="i" class="ef-item" :class="`r${i}`" :style="{ animationDelay: `${i * 60}ms` }">
                <b>{{ i }}</b><small>×{{ 12 * i }}</small>
              </span>
            </div>
            <div class="ef-stats">
              <div><b>1,284</b><small>{{ t('库存', 'Stock') }}</small></div>
              <div><b>07</b><small>{{ t('队列', 'Queue') }}</small></div>
              <div><b>92%</b><small>{{ t('完成', 'Done') }}</small></div>
            </div>
          </div>
        </div>
        <div class="mdemo-foot"><span>ItemGrid / Stat / SideRail</span><strong>RARITY 04</strong></div>
      </template>

      <!-- endfield motifs -->
      <template v-else-if="id === 'ef-motifs'">
        <div :key="efMotionKey" class="ef-stage dark ef-motif">
          <span class="ef-scan" />
          <span class="ef-ghost">ENDFIELD</span>
          <span class="ef-brackets">
            <i /><i /><i /><i />
          </span>
          <span class="ef-hatch" />
          <div class="ef-tickring">
            <span
              v-for="i in 36"
              :key="i"
              :style="{
                transform: `rotate(${i * 10}deg)`,
                animationDelay: `${i * 7}ms`,
              }"
            />
          </div>
          <span class="ef-motion-tag">0.28S / NO BOUNCE</span>
          <span class="ef-reg">REG / 04 · 2026</span>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('镂空字擦除 · 角括号展开 · 刻度点亮 · 斜纹位移', 'Ghost wipe · bracket unfold · tick reveal · hatch sweep') }}</span>
          <button class="mdemo-btn" @click="efMotionKey++">{{ t('重播动效', 'Replay motion') }}</button>
        </div>
      </template>

      <!-- nasa-punk foundations -->
      <template v-else-if="id === 'nasa-foundations'">
        <div class="nasa-paper">
          <div class="nasa-swatches">
            <span class="red" /><span class="navy" /><span class="paper" /><span class="ink" />
          </div>
          <div class="nasa-spec">
            <small>NHB 1430.2 / GRAPHICS STANDARDS</small>
            <strong>NASA<span>PUNK</span></strong>
            <em>HIGH TECH, HIGH HOPE.</em>
          </div>
          <span class="nasa-stamp">APPROVED<br />1976</span>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('信号红 / 海军蓝 / 磨损白', 'Signal red / navy / baked white') }}</span>
          <strong>PRINT</strong>
        </div>
      </template>

      <!-- nasa-punk print -->
      <template v-else-if="id === 'nasa-print'">
        <div class="nasa-doc">
          <div class="nasa-doc-head">
            <span>NASA-PUNK / TECHNICAL MEMORANDUM</span>
            <span>TM-1976-04</span>
          </div>
          <h3>OPERATIONAL READINESS REVIEW</h3>
          <div class="nasa-doc-meta">
            <span>ISSUE 04</span><span>PAGE 12</span><span>CLASS: OPEN</span>
          </div>
          <div class="nasa-figure">
            <span class="nasa-figure-title">FIG. 3 — SUBSYSTEM MASS</span>
            <div class="nasa-bars">
              <i style="height: 38%" /><i style="height: 62%" /><i class="solid" style="height: 84%" />
              <i class="hatch" style="height: 54%" /><i style="height: 72%" />
            </div>
          </div>
          <div class="nasa-barcode" />
        </div>
        <div class="mdemo-foot">
          <span>{{ t('报头 / 元数据 / 图表 / 条码', 'Masthead / metadata / figure / barcode') }}</span>
          <strong>BAND-15</strong>
        </div>
      </template>

      <!-- nasa-punk console -->
      <template v-else-if="id === 'nasa-console'">
        <div class="nasa-console">
          <div class="nasa-scan">
            <span class="nasa-scan-ring" />
            <i class="a" /><i class="b" /><i class="c" />
          </div>
          <div class="nasa-starmap">
            <span v-for="n in 18" :key="n" :style="{ left: (n * 37) % 100 + '%', top: (n * 53) % 100 + '%' }" />
            <em />
          </div>
          <div class="nasa-chips">
            <span>NOMINAL</span><span class="warn">CAUTION</span><span class="crit">CRITICAL</span>
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('扫描单目镜 / 星图 / 状态三联', 'Scan visor / star map / status trio') }}</span>
          <strong>CONSOLE</strong>
        </div>
      </template>

      <!-- nasa-punk charts -->
      <template v-else-if="id === 'nasa-charts'">
        <div class="nasa-chart">
          <div class="nasa-chart-bars">
            <i style="height: 32%" /><i class="solid" style="height: 48%" />
            <i class="hatch" style="height: 66%" /><i class="cross" style="height: 82%" />
            <i style="height: 58%" />
          </div>
          <div class="nasa-dial">
            <span class="needle" />
            <b>72</b>
          </div>
          <div class="nasa-flags">
            <span /><span class="hatch" /><span class="red" />
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('填充阶梯 / 表盘 / 三态旗语', 'Fill ladder / dial / tri-state flags') }}</span>
          <strong>FIG. 3</strong>
        </div>
      </template>

      <!-- nasa-punk motion -->
      <template v-else-if="id === 'nasa-motion'">
        <div class="nasa-motion">
          <div class="nasa-pulse"><span /></div>
          <div class="nasa-motion-cards">
            <span style="animation-delay: 0ms">01</span>
            <span style="animation-delay: 90ms">02</span>
            <span style="animation-delay: 180ms">03</span>
          </div>
          <small>2.5s BREATHE · 180ms ENTER · 0 FLICKER</small>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('呼吸 / 入场 / 零闪烁', 'Breathe / enter / no flicker') }}</span>
          <strong>MOTION</strong>
        </div>
      </template>

      <!-- nasa-punk emblem -->
      <template v-else-if="id === 'nasa-emblem'">
        <div class="nasa-emblem" :class="`era-${nasaEra}`">
          <div class="nasa-patch">
            <span class="z1" /><span class="z2" /><span class="z3" /><span class="z4" />
          </div>
          <div class="nasa-era">
            <button
              v-for="era in (['mercury', 'gemini', 'apollo'] as const)"
              :key="era"
              :class="{ active: nasaEra === era }"
              @click="nasaEra = era"
            >
              {{ era.toUpperCase() }}
            </button>
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('四区纹章 / 时代色调', 'Four-zone emblem / era grades') }}</span>
          <strong>{{ nasaEra.toUpperCase() }}</strong>
        </div>
      </template>

      <!-- aureole observation -->
      <template v-else-if="id === 'aureole-observation'">
        <div class="aur-observation">
          <div class="aur-plates">
            <span class="p1" /><span class="p2" /><span class="p3" />
            <button
              v-for="(part, i) in aureoleParts"
              :key="part.code"
              class="aur-marker"
              :class="{ active: aureolePart === i }"
              :style="{ left: `${26 + i * 22}%`, top: `${38 + (i % 2) * 18}%` }"
              @click="aureolePart = i"
            >
              {{ part.code }}
            </button>
          </div>
          <div class="aur-readout">
            <small>SPECIMEN 01 / OBSERVATION</small>
            <strong>{{ aureoleParts[aureolePart].name }}</strong>
            <p>{{ aureoleParts[aureolePart].desc }}</p>
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('点击编号定位部件', 'Click a number to locate a part') }}</span>
          <strong>OBSERVE</strong>
        </div>
      </template>

      <!-- aureole blueprint -->
      <template v-else-if="id === 'aureole-blueprint'">
        <div class="aur-blueprint">
          <div class="aur-grid" />
          <div class="aur-contour">
            <span class="c1" /><span class="c2" /><span class="c3" />
          </div>
          <span class="aur-axis x" />
          <span class="aur-axis y" />
          <div class="aur-calibration"><i /><i /><i /></div>
          <span class="aur-section" />
          <small>STRUCTURAL SECTION / 03</small>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('轮廓 / 点阵 / 轴线 / 校准圆', 'Contour / dots / axes / calibration') }}</span>
          <strong>BLUEPRINT</strong>
        </div>
      </template>

      <!-- aureole deconstruct -->
      <template v-else-if="id === 'aureole-deconstruct'">
        <div class="aur-deconstruct">
          <span class="aur-slice s1" /><span class="aur-slice s2" /><span class="aur-slice s3" />
          <span class="aur-serif a">A</span><span class="aur-serif u">U</span><span class="aur-serif r">R</span>
          <div class="aur-radial">
            <i v-for="i in 12" :key="i" :style="{ transform: `rotate(${i * 30}deg)` }" />
          </div>
          <small>DECONSTRUCT / LAYER 03</small>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('反相层 / 斜切片 / 衬线碎字', 'Inverse / slices / serif fragments') }}</span>
          <strong>DECONSTRUCT</strong>
        </div>
      </template>

      <!-- aureole floating scene -->
      <template v-else-if="id === 'aureole-float'">
        <div class="aur-float">
          <span class="aur-layer l1" /><span class="aur-layer l2" /><span class="aur-layer l3" />
          <div class="aur-depth"><span>Z 01</span><span>Z 02</span><span>Z 03</span></div>
          <div class="aur-timeline">
            <i /><span>18s BASE CYCLE · POINTER PARALLAX</span>
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('深度 / 相位 / 指针视差', 'Depth / phase / pointer parallax') }}</span>
          <strong>18.0s</strong>
        </div>
      </template>

      <!-- aureole annotations -->
      <template v-else-if="id === 'aureole-annotate'">
        <div class="aur-annotate">
          <input v-model="aureoleQuery" :placeholder="t('搜索标本、编号或英文标识…', 'Search specimens, numbers or identifiers…')" />
          <div class="aur-results">
            <button v-for="item in aureoleFiltered" :key="item.code" @click="aureolePart = Number(item.code) - 1">
              <span>{{ item.code }}</span>
              <strong>{{ item.name }}</strong>
              <small>{{ item.en }}</small>
            </button>
            <p v-if="!aureoleFiltered.length">{{ t('没有匹配标本', 'No specimens found') }}</p>
          </div>
          <div class="aur-density">
            <span>{{ t('标注密度', 'Label density') }} {{ aureoleDensity }}%</span>
            <input v-model.number="aureoleDensity" type="range" min="0" max="100" />
          </div>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('搜索 / 密度 / 档案', 'Search / density / archive') }}</span>
          <strong>1 · 2 · 3</strong>
        </div>
      </template>

      <!-- aureole settings -->
      <template v-else-if="id === 'aureole-settings'">
        <div class="aur-settings">
          <label>
            <span>{{ t('显示标注', 'Show labels') }}</span>
            <button class="aur-switch" :class="{ on: aureoleLabels }" @click="aureoleLabels = !aureoleLabels" />
          </label>
          <label>
            <span>{{ t('微量视差', 'Subtle parallax') }}</span>
            <button class="aur-switch" :class="{ on: aureoleParallax }" @click="aureoleParallax = !aureoleParallax" />
          </label>
          <label>
            <span>{{ t('减少动态', 'Reduce motion') }}</span>
            <button class="aur-switch" :class="{ on: aureoleReduced }" @click="aureoleReduced = !aureoleReduced" />
          </label>
          <div class="aur-export">
            <button @click="exportAureole('config')">EXPORT CONFIG</button>
            <button @click="exportAureole('specimen')">EXPORT SPECIMEN</button>
          </div>
          <code v-if="aureoleExport">{{ aureoleExport }}</code>
        </div>
        <div class="mdemo-foot">
          <span>{{ t('配置导出 / 无障碍', 'Config export / accessibility') }}</span>
          <strong>{{ aureoleReduced ? 'REDUCED' : 'MOTION' }}</strong>
        </div>
      </template>

      <div v-else class="mdemo-empty">{{ t('该模块暂无独立视觉演示', 'No visual demo for this module yet') }}</div>
    </div>
  </div>
</template>
