import { useCallback, useEffect, useState } from 'react'
import type { Mode, Scenario } from '../types'
import { Link } from '../router'
import { scenarios } from '../scenarios'
import { Sequence } from './Sequence'
import { StepDetail } from './StepDetail'
import { Topology } from './Topology'

const MODES: readonly { id: Mode; label: string }[] = [
  { id: 'normal', label: '正常' },
  { id: 'attack', label: '攻撃' },
  { id: 'defense', label: '対策' },
]

const NEXT_MODE: Record<Mode, Mode> = { normal: 'attack', attack: 'defense', defense: 'normal' }

export function ScenarioView({ scenario }: { scenario: Scenario }) {
  const [mode, setMode] = useState<Mode>('normal')
  const [index, setIndex] = useState(0)
  const steps = scenario.steps[mode]

  const changeMode = (next: Mode) => {
    setMode(next)
    setIndex(0)
  }
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => {
    if (index < steps.length - 1) setIndex(index + 1)
    else {
      setMode(NEXT_MODE[mode])
      setIndex(0)
    }
  }, [index, steps.length, mode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

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

      <div className="modes" role="group" aria-label="表示モード">
        {MODES.map((m) => (
          <button key={m.id} type="button" aria-pressed={m.id === mode} onClick={() => changeMode(m.id)}>
            <span className={`dot k-${m.id === 'normal' ? 'normal' : m.id}`} aria-hidden="true" />
            {m.label}
          </button>
        ))}
      </div>
      <p className="summary">
        <strong>{MODES.find((m) => m.id === mode)?.label}：</strong>
        {scenario.summary[mode]}
      </p>

      <div className="workspace">
        <section className="panel topology" aria-label="ネットワーク構成図">
          <h2 className="panel-label">ネットワーク構成</h2>
          <div className="drawing">
            <Topology scenario={scenario} mode={mode} index={index} />
          </div>
          <ul className="legend">
            <li>
              <span className="swatch-badge attacker" aria-hidden="true">!</span>攻撃者
            </li>
            <li>
              <span className="swatch-badge shield" aria-hidden="true">✓</span>対策を実施する機器（対策モード）
            </li>
          </ul>
        </section>

        <StepDetail scenario={scenario} mode={mode} index={index} onPrev={prev} onNext={next} />

        <section className="panel sequence" aria-label="シーケンス図">
          <h2 className="panel-label">シーケンス図</h2>
          <div className="drawing">
            <Sequence scenario={scenario} mode={mode} index={index} onSelect={setIndex} />
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
          </ul>
        </section>
      </div>

      <section className="points" aria-labelledby="points-title">
        <h2 id="points-title">午後で押さえる論点</h2>
        <ul>
          {scenario.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>
      <p className="hint">矢印をタップすると、そのステップに移動します。キーボードの ← → でも操作できます。</p>
    </div>
  )
}
