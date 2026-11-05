import { TERMS } from '../glossary/terms'
import { Link } from '../router'
import { scenarios } from '../scenarios'
import { TOPICS, topicPath } from '../topics'

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">情報処理安全確保支援士 · 通信と攻撃</p>
        <h1>パケット攻防ラボ</h1>
        <p className="lead">
          通信の流れの上に、攻撃がどこで割り込み、どの対策がどこで止めるのかを重ねて、パケット単位で追いかける学習サイトです。
        </p>
      </section>

      <section className="howto" aria-labelledby="howto-title">
        <h2 id="howto-title">見かた</h2>
        <ol>
          <li>
            <span className="dot k-normal" aria-hidden="true" />
            <strong>正常</strong>：ふだんの通信が、どの機器をどの順に通るか
          </li>
          <li>
            <span className="dot k-attack" aria-hidden="true" />
            <strong>攻撃</strong>：攻撃者がどこにいて、どのステップに割り込むか
          </li>
          <li>
            <span className="dot k-defense" aria-hidden="true" />
            <strong>対策</strong>：どの機器のどの仕組みで、攻撃が止まるか
          </li>
          <li>
            <span className="dot k-incident" aria-hidden="true" />
            <strong>事後対応</strong>：攻撃が成功してしまったとき、CSIRTがどの機器で何をするか（検知から再発防止まで）
          </li>
        </ol>
        <p className="howto-note">
          再生すると、パケットが機器に着くたびに止まって、そこで何が起きているか、パケットの中身、機器の中の状態（ARPテーブルやDNSのキャッシュなど）の変化を説明します。
        </p>
        <p className="howto-note">
          図解のあとは「まとめ」で学習目標・よくある誤解・対策の比較を確かめ、「確認問題」で午前（4択）と午後（記述）の形式の問題に取り組めます。
        </p>
        <p className="howto-note">
          シナリオの画面では、用語一覧（{TERMS.length}語）の用語を押すと、その用語が出てくるステップに図と説明が移動します。
        </p>
        <p className="howto-note">
          リスクマネジメント、CSIRTの体制、脆弱性管理、法令、監査など、通信の図にしにくい分野は「解説」のページにまとめています。
        </p>
      </section>

      <section aria-labelledby="list-title">
        <h2 id="list-title" className="section-title">
          シナリオ
        </h2>
        <ul className="cards">
          {scenarios.map((s) => (
            <li key={s.id}>
              <Link to={`/${s.id}`} className="card">
                <span className="card-threat">{s.threat}</span>
                <span className="card-name">{s.name}</span>
                <span className="card-text">{s.summary.attack}</span>
                <span className="card-meta">
                  {s.steps.normal.length + s.steps.attack.length + s.steps.defense.length} ステップ
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="topics-title">
        <h2 id="topics-title" className="section-title">
          解説
        </h2>
        <ul className="cards">
          {TOPICS.map((t) => (
            <li key={t.id}>
              <Link to={topicPath(t.id)} className="card">
                <span className="card-kind">解説</span>
                <span className="card-name">{t.name}</span>
                <span className="card-text">{t.lead}</span>
                <span className="card-meta">{t.sections.map((s) => s.title).join(' · ')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
