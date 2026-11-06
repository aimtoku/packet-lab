import { actor, fig, link, list, m, map, mAdd, node, note, p, seq, table, zone } from './fig'
import type { Chapter } from './types'

// 第5部 Webアプリケーション（SSRF）

const user = actor('user', '会員', 'pc')
const web = actor('web', 'Webアプリ', 'server')
const img = actor('img', '画像サイト', 'server')
const api = actor('api', '内部API', 'server')
const atk = actor('atk', '攻撃者', 'pc', { attacker: true })

export const ssrf: Chapter = {
  id: 'ssrf',
  part: 'web',
  title: 'SSRF：サーバを踏み台にする',
  lead: 'サーバが、利用者の指定したURLにアクセスする機能があります。この章では、その機能を悪用して、外部から届かない内部のサーバにアクセスさせるSSRFと、その対策を積み上げます。',
  sections: [
    {
      id: 'fetch',
      title: 'サーバがURLにアクセスする機能',
      blocks: [
        p(
          'プロフィール画像をURLで指定すると、Webアプリ（サーバ）がそのURLへ画像を取りに行きます。このとき通信するのは、利用者のブラウザではなくサーバです。Webhookの送信、URLのプレビュー、WebページのPDF化なども、同じ形の機能です。',
        ),
        fig(
          seq([user, web, img], [m('user', 'web', '画像のURL'), m('web', 'img', 'サーバが画像を取りに行く'), m('web', 'user', '画像を表示')]),
          'URLを指定して、サーバに取得させる機能',
        ),
      ],
      see: { mode: 'normal', step: 2, label: 'サーバが、そのURLにアクセスする' },
    },
    {
      id: 'position',
      title: 'サーバの位置からは、内部が見える',
      blocks: [
        p(
          '公開Webサーバは、DMZに置かれています。外部からDMZの内部API（社内向け）への通信はFWで止めていますが、同じDMZにあるWebサーバからは、FWを通らずに内部APIへ届きます。',
        ),
        p('「外部からは届かないから」と、内部APIに認証をかけていないことがよくあります。'),
        fig(
          map(
            4,
            1,
            [
              node('atk', '攻撃者', 'pc', 0, 0, { attacker: true }),
              node('fw', 'FW', 'fw', 1, 0),
              node('web', 'Webアプリ', 'server', 2, 0),
              node('api', '内部API', 'server', 3, 0, { sub: '認証なし', add: true }),
            ],
            [
              link('atk', 'fw', { label: 'HTTPS', arrow: true }),
              link('fw', 'web', { label: '443番だけ許可', arrow: true }),
              link('web', 'api', { label: 'FWを通らずに届く', arrow: true, add: true }),
            ],
            [zone('DMZ', 2, 0, 2, 1)],
          ),
          '外部から内部APIへは届かないが、同じDMZのWebサーバからは届く',
        ),
      ],
    },
    {
      id: 'attack',
      title: 'SSRF：内部のURLを取りに行かせる',
      blocks: [
        p(
          '攻撃者は、画像のURLの代わりに、内部APIのURL（http://172.16.0.20/admin/keys）を入力します。Webアプリは確かめずにそのURLへアクセスし、内部APIは信頼しているDMZの中からの要求として、APIの鍵を返します。Webアプリは、取得した中身をそのまま攻撃者に返してしまいます。',
        ),
        fig(
          seq(
            [atk, web, api],
            [
              mAdd('atk', 'web', 'url=http://172.16.0.20/admin/keys', 'attack'),
              mAdd('web', 'api', 'Webサーバが内部APIへアクセス', 'attack'),
              mAdd('api', 'web', 'APIの鍵（認証なしで返す）', 'attack'),
              mAdd('web', 'atk', '取得した中身を返す', 'attack'),
            ],
          ),
          'SSRF：サーバを踏み台にして、内部APIにアクセスさせる',
        ),
        note('中身が画面に表示されなくても、エラーメッセージや応答時間の違いから、内部にどんなサーバやポートがあるかを調べられることがあります。'),
      ],
      see: { mode: 'attack', step: 2, label: 'Webサーバが、内部APIにアクセスしてしまう' },
    },
    {
      id: 'cloud',
      title: 'クラウドでは、メタデータが狙われる',
      blocks: [
        p(
          'クラウドの仮想マシンは、決まった内部のURL（169.254.169.254 など）のメタデータサービスから、自分の設定や一時的な認証情報を取得します。SSRFでここにアクセスさせると、クラウドの認証情報を盗まれ、ほかのストレージなどを操作されます。',
        ),
        p('対策として、先にトークンを取得しないと応答しない方式（IMDSv2など）を使います。単純なSSRFでは、トークンを取得する特別な要求を送れません。'),
        fig(
          seq(
            [atk, actor('vm', '仮想マシン', 'server'), actor('meta', 'メタデータ', 'cloud')],
            [
              m('atk', 'vm', 'url=http://169.254.169.254/…', 'attack'),
              m('vm', 'meta', '認証情報を要求', 'attack'),
              mAdd('meta', 'vm', 'トークンがない → 応答しない（IMDSv2）', 'blocked'),
            ],
          ),
          'メタデータサービスへのSSRFと、トークンを必須にする対策',
        ),
      ],
    },
    {
      id: 'defense',
      title: '3か所で止める',
      blocks: [
        table(
          ['場所', '対策', '注意'],
          [
            'Webアプリ',
            'アクセス先を許可リストで絞る。名前解決後のIPアドレスがプライベートなら拒否',
            '拒否リストは、別の表記（10進数のIPアドレスなど）で迂回される',
          ],
          ['Webアプリ', 'リダイレクトを追わない。中身の形式を確かめ、エラーの詳細を返さない', '許可したサイトから内部へのリダイレクトで迂回される'],
          ['内部API', '内部からの要求にも認証をかける', '「内部だから信頼する」をやめる（ゼロトラスト）'],
          ['ネットワーク', 'Webサーバから内部への通信を、必要なものだけ許可', 'ルールは定期的に見直す'],
        ),
        fig(
          map(
            4,
            1,
            [
              node('atk', '攻撃者', 'pc', 0, 0, { attacker: true }),
              node('fw', 'FW', 'fw', 1, 0),
              node('web', 'Webアプリ', 'server', 2, 0, { sub: 'URLの許可リスト', add: true }),
              node('api', '内部API', 'server', 3, 0, { sub: '認証あり', add: true }),
            ],
            [
              link('atk', 'fw', { label: '内部のURL', tone: 'attack', arrow: true }),
              link('fw', 'web', { tone: 'attack', arrow: true }),
              link('web', 'api', { label: '拒否', tone: 'blocked', arrow: true, add: true }),
            ],
            [zone('DMZ', 2, 0, 2, 1)],
          ),
          '多層防御：アプリの検証、内部APIの認証、通信の制限',
        ),
      ],
      see: { mode: 'defense', step: 1, label: 'URLを確かめて、内部のアドレスを拒否する' },
    },
    {
      id: 'family',
      title: '同じ形の脆弱性',
      blocks: [
        p('サーバに外部の資源を取りに行かせる機能は、どれもSSRFの入口になりえます。'),
        list(
          'Webhook：利用者が通知先のURLを登録できる',
          'URLのプレビュー：チャットに貼られたURLの内容をサーバが取得する',
          'PDF化・スクリーンショット：指定したページをサーバのブラウザで開く',
          'XML外部実体参照（XXE）：XMLの中で指定した外部のファイルやURLを、サーバのXMLの処理が読み込む',
        ),
        note('CSRFは利用者のブラウザに、SSRFはサーバに、意図しない要求を送らせる攻撃です。名前が似ているので、混同しないようにします。'),
      ],
    },
  ],
}
