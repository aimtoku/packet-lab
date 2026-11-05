import { actor, cell, fig, layers, link, list, m, map, mAdd, node, note, p, seq, table, zone } from './fig'
import type { Chapter } from './types'

// 第3部 名前解決とメール

const pc = actor('pc', 'PC', 'pc')
const cache = actor('cache', 'キャッシュDNS', 'server')
const auth = actor('auth', '権威DNS', 'server', { sub: 'example.net' })
const atk = actor('x', '攻撃者', 'laptop', { attacker: true })

export const dns: Chapter = {
  id: 'dns',
  part: 'name-mail',
  title: 'DNSのキャッシュポイズニングとDNSSEC',
  lead: 'キャッシュDNSに偽の答えを覚えさせると、利用者は正しい名前を入れても偽のサイトへ向かいます。キャッシュDNSが応答を受け入れる条件から、攻撃の手口、そして推測させない・受け付けない・署名で確かめる対策までを積み上げます。',
  sections: [
    {
      id: 'review',
      title: 'おさらい：キャッシュDNSと権威DNS',
      blocks: [
        p(
          '第4章で見たとおり、PCはキャッシュDNSに名前解決を頼み、キャッシュDNSは権威DNSに問い合わせて答えを得ます。答えはTTLの間キャッシュされ、同じ名前を聞いたほかの利用者にも返されます。',
        ),
        p('つまり、キャッシュに一度偽の答えが入ると、そのキャッシュDNSを使うすべての利用者が影響を受けます。'),
        fig(
          seq(
            [pc, cache, auth],
            [
              m('pc', 'cache', 'www.example.net は？'),
              m('cache', 'auth', '問合せ'),
              m('auth', 'cache', '192.0.2.80（TTL 3600秒）'),
              m('cache', 'cache', 'キャッシュに保存'),
              m('cache', 'pc', '192.0.2.80'),
            ],
          ),
          '答えはキャッシュされ、ほかの利用者にも返される',
        ),
      ],
      see: { mode: 'normal', step: 2, label: 'キャッシュDNSが権威DNSへ問合せ' },
    },
    {
      id: 'accept',
      title: '応答を受け入れる条件',
      blocks: [
        p(
          'DNSは主にUDPで、接続の手順がありません。キャッシュDNSは、届いた応答が自分の問合せに対するものかを、宛先ポート番号（問合せの送信元ポートと同じか）、16ビットのID（問合せと同じか）、問い合わせた名前で判断し、条件に合う最初の応答を受け入れます。',
        ),
        p('裏返すと、攻撃者がこれらを当てた偽の応答を、本物より先に届ければ、受け入れられてしまいます。'),
        fig(
          layers([
            'キャッシュDNSが照合する項目',
            [
              cell('l3', '送信元IP', '権威DNSか', { w: 1.1 }),
              cell('l4', '宛先ポート', '問合せと同じか', { w: 1.2, add: true }),
              cell('l7', 'ID', '16ビット', { w: 1, add: true }),
              cell('l7', '問い合わせた名前', undefined, { w: 1.3 }),
              cell('l7', '答え', 'IPアドレス', { w: 1.2 }),
            ],
          ]),
          '条件に合う最初の応答が受け入れられる',
        ),
        note('送信元IPアドレスはUDPでは簡単に偽れるので、権威DNSのふりをすること自体は難しくありません。'),
      ],
    },
    {
      id: 'kaminsky',
      title: 'カミンスキー型攻撃',
      blocks: [
        p(
          'すでにキャッシュにある名前は上書きしにくいので、攻撃者は「x7f3q.example.net」のように、存在しない名前を毎回変えて問い合わせます。キャッシュにないので、キャッシュDNSは必ず権威DNSに問い合わせに行きます。',
        ),
        p(
          'その隙に、攻撃者は権威DNSになりすまし、IDを変えながら大量の偽の応答を送ります。偽の応答には「example.net の権威DNSは攻撃者のサーバ」という情報を含めておき、一度当たれば、ドメイン全体を乗っ取れます。外れても、名前を変えて何度でも試せます。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), cache, auth],
            [
              mAdd('x', 'cache', 'x7f3q.example.net は？（毎回違う名前）', 'attack'),
              m('cache', 'auth', '問合せ（IDと送信元ポートを付けて）'),
              mAdd('x', 'cache', '偽の応答（権威DNSのふり、IDを変えて大量に）', 'attack'),
              m('auth', 'cache', '本物の応答（遅れて届く）', 'muted'),
              mAdd('cache', 'cache', 'IDが当たった偽の応答をキャッシュ', 'attack'),
            ],
          ),
          '存在しない名前で問合せを起こさせ、偽の応答を先に届ける',
        ),
      ],
      see: { mode: 'attack', step: 3, label: '権威DNSになりすました偽応答' },
    },
    {
      id: 'impact',
      title: '偽の答えが返ると',
      blocks: [
        p(
          'キャッシュに偽の情報が入った後は、利用者がいつもどおり正しい名前を入れても、キャッシュDNSは偽のIPアドレスを返します。利用者は偽のサイトへ接続し、IDやパスワードを入力してしまうおそれがあります。',
        ),
        p('HTTPSで証明書を正しく検証していれば、偽のサイトは正しい証明書を出せないので警告が出ます。DNSの対策とTLSの対策は、重ねて効きます。'),
        fig(
          seq(
            [
              pc,
              cache,
              actor('fake', '偽サイト', 'server', {
                attacker: true,
                add: true,
              }),
            ],
            [
              m('pc', 'cache', 'www.example.net は？'),
              mAdd('cache', 'pc', '偽のIPアドレス', 'attack'),
              mAdd('pc', 'fake', '偽サイトに接続してしまう', 'attack'),
            ],
          ),
          '利用者は正しい名前を入れても、偽サイトへ案内される',
        ),
      ],
      see: { mode: 'attack', step: 6, label: '偽のIPアドレスが返る' },
    },
    {
      id: 'mitigate',
      title: '対策1：受け付けない・推測させない',
      blocks: [
        p(
          'まず、キャッシュDNSが外部からの再帰問合せを受け付けないようにします（オープンリゾルバにしない）。社内の利用者からの問合せだけを受け付ければ、外部の攻撃者は問合せを起こさせることができません。',
        ),
        p(
          '次に、問合せの送信元ポート番号を毎回ランダムにします。IDの16ビットに加えて、ポート番号も当てなければならなくなるので、偽の応答が当たる確率は大きく下がります。',
        ),
        fig(
          layers(
            ['対策前：当てるもの', [cell('l7', 'ID', '65,536通り', { w: 2 }), cell('l4', '送信元ポート', '固定（分かっている）', { w: 2 })]],
            [
              '対策後：当てるもの',
              [
                cell('l7', 'ID', '65,536通り', { w: 2 }),
                cell('l4', '送信元ポート', 'ランダム（数万通り）', {
                  w: 2,
                  add: true,
                }),
              ],
            ],
          ),
          '送信元ポートのランダム化で、当てる組み合わせが大きく増える',
        ),
        fig(
          map(
            4,
            2,
            [
              node('x', '攻撃者', 'laptop', 0, 0, { attacker: true }),
              node('fw', 'FW', 'fw', 1, 0),
              node('cache', 'キャッシュDNS', 'server', 2, 1),
              node('pc', 'PC', 'pc', 3, 1),
            ],
            [
              link('x', 'fw', {
                arrow: true,
                tone: 'blocked',
                label: '外部から：拒否',
                add: true,
              }),
              link('fw', 'cache'),
              link('pc', 'cache', {
                arrow: true,
                tone: 'defense',
                label: '社内からだけ受け付ける',
              }),
            ],
            [zone('社内', 1.6, 0.6, 2.4, 1.4)],
          ),
          'キャッシュDNSは、社内からの問合せだけを受け付ける',
        ),
      ],
      see: { mode: 'defense', step: 2, label: '送信元ポートをランダムにする' },
    },
    {
      id: 'dnssec',
      title: '対策2：署名で確かめる（DNSSEC）',
      blocks: [
        p(
          '当たりにくくするだけでなく、応答が本物かを確かめるのがDNSSECです。権威DNSは、応答のレコードに自分の秘密鍵で署名（RRSIG）を付けます。キャッシュDNSは、権威DNSの公開鍵（DNSKEY）で署名を検証します。',
        ),
        p(
          'その公開鍵が本物かは、上位のゾーン（.net）に登録したハッシュ値（DSレコード）で確かめ、さらにその上へと、ルートまで信頼の連鎖をたどります。署名を作れない攻撃者の偽の応答は、検証に失敗して捨てられます。',
        ),
        fig(
          seq(
            [atk, cache, auth],
            [
              m('x', 'cache', '偽の応答（署名がない・正しくない）', 'attack'),
              mAdd('cache', 'cache', '署名の検証に失敗 → 捨てる', 'defense'),
              mAdd('auth', 'cache', '本物の応答 ＋ 署名（RRSIG）', 'defense'),
              mAdd('cache', 'cache', 'DNSKEYで検証、DSで鍵を確かめる', 'defense'),
            ],
          ),
          'DNSSECでは、署名を検証できた応答だけを受け入れる',
        ),
        table(
          ['対策', '防げること', '限界'],
          ['オープンリゾルバにしない', '外部からの問合せの誘発', '内部の感染端末からの問合せは防げない'],
          ['送信元ポートのランダム化', '偽の応答が当たる確率を下げる', '確率を下げるだけ'],
          ['DNSSEC', '偽の応答の受け入れ', '権威側の署名と、キャッシュ側の検証の両方が必要。通信の暗号化はしない'],
        ),
      ],
      see: { mode: 'defense', step: 4, label: '署名付きの正規応答' },
    },
  ],
}

