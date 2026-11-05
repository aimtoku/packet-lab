import { type ReactNode } from 'react'
import type { Mode, Scenario } from '../types'
import { TermText } from './TermText'

const FLOW_TITLE: Record<Mode, string> = {
  normal: '正常な通信の流れ',
  attack: '攻撃の流れ',
  defense: '対策の流れ',
  incident: 'インシデント対応の流れ',
}

interface Props {
  scenario: Scenario
  mode: Mode
  index: number
  onSelect: (index: number) => void
  /** 選んだ用語が出てくるステップ */
  marked: ReadonlySet<number>
  activeTerm: string | null
  onTerm: (termId: string) => void
  /** カードの上に置くもの（モードの切り替え） */
  children?: ReactNode
}

/**
 * モードの流れ：ステップの一覧を1か所に並べ、いまどこにいるかを示す。
 * 全体の筋を先に見せてから、構成図と説明で1ステップずつ追えるようにする。
 * スマホでは、いまのステップだけ題名を出し、ほかは番号だけにして1〜2行に収める。
 */
export function StoryFlow({ scenario, mode, index, onSelect, marked, activeTerm, onTerm, children }: Props) {
  const steps = scenario.steps[mode]
  return (
    <section className={`flow k-${mode}`} aria-labelledby="flow-title">
      {children}
      <div className="flow-head">
        <h2 id="flow-title">{scenario.basic ? '通信の流れ' : FLOW_TITLE[mode]}</h2>
        <span className="flow-count">
          {index + 1} / {steps.length}
        </span>
      </div>
      <p className="flow-summary">
        <TermText text={scenario.summary[mode]} activeTerm={activeTerm} onTerm={onTerm} />
      </p>
      <ol className="flow-steps">
        {steps.map((s, i) => {
          const state = i < index ? 'done' : i === index ? 'now' : 'todo'
          return (
            <li key={i} className={`flow-step ${state} k-${s.kind}`}>
              <button type="button" onClick={() => onSelect(i)} aria-current={i === index ? 'step' : undefined}>
                <span className="flow-no" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="visually-hidden">ステップ{i + 1}：</span>
                <span className="flow-title">{s.title}</span>
                {marked.has(i) && <span className="flow-term" title="選んだ用語が出てくるステップ" aria-label="選んだ用語が出てくる" />}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
