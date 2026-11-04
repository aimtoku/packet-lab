import type { KeyboardEvent } from 'react'
import type { Mode, Scenario, Step } from '../types'
import { usePacketTravel } from '../hooks/usePacketTravel'

interface Props {
  scenario: Scenario
  mode: Mode
  index: number
  onSelect: (index: number) => void
  /** 選んでいる用語が出てくるステップ */
  marked: ReadonlySet<number>
  /** 今のステップが、区切りのどこまで進んだか（0〜1） */
  progress: number
  travelMs: number
}

const WIDTH = 360
const ROW_TOP = 86
const ROW_GAP = 46

export function Sequence({ scenario, mode, index, onSelect, marked, progress, travelMs }: Props) {
  const { actors } = scenario
  const steps = scenario.steps[mode]
  const margin = actors.length === 3 ? 62 : 46
  const boxWidth = actors.length === 3 ? 104 : 82
  const xOf = new Map(actors.map((a, i) => [a.id, margin + (i * (WIDTH - 2 * margin)) / (actors.length - 1)]))
  const height = ROW_TOP + steps.length * ROW_GAP - 8

  /** 阻止の印を置く位置（送信元で止めるときは送信元の近く、ほかは宛先の手前） */
  const crossX = (s: Step<string>, from: number, to: number) => {
    const d = to > from ? 1 : -1
    return s.blockedAt !== undefined && s.blockedAt === scenario.topology.map[s.from] ? from + d * 20 : to - d * 20
  }

  const step = steps[index]
  const y = ROW_TOP + index * ROW_GAP
  const x1 = step ? (xOf.get(step.from) ?? 0) : 0
  const x2 = step ? (xOf.get(step.to) ?? 0) : 0
  const end = step?.kind === 'blocked' ? crossX(step, x1, x2) : x2
  const packetPoints = step && x1 !== x2 ? ([[x1, y], [end, y]] as const) : []
  const stepKey = `${scenario.id}/${mode}/${index}`
  const ref = usePacketTravel(packetPoints, Math.abs(end - x1) * progress, travelMs, stepKey, `${stepKey}/${progress}`)

  const onKey = (i: number) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(i)
    }
  }

  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`${scenario.name}のシーケンス図`}>
      {actors.map((a) => {
        const x = xOf.get(a.id) ?? 0
        const dim = a.attacker && mode === 'normal'
        return (
          <g key={a.id} className={`actor${a.attacker ? ' attacker' : ''}${dim ? ' dim' : ''}`}>
            <line x1={x} x2={x} y1={52} y2={height} className="lifeline" />
            <rect x={x - boxWidth / 2} y={8} width={boxWidth} height={42} rx={7} />
            <text x={x} y={26} textAnchor="middle" className="actor-name">
              {a.name}
            </text>
            <text x={x} y={41} textAnchor="middle" className="actor-sub">
              {a.sub}
            </text>
          </g>
        )
      })}
      {steps.map((s, i) => {
        const rowY = ROW_TOP + i * ROW_GAP
        const from = xOf.get(s.from) ?? 0
        const to = xOf.get(s.to) ?? 0
        const state = (i > index ? ' future' : i === index ? ' current' : '') + (marked.has(i) ? ' has-term' : '')
        const d = to > from ? 1 : -1
        const tip = to - d * 3
        return (
          <g
            key={i}
            className={`seq-step k-${s.kind}${state}`}
            tabIndex={0}
            role="button"
            aria-label={`ステップ${i + 1}：${s.label}`}
            aria-current={i === index ? 'step' : undefined}
            onClick={() => onSelect(i)}
            onKeyDown={onKey(i)}
          >
            <rect className="hit" x={4} y={rowY - 26} width={WIDTH - 8} height={ROW_GAP - 4} rx={6} />
            {from === to ? (
              // 自分の中の処理は、折り返す矢印で表す。右側の登場人物は、はみ出さないよう左へ折り返す
              from > WIDTH / 2 ? (
                <>
                  <path className="arrow" d={`M${from},${rowY - 8} h-30 v16 h24`} />
                  <path className="head" d={`M${from - 1},${rowY + 8} l-7,-4 v8 z`} />
                  <text x={from - 36} y={rowY + 4} textAnchor="end" className="seq-label">
                    {s.label}
                  </text>
                </>
              ) : (
                <>
                  <path className="arrow" d={`M${from},${rowY - 8} h30 v16 h-24`} />
                  <path className="head" d={`M${from + 1},${rowY + 8} l7,-4 v8 z`} />
                  <text x={from + 36} y={rowY + 4} className="seq-label">
                    {s.label}
                  </text>
                </>
              )
            ) : (
              <>
                <line className="arrow" x1={from} y1={rowY} x2={tip - d * 7} y2={rowY} />
                <path className="head" d={`M${tip},${rowY} l${-d * 9},-4.5 v9 z`} />
                {s.kind === 'blocked' && (
                  <path
                    className="cross"
                    d={`M${crossX(s, from, to) - 5},${rowY - 5} l10,10 M${crossX(s, from, to) + 5},${rowY - 5} l-10,10`}
                  />
                )}
                <text x={(from + to) / 2} y={rowY - 7} textAnchor="middle" className="seq-label">
                  {s.label}
                </text>
              </>
            )}
            {marked.has(i) && <circle cx={13} cy={rowY - 9} r={3} className="term-dot" />}
            <text x={8} y={rowY + 3} className="seq-no">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        )
      })}
      {packetPoints.length > 0 && <circle ref={ref} r={4.5} className="seq-packet" cx={x1} cy={y} />}
    </svg>
  )
}
