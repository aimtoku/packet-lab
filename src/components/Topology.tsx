import { useMemo } from 'react'
import type { Mode, NodeId, Scenario } from '../types'
import { usePacketAnimation } from '../hooks/usePacketAnimation'
import {
  anchorOf,
  EDGES,
  pathLength,
  pointAlong,
  TOP_HEIGHT,
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
}

/** 阻止された攻撃のパケットを、終点の手前どこで止めるか */
const BLOCK_INSET = 22

export function Topology({ scenario, mode, index }: Props) {
  const nodes = useMemo(() => nodesFor(scenario), [scenario])
  const attackers = useMemo(() => attackerNodes(scenario), [scenario])
  const steps = scenario.steps[mode]
  const routes = useMemo(() => steps.map((s) => stepRoute(scenario, nodes, s.from, s.to)), [scenario, nodes, steps])
  const step = steps[index]
  const route = routes[index] ?? []
  const points = route.map((id) => anchorOf(nodes[id]!))
  const blocked = step?.kind === 'blocked'
  const { ref, arrived } = usePacketAnimation(points, blocked ? BLOCK_INSET : 0, `${scenario.id}/${mode}/${index}`)

  if (!step) return null

  /** このシナリオのどこかのステップで使う機器。使わない機器は薄く表示する */
  const involved = new Set<NodeId>([...Object.values(scenario.topology.map), ...routes.flat()])
  const targetId = scenario.topology.map[step.to]
  const height = scenario.topology.mobile ? VIEW_HEIGHT_MOBILE : VIEW_HEIGHT
  const zones = ZONES.filter(
    (z) => (z.id !== 'ext' || scenario.topology.external) && (z.id !== 'mobile' || scenario.topology.mobile),
  )
  // 奥（上）の機器から順に描き、手前の機器が重なるようにする
  const order = (Object.keys(nodes) as NodeId[]).sort((a, b) => nodes[a]!.y - nodes[b]!.y)
  const isDim = (id: NodeId) => !involved.has(id) || (attackers.includes(id) && mode === 'normal')
  const stopPoint = blocked && points.length > 1 ? pointAlong(points, pathLength(points) - BLOCK_INSET) : null

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
      {points.length > 1 && <polyline className={`hop k-${step.kind}`} points={points.map((p) => p.join(',')).join(' ')} />}

      {/* 機器のイラスト */}
      {order.map((id) => {
        const node = nodes[id]!
        return (
          <g key={id} className={isDim(id) ? 'node dim' : 'node'}>
            {id === targetId && <ellipse cx={node.x} cy={node.y - 3} rx={20} ry={9} className={`ring k-${step.kind}`} />}
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
              <g transform={`translate(${node.x - 13},${badgeY})`} className="badge-shield">
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
      {stopPoint && arrived && (
        <path
          className="blocked-mark"
          d={`M${stopPoint[0] - 6},${stopPoint[1] - 20} l12,12 M${stopPoint[0] + 6},${stopPoint[1] - 20} l-12,12`}
        />
      )}
    </svg>
  )
}
