import { describe, expect, it } from 'vitest'
import { scenarios } from '../scenarios'
import { occurrencesOf, scenarioTerms, scenariosMentioning, splitTerms, termIdsIn } from './match'
import { TERMS } from './terms'

describe('用語集', () => {
  it('IDが重ならない', () => {
    const ids = TERMS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('同じ別名が、2つの用語に登録されていない', () => {
    const aliases = TERMS.flatMap((t) => t.aliases)
    const duplicated = aliases.filter((a, i) => aliases.indexOf(a) !== i)
    expect(duplicated).toEqual([])
  })

  it('説明が空でない', () => {
    for (const term of TERMS) expect(term.description.trim(), term.id).not.toBe('')
  })

  it('どの用語も、いずれかのシナリオに出てくる（押したときの移動先がある）', () => {
    const orphans = TERMS.filter((t) => scenariosMentioning(t.id).length === 0).map((t) => t.id)
    expect(orphans).toEqual([])
  })

  it('どのシナリオにも、用語が5つ以上ある', () => {
    for (const s of scenarios) expect(scenarioTerms(s.id).length, s.id).toBeGreaterThanOrEqual(5)
  })

  it('ステップに出てくる用語は、そのステップに移動できる', () => {
    for (const term of TERMS) {
      for (const occ of occurrencesOf(term.id)) {
        const scenario = scenarios.find((s) => s.id === occ.scenarioId)
        expect(scenario?.steps[occ.mode][occ.index], `${term.id} ${occ.scenarioId}`).toBeDefined()
      }
    }
  })
})

describe('用語の検出', () => {
  it('分割したものをつなげると、元の文章に戻る', () => {
    for (const s of scenarios) {
      for (const mode of ['normal', 'attack', 'defense'] as const) {
        for (const step of s.steps[mode]) {
          const joined = splitTerms(step.note)
            .map((seg) => (typeof seg === 'string' ? seg : seg.text))
            .join('')
          expect(joined).toBe(step.note)
        }
      }
    }
  })

  it('長い別名を優先する', () => {
    expect(termIdsIn('CSRFトークンを確かめる')).toEqual(['csrf-token'])
    expect(termIdsIn('ARPスプーフィングとARP')).toEqual(['arp-spoofing', 'arp'])
    expect(termIdsIn('公開鍵基盤と公開鍵')).toEqual(['pki', 'public-key'])
    expect(termIdsIn('サーバ証明書と証明書')).toEqual(['server-certificate', 'certificate'])
    expect(termIdsIn('送信元ポートのランダム化と送信元ポート')).toEqual(['source-port-randomization', 'port-number'])
  })

  it('英数字の途中にある場合は一致させない', () => {
    expect(termIdsIn('SANS研究所')).toEqual([])
    expect(termIdsIn('サーバのSANを確認')).toEqual(['san'])
    expect(termIdsIn('DKIM-Signature ヘッダ')).toEqual(['dkim'])
  })
})
