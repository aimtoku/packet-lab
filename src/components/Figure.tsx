import { useId, type ReactNode } from 'react'
import type { FigActor, FigCell, FigTone, Figure as FigureSpec, LayersFigure, MapFigure, SeqFigure } from '../book/types'
import { ANCHOR_HEIGHT } from '../topology/layout'
import { deviceShapes } from './Device'

/** 図を表示するときの拡大率（viewBox の座標より少し大きく描く） */
const SCALE = 1.25

/** 文字列のおおよその幅（全角を1文字、半角を0.58文字として数える） */
function textWidth(s: string, size: number): number {
  let n = 0
  for (const ch of s) n += ch.charCodeAt(0) < 0x80 ? 0.58 : 1
  return n * size
}

const TONES: readonly FigTone[] = ['normal', 'attack', 'defense', 'blocked', 'muted']

/** 図の中で使う矢印の先。色ごとに用意する */
function Markers({ uid }: { uid: string }) {
  return (
    <defs>
      {TONES.map((t) => (
        <marker
          key={t}
          id={`${uid}-a-${t}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className={`fig-head t-${t}`} />
        </marker>
      ))}
      <pattern id={`${uid}-enc`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" className="fig-hatch" />
      </pattern>
    </defs>
  )
}

/** Label を置いたときの左端（番号をラベルに重ねないため） */
function labelLeft(text: string, cx: number, max: number, size = 10): number {
  const w = textWidth(text, size) + 8
  return Math.min(Math.max(cx, w / 2 + 2), max - w / 2 - 2) - w / 2
}

/** 背景付きの文字（線の上に置いても読めるように） */
function Label({ x: cx, y, text, size = 10, add, max }: { x: number; y: number; text: string; size?: number; add?: boolean; max?: number }) {
  const w = textWidth(text, size) + 8
  // 図の外にはみ出さないよう、左右の端で止める
  const x = max ? Math.min(Math.max(cx, w / 2 + 2), max - w / 2 - 2) : cx
  return (
    <g className={add ? 'fig-label add' : 'fig-label'}>
      <rect x={x - w / 2} y={y - size + 0.5} width={w} height={size + 5} rx={3} className="fig-label-bg" />
      <text x={x} y={y + 1.5} textAnchor="middle" fontSize={size}>
        {text}
      </text>
    </g>
  )
}

/** 機器のイラストと名前。x, y は床面の手前の角 */
function Actor({ actor, x, y }: { actor: FigActor; x: number; y: number }) {
  const node = {
    x,
    y,
    type: actor.icon,
    name: actor.name,
    sub: actor.sub ?? '',
  }
  return (
    <g className="fig-actor">
      {actor.add && <ellipse cx={x} cy={y - 2} rx={26} ry={10} className="fig-add-ring" />}
      {deviceShapes(node, !!actor.attacker)}
      {actor.icon !== 'cloud' && (
        <>
          <text x={x} y={y + 14} textAnchor="middle" className={actor.attacker ? 'fig-name atk' : 'fig-name'}>
            {actor.name}
          </text>
          {actor.sub && (
            <text x={x} y={y + 25} textAnchor="middle" className="fig-sub">
              {actor.sub}
            </text>
          )}
        </>
      )}
    </g>
  )
}

function SeqDiagram({ fig, uid }: { fig: SeqFigure; uid: string }) {
  const n = fig.actors.length
  const width = Math.max(440, n * 118)
  const col = width / n
  const xOf = new Map(fig.actors.map((a, i) => [a.id, col * (i + 0.5)]))
  const top = 104
  const row = 34
  const height = top + fig.messages.length * row + 10
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {fig.actors.map((a) => (
        <line key={`life-${a.id}`} x1={xOf.get(a.id)} y1={84} x2={xOf.get(a.id)} y2={height - 6} className="fig-life" />
      ))}
      {fig.actors.map((a) => (
        <Actor key={a.id} actor={a} x={xOf.get(a.id)!} y={52} />
      ))}
      {fig.messages.map((m, i) => {
        const y = top + i * row
        const x1 = xOf.get(m.from)!
        const x2 = xOf.get(m.to)!
        const tone = m.tone ?? 'normal'
        const num = `${i + 1}`
        if (m.from === m.to) {
          const w = textWidth(m.label, 10) + 16
          const cx = Math.min(Math.max(x1, w / 2 + 16), width - w / 2 - 2)
          return (
            <g key={i} className={`fig-msg t-${tone}${m.add ? ' add' : ''}`}>
              <rect x={cx - w / 2} y={y - 12} width={w} height={20} rx={4} className="fig-proc" />
              <text x={cx} y={y + 2} textAnchor="middle" fontSize={10} className="fig-proc-text">
                {m.label}
              </text>
              <text x={cx - w / 2 - 6} y={y + 2} textAnchor="end" className="fig-num">
                {num}
              </text>
            </g>
          )
        }
        const dir = Math.sign(x2 - x1)
        const start = x1 + dir * 3
        const end = tone === 'blocked' ? x1 + (x2 - x1) * 0.62 : x2 - dir * 3
        return (
          <g key={i} className={`fig-msg t-${tone}${m.add ? ' add' : ''}`}>
            <line x1={start} y1={y + 6} x2={end} y2={y + 6} className="fig-arrow" markerEnd={tone === 'blocked' ? undefined : `url(#${uid}-a-${tone})`} />
            {tone === 'blocked' && <path d={`M${end - 5},${y + 1} l10,10 M${end + 5},${y + 1} l-10,10`} className="fig-cross" />}
            <Label x={(x1 + x2) / 2} y={y - 3} text={m.label} add={m.add} max={width} />
            <text x={Math.min(x1, x2, labelLeft(m.label, (x1 + x2) / 2, width)) - 8} y={y + 9} textAnchor="end" className="fig-num">
              {num}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Cell({ cell, x, y, w, h, uid }: { cell: FigCell; x: number; y: number; w: number; h: number; uid: string }) {
  return (
    <g className={`fig-cell ly-${cell.ly}${cell.add ? ' add' : ''}`}>
      <rect x={x} y={y} width={w} height={h} rx={3} className="fig-cell-box" />
      {cell.enc && <rect x={x} y={y} width={w} height={h} rx={3} fill={`url(#${uid}-enc)`} className="fig-cell-enc" />}
      <text x={x + w / 2} y={cell.sub ? y + h / 2 - 2 : y + h / 2 + 4} textAnchor="middle" className="fig-cell-label">
        {cell.label}
      </text>
      {cell.sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" className="fig-cell-sub">
          {cell.sub}
        </text>
      )}
    </g>
  )
}

function LayersDiagram({ fig, uid }: { fig: LayersFigure; uid: string }) {
  const width = 560
  const pad = 4
  const cellH = 46
  const rowH = cellH + 34
  const height = fig.rows.length * rowH + 4
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {fig.rows.map((r, i) => {
        const y = i * rowH + 22
        const total = r.cells.reduce((s, c) => s + (c.w ?? 1), 0)
        const unit = (width - pad * 2 - (r.cells.length - 1) * 3) / total
        let x = pad
        return (
          <g key={i}>
            <text x={pad} y={y - 8} className="fig-row-caption">
              {r.caption}
            </text>
            {r.cells.map((c, j) => {
              const w = (c.w ?? 1) * unit
              const el = <Cell key={j} cell={c} x={x} y={y} w={w} h={cellH} uid={uid} />
              x += w + 3
              return el
            })}
          </g>
        )
      })}
    </svg>
  )
}

const CW = 150
const CH = 104

function MapDiagram({ fig, uid }: { fig: MapFigure; uid: string }) {
  const width = fig.cols * CW
  const height = fig.rows * CH
  const pos = new Map(fig.nodes.map((n) => [n.id, { x: n.x * CW + CW / 2, y: n.y * CH + CH / 2 + 14, n }]))
  const anchor = (id: string) => {
    const p = pos.get(id)!
    return {
      x: p.x,
      y: p.y - (p.n.icon === 'cloud' ? 0 : Math.max(ANCHOR_HEIGHT[p.n.icon], 10)),
      r: p.n.icon === 'cloud' ? 44 : 24,
    }
  }
  const lines = fig.links.map((l) => {
    const a = anchor(l.from)
    const b = anchor(l.to)
    const tone = l.tone ?? (l.arrow ? 'normal' : 'muted')
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    // 機器のイラストに重ならないよう、両端を縮める
    const sa = Math.min(a.r, len / 3)
    const sb = Math.min(b.r, len / 3)
    const x1 = a.x + (dx / len) * sa
    const y1 = a.y + (dy / len) * sa
    const x2 = b.x - (dx / len) * sb
    const y2 = b.y - (dy / len) * sb
    const blocked = tone === 'blocked'
    const ex = blocked ? x1 + (x2 - x1) * 0.7 : x2
    const ey = blocked ? y1 + (y2 - y1) * 0.7 : y2
    // ラベルは線の少し上（線と重ならないように、線に垂直な方向へずらす）
    let nx = dy / len
    let ny = -dx / len
    if (ny > 0) {
      nx = -nx
      ny = -ny
    }
    const lx = (x1 + ex) / 2 + nx * 9
    const ly = (y1 + ey) / 2 + ny * 9 + 3
    return { l, tone, blocked, x1, y1, ex, ey, lx, ly }
  })
  const cls = (l: (typeof lines)[number]) => `fig-link t-${l.tone}${l.l.dashed ? ' dashed' : ''}${l.l.add ? ' add' : ''}`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {fig.zones?.map((z, i) => (
        <g key={i} className={z.add ? 'fig-zone add' : 'fig-zone'}>
          <rect x={z.x * CW + 5} y={z.y * CH + 5} width={z.w * CW - 10} height={z.h * CH - 10} rx={8} />
          <text x={z.x * CW + 14} y={z.y * CH + 20}>
            {z.label}
          </text>
        </g>
      ))}
      {lines.map((v, i) => (
        <g key={i} className={cls(v)}>
          <line x1={v.x1} y1={v.y1} x2={v.ex} y2={v.ey} markerEnd={v.l.arrow && !v.blocked ? `url(#${uid}-a-${v.tone})` : undefined} />
        </g>
      ))}
      {fig.nodes.map((n) => {
        const p = pos.get(n.id)!
        return <Actor key={n.id} actor={n} x={p.x} y={p.y} />
      })}
      {lines.map((v, i) => (
        <g key={i} className={cls(v)}>
          {v.blocked && <path d={`M${v.ex - 5},${v.ey - 5} l10,10 M${v.ex + 5},${v.ey - 5} l-10,10`} className="fig-cross" />}
          {v.l.label && <Label x={v.lx} y={v.ly} text={v.l.label} size={9.5} add={v.l.add} max={width} />}
        </g>
      ))}
    </svg>
  )
}

function hasAdd(fig: FigureSpec): boolean {
  switch (fig.kind) {
    case 'seq':
      return fig.actors.some((a) => a.add) || fig.messages.some((m) => m.add)
    case 'layers':
      return fig.rows.some((r) => r.cells.some((c) => c.add))
    case 'map':
      return fig.nodes.some((n) => n.add) || fig.links.some((l) => l.add) || !!fig.zones?.some((z) => z.add)
  }
}

/** 教科書の図。caption は図の下に出し、読み上げ用の名前にも使う */
export function Figure({ figure, caption, number }: { figure: FigureSpec; caption: ReactNode; number: string }) {
  const uid = `f${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <figure className="book-fig">
      <div className="fig-scroll" role="img" aria-labelledby={`${uid}-cap`}>
        {figure.kind === 'seq' && <SeqDiagram fig={figure} uid={uid} />}
        {figure.kind === 'layers' && <LayersDiagram fig={figure} uid={uid} />}
        {figure.kind === 'map' && <MapDiagram fig={figure} uid={uid} />}
      </div>
      <figcaption id={`${uid}-cap`}>
        <span className="fig-no">図{number}</span>
        <span>{caption}</span>
        {hasAdd(figure) && (
          <span className="fig-legend">
            <span className="fig-legend-mark" aria-hidden="true" />
            この節で加わったもの
          </span>
        )}
      </figcaption>
    </figure>
  )
}
