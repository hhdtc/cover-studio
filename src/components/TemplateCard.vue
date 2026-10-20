<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Template } from '../templates'
import { drawDoc } from '../render'

const props = defineProps<{ template: Template }>()
const emit = defineEmits<{ (e: 'apply'): void }>()

const cv = ref<HTMLCanvasElement | null>(null)

function paint() {
  const el = cv.value
  if (!el) return
  const doc = props.template.build()
  const width = 460
  const height = Math.round((width * doc.height) / doc.width)
  el.width = width * 2
  el.height = height * 2
  const ctx = el.getContext('2d')
  if (!ctx) return
  ctx.setTransform((width * 2) / doc.width, 0, 0, (width * 2) / doc.width, 0, 0)
  drawDoc(ctx, doc)
}

onMounted(paint)
</script>

<template>
  <button class="tpl-card" type="button" @click="emit('apply')">
    <span class="tpl-canvas"><canvas ref="cv" /></span>
    <span class="tpl-meta">
      <strong>{{ template.name }}</strong>
      <small>{{ template.hint }}</small>
    </span>
  </button>
</template>
