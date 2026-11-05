import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { bookPath, CHAPTERS, chapterNumber, PARTS } from '../book'
import type { BookBlock, Chapter } from '../book/types'
import { Link } from '../router'
import { findScenario } from '../scenarios'
import { Figure } from './Figure'
import { TermSheet } from './TermSheet'
import { TermText } from './TermText'
import { Block } from './TopicView'

/** 教科書の目次 */
export function BookIndex() {
  return (
    <div className="book">
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <span>教科書</span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">教科書</p>
        <h1>通信とセキュリティの教科書</h1>
        <p className="lead">
          1章ずつ、短い本文と図を積み重ねて読み進めます。図の黄色の印は、その節で新しく加わったものです。読み終えたら、章の最後から図解・まとめ・確認問題へ進めます。
        </p>
      </header>
      <ol className="book-parts">
        {PARTS.map((part, pi) => (
          <li key={part.id} className="study-card">
            <h2>
              <span className="part-no">第{pi + 1}部</span>
              {part.title}
            </h2>
            <p className="study-note">{part.lead}</p>
            <ol className="book-chapters">
              {CHAPTERS.filter((c) => c.part === part.id).map((c) => (
                <li key={c.id}>
                  <Link to={bookPath(c.id)}>
                    <span className="chapter-no">第{chapterNumber(c.id)}章</span>
                    <span className="chapter-title">{c.title}</span>
                    <span className="chapter-lead">{c.lead}</span>
                    <span className="chapter-sections">{c.sections.map((s) => s.title).join(' · ')}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** 教科書の1章：節を順に積み重ねて読む */
export function BookView({ chapter }: { chapter: Chapter }) {
  const [term, setTerm] = useState<string | null>(null)
  const onTerm = useCallback((id: string) => setTerm((cur) => (cur === id ? null : id)), [])
  const close = useCallback(() => setTerm(null), [])
  const text = (t: string) => <TermText text={t} activeTerm={term} onTerm={onTerm} />
  const no = chapterNumber(chapter.id)
  const part = PARTS.findIndex((p) => p.id === chapter.part)
  const scenario = findScenario(chapter.id)
  const prev = CHAPTERS[no - 2]
  const next = CHAPTERS[no]

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [chapter.id])

  let figNo = 0
  const block = (b: BookBlock, i: number): ReactNode => {
    if (b.kind === 'figure') {
      figNo += 1
      return <Figure key={i} figure={b.figure} caption={text(b.caption)} number={`${no}-${figNo}`} />
    }
    return <Block key={i} block={b} text={text} />
  }

  return (
    <div className={`topic book${term ? ' has-sheet' : ''}`}>
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <Link to={bookPath()}>教科書</Link>
        <span aria-hidden="true">›</span>
        <span>第{no}章</span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">
          第{part + 1}部 {PARTS[part]?.title} · 第{no}章
        </p>
        <h1>{chapter.title}</h1>
        <p className="lead">{text(chapter.lead)}</p>
      </header>

      <div className="topic-layout">
        <nav className="topic-toc" aria-labelledby="toc-title">
          <h2 id="toc-title">この章</h2>
          <ol>
            {chapter.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  {no}.{i + 1} {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#next-study">次の学習</a>
            </li>
          </ol>
        </nav>

        <div className="study topic-main">
          {chapter.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="study-card topic-section book-section" aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`}>
                <span className="section-no">
                  {no}.{i + 1}
                </span>
                {s.title}
              </h2>
              {s.blocks.map(block)}
              {s.see && scenario && (
                <p className="book-see">
                  <Link to={`/${scenario.id}?mode=${s.see.mode}&step=${s.see.step}`}>
                    図解で確かめる：{s.see.label}
                    <span aria-hidden="true"> →</span>
                  </Link>
                </p>
              )}
            </section>
          ))}

          <section id="next-study" className="study-card" aria-labelledby="next-title">
            <h2 id="next-title">次の学習</h2>
            {scenario && (
              <ul className="related-links">
                <li>
                  <Link to={`/${scenario.id}`}>
                    <span className="related-name">図解で通して見る</span>
                    <span className="related-threat">{scenario.name}</span>
                  </Link>
                </li>
                <li>
                  <Link to={`/${scenario.id}?view=summary`}>
                    <span className="related-name">まとめ</span>
                    <span className="related-threat">学習目標・よくある誤解・比較表</span>
                  </Link>
                </li>
                <li>
                  <Link to={`/${scenario.id}?view=quiz`}>
                    <span className="related-name">確認問題</span>
                    <span className="related-threat">4択と記述</span>
                  </Link>
                </li>
              </ul>
            )}
            <nav className="book-pager" aria-label="前後の章">
              {prev ? (
                <Link to={bookPath(prev.id)} className="pager-prev">
                  <span className="pager-dir">← 前の章</span>
                  <span>{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={bookPath(next.id)} className="pager-next">
                  <span className="pager-dir">次の章 →</span>
                  <span>{next.title}</span>
                </Link>
              )}
            </nav>
          </section>
        </div>
      </div>

      {term && <TermSheet termId={term} onClose={close} />}
    </div>
  )
}
