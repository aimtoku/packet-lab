import { describe, expect, it } from 'vitest'
import { scenarios } from '../scenarios'
import { countChars, LEARNING } from './index'

describe('学習の手引きと確認問題', () => {
  it('すべてのシナリオにある', () => {
    for (const s of scenarios) expect(LEARNING[s.id], s.id).toBeDefined()
  })

  for (const s of scenarios) {
    const learning = LEARNING[s.id]
    if (!learning) continue
    describe(s.name, () => {
      const { guide, quiz } = learning

      it('手引きの各項目がそろっている', () => {
        expect(guide.goals.length).toBeGreaterThanOrEqual(3)
        expect(guide.prerequisites.length).toBeGreaterThan(0)
        expect(guide.misconceptions.length).toBeGreaterThanOrEqual(2)
        expect(guide.comparison.rows.length).toBeGreaterThanOrEqual(3)
        expect(guide.cues.length).toBeGreaterThanOrEqual(2)
        for (const r of guide.comparison.rows) {
          for (const v of [r.measure, r.stops, r.limits, r.where]) expect(v.trim(), r.measure).not.toBe('')
        }
      })

      it('4択の問題は、選択肢が重ならず、正解がある', () => {
        expect(quiz.choices.length).toBeGreaterThanOrEqual(4)
        for (const q of quiz.choices) {
          expect(new Set(q.choices).size, q.question).toBe(4)
          expect(q.choices[q.answer], q.question).toBeDefined()
          expect(q.explanation.trim(), q.question).not.toBe('')
        }
      })

      it('記述の問題は、解答例が字数の上限に収まっている', () => {
        expect(quiz.written.length).toBeGreaterThanOrEqual(2)
        for (const q of quiz.written) {
          expect(countChars(q.answer), q.question).toBeLessThanOrEqual(q.limit)
          expect(q.question, '設問に字数の上限を書く').toContain(`${q.limit}字以内`)
          expect(q.keys.length, q.question).toBeGreaterThan(0)
        }
      })
    })
  }

  it('4択の正解が、どれか1つの記号に偏っていない', () => {
    const counts = [0, 0, 0, 0]
    for (const l of Object.values(LEARNING)) for (const q of l.quiz.choices) counts[q.answer]! += 1
    const total = counts.reduce((a, b) => a + b, 0)
    for (const c of counts) expect(c / total).toBeLessThan(0.6)
  })
})
