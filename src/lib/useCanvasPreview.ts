import { watchEffect } from 'vue'
import type { Ref } from 'vue'

/**
 * Keep a preview canvas in sync with reactive state.
 * The draw function is executed inside watchEffect, so any reactive
 * values it reads become dependencies automatically.
 */
export function useCanvasPreview(
  canvas: Ref<HTMLCanvasElement | null>,
  size: () => { width: number; height: number },
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  watchEffect(() => {
    const el = canvas.value
    if (!el) return
    const { width, height } = size()
    if (el.width !== width || el.height !== height) {
      el.width = width
      el.height = height
    }
    const ctx = el.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, width, height)
    draw(ctx)
    ctx.restore()
  })
}
