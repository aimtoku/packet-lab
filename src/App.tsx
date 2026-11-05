import { useEffect } from 'react'
import { findChapter } from './book'
import { BookIndex, BookView } from './components/BookView'
import { Home } from './components/Home'
import { ScenarioView } from './components/ScenarioView'
import { TopicView } from './components/TopicView'
import { Link, usePathname } from './router'
import { findScenario } from './scenarios'
import { findTopic } from './topics'

const SITE_NAME = 'パケット攻防ラボ'
const REPOSITORY_URL = 'https://github.com/aimtoku/packet-lab'

export function App() {
  const pathname = usePathname()
  const id = pathname.replace(/^\/+|\/+$/g, '')
  const topicId = id.match(/^topics\/([a-z0-9-]+)$/)?.[1]
  const topic = topicId ? findTopic(topicId) : undefined
  const chapterId = id.match(/^book\/([a-z0-9-]+)$/)?.[1]
  const chapter = chapterId ? findChapter(chapterId) : undefined
  const isBookIndex = id === 'book'
  const scenario = id && !topicId && !chapterId && !isBookIndex ? findScenario(id) : undefined
  const notFound = id !== '' && !scenario && !topic && !chapter && !isBookIndex

  useEffect(() => {
    document.title = scenario ? `${scenario.name}：${scenario.threat} | ${SITE_NAME}` : topic ? `${topic.name}（解説） | ${SITE_NAME}` : SITE_NAME
  }, [scenario, topic])

  return (
    <div className="site">
      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" className="brand">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-mark">
              <path d="M3 7h12" />
              <path d="M9 17h12" />
              <circle cx="17" cy="7" r="2.5" />
              <circle cx="6" cy="17" r="2.5" />
            </svg>
            {SITE_NAME}
          </Link>
          <nav className="site-nav" aria-label="サイト内">
            <Link to="/book" aria-current={id.startsWith('book') ? 'page' : undefined}>
              教科書
            </Link>
          </nav>
        </div>
      </header>

      <main className={scenario ? 'wrap wide' : 'wrap'}>
        {scenario ? (
          <ScenarioView key={scenario.id} scenario={scenario} />
        ) : topic ? (
          <TopicView key={topic.id} topic={topic} />
        ) : chapter ? (
          <BookView key={chapter.id} chapter={chapter} />
        ) : isBookIndex ? (
          <BookIndex />
        ) : notFound ? (
          <div className="not-found">
            <h1>ページが見つかりません</h1>
            <p>URLが間違っているか、ページが移動した可能性があります。</p>
            <Link to="/">トップページへ戻る</Link>
          </div>
        ) : (
          <Home />
        )}
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>
            図中のIPアドレス、MACアドレス、ドメインは、説明用やプライベート用に予約されたもの（RFC 5737、RFC 1918、RFC 7042、RFC
            2606）で、実在のサーバを指しません。攻撃の解説は、仕組みと対策を理解するためのものです。
          </p>
          <ul className="footer-links">
            <li>
              <a href={REPOSITORY_URL} rel="noopener noreferrer" target="_blank">
                ソースコード（GitHub）
              </a>
            </li>
            <li>
              <a href={`${REPOSITORY_URL}/security/policy`} rel="noopener noreferrer" target="_blank">
                脆弱性の報告
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
