import { defineScenario } from '../types'
import { CSIRT, IR_TABLE, ir } from './incident'

// URLから画像を取り込む機能：SSRF（サーバサイドリクエストフォージェリ）
// 図中のIPアドレス（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24、172.16.0.0/12）とドメイン（example.*）は、
// 説明用に予約されたもの、またはプライベートアドレスで、実在のサーバを指しません。
//
// 公開Webサーバ（Webアプリ）203.0.113.10（DMZの中では 172.16.0.10）。
// 同じDMZに、Webアプリが使う内部API 172.16.0.20 がある。内部APIは外部からは届かない（FWで遮断）ので、認証をしていない。
const SITE = '203.0.113.10'
const WEB_IN = '172.16.0.10'
const API = '172.16.0.20'
const IMG = '198.51.100.30'
const ATK = '192.0.2.66'

const FW_IN = 'FW：外部から公開Webサーバへの443番ポート（HTTPS）は許可されているので、通します。'
const FW_OUT = 'FW：DMZのWebサーバから外部への443番ポートは許可されているので、通します。'
const DSW = 'DMZのスイッチ：同じDMZの中の通信なので、FWを通らずに内部APIへ届きます。'

export const ssrf = defineScenario({
  id: 'ssrf',
  name: 'URLから画像を取り込む機能',
  threat: 'SSRF',
  actors: [
    { id: 'user', name: '会員', sub: 'ブラウザ' },
    { id: 'web', name: 'Webアプリ', sub: '公開Webサーバ' },
    { id: 'img', name: '画像サイト', sub: 'img.example.net' },
    { id: 'api', name: '内部API', sub: '社内向け・認証なし' },
    { id: 'atk', name: '攻撃者', sub: '', attacker: true },
    CSIRT,
  ],
  summary: {
    normal:
      '会員が画像のURLを入力すると、Webアプリ（サーバ）がそのURLにアクセスして画像を取り込み、プロフィールに表示します。URLへのアクセスは、会員のブラウザではなくサーバが行います。',
    attack:
      '攻撃者は、画像のURLの代わりに、外部からは届かない内部APIのURLを入力します。Webアプリはそれをそのまま取りに行き、内部APIの応答（APIの鍵）を攻撃者に返してしまいます（SSRF）。',
    defense:
      'Webアプリは、取りに行くURLを許可したホストに限り、名前解決したIPアドレスがプライベートアドレスなら拒否します。さらに内部APIにも認証をかけ、Webサーバから内部APIへの不要な通信を止めます（多層防御）。',
    incident:
      'SSRFで内部APIの鍵を盗まれ、その鍵で顧客の情報を取得されたあとの対応です。Webサーバのアクセスログから攻撃のURLを特定し、機能を止めて鍵を無効にします。',
  },
  states: [
    {
      id: 'web',
      title: 'Webアプリの設定',
      columns: ['項目', '内容'],
      initial: {
        normal: [['URLの取り込み', '入力されたURLにサーバがアクセスする']],
        attack: [
          ['URLの取り込み', '入力されたURLにサーバがアクセスする'],
          ['URLの検証', 'なし（どこへでもアクセスする）', 'attack'],
        ],
        defense: [
          ['URLの検証', '許可したホストだけ。プライベート・ループバック・リンクローカルのアドレスは拒否', 'defense'],
          ['リダイレクト', '追わない', 'defense'],
        ],
        incident: [['アクセスログ', '02:10 POST /profile/image url=http://172.16.0.20/admin/keys', 'attack']],
      },
    },
    {
      id: 'api',
      title: '内部APIの設定',
      columns: ['項目', '内容'],
      modes: ['attack', 'defense', 'incident'],
      initial: {
        attack: [
          ['受け付ける相手', 'DMZの中からなら、だれでも（認証なし）', 'attack'],
          ['/admin/keys', '外部サービスのAPIの鍵を返す', 'attack'],
        ],
        defense: [
          ['受け付ける相手', '認証トークンを持つ相手だけ', 'defense'],
          ['FW・ACL', 'Webサーバからは、必要なAPIだけ許可', 'defense'],
        ],
        incident: [['/admin/keys', '02:10 172.16.0.10（Webサーバ）から取得された', 'attack']],
      },
    },
    { id: 'loot', title: '攻撃者の手元', columns: ['項目', '内容'], modes: ['attack'] },
    IR_TABLE,
  ],
  steps: {
    normal: [
      {
        from: 'user',
        to: 'web',
        kind: 'normal',
        label: '画像のURLを送る',
        title: 'プロフィール画像のURLを入力する',
        fields: [
          ['画面', 'プロフィール画像（URLで指定）'],
          ['url', 'https://img.example.net/cat.png'],
        ],
        note: '会員は、ファイルを送る代わりに、画像のあるURLを入力します。',
        send: '会員：画像のURLを入力して、保存します。',
        via: { fw: FW_IN },
        receive: 'Webアプリ：入力されたURLの画像を、サーバから取りに行くことにします。',
        wire: { app: 'HTTP（POST /profile/image）', transport: 'TCP', srcPort: '50100', dstPort: '443', dstIp: SITE, secure: 'TLS', focus: ['l7'] },
      },
      {
        from: 'web',
        to: 'img',
        kind: 'normal',
        label: 'GET 画像',
        title: 'サーバが、そのURLにアクセスする',
        fields: [
          ['要求', 'GET https://img.example.net/cat.png'],
          ['送信元', 'Webサーバ（会員のブラウザではない）'],
        ],
        note: 'URLにアクセスするのは、会員のブラウザではなく、Webサーバです。Webサーバの位置（DMZ）と権限で、通信が行われます。',
        point: 'サーバが利用者の指定したURLにアクセスする機能（画像の取り込み、Webhook、PDF化、URLのプレビュー）は、SSRFの入口になりえます。',
        send: 'Webアプリ：画像サイトへ、画像を取りに行きます。',
        via: { fw: FW_OUT },
        receive: '画像サイト：画像を返します。',
        wire: { app: 'HTTP（GET /cat.png）', transport: 'TCP', srcPort: '41500', dstPort: '443', srcIp: SITE, dstIp: IMG, secure: 'TLS', focus: ['l3'] },
      },
      {
        from: 'web',
        to: 'user',
        kind: 'normal',
        label: '画像を表示',
        title: '取り込んだ画像を表示する',
        fields: [
          ['画面', 'プロフィールに、取り込んだ画像を表示'],
          ['保存', 'Webサーバに画像を保存'],
        ],
        note: '取り込んだものを、そのまま画面に表示しています。中身が画像でなかった場合も、そのまま返してしまうのが問題になります。',
        send: 'Webアプリ：画像を保存し、プロフィールの画面を返します。',
        receive: '会員：プロフィールに画像が表示されます。',
        wire: { app: 'HTTP（200 OK）', transport: 'TCP', srcPort: '443', dstPort: '50100', srcIp: SITE, secure: 'TLS' },
      },
    ],
    attack: [
      {
        from: 'atk',
        to: 'web',
        kind: 'attack',
        label: '内部のURLを送る',
        title: '画像の代わりに、内部APIのURLを入力する',
        fields: [
          ['url', 'http://172.16.0.20/admin/keys'],
          ['宛先', '内部API（外部からはFWで届かない）'],
        ],
        note: '攻撃者は、内部APIに直接はアクセスできません。そこで、内部APIに届く場所にいるWebサーバに、代わりにアクセスさせます。',
        send: '攻撃者：プロフィール画像のURLとして、内部APIのURLを送ります。',
        via: { fw: FW_IN },
        receive: 'Webアプリ：URLを確かめずに、そのまま取りに行きます。',
        wire: { app: 'HTTP（POST /profile/image）', transport: 'TCP', srcPort: '55100', dstPort: '443', srcIp: ATK, dstIp: SITE, secure: 'TLS', focus: ['l7'] },
      },
      {
        from: 'web',
        to: 'api',
        kind: 'attack',
        label: 'GET /admin/keys',
        title: 'Webサーバが、内部APIにアクセスしてしまう',
        fields: [
          ['要求', 'GET http://172.16.0.20/admin/keys'],
          ['送信元', `Webサーバ（${WEB_IN}）`],
        ],
        note: '要求を送っているのは、信頼されたDMZの中のWebサーバです。FWも通らないので、外部からの攻撃とは見えません。',
        point: 'SSRFは、サーバを踏み台にして、外部から届かない内部のサーバや、クラウドのメタデータ（認証情報を返す内部のURL）にアクセスさせる攻撃です。',
        send: 'Webアプリ：指定されたURLへ、内部APIにアクセスします。',
        via: { dsw: DSW },
        receive: '内部API：DMZの中からの要求なので、認証せずに受け付けます。',
        wire: { app: 'HTTP（GET /admin/keys）', transport: 'TCP', srcPort: '41600', dstPort: '80', srcIp: WEB_IN, dstIp: API, focus: ['l3', 'l7'] },
      },
      {
        from: 'api',
        to: 'web',
        kind: 'attack',
        label: 'APIの鍵',
        title: '内部APIが、APIの鍵を返す',
        fields: [
          ['応答', '{"payment_api_key": "sk_live_…", "crm_token": "…"}'],
          ['状態', '内部向けなので、認証をしていなかった'],
        ],
        note: '「外部から届かないから安全」という前提で、内部APIには認証がありませんでした。',
        send: '内部API：外部サービスのAPIの鍵を返します。',
        via: { dsw: 'DMZのスイッチ：同じDMZの中なので、そのままWebサーバへ届けます。' },
        receive: 'Webアプリ：受け取った応答を、画像として保存します。',
        wire: { app: 'HTTP（200 OK＋JSON）', transport: 'TCP', srcPort: '80', dstPort: '41600', srcIp: API, dstIp: WEB_IN, focus: ['l7'] },
      },
      {
        from: 'web',
        to: 'atk',
        kind: 'attack',
        label: '応答をそのまま返す',
        title: '取り込んだ中身が、攻撃者に返る',
        fields: [
          ['画面', '画像の代わりに、取り込んだ中身（またはエラーの詳細）'],
          ['中身', 'APIの鍵'],
        ],
        note: '中身をそのまま表示しなくても、エラーメッセージや応答の時間の違いから、内部のサーバやポートの有無を調べられることがあります。',
        send: 'Webアプリ：取り込んだ中身を返します。',
        receive: '攻撃者：APIの鍵を手に入れます。この鍵で、外部の決済サービスや顧客管理サービスを操作できます。',
        wire: { app: 'HTTP（200 OK）', transport: 'TCP', srcPort: '443', dstPort: '55100', srcIp: SITE, dstIp: ATK, secure: 'TLS' },
        changes: [{ table: 'loot', key: '盗んだもの', value: '決済サービスのAPIの鍵、顧客管理サービスのトークン', tone: 'attack' }],
      },
    ],
    defense: [
      {
        from: 'atk',
        to: 'web',
        kind: 'blocked',
        label: '内部のURL → 拒否',
        title: 'URLを確かめて、内部のアドレスを拒否する',
        fields: [
          ['url', 'http://172.16.0.20/admin/keys'],
          ['検証', '許可したホストではない。名前解決したアドレスがプライベートアドレス → 拒否'],
        ],
        note: 'URLの文字列だけでなく、名前解決したあとのIPアドレスで確かめます。文字列だけを見ると、内部のアドレスに名前解決されるドメインや、リダイレクトで迂回されます。',
        point:
          'SSRFの対策は、許可リスト（取りに行ってよいホスト）で絞ることです。禁止するアドレスを並べる方式は、表記の言い換え（10進数の表記など）で迂回されやすくなります。',
        send: '攻撃者：内部APIのURLを、画像のURLとして送ります。',
        via: { fw: FW_IN },
        blockedAt: 'web',
        receive: 'Webアプリ：許可したホストではなく、アドレスもプライベートなので、取りに行かずに拒否します。',
        wire: { app: 'HTTP（POST /profile/image）', transport: 'TCP', srcPort: '55100', dstPort: '443', srcIp: ATK, dstIp: SITE, secure: 'TLS', focus: ['l7'] },
        changes: [{ table: 'web', key: '拒否の記録', value: 'プライベートアドレスへの取り込み（172.16.0.20）', tone: 'defense' }],
      },
      {
        from: 'web',
        to: 'api',
        kind: 'blocked',
        label: '認証なし → 拒否',
        title: '内部APIでも、認証で止める',
        fields: [
          ['要求', 'GET http://172.16.0.20/admin/keys（認証トークンなし）'],
          ['内部API', '認証トークンがない → 401で拒否'],
        ],
        note: 'Webアプリの検証をすり抜けられた場合に備えます。「内部だから信頼する」をやめ、内部のAPIにも認証をかけます（ゼロトラストの考え方）。',
        send: 'Webアプリ：（検証をすり抜けられたとして）内部APIへアクセスします。',
        via: { dsw: DSW },
        blockedAt: 'adns',
        receive: '内部API：認証トークンがないので、拒否して記録します。',
        wire: { app: 'HTTP（GET /admin/keys）', transport: 'TCP', srcPort: '41600', dstPort: '80', srcIp: WEB_IN, dstIp: API, focus: ['l7'] },
        changes: [{ table: 'api', key: '拒否の記録', value: '認証のない /admin/keys への要求', tone: 'defense' }],
      },
      {
        from: 'user',
        to: 'web',
        kind: 'defense',
        label: '画像のURLを送る',
        title: '許可した画像サイトのURLは受け付ける',
        fields: [
          ['url', 'https://img.example.net/cat.png'],
          ['検証', '許可したホスト。名前解決したアドレスもグローバル → 許可'],
        ],
        note: '許可リストに載っている画像サイトだけを受け付けます。',
        send: '会員：画像のURLを入力します。',
        via: { fw: FW_IN },
        receive: 'Webアプリ：検証に通ったので、画像を取りに行きます。',
        wire: { app: 'HTTP（POST /profile/image）', transport: 'TCP', srcPort: '50100', dstPort: '443', dstIp: SITE, secure: 'TLS', focus: ['l7'] },
      },
      {
        from: 'web',
        to: 'user',
        kind: 'defense',
        label: '確かめた画像を表示',
        title: '中身が画像であることを確かめてから表示する',
        fields: [
          ['取得', 'リダイレクトは追わない。応答が画像の形式でなければ捨てる'],
          ['画面', 'プロフィールに画像を表示（エラーの詳細は返さない）'],
        ],
        note: '許可したサイトから内部のアドレスへリダイレクトさせる迂回もあるので、リダイレクトは追いません。取り込みに失敗しても、内部の様子が分かるエラーの詳細は返しません。',
        send: 'Webアプリ：画像サイトから取得した中身が画像であることを確かめて保存し、画面を返します。',
        receive: '会員：プロフィールに画像が表示されます。',
        wire: { app: 'HTTP（200 OK）', transport: 'TCP', srcPort: '443', dstPort: '50100', srcIp: SITE, secure: 'TLS' },
      },
    ],
    incident: [
      {
        from: 'api',
        to: 'csirt',
        kind: 'response',
        phase: 'detect',
        label: '不審な利用',
        title: '外部サービスの、身に覚えのない利用で気付く',
        fields: [
          ['決済サービス', '深夜に、見知らぬIPアドレスからAPIの鍵で返金の操作'],
          ['内部API', '/admin/keys が、Webサーバから呼ばれた記録'],
        ],
        note: '外部サービスの利用の記録と、社内のログを突き合わせて、鍵がどこから漏れたかを探ります。',
        send: '内部API：普段は呼ばれない /admin/keys へのアクセスを記録しています。',
        receive: 'CSIRT：決済サービスからの連絡と合わせて、鍵の漏えいを疑います。',
        changes: [ir('detect', '外部サービスでの不審な操作と、/admin/keys へのアクセス')],
      },
      {
        from: 'csirt',
        to: 'web',
        kind: 'response',
        phase: 'triage',
        label: 'ログを調べる',
        title: 'Webサーバのログから、攻撃のURLを特定する',
        fields: [
          ['アクセスログ', '02:10 POST /profile/image url=http://172.16.0.20/admin/keys（送信元 192.0.2.66）'],
          ['判断', 'URLの取り込み機能のSSRF。内部APIの鍵が漏えい。優先度：最高'],
        ],
        note: '取り込みのURLを記録していなかったら、原因の特定は難しくなります。外部へのアクセスの先も記録します。',
        send: 'CSIRT：Webサーバと内部APIのログを突き合わせます。',
        receive: 'Webアプリ：内部のアドレスを指定した取り込みの記録が見つかります。',
        changes: [ir('triage', 'SSRFによるAPIの鍵の漏えい。優先度：最高')],
      },
      {
        from: 'csirt',
        to: 'web',
        kind: 'response',
        phase: 'contain',
        label: '機能を停止',
        title: '機能を止め、鍵を無効にする',
        fields: [
          ['機能', 'URLからの画像の取り込みを停止'],
          ['鍵', '漏えいしたAPIの鍵とトークンを無効にし、新しいものを発行'],
          ['送信元', '攻撃元のIPアドレスを遮断'],
        ],
        note: '鍵を無効にするまでは、攻撃者は外部サービスを使い続けられます。機能の停止と同時に、鍵を無効にします。',
        send: 'CSIRT：取り込み機能の停止と、鍵の無効化を指示します。',
        receive: 'Webアプリ：取り込み機能を止めます。外部サービスの鍵も無効にします。',
        changes: [ir('contain', '取り込み機能を停止、APIの鍵を無効化して再発行')],
      },
      {
        from: 'csirt',
        to: 'web',
        kind: 'response',
        phase: 'preserve',
        label: 'ログを保全',
        title: 'ログを保全する',
        fields: [['取得するもの', 'Webサーバのアクセスログ、内部APIのログ、外部サービスの操作の記録']],
        note: '外部サービスでの操作の記録から、どの顧客の情報に触れられたかを調べます。',
        send: 'CSIRT：各ログを書き出して保全します。',
        receive: 'Webアプリ：ログを書き出します。',
        changes: [ir('preserve', 'Webサーバ・内部API・外部サービスのログを保全')],
      },
      {
        from: 'csirt',
        to: 'api',
        kind: 'response',
        phase: 'recover',
        label: '修正',
        title: '検証と認証を入れてから再開する',
        fields: [
          ['Webアプリ', 'URLの許可リスト、名前解決後のアドレスの確認、リダイレクトを追わない'],
          ['内部API', '認証を必須に。鍵を返すAPIは廃止し、鍵は専用の保管庫で管理'],
          ['ネットワーク', 'Webサーバから内部APIへは、必要な通信だけ許可'],
        ],
        note: '1つの対策に頼らず、アプリ・API・ネットワークの3か所で止めます（多層防御）。',
        send: 'CSIRT：修正を確かめ、攻撃と同じURLが拒否されることを試験します。',
        receive: '内部API：認証を有効にします。',
        changes: [
          { table: 'api', key: '受け付ける相手', value: '認証トークンを持つ相手だけ', tone: 'defense' },
          ir('recover', 'URLの許可リスト、内部APIの認証、通信の制限を入れて再開'),
        ],
      },
      {
        from: 'csirt',
        to: 'user',
        kind: 'response',
        phase: 'report',
        label: '報告',
        title: '顧客と関係先に知らせる',
        fields: [
          ['外部サービスの事業者', '鍵の漏えいと不正な操作の連絡'],
          ['顧客', '不正な返金や情報の閲覧の影響を受けた顧客に連絡'],
          ['個人情報保護委員会', '顧客の個人データの漏えいのおそれ → 速報と確報'],
        ],
        note: '鍵で操作された外部サービスの範囲が、影響の範囲になります。',
        send: 'CSIRT：影響を受けた顧客に連絡します。',
        receive: '会員：連絡を受けます。',
        changes: [ir('report', '外部サービスの事業者と顧客に連絡、個人情報保護委員会へ報告')],
      },
      {
        from: 'csirt',
        to: 'csirt',
        kind: 'response',
        phase: 'improve',
        label: '再発防止',
        title: '「内部だから安全」をやめる',
        fields: [
          ['設計', 'サーバがURLにアクセスする機能を、脅威モデリングで洗い出す'],
          ['検査', '脆弱性診断の項目にSSRFを加える'],
          ['秘密の管理', 'APIの鍵をアプリのコードや内部APIに置かず、専用の保管庫で管理し、定期的に更新'],
        ],
        note: 'クラウドでは、インスタンスのメタデータ（認証情報を返す内部のURL）がSSRFで狙われます。トークンを必須にする方式（IMDSv2など）を使います。',
        receive: 'CSIRT：設計と検査の手順を見直します。',
        changes: [ir('improve', '脅威モデリング、SSRFの診断、秘密の保管庫での管理')],
      },
    ],
  },
  points: [
    'SSRFは、利用者が指定したURLにサーバがアクセスする機能を悪用し、外部から届かない内部のサーバにアクセスさせる',
    'クラウドでは、インスタンスのメタデータ（169.254.169.254 など）から認証情報を盗まれる。トークンを必須にする方式（IMDSv2など）で守る',
    '対策は、許可リストでアクセス先を絞り、名前解決後のIPアドレスを確かめ、リダイレクトを追わないこと',
    '「内部だから認証しない」は危険。内部のAPIにも認証をかけ、通信も必要なものだけ許可する（多層防御、ゼロトラスト）',
  ],
  incidentPoints: [
    '外部サービスでの不審な操作と、社内のログを突き合わせて、鍵の漏れた経路を探す',
    '機能の停止と同時に、漏えいした鍵を無効にして再発行する',
    'サーバから外部・内部へのアクセスの先も、ログに記録しておく',
  ],
  topology: {
    map: {
      user: 'laptop',
      web: 'web',
      img: 'ext2',
      api: 'adns',
      atk: 'ext1',
      csirt: 'soc',
    },
    mobile: true,
    hidden: ['fakeap'],
    shields: ['web', 'adns'],
    devices: {
      ext1: { type: 'pc', name: '攻撃者', sub: '' },
      ext2: { type: 'server', name: '画像サイト', sub: 'img.example.net' },
    },
    labels: {
      web: ['Web', 'Webアプリ'],
      adns: ['内部API', '社内向け'],
      laptop: ['会員', 'ブラウザ'],
      ap: ['回線', ''],
    },
  },
})
