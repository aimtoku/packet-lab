import { useState, type ReactNode } from 'react'
import { CHOICE_MARKS, countChars } from '../learning'
import type { ChoiceQuestion, Learning, WrittenQuestion } from '../learning/types'
import { TermText } from './TermText'

interface Props {
  quiz: Learning['quiz']
  activeTerm: string | null
  onTerm: (termId: string) => void
}

/** 確認問題：午前の形式（4択）と、午後の形式（記述）。答えは保存しない */
export function Quiz({ quiz, activeTerm, onTerm }: Props) {
  const { choices, written } = quiz
  const [picks, setPicks] = useState<(number | undefined)[]>([])
  const text = (t: string) => <TermText text={t} activeTerm={activeTerm} onTerm={onTerm} />
  const answered = picks.filter((p) => p !== undefined).length
  const correct = picks.filter((p, i) => p !== undefined && p === choices[i]?.answer).length

  return (
    <div className="study">
      <section className="study-card" aria-labelledby="choice-title">
        <div className="study-head">
          <h2 id="choice-title">午前の形式（4択）</h2>
          <p className="score" aria-live="polite">
            {answered === 0 ? `全${choices.length}問` : `${answered}問中 ${correct}問 正解`}
          </p>
          {answered > 0 && (
            <button type="button" className="ghost-button" onClick={() => setPicks([])}>
              やり直す
            </button>
          )}
        </div>
        {choices.map((q, i) => (
          <ChoiceCard
            key={i}
            no={i + 1}
            q={q}
            picked={picks[i]}
            onPick={(j) => setPicks((p) => Object.assign([...p], { [i]: j }))}
            text={text}
          />
        ))}
      </section>

      <section className="study-card" aria-labelledby="written-title">
        <div className="study-head">
          <h2 id="written-title">午後の形式（記述）</h2>
        </div>
        <p className="study-note">自分の解答を書いてから、解答例と見比べてください。書いた内容は保存されません。</p>
        {written.map((q, i) => (
          <WrittenCard key={i} no={i + 1} q={q} text={text} />
        ))}
      </section>
    </div>
  )
}

function ChoiceCard({
  no,
  q,
  picked,
  onPick,
  text,
}: {
  no: number
  q: ChoiceQuestion
  picked: number | undefined
  onPick: (j: number) => void
  text: (t: string) => ReactNode
}) {
  const done = picked !== undefined
  const ok = picked === q.answer
  return (
    <article className="question" aria-labelledby={`choice-${no}`}>
      <h3 id={`choice-${no}`} className="question-no">
        問{no}
      </h3>
      <p className="question-text">{text(q.question)}</p>
      <ul className="choices">
        {q.choices.map((c, j) => {
          const state = !done ? '' : j === q.answer ? ' is-answer' : j === picked ? ' is-wrong' : ''
          return (
            <li key={j}>
              <button type="button" className={`choice${state}`} onClick={() => onPick(j)} disabled={done} aria-pressed={j === picked}>
                <span className="choice-mark">{CHOICE_MARKS[j]}</span>
                <span>{c}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {done && (
        <div className={`feedback ${ok ? 'ok' : 'ng'}`} role="status">
          <strong>{ok ? '正解' : `不正解（正解は ${CHOICE_MARKS[q.answer]}）`}</strong>
          <p>{text(q.explanation)}</p>
        </div>
      )}
    </article>
  )
}

function WrittenCard({ no, q, text }: { no: number; q: WrittenQuestion; text: (t: string) => ReactNode }) {
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(false)
  const length = countChars(draft)
  const id = `written-${no}`
  return (
    <article className="question" aria-labelledby={id}>
      <h3 id={id} className="question-no">
        問{no}
      </h3>
      <p className="question-text">{text(q.question)}</p>
      <label className="draft">
        <span className="draft-label">自分の解答</span>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
      </label>
      <p className={`char-count${length > q.limit ? ' over' : ''}`}>
        {length}字 ／ {q.limit}字以内
      </p>
      <button type="button" className="ghost-button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? '解答例を閉じる' : '解答例を見る'}
      </button>
      {open && (
        <div className="model">
          <h4>解答例（{countChars(q.answer)}字）</h4>
          <p className="model-answer">{text(q.answer)}</p>
          <h4>採点のポイント</h4>
          <ul className="plain-list">
            {q.keys.map((k, i) => (
              <li key={i}>{text(k)}</li>
            ))}
          </ul>
          <h4>解説</h4>
          <p>{text(q.explanation)}</p>
        </div>
      )}
    </article>
  )
}
