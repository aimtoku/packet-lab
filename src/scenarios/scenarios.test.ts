import { describe, expect, it } from 'vitest'
import { PHASES, type Mode } from '../types'
import { sequenceActors } from '../components/Sequence'
import { changeSubIndex } from '../playback/state'
import { stopIndex, subStepsFor } from '../playback/substeps'
import { BASE_NODES } from '../topology/layout'
import { attackerNodes, findRoute, nodesFor, stepRoute } from '../topology/route'
import { scenarios } from './index'

const MODES: Mode[] = ['normal', 'attack', 'defense', 'incident']

describe('シナリオのデータ', () => {
  it('IDが重ならない', () => {
    const ids = scenarios.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const scenario of scenarios) {
    describe(scenario.name, () => {
      const nodes = nodesFor(scenario)

      it('どのモードにもステップがある', () => {
        for (const mode of MODES) expect(scenario.steps[mode].length).toBeGreaterThan(0)
      })

      it('攻撃者が1人以上いる', () => {
        expect(scenario.actors.some((a) => a.attacker)).toBe(true)
      })

      it('登場人物は、表示される機器に置かれている', () => {
        for (const actor of scenario.actors) {
          const node = scenario.topology.map[actor.id]
          expect(node, actor.id).toBeDefined()
          expect(nodes[node!], `${actor.id} → ${node}`).toBeDefined()
        }
      })

      it('違う登場人物が同じ機器に重ならない', () => {
        const placed = scenario.actors.map((a) => scenario.topology.map[a.id])
        expect(new Set(placed).size).toBe(placed.length)
      })

      it('対策の盾は、表示される機器に付いている', () => {
        for (const id of scenario.topology.shields) expect(nodes[id], id).toBeDefined()
      })

      it('すべてのステップで、ケーブルをたどる経路が見つかる（CSIRTとの連絡や指示は除く）', () => {
        const avoid = attackerNodes(scenario)
        for (const mode of MODES) {
          scenario.steps[mode].forEach((step, i) => {
            const from = scenario.topology.map[step.from]!
            const to = scenario.topology.map[step.to]!
            if (from === 'soc' || to === 'soc') return
            expect(findRoute(nodes, from, to, avoid), `${mode} #${i + 1} ${step.label}`).not.toBeNull()
          })
        }
      })

      it('正規の通信は、攻撃者の機器を経由しない', () => {
        const avoid = attackerNodes(scenario)
        for (const mode of MODES) {
          for (const step of scenario.steps[mode]) {
            const route = findRoute(nodes, scenario.topology.map[step.from]!, scenario.topology.map[step.to]!, avoid) ?? []
            const middle = route.slice(1, -1)
            expect(middle.filter((n) => avoid.includes(n)), step.label).toEqual([])
          }
        }
      })

      it('パケットの項目と解説が空でない', () => {
        for (const mode of MODES) {
          for (const step of scenario.steps[mode]) {
            expect(step.fields.length, step.title).toBeGreaterThan(0)
            expect(step.note.trim(), step.title).not.toBe('')
          }
        }
      })

      it('機器から機器へ送るステップには、パケットの層と、宛先で起きることの説明がある', () => {
        for (const mode of MODES) {
          for (const step of scenario.steps[mode]) {
            if (step.from === step.to) {
              expect(step.receive, `${mode} ${step.title}`).toBeDefined()
              continue
            }
            // 事後対応の連絡や指示は、パケットではないので層の表示はなくてよい
            if (step.kind !== 'response') expect(step.wire, `${mode} ${step.title}`).toBeDefined()
            expect(step.send, `${mode} ${step.title}`).toBeDefined()
            expect(step.receive, `${mode} ${step.title}`).toBeDefined()
          }
        }
      })

      it('経由する機器の説明は、実際にパケットが経由する機器に書かれている', () => {
        for (const mode of MODES) {
          for (const step of scenario.steps[mode]) {
            const route = stepRoute(scenario, nodes, step.from, step.to)
            const end = stopIndex(route, step) ?? route.length - 1
            const middle = route.slice(1, end)
            for (const id of Object.keys(step.via ?? {})) expect(middle, `${mode} ${step.title}：${id}`).toContain(id)
          }
        }
      })

      it('阻止する機器は、阻止するステップの経路の上にある', () => {
        for (const mode of MODES) {
          for (const step of scenario.steps[mode]) {
            if (!step.blockedAt) continue
            expect(step.kind, step.title).toBe('blocked')
            expect(stepRoute(scenario, nodes, step.from, step.to), step.title).toContain(step.blockedAt)
          }
        }
      })

      it('区切りは「送信 → 経由 → 受信（または阻止）」の順に並ぶ', () => {
        for (const mode of MODES) {
          for (const step of scenario.steps[mode]) {
            const subs = subStepsFor(scenario, nodes, step)
            expect(subs.length, step.title).toBeGreaterThan(0)
            const last = subs[subs.length - 1]!
            expect(last.kind, step.title).toBe(step.kind === 'blocked' ? 'blocked' : 'receive')
            if (step.from !== step.to) expect(subs[0]!.kind, step.title).toBe('send')
            // 経路の上を、後戻りせずに進む
            subs.forEach((s, i) => i > 0 && expect(s.routeIndex, step.title).toBeGreaterThanOrEqual(subs[i - 1]!.routeIndex))
          }
        }
      })

      it('状態の変化は、そのモードで表示する表に書き込み、指定した機器で起きる', () => {
        for (const mode of MODES) {
          const tables = (scenario.states ?? []).filter((t) => !t.modes || t.modes.includes(mode)).map((t) => t.id)
          for (const step of scenario.steps[mode]) {
            const subs = subStepsFor(scenario, nodes, step)
            for (const change of step.changes ?? []) {
              expect(tables, `${mode} ${step.title}：${change.table}`).toContain(change.table)
              if (change.at) {
                const at = changeSubIndex(change, subs)
                expect(subs[at]?.node, `${mode} ${step.title}：${change.key} の at`).toBe(change.at)
              }
            }
          }
        }
      })

      it('事後対応は、CSIRTが検知から再発防止まで、段階の順に対応する', () => {
        const steps = scenario.steps.incident
        expect(steps.some((s) => s.from === 'csirt' || s.to === 'csirt')).toBe(true)
        for (const step of steps) {
          expect(step.kind, step.title).toBe('response')
          expect(step.phase, step.title).toBeDefined()
        }
        const order = steps.map((s) => PHASES.indexOf(s.phase!))
        expect(order, '段階が後戻りしない').toEqual([...order].sort((a, b) => a - b))
        expect(steps[0]?.phase).toBe('detect')
        expect(steps[steps.length - 1]?.phase).toBe('improve')
        expect(scenario.incidentPoints.length).toBeGreaterThan(0)
      })

      it('事後対応以外のモードには、段階を書かない', () => {
        for (const mode of ['normal', 'attack', 'defense'] as const) {
          for (const step of scenario.steps[mode]) expect(step.phase, step.title).toBeUndefined()
        }
      })

      it('特定のモードだけに登場する人は、ほかのモードのステップに出てこない', () => {
        for (const actor of scenario.actors) {
          if (!actor.onlyIn) continue
          for (const mode of MODES) {
            if (actor.onlyIn.includes(mode)) continue
            for (const step of scenario.steps[mode]) {
              expect([step.from, step.to], `${actor.id} が ${mode} に出てくる`).not.toContain(actor.id)
            }
          }
        }
      })

      it('シーケンス図の列は4つまでで、ステップに出てくる人がすべて並ぶ', () => {
        for (const mode of MODES) {
          const columns = sequenceActors(scenario, mode).map((a) => a.id)
          expect(columns.length, mode).toBeLessThanOrEqual(4)
          for (const step of scenario.steps[mode]) {
            expect(columns, `${mode} ${step.title}`).toContain(step.from)
            expect(columns, `${mode} ${step.title}`).toContain(step.to)
          }
        }
      })

      it('状態の表の最初の行は、表示するモードにだけ書かれている', () => {
        for (const table of scenario.states ?? []) {
          for (const mode of Object.keys(table.initial ?? {}) as Mode[]) {
            expect(!table.modes || table.modes.includes(mode), `${table.id} ${mode}`).toBe(true)
          }
        }
      })
    })
  }
})

describe('構成図の配置', () => {
  it('機器が描画範囲に収まっている', () => {
    for (const [id, node] of Object.entries(BASE_NODES)) {
      expect(node.x, id).toBeGreaterThan(0)
      expect(node.x, id).toBeLessThan(360)
      expect(node.y, id).toBeGreaterThan(0)
      expect(node.y, id).toBeLessThan(362)
    }
  })
})
