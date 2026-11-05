import { actor, cell, fig, layers, link, list, m, map, mAdd, node, note, p, seq, table, zone } from './fig'
import type { Chapter } from './types'

// 第5部 社内ネットワークとリモートアクセス

const pc = actor('pc', 'PC', 'pc', { sub: '192.168.1.10' })
const gw = actor('gw', 'ゲートウェイ', 'fw', { sub: '192.168.1.1' })

export const arp: Chapter = {
  id: 'arp',
  part: 'lan',
  title: 'ARPとARPスプーフィング',
  lead: '同じLANの中では、IPアドレスではなくMACアドレスで相手に届けます。その対応を調べるARPには、相手を確かめる仕組みがありません。ARPの仕組みから、なりすましの手口、スイッチでの対策までを積み上げます。',
  sections: [
    {
      id: 'lan',
      title: '同じLANの中はMACアドレスで届ける',
      blocks: [
        p(
          '第1章で見たとおり、Ethernetの見出しには宛先のMACアドレスを書きます。L2スイッチは、どのポートの先にどのMACアドレスの機器がつながっているかを覚えておき（MACアドレステーブル）、宛先のMACアドレスの機器がつながるポートにだけ転送します。',
        ),
        p(
          'PCが社外へ送るときは、宛先MACアドレスにゲートウェイ（社内の出口）のMACアドレスを書きます。そのため、PCはゲートウェイのIPアドレスに対応するMACアドレスを知る必要があります。',
        ),
        fig(
          map(
            4,
            2,
            [
              node('pc', 'PC', 'pc', 0, 1, { sub: '192.168.1.10' }),
              node('sw', 'L2スイッチ', 'switch', 2, 1),
              node('gw', 'ゲートウェイ', 'fw', 2, 0, { sub: '192.168.1.1' }),
              node('fs', 'ファイルサーバ', 'server', 3, 1),
            ],
            [link('pc', 'sw', { arrow: true, label: '宛先MAC：ゲートウェイ' }), link('sw', 'gw', { arrow: true }), link('sw', 'fs')],
            [zone('社内LAN', 0, 0.55, 4, 1.45)],
          ),
          'L2スイッチは、宛先MACアドレスを見て転送する',
        ),
      ],
    },
    {
      id: 'arp',
      title: 'ARP：IPアドレスからMACアドレスを調べる',
      blocks: [
        p(
          'PCは「192.168.1.1 のMACアドレスを持っている人は？」という問合せ（ARP要求）を、LANの全員にブロードキャストで送ります。該当するゲートウェイだけが「私です。MACアドレスは 00-00-5E-00-53-01」と応答します。',
        ),
        p(
          'PCは応答をARPテーブルに記録し、しばらくの間は問い合わせずに使います。ここで大事なのは、ARPには応答した相手が本物かを確かめる仕組みがなく、頼んでいない応答でも受け入れてしまう実装が多いことです。',
        ),
        fig(
          seq(
            [pc, actor('other', 'ほかの機器', 'pc'), gw],
            [
              m('pc', 'other', 'ARP要求：192.168.1.1 のMACは？（全員へ）'),
              m('pc', 'gw', 'ARP要求（同じものが届く）'),
              mAdd('gw', 'pc', 'ARP応答：00-00-5E-00-53-01 です'),
              mAdd('pc', 'pc', 'ARPテーブルに記録'),
            ],
          ),
          'ARP要求は全員に届き、該当する機器だけが応答する',
        ),
      ],
      see: {
        mode: 'normal',
        step: 2,
        label: 'ゲートウェイが自分のMACアドレスを返す',
      },
    },
    {
      id: 'spoofing',
      title: 'ARPスプーフィング',
      blocks: [
        p(
          '同じLANにいる攻撃者は、頼まれていないARP応答を送り、PCには「ゲートウェイのMACアドレスは攻撃者のもの」、ゲートウェイには「PCのMACアドレスは攻撃者のもの」と覚えさせます。',
        ),
        p(
          'すると、PCとゲートウェイの間の通信がすべて攻撃者を経由します。攻撃者は、通信を盗み見たり書き換えたりしてから本物の相手に転送するので、利用者は気付きにくくなります（中間者攻撃）。',
        ),
        fig(
          seq(
            [pc, actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), gw],
            [
              mAdd('x', 'pc', '偽のARP応答：192.168.1.1 は攻撃者のMAC', 'attack'),
              mAdd('x', 'gw', '偽のARP応答：192.168.1.10 は攻撃者のMAC', 'attack'),
              mAdd('pc', 'x', '外への通信が攻撃者に届く', 'attack'),
              mAdd('x', 'x', '盗み見・書き換え', 'attack'),
              mAdd('x', 'gw', '本物のゲートウェイへ転送', 'attack'),
            ],
          ),
          '偽のARP応答で、通信の経路に割り込む',
        ),
      ],
      see: { mode: 'attack', step: 1, label: 'PCに偽の対応を覚えさせる' },
    },
    {
      id: 'dai',
      title: '対策：スイッチで偽のARPを捨てる',
      blocks: [
        p(
          'DHCPスヌーピングを有効にしたスイッチは、DHCPサーバが各ポートの機器に割り当てたIPアドレスとMACアドレスの対応を記録します。DAI（ダイナミックARPインスペクション）は、この記録と食い違うARPのパケットを捨てます。',
        ),
        p(
          '重要なサーバやゲートウェイのARPテーブルに、正しい対応を固定で登録しておく（静的ARPエントリ）方法もあります。また、通信をTLSなどで暗号化しておけば、経路に割り込まれても中身は読まれません。',
        ),
        fig(
          map(
            4,
            2,
            [
              node('pc', 'PC', 'pc', 0, 1, { sub: '192.168.1.10' }),
              node('sw', 'L2スイッチ', 'switch', 2, 1, {
                sub: 'DHCPスヌーピング・DAI',
                add: true,
              }),
              node('gw', 'ゲートウェイ', 'fw', 2, 0, { sub: '192.168.1.1' }),
              node('x', '攻撃者', 'laptop', 3, 1, { attacker: true }),
            ],
            [
              link('x', 'sw', {
                arrow: true,
                tone: 'blocked',
                label: '偽のARP：捨てる',
                add: true,
              }),
              link('pc', 'sw', { arrow: true, tone: 'defense' }),
              link('sw', 'gw', {
                arrow: true,
                tone: 'defense',
                label: '本物のゲートウェイへ',
              }),
            ],
            [zone('社内LAN', 0, 0.55, 4, 1.45)],
          ),
          'スイッチが、記録と食い違うARPを捨てる',
        ),
        table(
          ['対策', '仕組み', '注意'],
          ['DHCPスヌーピング＋DAI', 'スイッチが正しい対応を記録し、食い違うARPを捨てる', '固定IPの機器は別に登録する'],
          ['静的ARPエントリ', '正しい対応を固定で登録する', '台数が多いと管理が大変'],
          ['通信の暗号化（TLSなど）', '割り込まれても中身を読ませない', '経路への割り込み自体は防げない'],
        ),
      ],
      see: { mode: 'defense', step: 2, label: 'DAIが偽のARPを捨てる' },
    },
    {
      id: 'insider',
      title: '社内にいる攻撃者への備え',
      blocks: [
        p(
          'ARPスプーフィングは、同じLANの中にいないとできません。つまり、攻撃者は社内に機器を持ち込んだ人や、乗っ取られた社内の端末です。許可した端末だけをLANにつなげる対策を重ねます。',
        ),
        list(
          'IEEE 802.1X（第15章）で、つなぐ端末を認証する',
          'ポートセキュリティで、スイッチのポートごとにつなげるMACアドレスを制限する',
          '資産台帳にない端末の接続を検知する',
          'ARPの異常（同じIPアドレスに対するMACアドレスの変化）を監視する',
        ),
        fig(
          map(
            3,
            1,
            [
              node('dev', '持ち込まれた端末', 'laptop', 0, 0, {
                attacker: true,
              }),
              node('sw', 'L2スイッチ', 'switch', 1, 0, {
                sub: '802.1X・ポートセキュリティ',
                add: true,
              }),
              node('srv', '社内のサーバ', 'server', 2, 0),
            ],
            [
              link('dev', 'sw', {
                arrow: true,
                tone: 'blocked',
                label: '未認証の端末：拒否',
                add: true,
              }),
              link('sw', 'srv'),
            ],
          ),
          '許可した端末だけをつなげる',
        ),
      ],
      see: { mode: 'incident', step: 7, label: '許可した端末だけをつなげる' },
    },
  ],
}

