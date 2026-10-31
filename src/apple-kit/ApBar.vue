<script setup lang="ts">
withDefaults(
  defineProps<{
    items: string[]
    active?: string
    tone?: 'light' | 'dark'
  }>(),
  { active: '', tone: 'light' },
)
defineEmits<{ (e: 'select', value: string): void }>()
</script>

<template>
  <nav class="apl-bar" :data-tone="tone" aria-label="Sections">
    <button
      v-for="item in items"
      :key="item"
      class="apl-bar__link"
      :aria-current="item === active"
      @click="$emit('select', item)"
    >
      {{ item }}
    </button>
  </nav>
</template>
