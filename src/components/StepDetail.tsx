import { useMemo } from 'react'
import type { Mode, Scenario, StepKind } from '../types'
import { nodesFor, stepRoute } from '../topology/route'
import { TermText } from './TermText'

export const KIND_LABEL: Record<StepKind, string> = {
  normal: '正常',
  attack: '攻撃',
  blocked: '攻撃を阻止',
  defense: '対策が働く',
  discarded: '破棄',
}

const NEXT_LABEL: Record<Mode, string> = {
  normal: '攻撃を見る',
  attack: '対策を見る',
  defense: '最初から',
}

interface Props {
  scenario: Scenario
  mode: Mode
  index: number
  onPrev: () => void
  onNext: () => void
  activeTerm: string | null
  onTerm: (termId: string) => void
}

export function StepDetail({ scenario, mode, index, onPrev, onNext, activeTerm, onTerm }: Props) {
  const steps = scenario.steps[mode]
  const step = steps[index]
  const nodes = useMemo(() => nodesFor(scenario), [scenario])
  if (!step) return null

  const actorName = (id: string) => scenario.actors.find((a) => a.id === id)?.name ?? id
  const hops = stepRoute(scenario, nodes, step.from, step.to)
    .map((id) => nodes[id])
    .filter((n) => n && n.type !== 'switch' && n.name)
    .map((n) => n!.name)
  const isLast = index === steps.length - 1

  return (
    <section className="detail" aria-live="polite" aria-label="ステップの詳細">
      <header className={`detail-head k-${step.kind}`}>
        <div className="detail-meta">
          <span>STEP {String(index + 1).padStart(2, '0')}</span>
          <span className="kind-tag">{KIND_LABEL[step.kind]}</span>
        </div>
        <h2>{step.title}</h2>
        <p className="detail-route">
          {actorName(step.from)} → {actorName(step.to)}
        </p>
      </header>
      <div className="detail-body">
        {hops.length > 1 && (
          <p className="hops">
            <span className="hops-label">経路</span>
            {hops.map((name, i) => (
              <span key={i} className="hop-item">
                {i > 0 && <span aria-hidden="true">›</span>}
                <span className="hop-name">{name}</span>
              </span>
            ))}
          </p>
        )}
        <div className="fields">
          <table>
            <tbody>
              {step.fields.map(([key, value], i) => (
                <tr key={i}>
                  <th scope="row">
                    <TermText text={key} activeTerm={activeTerm} onTerm={onTerm} />
                  </th>
                  <td>
                    <TermText text={value} activeTerm={activeTerm} onTerm={onTerm} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          <TermText text={step.note} activeTerm={activeTerm} onTerm={onTerm} />
        </p>
        {step.point && (
          <div className="point">
            <span className="point-label">支援士ポイント</span>
            <p>
              <TermText text={step.point} activeTerm={activeTerm} onTerm={onTerm} />
            </p>
          </div>
        )}
      </div>
      <footer className="detail-nav">
        <span className="count">
          {index + 1} / {steps.length}
        </span>
        <button type="button" onClick={onPrev} disabled={index === 0}>
          前へ
        </button>
        <button type="button" className="primary" onClick={onNext}>
          {isLast ? NEXT_LABEL[mode] : '次へ'}
        </button>
      </footer>
    </section>
  )
}
