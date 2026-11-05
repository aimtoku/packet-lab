import { useEffect } from 'react'
import { MODE_LABEL, occurrencesOf, TERM_BY_ID } from '../glossary/match'
import { Link } from '../router'
import { findScenario } from '../scenarios'
import { topicPath, topicsMentioning } from '../topics'

interface Props {
  termId: string
  /** 表示中の解説ページ（ほかの解説の一覧から除く） */
  topicId: string
  onClose: () => void
}

const MAX_CHIPS = 6

/** 解説ページで用語を押したときに、画面の下に出す説明。図解の該当ステップや、ほかの解説へ移動できる */
export function TermSheet({ termId, topicId, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const term = TERM_BY_ID.get(termId)
  if (!term) return null
  const steps = occurrencesOf(termId).slice(0, MAX_CHIPS)
  const others = topicsMentioning(termId).filter((t) => t.topic.id !== topicId)

  return (
    <aside className="term-sheet" aria-label={`用語：${term.name}`} aria-live="polite">
      <div className="term-sheet-head">
        <h2>{term.name}</h2>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="用語の説明を閉じる">
          ×
        </button>
      </div>
      <p>{term.description}</p>
      {steps.length > 0 && (
        <>
          <h3>図解で見る</h3>
          <div className="chips">
            {steps.map((o) => (
              <Link
                key={`${o.scenarioId}${o.mode}${o.index}`}
                to={`/${o.scenarioId}?mode=${o.mode}&step=${o.index + 1}&term=${encodeURIComponent(termId)}`}
                className={`chip k-${o.mode}`}
              >
                {findScenario(o.scenarioId)?.name}：{MODE_LABEL[o.mode]} {o.index + 1}
              </Link>
            ))}
          </div>
        </>
      )}
      {others.length > 0 && (
        <>
          <h3>ほかの解説</h3>
          <div className="chips">
            {others.map(({ topic, section }) => (
              <Link key={topic.id} to={topicPath(topic.id, section)} className="chip other">
                {topic.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