const laptop = actor('pc', '社員のPC', 'laptop', { sub: 'サプリカント' })
const ap = actor('ap', 'AP', 'ap', { sub: 'オーセンティケータ' })
const radius = actor('radius', 'RADIUSサーバ', 'server', { sub: '認証サーバ' })

export const wlan: Chapter = {
  id: 'wlan',
  part: 'lan',
  title: '無線LANとIEEE 802.1X',
  lead: '電波はだれでも受け取れるので、無線LANでは「だれをつなぐか」と「どう暗号化するか」が要になります。企業向けの IEEE 802.1X の仕組みから、偽のアクセスポイントによる窃取と、その見破り方までを積み上げます。',
  sections: [
    {
      id: 'encrypt',
      title: '無線LANの暗号化と認証',
      blocks: [
        p(
          '無線LANの通信は、AP（アクセスポイント）と端末の間で暗号化します。現在の主流は WPA2 と WPA3 で、暗号化には AES を使う CCMP（WPA3 では GCMP も）を用います。',
        ),
        p(
          '認証の方式は2つあります。全員が同じ合言葉を使う パーソナル（PSK、WPA3ではSAE）と、利用者や端末ごとに認証サーバで認証する エンタープライズ（IEEE 802.1X）です。企業では、退職者の停止や利用者ごとの記録ができるエンタープライズを使います。',
        ),
        fig(
          map(
            3,
            1,
            [node('pc', '社員のPC', 'laptop', 0, 0), node('ap', 'AP', 'ap', 1, 0), node('lan', '社内LAN', 'switch', 2, 0)],
            [
              link('pc', 'ap', {
                dashed: true,
                tone: 'defense',
                label: 'CCMPで暗号化',
              }),
              link('ap', 'lan'),
            ],
          ),
          '端末とAPの間の電波を暗号化する',
        ),
        table(
          ['', 'パーソナル（PSK・SAE）', 'エンタープライズ（IEEE 802.1X）'],
          ['認証の単位', '全員が同じ合言葉', '利用者・端末ごと'],
          ['認証するもの', 'AP', '認証サーバ（RADIUS）'],
          ['退職者の停止', '合言葉を全員分変える', 'そのIDだけを止める'],
          ['向いている場所', '家庭・小規模', '企業'],
        ),
      ],
    },
    {
      id: 'dot1x',
      title: 'IEEE 802.1Xの登場人物',
      blocks: [
        p(
          'IEEE 802.1Xでは、つなぎたい端末（サプリカント）、入口で通すかを決めるAP（オーセンティケータ）、実際に認証する認証サーバ（RADIUSサーバ）の3者が登場します。',
        ),
        p('APは認証の中身を判断せず、端末と認証サーバのやり取り（EAP）を中継するだけです。認証に成功するまで、端末は社内のネットワークへの通信ができません。'),
        fig(
          map(
            3,
            1,
            [
              node('pc', '社員のPC', 'laptop', 0, 0, { sub: 'サプリカント' }),
              node('ap', 'AP', 'ap', 1, 0, { sub: 'オーセンティケータ' }),
              node('radius', 'RADIUSサーバ', 'server', 2, 0, {
                sub: '認証サーバ',
                add: true,
              }),
            ],
            [link('pc', 'ap', { dashed: true, label: 'EAP（電波）' }), link('ap', 'radius', { label: 'RADIUSで中継', add: true })],
          ),
          'APは中継役で、認証はRADIUSサーバが行う',
        ),
      ],
      see: { mode: 'normal', step: 2, label: '認証をRADIUSサーバに任せる' },
    },
    {
      id: 'peap',
      title: 'PEAPの流れと、サーバ証明書の検証',
      blocks: [
        p(
          'よく使われる PEAP では、まずRADIUSサーバがサーバ証明書を端末に示し、端末はそれを検証してからTLSのトンネルを作ります。IDとパスワードの確認は、そのトンネルの中で行います。',
        ),
        p(
          '認証に成功すると、RADIUSサーバはAPに鍵の材料を渡し、APと端末は4ウェイハンドシェイクで、その端末専用の暗号化の鍵を作ります。端末側でサーバ証明書の検証を省くと、この仕組みの前提が崩れます。',
        ),
        fig(
          seq(
            [laptop, ap, radius],
            [
              m('pc', 'ap', '認証を始める（EAP）'),
              m('ap', 'radius', '中継'),
              mAdd('radius', 'pc', 'サーバ証明書'),
              mAdd('pc', 'pc', 'サーバ証明書を検証する', 'defense'),
              mAdd('pc', 'radius', 'TLSのトンネルの中で ID・パスワード', 'defense'),
              m('radius', 'ap', '成功 ＋ 鍵の材料'),
              mAdd('ap', 'pc', '4ウェイハンドシェイクで鍵を作る'),
            ],
          ),
          'サーバ証明書を検証してから、トンネルの中でID・パスワードを確かめる',
        ),
      ],
      see: { mode: 'normal', step: 3, label: 'サーバ証明書を確かめる' },
    },
    {
      id: 'evil-twin',
      title: '偽のアクセスポイント',
      blocks: [
        p(
          '攻撃者は、社内と同じSSIDの偽のAPを、電波の強い場所に置きます。さらに本物のAPのふりをして切断のフレームを送り、端末をいったん切断させます。端末は、電波の強い偽のAPにつなぎ直します。',
        ),
        p(
          '偽のAPの先には、攻撃者のRADIUSサーバがあり、攻撃者の証明書を示します。端末がサーバ証明書を確かめずに進むと、IDとパスワードの応答が攻撃者に渡ります。攻撃者は、それを手元で解析して、パスワードを割り出します。',
        ),
        fig(
          seq(
            [laptop, actor('x', '偽のAP', 'ap', { attacker: true, add: true }), ap],
            [
              mAdd('x', 'pc', '本物のAPのふりをして切断させる', 'attack'),
              mAdd('pc', 'x', '電波の強い偽のAPにつなぐ', 'attack'),
              mAdd('x', 'pc', '攻撃者の証明書', 'attack'),
              mAdd('pc', 'pc', '証明書を確かめずに進む', 'attack'),
              mAdd('pc', 'x', 'ID・パスワードの応答が渡る', 'attack'),
            ],
          ),
          '偽のAPにつながり、証明書を確かめないと、認証の情報が盗まれる',
        ),
      ],
      see: {
        mode: 'attack',
        step: 4,
        label: 'サーバ証明書を確かめずに進んでしまう',
      },
    },
    {
      id: 'protect',
      title: '対策を重ねる',
      blocks: [
        p(
          '端末の設定で、サーバ証明書の検証を必須にし、接続先のサーバ名と信頼する認証局を指定します。WPA3などで管理フレームを保護（PMF）すれば、偽の切断のフレームは無視されます。',
        ),
        p(
          'さらに、パスワードの代わりに端末ごとのクライアント証明書で認証する EAP-TLS にすれば、盗まれて使い回されるパスワード自体がなくなります。WIPS で、許可していないAPの電波を見つけることもできます。',
        ),
        fig(
          seq(
            [laptop, actor('x', '偽のAP', 'ap', { attacker: true }), radius],
            [
              m('x', 'pc', '偽の切断のフレーム', 'attack'),
              mAdd('pc', 'pc', 'PMF：保護されていないので無視', 'defense'),
              m('x', 'pc', '攻撃者の証明書', 'attack'),
              mAdd('pc', 'pc', '検証に失敗 → 接続しない', 'defense'),
              mAdd('pc', 'radius', 'EAP-TLS：クライアント証明書で認証', 'defense'),
            ],
          ),
          'PMF、証明書の検証、EAP-TLSを重ねる',
        ),
        table(
          ['対策', '防げること'],
          ['サーバ証明書の検証を必須にする', '偽のRADIUSサーバへの認証情報の送信'],
          ['EAP-TLS（クライアント証明書）', 'パスワードの窃取と使い回し'],
          ['PMF（WPA3では必須）', '偽の切断のフレームによる切断'],
          ['WIPS', '許可していないAPの検知と遮断'],
          ['認証後のVLANの割り当て', 'つないだ後に入れる範囲の制限'],
        ),
      ],
      see: {
        mode: 'defense',
        step: 2,
        label: 'サーバ証明書の検証で、偽APを見破る',
      },
    },
  ],
}

