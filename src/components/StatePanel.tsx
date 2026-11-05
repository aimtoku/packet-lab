import type { StateView } from '../playback/state'
import { TermText } from './TermText'

interface Props {
  views: readonly StateView[]
  activeTerm: string | null
  onTerm: (termId: string) => void
}

/** 機器の中の状態（ARPテーブル、DNSのキャッシュなど）。パケットが届くと書き換わる */
export function StatePanel({ views, activeTerm, onTerm }: Props) {
  if (views.length === 0) return null
  const text = (t: string) => <TermText text={t} activeTerm={activeTerm} onTerm={onTerm} />
  return (
    <section className="panel state" aria-labelledby="state-title">
      <h2 id="state-title" className="panel-label">
        機器の中の状態
      </h2>
      <div className="state-tables">
        {views.map((v) => (
          <div className="state-table" key={v.id}>
            <h3>{text(v.title)}</h3>
            <table>
              <thead>
                <tr>
                  <th scope="col">{v.columns[0]}</th>
                  <th scope="col">{v.columns[1]}</th>
                </tr>
              </thead>
              <tbody>
                {v.rows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="state-empty">
                      まだ何も記録されていません
                    </td>
                  </tr>
                ) : (
                  v.rows.map((r) => (
                    <tr key={r.key} className={`${r.tone ? `t-${r.tone}` : ''}${r.changedNow ? ' changed' : ''}`}>
                      <th scope="row">{text(r.key)}</th>
                      <td>
                        {text(r.value)}
                        {r.changedNow && <span className="changed-tag">更新</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  )
}
