import { describe, expect, it } from 'vitest'
import { findScenario, scenarios } from '../scenarios'
import { modesOf } from '../types'
import { CHAPTERS, PARTS } from './index'
import type { Figure } from './types'

function check(fig: Figure, where: string) {
  if (fig.kind === 'seq') {
    const ids = new Set(fig.actors.map((a) => a.id))
    expect(ids.size, `${where}：登場人物のIDが重複`).toBe(fig.actors.length)
    expect(fig.messages.length, where).toBeGreaterThan(0)
    for (const m of fig.messages) {
      expect(ids.has(m.from), `${where}：${m.from}`).toBe(true)
      expect(ids.has(m.to), `${where}：${m.to}`).toBe(true)
    }
  } else if (fig.kind === 'map') {
    const ids = new Set(fig.nodes.map((n) => n.id))
    expect(ids.size, `${where}：機器のIDが重複`).toBe(fig.nodes.length)
    const cells = new Set(fig.nodes.map((n) => `${n.x},${n.y}`))
    expect(cells.size, `${where}：同じ位置に機器が重なっている`).toBe(fig.nodes.length)
    for (const n of fig.nodes) {
      expect(n.x >= 0 && n.x < fig.cols && n.y >= 0 && n.y < fig.rows, `${where}：${n.id} が図の外`).toBe(true)
    }
    for (const l of fig.links) {
      expect(ids.has(l.from), `${where}：${l.from}`).toBe(true)
      expect(ids.has(l.to), `${where}：${l.to}`).toBe(true)
    }
  } else {
    expect(fig.rows.length, where).toBeGreaterThan(0)
    for (const r of fig.rows) expect(r.cells.length, where).toBeGreaterThan(0)
  }
}

describe('教科書', () => {
  it('すべてのシナリオに章がある（章のIDはシナリオのID）', () => {
    expect(
      CHAPTERS.filter((c) => findScenario(c.id))
        .map((c) => c.id)
        .sort(),
    ).toEqual(scenarios.map((s) => s.id).sort())
  })

  it('シナリオを持たない章は、「次の学習」のリンクを持ち、図解へのリンクを持たない', () => {
    for (const c of CHAPTERS.filter((c) => !findScenario(c.id))) {
      expect(c.links?.length, c.id).toBeGreaterThan(0)
      expect(
        c.sections.some((s) => s.see),
        c.id,
      ).toBe(false)
    }
  })

  it('どの部にも章がある', () => {
    for (const part of PARTS)
      expect(
        CHAPTERS.some((c) => c.part === part.id),
        part.id,
      ).toBe(true)
  })

  for (const c of CHAPTERS) {
    describe(c.title, () => {
      it('節が4つ以上あり、IDが重ならない', () => {
        expect(c.sections.length).toBeGreaterThanOrEqual(4)
        const ids = c.sections.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
      })

      it('図が節の数の半分以上あり、図の部品の参照が正しい', () => {
        const figs = c.sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'figure' ? [b] : [])))
        expect(figs.length).toBeGreaterThanOrEqual(Math.ceil(c.sections.length / 2))
        c.sections.forEach((s) =>
          s.blocks.forEach((b, i) => {
            if (b.kind === 'figure') {
              expect(b.caption.trim()).not.toBe('')
              check(b.figure, `${c.id}/${s.id}/${i}`)
            }
          }),
        )
      })

      it('節の最初の図以外は、積み重ねた要素（add）を含む', () => {
        // 章の2つ目以降の節の図には、その節で加わったものを示す
        c.sections.slice(1).forEach((s) => {
          const figs = s.blocks.flatMap((b) => (b.kind === 'figure' ? [b.figure] : []))
          for (const f of figs) {
            const added =
              f.kind === 'seq'
                ? f.actors.some((a) => a.add) || f.messages.some((m) => m.add)
                : f.kind === 'map'
                  ? f.nodes.some((n) => n.add) || f.links.some((l) => l.add) || !!f.zones?.some((z) => z.add)
                  : f.rows.some((r) => r.cells.some((x) => x.add))
            expect(added, `${c.id}/${s.id}`).toBe(true)
          }
        })
      })

      it('「図解で確かめる」のリンク先が実在する', () => {
        const scenario = findScenario(c.id)
        if (!scenario) return
        for (const s of c.sections) {
          if (!s.see) continue
          expect(modesOf(scenario), `${c.id}/${s.id}`).toContain(s.see.mode)
          expect(s.see.step, `${c.id}/${s.id}`).toBeGreaterThanOrEqual(1)
          expect(s.see.step, `${c.id}/${s.id}`).toBeLessThanOrEqual(scenario.steps[s.see.mode].length)
        }
      })
    })
  }
})
