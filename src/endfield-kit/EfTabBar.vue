<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tabs: string[]
    modelValue: number
  }>(),
  {},
)
const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

function select(i: number) {
  if (i !== props.modelValue) emit('update:modelValue', i)
}
</script>

<template>
  <div class="efk-tabs" role="tablist">
    <button
      v-for="(tab, i) in tabs"
      :key="tab"
      class="efk-tabs__tab"
      role="tab"
      :aria-selected="i === modelValue"
      @click="select(i)"
    >
      {{ tab }}
    </button>
  </div>
</template>
