import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from '../router'
import { findScenario } from '../scenarios'
import { TOPICS, topicPath } from '../topics'
import type { Topic, TopicBlock } from '../topics/types'
import { Quiz } from './Quiz'
import { TermSheet } from './TermSheet'
import { TermText } from './TermText'

/** 解説ページ：管理・法令・体制など、通信の図解にしにくい分野 */
export function TopicView({ topic }: { topic: Topic }) {
  const [term, setTerm] = useState<string | null>(null)
  const onTerm = useCallback((id: string) => setTerm((cur) => (cur === id ? null : id)), [])
  const close = useCallback(() => setTerm(null), [])
  const text = (t: string) => <TermText text={t} activeTerm={term} onTerm={onTerm} />
  const related = topic.related.flatMap((id) => {
    const s = findScenario(id)
    return s ? [s] : []
  })

  // URLの #節 へ移動する（ほかのページの用語から来たとき）
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [topic.id])

  return (
    <div className={`topic${term ? ' has-sheet' : ''}`}>
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <span>解説</span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">解説</p>
        <h1>{topic.name}</h1>
        <p className="lead">{text(topic.lead)}</p>
        {topic.asOf && <p className="as-of">法令や組織などの情報は、{topic.asOf}のものです。</p>}
      </header>

      <div className="topic-layout">
        <nav className="topic-toc" aria-labelledby="toc-title">
          <h2 id="toc-title">このページ</h2>
          <ol>
            {topic.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
            <li>
              <a href="#cues">午後の問題文の手がかり</a>
            </li>
            <li>
              <a href="#quiz">確認問題</a>
            </li>
          </ol>
          <h2>ほかの解説</h2>
          <ul>
            {TOPICS.map((t) => (
              <li key={t.id}>
                <Link to={topicPath(t.id)} aria-current={t.id === topic.id ? 'page' : undefined}>
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="study topic-main">
          <section className="study-card" aria-labelledby="goals-title">
            <h2 id="goals-title">学習目標</h2>
            <ul className="goals">
              {topic.goals.map((g, i) => (
                <li key={i}>{text(g)}</li>
              ))}
            </ul>
          </section>

          {topic.sections.map((s) => (
            <section key={s.id} id={s.id} className="study-card topic-section" aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`}>{s.title}</h2>
              {s.blocks.map((b, i) => (
                <Block key={i} block={b} text={text} />
              ))}
            </section>
          ))}

          <section id="cues" className="study-card topic-section" aria-labelledby="cues-title">
            <h2 id="cues-title">午後の問題文の手がかり</h2>
            <p className="study-note">問題文にこう書かれていたら、こう考えます。</p>
            <ul className="cues">
              {topic.cues.map((c, i) => (
                <li key={i}>
                  <p className="cue">{text(c.cue)}</p>
                  <p className="think">
                    <span aria-hidden="true">→ </span>
                    {text(c.think)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="study-card" aria-labelledby="related-title">
            <h2 id="related-title">図解で確かめる</h2>
            <ul className="related-links">
              {related.map((s) => (
                <li key={s.id}>
                  <Link to={`/${s.id}`}>
                    <span className="related-name">{s.name}</span>
                    <span className="related-threat">{s.threat}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div id="quiz" className="topic-section">
            <Quiz quiz={topic.quiz} activeTerm={term} onTerm={onTerm} />
          </div>

          {topic.sources && topic.sources.length > 0 && (
            <section className="study-card" aria-labelledby="sources-title">
              <h2 id="sources-title">参考にした資料</h2>
              <ul className="plain-list sources">
                {topic.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {term && <TermSheet termId={term} topicId={topic.id} onClose={close} />}
    </div>
  )
}

export function Block({ block, text }: { block: TopicBlock; text: (t: string) => ReactNode }) {
  switch (block.kind) {
    case 'p':
      return <p className="topic-p">{text(block.text)}</p>
    case 'note':
      return (
        <p className="topic-note">
          <span className="note-label">補足</span>
          <span>{text(block.text)}</span>
        </p>
      )
    case 'list':
      return (
        <ul className="plain-list topic-list">
          {block.items.map((item, i) => (
            <li key={i}>{text(item)}</li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <ol className="topic-steps">
          {block.items.map((item, i) => (
            <li key={i}>
              <span className="step-title">{text(item.title)}</span>
              <span className="step-text">{text(item.text)}</span>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="table-scroll topic-table-wrap">
          <table className={`compare topic-table${block.head.length >= 3 ? ' wide' : ''}`}>
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th key={j} scope="row">
                        {text(cell)}
                      </th>
                    ) : (
                      <td key={j}>{text(cell)}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}
