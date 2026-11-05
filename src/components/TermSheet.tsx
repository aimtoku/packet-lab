import { useEffect } from 'react'
import { MODE_LABEL, occurrencesOf, TERM_BY_ID, type Occurrence } from '../glossary/match'
import { Link } from '../router'
import { findScenario } from '../scenarios'
import { topicPath, topicsMentioning } from '../topics'

interface Props {
  termId: string
  /** 表示中の解説ページ（ほかの解説の一覧から除く） */
  topicId?: string
  /** 表示中のシナリオ。このシナリオの登場箇所は、ページを移らずに onJump で移動する */
  scenarioId?: string
  onJump?: (o: Occurrence) => void
  /** 用語一覧を開く */
  onOpenList?: () => void
  onClose: () => void
  /** 画面のどちら側に出すか（PCのとき）。シナリオでは、前へ・次へのボタンを隠さないよう左に出す */
  side?: 'left' | 'right'
}

const MAX_HERE = 8
const MAX_ELSEWHERE = 4

/** 文中の用語を押したときに、画面の下（PCでは隅）に出す説明。図解のステップや解説へ移動できる */
export function TermSheet({ termId, topicId, scenarioId, onJump, onOpenList, onClose, side = 'right' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const term = TERM_BY_ID.get(termId)
  if (!term) return null
  const all = occurrencesOf(termId)
  const here = scenarioId ? all.filter((o) => o.scenarioId === scenarioId).slice(0, MAX_HERE) : []
  const elsewhere = all.filter((o) => o.scenarioId !== scenarioId).slice(0, scenarioId ? MAX_ELSEWHERE : MAX_HERE)
  const topics = topicsMentioning(termId).filter((t) => t.topic.id !== topicId)

  return (
    <aside className={`term-sheet ${side}`} aria-label={`用語：${term.name}`} aria-live="polite">
      <div className="term-sheet-head">
        <h2>{term.name}</h2>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="用語の説明を閉じる">
          ×
        </button>
      </div>
      <p>{term.description}</p>
      {here.length > 0 && onJump && (
        <>
          <h3>このシナリオで出てくるステップ</h3>
          <div className="chips">
            {here.map((o) => (
              <button key={`${o.mode}${o.index}`} type="button" className={`chip k-${o.mode}`} onClick={() => onJump(o)}>
                {MODE_LABEL[o.mode]} {o.index + 1}
              </button>
            ))}
          </div>
        </>
      )}
      {elsewhere.length > 0 && (
        <>
          <h3>{scenarioId ? 'ほかのシナリオ' : '図解で見る'}</h3>
          <div className="chips">
            {elsewhere.map((o) => (
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
      {topics.length > 0 && (
        <>
          <h3>{topicId ? 'ほかの解説' : '解説'}</h3>
          <div className="chips">
            {topics.map(({ topic, section }) => (
              <Link key={topic.id} to={topicPath(topic.id, section)} className="chip other">
                {topic.name}
              </Link>
            ))}
          </div>
        </>
      )}
      {onOpenList && (
        <button type="button" className="ghost-button sheet-list" onClick={onOpenList}>
          用語の一覧を開く
        </button>
      )}
    </aside>
  )
}
