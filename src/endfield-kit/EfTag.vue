<script setup lang="ts">
withDefaults(
  defineProps<{
    accent?: boolean
    live?: boolean
  }>(),
  { accent: false, live: false },
)
</script>

<template>
  <span class="efk-tag" :class="[accent && 'efk-tag--accent', live && 'efk-tag--live']">
    <slot />
  </span>
</template>
