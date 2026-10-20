<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icon from './components/Icon.vue'
import CoverView from './views/CoverView.vue'
import InfographicView from './views/InfographicView.vue'
import PassView from './views/PassView.vue'
import SlidesView from './views/SlidesView.vue'
import PortraitView from './views/PortraitView.vue'
import AssetsView from './views/AssetsView.vue'
import UILibraryView from './views/UILibraryView.vue'
import ToastHost from './components/ToastHost.vue'
import { toast } from './lib/toast'
import { lang, setLang } from './i18n'

const TOOLS = [
  { id: 'cover', label: '封面', labelEn: 'Cover', icon: 'template', desc: '封面编辑器', component: CoverView },
  { id: 'flow', label: '一图流', labelEn: 'Infographic', icon: 'flow', desc: '长图信息流', component: InfographicView },
  { id: 'pass', label: '通行证', labelEn: 'Pass', icon: 'badge', desc: '通行证 / 工牌', component: PassView },
  { id: 'slides', label: '幻灯片', labelEn: 'Slides', icon: 'slides', desc: '演示幻灯片', component: SlidesView },
  { id: 'portrait', label: '动态立绘', labelEn: 'Portrait', icon: 'portrait', desc: '动态立绘', component: PortraitView },
  { id: 'assets', label: '素材生成', labelEn: 'Assets', icon: 'sparkles', desc: '素材生成器', component: AssetsView },
  { id: 'ui', label: 'UI 组件库', labelEn: 'UI Library', icon: 'library', desc: 'UI 组件库', component: UILibraryView },
] as const

function routeFromHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0]
  return TOOLS.some((t) => t.id === raw) ? raw : 'cover'
}

const tool = ref<string>(routeFromHash())
const currentView = computed(
  () => TOOLS.find((t) => t.id === tool.value)?.component ?? CoverView,
)
const routePath = ref(window.location.hash || '#/cover')
const currentRoute = computed(() => routePath.value)

function syncFromHash() {
  routePath.value = window.location.hash || '#/cover'
  const id = routeFromHash()
  if (id !== tool.value) tool.value = id
  const item = TOOLS.find((t) => t.id === id)
  const label = lang.value === 'zh' ? (item?.label ?? '封面') : (item?.labelEn ?? 'Cover')
  document.title = `${label} · Cover Studio`
}

function go(id: string) {
  if (id === tool.value) return
  tool.value = id
  if (window.location.hash !== `#/${id}`) window.location.hash = `/${id}`
}

async function copyLink() {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    toast(lang.value === 'zh' ? '已复制当前页面链接' : 'Link copied')
  } catch {
    toast(url)
  }
}

onMounted(() => {
  window.addEventListener('hashchange', syncFromHash)
  if (!window.location.hash) {
    window.history.replaceState(null, '', '#/cover')
  }
  syncFromHash()
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncFromHash)
})

watch(lang, () => syncFromHash())
</script>

<template>
  <div class="studio">
    <header class="shellbar">
      <div class="brand">
        <div class="logo">C</div>
        <div class="brand-text">
          <strong>封面工坊</strong>
          <small>CREATIVE STUDIO</small>
        </div>
      </div>

      <nav class="tool-nav">
        <button
          v-for="t in TOOLS"
          :key="t.id"
          :class="{ active: tool === t.id }"
          :title="t.desc"
          @click="go(t.id)"
        >
          <Icon :name="t.icon" :size="16" />
          <span>{{ lang === 'zh' ? t.label : t.labelEn }}</span>
        </button>
      </nav>

      <button class="lang-chip" :title="lang === 'zh' ? 'Switch to English' : '切换到中文'" @click="setLang(lang === 'zh' ? 'en' : 'zh')">
        {{ lang === 'zh' ? 'EN' : '中' }}
      </button>
      <button class="route-chip" :title="'复制当前页面链接：' + currentRoute" @click="copyLink">
        {{ currentRoute }}
      </button>
      <div class="shell-note">
        <span class="pulse" />
        {{ lang === 'zh' ? '本地处理 · 不上传' : 'Local · never uploaded' }}
      </div>
    </header>

    <div class="studio-body">
      <KeepAlive>
        <component :is="currentView" />
      </KeepAlive>
    </div>

    <ToastHost />
  </div>
</template>
