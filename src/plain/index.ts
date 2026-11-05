import type { Mode } from '../types'
import { dns, mail, sig, sqli, tls, web, xss } from './scenarios1'
import { apt, arp, ddos, sso, storage, supply, vpn, wlan } from './scenarios2'
import type { PlainTexts } from './types'

/**
 * 「ひとことで」の説明（キーはシナリオのID）。
 * 専門用語を使わずに、そのステップで起きていることを、たとえ話を交えて一文で言う。初めて学ぶ人向け。
 */
export const PLAIN: Readonly<Record<string, PlainTexts>> = { sig, dns, tls, mail, web, xss, sqli, sso, arp, wlan, apt, ddos, vpn, storage, supply }

export function plainText(scenarioId: string, mode: Mode, index: number): string | undefined {
  return PLAIN[scenarioId]?.[mode][index]
}
