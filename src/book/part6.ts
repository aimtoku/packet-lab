import { actor, cell, fig, layers, link, list, m, map, mAdd, node, note, p, seq, steps, table, zone } from './fig'
import type { Chapter } from './types'

// 第6部 組織を狙う攻撃と運用

const pc = actor('pc', '社員のPC', 'pc')
const proxy = actor('proxy', 'プロキシ', 'server')
const c2 = actor('c2', 'C&Cサーバ', 'server', { attacker: true })

export const apt: Chapter = {
  id: 'apt',
  part: 'ops',
  title: '標的型攻撃と多層防御',
  lead: '特定の組織を狙う攻撃は、1通のメールから始まり、時間をかけて社内に広がり、情報を持ち出します。社内からWebを見る仕組みから始めて、攻撃の段階と、入口・内部・出口で重ねる対策を積み上げます。',
  sections: [
    {
      id: 'proxy',
      title: 'プロキシ経由のWeb閲覧',
      blocks: [
        p(
          '多くの企業では、社内のPCがインターネットのWebサイトを見るとき、PCが直接接続するのではなく、DMZのプロキシサーバに接続を頼みます。プロキシが代わりにWebサイトに接続し、結果をPCに返します。',
        ),
        p('FWでは、社内からインターネットへのWebの通信を、プロキシからのものだけに許可します。こうすると、Webの通信を1か所で認証・記録・制限できます。'),
        fig(
          map(
            5,
            2,
            [
              node('pc', '社員のPC', 'pc', 0, 1),
              node('fw', 'FW', 'fw', 1, 0),
              node('proxy', 'プロキシ', 'server', 2, 1, { add: true }),
              node('net', 'インターネット', 'cloud', 3, 0),
              node('site', 'Webサイト', 'server', 4, 0),
            ],
            [
              link('pc', 'fw', { arrow: true, label: 'プロキシへ' }),
              link('fw', 'proxy', { arrow: true, add: true }),
              link('proxy', 'net', {
                arrow: true,
                label: '代わりに接続',
                add: true,
              }),
              link('net', 'site', { arrow: true }),
            ],
            [zone('DMZ', 1.6, 1.05, 1.4, 0.95, true)],
          ),
          '社内のPCは、プロキシを経由してWebを見る',
        ),
      ],
      see: { mode: 'normal', step: 2, label: 'プロキシが代わりに接続する' },
    },
    {
      id: 'stages',
      title: '攻撃の段階',
      blocks: [
        p('標的型攻撃は、いくつもの段階を踏んで進みます。どの段階で気付き、止めるかを考えるために、段階に分けて捉えます（サイバーキルチェーン）。'),
        steps(
          ['偵察・準備', '組織の人や取引先を調べ、もっともらしいメールとマルウェアを用意する'],
          ['侵入', '標的型メールの添付ファイルやリンクを開かせ、PCをマルウェアに感染させる'],
          ['C&Cとの通信', '感染したPCが、攻撃者のC&Cサーバと定期的に通信し、命令を受け取る'],
          ['内部での活動', '管理者のIDを盗み、ほかのPCやサーバへ広がる（横展開）'],
          ['目的の実行', '目的の情報を集め、外へ送り出す（持ち出し）'],
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), pc, proxy, actor('c2', 'C&Cサーバ', 'server', { attacker: true, add: true })],
            [
              m('x', 'pc', '標的型メール（添付ファイル）', 'attack'),
              mAdd('pc', 'pc', '添付ファイルを開き、マルウェアに感染', 'attack'),
              mAdd('pc', 'proxy', 'Webの通信に見せかけて外へ', 'attack'),
              mAdd('proxy', 'c2', 'C&Cサーバとつながる', 'attack'),
            ],
          ),
          '感染したPCは、Webの通信に紛れてC&Cサーバとつながる',
        ),
      ],
      see: { mode: 'attack', step: 2, label: 'マルウェアが外部と通信を始める' },
    },
    {
      id: 'lateral',
      title: '横展開と持ち出し',
      blocks: [
        p(
          '攻撃者は、感染したPCから社内を調べ、パスワードの使い回しや、PCに残った管理者の認証情報を使って、ファイルサーバなどに入ります（横展開）。目的の情報をPCに集め、目立ちにくい深夜などに、HTTPSで外へ送り出します。',
        ),
        fig(
          map(
            4,
            2,
            [
              node('pc', '感染したPC', 'pc', 0, 1, { attacker: true }),
              node('fs', 'ファイルサーバ', 'server', 2, 1),
              node('proxy', 'プロキシ', 'server', 1, 0),
              node('c2', 'C&Cサーバ', 'server', 3, 0, { attacker: true }),
            ],
            [
              link('pc', 'fs', {
                arrow: true,
                tone: 'attack',
                label: '管理者のIDで侵入',
                add: true,
              }),
              link('pc', 'proxy', { arrow: true, tone: 'attack' }),
              link('proxy', 'c2', {
                arrow: true,
                tone: 'attack',
                label: '深夜に持ち出し',
                add: true,
              }),
            ],
            [zone('社内', 0, 0.55, 3, 1.45)],
          ),
          '社内で広がり、集めた情報を外へ送り出す',
        ),
      ],
      see: {
        mode: 'attack',
        step: 4,
        label: '管理者のIDでファイルサーバに入る（横展開）',
      },
    },
    {
      id: 'defense',
      title: '入口・内部・出口で対策を重ねる',
      blocks: [
        p('巧妙なメールを完全に防ぐことはできないので、感染する前提で、段階ごとに対策を重ねます（多層防御）。'),
        p(
          '出口対策が特に重要です。FWでPCからの直接の外部接続を禁止し、プロキシでは利用者の認証を求めます。マルウェアは利用者のパスワードを知らないことが多いので、プロキシの認証で止まります。URLフィルタで、既知の不正なサイトへの接続も止めます。',
        ),
        fig(
          map(
            4,
            2,
            [
              node('pc', '感染したPC', 'pc', 0, 1, {
                sub: 'EDRが記録・隔離',
                add: true,
              }),
              node('fw', 'FW', 'fw', 1, 0),
              node('proxy', 'プロキシ', 'server', 2, 1, {
                sub: '認証・URLフィルタ',
                add: true,
              }),
              node('c2', 'C&Cサーバ', 'server', 3, 0, { attacker: true }),
            ],
            [
              link('pc', 'fw', {
                arrow: true,
                tone: 'blocked',
                label: '直接の外部接続：拒否',
                add: true,
              }),
              link('pc', 'proxy', {
                arrow: true,
                tone: 'blocked',
                label: '認証に失敗',
                add: true,
              }),
              link('proxy', 'c2', { tone: 'muted', dashed: true }),
            ],
          ),
          '直接の接続はFWで、プロキシ経由はプロキシの認証で止める',
        ),
        table(
          ['段階', '対策の例'],
          ['入口', 'メールのフィルタ、サンドボックス、添付ファイルの無害化、訓練'],
          ['内部', 'EDR、特権IDの管理、パスワードの使い回しの禁止、セグメントの分割'],
          ['出口', 'FWでの直接接続の禁止、プロキシの認証、URLフィルタ、通信ログの監視'],
          ['全体', 'SIEMでのログの突き合わせ、CSIRTによる対応、IoCの共有'],
        ),
      ],
      see: { mode: 'defense', step: 3, label: 'プロキシ認証に失敗する' },
    },
    {
      id: 'detect',
      title: '気付く：ログを突き合わせる',
      blocks: [
        p(
          'C&Cとの通信は、ふつうのWebの通信に紛れるので、1つのログだけでは気付きにくいものです。プロキシのログで「同じ宛先へ、一定の間隔で通信している」「深夜に大量に送っている」といった特徴を見つけ、EDRやファイルサーバのログと突き合わせます。',
        ),
        fig(
          seq(
            [actor('siem', 'SIEM', 'server', { add: true }), proxy, actor('edr', 'EDR', 'server')],
            [
              mAdd('proxy', 'siem', '深夜に同じ宛先へ大量の送信'),
              mAdd('edr', 'siem', '同じPCで不審なプロセス'),
              mAdd('siem', 'siem', '突き合わせて警報', 'defense'),
            ],
          ),
          '複数のログを突き合わせて、攻撃に気付く',
        ),
        note('見つけた宛先やファイルの特徴（IoC）は、ISACなどで共有すると、ほかの組織の防御にも役立ちます。'),
      ],
      see: { mode: 'incident', step: 1, label: 'ログを突き合わせて気付く' },
    },
  ],
}

