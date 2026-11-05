import { describe, expect, it } from 'vitest'
import { countChars } from '../learning'
import { findScenario } from '../scenarios'
import { blockText, TOPICS, topicTerms } from './index'

describe('解説ページ', () => {
  it('IDが重ならない', () => {
    const ids = TOPICS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const topic of TOPICS) {
    describe(topic.name, () => {
      it('学習目標・本文・手がかりがそろっている', () => {
        expect(topic.goals.length).toBeGreaterThanOrEqual(3)
        expect(topic.sections.length).toBeGreaterThanOrEqual(3)
        expect(topic.cues.length).toBeGreaterThanOrEqual(2)
        for (const s of topic.sections) {
          expect(s.blocks.length, s.title).toBeGreaterThan(0)
          for (const b of s.blocks) for (const t of blockText(b)) expect(t.trim(), s.title).not.toBe('')
        }
      })

      it('節のIDは、ページ内リンクに使える形で、重ならない', () => {
        const ids = topic.sections.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
      })

      it('表の行は、見出しと同じ列の数', () => {
        for (const s of topic.sections) {
          for (const b of s.blocks) {
            if (b.kind !== 'table') continue
            for (const row of b.rows) expect(row.length, `${s.title}：${row[0]}`).toBe(b.head.length)
          }
        }
      })

      it('関連するシナリオが存在する', () => {
        expect(topic.related.length).toBeGreaterThan(0)
        for (const id of topic.related) expect(findScenario(id), id).toBeDefined()
      })

      it('用語が5つ以上出てくる', () => {
        expect(topicTerms(topic.id).length).toBeGreaterThanOrEqual(5)
      })

      it('確認問題：4択は選択肢が重ならず、記述は解答例が字数の上限に収まる', () => {
        expect(topic.quiz.choices.length).toBeGreaterThanOrEqual(4)
        for (const q of topic.quiz.choices) {
          expect(new Set(q.choices).size, q.question).toBe(4)
          expect(q.explanation.trim(), q.question).not.toBe('')
        }
        expect(topic.quiz.written.length).toBeGreaterThanOrEqual(2)
        for (const q of topic.quiz.written) {
          expect(countChars(q.answer), q.question).toBeLessThanOrEqual(q.limit)
          expect(q.question).toContain(`${q.limit}字以内`)
        }
      })

      it('参考資料のURLは https', () => {
        for (const s of topic.sources ?? []) expect(s.url, s.title).toMatch(/^https:\/\//)
      })
    })
  }

  it('4択の正解が、どれか1つの記号に偏っていない', () => {
    const counts = [0, 0, 0, 0]
    for (const t of TOPICS) for (const q of t.quiz.choices) counts[q.answer]! += 1
    const total = counts.reduce((a, b) => a + b, 0)
    for (const c of counts) expect(c / total).toBeLessThan(0.4)
  })
})
