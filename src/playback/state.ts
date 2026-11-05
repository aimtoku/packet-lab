import type { Mode, Scenario, StateChange, Tone } from '../types'
import type { SubStep } from './substeps'

export interface StateRow {
  key: string
  value: string
  tone?: Tone
  /** 今のステップで変わった行 */
  changedNow: boolean
}

export interface StateView {
  id: string
  title: string
  columns: readonly [string, string]
  rows: StateRow[]
}

/** 変化が、ステップの何番目の区切りで起きるか（at の機器に着いたとき。なければ最後の区切り） */
export function changeSubIndex(change: StateChange, subs: readonly SubStep[]): number {
  const at = change.at ? subs.findIndex((s) => s.node === change.at) : -1
  return at >= 0 ? at : subs.length - 1
}

/**
 * あるステップの時点での、機器の中の状態。
 * そのモードの最初の状態に、それまでのステップの変化を順に当てはめる。
 * 今のステップの変化は、パケットがその区切りまで着いたもの（reached 番目の区切りまで）だけ当てはめる。
 */
export function stateAt(
  scenario: Scenario,
  mode: Mode,
  index: number,
  subs: readonly SubStep[],
  reached: number,
): StateView[] {
  const tables = (scenario.states ?? []).filter((t) => !t.modes || t.modes.includes(mode))
  const views: StateView[] = tables.map((t) => ({
    id: t.id,
    title: t.title,
    columns: t.columns,
    rows: (t.initial?.[mode] ?? []).map(([key, value, tone]) => ({ key, value, tone, changedNow: false })),
  }))
  const steps = scenario.steps[mode]
  for (let i = 0; i <= index && i < steps.length; i++) {
    for (const change of steps[i]?.changes ?? []) {
      if (i === index && changeSubIndex(change, subs) > reached) continue
      const view = views.find((v) => v.id === change.table)
      if (!view) continue
      const row = { key: change.key, value: change.value, tone: change.tone, changedNow: i === index }
      const at = view.rows.findIndex((r) => r.key === change.key)
      if (at >= 0) view.rows[at] = row
      else view.rows.push(row)
    }
  }
  return views
}
