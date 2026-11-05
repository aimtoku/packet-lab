import type { DeviceType, NodeId } from '../types'

/** 構成図の機器。x, y は機器の床面の手前の角（等角投影） */
export interface NodeSpec {
  x: number
  y: number
  type: DeviceType
  name: string
  sub: string
}

export const VIEW_WIDTH = 360
export const VIEW_HEIGHT = 334
export const VIEW_HEIGHT_MOBILE = 362

/** 企業ネットワークの標準構成。シナリオごとに、使う機器だけを表示する */
export const BASE_NODES: Record<NodeId, NodeSpec> = {
  web: { x: 36, y: 76, type: 'server', name: 'Web', sub: '' },
  mail: { x: 90, y: 76, type: 'server', name: 'メール', sub: '' },
  adns: { x: 144, y: 76, type: 'server', name: '権威DNS', sub: '' },
  dsw: { x: 90, y: 118, type: 'switch', name: '', sub: '' },
  fw: { x: 90, y: 172, type: 'fw', name: 'FW', sub: '' },
  sw: { x: 90, y: 218, type: 'switch', name: 'L2SW', sub: '' },
  pc: { x: 40, y: 282, type: 'pc', name: 'PC', sub: '' },
  cache: { x: 140, y: 282, type: 'server', name: 'キャッシュDNS', sub: '社内' },
  lan2: { x: 90, y: 300, type: 'pc', name: '', sub: '' },
  inet: { x: 266, y: 174, type: 'cloud', name: 'インターネット', sub: '' },
  ext1: { x: 226, y: 80, type: 'server', name: '', sub: '' },
  ext2: { x: 312, y: 80, type: 'server', name: '', sub: '' },
  laptop: { x: 214, y: 334, type: 'laptop', name: 'ノートPC', sub: '' },
  ap: { x: 272, y: 310, type: 'ap', name: '公衆AP', sub: '' },
  fakeap: { x: 326, y: 334, type: 'ap', name: '偽AP', sub: '' },
}

/** ケーブル（無線を含む）のつながり */
export const EDGES: readonly (readonly [NodeId, NodeId])[] = [
  ['web', 'dsw'],
  ['mail', 'dsw'],
  ['adns', 'dsw'],
  ['dsw', 'fw'],
  ['fw', 'sw'],
  ['sw', 'pc'],
  ['sw', 'cache'],
  ['sw', 'lan2'],
  ['fw', 'inet'],
  ['inet', 'ext1'],
  ['inet', 'ext2'],
  ['inet', 'ap'],
  ['ap', 'laptop'],
  ['inet', 'fakeap'],
  ['fakeap', 'laptop'],
]

export interface Zone {
  id: 'dmz' | 'lan' | 'ext' | 'mobile'
  x: number
  y: number
  w: number
  h: number
  label: string
}

export const ZONES: readonly Zone[] = [
  { id: 'dmz', x: 8, y: 8, w: 166, h: 126, label: 'DMZ（example.co.jp）' },
  { id: 'lan', x: 8, y: 194, w: 166, h: 132, label: '社内LAN' },
  { id: 'ext', x: 186, y: 8, w: 166, h: 110, label: '外部' },
  { id: 'mobile', x: 186, y: 262, w: 166, h: 96, label: '外出先（公衆Wi-Fi）' },
]

/** ケーブルをつなぐ高さ（床面からの高さ） */
export const ANCHOR_HEIGHT: Record<DeviceType, number> = {
  server: 18,
  pc: 13,
  laptop: 8,
  switch: 5,
  fw: 12,
  ap: 3,
  cloud: 0,
}

/** 機器のてっぺんの高さ（バッジを置く位置） */
export const TOP_HEIGHT: Record<DeviceType, number> = {
  server: 32,
  pc: 22,
  laptop: 20,
  switch: 9,
  fw: 24,
  ap: 22,
  cloud: 34,
}

export type Point = readonly [number, number]

export function anchorOf(node: NodeSpec): Point {
  return [node.x, node.y - ANCHOR_HEIGHT[node.type]]
}

/** 折れ線の長さ */
export function pathLength(points: readonly Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1] as Point
    const [x1, y1] = points[i] as Point
    total += Math.hypot(x1 - x0, y1 - y0)
  }
  return total
}

/** 折れ線の始点から distance だけ進んだ位置 */
export function pointAlong(points: readonly Point[], distance: number): Point {
  let rest = Math.max(0, distance)
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1] as Point
    const [x1, y1] = points[i] as Point
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (rest <= len || i === points.length - 1) {
      const ratio = len === 0 ? 1 : Math.min(1, rest / len)
      return [x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio]
    }
    rest -= len
  }
  return points[0] ?? [0, 0]
}
