import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Mode, Scenario } from '../types'
import { MODE_LABEL, MODES, occurrencesOf, scenarioTerms, TERM_BY_ID, type Occurrence } from '../glossary/match'
import { stateAt } from '../playback/state'
import { dwellFor, loadSpeed, prefersReducedMotion, saveSpeed, SPEEDS, type Speed } from '../playback/speed'
import { subStepsFor, type SubStep } from '../playback/substeps'
import { Link, navigate } from '../router'
import { scenarios } from '../scenarios'
import { nodesFor } from '../topology/route'
import { Glossary } from './Glossary'
import { Player } from './Player'
import { Sequence } from './Sequence'
import { StatePanel } from './StatePanel'
import { StepDetail } from './StepDetail'
import { TermText } from './TermText'
import { Topology } from './Topology'

const NEXT_MODE: Record<Mode, Mode> = { normal: 'attack', attack: 'defense', defense: 'incident', incident: 'normal' }

/** 用語一覧が左に常に表示される幅（styles.css と合わせる） */
const SIDEBAR_QUERY = '(min-width: 1200px)'
/** 構成図と詳細が縦に並ぶ幅（styles.css と合わせる） */
const STACKED_QUERY = '(max-width: 879px)'

interface ViewState {
  mode: Mode
  index: number
  /** ステップの中の区切り（パケットが着いた機器）の番号 */
  sub: number
  term: string | null
}

/** URLの ?mode=attack&step=3&term=dnssec から、表示する状態を読む */
function readState(scenario: Scenario): ViewState {
  const params = new URLSearchParams(window.location.search)
  const mode = MODES.find((m) => m === params.get('mode')) ?? 'normal'
  const step = Number(params.get('step') ?? '1')
  const index = Number.isInteger(step) && step >= 1 && step <= scenario.steps[mode].length ? step - 1 : 0
  const term = params.get('term')
  return { mode, index, sub: 0, term: term && TERM_BY_ID.has(term) ? term : null }
}

