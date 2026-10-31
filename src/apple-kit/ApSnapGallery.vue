<script setup lang="ts">
withDefaults(defineProps<{ items?: number; label?: string }>(), {
  items: 6,
  label: '',
})
</script>

<template>
  <div class="apl-gallery">
    <p v-if="label" class="apl-caption">{{ label }}</p>
    <div class="apl-gallery__track" role="list">
      <div v-for="i in items" :key="i" class="apl-gallery__item" role="listitem">
        <span>{{ String(i).padStart(2, '0') }}</span>
      </div>
    </div>
  </div>
</template>
