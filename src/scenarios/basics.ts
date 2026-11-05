import { defineScenario } from "../types";

// 基礎編：攻撃の前に、ふだんの通信の仕組みだけを学ぶ（正常のモードだけ）
// 図中のIPアドレス（192.0.2.0/24、203.0.113.0/24、192.168.0.0/16）、MACアドレス（00-00-5E-00-53-xx）、
// ドメイン（example.*）は、説明用に予約されたもので、実在の機器を指しません。

const PC_IP = "192.168.1.10";
const PC_MAC = "00-00-5E-00-53-10";
const FW_MAC = "00-00-5E-00-53-01";
const GLOBAL_IP = "203.0.113.1";
const SITE_IP = "192.0.2.80";
const DMZ_WEB = "203.0.113.10";
const DMZ_MAIL = "203.0.113.25";
const CACHE_IP = "192.168.1.53";
const ADNS_IP = "192.0.2.53";
const FS_IP = "192.168.1.40";

const NONE = { attack: "", defense: "", incident: "" };
const NO_STEPS = { attack: [], defense: [], incident: [] };

/** 基礎1：パケットとは */
export const packet = defineScenario({
  id: "packet",
  basic: true,
  name: "パケットとは",
  threat: "基礎：データの運ばれ方",
  actors: [
    { id: "pc", name: "PC", sub: "社員" },
    { id: "site", name: "Webサーバ", sub: "www.example.com" },
  ],
  summary: {
    normal:
      "PCがWebページを見るとき、データは小さな「パケット」に分けられ、宛先などを書いた見出し（ヘッダ）を付けて、いくつもの機器を経由して届きます。",
    ...NONE,
  },
  steps: {
    normal: [
      {
        from: "pc",
        to: "pc",
        kind: "normal",
        label: "小分けにする",
        title: "データを小分けにして、見出しを付ける",
        fields: [
          ["データ", "Webページを見せてほしい、という要求（HTTP）"],
          ["小分け", "大きなデータは、1つ1,500バイトほどのパケットに分ける"],
          [
            "見出し（ヘッダ）",
            "中身に近い順に、TCP（ポート番号）→ IP（IPアドレス）→ Ethernet（MACアドレス）の見出しを重ねて付ける",
          ],
        ],
        note: "見出しを重ねて付けることをカプセル化といいます。荷物を箱に入れ、さらに大きな箱に入れて、それぞれに送り状を貼るようなものです。",
        point:
          "層ごとに役割が分かれています。Ethernet（L2）は同じLANの中の隣の機器まで、IP（L3）は最終的な宛先の機器まで、TCP・UDP（L4）はその機器の中のどのアプリケーションか、を表します。",
        receive:
          "PC：要求のデータを小分けにし、見出しを重ねて、送り出す準備をします。",
      },
      {
        from: "pc",
        to: "site",
        kind: "normal",
        label: "パケットを送る",
        title: "機器から機器へ、リレーで運ぶ",
        fields: [
          ["宛先MACアドレス", `${FW_MAC}（社内の出口のFW）`],
          ["宛先IPアドレス", `${SITE_IP}（Webサーバ）`],
          ["宛先ポート", "80（Webのサービス）"],
        ],
        note: "宛先MACアドレスは「次に渡す機器」で、区間ごとに書き換わります。宛先IPアドレスは「最終的な宛先」で、最後まで変わりません。",
        send: "PC：見出しを付けたパケットを、LANのケーブルに送り出します。",
        via: {
          sw: "L2スイッチ：宛先MACアドレスを見て、出口（FW）につながるポートへだけ送ります。",
          fw: "FW：通してよい通信かを、ルールと照らし合わせます。許可されている通信なので、インターネットへ送り出します。",
        },
        receive: "Webサーバ：自分あてのパケットを受け取ります。",
        wire: {
          app: "HTTP（GET /）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "80",
          srcIp: PC_IP,
          dstIp: SITE_IP,
          srcMac: PC_MAC,
          dstMac: FW_MAC,
          focus: ["l2", "l3", "l4"],
          remark:
            "ここでは仕組みを見やすくするため、暗号化しないHTTPで表しています。実際のWebサイトはHTTPS（基礎4）です。",
        },
      },
      {
        from: "site",
        to: "site",
        kind: "normal",
        label: "見出しを外す",
        title: "外側から順に見出しを外して、中身を取り出す",
        fields: [
          ["Ethernet", "自分あてかを確かめて外す"],
          ["IP", "自分のIPアドレスあてかを確かめて外す"],
          ["TCP", "ポート番号80 → Webのサービス（アプリケーション）に渡す"],
        ],
        note: "付けたときと逆の順番で見出しを外していきます（非カプセル化）。",
        receive: "Webサーバ：見出しを外し、要求をWebのサービスに渡します。",
      },
      {
        from: "site",
        to: "pc",
        kind: "normal",
        label: "ページを返す",
        title: "ページを、いくつものパケットに分けて返す",
        fields: [
          [
            "宛先IPアドレス",
            `${GLOBAL_IP}（会社の外向きの住所。社内に入るときにFWが ${PC_IP} に戻す）`,
          ],
          ["宛先ポート", "50000（PCが返事を待つ窓口）"],
          [
            "順番",
            "パケットには番号があり、PCは番号順に並べ直して、ページを組み立てる",
          ],
        ],
        note: "パケットは、届く順番が入れ替わったり、途中でなくなったりすることもあります。TCPは番号を使って並べ直し、届かなかった分を送り直してもらいます（基礎3）。",
        send: "Webサーバ：ページのデータを小分けにして、見出しを付けて送ります。",
        via: { fw: "FW：PCが始めた通信への返事なので、通します。" },
        receive: "PC：パケットを番号順に並べ、ページを組み立てて表示します。",
        wire: {
          app: "HTTP（200 OK ページ）",
          transport: "TCP",
          srcPort: "80",
          dstPort: "50000",
          srcIp: SITE_IP,
          dstIp: PC_IP,
        },
      },
    ],
    ...NO_STEPS,
  },
  points: [
    "データは、パケットに分けて運ばれる。各パケットには、宛先などを書いた見出し（ヘッダ）が層ごとに付く",
    "MACアドレスは「次に渡す機器」（区間ごとに変わる）、IPアドレスは「最終的な宛先」（最後まで同じ）",
    "ポート番号は、その機器の中の「どのアプリケーションか」を表す",
  ],
  incidentPoints: [],
  topology: {
    map: { pc: "pc", site: "ext1" },
    shields: [],
    devices: {
      ext1: { type: "server", name: "Webサーバ", sub: "www.example.com" },
    },
  },
});

