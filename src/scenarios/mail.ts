import { defineScenario } from '../types'

// メール送信：送信元なりすまし
// 図中のIPアドレス（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24）とドメイン（example.*）は、
// 説明用に予約されたもので、実在のサーバを指しません。
export const mail = defineScenario({
  id: 'mail',
  name: 'メール送信',
  threat: '送信元なりすまし',
  actors: [
    {
      id: 'mta',
      name: '正規送信MTA',
      sub: 'example.co.jp',
    },
    {
      id: 'atk',
      name: '攻撃者',
      sub: 'なりすまし',
      attacker: true,
    },
    {
      id: 'rcv',
      name: '受信MTA',
      sub: '取引先',
    },
    {
      id: 'dns',
      name: 'DNS',
      sub: 'example.co.jp',
    },
  ],
  summary: {
    normal: '正規のメールを、受信MTAがSPF・DKIM・DMARCで検証して受け入れる流れです。',
    attack: '送信ドメイン認証を設定していないドメインを詐称し、取引先に偽の請求メールを送ります（ビジネスメール詐欺、BEC）。',
    defense: '送信側がSPF・DKIM・DMARCを設定していると、詐称メールは受信側で拒否されます。',
  },
  steps: {
    normal: [
      {
        from: 'mta',
        to: 'rcv',
        kind: 'normal',
        label: 'SMTPで送信',
        title: '正規のメールを送信',
        fields: [
          ['送信元IP', '203.0.113.25'],
          ['MAIL FROM', 'info@example.co.jp（エンベロープFrom）'],
          ['From:', 'info@example.co.jp（ヘッダFrom）'],
          ['DKIM-Signature', 'd=example.co.jp; s=sel1; b=…'],
        ],
        note: '送信MTAは、本文と主要ヘッダのハッシュに秘密鍵で署名し、DKIM-Signatureヘッダとして付けます。',
      },
      {
        from: 'rcv',
        to: 'dns',
        kind: 'normal',
        label: 'SPF・DKIM鍵を照会',
        title: '受信MTAがDNSに問い合わせる',
        fields: [
          ['SPF', 'example.co.jp の TXT'],
          ['DKIM', 'sel1._domainkey.example.co.jp の TXT'],
        ],
        note: 'SPFはエンベロープFrom（MAIL FROM）のドメインで、DKIMは署名のd=のドメインで問い合わせます。',
      },
      {
        from: 'dns',
        to: 'rcv',
        kind: 'normal',
        label: 'SPF／公開鍵',
        title: 'DNSが認証情報を返す',
        fields: [
          ['SPF', 'v=spf1 ip4:203.0.113.25 -all'],
          ['DKIM', 'v=DKIM1; k=rsa; p=MIIBIjAN…'],
          ['判定', 'SPF pass／DKIM pass'],
        ],
        note: '送信元IPがSPFの許可リストに含まれ、公開鍵でDKIM署名を検証できたので、どちらも成功です。',
      },
      {
        from: 'rcv',
        to: 'dns',
        kind: 'normal',
        label: 'DMARCを照会',
        title: 'DMARCポリシーを確認',
        fields: [
          ['問合せ', '_dmarc.example.co.jp の TXT'],
        ],
        note: 'DMARCは、ヘッダFrom（利用者に見える差出人）のドメインで問い合わせます。',
      },
      {
        from: 'dns',
        to: 'rcv',
        kind: 'normal',
        label: 'p=reject',
        title: 'アライメントを確認して受信',
        fields: [
          ['DMARC', 'v=DMARC1; p=reject; rua=mailto:dmarc@example.co.jp'],
          ['アライメント', 'ヘッダFromとSPF・DKIMのドメインが一致'],
          ['結果', '受信箱へ配送'],
        ],
        note: 'SPFかDKIMの少なくとも一方が成功し、そのドメインがヘッダFromと一致（アライメント）していれば、DMARCは成功です。',
        point: 'SPFが検証するのはエンベロープFromです。利用者に見えるヘッダFromとの一致を求めるのがDMARCの役割です。',
      },
    ],
    attack: [
      {
        from: 'atk',
        to: 'rcv',
        kind: 'attack',
        label: '詐称メール送信',
        title: '差出人を詐称して送信',
        fields: [
          ['送信元IP', '198.51.100.66（攻撃者）'],
          ['MAIL FROM', 'info@example.co.jp（詐称）'],
          ['From:', 'info@example.co.jp（詐称）'],
          ['件名', '【至急】振込先口座変更のお願い'],
        ],
        note: 'SMTPそのものには差出人を確認する仕組みがないため、誰でも任意のアドレスを名乗れます。',
      },
      {
        from: 'rcv',
        to: 'dns',
        kind: 'normal',
        label: 'SPF・DMARCを照会',
        title: '受信MTAが確認しようとする',
        fields: [
          ['問合せ', 'example.co.jp TXT、_dmarc.example.co.jp TXT'],
        ],
        note: '受信側は送信ドメイン認証で確かめようとします。',
      },
      {
        from: 'dns',
        to: 'rcv',
        kind: 'attack',
        label: 'レコードなし',
        title: '認証情報が登録されていない',
        fields: [
          ['SPF', 'なし → none'],
          ['DKIM', '署名なし → none'],
          ['DMARC', 'なし'],
        ],
        note: '送信ドメイン側がレコードを公開していないと、受信側には偽物と判断する材料がありません。',
      },
      {
        from: 'rcv',
        to: 'rcv',
        kind: 'attack',
        label: '受信箱へ配送',
        title: '偽メールが届く',
        fields: [
          ['結果', '取引先の受信箱に配送'],
          ['影響', '偽口座への送金（BEC）、マルウェア添付'],
        ],
        note: '差出人の表示は本物と同じなので、受信者は見分けにくくなります。',
        point: '自社ドメインの詐称を防ぐのは、受信側ではなく送信ドメイン側の設定（SPF・DKIM・DMARCレコードの公開）です。',
      },
    ],
    defense: [
      {
        from: 'atk',
        to: 'rcv',
        kind: 'attack',
        label: '詐称メール送信',
        title: '差出人を詐称して送信',
        fields: [
          ['送信元IP', '198.51.100.66'],
          ['From:', 'info@example.co.jp（詐称）'],
        ],
        note: '攻撃者の手口は同じです。',
      },
      {
        from: 'rcv',
        to: 'dns',
        kind: 'defense',
        label: 'SPF・DMARCを照会',
        title: '認証レコードを確認',
        fields: [
          ['問合せ', 'example.co.jp TXT、_dmarc.example.co.jp TXT'],
        ],
        note: '今回は送信ドメイン側がレコードを公開しています。',
      },
      {
        from: 'dns',
        to: 'rcv',
        kind: 'defense',
        label: '-all／p=reject',
        title: '認証に失敗',
        fields: [
          ['SPF', '198.51.100.66 は許可リスト外 → fail'],
          ['DKIM', '署名なし → none（DMARCでは不合格の扱い）'],
          ['DMARC', 'p=reject'],
        ],
        note: 'SPFもDKIMも成功しないので、DMARCは失敗です。ポリシーはreject（受信拒否）です。',
      },
      {
        from: 'rcv',
        to: 'atk',
        kind: 'defense',
        label: '550 受信拒否',
        title: '受信MTAが拒否',
        fields: [
          ['SMTP応答', '550 5.7.1 DMARC policy reject'],
          ['レポート', 'rua宛てに集計レポートを送付'],
        ],
        note: '受信側は詐称メールを拒否し、ドメイン管理者には集計レポートで詐称の発生が伝わります。',
      },
    ],
  },
  points: [
    'SPFはメール転送で失敗しやすく、DKIMは本文が改変されない限り転送に強い',
    'DMARCのポリシーは none（監視）→ quarantine（隔離）→ reject（拒否）と段階的に強める',
    'OP25B（Outbound Port 25 Blocking）と、サブミッションポート587＋SMTP-AUTHの組合せもよく問われる',
    'SPFの -all（許可外は失敗）と ~all（ソフトフェイル）の違い',
  ],
  topology: {
    map: {
      mta: 'mail',
      atk: 'ext2',
      rcv: 'ext1',
      dns: 'adns',
    },
    shields: ['ext1', 'adns'],
    external: {
      ext1: {
        type: 'server',
        name: '受信MTA',
        sub: '取引先',
      },
      ext2: {
        type: 'laptop',
        name: '攻撃者',
        sub: '',
      },
    },
    labels: {
      mail: ['メール', '送信MTA'],
    },
  },
})
