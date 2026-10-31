<script setup lang="ts">
withDefaults(
  defineProps<{
    index?: string
    title?: string
    tone?: 'ink' | 'paper'
    scan?: boolean
  }>(),
  { index: '', title: '', tone: 'ink', scan: false },
)
</script>

<template>
  <div class="efk-panel" :class="[tone === 'paper' && 'efk-panel--paper', scan && 'efk-scanlines']">
    <div v-if="title || index" class="efk-panel__bar">
      <span v-if="index" class="efk-panel__index">{{ index }}</span>
      <span>{{ title }}</span>
      <slot name="meta" />
    </div>
    <div class="efk-panel__body">
      <slot />
    </div>
  </div>
</template>
