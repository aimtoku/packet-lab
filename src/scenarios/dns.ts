import { defineScenario } from '../types'

// DNS名前解決：キャッシュポイズニング
// 図中のIPアドレス（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24）とドメイン（example.*）は、
// 説明用に予約されたもので、実在のサーバを指しません。
export const dns = defineScenario({
  id: 'dns',
  name: 'DNS名前解決',
  threat: 'キャッシュポイズニング',
  actors: [
    {
      id: 'pc',
      name: 'PC',
      sub: 'スタブリゾルバ',
    },
    {
      id: 'cache',
      name: 'キャッシュDNS',
      sub: 'フルリゾルバ',
    },
    {
      id: 'auth',
      name: '権威DNS',
      sub: 'example.net',
    },
    {
      id: 'atk',
      name: '攻撃者',
      sub: '外部',
      attacker: true,
    },
  ],
  summary: {
    normal: 'PCがキャッシュDNSに問い合わせ、キャッシュDNSが権威DNSへ反復問合せして答えを返す流れです。',
    attack: '攻撃者が権威DNSになりすまして偽の応答を先に送り込み、キャッシュDNSに偽のIPアドレスを覚えさせます（カミンスキー型）。',
    defense: '再帰問合せの送信元制限、送信元ポートのランダム化、DNSSECの署名検証で偽の応答を受理しません。',
  },
  steps: {
    normal: [
      {
        from: 'pc',
        to: 'cache',
        kind: 'normal',
        label: 'Aレコード問合せ',
        title: 'PCが名前解決を依頼',
        fields: [
          ['プロトコル', 'UDP/53'],
          ['ID', '0x1a2b'],
          ['QNAME', 'www.example.net'],
          ['QTYPE', 'A'],
          ['RDフラグ', '1（再帰を要求）'],
        ],
        note: 'PCのスタブリゾルバは自分では解決せず、キャッシュDNSサーバに「最後まで調べてほしい」と再帰問合せを送ります。',
      },
      {
        from: 'cache',
        to: 'auth',
        kind: 'normal',
        label: '反復問合せ',
        title: 'キャッシュDNSが権威DNSへ問合せ',
        fields: [
          ['送信元ポート', '49733'],
          ['ID', '0x7c31'],
          ['QNAME', 'www.example.net'],
          ['RDフラグ', '0'],
        ],
        note: 'キャッシュにない名前は、ルート → .net → example.net の順に権威DNSサーバへ反復問合せします。図では最後の権威DNSだけを表示しています。',
      },
      {
        from: 'auth',
        to: 'cache',
        kind: 'normal',
        label: '応答 203.0.113.10',
        title: '権威DNSが回答',
        fields: [
          ['ID', '0x7c31（問合せと一致）'],
          ['AAフラグ', '1（権威ある応答）'],
          ['回答', 'www.example.net A 203.0.113.10'],
          ['TTL', '3600秒'],
        ],
        note: 'キャッシュDNSは、問合せと同じID・宛先ポート・質問名をもつ応答だけを受理し、TTLの間キャッシュに保存します。',
        point: '受理の条件が「IDとポートが一致すること」だけである点が、キャッシュポイズニングの前提になります。',
      },
      {
        from: 'cache',
        to: 'pc',
        kind: 'normal',
        label: '応答 203.0.113.10',
        title: 'PCに答えを返す',
        fields: [
          ['ID', '0x1a2b'],
          ['回答', '203.0.113.10'],
          ['RAフラグ', '1（再帰可能）'],
        ],
        note: 'PCは得たIPアドレスへ接続します。TTLが切れるまで、同じ名前の問合せはキャッシュから即答されます。',
      },
    ],
    attack: [
      {
        from: 'atk',
        to: 'cache',
        kind: 'attack',
        label: 'ランダム名を問合せ',
        title: '存在しない名前を問い合わせる',
        fields: [
          ['QNAME', 'x7f3q.example.net'],
          ['送信元', '攻撃者（外部）'],
          ['狙い', 'キャッシュにない名前で毎回権威DNSへ問合せさせる'],
        ],
        note: 'キャッシュ済みの名前は上書きしにくいので、攻撃者は毎回違うサブドメインを問い合わせ、キャッシュDNSに権威DNSへの問合せを発生させます。外部からの再帰問合せを受け付けるキャッシュDNS（オープンリゾルバ）が狙われます。',
      },
      {
        from: 'cache',
        to: 'auth',
        kind: 'normal',
        label: '反復問合せ',
        title: 'キャッシュDNSが権威DNSへ問合せ',
        fields: [
          ['送信元ポート', '53（固定）'],
          ['ID', '0x????（攻撃者には不明）'],
          ['QNAME', 'x7f3q.example.net'],
        ],
        note: '送信元ポートが固定だと、攻撃者が当てる必要があるのはIDの16ビット（65,536通り）だけです。',
      },
      {
        from: 'atk',
        to: 'cache',
        kind: 'attack',
        label: '偽応答を大量送信',
        title: '権威DNSになりすました偽応答',
        fields: [
          ['送信元IP', '権威DNSのIPを詐称'],
          ['ID', '0x0000〜0xFFFFを総当たり'],
          ['権威セクション', 'example.net NS ns.example.net'],
          ['追加セクション', 'ns.example.net A 198.51.100.66（攻撃者のDNSサーバ）'],
        ],
        note: '正規の応答より先に、IDが一致した偽応答が1つでも届けば受理されます。権威セクションと追加セクションで、example.net ドメイン全体の権威DNSサーバのIPアドレスを攻撃者のサーバに差し替えるのが、カミンスキー型の特徴です。',
      },
      {
        from: 'auth',
        to: 'cache',
        kind: 'discarded',
        label: '正規応答（破棄）',
        title: '正規の応答は遅れて届く',
        fields: [
          ['結果', 'すでに偽応答を受理済みのため破棄'],
        ],
        note: '正規の応答は先着順の勝負に負けて捨てられます。',
      },
      {
        from: 'pc',
        to: 'cache',
        kind: 'normal',
        label: 'www を問合せ',
        title: '利用者はいつもどおりアクセス',
        fields: [
          ['QNAME', 'www.example.net'],
          ['QTYPE', 'A'],
        ],
        note: '利用者側には何の異変もありません。キャッシュDNSは、差し替えられた権威サーバ（攻撃者のサーバ）に問い合わせることになります。',
      },
      {
        from: 'cache',
        to: 'pc',
        kind: 'attack',
        label: '偽 198.51.100.80',
        title: '偽のIPアドレスが返る',
        fields: [
          ['回答', 'www.example.net A 198.51.100.80（攻撃者のサーバ）'],
          ['影響', 'フィッシングサイトへの誘導（ファーミング）、マルウェア配布'],
        ],
        note: 'このキャッシュDNSを使う全利用者が、TTLが切れるまで偽サイトへ誘導されます。URLは正しいので利用者は気付きにくいです。',
        point: '被害が「そのキャッシュDNSを使う全利用者」に及ぶ点が、PC単体のhostsファイル改ざんとの違いです。',
      },
    ],
    defense: [
      {
        from: 'atk',
        to: 'cache',
        kind: 'blocked',
        label: '外部から問合せ → 拒否',
        title: '外部からの再帰問合せを拒否',
        fields: [
          ['設定', '再帰問合せは社内ネットワークからのみ許可'],
          ['応答', 'REFUSED'],
        ],
        note: 'キャッシュDNSを外部に開放しなければ、攻撃者は問合せのきっかけを作れません。以下は、内部の感染端末などから問合せが発生した場合です。',
      },
      {
        from: 'cache',
        to: 'auth',
        kind: 'defense',
        label: '問合せ（ポート乱数化）',
        title: '送信元ポートをランダムにする',
        fields: [
          ['送信元ポート', 'ランダム（例：61027）'],
          ['ID', 'ランダム16ビット'],
          ['DNSSEC', 'DOビット=1（署名を要求）'],
        ],
        note: 'IDに加えて送信元ポートもランダムにすると、攻撃者が当てる組合せは「約65,536 × 数万通り」に増え、先着で一致させるのが現実的でなくなります。',
      },
      {
        from: 'atk',
        to: 'cache',
        kind: 'blocked',
        label: '偽応答 → 破棄',
        title: '偽応答は受理されない',
        fields: [
          ['宛先ポート', '不一致 → 破棄'],
          ['RRSIG', 'なし／検証失敗 → 破棄'],
        ],
        note: 'ポートが一致しない応答は破棄されます。仮に一致しても、DNSSECで検証するキャッシュDNSは、ゾーンの秘密鍵で作られた署名（RRSIG）がない応答を受け入れません。',
      },
      {
        from: 'auth',
        to: 'cache',
        kind: 'defense',
        label: '応答＋RRSIG',
        title: '署名付きの正規応答',
        fields: [
          ['回答', 'A 203.0.113.10'],
          ['RRSIG', 'ゾーンの秘密鍵による署名'],
          ['検証', 'DNSKEY → 親ゾーンのDS → ルートの信頼の起点'],
        ],
        note: 'キャッシュDNSは、親ゾーンから順に鍵の正当性を確かめる「信頼の連鎖」で署名を検証します。',
        point: 'DNSSECが保証するのは応答の完全性と送信元の真正性です。通信の暗号化（機密性）は提供しません。',
      },
      {
        from: 'cache',
        to: 'pc',
        kind: 'defense',
        label: '検証済み応答',
        title: '正しいIPアドレスを返す',
        fields: [
          ['回答', '203.0.113.10'],
          ['ADフラグ', '1（検証済み）'],
        ],
        note: '利用者は正しいサーバへ接続できます。',
      },
    ],
  },
  points: [
    'オープンリゾルバは、キャッシュポイズニングとDNSリフレクション（DDoS）の両方に悪用される',
    '対策の組合せ：再帰問合せの送信元制限、送信元ポートのランダム化、DNSSEC',
    'キャッシュDNSと権威DNSは別サーバに分け、権威DNSでは再帰問合せを無効にする',
    'DNSSECは改ざんの検知であり、暗号化ではない',
  ],
  topology: {
    map: {
      pc: 'pc',
      cache: 'cache',
      auth: 'ext1',
      atk: 'ext2',
    },
    shields: ['cache'],
    devices: {
      ext1: {
        type: 'server',
        name: '権威DNS',
        sub: 'example.net',
      },
      ext2: {
        type: 'laptop',
        name: '攻撃者',
        sub: '',
      },
    },
  },
})
