import type { Learning } from '../learning/types'
import type { Scenario } from '../types'
import { TermText } from './TermText'

interface Props {
  scenario: Scenario
  learning: Learning
  activeTerm: string | null
  onTerm: (termId: string) => void
}

/** まとめ：学習目標、よくある誤解、対策の比較、午後の問題文の手がかり、論点 */
export function Summary({ scenario, learning, activeTerm, onTerm }: Props) {
  const { guide } = learning
  const text = (t: string) => <TermText text={t} activeTerm={activeTerm} onTerm={onTerm} />
  return (
    <div className="study">
      <section className="study-card" aria-labelledby="goals-title">
        <h2 id="goals-title">学習目標</h2>
        <ul className="goals">
          {guide.goals.map((g, i) => (
            <li key={i}>{text(g)}</li>
          ))}
        </ul>
        <h3 className="study-sub">前提となる知識</h3>
        <ul className="plain-list">
          {guide.prerequisites.map((p, i) => (
            <li key={i}>{text(p)}</li>
          ))}
        </ul>
      </section>

      <section className="study-card" aria-labelledby="miscon-title">
        <h2 id="miscon-title">よくある誤解</h2>
        <ul className="miscon">
          {guide.misconceptions.map((m, i) => (
            <li key={i}>
              <p className="wrong">
                <span className="mark" aria-label="誤り">
                  ✕
                </span>
                <span>{text(m.wrong)}</span>
              </p>
              <p className="right">
                <span className="mark" aria-label="正しくは">
                  ○
                </span>
                <span>{text(m.right)}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="study-card" aria-labelledby="compare-title">
        <h2 id="compare-title">{guide.comparison.title}</h2>
        <div className="table-scroll">
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">対策</th>
                <th scope="col">防げること</th>
                <th scope="col">防げないこと・注意</th>
                <th scope="col">どこで行うか</th>
              </tr>
            </thead>
            <tbody>
              {guide.comparison.rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{text(r.measure)}</th>
                  <td>{text(r.stops)}</td>
                  <td>{text(r.limits)}</td>
                  <td>{text(r.where)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="study-card" aria-labelledby="cues-title">
        <h2 id="cues-title">午後の問題文の手がかり</h2>
        <p className="study-note">問題文にこう書かれていたら、こう考えます。</p>
        <ul className="cues">
          {guide.cues.map((c, i) => (
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

      <section className="study-card" aria-labelledby="study-points-title">
        <h2 id="study-points-title">午後で押さえる論点</h2>
        <ul className="plain-list">
          {scenario.points.map((p, i) => (
            <li key={i}>{text(p)}</li>
          ))}
        </ul>
        <h3 className="study-sub">インシデント対応で押さえる論点</h3>
        <ul className="plain-list">
          {scenario.incidentPoints.map((p, i) => (
            <li key={i}>{text(p)}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
