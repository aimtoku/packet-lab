import { PHASE_LABEL, PHASES, type Mode, type Scenario, type StepKind } from '../types'
import type { SubStep } from '../playback/substeps'
import { PacketLayers } from './PacketLayers'
import { TermText } from './TermText'

export const KIND_LABEL: Record<StepKind, string> = {
  normal: '正常',
  attack: '攻撃',
  blocked: '攻撃を阻止',
  defense: '対策が働く',
  discarded: '破棄',
  response: 'インシデント対応',
}

const NEXT_LABEL: Record<Mode, string> = {
  normal: '攻撃を見る',
  attack: '対策を見る',
  defense: '事後対応を見る',
  incident: '最初から',
}

interface Props {
  scenario: Scenario
  mode: Mode
  index: number
  subs: readonly SubStep[]
  sub: number
  /** 区切りを選んだとき */
  onSub: (sub: number) => void
  onPrev: () => void
  onNext: () => void
  activeTerm: string | null
  onTerm: (termId: string) => void
}

/**
 * 事後対応の段階（検知 → … → 再発防止）。今のステップの段階を強調し、済んだ段階に印を付ける。
 * このシナリオで扱わない段階は薄く表示する。
 */
function PhaseStrip({ steps, index }: { steps: Scenario['steps'][Mode]; index: number }) {
  const current = steps[index]?.phase
  const seen = new Set(steps.slice(0, index).map((s) => s.phase))
  const present = new Set(steps.map((s) => s.phase))
  return (
    <ol className="phases" aria-label="インシデント対応の段階">
      {PHASES.map((p) => {
        const state = p === current ? 'now' : seen.has(p) ? 'done' : present.has(p) ? '' : 'absent'
        return (
          <li key={p} className={state} aria-current={p === current ? 'step' : undefined}>
            {PHASE_LABEL[p]}
          </li>
        )
      })}
    </ol>
  )
}

/** 「FW：〜」のような説明文を、機器の名前と内容に分ける */
function splitWho(text: string): [string | null, string] {
  const at = text.indexOf('：')
  return at > 0 && at <= 14 ? [text.slice(0, at), text.slice(at + 1)] : [null, text]
}

export function StepDetail({ scenario, mode, index, subs, sub, onSub, onPrev, onNext, activeTerm, onTerm }: Props) {
  const steps = scenario.steps[mode]
  const step = steps[index]
  if (!step) return null

  const actorName = (id: string) => scenario.actors.find((a) => a.id === id)?.name ?? id
  const isLast = index === steps.length - 1
  const text = (t: string) => <TermText text={t} activeTerm={activeTerm} onTerm={onTerm} />

  return (
    <section className="detail" aria-label="ステップの詳細">
      <header className={`detail-head k-${step.kind}`}>
        <div className="detail-meta">
          <span>STEP {String(index + 1).padStart(2, '0')}</span>
          <span className="kind-tag">{KIND_LABEL[step.kind]}</span>
        </div>
        <h2>{step.title}</h2>
        <p className="detail-route">
          {step.from === step.to ? `${actorName(step.from)}の中の処理` : `${actorName(step.from)} → ${actorName(step.to)}`}
        </p>
        {mode === 'incident' && step.phase && <PhaseStrip steps={steps} index={index} />}
      </header>
      <div className="detail-body">
        <section aria-labelledby="timeline-title">
          <h3 id="timeline-title" className="sub-title">
            このステップで起きていること
          </h3>
          <ol className="timeline">
            {subs.map((s, i) => {
              const state = i < sub ? 'done' : i === sub ? 'now' : 'todo'
              const [who, what] = splitWho(s.text)
              return (
                <li key={i} className={`tl-item ${state} k-${s.kind}`} aria-current={i === sub ? 'step' : undefined}>
                  <button
                    type="button"
                    className="tl-mark"
                    onClick={() => onSub(i)}
                    aria-label={`${i + 1}番目を表示${who ? `（${who}）` : ''}`}
                  >
                    {state === 'done' ? '✓' : i + 1}
                  </button>
                  <p className="tl-text">
                    {who && <strong className="tl-who">{who}</strong>}
                    {text(what)}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>
        <PacketLayers scenario={scenario} step={step} activeTerm={activeTerm} onTerm={onTerm} />
        <p className="note">{text(step.note)}</p>
        {step.point && (
          <div className="point">
            <span className="point-label">支援士ポイント</span>
            <p>{text(step.point)}</p>
          </div>
        )}
      </div>
      <footer className="detail-nav">
        <span className="count">
          STEP {index + 1} / {steps.length}
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
