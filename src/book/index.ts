import { security } from './part0'
import { packet, ipport, tcpudp, dnshttps, fwdmz } from './part1'
import { sig, tls, sso } from './part2'
import { dns, mail } from './part3'
import { web, xss, sqli } from './part4'
import { arp, wlan, vpn } from './part5'
import { apt, ddos, storage, supply } from './part6'
import type { Chapter, PartId } from './types'

export const PARTS: readonly { id: PartId; title: string; lead: string }[] = [
  {
    id: 'intro',
    title: '情報セキュリティの基本',
    lead: '機密性・完全性・可用性と、それに加わる4つの特性。対策を「何を守るか」で整理する土台です。',
  },
  {
    id: 'basics',
    title: 'ネットワークの基礎',
    lead: 'パケット、アドレス、TCP・UDP、DNS・HTTPS、FWとDMZ。すべての章の土台です。',
  },
  {
    id: 'crypto',
    title: '暗号と認証',
    lead: 'ハッシュ・電子署名・証明書から、TLS、シングルサインオンまで。',
  },
  {
    id: 'name-mail',
    title: '名前解決とメール',
    lead: 'DNSの仕組みと攻撃、メールの送信元を確かめる仕組み。',
  },
  {
    id: 'web',
    title: 'Webアプリケーション',
    lead: 'セッション管理、XSS、SQLインジェクション。',
  },
  {
    id: 'lan',
    title: '社内ネットワークとリモートアクセス',
    lead: 'ARP、無線LAN、VPN。社内とその入口を守る仕組み。',
  },
  {
    id: 'ops',
    title: '組織を狙う攻撃と運用',
    lead: '標的型攻撃、DDoS、クラウドの設定ミス、サプライチェーン攻撃。',
  },
]

/** 読む順番どおりに並べる */
export const CHAPTERS: readonly Chapter[] = [
  security,
  packet,
  ipport,
  tcpudp,
  dnshttps,
  fwdmz,
  sig,
  tls,
  sso,
  dns,
  mail,
  web,
  xss,
  sqli,
  arp,
  wlan,
  vpn,
  apt,
  ddos,
  storage,
  supply,
]

export const bookPath = (id?: string) => (id ? `/book/${id}` : '/book')

export function findChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

/** 章の番号（1から） */
export function chapterNumber(id: string): number {
  return CHAPTERS.findIndex((c) => c.id === id) + 1
}
