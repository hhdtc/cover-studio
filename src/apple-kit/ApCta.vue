<script setup lang="ts">
withDefaults(defineProps<{ accent?: boolean }>(), { accent: false })
</script>

<template>
  <button class="apl-cta" :class="accent && 'apl-cta--accent'" type="button">
    <slot />
  </button>
</template>