const resolver = actor('r', 'オープンリゾルバ', 'server', { sub: '踏み台' })
const victimA = actor('v', '被害者のサーバ', 'server')

export const ddos: Chapter = {
  id: 'ddos',
  part: 'ops',
  title: 'DDoS攻撃とDNSリフレクション',
  lead: '大量の通信で、サービスを使えなくする攻撃がDoS攻撃です。UDPの性質（第3章）を悪用して、小さな問合せを大きな応答に変える「増幅」の仕組みと、送る側・受ける側の対策を積み上げます。',
  sections: [
    {
      id: 'dos',
      title: 'DoS攻撃とDDoS攻撃',
      blocks: [
        p(
          'DoS攻撃は、サーバや回線の処理能力を超える通信を送りつけて、正規の利用者がサービスを使えないようにする攻撃です（可用性の侵害）。多数の機器から一斉に行うものをDDoS攻撃といい、乗っ取ったIoT機器などの集まり（ボットネット）がよく使われます。',
        ),
        fig(
          map(
            4,
            3,
            [
              node('b1', 'ボット', 'laptop', 0, 0, { attacker: true }),
              node('b2', 'ボット', 'laptop', 0, 1, { attacker: true }),
              node('b3', 'ボット', 'laptop', 0, 2, { attacker: true }),
              node('net', 'インターネット', 'cloud', 1, 1),
              node('v', '被害者のサーバ', 'server', 3, 1),
            ],
            [
              link('b1', 'net', { arrow: true, tone: 'attack' }),
              link('b2', 'net', { arrow: true, tone: 'attack' }),
              link('b3', 'net', { arrow: true, tone: 'attack' }),
              link('net', 'v', {
                arrow: true,
                tone: 'attack',
                label: '回線があふれる',
              }),
            ],
          ),
          '多数の機器から一斉に通信を送りつける',
        ),
      ],
    },
    {
      id: 'spoof',
      title: '送信元を偽った問合せ',
      blocks: [
        p(
          'UDPには接続の手順がないので、送信元IPアドレスを偽っても、問合せは相手に届き、応答は偽った送信元へ返されます。攻撃者は、送信元を被害者のIPアドレスにした問合せを、だれからの問合せにも答えるDNSサーバ（オープンリゾルバ）へ送ります。',
        ),
        fig(
          layers(
            [
              '攻撃者が送る問合せ（約60バイト）',
              [
                cell('l3', '送信元IP', '被害者（偽り）', { w: 1.4, add: true }),
                cell('l3', '宛先IP', 'リゾルバ', { w: 1.2 }),
                cell('l4', 'UDP', '53', { w: 0.8 }),
                cell('l7', 'DNSの問合せ', undefined, { w: 1 }),
              ],
            ],
            [
              'リゾルバの応答（数千バイト）',
              [
                cell('l3', '送信元IP', 'リゾルバ', { w: 1.4 }),
                cell('l3', '宛先IP', '被害者', { w: 1.2 }),
                cell('l4', 'UDP', '53', { w: 0.8 }),
                cell('l7', 'DNSの応答', '大きい', { w: 3, add: true }),
              ],
            ],
          ),
          '送信元を偽ると、大きな応答が被害者に返される',
        ),
      ],
      see: {
        mode: 'attack',
        step: 1,
        label: '被害者になりすまして問い合わせる',
      },
    },
    {
      id: 'amplify',
      title: '増幅して跳ね返す',
      blocks: [
        p(
          '攻撃者は、応答が大きくなる問合せ（EDNS0で大きな応答を許し、多くのレコードを返させるもの）を選びます。数十バイトの問合せが数千バイトの応答になり、数十倍に増幅されます。',
        ),
        p(
          '多数のオープンリゾルバを踏み台にすると、攻撃者自身の回線よりはるかに大きな通信を、被害者に向けられます。被害者から見ると、送ってきたのは各地のDNSサーバで、攻撃者は見えません。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), resolver, victimA],
            [
              m('x', 'r', '小さな問合せ（送信元＝被害者）', 'attack'),
              mAdd('r', 'v', '大きな応答（数十倍）', 'attack'),
              m('x', 'r', '小さな問合せ …（大量に）', 'attack'),
              mAdd('r', 'v', '大きな応答 …（大量に）', 'attack'),
              mAdd('v', 'v', '回線とサーバがあふれる', 'attack'),
            ],
          ),
          '踏み台で増幅し、被害者に跳ね返す（DNSリフレクション攻撃）',
        ),
      ],
      see: { mode: 'attack', step: 2, label: '増幅された応答が被害者に届く' },
    },
    {
      id: 'not-reflector',
      title: '対策1：踏み台にならない',
      blocks: [
        p(
          '自組織のDNSサーバを踏み台にさせないことが、インターネット全体を守ることにつながります。キャッシュDNSは社内からの問合せだけに答え（オープンリゾルバにしない）、権威DNSは応答の数を制限します（RRL）。',
        ),
        p(
          '自組織のネットワークから外へ出るパケットのうち、送信元が自組織のアドレスでないものを捨てる（イングレスフィルタリング）と、自組織の中の機器が送信元を偽った攻撃に加わることも防げます。',
        ),
        fig(
          map(
            4,
            1,
            [
              node('x', '攻撃者', 'laptop', 0, 0, { attacker: true }),
              node('fw', '自組織の出口', 'fw', 1, 0, {
                sub: 'イングレスフィルタリング',
                add: true,
              }),
              node('r', 'DNSサーバ', 'server', 2, 0, {
                sub: '社内だけに回答・RRL',
                add: true,
              }),
              node('v', '被害者', 'server', 3, 0),
            ],
            [
              link('x', 'fw', {
                arrow: true,
                tone: 'blocked',
                label: '送信元の偽装：遮断',
                add: true,
              }),
              link('r', 'v', {
                tone: 'muted',
                dashed: true,
                label: '応答しない',
              }),
            ],
          ),
          '送信元を偽ったパケットを出さず、外部からの問合せに答えない',
        ),
      ],
      see: { mode: 'defense', step: 1, label: 'オープンリゾルバをなくす' },
    },
    {
      id: 'absorb',
      title: '対策2：受ける側の備え',
      blocks: [
        p(
          '被害者の側では、自分の回線に届いてしまってからでは対処できません。回線があふれる前に、上流のISPで攻撃の通信を捨ててもらったり、DDoS対策サービスやCDNで大量の通信を吸収したりします。',
        ),
        fig(
          seq(
            [resolver, actor('isp', 'ISP・対策サービス', 'cloud', { add: true }), victimA, actor('u', '利用者', 'pc')],
            [m('r', 'isp', '大量の応答', 'attack'), mAdd('isp', 'isp', '上流で攻撃の通信を捨てる', 'defense'), mAdd('u', 'v', '正規の通信は届く', 'defense')],
          ),
          '回線があふれる前に、上流で捨てる',
        ),
        table(
          ['立場', '対策'],
          ['踏み台にならない', 'オープンリゾルバをなくす、RRL、イングレスフィルタリング、IoT機器の初期パスワードの変更'],
          ['攻撃を受ける', 'ISPとの連携（上流での遮断）、DDoS対策サービス、CDN、平時の通信量の把握'],
          ['事後', '攻撃の記録の保全、利用者への告知、次の攻撃への備え（連絡先・手順の整備）'],
        ),
      ],
      see: { mode: 'defense', step: 3, label: '上流で攻撃の通信を捨てる' },
    },
  ],
}

