import type { Scenario } from '../types'
import { arp } from './arp'
import { ddos } from './ddos'
import { dns } from './dns'
import { mail } from './mail'
import { sig } from './sig'
import { tls } from './tls'
import { vpn } from './vpn'
import { web } from './web'
import { xss } from './xss'

/** 表示する順番どおりに並べる */
export const scenarios: readonly Scenario[] = [sig, dns, tls, mail, web, xss, arp, ddos, vpn]

export function findScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id)
}
