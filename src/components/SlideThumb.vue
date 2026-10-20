<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { SLIDE_H, SLIDE_W, SLIDE_THEMES, drawSlide } from '../lib/slides'
import type { Slide, SlideThemeId } from '../lib/slides'
import { getImage } from '../lib/draw'

const props = defineProps<{
  slide: Slide
  theme: SlideThemeId
  index: number
  total: number
}>()

const cv = ref<HTMLCanvasElement | null>(null)

function paint() {
  const el = cv.value
  if (!el) return
  const w = 320
  const h = Math.round((w * SLIDE_H) / SLIDE_W)
  el.width = w * 2
  el.height = h * 2
  const ctx = el.getContext('2d')
  if (!ctx) return
  ctx.setTransform((w * 2) / SLIDE_W, 0, 0, (w * 2) / SLIDE_W, 0, 0)
  drawSlide(ctx, props.slide, SLIDE_THEMES[props.theme], props.index, props.total)
  if (props.slide.image) {
    const img = getImage(props.slide.image)
    if (!img.complete) img.addEventListener('load', paint, { once: true })
  }
}

onMounted(paint)
watch(
  () => [props.slide, props.theme, props.index, props.total],
  paint,
  { deep: true },
)
</script>

<template>
  <canvas ref="cv" class="slide-thumb" />
</template>
