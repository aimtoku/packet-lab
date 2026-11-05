import type { ReactNode } from 'react'
import type { Layer, Scenario, Step } from '../types'
import { TermText } from './TermText'

interface Props {
  scenario: Scenario
  step: Step<string>
  activeTerm: string | null
  onTerm: (termId: string) => void
}

/** 層の見出しの1行。例：「IP　PC 192.168.1.10 → キャッシュDNS 192.168.1.53」 */
interface HeaderLine {
  name: string
  addr: string
}

interface Header {
  layer: Layer
  tag: string
  lines: HeaderLine[]
}

const withAddress = (name: string, address?: string) => (address ? `${name} ${address}` : name)
const ports = (src?: string, dst?: string) => `ポート ${src ?? '—'} → ${dst ?? '—'}`

/** パケットの外側（Ethernet）から内側（中身）へ、層の見出しを並べる */
function headersOf(step: Step<string>, fromName: string, toName: string): Header[] {
  const w = step.wire
  if (!w) return []
  const list: Header[] = []
  if (w.srcMac || w.dstMac || w.l2) {
    list.push({ layer: 'l2', tag: 'L2', lines: [{ name: w.l2 ?? 'Ethernet', addr: `${w.srcMac ?? '—'} → ${w.dstMac ?? '—'}` }] })
  }
  if (w.l2Secure) list.push({ layer: 'sec', tag: '暗号化', lines: [{ name: w.l2Secure, addr: 'ここから内側は暗号化（無線の区間）' }] })
  if (w.tunnel) {
    const t = w.tunnel
    const lines: HeaderLine[] = [
      { name: 'IP（外側）', addr: `${withAddress(t.srcName ?? fromName, t.srcIp)} → ${withAddress(t.dstName ?? toName, t.dstIp)}` },
    ]
    if (t.transport) lines.push({ name: t.transport, addr: ports(t.srcPort, t.dstPort) })
    lines.push({ name: t.name, addr: 'ここから内側は暗号化' })
    list.push({ layer: 'tunnel', tag: 'トンネル', lines })
  }
  if (!w.noIp) {
    list.push({
      layer: 'l3',
      tag: 'L3',
      lines: [
        {
          name: w.tunnel ? 'IP（内側）' : 'IP',
          addr: `${withAddress(w.srcName ?? fromName, w.srcIp)} → ${withAddress(w.dstName ?? toName, w.dstIp)}`,
        },
      ],
    })
  }
  if (w.transport) list.push({ layer: 'l4', tag: 'L4', lines: [{ name: w.transport, addr: ports(w.srcPort, w.dstPort) }] })
  if (w.secure) list.push({ layer: 'sec', tag: '暗号化', lines: [{ name: w.secure, addr: 'ここから内側は暗号化' }] })
  return list
}

/** 1つのステップのパケットを、層ごとに入れ子の箱で表す */
export function PacketLayers({ scenario, step, activeTerm, onTerm }: Props) {
  const actorName = (id: string) => scenario.actors.find((a) => a.id === id)?.name ?? id
  const self = step.from === step.to
  const headers = headersOf(step, actorName(step.from), actorName(step.to))
  const focus = new Set<Layer>(step.wire?.focus ?? [])
  const text = (t: string) => <TermText text={t} activeTerm={activeTerm} onTerm={onTerm} />

  const fields = (
    <div className="fields">
      <table>
        <tbody>
          {step.fields.map(([key, value], i) => (
            <tr key={i}>
              <th scope="row">{text(key)}</th>
              <td>{text(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (!step.wire) {
    return (
      <section className="packet-section" aria-labelledby="packet-title">
        <h3 id="packet-title" className="sub-title">
          {step.kind === 'response' ? '対応の内容' : self ? '処理の内容' : 'パケットの中身'}
        </h3>
        {fields}
      </section>
    )
  }

  const focusTag = (layer: Layer) =>
    focus.has(layer) && (
      <span className="layer-focus" aria-label="注目する層">
        注目
      </span>
    )

  const box = (i: number): ReactNode => {
    const header = headers[i]
    if (!header) {
      return (
        <div className={`layer l-l7${focus.has('l7') ? ' focus' : ''}`}>
          <p className="layer-head">
            <span className="layer-name">{text(step.wire!.app)}</span>
            <span className="layer-tag">中身</span>
            {focusTag('l7')}
          </p>
          {fields}
        </div>
      )
    }
    return (
      <div className={`layer l-${header.layer}${focus.has(header.layer) ? ' focus' : ''}`}>
        {header.lines.map((line, j) => (
          <p className="layer-head" key={j}>
            <span className="layer-name">{text(line.name)}</span>
            {j === 0 && <span className="layer-tag">{header.tag}</span>}
            {j === 0 && focusTag(header.layer)}
            <span className="layer-addr">{line.addr}</span>
          </p>
        ))}
        {box(i + 1)}
      </div>
    )
  }

  return (
    <section className="packet-section" aria-labelledby="packet-title">
      <h3 id="packet-title" className="sub-title">
        パケットの中身<span className="sub-title-note">外側から順に、層ごとの見出し</span>
      </h3>
      <div className="layers">{box(0)}</div>
      {step.wire.remark && <p className="layer-remark">{text(step.wire.remark)}</p>}
    </section>
  )
}
