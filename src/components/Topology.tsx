import { useMemo } from 'react'
import type { Mode, NodeId, Scenario } from '../types'
import { usePacketTravel } from '../hooks/usePacketTravel'
import { stopIndex, type SubStep } from '../playback/substeps'
import {
  anchorOf,
  EDGES,
  pathLength,
  pointAlong,
  TOP_HEIGHT,
  type Point,
  VIEW_HEIGHT,
  VIEW_HEIGHT_MOBILE,
  VIEW_WIDTH,
  ZONES,
} from '../topology/layout'
import { attackerNodes, nodesFor, stepRoute } from '../topology/route'
import { deviceShapes } from './Device'

interface Props {
  scenario: Scenario
  mode: Mode
  index: number
  /** 今のステップの区切りと、今どの区切りか */
  subs: readonly SubStep[]
  sub: number
  travelMs: number
  onArrive: (key: string) => void
  /** 今の区切りにパケットが着いたか */
  arrived: boolean
}

/** 阻止された攻撃のパケットを、終点の手前どこで止めるか */
const BLOCK_INSET = 22

/**
 * 阻止の印（✕）の位置。止まった位置から、その区間の経路と直角の方向に少しずらす
 * （上向き、経路が縦のときは右向き）。機器の名前やバッジと重ならないようにするため。
 */
function crossPosition(a: Point, b: Point, stop: Point): Point {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
  let px = -(b[1] - a[1]) / len
  let py = (b[0] - a[0]) / len
  if (Math.abs(py) < 0.35) {
    if (px < 0) [px, py] = [-px, -py]
  } else if (py > 0) [px, py] = [-px, -py]
  return [stop[0] + px * 15, stop[1] + py * 15]
}

export function Topology({ scenario, mode, index, subs, sub, travelMs, onArrive, arrived }: Props) {
  const nodes = useMemo(() => nodesFor(scenario), [scenario])
  const attackers = useMemo(() => attackerNodes(scenario), [scenario])
  const steps = scenario.steps[mode]
  const routes = useMemo(() => steps.map((s) => stepRoute(scenario, nodes, s.from, s.to)), [scenario, nodes, steps])
  const step = steps[index]
  const route = routes[index] ?? []
  const points = route.map((id) => anchorOf(nodes[id]!))
  const stop = step ? stopIndex(route, step) : null
  const current = subs[Math.min(sub, subs.length - 1)]
  // 経路の始点から、各機器までの距離
  const distances = points.map((_, i) => pathLength(points.slice(0, i + 1)))
  // 阻止されるときに止まる位置：止める機器の手前（送信元で止めるときは、出てすぐ）
  const stopDistance =
    stop === null ? null : stop === 0 ? Math.min(BLOCK_INSET, (distances[1] ?? 0) / 2) : Math.max(0, (distances[stop] ?? 0) - BLOCK_INSET)
  const target = !current ? 0 : current.kind === 'blocked' && stopDistance !== null ? stopDistance : (distances[current.routeIndex] ?? 0)
  const stepKey = `${scenario.id}/${mode}/${index}`
  const ref = usePacketTravel(points, target, travelMs, stepKey, `${stepKey}/${sub}`, onArrive)

  if (!step) return null

  /** このシナリオのどこかのステップで使う機器。使わない機器は薄く表示する */
  const involved = new Set<NodeId>([...Object.values(scenario.topology.map), ...routes.flat()])
  // 今パケットがいる機器を、輪で示す
  const focusId = current?.node ?? scenario.topology.map[step.to]
  const height = scenario.topology.mobile ? VIEW_HEIGHT_MOBILE : VIEW_HEIGHT
  const zones = ZONES.filter(
    (z) =>
      (z.id !== 'ext' || scenario.topology.devices?.ext1 || scenario.topology.devices?.ext2) &&
      (z.id !== 'mobile' || scenario.topology.mobile),
  )
  // 奥（上）の機器から順に描き、手前の機器が重なるようにする
  const order = (Object.keys(nodes) as NodeId[]).sort((a, b) => nodes[a]!.y - nodes[b]!.y)
  const isDim = (id: NodeId) => !involved.has(id) || (attackers.includes(id) && mode === 'normal')
  // 阻止されるときは、止める機器までの経路だけを描く
  const drawn = stop === null ? points : points.slice(0, Math.max(stop, 1) + 1)
  const cross =
    stop !== null && stopDistance !== null && points.length > 1 && current?.kind === 'blocked' && arrived
      ? crossPosition(points[Math.max(stop - 1, 0)]!, points[Math.max(stop, 1)]!, pointAlong(points, stopDistance))
      : null

  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} role="img" aria-label={`${scenario.name}のネットワーク構成図`}>
      {zones.map((z) => (
        <g key={z.id} className="zone">
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={10} />
          <text x={z.x + 8} y={z.y + 13}>
            {z.label}
          </text>
        </g>
      ))}
      {EDGES.filter(([a, b]) => nodes[a] && nodes[b]).map(([a, b]) => {
        const [x1, y1] = anchorOf(nodes[a]!)
        const [x2, y2] = anchorOf(nodes[b]!)
        return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className="cable" />
      })}
      {drawn.length > 1 && <polyline className={`hop k-${step.kind}`} points={drawn.map((p) => p.join(',')).join(' ')} />}

      {/* 機器のイラスト */}
      {order.map((id) => {
        const node = nodes[id]!
        return (
          <g key={id} className={isDim(id) ? 'node dim' : 'node'}>
            {id === focusId && <ellipse cx={node.x} cy={node.y - 3} rx={20} ry={9} className={`ring k-${step.kind}`} />}
            {deviceShapes(node, attackers.includes(id))}
          </g>
        )
      })}

      {/* 名前とバッジは、機器のイラストに隠れないよう最後に重ねる */}
      {order.map((id) => {
        const node = nodes[id]!
        const badgeY = node.y - TOP_HEIGHT[node.type] - 3
        return (
          <g key={id} className={isDim(id) ? 'node dim' : 'node'}>
            {node.type !== 'cloud' && node.name && (
              <text x={node.x} y={node.y + 11} textAnchor="middle" className="node-name">
                {node.name}
              </text>
            )}
            {node.type !== 'cloud' && node.sub && (
              <text x={node.x} y={node.y + 20} textAnchor="middle" className="node-sub">
                {node.sub}
              </text>
            )}
            {attackers.includes(id) && (
              <g transform={`translate(${node.x + 12},${badgeY})`} className="badge-attacker">
                <circle r={6} />
                <text y={3} textAnchor="middle">
                  !
                </text>
              </g>
            )}
            {mode === 'defense' && scenario.topology.shields.includes(id) && (
              <g
                transform={node.type === 'cloud' ? `translate(${node.x - 50},${node.y - 4})` : `translate(${node.x - 13},${badgeY})`}
                className="badge-shield"
              >
                <path d="M0,-6 L6,-4 V1 C6,5 0,8 0,8 C0,8 -6,5 -6,1 V-4 Z" />
                <text y={3} textAnchor="middle">
                  ✓
                </text>
              </g>
            )}
          </g>
        )
      })}

      {points.length > 1 && <circle ref={ref} r={5} className={`packet k-${step.kind}`} cx={points[0]![0]} cy={points[0]![1]} />}
      {cross && (
        <path className="blocked-mark" d={`M${cross[0] - 6},${cross[1] - 6} l12,12 M${cross[0] + 6},${cross[1] - 6} l-12,12`} />
      )}
    </svg>
  )
}
