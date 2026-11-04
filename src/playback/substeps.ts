import type { NodeId, Scenario, Step } from '../types'
import type { NodeSpec } from '../topology/layout'
import { stepRoute, type NodeMap } from '../topology/route'

export type SubStepKind = 'send' | 'via' | 'receive' | 'blocked'

/** 1ステップの中の区切り。パケットが機器に着くたびに1つ */
export interface SubStep {
  kind: SubStepKind
  /** パケットがいる機器 */
  node: NodeId
  /** 経路の何番目の機器か */
  routeIndex: number
  text: string
}

/** 経由する機器の、既定の説明。スイッチは長くなるので、シナリオで書いたときだけ出す */
function defaultVia(node: NodeSpec, prev: NodeSpec | undefined): string | null {
  switch (node.type) {
    case 'fw':
      return `${node.name}：通信のルールと照らし合わせます。許可されている通信なので、通します。`
    case 'cloud':
      return 'インターネット：経路上のルータが、宛先IPアドレスを見て、次々に中継していきます。'
    case 'ap':
      return prev?.type === 'laptop'
        ? `${node.name}：無線LANで受け取った通信を、インターネットへ中継します。`
        : `${node.name}：インターネットから届いた通信を、無線LANで端末へ届けます。`
    default:
      return null
  }
}

/** 阻止されるステップで、経路の何番目の機器で止められるか。阻止されないステップは null */
export function stopIndex(route: readonly NodeId[], step: Step<string>): number | null {
  if (step.kind !== 'blocked') return null
  const at = step.blockedAt ? route.indexOf(step.blockedAt) : -1
  return at >= 0 ? at : route.length - 1
}

/** ステップを、送信 → 経由する機器 → 受信（または阻止） の区切りに分ける */
export function subStepsFor(scenario: Scenario, nodes: NodeMap, step: Step<string>): SubStep[] {
  const route = stepRoute(scenario, nodes, step.from, step.to)
  const actorName = (id: string) => scenario.actors.find((a) => a.id === id)?.name ?? id
  const last = route.length - 1
  if (last < 0) return []

  // 自分の中だけで行う処理（ハッシュ値の計算、受信箱への配送など）
  if (last === 0) {
    return [{ kind: 'receive', node: route[0]!, routeIndex: 0, text: step.receive ?? `${actorName(step.from)}：${step.title}` }]
  }

  const stop = stopIndex(route, step)
  const end = stop ?? last
  const subs: SubStep[] = [
    { kind: 'send', node: route[0]!, routeIndex: 0, text: step.send ?? `${actorName(step.from)}：「${step.label}」を送ります。` },
  ]
  for (let i = 1; i < end; i++) {
    const id = route[i]!
    const node = nodes[id]
    if (!node) continue
    const text = step.via?.[id] ?? defaultVia(node, nodes[route[i - 1]!])
    if (text) subs.push({ kind: 'via', node: id, routeIndex: i, text })
  }
  if (stop !== null) {
    const name = nodes[route[stop]!]?.name || actorName(step.to)
    subs.push({
      kind: 'blocked',
      node: route[stop]!,
      routeIndex: stop,
      text: step.receive ?? (stop === 0 ? `${name}：送信する前に止めます。` : `${name}：ここで止めます。`),
    })
  } else {
    subs.push({ kind: 'receive', node: route[last]!, routeIndex: last, text: step.receive ?? `${actorName(step.to)}：受け取ります。` })
  }
  return subs
}
