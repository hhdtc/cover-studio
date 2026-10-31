<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ delay?: number; once?: boolean }>(), {
  delay: 0,
  once: true,
})

const el = ref<HTMLElement | null>(null)
const shown = ref(false)
let observer: IntersectionObserver | null = null
let timer = 0

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    shown.value = true
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        timer = window.setTimeout(() => {
          shown.value = true
        }, props.delay)
        if (props.once) observer?.disconnect()
      } else if (!props.once) {
        shown.value = false
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  )
  if (el.value) observer.observe(el.value)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  observer?.disconnect()
})
</script>

<template>
  <div ref="el" class="apl-reveal" :data-shown="shown">
    <slot />
  </div>
</template>
