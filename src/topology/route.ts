import type { NodeId, OptionalNodeId, Scenario } from '../types'
import { BASE_NODES, EDGES, type NodeSpec } from './layout'

export type NodeMap = Partial<Record<NodeId, NodeSpec>>

const isOptionalNode = (id: NodeId): id is OptionalNodeId => id === 'ext1' || id === 'ext2' || id === 'lan2'

/** シナリオで表示する機器を、名前の書き換えも含めて組み立てる */
export function nodesFor(scenario: Scenario): NodeMap {
  const { devices, labels, mobile, hidden } = scenario.topology
  const nodes: NodeMap = {}
  for (const id of Object.keys(BASE_NODES) as NodeId[]) {
    if (hidden?.includes(id)) continue
    const optional = isOptionalNode(id)
    if (optional && !devices?.[id]) continue
    if ((id === 'laptop' || id === 'ap' || id === 'fakeap') && !mobile) continue
    const node: NodeSpec = { ...BASE_NODES[id] }
    const device = optional ? devices?.[id] : undefined
    if (device) Object.assign(node, device)
    const label = labels?.[id]
    if (label) [node.name, node.sub] = label
    nodes[id] = node
  }
  return nodes
}

/** 攻撃者がいる機器 */
export function attackerNodes(scenario: Scenario): NodeId[] {
  return scenario.actors.flatMap((a) => {
    const node = scenario.topology.map[a.id]
    return a.attacker && node ? [node] : []
  })
}

/**
 * from から to までの経路を、ケーブルのつながりから幅優先探索で求める。
 * 攻撃者の機器は、そこが終点のとき以外は経由しない（正規の通信が攻撃者を通らないように）。
 * 経路が見つからなければ null を返す。
 */
export function findRoute(nodes: NodeMap, from: NodeId, to: NodeId, avoid: readonly NodeId[]): NodeId[] | null {
  if (from === to) return [from]
  const adjacent = new Map<NodeId, NodeId[]>()
  for (const [a, b] of EDGES) {
    if (!nodes[a] || !nodes[b]) continue
    adjacent.set(a, [...(adjacent.get(a) ?? []), b])
    adjacent.set(b, [...(adjacent.get(b) ?? []), a])
  }
  const previous = new Map<NodeId, NodeId | null>([[from, null]])
  const queue: NodeId[] = [from]
  while (queue.length > 0) {
    const current = queue.shift() as NodeId
    if (current === to) break
    for (const next of adjacent.get(current) ?? []) {
      if (previous.has(next)) continue
      if (avoid.includes(next) && next !== to) continue
      previous.set(next, current)
      queue.push(next)
    }
  }
  if (!previous.has(to)) return null
  const path: NodeId[] = []
  for (let node: NodeId | null = to; node !== null; node = previous.get(node) ?? null) path.unshift(node)
  return path
}

/** シナリオの1ステップが、構成図上のどの機器を通るか */
export function stepRoute(scenario: Scenario, nodes: NodeMap, from: string, to: string): NodeId[] {
  const a = scenario.topology.map[from]
  const b = scenario.topology.map[to]
  if (!a || !b) return []
  return findRoute(nodes, a, b, attackerNodes(scenario)) ?? [a, b]
}
