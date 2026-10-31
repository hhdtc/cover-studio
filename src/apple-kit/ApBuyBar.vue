<script setup lang="ts">
withDefaults(
  defineProps<{
    price: string
    note?: string
    cta?: string
  }>(),
  { note: '', cta: 'Buy' },
)
defineEmits<{ (e: 'buy'): void }>()
</script>

<template>
  <div class="apl-buybar">
    <div class="apl-buybar__price">
      <strong>{{ price }}</strong>
      <span v-if="note">{{ note }}</span>
    </div>
    <button class="apl-buybar__cta" type="button" @click="$emit('buy')">{{ cta }}</button>
  </div>
</template>
