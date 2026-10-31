<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: { id: string; glyph: string; label: string }[]
    modelValue: string
  }>(),
  {},
)
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

function pick(id: string) {
  if (id !== props.modelValue) emit('update:modelValue', id)
}
</script>

<template>
  <nav class="efk-rail" aria-label="Sections">
    <button
      v-for="item in items"
      :key="item.id"
      class="efk-rail__item"
      :aria-current="item.id === modelValue"
      :title="item.label"
      @click="pick(item.id)"
    >
      <span aria-hidden="true">{{ item.glyph }}</span>
      <span class="efk-sr-only">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style>
.efk-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