const staff = actor('staff', '社員', 'pc')
const bucket = actor('bucket', 'クラウドストレージ', 'cloud')
const partner = actor('partner', '取引先', 'pc')

export const storage: Chapter = {
  id: 'storage',
  part: 'ops',
  title: 'クラウドストレージの設定ミス',
  lead: 'クラウドでは、だれに見せるかの設定は利用者の責任です。責任の分担から始めて、正しい共有のしかた、設定ミスで公開されてしまう流れ、そして仕組みで防ぎ・気付く方法を積み上げます。',
  sections: [
    {
      id: 'shared',
      title: '責任共有モデル',
      blocks: [
        p(
          'クラウドでは、クラウド事業者と利用者が、守る範囲を分担します（責任共有モデル）。建物や機器、基盤のソフトウェアは事業者が守りますが、保存したデータ、だれにアクセスを許すかの設定、IDの管理は、利用者の責任です。',
        ),
        p('IaaS、PaaS、SaaSと、事業者が受け持つ範囲が広がっても、データとアクセスの設定は常に利用者の側に残ります。'),
        fig(
          layers(
            [
              'クラウド事業者の責任',
              [
                cell('l2', '建物・機器', undefined, { w: 1 }),
                cell('l3', 'ネットワーク', undefined, { w: 1 }),
                cell('l4', '基盤のソフトウェア', undefined, { w: 1.3 }),
              ],
            ],
            [
              '利用者の責任',
              [
                cell('sec', 'アクセスの設定', '公開・共有', {
                  w: 1.3,
                  add: true,
                }),
                cell('l7', 'データ', undefined, { w: 1 }),
                cell('l7', 'IDと権限', undefined, { w: 1 }),
              ],
            ],
          ),
          'アクセスの設定は、利用者の責任',
        ),
      ],
    },
    {
      id: 'presigned',
      title: '正しい共有：期限付きのURL',
      blocks: [
        p(
          '取引先に資料を渡すとき、保存場所（バケット）全体を公開する必要はありません。そのファイルだけを、決まった時間だけ読める、署名付きのURL（期限付きURL）を発行して渡します。',
        ),
        fig(
          seq(
            [staff, bucket, partner],
            [
              m('staff', 'bucket', '資料をアップロード（非公開のまま）'),
              mAdd('bucket', 'staff', '期限付きのURL（例：24時間）', 'defense'),
              mAdd('staff', 'partner', 'URLを渡す'),
              mAdd('partner', 'bucket', '期限内だけ、そのファイルを読める', 'defense'),
            ],
          ),
          '公開せずに、期限付きのURLで共有する',
        ),
      ],
      see: {
        mode: 'normal',
        step: 3,
        label: '取引先と、期限付きのURLで共有する',
      },
    },
    {
      id: 'misconfig',
      title: '設定ミスによる公開',
      blocks: [
        p(
          '急いで共有しようとして、バケットを「だれでも読める」設定にしてしまうと、URLを知らない人でも、中のファイルの一覧を取得して読み出せます。攻撃者は、公開されたストレージを自動で探して回っています。',
        ),
        fig(
          seq(
            [staff, bucket, actor('x', '攻撃者', 'laptop', { attacker: true, add: true })],
            [
              mAdd('staff', 'bucket', '「だれでも読める」に設定', 'attack'),
              mAdd('x', 'bucket', '公開されたストレージを探して回る', 'attack'),
              mAdd('bucket', 'x', 'ファイルの一覧', 'attack'),
              mAdd('x', 'bucket', '顧客の一覧を持ち出す', 'attack'),
            ],
          ),
          '公開の設定にすると、だれでも一覧を取得して読み出せる',
        ),
      ],
      see: {
        mode: 'attack',
        step: 1,
        label: '急いで、だれでも読める設定にする',
      },
    },
    {
      id: 'guardrail',
      title: '仕組みで防ぐ',
      blocks: [
        p(
          '人の注意だけに頼らず、設定のミスができない仕組みにします。組織全体で「パブリックアクセスのブロック」を有効にすれば、個々の担当者が公開の設定をしようとしても拒否されます。',
        ),
        p(
          'CSPM（クラウドの設定の点検ツール）で、公開の設定や、ログの無効化などの危険な設定を毎日点検し、見つけたら知らせます。設定を変えられる権限も、必要な人に絞ります。',
        ),
        fig(
          map(
            3,
            2,
            [
              node('staff', '社員', 'pc', 0, 1),
              node('policy', '組織のルール', 'server', 1, 0, {
                sub: '公開をブロック',
                add: true,
              }),
              node('bucket', 'ストレージ', 'cloud', 1, 1),
              node('cspm', 'CSPM', 'server', 2, 0, {
                sub: '毎日点検',
                add: true,
              }),
              node('x', '攻撃者', 'laptop', 2, 1, { attacker: true }),
            ],
            [
              link('staff', 'bucket', {
                arrow: true,
                tone: 'blocked',
                label: '公開の設定：拒否',
                add: true,
              }),
              link('policy', 'bucket', { dashed: true, tone: 'defense' }),
              link('cspm', 'bucket', {
                dashed: true,
                tone: 'defense',
                label: '設定を点検',
                add: true,
              }),
              link('x', 'bucket', {
                arrow: true,
                tone: 'blocked',
                label: '外部から：拒否',
              }),
            ],
          ),
          '組織のルールで公開を拒否し、CSPMで点検する',
        ),
        table(
          ['対策', '働き'],
          ['パブリックアクセスのブロック', '公開の設定そのものを拒否する'],
          ['期限付きURL', '公開せずに、必要なファイルだけを共有する'],
          ['CSPM', '危険な設定を自動で点検し、知らせる'],
          ['権限の最小化', '設定を変えられる人を絞る'],
          ['アクセスログ・監査ログ', 'だれが何を読んだか、だれが設定を変えたかを残す'],
        ),
      ],
      see: {
        mode: 'defense',
        step: 1,
        label: '公開の設定は、組織のルールで拒否される',
      },
    },
    {
      id: 'logs',
      title: '気付いたら：止めてから、ログで確かめる',
      blocks: [
        p(
          '公開の設定に気付いたら、まず公開を止めます。次に、アクセスログで「公開されていた間に、だれが何を読み出したか」を、監査ログで「いつ、だれが設定を変えたか」を確かめます。ログは、クラウドの保存期間を過ぎると消えるので、早めに取得して保全します。',
        ),
        fig(
          seq(
            [actor('csirt', 'CSIRT', 'team', { add: true }), bucket, actor('log', 'ログ', 'server')],
            [
              mAdd('csirt', 'bucket', 'まず公開を止める', 'defense'),
              mAdd('csirt', 'log', 'アクセスログ・監査ログを取得'),
              mAdd('csirt', 'csirt', '読み出された範囲を確定', 'defense'),
            ],
          ),
          '公開を止め、ログで影響の範囲を確かめる',
        ),
        note('個人データの漏えい（またはそのおそれ）が分かったら、個人情報保護委員会への報告と、本人への通知が必要になる場合があります。'),
      ],
      see: {
        mode: 'incident',
        step: 4,
        label: 'アクセスログと監査ログを取得する',
      },
    },
  ],
}

