import { TERMS } from '../glossary/terms'
import { Link } from '../router'
import { scenarios } from '../scenarios'

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
        </ol>
        <p className="howto-note">
          シナリオの画面では、用語一覧（{TERMS.length}語）の用語を押すと、その用語が出てくるステップに図と説明が移動します。
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
    </div>
  )
}
