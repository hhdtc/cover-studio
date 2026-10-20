<script setup lang="ts">
import { toastMessage } from '../lib/toast'
</script>

<template>
  <Transition name="toast">
    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </Transition>
</template>