/** 基礎2：IPアドレスとポート */
export const ipport = defineScenario({
  id: "ipport",
  basic: true,
  name: "IPアドレスとポート",
  threat: "基礎：住所と部屋番号",
  actors: [
    { id: "pc", name: "PC", sub: "社員" },
    { id: "site", name: "Webサーバ", sub: "www.example.com" },
    { id: "mail", name: "メールサーバ", sub: "自社" },
  ],
  summary: {
    normal:
      "IPアドレスは機器の「住所」、ポート番号は機器の中の「部屋番号（サービス）」です。社内のPCの住所は、外に出るときにFWが会社の外向きの住所に書き換えます。",
    ...NONE,
  },
  states: [
    {
      id: "napt",
      title: "FWのアドレス変換表（NAPT）",
      columns: ["外向きの住所:窓口", "社内の住所:窓口"],
    },
  ],
  steps: {
    normal: [
      {
        from: "pc",
        to: "site",
        kind: "normal",
        label: "443番へ",
        title: "住所（IPアドレス）と部屋番号（ポート）で相手を指す",
        fields: [
          ["宛先IPアドレス", `${SITE_IP}：Webサーバという機器の住所`],
          ["宛先ポート", "443：その機器の中の、HTTPS（Web）のサービス"],
          [
            "送信元ポート",
            "50000：返事を受け取る、PCの窓口（その都度、空いている番号を使う）",
          ],
        ],
        note: "社内のPCには、社内だけで使えるプライベートIPアドレス（192.168.〜 など）が付いています。インターネットでは、そのままでは使えません。",
        point:
          "よく使うポート番号：HTTP 80、HTTPS 443、DNS 53、SMTP 25、メールの送信（サブミッション）587、SSH 22。",
        send: "PC：宛先の住所と部屋番号を書いて、パケットを送ります。",
        via: {
          fw: `FW（NAPT）：送信元の社内の住所 ${PC_IP}:50000 を、会社の外向きの住所 ${GLOBAL_IP}:61000 に書き換え、対応表に記録します。`,
        },
        receive:
          "Webサーバ：443番のサービスが要求を受け取ります。送ってきたのは、会社の外向きの住所に見えます。",
        wire: {
          app: "HTTPS（ページの要求）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: SITE_IP,
          secure: "TLS",
          focus: ["l3", "l4"],
        },
        changes: [
          {
            table: "napt",
            key: `${GLOBAL_IP}:61000`,
            value: `${PC_IP}:50000（Webサーバとの通信）`,
            at: "fw",
          },
        ],
      },
      {
        from: "site",
        to: "pc",
        kind: "normal",
        label: "返事",
        title: "返事は、外向きの住所に届き、社内の住所に戻される",
        fields: [
          ["宛先", `${GLOBAL_IP}:61000（会社の外向きの住所）`],
          ["FWでの変換", `対応表を見て、${PC_IP}:50000 に戻す`],
        ],
        note: "たくさんのPCが、1つの外向きの住所を、窓口（ポート番号）を分けて一緒に使えます。これがNAPT（IPマスカレード）です。",
        send: "Webサーバ：送ってきた住所と窓口あてに、ページを返します。",
        via: {
          fw: `FW（NAPT）：対応表から、宛先を ${PC_IP}:50000 に書き換えて、社内へ届けます。`,
        },
        receive: "PC：50000番の窓口で返事を受け取り、ページを表示します。",
        wire: {
          app: "HTTPS（ページ）",
          transport: "TCP",
          srcPort: "443",
          dstPort: "50000",
          srcIp: SITE_IP,
          dstIp: PC_IP,
          secure: "TLS",
          focus: ["l3", "l4"],
        },
      },
      {
        from: "pc",
        to: "mail",
        kind: "normal",
        label: "587番へ",
        title: "同じ機器でも、部屋番号でサービスを分ける",
        fields: [
          ["宛先IPアドレス", `${DMZ_MAIL}：自社のメールサーバ`],
          ["宛先ポート", "587：メールを送るサービス（サブミッションポート）"],
          [
            "同じ機器のほかのサービス",
            "25（サーバどうしのメールの受け渡し）、993（メールを読む IMAPS）",
          ],
        ],
        note: "1台のサーバで、いくつものサービスが動いています。ポート番号で、どのサービスにつなぐかを指定します。",
        send: "PC：メールサーバの587番に、メールを送ります。",
        via: {
          fw: "FW：社内のPCから、DMZのメールサーバの587番への通信は許可されているので、通します（社内の住所のまま）。",
        },
        receive: "メールサーバ：587番のサービスがメールを受け取ります。",
        wire: {
          app: "SMTP（メールの送信）",
          transport: "TCP",
          srcPort: "50010",
          dstPort: "587",
          srcIp: PC_IP,
          dstIp: DMZ_MAIL,
          secure: "TLS",
          focus: ["l4"],
        },
      },
    ],
    ...NO_STEPS,
  },
  points: [
    "IPアドレスは機器の住所、ポート番号はその機器の中のサービス（部屋番号）",
    "社内ではプライベートIPアドレスを使い、外に出るときにFWなどが外向きのグローバルIPアドレスに変換する（NAPT）",
    "よく使うポート番号：HTTP 80、HTTPS 443、DNS 53、SMTP 25、サブミッション 587",
  ],
  incidentPoints: [],
  topology: {
    map: { pc: "pc", site: "ext1", mail: "mail" },
    shields: [],
    devices: {
      ext1: { type: "server", name: "Webサーバ", sub: "www.example.com" },
    },
    labels: { fw: ["FW", "NAPT"] },
  },
});

