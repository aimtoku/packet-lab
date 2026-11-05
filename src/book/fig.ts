import type { TopicBlock } from '../topics/types'
import type { DeviceType } from '../types'
import type { BookBlock, FigActor, FigCell, FigLink, FigMessage, FigNode, FigTone, FigZone, Figure, LayersFigure, MapFigure, SeqFigure } from './types'

// 章を書きやすくするための小さな関数

export const p = (text: string): TopicBlock => ({ kind: 'p', text })
export const note = (text: string): TopicBlock => ({ kind: 'note', text })
export const list = (...items: string[]): TopicBlock => ({
  kind: 'list',
  items,
})
export const steps = (...items: [string, string][]): TopicBlock => ({
  kind: 'steps',
  items: items.map(([title, text]) => ({ title, text })),
})
export const table = (head: string[], ...rows: string[][]): TopicBlock => ({
  kind: 'table',
  head,
  rows,
})
export const fig = (figure: Figure, caption: string): BookBlock => ({
  kind: 'figure',
  figure,
  caption,
})

interface Opts {
  sub?: string
  attacker?: boolean
  add?: boolean
}

/** 機器・人 */
export const actor = (id: string, name: string, icon: DeviceType, opts: Opts = {}): FigActor => ({ id, name, icon, ...opts })

/** やり取り。tone を省略すると正常 */
export const m = (from: string, to: string, label: string, tone: FigTone = 'normal', add = false): FigMessage => ({ from, to, label, tone, add })
/** この節で加わったやり取り */
export const mAdd = (from: string, to: string, label: string, tone: FigTone = 'normal'): FigMessage => m(from, to, label, tone, true)

export const seq = (actors: FigActor[], messages: FigMessage[]): SeqFigure => ({
  kind: 'seq',
  actors,
  messages,
})

/** 見出しの区画 */
export const cell = (ly: FigCell['ly'], label: string, sub?: string, opts: { w?: number; enc?: boolean; add?: boolean } = {}): FigCell => ({
  ly,
  label,
  ...(sub ? { sub } : {}),
  ...opts,
})
export const layers = (...rows: [string, FigCell[]][]): LayersFigure => ({
  kind: 'layers',
  rows: rows.map(([caption, cells]) => ({ caption, cells })),
})

/** 構成図の機器 */
export const node = (id: string, name: string, icon: DeviceType, x: number, y: number, opts: Opts = {}): FigNode => ({ id, name, icon, x, y, ...opts })
export const link = (from: string, to: string, opts: Omit<FigLink, 'from' | 'to'> = {}): FigLink => ({ from, to, ...opts })
export const zone = (label: string, x: number, y: number, w: number, h: number, add = false): FigZone => ({ label, x, y, w, h, add })
export const map = (cols: number, rows: number, nodes: FigNode[], links: FigLink[], zones: FigZone[] = []): MapFigure => ({
  kind: 'map',
  cols,
  rows,
  nodes,
  links,
  zones,
})
