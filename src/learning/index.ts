import { apt } from './apt'
import { arp } from './arp'
import { ddos } from './ddos'
import { dns } from './dns'
import { mail } from './mail'
import { sig } from './sig'
import { sqli } from './sqli'
import { sso } from './sso'
import { storage } from './storage'
import { supply } from './supply'
import { tls } from './tls'
import type { Learning } from './types'
import { vpn } from './vpn'
import { web } from './web'
import { wlan } from './wlan'
import { xss } from './xss'

/** シナリオごとの、学習の手引きと確認問題（キーはシナリオのID） */
export const LEARNING: Readonly<Record<string, Learning>> = { sig, dns, tls, mail, web, xss, sqli, sso, arp, wlan, apt, ddos, vpn, storage, supply }

/** 選択肢の記号（試験と同じ ア・イ・ウ・エ） */
export const CHOICE_MARKS = ['ア', 'イ', 'ウ', 'エ'] as const

/** 字数（空白を除き、全角・半角を問わず1文字を1字と数える） */
export const countChars = (s: string) => [...s.replace(/\s/g, '')].length