/** 基礎3：TCPとUDP */
export const tcpudp = defineScenario({
  id: "tcpudp",
  basic: true,
  name: "TCPとUDP",
  threat: "基礎：確実に送るか、手早く送るか",
  actors: [
    { id: "pc", name: "PC", sub: "社員" },
    { id: "web", name: "Webサーバ", sub: "DMZ" },
    { id: "dns", name: "キャッシュDNS", sub: "社内" },
  ],
  summary: {
    normal:
      "TCPは、最初にあいさつ（3ウェイハンドシェイク）をしてから、番号を付けて確実に届けます。UDPは、あいさつなしで手早く送ります。DNSの問合せは、ふつうUDPです。",
    ...NONE,
  },
  states: [
    {
      id: "conn",
      title: "PCとWebサーバの接続（TCP）",
      columns: ["項目", "状態"],
    },
  ],
  steps: {
    normal: [
      {
        from: "pc",
        to: "web",
        kind: "normal",
        label: "SYN",
        title: "「つないでいいですか」（SYN）",
        fields: [
          ["フラグ", "SYN（接続したい）"],
          ["番号", "PCの番号の始まり＝1000（実際は推測しにくい値）"],
        ],
        note: "TCPは、データを送る前に、3回のやり取りで接続を作ります（3ウェイハンドシェイク）。",
        send: "PC：Webサーバの443番に、接続を申し込みます。",
        receive: "Webサーバ：申込みを受け取ります。",
        wire: {
          app: "（データなし）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: DMZ_WEB,
          focus: ["l4"],
        },
        changes: [
          { table: "conn", key: "状態", value: "接続を申し込んだ", at: "pc" },
        ],
      },
      {
        from: "web",
        to: "pc",
        kind: "normal",
        label: "SYN/ACK",
        title: "「いいですよ。そちらもどうぞ」（SYN/ACK）",
        fields: [
          ["フラグ", "SYN と ACK（受け取った）"],
          ["確認の番号", "1001（次はこの番号から送ってください）"],
          ["番号", "Webサーバの番号の始まり＝5000"],
        ],
        note: "相手の申込みを受け取ったこと（ACK）と、自分からの申込み（SYN）を、1回で送ります。",
        send: "Webサーバ：受け取ったことと、自分からの申込みを返します。",
        receive: "PC：受け取ります。",
        wire: {
          app: "（データなし）",
          transport: "TCP",
          srcPort: "443",
          dstPort: "50000",
          srcIp: DMZ_WEB,
          dstIp: PC_IP,
          focus: ["l4"],
        },
      },
      {
        from: "pc",
        to: "web",
        kind: "normal",
        label: "ACK",
        title: "「よろしく」（ACK）で、接続ができる",
        fields: [
          ["フラグ", "ACK"],
          ["確認の番号", "5001"],
        ],
        note: "これで、お互いの番号の始まりを確かめ合えました。ここからデータを送れます。",
        send: "PC：受け取ったことを伝えます。",
        receive: "Webサーバ：接続ができました。",
        wire: {
          app: "（データなし）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: DMZ_WEB,
          focus: ["l4"],
        },
        changes: [
          { table: "conn", key: "状態", value: "接続できた（ESTABLISHED）" },
        ],
      },
      {
        from: "web",
        to: "pc",
        kind: "normal",
        label: "データ＋番号",
        title: "番号を付けてデータを送り、受け取りを確かめる",
        fields: [
          ["データ", "ページの一部（番号 5001〜）"],
          ["受け取りの確認", "PCは「ここまで受け取った」とACKを返す"],
          ["届かなかったとき", "ACKが来なければ、Webサーバが送り直す（再送）"],
        ],
        note: "番号があるので、順番が入れ替わっても並べ直せます。なくなった分は送り直すので、確実に届きます。",
        send: "Webサーバ：番号を付けて、ページのデータを送ります。",
        receive: "PC：番号順に並べ、受け取ったことを伝えます。",
        wire: {
          app: "HTTPS（ページ）",
          transport: "TCP",
          srcPort: "443",
          dstPort: "50000",
          srcIp: DMZ_WEB,
          dstIp: PC_IP,
          secure: "TLS",
        },
      },
      {
        from: "pc",
        to: "web",
        kind: "normal",
        label: "FIN",
        title: "「終わります」（FIN）で、接続を閉じる",
        fields: [
          ["フラグ", "FIN（もう送るものはない）"],
          ["このあと", "お互いにFINとACKを送り合って、接続を閉じる"],
        ],
        note: "TCPは、始めるときも終わるときも、手順を踏みます。",
        send: "PC：送るものがなくなったので、終わりを伝えます。",
        receive: "Webサーバ：終わりを受け取り、接続を閉じます。",
        wire: {
          app: "（データなし）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: DMZ_WEB,
          focus: ["l4"],
        },
        changes: [{ table: "conn", key: "状態", value: "閉じた" }],
      },
      {
        from: "pc",
        to: "dns",
        kind: "normal",
        label: "UDP（問合せ）",
        title: "UDPは、あいさつなしで、いきなり送る",
        fields: [
          ["問合せ", "www.example.com のIPアドレスは？"],
          ["手順", "接続を作らず、1つのパケットで送るだけ"],
          ["宛先ポート", "53（DNS）"],
        ],
        note: "UDPは、接続の手順も、受け取りの確認もありません。そのぶん手早く、小さなやり取りに向いています。",
        send: "PC：キャッシュDNSの53番に、問合せを1つ送ります。",
        receive: "キャッシュDNS：問合せを受け取ります。",
        wire: {
          app: "DNS（問合せ）",
          transport: "UDP",
          srcPort: "53000",
          dstPort: "53",
          srcIp: PC_IP,
          dstIp: CACHE_IP,
          focus: ["l4"],
        },
      },
      {
        from: "dns",
        to: "pc",
        kind: "normal",
        label: "UDP（応答）",
        title: "答えも1つのパケットで返る",
        fields: [
          ["応答", `www.example.com は ${SITE_IP}`],
          [
            "届かなかったとき",
            "UDP自身は送り直さない。PCのほうが、しばらく待ってから問い直す",
          ],
        ],
        point:
          "TCPは確実さが必要な通信（Web、メール）に、UDPは手早さが大事な通信（DNS、音声や動画の配信、NTP）に使われます。",
        note: "確実さが必要なら、アプリケーションの側で問い直しなどの工夫をします。",
        send: "キャッシュDNS：答えを1つのパケットで返します。",
        receive: "PC：答えを受け取ります。",
        wire: {
          app: "DNS（応答）",
          transport: "UDP",
          srcPort: "53",
          dstPort: "53000",
          srcIp: CACHE_IP,
          dstIp: PC_IP,
          focus: ["l4"],
        },
      },
    ],
    ...NO_STEPS,
  },
  points: [
    "TCP：3ウェイハンドシェイク（SYN → SYN/ACK → ACK）で接続を作り、番号と受け取りの確認で確実に届ける",
    "UDP：接続の手順も受け取りの確認もなく、手早い。DNS、NTP、音声や動画の配信などに使う",
    "UDPは送信元を確かめないので、送信元の偽装に悪用されやすい（DNSリフレクション攻撃のシナリオ）",
  ],
  incidentPoints: [],
  topology: {
    map: { pc: "pc", web: "web", dns: "cache" },
    shields: [],
  },
});

