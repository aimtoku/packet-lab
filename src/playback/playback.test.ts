import { describe, expect, it } from 'vitest'
import { findScenario } from '../scenarios'
import { nodesFor } from '../topology/route'
import { dwellFor, SPEEDS } from './speed'
import { stateAt } from './state'
import { subStepsFor } from './substeps'

const scenario = (id: string) => {
  const s = findScenario(id)
  if (!s) throw new Error(id)
  return s
}

describe('ステップの区切り', () => {
  it('経由する機器のうち、説明のある機器で止まる（スイッチは説明があるときだけ）', () => {
    const dns = scenario('dns')
    const subs = subStepsFor(dns, nodesFor(dns), dns.steps.normal[1]!)
    expect(subs.map((s) => [s.kind, s.node])).toEqual([
      ['send', 'cache'],
      ['via', 'fw'],
      ['via', 'inet'],
      ['receive', 'ext1'],
    ])
  })

  it('送信元で止められるステップは、送信元で終わる', () => {
    const xss = scenario('xss')
    const subs = subStepsFor(xss, nodesFor(xss), xss.steps.defense[3]!)
    expect(subs.map((s) => [s.kind, s.node])).toEqual([
      ['send', 'ext1'],
      ['blocked', 'ext1'],
    ])
  })

  it('自分の中だけの処理は、区切りが1つ', () => {
    const sig = scenario('sig')
    const subs = subStepsFor(sig, nodesFor(sig), sig.steps.normal[0]!)
    expect(subs).toHaveLength(1)
    expect(subs[0]!.kind).toBe('receive')
  })
})

describe('機器の中の状態', () => {
  const dns = scenario('dns')
  const nodes = nodesFor(dns)
  const rows = (views: ReturnType<typeof stateAt>, id: string) => views.find((v) => v.id === id)?.rows ?? []

  it('パケットが着く前は、前のステップまでの変化だけが当てはまる', () => {
    const subs = subStepsFor(dns, nodes, dns.steps.attack[2]!)
    const views = stateAt(dns, 'attack', 2, subs, -1)
    expect(rows(views, 'pending').find((r) => r.key === '状態')?.value).toBe('応答待ち')
    expect(rows(views, 'cache')).toEqual([])
  })

  it('宛先に着くと、そのステップの変化が当てはまり、変わった行に印が付く', () => {
    const subs = subStepsFor(dns, nodes, dns.steps.attack[2]!)
    const views = stateAt(dns, 'attack', 2, subs, subs.length - 1)
    const status = rows(views, 'pending').find((r) => r.key === '状態')
    expect(status?.value).toContain('偽応答を受理')
    expect(status?.changedNow).toBe(true)
    expect(rows(views, 'cache')[0]?.tone).toBe('attack')
  })

  it('at を指定した変化は、その機器に着いた時点で当てはまる', () => {
    const subs = subStepsFor(dns, nodes, dns.steps.normal[1]!)
    expect(rows(stateAt(dns, 'normal', 1, subs, -1), 'pending')).toEqual([])
    expect(rows(stateAt(dns, 'normal', 1, subs, 0), 'pending').map((r) => r.key)).toEqual(['ID', '待ち受けポート', '質問', '状態'])
  })

  it('モードを指定した表は、そのモードでだけ表示する', () => {
    const arp = scenario('arp')
    const ids = (mode: 'normal' | 'defense') => stateAt(arp, mode, 0, [], -1).map((v) => v.id)
    expect(ids('normal')).not.toContain('sw-bind')
    expect(ids('defense')).toContain('sw-bind')
  })
})

describe('再生の速さ', () => {
  it('説明が長いほど、次へ進むまで長く待つ', () => {
    expect(dwellFor('slow', 'あ'.repeat(80))).toBeGreaterThan(dwellFor('slow', 'あ'.repeat(10)))
  })

  it('短い説明でも、最低限の時間は待つ', () => {
    expect(dwellFor('fast', '')).toBe(SPEEDS.fast.minDwell)
  })
})
