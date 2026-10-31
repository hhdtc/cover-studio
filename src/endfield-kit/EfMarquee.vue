<script setup lang="ts">
withDefaults(
  defineProps<{
    items: string[]
    duration?: string
  }>(),
  { duration: '' },
)
</script>

<template>
  <div class="efk-marquee">
    <!-- The track is duplicated so the 50% translate loops seamlessly. -->
    <div class="efk-marquee__track" :style="duration ? { animationDuration: duration } : undefined">
      <span v-for="(item, i) in [...items, ...items]" :key="`${i}-${item}`" class="efk-marquee__item">
        {{ item }}
      </span>
    </div>
  </div>
</template>