const upd = actor('upd', 'ベンダーの更新サーバ', 'server')
const client = actor('pc', '社内のPC', 'pc')

export const supply: Chapter = {
  id: 'supply',
  part: 'ops',
  title: 'ソフトウェアの更新とサプライチェーン攻撃',
  lead: '信頼しているベンダーの更新を経由して、攻撃が届くことがあります。更新の仕組みとコード署名から始めて、更新の改ざん、署名の鍵の保護、段階的な適用と資産の把握までを積み上げます。',
  sections: [
    {
      id: 'update',
      title: 'ソフトウェアの更新の仕組み',
      blocks: [
        p(
          '多くのソフトウェアは、ベンダーの更新サーバに新しい版があるかを定期的に確かめ、あれば受け取って適用します。脆弱性の修正をすぐに届けられる、大切な仕組みです。',
        ),
        fig(
          seq([client, upd], [m('pc', 'upd', '新しい版はある？'), m('upd', 'pc', '新しい版のファイル'), m('pc', 'pc', '適用する')]),
          '新しい版を確かめて、受け取り、適用する',
        ),
      ],
      see: { mode: 'normal', step: 1, label: '新しい版があるかを確かめる' },
    },
    {
      id: 'codesign',
      title: 'コード署名',
      blocks: [
        p(
          '受け取ったファイルが本当にベンダーが作ったもので、書き換えられていないかを確かめるのがコード署名です。ベンダーは、署名用の秘密鍵でファイルに電子署名を付けます（第6章）。PCは、ベンダーの証明書で署名を検証してから適用します。',
        ),
        fig(
          layers([
            '署名付きの更新ファイル',
            [
              cell('l7', '更新のプログラム', undefined, { w: 3 }),
              cell('sec', 'ベンダーの署名', undefined, { w: 1.2, add: true }),
              cell('sec', 'ベンダーの証明書', undefined, { w: 1.2, add: true }),
            ],
          ]),
          '更新ファイルには、ベンダーの署名と証明書が付く',
        ),
        fig(
          seq(
            [actor('vendor', 'ベンダー', 'server', { add: true }), upd, client],
            [
              mAdd('vendor', 'vendor', '秘密鍵で署名'),
              m('vendor', 'upd', '署名付きのファイルを置く'),
              m('upd', 'pc', '署名付きのファイル'),
              mAdd('pc', 'pc', '署名を検証してから適用', 'defense'),
            ],
          ),
          '署名を検証できたものだけを適用する',
        ),
      ],
      see: { mode: 'normal', step: 3, label: '署名を確かめてから、適用する' },
    },
    {
      id: 'attack',
      title: 'サプライチェーン攻撃',
      blocks: [
        p(
          '攻撃者は、守りの固い標的を直接狙う代わりに、標的が信頼しているベンダーに侵入し、更新のファイルを不正なものに差し替えます。利用者はいつもどおり更新を受け取るだけで、バックドアを入れてしまいます。',
        ),
        p('1つのベンダーを経由して、そのソフトウェアを使う多くの組織に一度に入り込めるので、影響が大きくなります。'),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), upd, client, c2],
            [
              mAdd('x', 'upd', '更新サーバに侵入し、ファイルを差し替える', 'attack'),
              m('pc', 'upd', '新しい版はある？'),
              mAdd('upd', 'pc', '改ざんされたファイル', 'attack'),
              mAdd('pc', 'pc', 'バックドアが動き出す', 'attack'),
              mAdd('pc', 'c2', '攻撃者のサーバと通信', 'attack'),
            ],
          ),
          '信頼している更新の経路から、攻撃が届く',
        ),
      ],
      see: {
        mode: 'attack',
        step: 2,
        label: '更新のファイルを、不正なものに差し替える',
      },
    },
    {
      id: 'verify',
      title: '署名の検証と、署名の鍵の保護',
      blocks: [
        p(
          '更新サーバのファイルだけが差し替えられた場合、攻撃者はベンダーの秘密鍵を持たないので、正しい署名を付けられません。PCが署名を検証していれば、改ざんされたファイルは適用されません。',
        ),
        p(
          'そのため、ベンダーは署名用の秘密鍵を厳重に守る必要があります。秘密鍵を取り出せない専用の装置（HSM）に入れ、署名できる人と手順を限ります。ただし、攻撃者がベンダーの開発・ビルドの環境に入り込むと、正規の署名が付いた不正なファイルが作られてしまうので、署名の検証だけでは防げません。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), upd, client],
            [
              m('x', 'upd', 'ファイルを差し替える', 'attack'),
              m('upd', 'pc', '改ざんされたファイル', 'attack'),
              mAdd('pc', 'pc', '署名の検証に失敗 → 適用しない', 'defense'),
            ],
          ),
          '署名を確かめれば、差し替えられたファイルは適用されない',
        ),
      ],
      see: { mode: 'defense', step: 2, label: '署名を確かめて、適用しない' },
    },
    {
      id: 'staged',
      title: '段階的な適用と、資産の把握',
      blocks: [
        p(
          '署名が正しくても安全とは限らないので、更新はまず一部のPCで試し、問題がないことを確かめてから全体に広げます。ふだんと違う通信やふるまいは、EDRや通信の監視で見つけます。',
        ),
        p(
          'ベンダーが問題を公表したとき、影響を受けるPCをすぐに特定できるよう、どのPCにどのソフトウェアのどの版が入っているか（資産の一覧）を把握しておきます。ソフトウェアの部品の一覧であるSBOMも、含まれる部品の脆弱性を調べるのに役立ちます。',
        ),
        fig(
          map(
            3,
            2,
            [
              node('upd', '更新', 'server', 0, 0),
              node('pilot', '一部のPC', 'pc', 1, 0, {
                sub: 'まず試す',
                add: true,
              }),
              node('all', 'ほかのPC', 'pc', 2, 1, { sub: '問題がなければ' }),
            ],
            [
              link('upd', 'pilot', {
                arrow: true,
                label: '先に適用',
                add: true,
              }),
              link('pilot', 'all', {
                arrow: true,
                dashed: true,
                label: '確かめてから広げる',
                add: true,
              }),
            ],
          ),
          '一部で試してから、全体に広げる',
        ),
        list(
          '更新は一部のPCで試してから広げる',
          'どのPCに、どの版が入っているかを把握する（資産の一覧、SBOM）',
          '取引先・委託先のセキュリティの状況を、契約や評価で確かめる',
          'ベンダーの公表や、JVN・KEVなどの脆弱性の情報を集める',
        ),
      ],
      see: {
        mode: 'defense',
        step: 3,
        label: '更新は、一部のPCで試してから広げる',
      },
    },
  ],
}
