import { describe, expect, it } from 'vitest'
import type { Mode } from '../types'
import { BASE_NODES } from '../topology/layout'
import { attackerNodes, findRoute, nodesFor } from '../topology/route'
import { scenarios } from './index'

const MODES: Mode[] = ['normal', 'attack', 'defense']

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

      it('すべてのステップで、ケーブルをたどる経路が見つかる', () => {
        const avoid = attackerNodes(scenario)
        for (const mode of MODES) {
          scenario.steps[mode].forEach((step, i) => {
            const from = scenario.topology.map[step.from]!
            const to = scenario.topology.map[step.to]!
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