const home = actor('pc', 'テレワークのPC', 'laptop')
const vgw = actor('gw', 'VPN装置', 'fw', { sub: '社内の入口' })
const srv = actor('srv', '社内のサーバ', 'server')

export const vpn: Chapter = {
  id: 'vpn',
  part: 'lan',
  title: 'IPsec VPNとリモートアクセス',
  lead: '自宅からインターネットを通って社内に入るとき、通信を暗号化したトンネルで運ぶのがVPNです。トンネルの形、鍵の決め方、そしてVPN装置が攻撃の入口になるリスクまでを積み上げます。',
  sections: [
    {
      id: 'what',
      title: 'VPNとは',
      blocks: [
        p(
          'VPN（Virtual Private Network）は、インターネットのような共有の回線の上に、暗号化した専用の通り道（トンネル）を作り、離れた場所を社内のネットワークのようにつなぐ仕組みです。',
        ),
        p('テレワークのPCは、社内の入口にあるVPN装置とトンネルを作り、社内のIPアドレスを割り当てられて、社内のサーバと通信します。'),
        fig(
          map(
            4.6,
            1,
            [
              node('pc', 'テレワークのPC', 'laptop', 0, 0),
              node('net', 'インターネット', 'cloud', 1.3, 0),
              node('gw', 'VPN装置', 'fw', 2.6, 0),
              node('srv', '社内のサーバ', 'server', 3.6, 0),
            ],
            [
              link('pc', 'net', {
                dashed: true,
                tone: 'defense',
                label: '暗号化したトンネル',
                add: true,
              }),
              link('net', 'gw', { dashed: true, tone: 'defense', add: true }),
              link('gw', 'srv', { arrow: true }),
            ],
          ),
          'インターネットの上に、暗号化したトンネルを作る',
        ),
      ],
    },
    {
      id: 'tunnel',
      title: 'トンネルモードのパケット',
      blocks: [
        p(
          'IPsecでは、ESPで暗号化と改ざんの検知を行います。テレワークやサイト間のVPNで使うトンネルモードでは、社内あてのパケット全体（元のIPヘッダを含む）を暗号化し、その外側に、VPN装置あての新しいIPヘッダを付けます。',
        ),
        p(
          'インターネットの途中から見えるのは外側のIPヘッダだけなので、社内のどのサーバと通信しているかも隠せます。端末どうしが直接暗号化するトランスポートモードでは、元のIPヘッダはそのまま使います。',
        ),
        fig(
          layers(
            [
              '元のパケット（社内あて）',
              [cell('l3', 'IP', '社内のサーバ', { w: 1.2 }), cell('l4', 'TCP', undefined, { w: 0.9 }), cell('l7', 'データ', undefined, { w: 2 })],
            ],
            [
              'トンネルモード',
              [
                cell('tunnel', '新しいIP', 'VPN装置あて', {
                  w: 1.3,
                  add: true,
                }),
                cell('tunnel', 'ESP', undefined, { w: 0.7, add: true }),
                cell('l3', 'IP', undefined, { w: 1, enc: true }),
                cell('l4', 'TCP', undefined, { w: 0.8, enc: true }),
                cell('l7', 'データ', undefined, { w: 1.5, enc: true }),
                cell('tunnel', 'ESP認証', undefined, { w: 0.9, add: true }),
              ],
            ],
          ),
          'トンネルモードでは、元のパケット全体を暗号化して包む',
        ),
        table(
          ['', 'トンネルモード', 'トランスポートモード'],
          ['暗号化する範囲', '元のIPヘッダを含むパケット全体', 'IPヘッダより後ろ'],
          ['外側のIPヘッダ', 'VPN装置などのアドレスを新しく付ける', '元のIPヘッダのまま'],
          ['主な用途', 'サイト間VPN、リモートアクセス', '端末どうしの通信'],
        ),
      ],
      see: { mode: 'normal', step: 5, label: '社内のサーバへ暗号化して届ける' },
    },
    {
      id: 'ike',
      title: 'IKEで鍵と相手を確かめる',
      blocks: [
        p(
          'トンネルを作る前に、IKE（IKEv2）で暗号の方式を決め、ディフィー・ヘルマン鍵交換で鍵の材料を交換します。ここでできる、IKE自身のやり取りを守る取り決めが IKE SA です。',
        ),
        p(
          '続いて、暗号化したうえで互いを認証します（証明書や、EAPによる利用者の認証）。認証に成功すると、実際の通信を守る取り決め（Child SA、IPsec SA）ができ、PCに社内のIPアドレスが割り当てられます。',
        ),
        fig(
          seq(
            [home, vgw, srv],
            [
              m('pc', 'gw', 'IKE_SA_INIT：方式と鍵の材料'),
              m('gw', 'pc', 'IKE_SA_INIT：方式と鍵の材料'),
              mAdd('pc', 'gw', 'IKE_AUTH：証明書・利用者の認証（暗号化）', 'defense'),
              mAdd('gw', 'pc', 'Child SA、社内のIPアドレスの割り当て', 'defense'),
              mAdd('pc', 'srv', 'ESPで暗号化した通信', 'defense'),
            ],
          ),
          'IKEで鍵を決め、互いを認証してから、ESPで通信する',
        ),
      ],
      see: { mode: 'normal', step: 3, label: '暗号化したうえで互いを認証する' },
    },
    {
      id: 'intrusion',
      title: 'VPN装置が侵入の入口になる',
      blocks: [
        p(
          'VPN装置はインターネットに公開されているので、攻撃者に常に狙われています。修正されていない脆弱性を突かれたり、漏えいしたIDとパスワードを使われたりすると、攻撃者は正規の利用者として社内のIPアドレスを得て、社内に入れてしまいます。',
        ),
        p('ランサムウェアの被害では、VPN装置が侵入口だった事例が多く報告されています。入った後は、社内のサーバを探して回り、データを暗号化します。'),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), vgw, srv],
            [
              mAdd('x', 'gw', '漏えいしたID・パスワードで接続', 'attack'),
              mAdd('gw', 'x', '社内のIPアドレスが割り当てられる', 'attack'),
              mAdd('x', 'srv', '社内のサーバを探し、データを暗号化', 'attack'),
            ],
          ),
          'IDとパスワードだけのVPNは、漏えいすれば正規の利用者と区別できない',
        ),
      ],
      see: { mode: 'attack', step: 1, label: '漏えいした認証情報で接続する' },
    },
    {
      id: 'harden',
      title: '対策：入口を固め、入った後の範囲を絞る',
      blocks: [
        p('VPN装置の脆弱性の情報を集め、修正をすぐに適用します。認証は、IDとパスワードだけでなく、端末のクライアント証明書や多要素認証を組み合わせます。'),
        p(
          'さらに、接続した利用者がどのサーバにでも行けるのではなく、業務に必要なサーバだけに通すようにします。すべての通信を、その都度確かめる考え方がゼロトラストです。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), home, vgw, srv],
            [
              mAdd('x', 'gw', 'ID・パスワードだけ → 拒否', 'blocked'),
              mAdd('pc', 'gw', '証明書＋多要素認証', 'defense'),
              mAdd('gw', 'srv', '業務に必要なサーバだけに通す', 'defense'),
            ],
          ),
          '証明書と多要素認証で入口を固め、入れる範囲を絞る',
        ),
        list(
          'VPN装置の脆弱性の修正を最優先で適用する（KEVなどの情報を確認する）',
          'クライアント証明書と多要素認証を組み合わせる',
          '接続後に通せるサーバを、利用者ごとに必要な範囲に絞る',
          'VPNのログを監視し、ふだんと違う時間・場所からの接続に気付けるようにする',
        ),
        note('どこから接続しても常に確かめるゼロトラストの考え方では、VPNの代わりに、アプリごとに認証して通す仕組み（ZTNA）を使うこともあります。'),
      ],
      see: {
        mode: 'defense',
        step: 1,
        label: '証明書と多要素認証がなければ拒否する',
      },
    },
  ],
}
