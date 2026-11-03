<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import UILibraryView from './views/UILibraryView.vue'
import EndfieldKitView from './views/EndfieldKitView.vue'
import AppleKitView from './views/AppleKitView.vue'
import ToastHost from './components/ToastHost.vue'
import { toast } from './lib/toast'
import { lang, setLang } from './i18n'

/**
 * One visible tool: the UI library. The two kit showcases stay routable
 * because project entries link to them, but they are not part of the shell.
 */
const TOOLS = [
  { id: 'ui', label: 'UI 组件库', labelEn: 'UI Library', desc: '组件库目录', component: UILibraryView },
  { id: 'endfield-kit', label: '终末地组件库', labelEn: 'Endfield Kit', desc: '逆向组件库', component: EndfieldKitView },
  { id: 'apple-kit', label: 'Apple 排版动效', labelEn: 'Apple Kit', desc: '排版与动效组件库', component: AppleKitView },
] as const

const HIDDEN_IDS = ['endfield-kit', 'apple-kit']

function routeFromHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0]
  return TOOLS.some((t) => t.id === raw) ? raw : 'ui'
}

const tool = ref<string>(routeFromHash())
const currentView = computed(
  () => TOOLS.find((t) => t.id === tool.value)?.component ?? UILibraryView,
)
const routePath = ref(window.location.hash || '#/ui')
const currentRoute = computed(() => routePath.value)
const inLibrary = computed(() => !HIDDEN_IDS.includes(tool.value))

function syncFromHash() {
  // Unknown segment (an old tool route, a typo) falls back to the library
  // entry instead of leaving a stale project in the URL.
  const segment = window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0]
  if (segment && !TOOLS.some((t) => t.id === segment)) {
    window.history.replaceState(null, '', '#/ui')
  }
  routePath.value = window.location.hash || '#/ui'
  const id = routeFromHash()
  if (id !== tool.value) tool.value = id
  const zh = lang.value === 'zh'
  document.title = inLibrary.value ? (zh ? 'UI 组件库' : 'UI Library') : zh ? 'UI 组件库 · 组件展示' : 'UI Library · Kit'
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
  if (!window.location.hash) window.history.replaceState(null, '', '#/ui')
  syncFromHash()
})

onBeforeUnmount(() => window.removeEventListener('hashchange', syncFromHash))
watch(lang, () => syncFromHash())
</script>

<template>
  <div class="studio">
    <header class="shellbar">
      <div class="brand">
        <div class="logo">U</div>
        <div class="brand-text">
          <strong>{{ lang === 'zh' ? 'UI 组件库' : 'UI Library' }}</strong>
          <small>{{ lang === 'zh' ? '组件目录' : 'COMPONENT CATALOG' }}</small>
        </div>
      </div>

      <nav v-if="inLibrary" class="tool-nav">
        <button class="active" :title="TOOLS[0].desc" @click="go('ui')">
          {{ lang === 'zh' ? TOOLS[0].label : TOOLS[0].labelEn }}
        </button>
      </nav>
      <button v-else class="tool-nav-back" type="button" @click="go('ui')">
        ← {{ lang === 'zh' ? '返回组件库' : 'Back to library' }}
      </button>

      <button
        class="lang-chip"
        :title="lang === 'zh' ? 'Switch to English' : '切换到中文'"
        @click="setLang(lang === 'zh' ? 'en' : 'zh')"
      >
        {{ lang === 'zh' ? 'EN' : '中' }}
      </button>
      <button class="route-chip" :title="'复制当前页面链接：' + currentRoute" @click="copyLink">
        {{ currentRoute }}
      </button>
      <div class="shell-note">
        <span class="pulse" />
        {{ lang === 'zh' ? '本地渲染 · 不上传' : 'Rendered locally · never uploaded' }}
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
