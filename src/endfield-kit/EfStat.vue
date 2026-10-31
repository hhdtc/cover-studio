<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    unit?: string
    ratio?: number
  }>(),
  { unit: '', ratio: 0.5 },
)
</script>

<template>
  <div class="efk-stat">
    <span class="efk-stat__label">{{ label }}</span>
    <span class="efk-stat__value">
      {{ value }}<span v-if="unit" class="efk-stat__unit">{{ unit }}</span>
    </span>
    <span class="efk-stat__track">
      <span class="efk-stat__fill" :style="{ transform: `scaleX(${Math.min(1, Math.max(0, ratio))})` }" />
    </span>
  </div>
</template>
