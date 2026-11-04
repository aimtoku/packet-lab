import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Mode, Scenario } from '../types'
import { MODES, occurrencesOf, scenarioTerms, TERM_BY_ID, type Occurrence } from '../glossary/match'
import { Link, navigate } from '../router'
import { scenarios } from '../scenarios'
import { Glossary } from './Glossary'
import { Sequence } from './Sequence'
import { StepDetail } from './StepDetail'
import { TermText } from './TermText'
import { Topology } from './Topology'

const MODE_BUTTONS: readonly { id: Mode; label: string }[] = [
  { id: 'normal', label: '正常' },
  { id: 'attack', label: '攻撃' },
  { id: 'defense', label: '対策' },
]

const NEXT_MODE: Record<Mode, Mode> = { normal: 'attack', attack: 'defense', defense: 'normal' }

/** 用語一覧が左に常に表示される幅（styles.css と合わせる） */
const SIDEBAR_QUERY = '(min-width: 1200px)'

interface ViewState {
  mode: Mode
  index: number
  term: string | null
}

/** URLの ?mode=attack&step=3&term=dnssec から、表示する状態を読む */
function readState(scenario: Scenario): ViewState {
  const params = new URLSearchParams(window.location.search)
  const mode = MODES.find((m) => m === params.get('mode')) ?? 'normal'
  const step = Number(params.get('step') ?? '1')
  const index = Number.isInteger(step) && step >= 1 && step <= scenario.steps[mode].length ? step - 1 : 0
  const term = params.get('term')
  return { mode, index, term: term && TERM_BY_ID.has(term) ? term : null }
}

function stateToSearch({ mode, index, term }: ViewState): string {
  const params = new URLSearchParams()
  if (mode !== 'normal' || index !== 0) {
    params.set('mode', mode)
    params.set('step', String(index + 1))
  }
  if (term) params.set('term', term)
  const s = params.toString()
  return s ? `?${s}` : ''
}

