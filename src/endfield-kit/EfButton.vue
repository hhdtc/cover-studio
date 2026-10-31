<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'solid' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  { variant: 'solid', size: 'md', disabled: false },
)
</script>

<template>
  <button
    class="efk-btn"
    :class="[`efk-btn--${variant}`, size !== 'md' && `efk-btn--${size}`]"
    :disabled="disabled"
    type="button"
  >
    <slot />
  </button>
</template>
