<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ items?: number; shift?: number }>(), {
  items: 6,
  shift: 60,
})

const root = ref<HTMLElement | null>(null)
let frame = 0

function measure() {
  frame = 0
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const p = Math.min(
    1,
    Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)),
  )
  el.style.setProperty('--apl-p', p.toFixed(3))
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" class="apl-parallax" :style="{ '--apl-shift': shift + 'px' }">
    <div class="apl-parallax__row">
      <span v-for="i in items" :key="i" class="apl-parallax__card">{{ String(i).padStart(2, '0') }}</span>
    </div>
    <slot />
  </div>
</template>
