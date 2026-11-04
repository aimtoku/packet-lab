import { defineScenario } from '../types'

// Webセッション：CSRF
// 図中のIPアドレス（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24）とドメイン（example.*）は、
// 説明用に予約されたもので、実在のサーバを指しません。
export const web = defineScenario({
  id: 'web',
  name: 'Webセッション',
  threat: 'CSRF',
  actors: [
    {
      id: 'br',
      name: 'ブラウザ',
      sub: '利用者',
    },
    {
      id: 'sv',
      name: '正規サイト',
      sub: 'bank.example',
    },
    {
      id: 'evil',
      name: '攻撃者サイト',
      sub: 'evil.example',
      attacker: true,
    },
  ],
  summary: {
    normal: 'ログインでセッションCookieを受け取り、送金リクエストを送る流れです。',
    attack: 'ログイン中の利用者に攻撃者サイトを開かせ、利用者の意図しない送金リクエストを送らせます（CSRF）。',
    defense: 'SameSite属性とCSRFトークンで、他サイト起点のリクエストを拒否します。',
  },
  steps: {
    normal: [
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'POST /login',
        title: 'ログイン',
        fields: [
          ['送信', 'id=sato&pw=********'],
          ['通信', 'HTTPS'],
        ],
        note: '利用者がIDとパスワードでログインします。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: 'Set-Cookie',
        title: 'セッションIDを発行',
        fields: [
          ['Set-Cookie', 'SID=8f2a…; Secure; HttpOnly; SameSite=Lax'],
          ['セッションID', 'ログイン成功時に新しく発行'],
        ],
        note: 'ログイン成功時にセッションIDを発行し直すのは、セッション固定攻撃への対策です。',
        point: 'Secure：HTTPSのときだけ送る。HttpOnly：JavaScriptから読めない（XSSによる窃取対策）。SameSite：他サイト起点のリクエストに付けない。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: '送金フォーム',
        title: 'フォームにトークンを埋め込む',
        fields: [
          ['hidden項目', 'csrf_token=b7c1e9…（セッションと紐付く乱数）'],
        ],
        note: 'サーバは推測できない値をフォームに埋め込み、セッションと対応付けて保存します。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'POST /transfer',
        title: '送金を実行',
        fields: [
          ['Cookie', 'SID=8f2a…'],
          ['本文', 'to=12345&amount=10000&csrf_token=b7c1e9…'],
          ['検証', 'トークン一致 → 実行'],
        ],
        note: 'セッションとトークンの両方が正しいので、送金が実行されます。',
      },
    ],
    attack: [
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'ログイン済み',
        title: '利用者はログインしたまま',
        fields: [
          ['Cookie', 'SID=8f2a…; Secure; SameSite=None（他サイトからのリクエストにも付く設定）'],
          ['トークン', '送金フォームに使っていない'],
        ],
        note: '利用者はログアウトせず、別のタブで他のサイトを見ています。このサイトはCSRF対策をしていません。',
      },
      {
        from: 'br',
        to: 'evil',
        kind: 'attack',
        label: '罠ページを開く',
        title: '攻撃者サイトを開く',
        fields: [
          ['きっかけ', 'メールやSNSのリンク'],
        ],
        note: '利用者は普通のページだと思ってリンクを開きます。',
      },
      {
        from: 'evil',
        to: 'br',
        kind: 'attack',
        label: '自動送信フォーム',
        title: '罠のHTMLが返る',
        fields: [
          ['form', 'action="https://bank.example/transfer" method="POST"'],
          ['hidden', 'to=99999&amount=500000'],
          ['script', '表示と同時に自動でsubmit'],
        ],
        note: '見た目は普通のページでも、裏でフォームが自動送信されます。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'attack',
        label: 'POST /transfer',
        title: 'Cookieが自動で付く',
        fields: [
          ['Cookie', 'SID=8f2a…（ブラウザが自動付与）'],
          ['本文', 'to=99999&amount=500000'],
          ['Origin', 'https://evil.example'],
        ],
        note: 'ブラウザは宛先サイトのCookieを自動で付けるので、サーバからは本人の正規のリクエストに見えます。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'attack',
        label: '200 送金完了',
        title: '意図しない送金が実行される',
        fields: [
          ['結果', '攻撃者の口座へ50万円を送金'],
        ],
        note: '利用者は送金した覚えがありません。',
        point: 'CSRFは「セッションを盗む」攻撃ではなく、「正規のセッションのまま、利用者の意図しない操作をさせる」攻撃です。XSSやセッションハイジャックとの違いとして問われます。',
      },
    ],
    defense: [
      {
        from: 'br',
        to: 'evil',
        kind: 'attack',
        label: '罠ページを開く',
        title: '攻撃者サイトを開く',
        fields: [
          ['きっかけ', 'メールやSNSのリンク'],
        ],
        note: '利用者が罠ページを開くところまでは同じです。',
      },
      {
        from: 'evil',
        to: 'br',
        kind: 'attack',
        label: '自動送信フォーム',
        title: '罠のHTMLが返る',
        fields: [
          ['hidden', 'to=99999&amount=500000'],
          ['csrf_token', 'なし（攻撃者は値を知らない）'],
        ],
        note: '攻撃者は利用者のトークンを知る手段がありません。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'blocked',
        label: 'POST → 403',
        title: 'リクエストを拒否',
        fields: [
          ['Cookie', 'SameSite=Lax のため他サイト起点のPOSTには付かない'],
          ['csrf_token', 'なし → 不一致'],
          ['応答', '403 Forbidden'],
        ],
        note: 'SameSite属性によりCookie自体が送られず、仮に送られてもトークンが一致しないので処理されません。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'defense',
        label: '正規の送金',
        title: '正規の操作は通る',
        fields: [
          ['本文', '…&csrf_token=b7c1e9…'],
          ['結果', 'トークン一致 → 実行'],
        ],
        note: '重要な操作の前にパスワードを再入力させる方法も有効です。',
      },
    ],
  },
  points: [
    'CSRF対策：トークン（hidden項目）、SameSite属性、重要操作時の再認証、Origin／Refererヘッダの確認',
    'XSSは利用者のブラウザで攻撃者のスクリプトを動かす攻撃。対策は出力時のエスケープとCSP',
    'セッション固定攻撃には、ログイン成功時のセッションID再発行で対処する',
    'Cookie属性 Secure・HttpOnly・SameSite がそれぞれ何を防ぐか',
  ],
  topology: {
    map: {
      br: 'pc',
      sv: 'ext1',
      evil: 'ext2',
    },
    shields: ['ext1', 'pc'],
    devices: {
      ext1: {
        type: 'server',
        name: '正規サイト',
        sub: 'bank.example',
      },
      ext2: {
        type: 'server',
        name: '罠サイト',
        sub: 'evil.example',
      },
    },
  },
})
