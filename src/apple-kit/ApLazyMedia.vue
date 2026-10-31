<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Media that waits for the viewport. Nothing is requested until the frame is
 * within `rootMargin` of the viewport, unless the visitor asked to save data —
 * then it waits for an explicit tap.
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    ratio?: string
    rootMargin?: string
    label?: string
  }>(),
  { alt: '', ratio: '16 / 10', rootMargin: '240px', label: '' },
)

const root = ref<HTMLElement | null>(null)
const loaded = ref(false)
const requested = ref(false)
const failed = ref(false)
let observer: IntersectionObserver | null = null

const saveData =
  typeof navigator !== 'undefined' &&
  'connection' in navigator &&
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)

function request() {
  if (requested.value) return
  requested.value = true
}

function onLoad() {
  loaded.value = true
}

onMounted(() => {
  if (saveData) return // wait for the explicit button
  if (typeof IntersectionObserver === 'undefined') {
    request()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        request()
        observer?.disconnect()
      }
    },
    { rootMargin: props.rootMargin },
  )
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())

defineExpose({ request })
</script>

<template>
  <figure ref="root" class="apl-lazy" :style="{ '--apl-ratio': ratio }" :data-loaded="loaded">
    <img
      v-if="requested"
      :src="props.src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="failed = true"
    />
    <div v-if="!loaded" class="apl-lazy__placeholder">
      <span v-if="failed">✕</span>
      <button v-else-if="!requested && saveData" type="button" class="apl-lazy__btn" @click="request">
        Load media
      </button>
      <span v-else>{{ label || 'loading' }}</span>
    </div>
  </figure>
</template>
