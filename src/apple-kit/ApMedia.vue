<script setup lang="ts">
withDefaults(
  defineProps<{
    ratio?: string
    caption?: string
    label?: string
    dark?: boolean
  }>(),
  { ratio: '16 / 10', caption: '', label: '', dark: false },
)
</script>

<template>
  <figure class="apl-media" :class="dark && 'apl-media--dark'">
    <div class="apl-media__frame" :style="{ '--apl-ratio': ratio }">
      <span>{{ label }}</span>
      <slot />
    </div>
    <figcaption v-if="caption" class="apl-media__caption">{{ caption }}</figcaption>
  </figure>
</template>
