import { describe, expect, it } from 'vitest'
import { scenarios } from '../scenarios'
import type { Mode } from '../types'
import { PLAIN } from './index'

const MODES: Mode[] = ['normal', 'attack', 'defense', 'incident']

describe('「ひとことで」の説明', () => {
  for (const s of scenarios) {
    it(`${s.name}：すべてのステップにある`, () => {
      const plain = PLAIN[s.id]
      expect(plain, s.id).toBeDefined()
      for (const m of MODES) {
        expect(plain![m].length, `${s.id} ${m}`).toBe(s.steps[m].length)
        for (const t of plain![m]) {
          expect(t.trim()).not.toBe('')
          expect(t.endsWith('。'), t).toBe(true)
        }
      }
    })
  }
})
