<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Scroll-linked hero. Writes a 0..1 progress value into `--apl-p` on the
 * inner block so the headline and stage can drift at different amplitudes.
 * The work happens inside a single rAF tick per scroll event, and nothing
 * is scheduled when the element is off screen.
 */
const props = withDefaults(defineProps<{ distance?: number }>(), { distance: 420 })

const root = ref<HTMLElement | null>(null)
const inner = ref<HTMLElement | null>(null)
let frame = 0
let visible = true
let observer: IntersectionObserver | null = null

function measure() {
  frame = 0
  const el = root.value
  const target = inner.value
  if (!el || !target || !visible) return
  const rect = el.getBoundingClientRect()
  const travelled = Math.min(Math.max(-rect.top, 0), props.distance)
  target.style.setProperty('--apl-p', (travelled / props.distance).toFixed(4))
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  if (typeof IntersectionObserver !== 'undefined' && root.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) onScroll()
      },
      { rootMargin: '120px' },
    )
    observer.observe(root.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (frame) cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<template>
  <section ref="root" class="apl-hero">
    <div ref="inner" class="apl-hero__inner">
      <slot />
      <div class="apl-hero__stage" aria-hidden="true">
        <span class="apl-hero__layer" />
        <span class="apl-hero__layer" />
      </div>
    </div>
  </section>
</template>
