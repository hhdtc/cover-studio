<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    live?: boolean
    tag?: string
  }>(),
  { live: false, tag: 'span' },
)
</script>

<template>
  <component :is="tag" class="efk-glitch" :class="live && 'efk-glitch--live'">
    {{ text }}
    <span class="efk-glitch__layer efk-glitch__layer--r" aria-hidden="true">{{ text }}</span>
    <span class="efk-glitch__layer efk-glitch__layer--g" aria-hidden="true">{{ text }}</span>
  </component>
</template>
