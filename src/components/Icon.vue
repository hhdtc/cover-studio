<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number }>(), {
  size: 18,
})

const PATHS: Record<string, string[]> = {
  template: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  text: ['M5 6V4h14v2', 'M12 4v16', 'M9 20h6'],
  image: [
    'M4 5h16v14H4z',
    'M4 15.5l4.5-4.5 4 4 3-3 4.5 4.5',
    'M15.6 8.4a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0z',
  ],
  layers: ['M12 3l9 5-9 5-9-5 9-5z', 'M3 13l9 5 9-5', 'M3 17l9 5 9-5'],
  undo: ['M9 14L4 9l5-5', 'M4 9h9.5a5.5 5.5 0 0 1 0 11H11'],
  redo: ['M15 14l5-5-5-5', 'M20 9h-9.5a5.5 5.5 0 0 0 0 11H13'],
  download: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 20h16'],
  eye: ['M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z', 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z'],
  'eye-off': ['M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z', 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z', 'M3.5 3.5l17 17'],
  trash: ['M4 7h16', 'M9.5 7V4.5h5V7', 'M6.5 7l1 13h9l1-13', 'M10 10.5v6', 'M14 10.5v6'],
  plus: ['M12 5v14', 'M5 12h14'],
  duplicate: ['M9 9h11v11H9z', 'M5 15V5h10'],
  up: ['M12 19V5', 'M6 11l6-6 6 6'],
  down: ['M12 5v14', 'M6 13l6 6 6-6'],
  shape: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  reset: ['M4 4v6h6', 'M4 10a8 8 0 0 1 13.7-3.7L20 8.5', 'M20 20v-6h-6', 'M20 14a8 8 0 0 1-13.7 3.7L4 15.5'],
  swap: ['M4 8h14l-3.5-3.5', 'M20 16H6l3.5 3.5'],
  check: ['M5 12.5l4.5 4.5L19 7'],
  flow: ['M4 4h16v5H4z', 'M4 11h16v4H4z', 'M4 17h10v3H4z'],
  badge: ['M12 3l7 2.5v5.2c0 4.3-2.9 7.6-7 9.3-4.1-1.7-7-5-7-9.3V5.5L12 3z', 'M9 11.5l2 2 4-4'],
  slides: ['M3 5h18v11H3z', 'M8 20h8', 'M12 16v4'],
  portrait: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 21c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5'],
  sparkles: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z', 'M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z'],
  play: ['M8 5l11 7-11 7V5z'],
  pause: ['M8 5v14', 'M16 5v14'],
  record: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  shuffle: ['M4 7h3l10 10h3', 'M17 4l3 3-3 3', 'M4 17h3l10-10h3', 'M17 14l3 3-3 3'],
  'arrow-left': ['M15 5l-7 7 7 7'],
  'arrow-right': ['M9 5l7 7-7 7'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  'chevron-up': ['M6 15l6-6 6 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  library: ['M4 5h4v15H4z', 'M10 5h4v15h-4z', 'M16.5 6.2l3.5-1 4 13.6-3.5 1z'],
  film: ['M3 5h18v14H3z', 'M7 5v14', 'M17 5v14', 'M3 9h4', 'M3 15h4', 'M17 9h4', 'M17 15h4'],
  star: ['M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.7l5.9-.8L12 3.5z'],
}

const paths = computed(() => PATHS[props.name] ?? [])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>
