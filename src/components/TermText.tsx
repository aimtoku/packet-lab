import { useMemo } from 'react'
import { splitTerms, TERM_BY_ID } from '../glossary/match'

interface Props {
  text: string
  /** 選んでいる用語。文中のその用語を強調する */
  activeTerm: string | null
  /** 文中の用語を押したとき */
  onTerm: (termId: string) => void
}

/** 文章の中の用語を、押せるボタンにして表示する（HTMLとしては解釈しない） */
export function TermText({ text, activeTerm, onTerm }: Props) {
  const segments = useMemo(() => splitTerms(text), [text])
  return (
    <>
      {segments.map((seg, i) =>
        typeof seg === 'string' ? (
          seg
        ) : (
          <button
            key={i}
            type="button"
            className={seg.termId === activeTerm ? 'term-link active' : 'term-link'}
            title={`用語：${TERM_BY_ID.get(seg.termId)?.name ?? seg.text}`}
            onClick={() => onTerm(seg.termId)}
          >
            {seg.text}
          </button>
        ),
      )}
    </>
  )
}
