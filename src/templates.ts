import type { Doc, Layer, ShapeLayer, TextLayer } from './types'
import { FONTS } from './fonts'

let seq = 0
export function uid() {
  seq += 1
  return `l${Date.now().toString(36)}${seq.toString(36)}`
}

type TextInit = Partial<TextLayer> & { text: string }

function text(init: TextInit): TextLayer {
  return {
    id: uid(),
    kind: 'text',
    x: 0,
    y: 0,
    w: 800,
    fontFamily: FONTS[0].value,
    fontSize: 48,
    fontWeight: 700,
    color: '#ffffff',
    align: 'left',
    lineHeight: 1.25,
    letterSpacing: 0,
    ...init,
  }
}

function ellipse(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  opacity = 1,
): ShapeLayer {
  return {
    id: uid(),
    kind: 'shape',
    name: '圆形',
    shape: 'ellipse',
    x,
    y,
    w,
    h,
    color,
    radius: 0,
    opacity,
  }
}

function bar(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): ShapeLayer {
  return {
    id: uid(),
    kind: 'shape',
    name: '线条',
    shape: 'rect',
    x,
    y,
    w,
    h,
    color,
    radius: Math.min(h / 2, 8),
  }
}

export interface Template {
  id: string
  name: string
  hint: string
  build: () => Doc
}

function inkGold(): Doc {
  return {
    width: 1280,
    height: 720,
    background: { type: 'gradient', from: '#0b0b0c', to: '#1c1812', angle: 135 },
    layers: [
      ellipse(900, 40, 520, 520, '#d8b06a', 0.14),
      ellipse(1080, 430, 260, 260, '#d8b06a', 0.08),
      text({
        x: 96,
        y: 128,
        w: 620,
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: 6,
        color: '#d8b06a',
        text: 'COVER STUDIO · 封面工坊',
      }),
      text({
        x: 96,
        y: 176,
        w: 940,
        fontSize: 92,
        fontWeight: 800,
        lineHeight: 1.14,
        letterSpacing: -1,
        color: '#f6f1e6',
        text: '把复杂的事\n讲得简单',
      }),
      bar(96, 430, 88, 6, '#d8b06a'),
      text({
        x: 96,
        y: 466,
        w: 780,
        fontSize: 23,
        fontWeight: 400,
        lineHeight: 1.7,
        color: '#b7ae9e',
        text: '好的设计，让信息自己开口说话。\n不喧哗，但被看见。',
      }),
      text({
        x: 96,
        y: 648,
        w: 600,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: 3,
        color: '#7c7466',
        text: 'DESIGN NOTES / 2026',
      }),
    ],
  }
}

function paper(): Doc {
  return {
    width: 900,
    height: 383,
    background: { type: 'solid', color: '#f3ede1' },
    layers: [
      text({
        x: 56,
        y: 58,
        w: 700,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 4,
        color: '#8b7f6b',
        text: 'VOL. 07 / 阅读与设计',
      }),
      text({
        x: 56,
        y: 104,
        w: 720,
        fontSize: 47,
        fontWeight: 600,
        fontFamily: FONTS[1].value,
        lineHeight: 1.32,
        color: '#23201a',
        text: '慢下来，\n读一页好文字',
      }),
      bar(56, 286, 72, 2, '#23201a'),
      text({
        x: 56,
        y: 304,
        w: 560,
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: 1,
        color: '#6f6453',
        text: '文字排版 · 版式研究 · 每周更新',
      }),
    ],
  }
}

function neon(): Doc {
  return {
    width: 1080,
    height: 1080,
    background: { type: 'gradient', from: '#ff3d81', to: '#6a2cff', angle: 65 },
    layers: [
      ellipse(700, -180, 620, 620, '#ffd166', 0.28),
      ellipse(-160, 760, 520, 520, '#00e5ff', 0.18),
      text({
        x: 86,
        y: 232,
        w: 560,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 6,
        color: '#fff2f8',
        highlight: true,
        highlightColor: '#ff1f6d',
        text: 'AFTER HOURS',
      }),
      text({
        x: 82,
        y: 312,
        w: 940,
        fontSize: 122,
        fontWeight: 900,
        italic: true,
        lineHeight: 0.98,
        letterSpacing: -3,
        shadow: true,
        color: '#ffffff',
        text: 'NEON\nNIGHTS',
      }),
      text({
        x: 86,
        y: 632,
        w: 820,
        fontSize: 19,
        fontWeight: 600,
        letterSpacing: 8,
        color: '#ffdcea',
        text: 'DESIGN · MUSIC · 2026',
      }),
    ],
  }
}

