import { ref } from 'vue'

export type Lang = 'zh' | 'en'

function detect(): Lang {
  try {
    const saved = localStorage.getItem('cs-lang')
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || 'zh').toLowerCase()
  return nav.startsWith('zh') ? 'zh' : 'en'
}

export const lang = ref<Lang>(detect())

export function setLang(next: Lang) {
  lang.value = next
  try {
    localStorage.setItem('cs-lang', next)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
}

export function t(zh: string, en: string) {
  return lang.value === 'zh' ? zh : en
}

setLang(lang.value)
