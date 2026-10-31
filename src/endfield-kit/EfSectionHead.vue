<script setup lang="ts">
withDefaults(
  defineProps<{
    index?: string
    title: string
    meta?: string
  }>(),
  { index: '', meta: '' },
)
</script>

<template>
  <header class="efk-head">
    <span v-if="index" class="efk-head__index">{{ index }}</span>
    <h2 class="efk-head__title">{{ title }}</h2>
    <span v-if="meta" class="efk-head__meta">{{ meta }}</span>
    <span class="efk-head__rule" />
  </header>
</template>