function wild(): Doc {
  return {
    width: 1080,
    height: 1440,
    background: { type: 'gradient', from: '#24324a', to: '#b96a4e', angle: 165 },
    layers: [
      ellipse(660, 210, 250, 250, '#f8cf95', 0.95),
      text({
        x: 84,
        y: 930,
        w: 600,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 6,
        color: '#f4e3cf',
        text: 'TRAVEL NOTE / 山野',
      }),
      text({
        x: 80,
        y: 976,
        w: 920,
        fontSize: 100,
        fontWeight: 800,
        lineHeight: 1.16,
        color: '#fdf8f1',
        text: '山野之间',
      }),
      bar(84, 1130, 64, 3, '#f8cf95'),
      text({
        x: 84,
        y: 1164,
        w: 820,
        fontSize: 21,
        fontWeight: 400,
        lineHeight: 1.8,
        color: '#efe2d2',
        text: '风从很远的地方来，\n我们也去很远的地方。',
      }),
    ],
  }
}

function signal(): Doc {
  return {
    width: 1280,
    height: 720,
    background: { type: 'gradient', from: '#050e1c', to: '#0e3d63', angle: 120 },
    layers: [
      ellipse(760, -220, 700, 700, '#35a7ff', 0.16),
      ellipse(1020, 420, 340, 340, '#00e0c6', 0.1),
      text({
        x: 88,
        y: 148,
        w: 700,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 5,
        color: '#7fd3ff',
        text: 'DESIGN SYSTEM / 01',
      }),
      text({
        x: 84,
        y: 194,
        w: 900,
        fontSize: 86,
        fontWeight: 800,
        lineHeight: 1.16,
        letterSpacing: -1,
        color: '#eaf7ff',
        text: '构建你的\n视觉信号',
      }),
      bar(88, 448, 64, 4, '#35a7ff'),
      text({
        x: 88,
        y: 478,
        w: 760,
        fontSize: 20,
        fontWeight: 400,
        lineHeight: 1.7,
        color: '#9db4c8',
        text: '一套可复用的视觉语言，\n让每一次表达都清晰有力。',
      }),
    ],
  }
}

function warning(): Doc {
  return {
    width: 1080,
    height: 1080,
    background: { type: 'solid', color: '#ffd60a' },
    layers: [
      text({
        x: 80,
        y: 168,
        w: 600,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 4,
        color: '#ffd60a',
        highlight: true,
        highlightColor: '#141414',
        text: 'LIMITED / 2026',
      }),
      text({
        x: 72,
        y: 296,
        w: 940,
        fontSize: 158,
        fontWeight: 900,
        lineHeight: 0.94,
        letterSpacing: -4,
        color: '#141414',
        text: '不要\n错过',
      }),
      bar(80, 742, 120, 8, '#141414'),
      text({
        x: 80,
        y: 782,
        w: 820,
        fontSize: 22,
        fontWeight: 500,
        lineHeight: 1.7,
        color: '#2a2a2a',
        text: '现在就开始，\n别等下一次。',
      }),
    ],
  }
}

export const TEMPLATES: Template[] = [
  { id: 'ink-gold', name: '墨金', hint: '深色 · 大标题', build: inkGold },
  { id: 'paper', name: '纸感', hint: '米白 · 衬线', build: paper },
  { id: 'neon', name: '霓虹', hint: '渐变色 · 英文', build: neon },
  { id: 'wild', name: '山野', hint: '竖版 · 照片感', build: wild },
  { id: 'signal', name: '信号', hint: '科技蓝 · 16:9', build: signal },
  { id: 'warning', name: '警告', hint: '高对比 · 方形', build: warning },
]

export function createInitialDoc(): Doc {
  return inkGold()
}
