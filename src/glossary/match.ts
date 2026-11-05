import type { Mode, Scenario, Step } from '../types'
import { subStepsFor } from '../playback/substeps'
import { scenarios } from '../scenarios'
import { nodesFor, type NodeMap } from '../topology/route'
import { TERMS, type Term } from './terms'

export const MODES: readonly Mode[] = ['normal', 'attack', 'defense', 'incident']
export const MODE_LABEL: Record<Mode, string> = { normal: '正常', attack: '攻撃', defense: '対策', incident: '事後対応' }

export const TERM_BY_ID: ReadonlyMap<string, Term> = new Map(TERMS.map((t) => [t.id, t]))

const ALIAS_TO_TERM = new Map<string, string>()
for (const term of TERMS) for (const alias of term.aliases) ALIAS_TO_TERM.set(alias, term.id)

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * すべての別名をまとめた正規表現。長い別名を先に並べて、同じ位置なら長いほうを優先する。
 * 英数字だけの別名（SPF、AH など）は、英数字の途中にあるとき（例：SANS の中の SAN）には一致させない。
 */
const TERM_PATTERN = new RegExp(
  [...ALIAS_TO_TERM.keys()]
    .sort((a, b) => b.length - a.length)
    .map((alias) => (/^[A-Za-z0-9_]/.test(alias) ? `(?<![A-Za-z0-9_])${escapeRegExp(alias)}(?![A-Za-z0-9_])` : escapeRegExp(alias)))
    .join('|'),
  'g',
)

export type Segment = string | { termId: string; text: string }

/** 文章を、用語の部分とそれ以外に分ける */
export function splitTerms(text: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const match of text.matchAll(TERM_PATTERN)) {
    const termId = ALIAS_TO_TERM.get(match[0])
    if (!termId || match.index === undefined) continue
    if (match.index > last) segments.push(text.slice(last, match.index))
    segments.push({ termId, text: match[0] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push(text.slice(last))
  return segments
}

/** 文章に出てくる用語のID（出てくる順、重複なし） */
export function termIdsIn(text: string): string[] {
  const ids: string[] = []
  for (const seg of splitTerms(text)) if (typeof seg !== 'string' && !ids.includes(seg.termId)) ids.push(seg.termId)
  return ids
}

/** ステップで表示する文章すべて（区切りの説明、パケットの層、状態の変化を含む） */
export function stepText(scenario: Scenario, nodes: NodeMap, step: Step<string>): string {
  const w = step.wire
  return [
    step.label,
    step.title,
    ...step.fields.flat(),
    step.note,
    step.point ?? '',
    ...subStepsFor(scenario, nodes, step).map((s) => s.text),
    ...(w ? [w.app, w.transport ?? '', w.secure ?? '', w.tunnel?.name ?? '', w.tunnel?.transport ?? '', w.remark ?? ''] : []),
    ...(step.changes ?? []).flatMap((c) => [c.key, c.value]),
  ].join('\n')
}

export interface Occurrence {
  scenarioId: string
  mode: Mode
  index: number
}

interface ScenarioIndex {
  /** シナリオに出てくる用語（ステップ、要約、論点の順に、出てくる順） */
  terms: string[]
  /** 用語ごとの、登場するステップ */
  steps: Map<string, Occurrence[]>
  /** ステップごとの用語 */
  byStep: Map<string, string[]>
}

const stepKey = (mode: Mode, index: number) => `${mode}/${index}`

function buildIndex(scenario: Scenario): ScenarioIndex {
  const terms: string[] = []
  const steps = new Map<string, Occurrence[]>()
  const byStep = new Map<string, string[]>()
  const add = (id: string) => {
    if (!terms.includes(id)) terms.push(id)
  }
  const nodes = nodesFor(scenario)
  for (const mode of MODES) {
    scenario.steps[mode].forEach((step, index) => {
      const ids = termIdsIn(stepText(scenario, nodes, step))
      byStep.set(stepKey(mode, index), ids)
      for (const id of ids) {
        add(id)
        steps.set(id, [...(steps.get(id) ?? []), { scenarioId: scenario.id, mode, index }])
      }
    })
  }
  for (const mode of MODES) termIdsIn(scenario.summary[mode]).forEach(add)
  for (const point of [...scenario.points, ...scenario.incidentPoints]) termIdsIn(point).forEach(add)
  for (const table of scenario.states ?? []) termIdsIn(table.title).forEach(add)
  return { terms, steps, byStep }
}

const INDEX = new Map(scenarios.map((s) => [s.id, buildIndex(s)]))

/** シナリオに出てくる用語 */
export function scenarioTerms(scenarioId: string): readonly string[] {
  return INDEX.get(scenarioId)?.terms ?? []
}

/** そのステップに出てくる用語 */
export function stepTerms(scenarioId: string, mode: Mode, index: number): readonly string[] {
  return INDEX.get(scenarioId)?.byStep.get(stepKey(mode, index)) ?? []
}

/** 用語が登場するステップ（シナリオを指定しなければ、全シナリオ） */
export function occurrencesOf(termId: string, scenarioId?: string): Occurrence[] {
  const targets = scenarioId ? [scenarioId] : scenarios.map((s) => s.id)
  return targets.flatMap((id) => INDEX.get(id)?.steps.get(termId) ?? [])
}

/** 用語が出てくるシナリオ（ステップに出てこず、論点だけに出てくる場合も含む） */
export function scenariosMentioning(termId: string): string[] {
  return scenarios.filter((s) => INDEX.get(s.id)?.terms.includes(termId)).map((s) => s.id)
}
