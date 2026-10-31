<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Scroll' })
</script>

<template>
  <span class="efk-tip">
    <span>{{ label }}</span>
    <span class="efk-tip__dot" />
  </span>
</template>
