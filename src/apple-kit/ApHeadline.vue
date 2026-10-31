<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lede?: string
    gradient?: boolean
    as?: string
  }>(),
  { eyebrow: '', lede: '', gradient: false, as: 'h2' },
)
</script>

<template>
  <div class="apl-type-block">
    <p v-if="eyebrow" class="apl-eyebrow">{{ eyebrow }}</p>
    <component :is="as" class="apl-display" :class="gradient && 'apl-gradient-text'">{{ title }}</component>
    <p v-if="lede" class="apl-lede">{{ lede }}</p>
  </div>
</template>

<style scoped>
.apl-type-block {
  display: grid;
  justify-items: center;
  gap: 0.625rem;
  text-align: center;
}
</style>
