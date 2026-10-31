<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Sticky-media story: the visual column pins while the steps scroll past,
 * and each step brightens as it enters the middle band of the viewport.
 */
withDefaults(defineProps<{ steps: { title: string; body: string }[] }>(), {})

const root = ref<HTMLElement | null>(null)
const active = ref(0)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined' || !root.value) return
  const nodes = [...root.value.querySelectorAll<HTMLElement>('.apl-story__step')]
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const i = nodes.indexOf(entry.target as HTMLElement)
        if (i >= 0) active.value = i
      }
    },
    { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
  )
  nodes.forEach((n) => observer?.observe(n))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section ref="root" class="apl-story">
    <div class="apl-story__media" aria-hidden="true">
      <span>{{ String(active + 1).padStart(2, '0') }} / {{ String(steps.length).padStart(2, '0') }}</span>
    </div>
    <div class="apl-story__steps">
      <div
        v-for="(step, i) in steps"
        :key="step.title"
        class="apl-story__step"
        :data-active="i === active"
      >
        <h4>{{ step.title }}</h4>
        <p class="apl-body">{{ step.body }}</p>
      </div>
    </div>
  </section>
</template>
