import { useEffect, useMemo, useRef, useState } from 'react'
import type { Mode, Scenario } from '../types'
import { findScenario, scenarios } from '../scenarios'
import {
  MODE_LABEL,
  occurrencesOf,
  scenarioTerms,
  scenariosMentioning,
  stepTerms,
  TERM_BY_ID,
  type Occurrence,
} from '../glossary/match'
import { TERMS } from '../glossary/terms'

interface Props {
  idPrefix: string
  scenario: Scenario
  mode: Mode
  index: number
  selectedTerm: string | null
  /** 用語名を押したとき */
  onSelect: (termId: string) => void
  /** 登場箇所を押したとき */
  onJump: (termId: string, occurrence: Occurrence) => void
  /** 論点にだけ出てくる用語の登場箇所を押したとき */
  onShowPoints: (termId: string) => void
}

const MAX_CHIPS = 8

export function Glossary({ idPrefix, scenario, mode, index, selectedTerm, onSelect, onJump, onShowPoints }: Props) {
  const [query, setQuery] = useState('')
  const [othersOpen, setOthersOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const current = scenarioTerms(scenario.id)
  const inStep = new Set(stepTerms(scenario.id, mode, index))

  const others = useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const term of TERMS) {
      if (current.includes(term.id)) continue
      const home = scenariosMentioning(term.id)[0]
      if (!home) continue
      groups.set(home, [...(groups.get(home) ?? []), term.id])
    }
    return scenarios.filter((s) => groups.has(s.id)).map((s) => ({ scenario: s, terms: groups.get(s.id) ?? [] }))
  }, [current])

  const q = query.trim().toLowerCase()
  const results = q
    ? TERMS.filter((t) =>
        [t.name, t.description, ...t.aliases].some((text) => text.toLowerCase().includes(q)),
      ).map((t) => t.id)
    : []

  // ほかのシナリオの用語を選んだときは、その一覧を開く
  useEffect(() => {
    if (selectedTerm && !current.includes(selectedTerm)) setOthersOpen(true)
  }, [selectedTerm, current])

  // 選んだ用語が一覧の外にあるときは、見える位置までスクロールする
  useEffect(() => {
    if (!selectedTerm) return
    const el = listRef.current?.querySelector(`[data-term="${CSS.escape(selectedTerm)}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedTerm, othersOpen])

  const item = (termId: string) => {
    const term = TERM_BY_ID.get(termId)
    if (!term) return null
    const selected = termId === selectedTerm
    const here = occurrencesOf(termId, scenario.id)
    const elsewhere = occurrencesOf(termId).filter((o) => o.scenarioId !== scenario.id)
    const onlyInPoints = here.length === 0 && current.includes(termId)
    const bodyId = `${idPrefix}-${termId}`
    return (
      <li key={termId} data-term={termId} className={`term-item${selected ? ' selected' : ''}${inStep.has(termId) ? ' in-step' : ''}`}>
        <button type="button" className="term-button" aria-expanded={selected} aria-controls={bodyId} onClick={() => onSelect(termId)}>
          <span className="term-name">{term.name}</span>
          {inStep.has(termId) && <span className="in-step-badge">このステップ</span>}
        </button>
        {selected && (
          <div className="term-body" id={bodyId}>
            <p>{term.description}</p>
            {(here.length > 0 || onlyInPoints) && (
              <div className="chips" aria-label="このシナリオでの登場箇所">
                {here.slice(0, MAX_CHIPS).map((o) => (
                  <button
                    key={`${o.mode}${o.index}`}
                    type="button"
                    className={`chip k-${o.mode}${o.mode === mode && o.index === index ? ' current' : ''}`}
                    onClick={() => onJump(termId, o)}
                  >
                    {MODE_LABEL[o.mode]} {o.index + 1}
                  </button>
                ))}
                {onlyInPoints && (
                  <button type="button" className="chip" onClick={() => onShowPoints(termId)}>
                    午後の論点
                  </button>
                )}
              </div>
            )}
            {elsewhere.length > 0 && (
              <div className="chips" aria-label="ほかのシナリオでの登場箇所">
                {elsewhere.slice(0, MAX_CHIPS).map((o) => (
                  <button key={`${o.scenarioId}${o.mode}${o.index}`} type="button" className="chip other" onClick={() => onJump(termId, o)}>
                    {findScenario(o.scenarioId)?.name}：{MODE_LABEL[o.mode]} {o.index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="glossary">
      <div className="glossary-head">
        <h2>用語</h2>
        <input
          id={`${idPrefix}-search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語を探す"
          aria-label="用語を探す"
          autoComplete="off"
        />
      </div>
      <div className="glossary-list" ref={listRef}>
        {q ? (
          <section>
            <h3>検索結果（{results.length}）</h3>
            {results.length > 0 ? <ul>{results.map(item)}</ul> : <p className="empty">見つかりませんでした。</p>}
          </section>
        ) : (
          <>
            <section>
              <h3>このシナリオ（{current.length}）</h3>
              <ul>{current.map(item)}</ul>
            </section>
            <details className="other-terms" open={othersOpen} onToggle={(e) => setOthersOpen(e.currentTarget.open)}>
              <summary>ほかのシナリオの用語（{others.reduce((n, g) => n + g.terms.length, 0)}）</summary>
              {others.map((g) => (
                <section key={g.scenario.id}>
                  <h4>{g.scenario.name}</h4>
                  <ul>{g.terms.map(item)}</ul>
                </section>
              ))}
            </details>
          </>
        )}
      </div>
    </div>
  )
}
