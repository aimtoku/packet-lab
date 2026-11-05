import { defineScenario } from '../types'

// メール送信：送信元なりすまし
// 図中のIPアドレス（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24）とドメイン（example.*）は、
// 説明用に予約されたもので、実在のサーバを指しません。
//
// アドレスの割り当て
//   送信MTA（example.co.jp）203.0.113.25、example.co.jp のDNSサーバ 203.0.113.53
//   取引先の受信MTA 192.0.2.25、攻撃者 198.51.100.66
const MTA = '203.0.113.25'
const DNS = '203.0.113.53'
const RCV = '192.0.2.25'
const ATTACKER = '198.51.100.66'

/** 受信MTAの判定の、最初の状態 */
const UNCHECKED = [
  ['送信元IP', '—'],
  ['SPF', '未確認'],
  ['DKIM', '未確認'],
  ['DMARC', '未確認'],
  ['配送先', '判定待ち'],
] as const

const RESOLVER_REMARK = '実際には、受信MTAは自組織のキャッシュDNSサーバを通して問い合わせます。図では省略しています。'

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
  states: [
    {
      id: 'verdict',
      title: '受信MTAの判定',
      columns: ['検査', '結果'],
      initial: { normal: UNCHECKED, attack: UNCHECKED, defense: UNCHECKED },
    },
  ],
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
        send: '正規送信MTA：本文と主なヘッダからハッシュ値を計算し、自社の秘密鍵で署名（DKIM-Signature）を付けて送ります。',
        via: { fw: 'FW：DMZのメールサーバから外部への25番ポート（SMTP）の通信は許可されているので、通します。' },
        receive: '受信MTA：メールを受け取ります。差出人が本物かを確かめるため、送信ドメイン認証を始めます。',
        wire: {
          app: 'SMTP（メール本文とヘッダ）',
          transport: 'TCP',
          srcPort: '50200',
          dstPort: '25',
          srcIp: MTA,
          dstIp: RCV,
          focus: ['l3', 'l7'],
          remark: 'SPFで確かめるのは、この送信元IPアドレス（203.0.113.25）です。',
        },
        changes: [{ table: 'verdict', key: '送信元IP', value: '203.0.113.25' }],
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
        send: '受信MTA：エンベロープFromのドメイン（example.co.jp）のSPFレコードと、DKIM署名の d= と s= が示す公開鍵を、DNSに問い合わせます。',
        via: { fw: 'FW：外部からDMZのDNSサーバへの問合せ（53番ポート）は許可されているので、通します。' },
        receive: 'DNS：example.co.jp に登録してあるTXTレコードを探します。',
        wire: { app: 'DNS（TXTレコードの問合せ）', transport: 'UDP', srcPort: '51000', dstPort: '53', srcIp: RCV, dstIp: DNS, remark: RESOLVER_REMARK },
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
        send: 'DNS：SPFレコード（メールを送ってよいサーバのIPアドレスの一覧）と、DKIMの公開鍵を返します。',
        via: { fw: 'FW：問合せへの応答なので、通します。' },
        receive: '受信MTA：送信元IP 203.0.113.25 がSPFの一覧にあるので SPF pass。公開鍵でDKIM署名を検証でき、本文も書き換えられていないので DKIM pass です。',
        wire: { app: 'DNS（TXTレコードの応答）', transport: 'UDP', srcPort: '53', dstPort: '51000', srcIp: DNS, dstIp: RCV, focus: ['l7'] },
        changes: [
          { table: 'verdict', key: 'SPF', value: 'pass（送信元IPが一覧にある）', tone: 'defense' },
          { table: 'verdict', key: 'DKIM', value: 'pass（署名を検証できた）', tone: 'defense' },
        ],
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
        send: '受信MTA：利用者に見えるヘッダFromのドメインで、_dmarc.example.co.jp のTXTレコードを問い合わせます。',
        via: { fw: 'FW：DMZのDNSサーバへの問合せなので、通します。' },
        receive: 'DNS：DMARCポリシーのレコードを探します。',
        wire: { app: 'DNS（TXTレコードの問合せ）', transport: 'UDP', srcPort: '51001', dstPort: '53', srcIp: RCV, dstIp: DNS },
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
        send: 'DNS：DMARCポリシー（認証に失敗したら reject）と、集計レポートの送り先を返します。',
        via: { fw: 'FW：問合せへの応答なので、通します。' },
        receive: '受信MTA：SPF・DKIMで確かめたドメインがヘッダFromと一致（アライメント）するので DMARC pass。取引先の受信箱へ配送します。',
        wire: { app: 'DNS（TXTレコードの応答）', transport: 'UDP', srcPort: '53', dstPort: '51001', srcIp: DNS, dstIp: RCV },
        changes: [
          { table: 'verdict', key: 'DMARC', value: 'pass（ヘッダFromと一致）', tone: 'defense' },
          { table: 'verdict', key: '配送先', value: '受信箱' },
        ],
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
        send: '攻撃者：MAIL FROM も From: も info@example.co.jp と偽って、取引先の受信MTAへ直接送ります。',
        receive: '受信MTA：SMTPには差出人を確かめる仕組みがないので、ひとまず受け取ります。',
        wire: { app: 'SMTP（メール本文とヘッダ）', transport: 'TCP', srcPort: '40100', dstPort: '25', srcIp: ATTACKER, dstIp: RCV, focus: ['l3', 'l7'] },
        changes: [{ table: 'verdict', key: '送信元IP', value: '198.51.100.66', tone: 'attack' }],
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
        send: '受信MTA：example.co.jp のSPFレコードと、DMARCポリシーを問い合わせます。',
        via: { fw: 'FW：DMZのDNSサーバへの問合せなので、通します。' },
        receive: 'DNS：探しますが、SPFもDMARCも登録されていません。',
        wire: { app: 'DNS（TXTレコードの問合せ）', transport: 'UDP', srcPort: '51000', dstPort: '53', srcIp: RCV, dstIp: DNS, remark: RESOLVER_REMARK },
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
        send: 'DNS：該当するレコードがない、と返します。',
        via: { fw: 'FW：問合せへの応答なので、通します。' },
        receive: '受信MTA：SPFもDKIMもDMARCも判定できません。詐称だと判断する材料がありません。',
        wire: { app: 'DNS（TXTレコードの応答）', transport: 'UDP', srcPort: '53', dstPort: '51000', srcIp: DNS, dstIp: RCV },
        changes: [
          { table: 'verdict', key: 'SPF', value: 'none（レコードがない）', tone: 'attack' },
          { table: 'verdict', key: 'DKIM', value: 'none（署名がない）', tone: 'attack' },
          { table: 'verdict', key: 'DMARC', value: 'none（ポリシーがない）', tone: 'attack' },
        ],
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
        receive: '受信MTA：判断する材料がないので、ふつうのメールとして取引先の受信箱へ配送します。',
        changes: [{ table: 'verdict', key: '配送先', value: '受信箱（偽の請求メールが届く）', tone: 'attack' }],
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
        send: '攻撃者：差出人を info@example.co.jp と偽って、取引先の受信MTAへ直接送ります。',
        receive: '受信MTA：ひとまず受け取り、送信ドメイン認証で確かめます。',
        wire: { app: 'SMTP（メール本文とヘッダ）', transport: 'TCP', srcPort: '40100', dstPort: '25', srcIp: ATTACKER, dstIp: RCV, focus: ['l3'] },
        changes: [{ table: 'verdict', key: '送信元IP', value: '198.51.100.66', tone: 'attack' }],
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
        send: '受信MTA：example.co.jp のSPFレコードと、DMARCポリシーを問い合わせます。',
        via: { fw: 'FW：DMZのDNSサーバへの問合せなので、通します。' },
        receive: 'DNS：登録してあるSPFレコードとDMARCポリシーを返す準備をします。',
        wire: { app: 'DNS（TXTレコードの問合せ）', transport: 'UDP', srcPort: '51000', dstPort: '53', srcIp: RCV, dstIp: DNS, remark: RESOLVER_REMARK },
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
        send: 'DNS：SPFレコード（203.0.113.25 だけを許可し、それ以外は -all で失敗）と、DMARCポリシー p=reject を返します。',
        via: { fw: 'FW：問合せへの応答なので、通します。' },
        receive: '受信MTA：198.51.100.66 は一覧にないので SPF fail。DKIM署名もないので DMARC fail です。ポリシーは reject（受信拒否）です。',
        wire: { app: 'DNS（TXTレコードの応答）', transport: 'UDP', srcPort: '53', dstPort: '51000', srcIp: DNS, dstIp: RCV, focus: ['l7'] },
        changes: [
          { table: 'verdict', key: 'SPF', value: 'fail（送信元IPが一覧にない）', tone: 'defense' },
          { table: 'verdict', key: 'DKIM', value: 'none（署名がない）', tone: 'defense' },
          { table: 'verdict', key: 'DMARC', value: 'fail → ポリシーは reject', tone: 'defense' },
        ],
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
        send: '受信MTA：SMTPの応答コード550で、受信を拒否します。',
        receive: '攻撃者：拒否の応答を受け取ります。偽のメールは、取引先の受信箱に届きません。',
        wire: { app: 'SMTP（550 応答）', transport: 'TCP', srcPort: '25', dstPort: '40100', srcIp: RCV, dstIp: ATTACKER },
        changes: [
          { table: 'verdict', key: '配送先', value: '受信拒否（受信箱に届かない）', tone: 'defense', at: 'ext1' },
          { table: 'verdict', key: '集計レポート', value: 'example.co.jp の管理者へ送付', tone: 'defense', at: 'ext1' },
        ],
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
    devices: {
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
