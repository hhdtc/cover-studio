export type Align = 'left' | 'center' | 'right'

export interface BaseLayer {
  id: string
  name?: string
  hidden?: boolean
  opacity?: number
}

export interface TextLayer extends BaseLayer {
  kind: 'text'
  x: number
  y: number
  w: number
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  italic?: boolean
  color: string
  align: Align
  lineHeight: number
  letterSpacing: number
  shadow?: boolean
  highlight?: boolean
  highlightColor?: string
}

export interface ImageLayer extends BaseLayer {
  kind: 'image'
  x: number
  y: number
  w: number
  h: number
  src: string
  fit: 'cover' | 'contain'
  radius: number
}

export interface ShapeLayer extends BaseLayer {
  kind: 'shape'
  x: number
  y: number
  w: number
  h: number
  color: string
  shape: 'rect' | 'ellipse'
  radius: number
}

export type Layer = TextLayer | ImageLayer | ShapeLayer

export type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'image'; src: string; fit: 'cover' | 'contain'; blur: number; dim: number }

export interface Doc {
  width: number
  height: number
  background: Background
  layers: Layer[]
}
