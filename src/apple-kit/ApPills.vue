<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    options: string[]
    modelValue: number
  }>(),
  {},
)
const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const root = ref<HTMLElement | null>(null)
const buttons = ref<HTMLElement[]>([])
const thumb = ref({ left: 0, width: 0 })
let ro: ResizeObserver | null = null

function sync() {
  const el = buttons.value[props.modelValue]
  if (!el) return
  thumb.value = { left: el.offsetLeft, width: el.offsetWidth }
}

function select(i: number) {
  if (i !== props.modelValue) emit('update:modelValue', i)
}

onMounted(async () => {
  await nextTick()
  sync()
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    ro = new ResizeObserver(sync)
    ro.observe(root.value)
  }
})

watch(() => props.modelValue, () => nextTick(sync))

onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div ref="root" class="apl-pills" role="tablist">
    <span class="apl-pills__thumb" :style="{ left: thumb.left + 'px', width: thumb.width + 'px' }" aria-hidden="true" />
    <button
      v-for="(opt, i) in options"
      :key="opt"
      ref="buttons"
      class="apl-pills__btn"
      role="tab"
      :aria-selected="i === modelValue"
      @click="select(i)"
    >
      {{ opt }}
    </button>
  </div>
</template>