/** 基礎4：DNSとHTTPSの仕組み */
export const dnshttps = defineScenario({
  id: "dnshttps",
  basic: true,
  name: "DNSとHTTPSの仕組み",
  threat: "基礎：名前から住所を調べ、暗号でつなぐ",
  actors: [
    { id: "pc", name: "ブラウザ", sub: "PC" },
    { id: "cache", name: "キャッシュDNS", sub: "社内" },
    { id: "adns", name: "権威DNS", sub: "example.com" },
    { id: "site", name: "Webサイト", sub: "www.example.com" },
  ],
  summary: {
    normal:
      "ブラウザに www.example.com と入れると、まずDNSで名前からIPアドレスを調べ、次にHTTPS（TLS）で、相手が本物かを確かめてから暗号で通信します。",
    ...NONE,
  },
  states: [
    {
      id: "cache",
      title: "キャッシュDNSが覚えている答え",
      columns: ["名前", "IPアドレス（覚えておく時間）"],
    },
  ],
  steps: {
    normal: [
      {
        from: "pc",
        to: "cache",
        kind: "normal",
        label: "名前を尋ねる",
        title: "名前からIPアドレスを調べてもらう",
        fields: [["問合せ", "www.example.com のIPアドレスは？"]],
        note: "インターネットの機器は、名前ではなくIPアドレスで相手を指します。名前とIPアドレスの対応を調べるのがDNSです。",
        send: "ブラウザ：社内のキャッシュDNSに、名前の解決を頼みます。",
        receive: "キャッシュDNS：覚えている答えにないので、調べに行きます。",
        wire: {
          app: "DNS（問合せ）",
          transport: "UDP",
          srcPort: "53000",
          dstPort: "53",
          srcIp: PC_IP,
          dstIp: CACHE_IP,
        },
      },
      {
        from: "cache",
        to: "adns",
        kind: "normal",
        label: "本家に尋ねる",
        title: "その名前を管理している「本家」（権威DNS）に尋ねる",
        fields: [
          ["問合せ", "www.example.com のIPアドレスは？"],
          [
            "たどる順",
            "ルート → .com → example.com の権威DNS（図では最後だけを表示）",
          ],
        ],
        note: "名前は、右から順に管理が分かれています（.com を管理する所、example.com を管理する所…）。",
        send: "キャッシュDNS：example.com を管理する権威DNSに尋ねます。",
        receive: "権威DNS：自分が管理している名前なので、答えを用意します。",
        wire: {
          app: "DNS（問合せ）",
          transport: "UDP",
          srcPort: "49733",
          dstPort: "53",
          srcIp: GLOBAL_IP,
          dstIp: ADNS_IP,
        },
      },
      {
        from: "adns",
        to: "cache",
        kind: "normal",
        label: "答え",
        title: "答えが返り、しばらく覚えておく",
        fields: [
          ["答え", `www.example.com は ${SITE_IP}`],
          ["覚えておく時間（TTL）", "3600秒"],
        ],
        note: "覚えておけば、次に同じ名前を聞かれたときに、すぐに答えられます。",
        send: "権威DNS：IPアドレスと、覚えておいてよい時間を返します。",
        receive: "キャッシュDNS：答えを覚えておきます。",
        wire: {
          app: "DNS（応答）",
          transport: "UDP",
          srcPort: "53",
          dstPort: "49733",
          srcIp: ADNS_IP,
          dstIp: GLOBAL_IP,
        },
        changes: [
          {
            table: "cache",
            key: "www.example.com",
            value: `${SITE_IP}（3600秒）`,
          },
        ],
      },
      {
        from: "cache",
        to: "pc",
        kind: "normal",
        label: "IPアドレス",
        title: "ブラウザがIPアドレスを知る",
        fields: [["答え", `www.example.com は ${SITE_IP}`]],
        note: "もしここで嘘の住所を覚えさせられると、利用者は偽のサイトへ向かってしまいます（DNS名前解決のシナリオ）。",
        send: "キャッシュDNS：答えをブラウザに返します。",
        receive: "ブラウザ：つなぐ先のIPアドレスが分かりました。",
        wire: {
          app: "DNS（応答）",
          transport: "UDP",
          srcPort: "53",
          dstPort: "53000",
          srcIp: CACHE_IP,
          dstIp: PC_IP,
        },
      },
      {
        from: "pc",
        to: "site",
        kind: "normal",
        label: "ClientHello",
        title: "HTTPSで「暗号で話しましょう」と声をかける",
        fields: [
          ["使える暗号", "ブラウザが使える暗号の方式の一覧"],
          ["鍵の材料", "共通の鍵を作るための材料（公開値）"],
        ],
        note: "HTTPSは、HTTPをTLSで暗号化したものです。まず、暗号の方式と鍵を決めるやり取り（ハンドシェイク）をします。",
        send: "ブラウザ：調べたIPアドレスの443番につなぎ、暗号の準備を始めます。",
        receive: "Webサイト：暗号の方式を選び、自分の鍵の材料を用意します。",
        wire: {
          app: "TLS（ClientHello）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: SITE_IP,
        },
      },
      {
        from: "site",
        to: "pc",
        kind: "normal",
        label: "証明書",
        title: "身分証（サーバ証明書）を見せる",
        fields: [
          [
            "鍵の材料",
            "Webサイトの公開値。これで、お互いに同じ共通の鍵ができる",
          ],
          [
            "サーバ証明書",
            "「www.example.com はこのサーバ」と、認証局が保証したもの",
          ],
          [
            "ブラウザの確認",
            "信頼する認証局の発行か、名前が合っているか、期限内か",
          ],
        ],
        note: "証明書を確かめるので、途中に偽物がいても気付けます（HTTPSのシナリオ）。",
        send: "Webサイト：鍵の材料と、サーバ証明書を送ります。",
        receive:
          "ブラウザ：証明書を確かめ、本物の www.example.com だと分かります。",
        wire: {
          app: "TLS（ServerHello、証明書）",
          transport: "TCP",
          srcPort: "443",
          dstPort: "50000",
          srcIp: SITE_IP,
          dstIp: PC_IP,
        },
      },
      {
        from: "pc",
        to: "site",
        kind: "normal",
        label: "GET /",
        title: "暗号でページを頼む",
        fields: [
          ["中身", "ページの要求（HTTP）"],
          ["暗号化", "共通の鍵で暗号化。途中の機器には中身が読めない"],
        ],
        note: "途中の機器に見えるのは、IPアドレスやポート番号などの見出しだけです。",
        send: "ブラウザ：ページの要求を、暗号化して送ります。",
        receive: "Webサイト：復号して、要求を受け取ります。",
        wire: {
          app: "HTTP（GET /）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: SITE_IP,
          secure: "TLS",
          focus: ["sec"],
        },
      },
      {
        from: "site",
        to: "pc",
        kind: "normal",
        label: "ページ",
        title: "ページが暗号で届く",
        fields: [["中身", "Webページ（暗号化されている）"]],
        note: "ブラウザのアドレス欄の鍵のマークは、この暗号の通信ができていることを表します。",
        send: "Webサイト：ページを暗号化して返します。",
        receive: "ブラウザ：復号して、ページを表示します。",
        wire: {
          app: "HTTP（200 OK）",
          transport: "TCP",
          srcPort: "443",
          dstPort: "50000",
          srcIp: SITE_IP,
          dstIp: PC_IP,
          secure: "TLS",
        },
      },
    ],
    ...NO_STEPS,
  },
  points: [
    "DNS：名前からIPアドレスを調べる。PC → キャッシュDNS → 権威DNS の順に問い合わせ、答えはしばらく覚えておく（TTL）",
    "HTTPS：TLSのハンドシェイクで、暗号の方式と共通の鍵を決め、サーバ証明書で相手が本物かを確かめる",
    "暗号化しても、IPアドレスやポート番号などの見出しは途中の機器から見える",
  ],
  incidentPoints: [],
  topology: {
    map: { pc: "pc", cache: "cache", adns: "ext2", site: "ext1" },
    shields: [],
    devices: {
      ext1: { type: "server", name: "Webサイト", sub: "www.example.com" },
      ext2: { type: "server", name: "権威DNS", sub: "example.com" },
    },
  },
});

