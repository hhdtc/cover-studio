<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    links: string[]
    active?: string
  }>(),
  { active: '' },
)
defineEmits<{ (e: 'select', value: string): void }>()
</script>

<template>
  <div class="apl-localnav">
    <span class="apl-localnav__title">{{ title }}</span>
    <button
      v-for="link in links"
      :key="link"
      class="apl-localnav__link apl-focusable"
      :aria-current="link === active"
      @click="$emit('select', link)"
    >
      {{ link }}
    </button>
  </div>
</template>
