import { defineScenario } from '../types'

// HTTPS（TLS 1.3）：中間者攻撃
// 図中のIPアドレス（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24）とドメイン（example.*）は、
// 説明用に予約されたもので、実在のサーバを指しません。
export const tls = defineScenario({
  id: 'tls',
  name: 'HTTPS（TLS 1.3）',
  threat: '中間者攻撃',
  actors: [
    {
      id: 'br',
      name: 'ブラウザ',
      sub: '利用者',
    },
    {
      id: 'atk',
      name: '攻撃者',
      sub: '経路上',
      attacker: true,
    },
    {
      id: 'sv',
      name: 'Webサーバ',
      sub: 'example.co.jp',
    },
  ],
  summary: {
    normal: 'TLS 1.3のハンドシェイクです。鍵交換、サーバ認証、暗号化通信の開始までを1往復で行います。',
    attack: '公衆Wi-Fiなどで通信経路に入り込んだ攻撃者が、ブラウザとサーバの間に割り込みます（中間者攻撃、MITM）。',
    defense: '証明書の検証とHSTSにより、攻撃者は正規サーバになりすませません。',
  },
  steps: {
    normal: [
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'ClientHello',
        title: 'ブラウザが接続を開始',
        fields: [
          ['バージョン', 'TLS 1.3'],
          ['暗号スイート', 'TLS_AES_128_GCM_SHA256 ほか'],
          ['key_share', 'ECDHE（X25519）の公開値'],
          ['SNI', 'www.example.co.jp'],
          ['乱数', 'client_random（32バイト）'],
        ],
        note: 'TLS 1.3では、ClientHelloの時点で鍵交換用の公開値（key_share）も送ります。これで往復が1回で済みます。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: 'ServerHello',
        title: 'サーバが暗号方式を選ぶ',
        fields: [
          ['暗号スイート', 'TLS_AES_128_GCM_SHA256'],
          ['key_share', 'サーバ側のECDHE公開値'],
          ['乱数', 'server_random'],
        ],
        note: '双方の公開値から、ECDHEで同じ共通鍵を導出します。この直後から、ハンドシェイクの残りも暗号化されます。',
        point: '接続ごとに使い捨ての鍵を作るので、サーバの秘密鍵が後で漏れても過去の通信は復号できません（前方秘匿性、PFS）。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: 'Certificate／Verify',
        title: 'サーバ証明書と署名',
        fields: [
          ['Certificate', 'サーバ証明書＋中間CA証明書'],
          ['SAN', 'www.example.co.jp'],
          ['CertificateVerify', 'ここまでのやりとりをサーバの秘密鍵で署名'],
        ],
        note: 'ブラウザは、証明書チェーンが信頼済みルートCAまで辿れるか、有効期限、失効状態（OCSPなど）、SANとアクセス先ホスト名の一致を確認します。さらにCertificateVerifyの署名を証明書の公開鍵で検証し、相手が秘密鍵の持ち主であることを確かめます。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: 'Finished',
        title: 'サーバ側の完了通知',
        fields: [
          ['内容', 'ハンドシェイク全体のハッシュに対するMAC'],
        ],
        note: '途中のメッセージが改ざんされていれば、ここで値が一致せず検知できます。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'Finished＋HTTP',
        title: '暗号化通信の開始',
        fields: [
          ['Finished', 'ブラウザ側の完了通知'],
          ['アプリケーションデータ', 'GET /mypage（AES-GCMで暗号化）'],
        ],
        note: '以降のHTTP通信はすべて暗号化され、改ざんも検知されます。',
      },
    ],
    attack: [
      {
        from: 'br',
        to: 'atk',
        kind: 'attack',
        label: 'ClientHello（横取り）',
        title: '通信が攻撃者を経由する',
        fields: [
          ['手口', '偽アクセスポイント、ARPスプーフィング、DNSの改ざん'],
          ['宛先', 'www.example.co.jp のつもり'],
        ],
        note: '攻撃者は通信経路に入り込み、ブラウザからの接続を自分で受け取ります。',
      },
      {
        from: 'atk',
        to: 'sv',
        kind: 'attack',
        label: 'ClientHello（代理）',
        title: '攻撃者が正規サーバに接続',
        fields: [
          ['送信元', '攻撃者'],
          ['目的', '正規サーバとの通信を中継する'],
        ],
        note: '攻撃者は利用者の代わりに正規サーバとTLS接続を張り、内容を中継します。',
      },
      {
        from: 'atk',
        to: 'br',
        kind: 'attack',
        label: '偽の証明書',
        title: '攻撃者が自分の証明書を出す',
        fields: [
          ['証明書', '攻撃者が作った自己署名証明書'],
          ['SAN', 'www.example.co.jp（を名乗る）'],
          ['署名', '攻撃者の秘密鍵'],
        ],
        note: '攻撃者は正規サーバの秘密鍵を持たないので、正規の証明書を出してもCertificateVerifyを作れません。代わりに自分の鍵で作った証明書を出します。信頼済みCAに辿れないため、ブラウザは警告を表示します。',
      },
      {
        from: 'br',
        to: 'atk',
        kind: 'attack',
        label: '警告を無視して続行',
        title: '利用者が警告を無視する',
        fields: [
          ['ブラウザ表示', 'この接続ではプライバシーが保護されません'],
          ['利用者の操作', '詳細設定 → サイトへ進む（安全ではありません）'],
        ],
        note: 'ここで利用者が続行すると、ブラウザと攻撃者の間で暗号化通信が成立してしまいます。',
        point: 'TLSの安全性は「証明書の検証」にかかっています。利用者が警告を無視すれば、暗号化していても盗聴されます。',
      },
      {
        from: 'br',
        to: 'atk',
        kind: 'attack',
        label: 'ID／パスワード送信',
        title: '通信内容が盗まれる',
        fields: [
          ['送信内容', 'POST /login id=…&pw=…'],
          ['攻撃者', '復号して閲覧・改ざんし、サーバへ転送'],
        ],
        note: '攻撃者は両側との鍵を持っているので、通信を復号して読み取り、書き換えてから中継できます。利用者もサーバも気付きません。',
      },
    ],
    defense: [
      {
        from: 'br',
        to: 'atk',
        kind: 'attack',
        label: 'ClientHello（横取り）',
        title: '攻撃者が経路に入り込む',
        fields: [
          ['手口', '偽アクセスポイントなど'],
        ],
        note: '経路上に攻撃者がいる状況は同じです。',
      },
      {
        from: 'atk',
        to: 'br',
        kind: 'blocked',
        label: '偽の証明書 → 拒否',
        title: '証明書の検証で失敗',
        fields: [
          ['チェーン検証', '信頼済みルートCAに辿れない → 失敗'],
          ['HSTS', 'このドメインはHTTPSのみ。警告から続行できない'],
        ],
        note: 'HSTS（Strict-Transport-Security）を受け取ったことのあるドメインでは、ブラウザは証明書エラー時に「続行」させません。利用者の判断ミスを防げます。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'defense',
        label: 'ClientHello（正規の経路）',
        title: '安全な経路で接続し直す',
        fields: [
          ['対策', 'VPNの利用、信頼できるネットワークへの切替え'],
        ],
        note: '正規サーバと直接ハンドシェイクすれば、証明書とCertificateVerifyの検証が成功します。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'defense',
        label: '正規の証明書',
        title: '検証に成功',
        fields: [
          ['チェーン', '信頼済みルートCAまで検証OK'],
          ['署名', 'CertificateVerify 検証OK'],
        ],
        note: '証明書に対応する秘密鍵を持つのは正規サーバだけなので、なりすましは成立しません。',
      },
    ],
  },
  points: [
    'HTTPからHTTPSへ切り替わる前を狙うSSLストリッピングには、HSTS（プリロード）が有効',
    '前方秘匿性（PFS）は、ECDHEなど一時鍵による鍵交換で実現する',
    'CAによる不正な証明書発行は、CT（Certificate Transparency）ログの監視で検知する',
    'サーバの秘密鍵が漏えいしたら、証明書を失効させて鍵ペアごと再発行する',
  ],
  topology: {
    map: {
      br: 'laptop',
      atk: 'fakeap',
      sv: 'web',
    },
    shields: ['laptop'],
    mobile: true,
    labels: {
      laptop: ['ノートPC', 'ブラウザ'],
      fakeap: ['偽AP', '攻撃者'],
      web: ['Web', 'example.co.jp'],
    },
  },
})