const mtaS = node('smta', '送信MTA', 'server', 1, 0, { sub: 'example.co.jp' })
const mtaR = node('rmta', '受信MTA', 'server', 3, 0, { sub: '取引先' })
const smta = actor('smta', '送信MTA', 'server', { sub: 'example.co.jp' })
const rmta = actor('rmta', '受信MTA', 'server', { sub: '取引先' })
const dnsA = actor('dns', 'DNS', 'server', { sub: 'example.co.jp', add: true })

export const mail: Chapter = {
  id: 'mail',
  part: 'name-mail',
  title: 'メールの送信と送信ドメイン認証',
  lead: 'メールの差出人は、実は簡単に偽れます。メールが届くまでの流れと2つの差出人から始めて、SPF・DKIM・DMARCで「本当にそのドメインから送られたか」を確かめる仕組みを積み上げます。',
  sections: [
    {
      id: 'delivery',
      title: 'メールが届くまで',
      blocks: [
        p(
          'メールソフトは、自社の送信用サーバ（MTA）にサブミッションポート（587番）で認証してメールを渡します。送信MTAは、宛先のドメインのMXレコードをDNSで調べ、受信MTAへSMTP（25番）で届けます。受信者は、IMAPなどで自分のメールを読みます。',
        ),
        fig(
          map(
            5,
            1,
            [node('s', '送信者', 'pc', 0, 0), mtaS, node('net', 'インターネット', 'cloud', 2, 0), mtaR, node('r', '受信者', 'pc', 4, 0)],
            [
              link('s', 'smta', { arrow: true, label: '587（認証）' }),
              link('smta', 'net', { arrow: true, label: '25' }),
              link('net', 'rmta', { arrow: true }),
              link('rmta', 'r', { arrow: true, label: 'IMAPS' }),
            ],
          ),
          'メールは、送信MTAから受信MTAへSMTPで届けられる',
        ),
        note('SMTPそのものには、送信者が本当にそのドメインの人かを確かめる仕組みがありません。これが、差出人を偽れる理由です。'),
      ],
      see: { mode: 'normal', step: 1, label: '正規のメールを送信' },
    },
    {
      id: 'two-from',
      title: '2つの差出人',
      blocks: [
        p(
          'メールには、配送のための封筒にあたるエンベロープの差出人（MAIL FROM、エラーメールの返送先）と、本文の先頭に書くヘッダの差出人（From:）があります。メールソフトに表示されるのはヘッダのFromです。',
        ),
        p(
          'この2つは別々に書けて、どちらも偽れます。後で見るように、SPFはエンベロープの差出人のドメインを、DKIMは署名に書いたドメインを確かめます。利用者に見えるヘッダのFromとの対応を確かめるのがDMARCです。',
        ),
        fig(
          layers(
            ['エンベロープ（SMTPのやり取り）', [cell('l7', 'MAIL FROM', 'bounce@example.co.jp', { w: 2 }), cell('l7', 'RCPT TO', '宛先', { w: 1.5 })]],
            [
              'メールの中身',
              [
                cell('l7', 'From:', '経理部 <billing@example.co.jp>', {
                  w: 2,
                  add: true,
                }),
                cell('l7', '件名', undefined, { w: 1 }),
                cell('l7', '本文', undefined, { w: 2 }),
              ],
            ],
          ),
          '利用者に見えるのは、ヘッダのFrom',
        ),
      ],
    },
    {
      id: 'spf',
      title: 'SPF：送信元のIPアドレスを確かめる',
      blocks: [
        p(
          'SPFでは、ドメインの管理者が「このドメインのメールは、これらのIPアドレスから送る」という一覧を、DNSのTXTレコードに登録します。受信MTAは、エンベロープの差出人のドメインのSPFレコードを調べ、接続してきたIPアドレスが一覧にあるかを確かめます。',
        ),
        fig(
          seq(
            [smta, rmta, dnsA],
            [
              m('smta', 'rmta', 'MAIL FROM: bounce@example.co.jp'),
              mAdd('rmta', 'dns', 'example.co.jp のSPFレコードは？'),
              mAdd('dns', 'rmta', 'v=spf1 ip4:203.0.113.25 -all'),
              mAdd('rmta', 'rmta', '接続元IPが一覧にある → SPF成功', 'defense'),
            ],
          ),
          'SPFは、接続元のIPアドレスが送信を許されているかを確かめる',
        ),
        note('メールを転送すると、転送したサーバのIPアドレスから送られるので、SPFは失敗しやすくなります。'),
      ],
      see: { mode: 'normal', step: 2, label: '受信MTAがDNSに問い合わせる' },
    },
    {
      id: 'dkim',
      title: 'DKIM：電子署名で確かめる',
      blocks: [
        p(
          'DKIMでは、送信MTAがメールのヘッダと本文から電子署名を作り、DKIM-Signatureヘッダとして付けます。署名にはドメイン（d=）と鍵の名前（セレクタ）を書き、公開鍵はDNSに登録しておきます。',
        ),
        p('受信MTAは、DNSから公開鍵を取り出して署名を検証します。転送されても署名は残るので、内容が書き換えられていなければ成功します。'),
        fig(
          seq(
            [smta, rmta, dnsA],
            [
              mAdd('smta', 'smta', '秘密鍵で署名（d=example.co.jp）'),
              mAdd('smta', 'rmta', '署名付きのメール'),
              mAdd('rmta', 'dns', 'セレクタの公開鍵は？'),
              m('dns', 'rmta', '公開鍵'),
              mAdd('rmta', 'rmta', '署名を検証 → DKIM成功', 'defense'),
            ],
          ),
          'DKIMは、送信MTAの署名をDNSの公開鍵で検証する',
        ),
      ],
    },
    {
      id: 'dmarc',
      title: 'DMARC：ヘッダのFromと突き合わせる',
      blocks: [
        p(
          'SPFやDKIMが成功しても、それが利用者に見えるヘッダのFromと同じドメインについての結果でなければ意味がありません。DMARCは、SPFやDKIMで確かめたドメインと、ヘッダのFromのドメインが一致しているか（アライメント）を確かめます。',
        ),
        p(
          'ドメインの管理者は、DMARCのポリシー（認証に失敗したメールを、受け取る none／隔離する quarantine／拒否する reject）と、結果を報告してもらう宛先をDNSに登録します。',
        ),
        fig(
          seq(
            [smta, rmta, dnsA],
            [
              m('smta', 'rmta', 'メール（From: billing@example.co.jp）'),
              m('rmta', 'rmta', 'SPF・DKIMを確かめる'),
              mAdd('rmta', 'dns', '_dmarc.example.co.jp は？'),
              mAdd('dns', 'rmta', 'p=reject、報告先'),
              mAdd('rmta', 'rmta', 'Fromのドメインと一致するか → 受信', 'defense'),
            ],
          ),
          'DMARCは、認証の結果とヘッダのFromを突き合わせ、失敗時の扱いを決める',
        ),
        table(
          ['仕組み', '確かめるもの', 'DNSに登録するもの'],
          ['SPF', '接続元IPアドレス（エンベロープの差出人のドメイン）', '送信を許すIPアドレス'],
          ['DKIM', 'メールの電子署名（d= のドメイン）', '署名の公開鍵'],
          ['DMARC', 'SPF・DKIMのドメインとヘッダのFromの一致', '失敗時の扱い（none／quarantine／reject）と報告先'],
        ),
      ],
      see: { mode: 'normal', step: 4, label: 'DMARCポリシーを確認' },
    },
    {
      id: 'bec',
      title: 'ビジネスメール詐欺（BEC）と対策',
      blocks: [
        p(
          '攻撃者は、取引先や自社の経営者になりすましたメールで、偽の口座への送金を求めます（BEC）。送信ドメイン認証を設定していないドメインは、Fromを詐称されても受信側で見分けられません。',
        ),
        p(
          '自社のドメインにSPF・DKIM・DMARC（最終的には p=reject）を設定すれば、自社を名乗る偽メールを受信側で拒否してもらえます。ただし、よく似た別のドメインを使われると防げないので、送金先の変更などは、メール以外の方法（電話など）で確かめる手順を決めておきます。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), rmta, actor('dns', 'DNS', 'server', { sub: 'example.co.jp' })],
            [
              mAdd('x', 'rmta', 'From: billing@example.co.jp（詐称）', 'attack'),
              m('rmta', 'dns', 'SPF・DMARCは？'),
              mAdd('dns', 'rmta', '登録なし → 判断できない', 'attack'),
              mAdd('rmta', 'rmta', '偽メールが受信箱に届く', 'attack'),
            ],
          ),
          '送信ドメイン認証を設定していないと、詐称を見分けられない',
        ),
        list(
          '自社ドメインに SPF・DKIM・DMARC を設定し、報告を見ながら p=reject へ進める',
          '送金先の変更は、メール以外の連絡先で確かめる',
          'メールを送らないドメインにも、「送信しない」SPF（v=spf1 -all）を設定する',
        ),
      ],
      see: { mode: 'defense', step: 4, label: '受信MTAが拒否' },
    },
  ],
}
