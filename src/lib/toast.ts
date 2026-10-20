import { ref } from 'vue'

export const toastMessage = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

export function toast(text: string, ms = 2200) {
  toastMessage.value = text
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    toastMessage.value = ''
  }, ms)
}