/** 基礎5：FWとDMZ */
export const fwdmz = defineScenario({
  id: "fwdmz",
  basic: true,
  name: "FWとDMZ",
  threat: "基礎：通してよい通信だけを通す",
  actors: [
    { id: "user", name: "外部の利用者", sub: "インターネット" },
    { id: "web", name: "公開Webサーバ", sub: "DMZ" },
    { id: "pc", name: "PC", sub: "社内" },
    { id: "fs", name: "ファイルサーバ", sub: "社内" },
  ],
  summary: {
    normal:
      "FWは、ルールに合う通信だけを通す関所です。外部に公開するサーバはDMZに置き、社内LANとは分けます。外からは公開サーバにだけ、社内からは外へ出る通信と、その返事だけを通します。",
    ...NONE,
  },
  states: [
    {
      id: "rules",
      title: "FWのルール（上から順に照らし合わせる）",
      columns: ["番号", "通信と扱い"],
      initial: {
        normal: [
          ["1", "外部 → DMZのWebサーバ（443番）：許可"],
          ["2", "社内 → 外部（443番）：許可"],
          ["3", "それ以外：拒否"],
        ],
      },
    },
    {
      id: "sessions",
      title: "FWが覚えている通信（行きの記録）",
      columns: ["通信", "状態"],
    },
  ],
  steps: {
    normal: [
      {
        from: "user",
        to: "web",
        kind: "normal",
        label: "443番：許可",
        title: "外から公開Webサーバへの通信は通す",
        fields: [
          ["通信", `外部の利用者 → ${DMZ_WEB} の443番`],
          ["照らし合わせ", "ルール1に一致 → 許可"],
        ],
        note: "公開するサーバは、社内LANではなく、DMZという別の区画に置きます。",
        send: "外部の利用者：会社の公開Webサーバを開きます。",
        via: {
          fw: "FW：ルール1（外部 → DMZのWebサーバの443番）に一致するので、通します。",
        },
        receive: "公開Webサーバ：ページを返します。",
        wire: {
          app: "HTTPS（ページの要求）",
          transport: "TCP",
          srcPort: "51000",
          dstPort: "443",
          srcIp: "198.51.100.20",
          dstIp: DMZ_WEB,
          secure: "TLS",
          focus: ["l3", "l4"],
        },
      },
      {
        from: "user",
        to: "fs",
        kind: "blocked",
        label: "社内へ：拒否",
        title: "外から社内LANへの通信は通さない",
        fields: [
          ["通信", `外部の利用者 → ${FS_IP} の445番（ファイル共有）`],
          ["照らし合わせ", "ルール1・2に合わない → ルール3で拒否"],
        ],
        note: "許可したもの以外はすべて拒否する、という考え方（ホワイトリスト方式）が基本です。",
        send: "外部の利用者：社内のファイルサーバにつなごうとします。",
        blockedAt: "fw",
        receive: "FW：どの許可のルールにも合わないので、捨てて記録します。",
        wire: {
          app: "SMB（ファイル共有）",
          transport: "TCP",
          srcPort: "51001",
          dstPort: "445",
          srcIp: "198.51.100.20",
          dstIp: FS_IP,
          focus: ["l3", "l4"],
        },
      },
      {
        from: "pc",
        to: "user",
        kind: "normal",
        label: "外へ：許可",
        title: "社内から外への通信は通し、行きを覚えておく",
        fields: [
          ["通信", `${PC_IP} → インターネットのサイトの443番`],
          ["照らし合わせ", "ルール2に一致 → 許可"],
          [
            "FWの記録",
            "この通信の行きを覚えておく（ステートフルインスペクション）",
          ],
        ],
        note: "ここでは、行き先を「外部の利用者」の機器で代わりに表しています。",
        send: "PC：インターネットのWebサイトを開きます。",
        via: {
          fw: "FW：ルール2に一致するので通し、この通信を覚えておきます。",
        },
        receive: "インターネットのサイト：要求を受け取ります。",
        wire: {
          app: "HTTPS（ページの要求）",
          transport: "TCP",
          srcPort: "50000",
          dstPort: "443",
          srcIp: PC_IP,
          dstIp: "198.51.100.20",
          secure: "TLS",
        },
        changes: [
          {
            table: "sessions",
            key: `${PC_IP}:50000 → 外部:443`,
            value: "行きを通した",
            at: "fw",
          },
        ],
      },
      {
        from: "user",
        to: "pc",
        kind: "normal",
        label: "返事：許可",
        title: "行きを覚えているので、返事は通す",
        fields: [
          ["通信", `外部:443 → ${PC_IP}:50000`],
          ["照らし合わせ", "覚えている行きの通信の返事 → 許可"],
        ],
        note: "外から社内への通信は拒否していても、社内から始めた通信の返事だけは通せます。",
        send: "インターネットのサイト：ページを返します。",
        via: { fw: "FW：覚えている通信の返事なので、通します。" },
        receive: "PC：ページを受け取ります。",
        wire: {
          app: "HTTPS（ページ）",
          transport: "TCP",
          srcPort: "443",
          dstPort: "50000",
          srcIp: "198.51.100.20",
          dstIp: PC_IP,
          secure: "TLS",
        },
        changes: [
          {
            table: "sessions",
            key: `${PC_IP}:50000 → 外部:443`,
            value: "返事も通した",
          },
        ],
      },
      {
        from: "web",
        to: "fs",
        kind: "blocked",
        label: "DMZ → 社内：拒否",
        title: "DMZのサーバから社内LANへの通信も通さない",
        fields: [
          ["通信", `${DMZ_WEB} → ${FS_IP} の445番`],
          ["照らし合わせ", "ルール3で拒否"],
          ["ねらい", "公開サーバが乗っ取られても、社内に広がらないようにする"],
        ],
        note: "公開サーバは外から攻撃を受けやすいので、社内LANとは分けて、社内への通信は必要なものだけに絞ります。",
        send: "公開Webサーバ：社内のファイルサーバにつなごうとします。",
        blockedAt: "fw",
        receive: "FW：許可のルールにないので、捨てて記録します。",
        wire: {
          app: "SMB（ファイル共有）",
          transport: "TCP",
          srcPort: "52000",
          dstPort: "445",
          srcIp: DMZ_WEB,
          dstIp: FS_IP,
          focus: ["l3", "l4"],
        },
      },
    ],
    ...NO_STEPS,
  },
  points: [
    "FWは、ルールを上から順に照らし合わせ、許可したもの以外を拒否する",
    "公開するサーバはDMZに置き、社内LANと分ける。DMZから社内への通信も必要なものだけに絞る",
    "ステートフルインスペクション：社内から始めた通信の行きを覚え、その返事だけを通す",
    "FWはアドレスとポートを見る。通信の中身（SQLインジェクションなど）を調べるのはWAFの役割",
  ],
  incidentPoints: [],
  topology: {
    map: { user: "ext1", web: "web", pc: "pc", fs: "lan2" },
    shields: [],
    devices: {
      ext1: { type: "pc", name: "外部の利用者", sub: "インターネット" },
      lan2: { type: "server", name: "ファイルサーバ", sub: "社内" },
    },
  },
});