function stateToSearch({ mode, index, term }: Pick<ViewState, 'mode' | 'index' | 'term'>): string {
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
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [speed, setSpeed] = useState<Speed>(loadSpeed)
  /** パケットが着いた区切り（`シナリオ/モード/ステップ/区切り`） */
  const [arrivedKey, setArrivedKey] = useState<string | null>(null)
  /** 後ろへ戻ったときは、パケットを動かさずに置く */
  const [instant, setInstant] = useState(false)
  const drawerRef = useRef<HTMLDialogElement>(null)
  const pointsRef = useRef<HTMLElement>(null)
  const topologyRef = useRef<HTMLElement>(null)

  const nodes = useMemo(() => nodesFor(scenario), [scenario])
  /** 全ステップの区切り */
  const allSubs = useMemo(
    () =>
      Object.fromEntries(MODES.map((m) => [m, scenario.steps[m].map((s) => subStepsFor(scenario, nodes, s))])) as Record<
        Mode,
        SubStep[][]
      >,
    [scenario, nodes],
  )
  const subCount = useCallback((m: Mode, i: number) => Math.max(1, allSubs[m][i]?.length ?? 1), [allSubs])
  const subs = allSubs[mode][index] ?? []
  const lastSub = Math.max(0, subs.length - 1)
  const sub = Math.min(state.sub, lastSub)
  const key = `${scenario.id}/${mode}/${index}/${sub}`
  const arrived = arrivedKey === key
  const atEnd = sub === lastSub

  // 共有できるように、表示している状態をURLに反映する（履歴は増やさない。区切りは含めない）
  const search = stateToSearch(state)
  useEffect(() => {
    const url = `${window.location.pathname}${search}`
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, '', url)
  }, [search])

  // 再生中は、パケットが機器に着いて説明を読む時間がたったら、次の区切りへ進む。
  // ステップの最後では止まり、「次へ」を待つ（説明を読む時間をとるため）
  useEffect(() => {
    if (!playing || !arrived || sub >= lastSub) return
    const timer = window.setTimeout(() => {
      setInstant(false)
      setState((s) => (s.mode === mode && s.index === index && s.sub === sub ? { ...s, sub: sub + 1 } : s))
    }, dwellFor(speed, subs[sub]?.text ?? ''))
    return () => window.clearTimeout(timer)
  }, [playing, arrived, sub, lastSub, speed, subs, mode, index])

  const go = useCallback((next: Partial<ViewState>) => {
    setInstant(false)
    setState((s) => ({ ...s, sub: 0, ...next }))
  }, [])
  const changeMode = (next: Mode) => go({ mode: next, index: 0 })

  const toNextStep = useCallback(
    (s: ViewState): ViewState =>
      s.index < scenario.steps[s.mode].length - 1
        ? { ...s, index: s.index + 1, sub: 0 }
        : { ...s, mode: NEXT_MODE[s.mode], index: 0, sub: 0 },
    [scenario],
  )
  const nextStep = useCallback(() => {
    setInstant(false)
    setState(toNextStep)
  }, [toNextStep])
  const prevStep = useCallback(() => {
    setInstant(false)
    setState((s) => ({ ...s, index: Math.max(0, s.index - 1), sub: 0 }))
  }, [])
  /** 区切りを1つ進める。ステップの最後なら次のステップへ */
  const nextSub = useCallback(() => {
    setInstant(false)
    setState((s) => (s.sub < subCount(s.mode, s.index) - 1 ? { ...s, sub: s.sub + 1 } : toNextStep(s)))
  }, [subCount, toNextStep])
  /** 区切りを1つ戻す。ステップの最初なら、前のステップの最後へ */
  const prevSub = useCallback(() => {
    setInstant(true)
    setState((s) => {
      if (s.sub > 0) return { ...s, sub: s.sub - 1 }
      if (s.index > 0) return { ...s, index: s.index - 1, sub: subCount(s.mode, s.index - 1) - 1 }
      return s
    })
  }, [subCount])
  const selectSub = (i: number) => {
    setInstant(i < sub)
    setState((s) => ({ ...s, sub: i }))
  }

  /** 再生と一時停止。ステップの最後まで進んでいたら、最初から再生し直す */
  const togglePlay = useCallback(() => {
    if (atEnd) {
      setInstant(true)
      setState((s) => ({ ...s, sub: 0 }))
      setPlaying(true)
      return
    }
    setPlaying((p) => !p)
  }, [atEnd])

  const changeSpeed = (next: Speed) => {
    setSpeed(next)
    saveSpeed(next)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const target = e.target instanceof HTMLElement ? e.target : null
      if (target?.closest('input, textarea, select, dialog')) return
      if (e.key === 'ArrowRight') nextSub()
      else if (e.key === 'ArrowLeft') prevSub()
      else if (e.key === ' ' && !target?.closest('button, a, [role="button"]')) {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nextSub, prevSub, togglePlay])

  /** 詳細の「次へ」：縦に並ぶ画面では、次のステップの動きが見えるよう構成図まで戻る */
  const nextFromDetail = () => {
    nextStep()
    if (window.matchMedia(STACKED_QUERY).matches) {
      topologyRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    }
  }

  const isSidebar = () => window.matchMedia(SIDEBAR_QUERY).matches
  const closeDrawer = () => drawerRef.current?.close()
  const openDrawer = () => drawerRef.current?.showModal()

  const showPoints = (termId: string) => {
    setState((s) => ({ ...s, term: termId }))
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
      setState((s) => ({ ...s, term: term === termId ? null : termId }))
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
    setState((s) => ({ ...s, term: termId }))
    if (!isSidebar()) openDrawer()
  }

  const marked = useMemo(
    () => new Set(term ? occurrencesOf(term, scenario.id).filter((o) => o.mode === mode).map((o) => o.index) : []),
    [term, scenario.id, mode],
  )
  const termCount = scenarioTerms(scenario.id).length
  const views = stateAt(scenario, mode, index, subs, arrived ? sub : sub - 1)
  const travelMs = instant ? 0 : SPEEDS[speed].travel

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
              {MODES.map((m) => (
                <button key={m} type="button" className={`k-${m}`} aria-pressed={m === mode} onClick={() => changeMode(m)}>
                  <span className={`dot k-${m}`} aria-hidden="true" />
                  {MODE_LABEL[m]}
                </button>
              ))}
            </div>
            <button type="button" className="glossary-open" onClick={openDrawer} aria-haspopup="dialog">
              用語<span className="count-badge">{termCount}</span>
            </button>
          </div>
          <p className="summary">
            <strong>{mode === 'incident' ? 'インシデント対応' : MODE_LABEL[mode]}：</strong>
            <TermText text={scenario.summary[mode]} activeTerm={term} onTerm={selectFromText} />
          </p>

          <div className="workspace">
            <section className="panel topology" aria-label="ネットワーク構成図" ref={topologyRef}>
              <h2 className="panel-label">ネットワーク構成</h2>
              <div className="drawing">
                <Topology
                  scenario={scenario}
                  mode={mode}
                  index={index}
                  subs={subs}
                  sub={sub}
                  travelMs={travelMs}
                  onArrive={setArrivedKey}
                  arrived={arrived}
                />
              </div>
              <Player
                playing={playing}
                atEnd={atEnd}
                onToggle={togglePlay}
                speed={speed}
                onSpeed={changeSpeed}
                subs={subs}
                sub={sub}
                activeTerm={term}
                onTerm={selectFromText}
              />
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

            <StatePanel views={views} activeTerm={term} onTerm={selectFromText} />

            <StepDetail
              scenario={scenario}
              mode={mode}
              index={index}
              subs={subs}
              sub={sub}
              onSub={selectSub}
              onPrev={prevStep}
              onNext={nextFromDetail}
              activeTerm={term}
              onTerm={selectFromText}
            />

            <section className="panel sequence" aria-label="シーケンス図">
              <h2 className="panel-label">シーケンス図</h2>
              <div className="drawing">
                <Sequence
                  scenario={scenario}
                  mode={mode}
                  index={index}
                  onSelect={(i) => go({ index: i })}
                  marked={marked}
                  progress={subs.length > 1 ? sub / (subs.length - 1) : 1}
                  travelMs={travelMs}
                />
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
                {mode === 'incident' && (
                  <li>
                    <span className="swatch k-response" aria-hidden="true" />
                    インシデント対応（連絡・指示・調査）
                  </li>
                )}
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
            <h2 id="points-title">{mode === 'incident' ? 'インシデント対応で押さえる論点' : '午後で押さえる論点'}</h2>
            <ul>
              {(mode === 'incident' ? scenario.incidentPoints : scenario.points).map((p, i) => (
                <li key={i}>
                  <TermText text={p} activeTerm={term} onTerm={selectFromText} />
                </li>
              ))}
            </ul>
          </section>
          <p className="hint">
            再生すると、パケットが機器に着くたびに止まって、そこで何が起きているかを説明します。キーボードの ← → で1つずつ進めたり戻したり、スペースで再生・一時停止ができます。
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
