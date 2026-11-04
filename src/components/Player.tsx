import type { SubStep } from '../playback/substeps'
import { SPEED_ORDER, SPEEDS, type Speed } from '../playback/speed'
import { TermText } from './TermText'

interface Props {
  playing: boolean
  /** ステップの最後の区切りまで進んだか */
  atEnd: boolean
  onToggle: () => void
  speed: Speed
  onSpeed: (speed: Speed) => void
  subs: readonly SubStep[]
  sub: number
  activeTerm: string | null
  onTerm: (termId: string) => void
}

function Icon({ name }: { name: 'play' | 'pause' | 'replay' }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="icon">
      {name === 'play' && <path className="fill" d="M4.5 2.8v10.4L13 8z" />}
      {name === 'pause' && <path className="fill" d="M4 3h3v10H4zM9 3h3v10H9z" />}
      {name === 'replay' && (
        <>
          <path className="stroke" d="M12.16 5.6A4.8 4.8 0 1 0 12.8 8" />
          <path className="fill" d="M10.66 3L13.72 4.7L10.6 6.5z" />
        </>
      )}
    </svg>
  )
}

/** 構成図の下に置く、再生の操作と「今どこで何が起きているか」の説明 */
export function Player({ playing, atEnd, onToggle, speed, onSpeed, subs, sub, activeTerm, onTerm }: Props) {
  const current = subs[sub]
  const [label, icon] = atEnd
    ? (['もう一度', 'replay'] as const)
    : playing
      ? (['一時停止', 'pause'] as const)
      : (['再生', 'play'] as const)
  return (
    <div className="player">
      <div className="player-bar">
        <button type="button" className="play-button" onClick={onToggle}>
          <Icon name={icon} />
          {label}
        </button>
        <div className="speeds" role="group" aria-label="再生の速さ">
          {SPEED_ORDER.map((s) => (
            <button key={s} type="button" aria-pressed={s === speed} onClick={() => onSpeed(s)}>
              {SPEEDS[s].label}
            </button>
          ))}
        </div>
        <span className="sub-count" aria-hidden="true">
          {sub + 1} / {subs.length}
        </span>
      </div>
      {current && (
        <p className={`caption k-${current.kind}`} aria-live="polite">
          <span className="visually-hidden">
            {sub + 1}番目（全{subs.length}）：
          </span>
          <TermText text={current.text} activeTerm={activeTerm} onTerm={onTerm} />
        </p>
      )}
    </div>
  )
}
