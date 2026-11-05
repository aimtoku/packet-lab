import type { ReactNode } from 'react'
import type { NodeSpec, Point } from '../topology/layout'

/** 等角投影での奥行き方向の係数（cos 30°） */
const COS = 0.866

type Palette = 'device' | 'firewall' | 'attacker'

interface Box {
  front: Point
  left: Point
  right: Point
}

const fmt = (points: readonly Point[]) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/**
 * 直方体を描く。x, y は床面の手前の角。w は左方向の幅、d は右方向の奥行き、h は高さ。
 * raw が false のときは、幅と奥行きの差の分だけ中心に寄せる。
 */
function box(out: ReactNode[], key: string, x: number, y: number, w: number, d: number, h: number, palette: Palette, raw = false): Box {
  const fx = raw ? x : x + ((w - d) * COS) / 2
  const front: Point = [fx, y]
  const left: Point = [fx - w * COS, y - w / 2]
  const right: Point = [fx + d * COS, y - d / 2]
  const back: Point = [left[0] + d * COS, left[1] - d / 2]
  const up = ([px, py]: Point): Point => [px, py - h]
  out.push(
    <polygon key={`${key}-l`} className={`face ${palette} side-l`} points={fmt([front, left, up(left), up(front)])} />,
    <polygon key={`${key}-r`} className={`face ${palette} side-r`} points={fmt([front, right, up(right), up(front)])} />,
    <polygon key={`${key}-t`} className={`face ${palette} side-t`} points={fmt([up(front), up(left), up(back), up(right)])} />,
  )
  return { front, left, right }
}

/** 左側面上の点。u は手前から奥への割合、v は床面からの高さ */
const onLeft = (b: Box, u: number, v: number): Point => [
  b.front[0] + u * (b.left[0] - b.front[0]),
  b.front[1] + u * (b.left[1] - b.front[1]) - v,
]
const onRight = (b: Box, u: number, v: number): Point => [
  b.front[0] + u * (b.right[0] - b.front[0]),
  b.front[1] + u * (b.right[1] - b.front[1]) - v,
]

function line(out: ReactNode[], key: string, a: Point, b: Point, className: string) {
  out.push(<line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={className} />)
}

function screen(out: ReactNode[], key: string, b: Box, v1: number, v2: number) {
  out.push(
    <polygon
      key={key}
      className="screen"
      points={fmt([onLeft(b, 0.08, v1), onLeft(b, 0.92, v1), onLeft(b, 0.92, v2), onLeft(b, 0.08, v2)])}
    />,
  )
}

const CLOUD_PUFFS: readonly (readonly [number, number, number])[] = [
  [-34, 6, 17],
  [-14, -8, 21],
  [12, -9, 19],
  [33, 4, 17],
  [0, 9, 22],
  [-18, 10, 15],
  [20, 11, 15],
]

/** 機器のイラスト（SVG要素の配列）を返す */
export function deviceShapes(node: NodeSpec, attacker: boolean): ReactNode[] {
  const { x, y, type } = node
  const palette: Palette = attacker ? 'attacker' : 'device'
  const out: ReactNode[] = []
  switch (type) {
    case 'server': {
      const b = box(out, 'body', x, y, 13, 13, 30, palette)
      ;[23, 17, 11].forEach((v, i) => line(out, `slot${i}`, onLeft(b, 0.15, v), onLeft(b, 0.85, v), 'slot'))
      const [lx, ly] = onLeft(b, 0.22, 27)
      out.push(<circle key="led" cx={lx} cy={ly} r={1.2} className="led" />)
      break
    }
    case 'pc': {
      box(out, 'base', x, y, 12, 9, 2, palette)
      const monitor = box(out, 'monitor', x, y - 4, 22, 4, 16, palette)
      screen(out, 'screen', monitor, 2, 14)
      break
    }
    case 'laptop': {
      const base = box(out, 'base', x, y, 20, 14, 2, palette)
      const lid = box(out, 'lid', base.front[0] + 12 * COS, base.front[1] - 8, 20, 2, 14, palette, true)
      screen(out, 'screen', lid, 2, 12.5)
      break
    }
    case 'switch': {
      const b = box(out, 'body', x, y, 30, 12, 6, palette)
      for (let i = 0; i < 8; i++) {
        const [px, py] = onLeft(b, 0.12 + i * 0.1, 3)
        out.push(<circle key={`port${i}`} cx={px} cy={py} r={0.9} className="port" />)
      }
      break
    }
    case 'fw': {
      const b = box(out, 'body', x, y, 26, 10, 22, 'firewall')
      for (let row = 0; row < 4; row++) {
        const v = row * 5.5
        if (row > 0) {
          line(out, `hl${row}`, onLeft(b, 0, v), onLeft(b, 1, v), 'brick')
          line(out, `hr${row}`, onRight(b, 0, v), onRight(b, 1, v), 'brick')
        }
        for (let u = row % 2 ? 0.17 : 0.34; u < 1; u += 0.34) {
          line(out, `v${row}-${u.toFixed(2)}`, onLeft(b, u, v), onLeft(b, u, v + 5.5), 'brick')
        }
      }
      break
    }
    case 'ap': {
      const b = box(out, 'body', x, y, 13, 13, 4, palette)
      line(out, 'ant1', [b.left[0] + 3, b.left[1] - 5], [b.left[0] + 3, b.left[1] - 15], 'antenna')
      line(out, 'ant2', [b.right[0] - 3, b.right[1] - 5], [b.right[0] - 3, b.right[1] - 15], 'antenna')
      out.push(<path key="wifi" className="wifi" d={`M${x - 5},${y - 20} q5,-4 10,0 M${x - 9},${y - 24} q9,-7 18,0`} />)
      break
    }
    case 'team': {
      // CSIRT：奥と手前に2人。機器ではないので、立体の箱ではなく人の形で描く
      const person = (key: string, px: number, py: number, scale: number) => {
        const w = 7 * scale
        const h = 12 * scale
        out.push(
          <path
            key={`${key}-body`}
            className="person-body"
            d={`M${px - w},${py} Q${px - w},${py - h} ${px},${py - h} Q${px + w},${py - h} ${px + w},${py} Z`}
          />,
          <circle key={`${key}-head`} className="person-head" cx={px} cy={py - h - 4.4 * scale} r={4.2 * scale} />,
        )
      }
      person('back', x + 7, y - 4, 0.85)
      person('front', x - 3, y, 1)
      break
    }
    case 'cloud': {
      out.push(
        <g key="outline" className="cloud-outline">
          {CLOUD_PUFFS.map(([dx, dy, r], i) => (
            <circle key={i} cx={x + dx} cy={y + dy} r={r} />
          ))}
        </g>,
        <g key="fill" className="cloud-fill">
          {CLOUD_PUFFS.map(([dx, dy, r], i) => (
            <circle key={i} cx={x + dx} cy={y + dy} r={r} />
          ))}
        </g>,
        <text key="label" x={x} y={y + 4} textAnchor="middle" className="cloud-label">
          {node.name}
        </text>,
      )
      break
    }
  }
  return out
}
