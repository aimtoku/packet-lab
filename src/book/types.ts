import type { TopicBlock } from '../topics/types'
import type { DeviceType, Mode } from '../types'

/**
 * 教科書：シナリオごとの「章」を、節（セクション）を積み重ねて読む。
 * 節ごとに専用の図を1枚以上置き、前の節の図に、この節で加わる要素（add: true）を重ねていく。
 */

/** 図の色分け */
export type FigTone = 'normal' | 'attack' | 'defense' | 'blocked' | 'muted'

/** 図に描く機器・人 */
export interface FigActor {
  id: string
  name: string
  sub?: string
  icon: DeviceType
  attacker?: boolean
  /** この節で加わったもの（強調して描く） */
  add?: boolean
}

/** シーケンス図のやり取り。from と to が同じなら、その機器の中の処理 */
export interface FigMessage {
  from: string
  to: string
  label: string
  tone?: FigTone
  add?: boolean
}

/** シーケンス図：だれとだれが、どの順にやり取りするか */
export interface SeqFigure {
  kind: 'seq'
  actors: readonly FigActor[]
  messages: readonly FigMessage[]
}

/** 見出し（ヘッダ）の1区画 */
export interface FigCell {
  label: string
  sub?: string
  /** 層の色（L2・L3・L4・暗号・トンネル・アプリケーション） */
  ly: 'l2' | 'l3' | 'l4' | 'sec' | 'tunnel' | 'l7'
  /** 横幅の比（既定 1） */
  w?: number
  /** 暗号化されている（斜線で表す） */
  enc?: boolean
  add?: boolean
}

/** パケットの構造：見出しを横に並べる。行ごとに、変換や積み重ねの前後を比べられる */
export interface LayersFigure {
  kind: 'layers'
  rows: readonly { caption: string; cells: readonly FigCell[] }[]
}

/** 構成図の機器。x, y は格子の位置（0から） */
export interface FigNode extends FigActor {
  x: number
  y: number
}

export interface FigLink {
  from: string
  to: string
  label?: string
  tone?: FigTone
  /** 矢印を付ける（通信の向き） */
  arrow?: boolean
  /** 無線や論理的なつながり */
  dashed?: boolean
  add?: boolean
}

/** 区域（社内LAN、DMZなど）。格子の位置と大きさ */
export interface FigZone {
  label: string
  x: number
  y: number
  w: number
  h: number
  add?: boolean
}

/** 構成図：どの機器がどこにあり、どうつながるか */
export interface MapFigure {
  kind: 'map'
  cols: number
  rows: number
  zones?: readonly FigZone[]
  nodes: readonly FigNode[]
  links: readonly FigLink[]
}

export type Figure = SeqFigure | LayersFigure | MapFigure

export type BookBlock = TopicBlock | { kind: 'figure'; figure: Figure; caption: string }

export interface BookSection {
  /** ページ内リンクに使う（英小文字とハイフン） */
  id: string
  title: string
  blocks: readonly BookBlock[]
  /** 図解で確かめる場面（シナリオのモードとステップ。ステップは1から） */
  see?: { mode: Mode; step: number; label: string }
}

export type PartId = 'basics' | 'crypto' | 'name-mail' | 'web' | 'lan' | 'ops'

/** 章。id はシナリオのIDと同じ */
export interface Chapter {
  id: string
  part: PartId
  title: string
  /** 章の冒頭に出す一文 */
  lead: string
  sections: readonly BookSection[]
}
