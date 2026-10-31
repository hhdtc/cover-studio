<script setup lang="ts">
withDefaults(
  defineProps<{
    kind?: 'nav' | 'scrim' | 'pill'
    tint?: string
    blur?: number
    alpha?: number
  }>(),
  { kind: 'nav', tint: '#1d1d1f', blur: 0, alpha: 0 },
)
</script>

<template>
  <div
    class="apl-glass"
    :class="[kind !== 'nav' && `apl-glass--${kind}`]"
    :style="{
      '--apl-glass-tint': tint,
      ...(blur ? { '--apl-glass-blur': `${blur}px` } : {}),
      ...(alpha ? { '--apl-glass-alpha': alpha } : {}),
    }"
  >
    <div class="apl-glass__body">
      <slot />
    </div>
  </div>
</template>
