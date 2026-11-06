import { actor, cell, fig, layers, link, m, map, mAdd, node, note, p, seq, table } from './fig'
import type { Chapter } from './types'

// 第4部 名前解決とメール（メールの暗号化）

const mta = actor('mta', '送信MTA', 'server', { sub: '自社' })
const rcv = actor('rcv', '受信MTA', 'server', { sub: '取引先' })

export const mailenc: Chapter = {
  id: 'mailenc',
  part: 'name-mail',
  title: 'メールの暗号化：STARTTLS・MTA-STS・S/MIME',
  lead: 'メールの暗号化には、通信の区間を守るものと、メールそのものを守るものがあります。この章では、メールサーバ間のSTARTTLSの弱点と、それを補う仕組みを積み上げます。',
  sections: [
    {
      id: 'starttls',
      title: 'STARTTLS：途中からTLSに切り替える',
      blocks: [
        p(
          'メールサーバ（MTA）同士は、25番ポートのSMTPで、最初は暗号化せずに通信を始めます。受信MTAが「STARTTLSに対応している」と伝えたら、送信MTAはTLSに切り替えてからメールを送ります。',
        ),
        p('相手が対応していなければ、暗号化せずに送ります。届くことを優先するこの方式を、日和見的な暗号化といいます。'),
        fig(
          seq(
            [mta, rcv],
            [
              m('mta', 'rcv', 'EHLO（平文）'),
              m('rcv', 'mta', '250-STARTTLS（平文）'),
              m('mta', 'rcv', 'STARTTLS → TLSのハンドシェイク', 'defense'),
              m('mta', 'rcv', 'メール（TLSで暗号化）', 'defense'),
            ],
          ),
          'STARTTLS：平文で始め、途中からTLSに切り替える',
        ),
      ],
      see: { mode: 'normal', step: 2, label: '受信MTAが、STARTTLSに対応していると伝える' },
    },
    {
      id: 'range',
      title: 'TLSが守るのは区間だけ',
      blocks: [
        p(
          'メールは、メールソフト → 送信MTA → 受信MTA → 受信者のメールソフト と、いくつもの区間を通ります。TLSは区間ごとの暗号化なので、メールサーバの中では、メールは平文で扱われ、保存されます。',
        ),
        fig(
          map(
            4,
            1,
            [
              node('pc', '送信者', 'pc', 0, 0),
              node('mta', '送信MTA', 'server', 1, 0, { sub: '中は平文', add: true }),
              node('rcv', '受信MTA', 'server', 2, 0, { sub: '中は平文', add: true }),
              node('rpc', '受信者', 'pc', 3, 0),
            ],
            [
              link('pc', 'mta', { label: 'TLS（587番）', tone: 'defense', arrow: true }),
              link('mta', 'rcv', { label: 'STARTTLS（25番）', tone: 'defense', arrow: true }),
              link('rcv', 'rpc', { label: 'TLS（IMAP）', tone: 'defense', arrow: true }),
            ],
          ),
          'TLSは区間ごと：サーバの中では平文',
        ),
      ],
    },
    {
      id: 'downgrade',
      title: 'ダウングレード攻撃：STARTTLSの表示を消す',
      blocks: [
        p(
          'STARTTLSの表示は、暗号化の前の平文でやり取りされます。経路上の攻撃者がこの表示を消すと、送信MTAは「相手は暗号化に対応していない」と判断し、平文で送ってしまいます。攻撃者は中身を読んでから受信MTAに渡すので、だれも気付きません。',
        ),
        fig(
          seq(
            [mta, actor('atk', '攻撃者', 'laptop', { attacker: true, sub: '経路上' }), rcv],
            [
              m('rcv', 'atk', '250-STARTTLS'),
              mAdd('atk', 'mta', 'STARTTLSの行を消して渡す', 'attack'),
              mAdd('mta', 'atk', '平文でメールを送る（読まれる）', 'attack'),
              mAdd('atk', 'rcv', 'そのまま転送', 'attack'),
            ],
          ),
          'STARTTLSストリッピング：暗号化なしに落とさせる',
        ),
      ],
      see: { mode: 'attack', step: 2, label: '経路上で、STARTTLSの表示を消される' },
    },
    {
      id: 'mtasts',
      title: 'MTA-STS：TLSを必須にする',
      blocks: [
        p(
          'MTA-STSでは、受信側のドメインが「TLSを必須にする」方針と、正しい受信MTAの名前を公開します。方針があることはDNSのTXTレコードで、方針そのものはHTTPSのWebサーバに置いたファイルで示します。',
        ),
        p(
          '送信MTAは方針をHTTPSで取得して覚えておき、TLSを確立できない相手や、証明書の名前が合わない相手には送りません。方針はサーバ証明書で守られた通信で取得するので、経路上で書き換えられません。失敗は、TLS-RPTで受信側に報告されます。',
        ),
        fig(
          seq(
            [mta, actor('pol', '方針のWebサーバ', 'server', { sub: 'mta-sts.partner.example', add: true }), rcv],
            [
              mAdd('mta', 'pol', '方針をHTTPSで取得', 'defense'),
              mAdd('pol', 'mta', 'mode: enforce、mx: mx.partner.example', 'defense'),
              mAdd('mta', 'rcv', 'TLS必須・証明書の名前を検証して送る', 'defense'),
            ],
          ),
          'MTA-STS：方針をHTTPSで取得し、TLSを必須にする',
        ),
        note('DNSSECで受信MTAの証明書の情報を公開し、TLSを必須にするDANEという方法もあります。'),
      ],
      see: { mode: 'defense', step: 3, label: 'STARTTLSを消されても、平文では送らない' },
    },
    {
      id: 'smime',
      title: 'S/MIME：メールそのものを暗号化する',
      blocks: [
        p(
          'S/MIMEは、送信者のメールソフトで本文と添付ファイルを暗号化し、受信者のメールソフトで復号します。途中のメールサーバの中でも読まれません（エンドツーエンドの暗号化）。',
        ),
        p('暗号化には受信者の公開鍵（証明書）を、署名には送信者の秘密鍵を使います。証明書の代わりに、利用者同士で公開鍵を信頼し合うPGPもあります。'),
        fig(
          layers(
            ['TLSだけ（サーバの中）', [cell('l7', 'ヘッダ', 'From・To・件名'), cell('l7', '本文・添付', '平文', { w: 2 })]],
            [
              'S/MIME',
              [
                cell('l7', 'ヘッダ', 'From・To・件名'),
                cell('sec', '本文・添付', '受信者の公開鍵で暗号化', { w: 2, enc: true, add: true }),
                cell('sec', '署名', '送信者の秘密鍵', { add: true }),
              ],
            ],
          ),
          'S/MIME：サーバの中でも本文は暗号化されたまま',
        ),
        note('件名などのヘッダは、S/MIMEでも暗号化されないことがあります。件名に機密を書かないようにします。'),
      ],
      see: { mode: 'defense', step: 1, label: '機密のメールは、S/MIMEで暗号化して署名する' },
    },
    {
      id: 'choose',
      title: '守りたいものに合わせて選ぶ',
      blocks: [
        table(
          ['方式', '守るもの', '守れないもの'],
          ['STARTTLS（日和見的）', '経路上の受動的な盗聴', 'ダウングレード攻撃、サーバの中'],
          ['MTA-STS・DANE', 'ダウングレード攻撃、偽の受信MTA', 'サーバの中'],
          ['S/MIME・PGP', '経路とサーバの中の盗み見、改ざん、なりすまし', '件名などのヘッダ（暗号化されないことがある）'],
          ['SPF・DKIM・DMARC', '送信元のなりすまし', '中身の盗み見（暗号化ではない）'],
        ),
        note(
          'パスワード付きのZIPファイルと、そのパスワードを同じメールの経路で続けて送る方法は、同じ経路で両方を盗まれるので、効果が限られます。機密のファイルは、S/MIMEや、アクセスを制御できるファイル共有サービスで渡します。',
        ),
      ],
    },
  ],
}
