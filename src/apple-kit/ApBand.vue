<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Section whose background cross-fades between two colours as it passes the
 * viewport, mirroring the measured 1s linear colour transition.
 */
const props = withDefaults(
  defineProps<{ from?: string; to?: string; dark?: boolean }>(),
  { from: '#f5f5f7', to: '#1d1d1f', dark: false },
)

const root = ref<HTMLElement | null>(null)
let frame = 0

function measure() {
  frame = 0
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const span = window.innerHeight + rect.height
  const passed = window.innerHeight - rect.top
  const p = Math.min(1, Math.max(0, passed / span))
  el.style.setProperty('--apl-band-mix', p.toFixed(3))
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
  <section
    ref="root"
    class="apl-band"
    :style="{
      '--apl-band-color': `color-mix(in oklab, ${props.from} ${`calc((1 - var(--apl-band-mix, 0)) * 100%)`}, ${props.to})`,
      '--apl-band-ink': props.dark ? '#f5f5f7' : 'var(--apl-ink)',
    }"
  >
    <slot />
  </section>
</template>