export function ScenarioView({ scenario }: { scenario: Scenario }) {
  const [state, setState] = useState<ViewState>(() => readState(scenario))
  const { mode, index, term } = state
  const drawerRef = useRef<HTMLDialogElement>(null)
  const pointsRef = useRef<HTMLElement>(null)

  // 共有できるように、表示している状態をURLに反映する（履歴は増やさない）
  useEffect(() => {
    const url = `${window.location.pathname}${stateToSearch(state)}`
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, '', url)
  }, [state])

  const go = useCallback((next: Partial<ViewState>) => setState((s) => ({ ...s, ...next })), [])
  const changeMode = (next: Mode) => go({ mode: next, index: 0 })
  const prev = useCallback(() => setState((s) => ({ ...s, index: Math.max(0, s.index - 1) })), [])
  const next = useCallback(() => {
    setState((s) =>
      s.index < scenario.steps[s.mode].length - 1 ? { ...s, index: s.index + 1 } : { ...s, mode: NEXT_MODE[s.mode], index: 0 },
    )
  }, [scenario])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, dialog')) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const isSidebar = () => window.matchMedia(SIDEBAR_QUERY).matches
  const closeDrawer = () => drawerRef.current?.close()
  const openDrawer = () => drawerRef.current?.showModal()

  const showPoints = (termId: string) => {
    go({ term: termId })
    closeDrawer()
    pointsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** 登場箇所へ移動する。ほかのシナリオなら、そのページを開く */
  const jump = (termId: string, o: Occurrence) => {
    if (o.scenarioId !== scenario.id) {
      navigate(`/${o.scenarioId}${stateToSearch({ mode: o.mode, index: o.index, term: termId })}`)
      return
    }
    go({ mode: o.mode, index: o.index, term: termId })
    if (!isSidebar()) closeDrawer()
  }

  /**
   * 一覧の用語名を押したとき：このシナリオの登場箇所へ移動する。
   * 同じ用語をもう一度押すと、次の登場箇所へ進む。
   */
  const selectFromGlossary = (termId: string) => {
    const here = occurrencesOf(termId, scenario.id)
    if (here.length === 0) {
      go({ term: term === termId ? null : termId })
      return
    }
    const order = (o: Occurrence) => MODES.indexOf(o.mode) * 1000 + o.index
    const position = MODES.indexOf(mode) * 1000 + index
    const target =
      term === termId
        ? (here.find((o) => order(o) > position) ?? here[0]!)
        : (here.find((o) => o.mode === mode) ?? here[0]!)
    jump(termId, target)
  }

  /** 説明文の中の用語を押したとき：一覧でその用語の意味を開く */
  const selectFromText = (termId: string) => {
    go({ term: termId })
    if (!isSidebar()) openDrawer()
  }

  const marked = useMemo(
    () => new Set(term ? occurrencesOf(term, scenario.id).filter((o) => o.mode === mode).map((o) => o.index) : []),
    [term, scenario.id, mode],
  )
  const termCount = scenarioTerms(scenario.id).length

  const glossaryProps = {
    scenario,
    mode,
    index,
    selectedTerm: term,
    onSelect: selectFromGlossary,
    onJump: jump,
    onShowPoints: showPoints,
  }

  return (
    <div className="scenario">
      <nav className="scenario-tabs" aria-label="シナリオ">
        {scenarios.map((s) => (
          <Link key={s.id} to={`/${s.id}`} className="scenario-tab" aria-current={s.id === scenario.id ? 'page' : undefined}>
            {s.name}
            <small>{s.threat}</small>
          </Link>
        ))}
      </nav>

      <div className="scenario-body">
        <aside className="glossary-side" aria-label="用語一覧">
          <Glossary idPrefix="side" {...glossaryProps} />
        </aside>

        <div className="scenario-main">
          <div className="toolbar">
            <div className="modes" role="group" aria-label="表示モード">
              {MODE_BUTTONS.map((m) => (
                <button key={m.id} type="button" aria-pressed={m.id === mode} onClick={() => changeMode(m.id)}>
                  <span className={`dot k-${m.id}`} aria-hidden="true" />
                  {m.label}
                </button>
              ))}
            </div>
            <button type="button" className="glossary-open" onClick={openDrawer} aria-haspopup="dialog">
              用語<span className="count-badge">{termCount}</span>
            </button>
          </div>
          <p className="summary">
            <strong>{MODE_BUTTONS.find((m) => m.id === mode)?.label}：</strong>
            <TermText text={scenario.summary[mode]} activeTerm={term} onTerm={selectFromText} />
          </p>

          <div className="workspace">
            <section className="panel topology" aria-label="ネットワーク構成図">
              <h2 className="panel-label">ネットワーク構成</h2>
              <div className="drawing">
                <Topology scenario={scenario} mode={mode} index={index} />
              </div>
              <ul className="legend">
                <li>
                  <span className="swatch-badge attacker" aria-hidden="true">
                    !
                  </span>
                  攻撃者
                </li>
                <li>
                  <span className="swatch-badge shield" aria-hidden="true">
                    ✓
                  </span>
                  対策を実施する機器（対策モード）
                </li>
              </ul>
            </section>

            <StepDetail
              scenario={scenario}
              mode={mode}
              index={index}
              onPrev={prev}
              onNext={next}
              activeTerm={term}
              onTerm={selectFromText}
            />

            <section className="panel sequence" aria-label="シーケンス図">
              <h2 className="panel-label">シーケンス図</h2>
              <div className="drawing">
                <Sequence scenario={scenario} mode={mode} index={index} onSelect={(i) => go({ index: i })} marked={marked} />
              </div>
              <ul className="legend">
                <li>
                  <span className="swatch k-normal" aria-hidden="true" />
                  正常
                </li>
                <li>
                  <span className="swatch k-attack" aria-hidden="true" />
                  攻撃
                </li>
                <li>
                  <span className="swatch k-blocked" aria-hidden="true" />
                  攻撃を阻止
                </li>
                <li>
                  <span className="swatch k-defense" aria-hidden="true" />
                  対策が働く
                </li>
                <li>
                  <span className="swatch k-discarded" aria-hidden="true" />
                  破棄
                </li>
                {term && (
                  <li>
                    <span className="swatch-dot" aria-hidden="true" />
                    「{TERM_BY_ID.get(term)?.name}」が出てくるステップ
                  </li>
                )}
              </ul>
            </section>
          </div>

          <section className="points" aria-labelledby="points-title" ref={pointsRef}>
            <h2 id="points-title">午後で押さえる論点</h2>
            <ul>
              {scenario.points.map((p, i) => (
                <li key={i}>
                  <TermText text={p} activeTerm={term} onTerm={selectFromText} />
                </li>
              ))}
            </ul>
          </section>
          <p className="hint">
            矢印や用語を押すと、図と説明が連動して動きます。キーボードの ← → でもステップを進められます。
          </p>
        </div>
      </div>

      <dialog ref={drawerRef} className="glossary-drawer" aria-label="用語一覧" onClick={(e) => e.target === e.currentTarget && closeDrawer()}>
        <div className="drawer-inner">
          <button type="button" className="drawer-close" onClick={closeDrawer}>
            閉じる
          </button>
          <Glossary idPrefix="drawer" {...glossaryProps} />
        </div>
      </dialog>
    </div>
  )
}
