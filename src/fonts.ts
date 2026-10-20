export interface FontOption {
  label: string
  value: string
}

export const FONTS: FontOption[] = [
  {
    label: '无衬线 · 思源黑体',
    value:
      '"Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
  },
  {
    label: '衬线 · 宋体',
    value:
      '"Songti SC", "Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC", "Source Han Serif CN", "SimSun", serif',
  },
  {
    label: '楷体',
    value: '"Kaiti SC", "STKaiti", "KaiTi", serif',
  },
  {
    label: '粗黑 · 标题',
    value:
      '"PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif',
  },
  {
    label: '英文 · 无衬线',
    value: '"Inter", "Helvetica Neue", Arial, sans-serif',
  },
  {
    label: '英文 · 衬线',
    value: 'Georgia, "Times New Roman", serif',
  },
  {
    label: '等宽',
    value: '"JetBrains Mono", "SF Mono", Consolas, monospace',
  },
]

export const WEIGHTS = [
  { label: '细', value: 300 },
  { label: '常规', value: 400 },
  { label: '中等', value: 500 },
  { label: '半粗', value: 600 },
  { label: '粗', value: 700 },
  { label: '特粗', value: 800 },
  { label: '黑体', value: 900 },
]

export function fontString(l: {
  italic?: boolean
  fontWeight: number
  fontSize: number
  fontFamily: string
}) {
  return `${l.italic ? 'italic ' : ''}${l.fontWeight} ${l.fontSize}px ${l.fontFamily}`
}
