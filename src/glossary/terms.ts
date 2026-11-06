/**
 * 用語集。aliases に書いた文字列が、ステップの説明や論点の中に出てくると、その用語として扱う
 * （大文字・小文字を区別した完全一致。長いものから優先して照合する）。
 */
export interface Term {
  id: string
  name: string
  aliases: readonly string[]
  description: string
}

export const TERMS: readonly Term[] = [
  // 暗号の基礎
  {
    id: 'cia',
    name: '機密性・完全性・可用性',
    aliases: ['機密性', '完全性', '可用性'],
    description:
      '情報セキュリティの3要素（CIA）。機密性：許可された人だけが情報を見られる。完全性：情報が正確で、改ざんされていない。可用性：必要なときに情報やサービスを使える。JIS Q 27000は、この3つを維持することを情報セキュリティと定義し、真正性・責任追跡性・否認防止・信頼性を含めることもあるとしている。',
  },
  {
    id: 'authenticity',
    name: '真正性',
    aliases: ['真正性'],
    description: '利用者や情報が、名乗っているとおりの本物であること。電子署名や認証で確かめる。機密性・完全性・可用性に加えて挙げられる特性の1つ。',
  },
  {
    id: 'accountability',
    name: '責任追跡性',
    aliases: ['責任追跡性'],
    description:
      'だれが、いつ、何をしたかを後から追跡できること。利用者ごとのID（共有しない）、アクセスログ、正確な時刻合わせで実現する。機密性・完全性・可用性に加えて挙げられる特性の1つ。',
  },
  {
    id: 'reliability',
    name: '信頼性',
    aliases: ['信頼性'],
    description: 'システムが、意図したとおりに一貫して動作し、結果を出すこと。機密性・完全性・可用性に加えて挙げられる特性の1つ。',
  },
  {
    id: 'non-repudiation',
    name: '否認防止',
    aliases: ['否認防止'],
    description: '後から「その操作はしていない」「送っていない」と否定できないようにすること。送信者の秘密鍵による電子署名で実現する。',
  },
  {
    id: 'hybrid-crypto',
    name: 'ハイブリッド暗号',
    aliases: ['ハイブリッド暗号'],
    description: 'データは処理の速い共通鍵暗号で暗号化し、その共通鍵を公開鍵暗号や鍵交換で安全に受け渡す方式。TLSやS/MIMEで使われる。',
  },
  {
    id: 'crypto-compromise',
    name: '暗号の危殆化',
    aliases: ['危殆化'],
    description: '計算機の性能の向上や解読の手法の発見で、暗号の安全性が低下すること。MD5・SHA-1（衝突）、DES、RC4、鍵長1024ビットのRSAなどが該当し、安全な暗号に移行する。',
  },
  {
    id: 'cryptrec',
    name: 'CRYPTREC暗号リスト',
    aliases: ['CRYPTREC暗号リスト', 'CRYPTREC'],
    description: 'CRYPTRECが安全性と実装性を評価して公開している暗号の一覧。電子政府推奨暗号リスト、推奨候補暗号リスト、運用監視暗号リストに分かれる。',
  },
  {
    id: 'kms',
    name: '鍵管理サービス（KMS）',
    aliases: ['鍵管理サービス', 'KMS', 'エンベロープ暗号化'],
    description:
      '暗号の鍵の生成・保管・利用・更新・廃棄をまとめて管理するサービス（クラウドで提供されることが多い）。データを暗号化する鍵を、さらにマスターキーで暗号化して保管するエンベロープ暗号化がよく使われる。',
  },
  {
    id: 'side-channel',
    name: 'サイドチャネル攻撃',
    aliases: ['サイドチャネル攻撃'],
    description: '暗号の処理にかかる時間、消費電力、電磁波など、計算の外に漏れる情報から鍵などの秘密を推測する攻撃。耐タンパ性を持たせて防ぐ。',
  },
  {
    id: 'tamper-resistance',
    name: '耐タンパ性',
    aliases: ['耐タンパ性', 'JCMVP'],
    description:
      '装置の内部の情報を、分解や測定によって不正に読み取られにくい性質。ICカードやHSMは、こじ開けられると鍵を消去するなどの仕組みを持つ。暗号モジュールを第三者が試験・認証する国内の制度にJCMVPがある。',
  },
  {
    id: 'pqc',
    name: '耐量子計算機暗号（PQC）',
    aliases: ['耐量子計算機暗号', 'PQC'],
    description:
      '量子コンピュータでも解読が難しいとされる暗号。大規模な量子コンピュータが実用化されると、RSAや楕円曲線暗号が破られると考えられているため、移行が進められている。米国のNISTが2024年に標準を公表した。',
  },
  {
    id: 'timestamp',
    name: 'タイムスタンプ（時刻認証）',
    aliases: ['タイムスタンプ', '時刻認証', '長期署名'],
    description:
      '時刻認証局が、文書のハッシュ値と時刻に署名し、その時刻に文書が存在し、それ以後書き換えられていないことを証明する仕組み。暗号の危殆化の前に新しいタイムスタンプを重ね、署名の有効性を延ばすものを長期署名という。',
  },
  {
    id: 'symmetric-key',
    name: '共通鍵暗号方式',
    aliases: ['共通鍵暗号方式', '共通鍵暗号', '共通鍵'],
    description:
      '暗号化と復号に同じ鍵を使う方式。処理が速く、大きなデータの暗号化に向く。鍵を相手と安全に共有する方法が課題で、TLSやIPsecでは鍵交換（ECDHE、Diffie-Hellman）で共有する。AESが代表例。',
  },
  {
    id: 'public-key',
    name: '公開鍵暗号方式（公開鍵と秘密鍵）',
    aliases: ['公開鍵暗号方式', '公開鍵暗号', '公開鍵', '秘密鍵', '鍵ペア'],
    description:
      '対になる2つの鍵を使う方式。公開鍵はだれに渡してもよく、秘密鍵は持ち主だけが保管する。暗号化では「受信者の公開鍵で暗号化し、受信者の秘密鍵で復号」、電子署名では「送信者の秘密鍵で署名し、送信者の公開鍵で検証」と使い分ける。RSAや楕円曲線暗号がある。',
  },
  {
    id: 'hash',
    name: 'ハッシュ関数',
    aliases: ['ハッシュ関数', 'ハッシュ値', 'ハッシュ', 'SHA-256'],
    description:
      'データから、決まった長さの値（ハッシュ値）を計算する関数。元のデータが少しでも変わると値が大きく変わり、ハッシュ値から元のデータを求めることも、同じハッシュ値になる別のデータを見つけることも困難。改ざんの検知や電子署名に使う。SHA-256が代表例。',
  },
  {
    id: 'digital-signature',
    name: '電子署名（デジタル署名）',
    aliases: ['電子署名', 'デジタル署名', '署名'],
    description:
      '文書のハッシュ値から、送信者の秘密鍵を使って作る値。受信者は送信者の公開鍵で検証し、改ざんされていないこと（完全性）、本人が作ったこと（真正性）、後から否定できないこと（否認防止）を確かめる。文書を暗号化するものではない。',
  },
  {
    id: 'mac',
    name: 'メッセージ認証コード（MAC）',
    aliases: ['メッセージ認証コード', 'HMAC'],
    description:
      '共通鍵とデータから計算する短い値。受信側も同じ鍵で計算して一致を確かめ、改ざんを検知する。鍵を共有する双方が作れるので、電子署名と違って、だれが作ったかの証明（否認防止）にはならない。HMACが代表例。',
  },
  {
    id: 'certificate',
    name: '電子証明書',
    aliases: ['電子証明書', 'デジタル証明書', '証明書'],
    description:
      '公開鍵と持ち主の情報（名前、有効期限など）に、認証局（CA）が署名したもの。受け取った側は認証局の公開鍵で署名を検証し、その公開鍵が本人のものだと確かめる。形式はX.509。',
  },
  {
    id: 'pki',
    name: 'PKI（公開鍵基盤）',
    aliases: ['PKI', '公開鍵基盤'],
    description:
      '公開鍵とその持ち主の対応を、認証局（CA）が電子証明書で保証する仕組みの全体。証明書の発行と失効（CRL、OCSP）、信頼の起点となるルートCAの管理を含む。',
  },
  {
    id: 'cipher-suite',
    name: '暗号スイート',
    aliases: ['暗号スイート'],
    description: 'TLSで使う暗号アルゴリズムの組合せ。TLS 1.3では、データを暗号化する方式（例：AES-GCM）とハッシュ関数（例：SHA-256）の組を表す。',
  },
  {
    id: 'aes-gcm',
    name: 'AES-GCM',
    aliases: ['AES-GCM'],
    description: '共通鍵暗号方式のAESを、GCMという方式で使う暗号。暗号化と同時に改ざん検知用の値も作る（認証付き暗号）。TLSやIPsecで広く使われる。',
  },
  {
    id: 'nonce',
    name: 'ノンス',
    aliases: ['ノンス'],
    description: '一度だけ使う乱数などの値。過去のやりとりの再利用（リプレイ攻撃）を防いだり、鍵の計算に毎回違う材料を混ぜたりするために使う。',
  },

  // ネットワークの基礎
  {
    id: 'packet',
    name: 'パケット',
    aliases: ['パケット'],
    description: 'ネットワークで運ぶデータの小さなかたまり。大きなデータは小分けにし、宛先などを書いたヘッダを付けて送る。',
  },
  {
    id: 'encapsulation',
    name: 'カプセル化',
    aliases: ['カプセル化', '非カプセル化'],
    description:
      '送信側で、上の層のデータに下の層のヘッダを順に付けること（HTTP → TCP → IP → Ethernet）。受信側は外側から順に外す（非カプセル化）。',
  },
  {
    id: 'private-ip',
    name: 'プライベートIPアドレス',
    aliases: ['プライベートIPアドレス', 'グローバルIPアドレス'],
    description:
      '組織の中で自由に使えるIPアドレス（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）。インターネットではそのまま使えず、外に出るときにグローバルIPアドレスに変換する。',
  },
  {
    id: 'napt',
    name: 'NAPT',
    aliases: ['NAPT', 'IPマスカレード'],
    description:
      'IPアドレスとポート番号の組を変換し、複数の機器で1つのグローバルIPアドレスを共有する仕組み。変換表を使って、返事を元の機器に戻す。',
  },
  {
    id: 'dmz',
    name: 'DMZ',
    aliases: ['DMZ'],
    description:
      'インターネットと社内LANの間に設ける、公開サーバを置く区画。公開サーバが乗っ取られても、社内LANへ被害が広がりにくいよう、FWで通信を絞る。',
  },
  {
    id: 'stateful-inspection',
    name: 'ステートフルインスペクション',
    aliases: ['ステートフルインスペクション'],
    description: 'FWが通信の行きを記録しておき、それに対応する返事のパケットだけを通す仕組み。外から始まる通信は拒否したまま、社内から始めた通信は使える。',
  },
  {
    id: 'whitelist',
    name: 'ホワイトリスト方式',
    aliases: ['ホワイトリスト方式', '許可リスト'],
    description: '許可するものだけを列挙し、それ以外をすべて拒否する考え方。FWのルールの基本。反対に、拒否するものを列挙するのがブラックリスト方式。',
  },
  {
    id: 'tcp',
    name: 'TCP',
    aliases: ['TCP'],
    description: 'コネクション型のプロトコル。3ウェイハンドシェイクで接続を確立し、届かなかったデータの再送や順序の整列を行う。HTTPS（443番）やSMTP（25番）が使う。',
  },
  {
    id: 'port-number',
    name: 'ポート番号',
    aliases: ['ポート番号', '送信元ポート', '宛先ポート'],
    description:
      '1台の機器の中で、通信相手のプログラム（サービス）を区別する番号。サーバ側はサービスごとに決まった番号（DNSは53、HTTPSは443など）で待ち受け、クライアント側は毎回空いている番号を使う。',
  },

  // DNS
  {
    id: 'stub-resolver',
    name: 'スタブリゾルバ',
    aliases: ['スタブリゾルバ'],
    description: 'PCなどの端末にある名前解決の機能。自分では調べず、キャッシュDNSサーバに再帰問合せを送って、答えだけを受け取る。',
  },
  {
    id: 'cache-dns',
    name: 'キャッシュDNSサーバ',
    aliases: ['キャッシュDNS', 'フルリゾルバ'],
    description: '利用者からの問合せを受けて、権威DNSサーバを順にたどって答えを調べ、結果を一定時間キャッシュするDNSサーバ。フルリゾルバとも呼ぶ。',
  },
  {
    id: 'authoritative-dns',
    name: '権威DNSサーバ',
    aliases: ['権威DNS'],
    description: '自分が管理するゾーン（例：example.net）の情報を持ち、問合せに対して正式な答えを返すDNSサーバ。',
  },
  {
    id: 'recursive-query',
    name: '再帰問合せ',
    aliases: ['再帰問合せ'],
    description: '「最終的な答えまで調べて返してほしい」という問合せ。端末からキャッシュDNSサーバへ送る。',
  },
  {
    id: 'iterative-query',
    name: '反復問合せ',
    aliases: ['反復問合せ'],
    description: 'キャッシュDNSサーバが、ルート、TLD、各ゾーンの権威DNSサーバへと順に問い合わせて、答えをたどっていくこと。',
  },
  {
    id: 'ttl',
    name: 'TTL',
    aliases: ['TTL'],
    description: 'DNSの応答をキャッシュしてよい時間（秒）。TTLが切れるまでは、キャッシュの内容が使われ続ける。',
  },
  {
    id: 'cache-poisoning',
    name: 'DNSキャッシュポイズニング',
    aliases: ['キャッシュポイズニング'],
    description: 'キャッシュDNSサーバに偽の応答を受け入れさせ、偽の情報をキャッシュさせる攻撃。そのサーバを使う利用者全員が、偽のサイトへ誘導される。',
  },
  {
    id: 'kaminsky',
    name: 'カミンスキー攻撃',
    aliases: ['カミンスキー型'],
    description: '存在しないサブドメインを問い合わせさせて偽の応答を送り込み、ドメイン全体の権威DNSサーバの情報を書き換えるキャッシュポイズニングの手法。毎回違う名前を使うので、TTLを待たずに何度でも試せる。',
  },
  {
    id: 'open-resolver',
    name: 'オープンリゾルバ',
    aliases: ['オープンリゾルバ'],
    description: '誰からの再帰問合せにも応答してしまうキャッシュDNSサーバ。キャッシュポイズニングやDNSリフレクション攻撃に悪用される。',
  },
  {
    id: 'source-port-randomization',
    name: '送信元ポートのランダム化',
    aliases: ['送信元ポートのランダム化', '送信元ポートもランダム'],
    description: 'キャッシュDNSサーバが、問合せのたびに送信元ポートを変えること。攻撃者が当てなければならない組合せが増え、偽の応答が受理されにくくなる。',
  },
  {
    id: 'dnssec',
    name: 'DNSSEC',
    aliases: ['DNSSEC'],
    description: 'DNSの応答に電子署名を付け、受け取った側が検証できるようにする仕組み。応答の改ざんやなりすましを検知できるが、暗号化はしない。',
  },
  {
    id: 'rrsig',
    name: 'RRSIG',
    aliases: ['RRSIG'],
    description: 'DNSSECで、レコードに付ける署名のレコード。ゾーンの秘密鍵で作られる。',
  },
  {
    id: 'dnskey',
    name: 'DNSKEY',
    aliases: ['DNSKEY'],
    description: 'DNSSECで、署名の検証に使うゾーンの公開鍵を載せたレコード。',
  },
  {
    id: 'ds-record',
    name: 'DSレコード',
    aliases: ['親ゾーンのDS', 'DSレコード'],
    description: '子ゾーンの鍵（DNSKEY）のハッシュ値を、親ゾーンに登録するレコード。親から子へと鍵の正しさをたどる「信頼の連鎖」をつくる。',
  },

  // TLS・PKI
  {
    id: 'tls13',
    name: 'TLS 1.3',
    aliases: ['TLS 1.3'],
    description: '2018年に標準化されたTLSの版。ハンドシェイクが1往復になり、前方秘匿性のない鍵交換や古い暗号方式が廃止された。',
  },
  {
    id: 'client-hello',
    name: 'ClientHello',
    aliases: ['ClientHello'],
    description: 'TLSのハンドシェイクで、クライアントが最初に送るメッセージ。使える暗号スイート、鍵交換の材料（key_share）、接続先のホスト名（SNI）などを含む。',
  },
  {
    id: 'sni',
    name: 'SNI',
    aliases: ['SNI'],
    description: 'TLSの接続を始めるときに、接続したいホスト名をサーバに伝える拡張。1つのIPアドレスで複数のサイトを運用するために使う。',
  },
  {
    id: 'ecdhe',
    name: 'ECDHE',
    aliases: ['ECDHE'],
    description: '楕円曲線を使ったDiffie-Hellman鍵交換を、接続のたびに使い捨ての鍵で行う方式。前方秘匿性を実現する。',
  },
  {
    id: 'pfs',
    name: '前方秘匿性（PFS）',
    aliases: ['前方秘匿性', 'PFS'],
    description: 'サーバの秘密鍵が後で漏えいしても、過去に記録された通信を復号できない性質。',
  },
  {
    id: 'server-certificate',
    name: 'サーバ証明書',
    aliases: ['サーバ証明書', '証明書チェーン'],
    description: 'サーバの公開鍵とドメイン名の結び付きを、認証局（CA）が電子署名で保証する証明書。中間CA、ルートCAへとたどって正しさを確かめる。',
  },
  {
    id: 'ca',
    name: '認証局（CA）',
    aliases: ['ルートCA', '中間CA', '認証局'],
    description: '電子証明書を発行し、その正しさを電子署名で保証する機関。ブラウザやOSには、信頼するルートCAの証明書があらかじめ入っている。',
  },
  {
    id: 'san',
    name: 'SAN',
    aliases: ['SAN'],
    description: 'サーバ証明書に書かれた、その証明書が有効なホスト名（Subject Alternative Name）。アクセス先のホスト名と一致している必要がある。',
  },
  {
    id: 'certificate-verify',
    name: 'CertificateVerify',
    aliases: ['CertificateVerify'],
    description: 'TLS 1.3で、サーバがそれまでのやりとりに、サーバ証明書の秘密鍵で署名して送るメッセージ。証明書の持ち主本人であることを示す。',
  },
  {
    id: 'ocsp',
    name: 'OCSP',
    aliases: ['OCSP'],
    description: '証明書が失効していないかを、認証局が用意したサーバに問い合わせて確認する仕組み。',
  },
  {
    id: 'mitm',
    name: '中間者攻撃（MITM）',
    aliases: ['中間者攻撃', 'MITM'],
    description: '通信する2者の間に攻撃者が入り込み、双方になりすまして通信を中継しながら、盗聴や改ざんを行う攻撃。',
  },
  {
    id: 'evil-twin',
    name: '偽アクセスポイント',
    aliases: ['偽アクセスポイント', '偽AP'],
    description:
      '正規の無線LAN（公衆Wi-Fiや社内の無線LAN）と同じ名前（SSID）を名乗って、攻撃者が設置するアクセスポイント。接続した端末の通信を中継したり、認証情報を盗んだりする。Evil Twinとも呼ぶ。',
  },
  {
    id: 'hsts',
    name: 'HSTS',
    aliases: ['HSTS', 'Strict-Transport-Security'],
    description: 'このドメインにはHTTPSでしか接続しないよう、ブラウザに指示するHTTPヘッダ。証明書のエラーが出たときに、利用者が警告を無視して進むこともできなくなる。',
  },
  {
    id: 'ssl-stripping',
    name: 'SSLストリッピング',
    aliases: ['SSLストリッピング'],
    description: 'HTTPからHTTPSへ切り替わる前の通信に割り込み、利用者にHTTPのまま通信させ続ける攻撃。HSTS（プリロード）で防ぐ。',
  },
  {
    id: 'certificate-transparency',
    name: 'Certificate Transparency（CT）',
    aliases: ['Certificate Transparency'],
    description: '発行されたすべての証明書を、公開のログに記録する仕組み。ドメインの持ち主は、自分のドメインに不正な証明書が発行されていないかを監視できる。',
  },

  // メール
  {
    id: 'smtp',
    name: 'SMTP',
    aliases: ['SMTP'],
    description: 'メールを送信・転送するためのプロトコル。それ自体には、送信者を確かめる仕組みがない。',
  },
  {
    id: 'envelope-from',
    name: 'エンベロープFrom',
    aliases: ['エンベロープFrom', 'MAIL FROM'],
    description: 'SMTPのやりとりの中で、MAIL FROMコマンドで伝える送信者のアドレス。エラーメールの返送先になる。SPFはこのドメインで検証する。',
  },
  {
    id: 'header-from',
    name: 'ヘッダFrom',
    aliases: ['ヘッダFrom', 'From:'],
    description: 'メールのヘッダにある差出人のアドレス。受信者のメールソフトに表示される。DMARCはこのドメインで検証する。',
  },
  {
    id: 'spf',
    name: 'SPF',
    aliases: ['SPF'],
    description: 'メールを送ってよいサーバのIPアドレスを送信ドメインのDNSに公開し、受信側が送信元のIPアドレスと照合する送信ドメイン認証。',
  },
  {
    id: 'dkim',
    name: 'DKIM',
    aliases: ['DKIM'],
    description: '送信側のサーバがメールに電子署名を付け、受信側が、送信ドメインのDNSで公開された公開鍵で検証する送信ドメイン認証。',
  },
  {
    id: 'dmarc',
    name: 'DMARC',
    aliases: ['DMARC'],
    description: 'SPFやDKIMの結果と、ヘッダFromのドメインとの一致（アライメント）を確かめ、認証に失敗したメールの扱い（none・quarantine・reject）を送信ドメイン側が指定する仕組み。',
  },
  {
    id: 'alignment',
    name: 'アライメント',
    aliases: ['アライメント'],
    description: 'DMARCで、SPFやDKIMで認証されたドメインと、ヘッダFromのドメインが一致していること。',
  },
  {
    id: 'bec',
    name: 'ビジネスメール詐欺（BEC）',
    aliases: ['ビジネスメール詐欺', 'BEC'],
    description: '取引先や経営者になりすましたメールで、偽の口座に送金させる詐欺。',
  },
  {
    id: 'op25b',
    name: 'OP25B',
    aliases: ['OP25B'],
    description: 'ISPが、利用者の端末から外部のメールサーバの25番ポートへの通信を遮断する対策。迷惑メールの直接送信を防ぐ。',
  },
  {
    id: 'submission-port',
    name: 'サブミッションポート',
    aliases: ['サブミッションポート'],
    description: 'メールソフトがメールサーバへ送信するときに使う587番ポート。SMTP-AUTHで利用者を認証してから受け付ける。',
  },

  // Web
  {
    id: 'session-id',
    name: 'セッションID',
    aliases: ['セッションID'],
    description: 'ログインした状態を保つために、サーバが利用者ごとに発行する識別子。Cookieに入れて毎回送られる。盗まれると本人になりすまされる。',
  },
  {
    id: 'secure-attribute',
    name: 'Secure属性',
    aliases: ['Secure'],
    description: 'HTTPSで通信するときだけCookieを送るよう指定する、Cookieの属性。',
  },
  {
    id: 'httponly',
    name: 'HttpOnly属性',
    aliases: ['HttpOnly'],
    description: 'JavaScriptからCookieを読めないようにする、Cookieの属性。XSSでCookieを盗まれるのを防ぐ。',
  },
  {
    id: 'samesite',
    name: 'SameSite属性',
    aliases: ['SameSite'],
    description: 'ほかのサイトから始まったリクエストにCookieを付けるかどうかを指定する、Cookieの属性。Strict、Lax、Noneがあり、CSRFの対策になる。',
  },
  {
    id: 'csrf',
    name: 'CSRF',
    aliases: ['CSRF'],
    description: 'ログイン中の利用者に罠のページを開かせ、利用者が意図しないリクエスト（送金や設定の変更など）を正規のサイトへ送らせる攻撃。クロスサイトリクエストフォージェリ。',
  },
  {
    id: 'csrf-token',
    name: 'CSRFトークン',
    aliases: ['csrf_token', 'CSRFトークン'],
    description: 'サーバがフォームに埋め込む、推測できない値。送られてきた値がセッションと対応しているかを確かめ、ほかのサイトで作られたリクエストを見分ける。',
  },
  {
    id: 'session-fixation',
    name: 'セッション固定攻撃',
    aliases: ['セッション固定攻撃'],
    description: '攻撃者が用意したセッションIDを利用者に使わせ、ログインの後にそのIDで本人になりすます攻撃。ログインに成功したときにセッションIDを発行し直して防ぐ。',
  },
  {
    id: 'origin-header',
    name: 'Originヘッダ',
    aliases: ['Origin'],
    description: 'リクエストが、どのオリジン（スキーム・ホスト・ポートの組）のページから送られたかを示すHTTPヘッダ。CSRFの対策で確認に使える。',
  },
  {
    id: 'xss',
    name: 'XSS（クロスサイトスクリプティング）',
    aliases: ['XSS'],
    description: '利用者の入力をそのままWebページに出力してしまう不備を突き、攻撃者のスクリプトを利用者のブラウザで実行させる攻撃。',
  },
  {
    id: 'stored-xss',
    name: '格納型XSS',
    aliases: ['格納型'],
    description: '攻撃者のスクリプトがサーバのデータベースなどに保存され、そのページを閲覧した利用者全員のブラウザで実行されるXSS。蓄積型、持続型とも呼ぶ。',
  },
  {
    id: 'reflected-xss',
    name: '反射型XSS',
    aliases: ['反射型XSS'],
    description: 'URLのパラメータなどに含めたスクリプトが、そのまま応答のページに反映されて実行されるXSS。罠のリンクを利用者に踏ませて行う。',
  },
  {
    id: 'escape',
    name: 'エスケープ',
    aliases: ['エスケープ'],
    description: '「<」を「&lt;」に置き換えるように、特別な意味を持つ文字を、ただの文字として扱われる形に変換すること。XSSの根本対策。',
  },
  {
    id: 'csp',
    name: 'CSP（Content Security Policy）',
    aliases: ['CSP', 'Content-Security-Policy'],
    description: 'ページで実行してよいスクリプトや、読み込んでよいリソースの出どころを、ブラウザに指示するHTTPヘッダ。XSSの被害を抑える。',
  },
  {
    id: 'session-hijack',
    name: 'セッションハイジャック',
    aliases: ['セッションハイジャック'],
    description: 'ほかの人のセッションIDを盗んだり推測したりして、その利用者になりすます攻撃。',
  },
  {
    id: 'same-origin',
    name: '同一オリジンポリシー',
    aliases: ['同一オリジン'],
    description: 'あるオリジンのページのスクリプトは、ほかのオリジンのデータに原則アクセスできない、というブラウザの制限。XSSで注入されたスクリプトは、そのサイトのオリジンで動くため、この制限を受けない。',
  },
  {
    id: 'defense-in-depth',
    name: '多層防御',
    aliases: ['多層防御', '対策の多層化'],
    description: '1つの対策に頼らず、複数の対策を重ねて、どれか1つが破られても被害を防ぐ考え方。',
  },
  {
    id: 'waf',
    name: 'WAF',
    aliases: ['WAF'],
    description: 'Webアプリケーションへの通信を検査し、XSSやSQLインジェクションなどの攻撃のパターンを検知して遮断する装置やサービス。',
  },

  // Webアプリとデータベース
  {
    id: 'sql-injection',
    name: 'SQLインジェクション',
    aliases: ['SQLインジェクション'],
    description:
      '入力値をそのままつなげてSQL文を組み立てるWebアプリケーションに、SQLの記号や命令を含む値を入力して、SQL文の構造を変えてしまう攻撃。データベースの情報の読み出しや改ざん、認証の回避に悪用される。',
  },
  {
    id: 'placeholder',
    name: 'プレースホルダ（バインド機構）',
    aliases: ['プレースホルダ', 'バインド機構'],
    description:
      'SQL文の値を入れる場所を記号（? や $1）で示して、先にSQL文の構造を決め、入力値は後から値としてだけ割り当てる仕組み。SQLインジェクションの根本対策。',
  },
  {
    id: 'least-privilege',
    name: '最小権限の原則',
    aliases: ['最小権限'],
    description: '利用者やプログラムに、仕事に必要な最小限の権限だけを与える考え方。乗っ取られたときの被害の範囲を小さくできる。',
  },
  {
    id: 'salt',
    name: 'ソルト',
    aliases: ['ソルト'],
    description:
      'パスワードのハッシュ値を計算するときに、利用者ごとに付け加えるランダムな値。同じパスワードでも利用者ごとに異なるハッシュ値になり、レインボーテーブルによる割り出しを難しくする。',
  },
  {
    id: 'stretching',
    name: 'ストレッチング',
    aliases: ['ストレッチング'],
    description:
      'ハッシュ値の計算を何千回も繰り返して、1回の計算に時間がかかるようにすること。総当たりで元のパスワードを割り出すのに時間をかけさせる。bcrypt、PBKDF2、Argon2 などが使われる。',
  },
  {
    id: 'rainbow-table',
    name: 'レインボーテーブル',
    aliases: ['レインボーテーブル'],
    description: 'パスワードとハッシュ値の対応を、あらかじめ大量に計算しておいた表。ソルトのないハッシュ値から、元のパスワードを素早く割り出すのに使われる。',
  },

  // シングルサインオン
  {
    id: 'sso',
    name: 'シングルサインオン（SSO）',
    aliases: ['シングルサインオン', 'SSO'],
    description:
      '一度の認証で、複数のサービスを使えるようにする仕組み。認証をIdPに任せ、各サービス（SP）はIdPの認証の結果を信頼する。SAMLやOpenID Connectが使われる。',
  },
  {
    id: 'saml',
    name: 'SAML',
    aliases: ['SAML', 'AuthnRequest'],
    description:
      '認証の結果を、XMLで書いた署名付きのアサーションで受け渡す標準。SPは AuthnRequest で認証を依頼し、IdPはアサーションを、ブラウザ経由でSPへ届ける（SPとIdPは直接通信しない）。',
  },
  {
    id: 'idp',
    name: 'IdP（アイデンティティプロバイダ）',
    aliases: ['IdP'],
    description: '利用者を認証し、その結果をSPに伝えるサーバやサービス。署名の鍵が盗まれると、どの利用者のアサーションでも偽造できてしまう。',
  },
  {
    id: 'sp',
    name: 'SP（サービスプロバイダ）',
    aliases: ['SP'],
    description: 'IdPの認証の結果を受け取って、利用者にサービスを提供する側。SAMLでは、IdPの証明書を事前に登録して、アサーションの署名を検証する。',
  },
  {
    id: 'assertion',
    name: 'アサーション',
    aliases: ['アサーション', 'SAMLResponse'],
    description:
      'IdPが「この利用者を、いつ、どの方法で認証したか」を書いて署名した情報。宛先のSP（Audience）、有効期限、どの依頼への応答か（InResponseTo）を含み、SPはこれらと署名を確かめる。',
  },
  {
    id: 'oauth',
    name: 'OAuth 2.0',
    aliases: ['OAuth 2.0', 'OAuth'],
    description: '利用者の同意のもとで、アプリ（クライアント）に、APIを使う権限（アクセストークン）を与える認可の仕組み。それだけでは、本人の認証にはならない。',
  },
  {
    id: 'oidc',
    name: 'OpenID Connect',
    aliases: ['OpenID Connect', 'IDトークン'],
    description:
      'OAuth 2.0に、認証の結果を伝えるIDトークン（署名付きのJWT）を加えた仕組み。クライアントは、IDトークンの署名、発行者、宛先、有効期限、nonce を検証する。',
  },
  {
    id: 'authorization',
    name: '認可',
    aliases: ['認可'],
    description: '認証した利用者やアプリに、何をしてよいか（権限）を与えること。だれかを確かめる「認証」とは区別する。',
  },
  {
    id: 'access-token',
    name: 'アクセストークン',
    aliases: ['アクセストークン'],
    description: 'OAuth 2.0で、クライアントがAPIを使うときに示す、権限の証明。盗まれると、その権限の範囲でAPIを使われてしまう。',
  },
  {
    id: 'state-param',
    name: 'stateパラメータ',
    aliases: ['stateパラメータ'],
    description:
      'OAuth 2.0で、クライアントが認可の要求に付けるランダムな値。戻ってきた応答の値と照合して、攻撃者が仕組んだ応答（CSRF）を受け付けないようにする。',
  },
  {
    id: 'pkce',
    name: 'PKCE',
    aliases: ['PKCE'],
    description:
      'OAuth 2.0の認可コードフローで、クライアントが作った秘密の値（code_verifier）のハッシュ値を最初に送り、トークンの要求で元の値を示させる仕組み。横取りされた認可コードを使えなくする。',
  },
  {
    id: 'shared-responsibility',
    name: '責任共有モデル',
    aliases: ['責任共有モデル'],
    description:
      'クラウドサービスで、事業者と利用者がセキュリティの責任を分担する考え方。基盤は事業者、利用者のデータ・アカウント・設定は利用者が責任を持つ（分担の範囲は、IaaS・PaaS・SaaSで異なる）。',
  },

  // LAN
  {
    id: 'arp',
    name: 'ARP',
    aliases: ['ARP'],
    description: '同じLANの中で、IPアドレスに対応するMACアドレスを調べるプロトコル。ARP要求をブロードキャストし、該当する機器がARP応答を返す。',
  },
  {
    id: 'mac-address',
    name: 'MACアドレス',
    aliases: ['MACアドレス', '宛先MAC', '送信元MAC'],
    description: 'ネットワーク機器ごとに割り当てられる48ビットの識別子。同じLANの中で、データを届ける宛先として使う。',
  },
  {
    id: 'broadcast',
    name: 'ブロードキャスト',
    aliases: ['ブロードキャスト'],
    description: '同じネットワークの中のすべての機器に向けて送ること。MACアドレスでは ff:ff:ff:ff:ff:ff を宛先にする。',
  },
  {
    id: 'arp-table',
    name: 'ARPテーブル',
    aliases: ['ARPテーブル', 'ARPキャッシュ'],
    description: 'ARPで調べたIPアドレスとMACアドレスの対応を、一定時間保存しておく表。',
  },
  {
    id: 'default-gateway',
    name: 'デフォルトゲートウェイ',
    aliases: ['デフォルトゲートウェイ', 'ゲートウェイ'],
    description: '自分のネットワークの外へ送るパケットを、最初に渡す先のルータ（またはFW）。',
  },
  {
    id: 'arp-spoofing',
    name: 'ARPスプーフィング',
    aliases: ['ARPスプーフィング'],
    description: '偽のARP応答を送って相手のARPテーブルを書き換え、通信を攻撃者の端末に経由させる攻撃。同じLANの中で行われる。ARPキャッシュポイズニングとも呼ぶ。',
  },
  {
    id: 'gratuitous-arp',
    name: 'Gratuitous ARP',
    aliases: ['Gratuitous ARP'],
    description: '問い合わせを受けていないのに、自分のIPアドレスとMACアドレスの対応を知らせるARP。本来は重複の検出や対応の更新に使うが、なりすましにも悪用される。',
  },
  {
    id: 'dhcp-snooping',
    name: 'DHCPスヌーピング',
    aliases: ['DHCPスヌーピング'],
    description: 'スイッチがDHCPのやりとりを監視し、どのポートの端末にどのIPアドレスが割り当てられたかを記録する機能。不正なDHCPサーバの遮断にも使う。',
  },
  {
    id: 'dai',
    name: 'DAI（Dynamic ARP Inspection）',
    aliases: ['DAI', 'Dynamic ARP Inspection'],
    description: 'スイッチが、受け取ったARPの内容をDHCPスヌーピングの記録などと照合し、合わないARPを捨てる機能。ARPスプーフィングを防ぐ。',
  },
  {
    id: 'static-arp',
    name: '静的ARPエントリ',
    aliases: ['静的ARPエントリ', 'ARP ACL'],
    description: 'ARPの対応を手動で登録し、書き換えられないようにしたもの。ARPスプーフィングを防げるが、端末が多いと管理が大変になる。',
  },
  {
    id: 'lateral-movement',
    name: '横展開（ラテラルムーブメント）',
    aliases: ['横展開'],
    description: '侵入した端末を足がかりに、同じネットワークの中の別の端末やサーバへ、侵害を広げていくこと。',
  },

  // 標的型攻撃
  {
    id: 'apt',
    name: '標的型攻撃',
    aliases: ['標的型攻撃', '標的型メール'],
    description: '特定の組織をねらい、取引先や業務を装ったメール（標的型メール）などで侵入し、時間をかけて内部に広がって、情報を盗む攻撃。',
  },
  {
    id: 'c2',
    name: 'C&Cサーバ',
    aliases: ['C&Cサーバ'],
    description:
      '攻撃者が、マルウェアに感染した端末に命令を出し、盗んだ情報を受け取るためのサーバ。通信は、HTTPSなどのふだんの通信に紛れることが多い。',
  },
  {
    id: 'beacon',
    name: 'ビーコン',
    aliases: ['ビーコン'],
    description: '感染した端末のマルウェアが、命令を受け取るためにC&Cサーバへ定期的に送る通信。決まった間隔で同じ宛先への通信が続くことが、検知の手がかりになる。',
  },
  {
    id: 'proxy',
    name: 'プロキシサーバ',
    aliases: ['プロキシサーバ', 'プロキシ'],
    description: '社内の端末に代わって、インターネットのWebサイトへ接続する中継サーバ。通信のログが集まり、利用者の認証やURLフィルタリングもできる。',
  },
  {
    id: 'proxy-auth',
    name: 'プロキシ認証',
    aliases: ['プロキシ認証'],
    description: 'プロキシを使う前に、利用者をIDとパスワードなどで認証すること。認証情報を持たないマルウェアの、外部との通信を止める出口対策になる。',
  },
  {
    id: 'url-filter',
    name: 'URLフィルタリング',
    aliases: ['URLフィルタリング', 'URLフィルタ'],
    description: 'アクセス先のURLやドメインを、カテゴリや一覧と照らし合わせて、許可しないサイトへの接続を止める仕組み。',
  },
  {
    id: 'egress',
    name: '出口対策',
    aliases: ['出口対策'],
    description:
      '侵入されることを前提に、マルウェアと外部（C&Cサーバ）との通信や、情報の持ち出しを止める対策。PCからの直接の通信の禁止、プロキシ認証、URLフィルタリングなど。',
  },
  {
    id: 'privileged-id',
    name: '特権IDの管理',
    aliases: ['特権ID'],
    description: '管理者などの強い権限を持つID（特権ID）を、ふだんは使えないようにし、申請と承認のうえで一時的に使わせて、操作を記録する管理。',
  },
  {
    id: 'ids-ips',
    name: 'IDS・IPS',
    aliases: ['IDS', 'IPS'],
    description:
      'ネットワークの通信を監視して、攻撃や不正な通信のパターンを検知する仕組み。IDS（侵入検知システム）は検知して通知し、IPS（侵入防止システム）は通信の遮断まで行う。',
  },
  {
    id: 'sandbox',
    name: 'サンドボックス',
    aliases: ['サンドボックス'],
    description: 'メールの添付ファイルなどを、隔離した環境で実際に動かして、不審なふるまいがないかを調べる仕組み。',
  },
  {
    id: 'ioc',
    name: 'IoC（侵害の痕跡）',
    aliases: ['IoC'],
    description: '攻撃を受けた痕跡を示す情報。通信先のドメインやIPアドレス、マルウェアのファイルのハッシュ値など。ほかの端末や組織での感染の確認に使う。',
  },
  {
    id: 'isac',
    name: 'ISAC',
    aliases: ['ISAC'],
    description: '同じ業界の組織どうしが、サイバー攻撃の情報や対策を共有する組織（金融ISAC、ICT-ISACなど）。',
  },

  // DDoS
  {
    id: 'ddos',
    name: 'DDoS攻撃',
    aliases: ['DDoS'],
    description: '多数の機器から一斉に大量の通信を送り、サーバや回線をあふれさせてサービスを止める攻撃。',
  },
  {
    id: 'dns-reflection',
    name: 'DNSリフレクション攻撃',
    aliases: ['DNSリフレクション', 'リフレクション'],
    description: '送信元IPアドレスを被害者のものに偽装してDNSサーバに問い合わせ、応答を被害者に送りつける攻撃。応答が問合せより大きいため、DNSアンプ攻撃とも呼ぶ。',
  },
  {
    id: 'amplification',
    name: '増幅',
    aliases: ['増幅'],
    description: 'リフレクション攻撃で、攻撃者が送った問合せより、被害者に届く応答が何倍も大きくなること。その倍率を増幅率と呼ぶ。',
  },
  {
    id: 'ip-spoofing',
    name: '送信元IPアドレスの偽装',
    aliases: ['送信元を偽装', '被害者を詐称', 'IPスプーフィング'],
    description: 'パケットの送信元IPアドレスを、自分以外のものに書き換えること。UDPのように接続の手順がないプロトコルでは、受け取った側が見抜けない。',
  },
  {
    id: 'udp',
    name: 'UDP',
    aliases: ['UDP'],
    description: 'コネクションを確立せずにデータを送るプロトコル。手順が少なく速いが、送信元の確認や再送の仕組みを持たない。DNSは主にUDPを使う。',
  },
  {
    id: 'three-way-handshake',
    name: '3ウェイハンドシェイク',
    aliases: ['3ウェイハンドシェイク'],
    description: 'TCPで通信を始める前に、SYN、SYN/ACK、ACKの3つのやりとりで接続を確立する手順。',
  },
  {
    id: 'edns0',
    name: 'EDNS0',
    aliases: ['EDNS0'],
    description: 'DNSの拡張の仕組み。UDPで512バイトを超える大きな応答をやりとりできるようにする。DNSSECに必要だが、増幅攻撃に悪用される。',
  },
  {
    id: 'rrl',
    name: 'RRL（応答レート制限）',
    aliases: ['RRL'],
    description: '権威DNSサーバが、同じ宛先への同じような応答の数を制限する機能。DNSリフレクション攻撃の踏み台にされるのを防ぐ。',
  },
  {
    id: 'ingress-filtering',
    name: 'イングレスフィルタリング',
    aliases: ['イングレスフィルタリング'],
    description: 'ISPなどが、利用者側から入ってくるパケットのうち、その利用者に割り当てていない送信元IPアドレスを持つものを捨てること。送信元の偽装を防ぐ。',
  },
  {
    id: 'botnet',
    name: 'ボットネット',
    aliases: ['ボットネット'],
    description: 'マルウェアに感染させた多数の機器を、攻撃者が遠隔から一斉に操れるようにしたネットワーク。DDoS攻撃などに使われる。',
  },
  {
    id: 'ddos-protection',
    name: 'DDoS対策サービス',
    aliases: ['DDoS対策サービス'],
    description: 'ISPやCDNなどが、大容量の設備で攻撃の通信を受け止めて捨て、正規の通信だけを利用者のサーバへ届けるサービス。',
  },

  // VPN
  {
    id: 'vpn',
    name: 'VPN',
    aliases: ['VPN'],
    description: 'インターネットなどの共用のネットワークの上に、暗号化した仮想的な専用の通り道をつくる技術。',
  },
  {
    id: 'ipsec',
    name: 'IPsec',
    aliases: ['IPsec'],
    description: 'IPの層でパケットを暗号化・認証するプロトコル群。鍵交換のIKEと、データを守るESP（またはAH）からなる。',
  },
  {
    id: 'ike',
    name: 'IKE（IKEv2）',
    aliases: ['IKEv2', 'IKE_SA_INIT', 'IKE_AUTH', 'IKE SA'],
    description: 'IPsecで使う鍵を交換し、通信の相手を認証するプロトコル。UDP/500を使い、途中にNATがあるとUDP/4500に切り替える。',
  },
  {
    id: 'esp',
    name: 'ESP',
    aliases: ['ESP'],
    description: 'IPsecで、データの暗号化と完全性の保護（改ざん検知）を行うプロトコル。',
  },
  {
    id: 'ah',
    name: 'AH',
    aliases: ['AH'],
    description: 'IPsecで、完全性の保護（改ざん検知）と送信元の認証だけを行うプロトコル。暗号化はしない。',
  },
  {
    id: 'tunnel-mode',
    name: 'トンネルモード',
    aliases: ['トンネルモード'],
    description: 'IPsecで、元のIPパケット全体を暗号化し、新しいIPヘッダを付けて送る方式。拠点間やリモートアクセスのVPNで使う。',
  },
  {
    id: 'transport-mode',
    name: 'トランスポートモード',
    aliases: ['トランスポートモード'],
    description: 'IPsecで、元のIPヘッダは残し、データの部分だけを保護する方式。端末どうしの通信で使う。',
  },
  {
    id: 'ipsec-sa',
    name: 'IPsec SA（Child SA）',
    aliases: ['Child SA', 'IPsec SA'],
    description: 'IPsecで、データを守るために通信する2者が合意した、暗号方式や鍵などの取り決め。片方向ごとに作られる。',
  },
  {
    id: 'diffie-hellman',
    name: 'Diffie-Hellman鍵交換',
    aliases: ['Diffie-Hellman', 'DH公開値', 'DHグループ'],
    description: '盗聴されているかもしれない通信路でも、互いに公開値を送り合うだけで、第三者には分からない共通の鍵を計算できる方式。',
  },
  {
    id: 'nat-traversal',
    name: 'NATトラバーサル',
    aliases: ['NATトラバーサル'],
    description: 'IPsecの通信を、途中のNATを通り抜けられるように、UDP/4500に包んで送る仕組み。',
  },
  {
    id: 'client-certificate',
    name: 'クライアント証明書',
    aliases: ['クライアント証明書'],
    description: '利用者や端末を認証するための電子証明書。秘密鍵を持つ正規の端末だけが接続できるようにする。',
  },
  {
    id: 'mfa',
    name: '多要素認証',
    aliases: ['多要素認証'],
    description: '知識（パスワード）、所持（スマートフォンや証明書）、生体（指紋や顔）のうち、異なる2つ以上の要素を組み合わせる認証。',
  },
  {
    id: 'os-command-injection',
    name: 'OSコマンドインジェクション',
    aliases: ['OSコマンドインジェクション'],
    description: '入力値をOSのコマンドに組み込むプログラムに、「;」や「|」などの記号で別のコマンドをつなげて実行させる攻撃。シェルを経由せず、引数を分けて渡すAPIを使って防ぐ。',
  },
  {
    id: 'directory-traversal',
    name: 'ディレクトリトラバーサル',
    aliases: ['ディレクトリトラバーサル', 'パストラバーサル'],
    description: 'ファイル名に「../」などを含めて、公開していないディレクトリのファイルを読み書きさせる攻撃。ファイル名を直接使わずIDから対応付けるか、正規化したパスが決めたディレクトリの中かを確かめる。',
  },
  {
    id: 'clickjacking',
    name: 'クリックジャッキング',
    aliases: ['クリックジャッキング', 'X-Frame-Options'],
    description:
      '正規のサイトを透明にして罠のページに重ね、利用者に気付かれずにボタンなどを押させる攻撃。X-Frame-Options や CSP の frame-ancestors で、ほかのサイトの枠（iframe）の中に表示させないようにして防ぐ。',
  },
  {
    id: 'open-redirect',
    name: 'オープンリダイレクト',
    aliases: ['オープンリダイレクト'],
    description: 'URLのパラメータで指定した任意のサイトへ転送してしまう脆弱性。正規のドメインのURLから偽サイトへ誘導するフィッシングに悪用される。転送先を固定するか、許可リストで限定する。',
  },
  {
    id: 'xxe',
    name: 'XML外部実体参照（XXE）',
    aliases: ['XML外部実体参照', 'XXE'],
    description: 'XMLの中で定義した外部実体を、サーバのXMLの処理に読み込ませ、サーバ上のファイルや内部のURLにアクセスさせる攻撃。外部実体と文書型定義（DTD）の読み込みを無効にして防ぐ。',
  },
  {
    id: 'buffer-overflow',
    name: 'バッファオーバーフロー',
    aliases: ['バッファオーバーフロー'],
    description:
      '確保した領域（バッファ）の大きさを超えるデータを書き込ませ、隣の領域（関数の戻り先のアドレスなど）を上書きして、任意のコードを実行させる攻撃。境界の確認、メモリ安全な言語、スタックの保護、DEP、ASLRで対策する。',
  },
  {
    id: 'dep-aslr',
    name: 'DEP・ASLR',
    aliases: ['DEP', 'ASLR'],
    description: 'バッファオーバーフローなどの攻撃を難しくするOSの機能。DEP（データ実行防止）はデータの領域に置かれたコードを実行させない。ASLR（アドレス空間配置のランダム化）はメモリの配置を毎回変え、狙うアドレスを推測しにくくする。',
  },
  {
    id: 'sast-dast',
    name: '静的解析（SAST）・動的解析（DAST）',
    aliases: ['SAST', 'DAST', '静的解析', '動的解析'],
    description: '脆弱性を見つける検査の方法。静的解析（SAST）はプログラムを動かさずにソースコードを調べ、動的解析（DAST）は動いているアプリに攻撃を模した入力を送って反応を見る。',
  },
  {
    id: 'fuzzing',
    name: 'ファジング',
    aliases: ['ファジング'],
    description: '想定外のデータ（長すぎる値、壊れた形式など）を大量に自動で与え、プログラムの異常な動作から脆弱性を見つける検査の方法。未知の脆弱性の発見に向く。',
  },
  {
    id: 'penetration-test',
    name: 'ペネトレーションテスト',
    aliases: ['ペネトレーションテスト', '侵入テスト'],
    description: '攻撃者の視点で、実際にシステムへの侵入を試み、目的（データの取得など）を達成できるかを確かめる検査。個々の脆弱性だけでなく、防御全体の実効性を評価する。',
  },
  {
    id: 'threat-modeling',
    name: '脅威モデリング',
    aliases: ['脅威モデリング', 'STRIDE'],
    description:
      '設計の段階で、データの流れの図などから、どこにどんな脅威があるかを洗い出し、対策を決める手法。脅威を、なりすまし・改ざん・否認・情報漏えい・サービス妨害・権限昇格に分類するSTRIDEがよく使われる。',
  },
  {
    id: 'security-by-design',
    name: 'セキュリティ・バイ・デザイン',
    aliases: ['セキュリティ・バイ・デザイン', 'プライバシー・バイ・デザイン', 'DevSecOps', 'シフトレフト'],
    description:
      '企画や設計の段階からセキュリティを組み込む考え方。個人情報の保護を組み込むものはプライバシー・バイ・デザインという。開発と運用の流れに検査を自動で組み込み、早い段階で直すことをDevSecOps、シフトレフトという。',
  },
  {
    id: 'zero-day',
    name: 'ゼロデイ攻撃',
    aliases: ['ゼロデイ攻撃', 'ゼロデイ'],
    description: '脆弱性が知られてから、修正プログラムが公開される（または適用される）までの間に、その脆弱性を突く攻撃。修正が出るまでは、回避策や多層防御で被害を抑える。',
  },
  {
    id: 'iso15408',
    name: 'ISO/IEC 15408（コモンクライテリア）',
    aliases: ['ISO/IEC 15408', 'コモンクライテリア'],
    description: 'IT製品のセキュリティ機能が正しく作られているかを、第三者が評価・認証するための国際規格。国内ではIPAが評価・認証の制度（JISEC）を運営している。',
  },
  {
    id: 'starttls',
    name: 'STARTTLS',
    aliases: ['STARTTLS'],
    description:
      'SMTPなどで、暗号化していない接続の途中からTLSに切り替える方式。切り替えの前のやり取りは平文なので、経路上でSTARTTLSの表示を消されると、暗号化せずに送ってしまう（ダウングレード攻撃、STARTTLSストリッピング）。',
  },
  {
    id: 'opportunistic-tls',
    name: '日和見的な暗号化',
    aliases: ['日和見的な暗号化'],
    description: '相手が対応していれば暗号化し、対応していなければ暗号化せずに通信する方式。届くことを優先するが、ダウングレード攻撃に弱い。メールサーバ間のSTARTTLSの既定の動き。',
  },
  {
    id: 'mta-sts',
    name: 'MTA-STS・TLS-RPT',
    aliases: ['MTA-STS', 'TLS-RPT', 'DANE'],
    description:
      'MTA-STSは、受信側のドメインが「TLSを必須にする」方針と正しい受信MTAの名前を、DNSとHTTPSで公開し、送信MTAに守らせる仕組み。TLS-RPTは、TLSでの配送の失敗を受信側に報告する仕組み。DNSSECで証明書の情報を公開するDANEという方法もある。',
  },
  {
    id: 'smime',
    name: 'S/MIME',
    aliases: ['S/MIME', 'PGP'],
    description:
      '電子証明書を使って、メールそのものを暗号化・署名する方式。受信者の公開鍵で暗号化し、送信者の秘密鍵で署名する。送信者のメールソフトから受信者のメールソフトまで（エンドツーエンドで）守る。証明書の代わりに、利用者同士が公開鍵を信頼し合うPGPもある。',
  },
  {
    id: 'downgrade-attack',
    name: 'ダウングレード攻撃',
    aliases: ['ダウングレード攻撃'],
    description: '通信の当事者に、より弱い暗号や暗号化なしの通信を選ばせる攻撃。TLSの古いバージョンへの誘導や、STARTTLSの表示を消す攻撃がある。',
  },
  {
    id: 'ssrf',
    name: 'SSRF（サーバサイドリクエストフォージェリ）',
    aliases: ['SSRF', 'サーバサイドリクエストフォージェリ'],
    description:
      '利用者が指定したURLにサーバがアクセスする機能を悪用し、外部から届かない内部のサーバや、クラウドのメタデータにサーバ自身からアクセスさせる攻撃。対策は、アクセス先を許可リストで絞り、名前解決後のIPアドレスを確かめ、リダイレクトを追わないこと。',
  },
  {
    id: 'metadata-service',
    name: 'メタデータサービス（IMDS）',
    aliases: ['メタデータサービス', 'IMDSv2', 'IMDS'],
    description:
      'クラウドの仮想マシンが、自分の設定や一時的な認証情報を取得するための内部のURL（169.254.169.254 など）。SSRFで狙われるので、トークンを先に取得しないと応答しない方式（IMDSv2など）を使う。',
  },
  {
    id: 'password-list',
    name: 'パスワードリスト攻撃',
    aliases: ['パスワードリスト攻撃', 'リスト型攻撃'],
    description:
      '別のサイトから漏えいしたIDとパスワードの組を、ほかのサイトで試してログインする攻撃。利用者のパスワードの使い回しを突く。正しい組でログインするので、1回ずつの試行は正規のログインと区別しにくい。',
  },
  {
    id: 'brute-force',
    name: '総当たり攻撃（ブルートフォース攻撃）',
    aliases: ['総当たり攻撃', 'ブルートフォース攻撃'],
    description: '1つのIDに対して、考えられるパスワードを順にすべて試す攻撃。アカウントのロックや、試行の回数の制限が有効。辞書の単語を順に試すものは辞書攻撃という。',
  },
  {
    id: 'reverse-brute-force',
    name: '逆総当たり攻撃（パスワードスプレー攻撃）',
    aliases: ['逆総当たり攻撃', 'パスワードスプレー攻撃'],
    description: 'よく使われるパスワードを固定し、多数のIDに対して順に試す攻撃。1つのIDへの試行は少ないので、アカウントのロックにかかりにくい。',
  },
  {
    id: 'account-lock',
    name: 'アカウントのロック',
    aliases: ['アカウントのロック'],
    description: 'ログインの失敗が一定回数を超えたアカウントを、一時的または管理者が解除するまで使えなくする対策。総当たり攻撃に有効だが、攻撃者が本人を締め出す妨害に悪用されることがある。',
  },
  {
    id: 'captcha',
    name: 'CAPTCHA',
    aliases: ['CAPTCHA'],
    description: 'ゆがんだ文字の読み取りや画像の選択などで、操作しているのが人かプログラム（ボット）かを見分ける仕組み。大量の自動の試行を抑える。',
  },
  {
    id: 'otp',
    name: 'ワンタイムパスワード',
    aliases: ['ワンタイムパスワード', 'TOTP'],
    description:
      '一度しか使えない、短い時間で無効になるパスワード。認証アプリが時刻と共有の秘密の値から作るもの（TOTP）や、SMSで届くものがある。使い回しには強いが、偽サイトでその場で中継されると破られる。',
  },
  {
    id: 'biometrics',
    name: '生体認証',
    aliases: ['生体認証', '本人拒否率', '他人受入率'],
    description:
      '指紋・顔・静脈など、体の特徴で本人を確かめる認証。本人を誤って拒否する割合（本人拒否率、FRR）と、他人を誤って受け入れる割合（他人受入率、FAR）はトレードオフで、判定を厳しくすると他人受入率は下がり、本人拒否率は上がる。',
  },
  {
    id: 'passkey',
    name: 'パスキー（FIDO2・WebAuthn）',
    aliases: ['パスキー', 'FIDO2', 'WebAuthn'],
    description:
      '公開鍵暗号を使う、パスワードのいらない認証。端末で作った鍵ペアの公開鍵をサービスに登録し、ログインのときはサービスのチャレンジに秘密鍵で署名する。署名はサイトの名前（オリジン）に結び付くので、偽サイトでは使えない（フィッシング耐性）。秘密鍵は端末の外に出ない。',
  },
  {
    id: 'challenge-response',
    name: 'チャレンジレスポンス認証',
    aliases: ['チャレンジレスポンス'],
    description: 'サーバが毎回違うランダムな値（チャレンジ）を送り、利用者側が秘密の情報を使って計算した応答（レスポンス）を返す認証。秘密の情報そのものは送らず、過去の応答の使い回し（リプレイ攻撃）も防げる。',
  },
  {
    id: 'phishing',
    name: 'フィッシング',
    aliases: ['フィッシング', 'フィッシングメール'],
    description:
      '実在の組織を装ったメールやSMSで偽サイトに誘導し、IDやパスワード、カード番号などを入力させて盗む攻撃。特定の相手に合わせて作り込んだものをスピアフィッシング、SMSを使うものをスミッシングという。',
  },
  {
    id: 'aitm',
    name: 'リアルタイムフィッシング（AiTM）',
    aliases: ['リアルタイムフィッシング', 'AiTM'],
    description:
      '偽サイトに入力されたIDやパスワード、ワンタイムパスワードを、その場で正規のサイトに中継してログインし、セッションを奪う攻撃（Adversary-in-the-Middle）。ワンタイムパスワードやスマートフォンでの承認による多要素認証も破られる。',
  },
  {
    id: 'conditional-access',
    name: '条件付きアクセス',
    aliases: ['条件付きアクセス'],
    description: 'ログインのときに、利用者だけでなく、端末（会社が管理しているか）、場所、リスクなどの条件を確かめて、アクセスを許可・拒否する仕組み。ゼロトラストの考え方で使われる。',
  },
  {
    id: 'antiphishing-council',
    name: 'フィッシング対策協議会',
    aliases: ['フィッシング対策協議会'],
    description: 'フィッシングの情報を集めて公開し、注意を呼びかける国内の団体。報告された偽サイトについて、JPCERT/CCと連携して閉鎖（テイクダウン）の調整を行う。',
  },
  {
    id: 'malware',
    name: 'マルウェア',
    aliases: ['マルウェア'],
    description: '利用者に害を与える目的で作られたソフトウェアの総称。ウイルス、ワーム、トロイの木馬、ランサムウェア、スパイウェアなどがある。',
  },
  {
    id: 'worm-trojan',
    name: 'ワーム・トロイの木馬',
    aliases: ['ワーム', 'トロイの木馬'],
    description:
      'マルウェアの種類。ワームは単独で動き、ネットワークを通じて自分を複製して広がる。トロイの木馬は役に立つソフトを装って入り込み、裏で不正な動作をする（自分では増えない）。ほかのプログラムに寄生して増えるものはウイルスという。',
  },
  {
    id: 'rat',
    name: 'RAT（遠隔操作ツール）',
    aliases: ['RAT', '遠隔操作ツール'],
    description: '感染した端末を、攻撃者がC&Cサーバを通じて遠隔から操作するためのマルウェア。標的型攻撃でよく使われる。',
  },
  {
    id: 'rootkit',
    name: 'ルートキット',
    aliases: ['ルートキット'],
    description: '侵入の痕跡や、マルウェアのファイル・プロセスを、OSの中で隠すための道具の集まり。',
  },
  {
    id: 'fileless',
    name: 'ファイルレスマルウェア',
    aliases: ['ファイルレスマルウェア'],
    description: '実行ファイルをディスクに残さず、OSに備わる機能（PowerShellなど）やメモリの上だけで動くマルウェア。ファイルを調べる検知をすり抜けるので、振る舞いの検知（EDR）が有効。',
  },
  {
    id: 'drive-by-download',
    name: 'ドライブバイダウンロード',
    aliases: ['ドライブバイダウンロード'],
    description: 'Webサイトを閲覧しただけで、ブラウザやプラグインの脆弱性を突いて、利用者が気付かないうちにマルウェアをダウンロード・実行させる攻撃。',
  },
  {
    id: 'watering-hole',
    name: '水飲み場攻撃',
    aliases: ['水飲み場攻撃'],
    description: '標的の組織の人がよく閲覧するWebサイトを改ざんし、閲覧した人の端末をマルウェアに感染させる攻撃。標的が立ち寄る場所で待ち伏せる。',
  },
  {
    id: 'malware-detection',
    name: 'シグネチャ型・ビヘイビア型（マルウェアの検知）',
    aliases: ['シグネチャ型', 'ビヘイビア型', 'ヒューリスティック型', 'パターンマッチング'],
    description:
      'マルウェアの検知の方式。シグネチャ型（パターンマッチング）は既知のマルウェアの特徴と照合し、未知のものは検知できない。ヒューリスティック型はコードの特徴から、ビヘイビア型は実際の動作から判断し、未知のものも検知できるが誤検知もある。',
  },
  {
    id: 'honeypot',
    name: 'ハニーポット',
    aliases: ['ハニーポット'],
    description: '攻撃者をおびき寄せるために、わざと攻撃されやすく作ったおとりのシステム。攻撃の手口の観察や、侵入の早期の発見に使う。',
  },
  {
    id: 'social-engineering',
    name: 'ソーシャルエンジニアリング',
    aliases: ['ソーシャルエンジニアリング', 'ショルダーハッキング', 'トラッシング'],
    description:
      '技術ではなく、人の心理や習慣の隙を突いて情報を盗む手口。なりすましの電話、画面ののぞき見（ショルダーハッキング）、ごみ箱をあさる（トラッシング）などがある。',
  },
  {
    id: 'tailgating',
    name: '共連れ',
    aliases: ['共連れ', 'ピギーバック', 'アンチパスバック'],
    description:
      '認証された人の後ろについて、入館ゲートなどを通り抜けること。入室の記録がない人の退室を認めない仕組み（アンチパスバック）や、1人ずつしか通れないゲートで防ぐ。',
  },
  {
    id: 'kill-chain',
    name: 'サイバーキルチェーン',
    aliases: ['サイバーキルチェーン'],
    description: '標的型攻撃の流れを、偵察・武器化・配送・エクスプロイト・インストール・C&C・目的の実行の7段階で捉えるモデル。どの段階で止め、どこで気付くかを考えるのに使う。',
  },
  {
    id: 'mitre-attack',
    name: 'MITRE ATT&CK',
    aliases: ['MITRE ATT&CK', 'ATT&CK'],
    description: '実際の攻撃で観測された攻撃者の戦術と技術を、体系的にまとめた知識ベース。検知の仕組みが、どの手口に対応できているかの確認などに使う。',
  },
  {
    id: 'port-scan',
    name: 'ポートスキャン',
    aliases: ['ポートスキャン'],
    description: '機器の各ポートに接続を試み、どのサービスが動いているかを調べること。攻撃の前の偵察として行われる。自組織の公開している機器の確認にも使う。',
  },
  {
    id: 'security-policy',
    name: '情報セキュリティポリシー',
    aliases: ['情報セキュリティポリシー', '対策基準', '実施手順'],
    description: '組織の情報セキュリティへの取組みを文書にしたもの。経営層が決める基本方針、守るべきルールの対策基準、具体的な方法の実施手順の3つの階層で作ることが多い。',
  },
  {
    id: 'bcp',
    name: '事業継続計画（BCP）',
    aliases: ['事業継続計画', 'BCP', 'BCM', '事業継続管理'],
    description: '災害、システムの障害、サイバー攻撃などで業務が止まったときに、重要な業務を継続し、早く復旧するための計画。計画を作り、訓練し、見直す活動全体を事業継続管理（BCM）という。',
  },
  {
    id: 'bia',
    name: '事業影響度分析（BIA）',
    aliases: ['事業影響度分析', 'BIA'],
    description: '業務ごとに、止まったときの影響の大きさと、どれだけ止まると許容できないかを分析し、優先して復旧させる業務と目標を決めること。BCPを作る最初の段階で行う。',
  },
  {
    id: 'rto-rpo',
    name: 'RTO・RPO',
    aliases: ['RTO', 'RPO', 'RLO', '目標復旧時間', '目標復旧時点'],
    description: 'RTO（目標復旧時間）は、止まってからどれだけの時間で復旧させるか。RPO（目標復旧時点）は、どの時点のデータまで戻せればよいか。RLO（目標復旧レベル）は、どの水準まで戻すか。',
  },
  {
    id: 'backup-types',
    name: 'フル・差分・増分バックアップ',
    aliases: ['フルバックアップ', '差分バックアップ', '増分バックアップ', '3-2-1'],
    description:
      'バックアップの方式。フルはすべて、差分は前回のフルバックアップからの変更、増分は前回のバックアップからの変更を取得する。増分は取得が速いが、復元には複数を順に使う。データを3つ、2種類の媒体に、1つは離れた場所に置く「3-2-1」の考え方がある。',
  },
  {
    id: 'fail-safe',
    name: 'フェールセーフ・フェールソフト',
    aliases: ['フェールセーフ', 'フェールソフト', 'フォールトトレランス', 'フールプルーフ'],
    description:
      'システムの信頼性の設計の考え方。フェールセーフは故障時に安全な側に倒す。フェールソフトは故障した部分を切り離して機能を落として動き続ける。フォールトトレランスは冗長化で機能を止めない。フールプルーフは人の誤操作でも危険にならないようにする。',
  },
  {
    id: 'clear-desk',
    name: 'クリアデスク・クリアスクリーン',
    aliases: ['クリアデスク', 'クリアスクリーン'],
    description: '離席するときに、机の上に書類や媒体を放置せず（クリアデスク）、画面をロックして見られないようにする（クリアスクリーン）こと。',
  },
  {
    id: 'pmark',
    name: 'プライバシーマーク制度',
    aliases: ['プライバシーマーク', 'JIS Q 15001'],
    description: 'JIS Q 15001に基づいて、個人情報を適切に扱う体制を整えている事業者を認定し、マークの使用を認める制度。',
  },
  {
    id: 'isms-certification',
    name: 'ISMS適合性評価制度',
    aliases: ['ISMS適合性評価制度'],
    description: 'JIS Q 27001（ISO/IEC 27001）に基づくISMSを、第三者の認証機関が審査し、要求事項に適合していることを認証する制度。',
  },
  {
    id: 'nist-csf',
    name: 'NIST サイバーセキュリティフレームワーク（CSF）',
    aliases: ['NIST サイバーセキュリティフレームワーク', 'CSF'],
    description: '米国のNISTが公表した、サイバーセキュリティの取組みを整理する枠組み。2.0では、統治・識別・防御・検知・対応・復旧の6つの機能で、現状と目標を整理する。',
  },
  {
    id: 'cis-controls',
    name: 'CIS Controls',
    aliases: ['CIS Controls'],
    description: '米国のCIS（Center for Internet Security）がまとめた、優先して実施すべき具体的なセキュリティ対策の一覧。資産の把握から順に、優先度の順に並べている。',
  },
  {
    id: 'sase',
    name: 'SASE',
    aliases: ['SASE', 'ZTNA', 'SWG', 'SDP'],
    description:
      'ネットワークの機能とセキュリティの機能を、クラウドからまとめて提供する考え方。Webへのアクセスの検査（SWG）、クラウドの利用の管理（CASB）、利用者と端末を確かめてアプリごとに接続させる仕組み（ZTNA、SDP）などを含む。',
  },
  {
    id: 'nac',
    name: '検疫ネットワーク（NAC）',
    aliases: ['検疫ネットワーク', 'NAC'],
    description: '社内のネットワークにつなぐ端末を検査し、修正プログラムやウイルス対策が不十分な端末は、隔離したネットワークで対処させてから接続を許す仕組み。',
  },
  {
    id: 'byod',
    name: 'BYOD',
    aliases: ['BYOD'],
    description: '私物の端末を業務に使うこと。MDMなどで業務の領域と私用の領域を分け、会社が管理できる範囲と、紛失時の対応を決めておく。',
  },
  {
    id: 'dlp',
    name: 'DLP（情報漏えい防止）',
    aliases: ['DLP'],
    description: '機密情報を含むファイルやデータを識別し、メールの送信、Webへのアップロード、外部記憶媒体への書出しなどを検知・遮断する仕組み。',
  },
  {
    id: 'irm',
    name: 'IRM（情報権利管理）',
    aliases: ['IRM'],
    description: 'ファイルそのものを暗号化し、閲覧・編集・印刷・転送などの権限を付ける仕組み。社外に持ち出されたあとも、権限のない人はファイルを開けない。',
  },
  {
    id: 'utm-ngfw',
    name: 'UTM・NGFW',
    aliases: ['UTM', 'NGFW', '次世代ファイアウォール', '統合脅威管理'],
    description: 'UTM（統合脅威管理）は、FW・IPS・ウイルス対策・URLフィルタリングなどを1台にまとめた装置。NGFW（次世代ファイアウォール）は、ポートではなく、通信しているアプリや利用者を識別して制御するFW。',
  },
  {
    id: 'reverse-proxy',
    name: 'リバースプロキシ',
    aliases: ['リバースプロキシ'],
    description: '公開サーバの手前で利用者からの要求を受け、内部のサーバへ中継するサーバ。内部のサーバを直接公開せずに済み、TLSの終端、負荷の分散、WAFの機能を担うこともある。',
  },
  {
    id: 'ipv6',
    name: 'IPv6のセキュリティ',
    aliases: ['IPv6', 'RAガード', 'ICMPv6'],
    description:
      'IPv6では端末にグローバルアドレスが付き、NAPTで隠れないので、FWのルールで外部からの通信を明示的に止める。IPv4と両方使うときのルールの設定漏れ、ルータの広告（RA）の偽装（RAガードで防ぐ）、ICMPv6を必要な種類だけ許可することに注意する。',
  },
  {
    id: 'iot',
    name: 'IoT機器のセキュリティ',
    aliases: ['IoT機器', 'IoT', 'Mirai'],
    description: 'IoT機器は、初期設定のパスワードのまま使われたり、更新されずに脆弱性が残ったりしやすく、乗っ取られてボットネット（Miraiなど）に使われる。初期パスワードの変更、更新、直接インターネットにつながない配置が基本。',
  },
  {
    id: 'ot',
    name: '制御システム（OT）',
    aliases: ['制御システム', 'OT'],
    description: '工場やプラント、社会基盤の設備を動かすシステム。止めないこと（可用性）と人の安全を最も重視し、機器を長く使うため更新が難しい。ネットワークの分離と監視で守る。',
  },
  {
    id: 'active-directory',
    name: 'Active Directory（AD）',
    aliases: ['Active Directory', 'ドメインコントローラ', 'Kerberos'],
    description: '組織の利用者のアカウントや端末を一元管理し、認証（Kerberos）を行うWindowsの仕組み。管理者の権限を奪われると組織全体を支配されるので、ドメインコントローラを厳重に保護する。',
  },
  {
    id: 'pass-the-hash',
    name: 'パスザハッシュ・ゴールデンチケット',
    aliases: ['パスザハッシュ', 'Pass the Hash', 'ゴールデンチケット'],
    description:
      'Active Directoryへの代表的な攻撃。パスザハッシュは、盗んだパスワードのハッシュ値をパスワードの代わりに使ってログインする。ゴールデンチケットは、Kerberosのチケットを発行する鍵を盗み、任意の利用者のチケットを偽造する。',
  },
  {
    id: 'gdpr',
    name: 'GDPR（EU一般データ保護規則）',
    aliases: ['GDPR', 'EU一般データ保護規則'],
    description: 'EUの個人データの保護の規則。EUの域内に拠点がなくても、域内の人に商品やサービスを提供する事業者に適用される。個人データの漏えいは、原則として把握してから72時間以内に監督機関へ通知する。',
  },
  {
    id: 'access-control-models',
    name: 'アクセス制御のモデル（DAC・MAC・RBAC・ABAC）',
    aliases: ['任意アクセス制御', '強制アクセス制御', 'ロールベースアクセス制御', '属性ベースアクセス制御', 'DAC', 'RBAC', 'ABAC'],
    description:
      'アクセス権限の決め方。任意アクセス制御（DAC）は資源の所有者が決める。強制アクセス制御（MAC）は機密度のラベルでシステムが強制する。ロールベース（RBAC）は役割ごと、属性ベース（ABAC）は利用者・資源・環境の属性の組合せで決める。',
  },
  {
    id: 'secure-os',
    name: 'セキュアOS',
    aliases: ['セキュアOS', 'SELinux'],
    description: '強制アクセス制御などで、管理者（root）の権限も細かく分け、プロセスが乗っ取られたときの被害を限るOS（またはOSの機能）。SELinuxが代表例。',
  },
  {
    id: 'need-to-know',
    name: 'Need to know',
    aliases: ['Need to know'],
    description: '業務で知る必要のある人だけに、必要な情報だけを見せるという原則。最小権限の原則と合わせて使う。',
  },
  {
    id: 'syslog',
    name: 'syslog',
    aliases: ['syslog'],
    description: '機器やOSのログを、ネットワークを通じてログサーバに送る仕組み（プロトコル）。ログを機器の外に集めて、まとめて分析し、改ざんや消去から守るのに使う。',
  },
  {
    id: 'smurf',
    name: 'Smurf攻撃',
    aliases: ['Smurf攻撃'],
    description: '送信元を標的に偽装したICMPのエコー要求を、ネットワークのブロードキャストアドレスに送り、多数の機器からの応答を標的に集中させるDoS攻撃。',
  },
  {
    id: 'replay-attack',
    name: 'リプレイ攻撃',
    aliases: ['リプレイ攻撃'],
    description: '盗聴した認証の通信などを、そのまま再送してなりすます攻撃。毎回変わる値を使うチャレンジレスポンスやワンタイムパスワード、タイムスタンプで防ぐ。',
  },
  {
    id: 'cors',
    name: 'CORS',
    aliases: ['CORS', 'Access-Control-Allow-Origin'],
    description:
      'ほかのオリジンのスクリプトに、応答の読み取りを許すための仕組み（同一オリジンポリシーの緩和）。許可するオリジンを広げすぎると、罠のサイトから利用者のデータを読み取られる。',
  },
  {
    id: 'sri',
    name: 'SRI（サブリソース完全性）',
    aliases: ['SRI'],
    description: 'Webページが外部（CDNなど）から読み込むスクリプトなどのハッシュ値をHTMLに書いておき、一致しなければ実行しない仕組み。外部のファイルの改ざんを防ぐ。',
  },
  {
    id: 'container',
    name: 'コンテナ・サーバレス',
    aliases: ['Kubernetes', 'Docker', 'サーバレス'],
    description:
      'コンテナは、アプリと必要な部品をまとめて、OSを共有しながら分離して動かす仕組み（Dockerなど）。Kubernetesなどで多数を管理する。サーバレスは、サーバの管理を事業者に任せ、関数などの単位でアプリを動かす方式。',
  },
  {
    id: 'epss',
    name: 'EPSS',
    aliases: ['EPSS'],
    description: '脆弱性が今後30日以内に悪用される確率を推定した値。深刻度を表すCVSSと組み合わせて、対応の優先度を決める参考にする。',
  },
  {
    id: 'ssh',
    name: 'SSH',
    aliases: ['SSH', 'SFTP', 'FTPS'],
    description: '通信を暗号化して、ほかのコンピュータを遠隔で操作したり、ファイルを転送（SFTP）したりするプロトコル。平文のTelnetやFTPの置き換えに使う。公開鍵による認証もできる。',
  },
  {
    id: 'snmp',
    name: 'SNMPv3',
    aliases: ['SNMPv3', 'SNMP'],
    description: 'ネットワーク機器の状態を監視・設定するプロトコル（SNMP）のバージョン3。v1・v2cは平文のコミュニティ名だけで認証するが、v3は認証と暗号化ができる。',
  },
  {
    id: 'doh',
    name: 'DNS over HTTPS（DoH）',
    aliases: ['DNS over HTTPS', 'DNS over TLS', 'DoH', 'DoT'],
    description: 'DNSの問合せと応答を、HTTPS（DoH）やTLS（DoT）で暗号化して、経路上での盗み見や改ざんを防ぐ方式。組織のDNSでの監視やフィルタリングをすり抜けることにも注意する。',
  },
  {
    id: 'watermark',
    name: '電子透かし・ステガノグラフィ',
    aliases: ['電子透かし', 'ステガノグラフィ'],
    description: '電子透かしは、画像や音声に、見た目ではわからない情報（著作者など）を埋め込む技術。ステガノグラフィは、情報を別のデータの中に隠して存在を気付かせない技術で、マルウェアの通信を隠すのに悪用されることもある。',
  },
  {
    id: 'ldap',
    name: 'ディレクトリサービス（LDAP）',
    aliases: ['ディレクトリサービス', 'LDAP'],
    description: '利用者や機器の情報を一元管理し、認証や検索に使えるようにするサービス。問い合わせのプロトコルとしてLDAPを使う。Active Directoryが代表例。',
  },
  {
    id: 'ransomware',
    name: 'ランサムウェア',
    aliases: ['ランサムウェア'],
    description: 'データを暗号化して使えなくし、元に戻すことと引き換えに身代金を要求するマルウェア。盗んだデータを公開すると脅す二重恐喝も多い。',
  },
  {
    id: 'zero-trust',
    name: 'ゼロトラスト',
    aliases: ['ゼロトラスト'],
    description: '社内のネットワークであっても無条件には信頼せず、アクセスのたびに利用者や端末を確認する考え方。',
  },
  {
    id: 'tpm',
    name: 'TPM',
    aliases: ['TPM'],
    description: '鍵を安全に保存したり、暗号の処理をしたりするためのセキュリティチップ。保存した秘密鍵を、外へ取り出せないようにできる。',
  },

  // インシデント対応
  {
    id: 'incident-response',
    name: 'インシデント対応',
    aliases: ['インシデント対応'],
    description:
      '攻撃などのインシデントが起きたときに、被害を抑えて元に戻すための一連の活動。検知 → トリアージ → 封じ込め → 証拠保全 → 根絶・復旧 → 報告 → 再発防止 の流れで進める（NIST SP 800-61 などの手引きがある）。',
  },
  {
    id: 'csirt',
    name: 'CSIRT',
    aliases: ['CSIRT'],
    description:
      '組織の中で、インシデントの受付、分析、対応、関係先との調整を担うチーム。社外からの連絡窓口（PoC）を持ち、JPCERT/CC など外部の組織と連携する。',
  },
  {
    id: 'poc',
    name: '連絡窓口（PoC）',
    aliases: ['PoC', '連絡窓口'],
    description:
      'インシデントに関する連絡を受ける窓口（Point of Contact）。CSIRTは社外にも窓口を知らせておき、取引先や外部の組織からの連絡を受けられるようにする。',
  },
  {
    id: 'triage',
    name: 'トリアージ',
    aliases: ['トリアージ'],
    description:
      '届いた報告や検知したできごとが本当にインシデントか、影響の大きさと緊急度はどうかを判断し、対応の優先順位を決めること。',
  },
  {
    id: 'containment',
    name: '封じ込め',
    aliases: ['封じ込め'],
    description:
      '被害がこれ以上広がらないようにする応急処置。感染した機器をネットワークから切り離す、通信を遮断する、アカウントを止めるなど。原因を取り除く根絶とは区別する。',
  },
  {
    id: 'eradication',
    name: '根絶',
    aliases: ['根絶'],
    description:
      'マルウェア、攻撃者が作ったアカウント、脆弱性など、インシデントの原因を取り除くこと。根絶のあとに、システムを元の状態に戻す（復旧）。',
  },
  {
    id: 'forensics',
    name: '証拠保全（デジタルフォレンジックス）',
    aliases: ['証拠保全', 'デジタルフォレンジックス'],
    description:
      'インシデントの原因や影響を後から調べられるよう、ログ、メモリ、ディスクを書き換えずに取得して保管すること。調査は複製に対して行い、ハッシュ値で改ざんされていないことを示す。',
  },
  {
    id: 'volatility',
    name: '揮発性',
    aliases: ['揮発性'],
    description:
      '電源を切るなどしたときの、情報の失われやすさ。メモリの内容やネットワークの接続の状態は揮発性が高いので、ディスクより先に保全する。',
  },
  {
    id: 'chain-of-custody',
    name: '保管の記録（Chain of Custody）',
    aliases: ['Chain of Custody', '保管の記録'],
    description:
      '証拠をいつ、だれが取得し、だれに渡し、どこに保管したかの記録。証拠が途中ですり替えられたり、改ざんされたりしていないことを示す。',
  },
  {
    id: 'siem',
    name: 'SIEM',
    aliases: ['SIEM'],
    description:
      'さまざまな機器のログを1か所に集め、関連付けて分析し、攻撃の兆候を見つけて知らせる仕組み。監視を行うSOCやCSIRTが使う。',
  },
  {
    id: 'edr',
    name: 'EDR',
    aliases: ['EDR'],
    description:
      '端末やサーバの上の動き（プログラムの起動、ファイルの変更、通信）を記録して監視し、不審な動きを検知して、隔離などの対応を助ける仕組み。',
  },
  {
    id: 'jpcert',
    name: 'JPCERT/CC',
    aliases: ['JPCERT/CC'],
    description:
      '日本で、インシデント対応の調整を行う組織。国内外のCSIRTと連携し、インシデントの報告の受付、対応の支援、注意喚起などを行う。',
  },
  {
    id: 'ipa',
    name: 'IPA（情報処理推進機構）',
    aliases: ['IPA'],
    description:
      'ソフトウェアやWebサイトの脆弱性の届出を受け付け（JPCERT/CCと連携）、セキュリティの手引きや注意喚起を公開している独立行政法人。情報処理安全確保支援士の試験も実施する。',
  },
  {
    id: 'ppc',
    name: '個人情報保護委員会',
    aliases: ['個人情報保護委員会'],
    description:
      '個人情報保護法を所管する行政機関。個人データの漏えいなどで、本人の権利や利益を害する恐れが大きい場合、事業者は委員会への報告（速報と確報）と、本人への通知が義務付けられている。',
  },
  {
    id: 'ntp',
    name: 'NTP',
    aliases: ['NTP'],
    description:
      '機器の時刻を正しく合わせるプロトコル（UDP/123）。ログの時刻をそろえ、複数の機器のログを突き合わせられるようにする。大きな応答を返す機能が、リフレクション攻撃に悪用されることもある。',
  },
  {
    id: 'mac-table',
    name: 'MACアドレステーブル',
    aliases: ['MACアドレステーブル'],
    description:
      'L2スイッチが、どのポートの先にどのMACアドレスの機器があるかを覚えた表。届いたフレームの送信元MACアドレスから学習し、宛先MACアドレスを見て転送先のポートを決める。',
  },
  {
    id: 'port-security',
    name: 'ポートセキュリティ',
    aliases: ['ポートセキュリティ'],
    description:
      'L2スイッチのポートごとに、接続を許可するMACアドレスを決めておき、それ以外の端末がつながったら通信を止める機能。',
  },
  {
    id: 'ieee8021x',
    name: 'IEEE 802.1X',
    aliases: ['IEEE 802.1X'],
    description:
      'LANや無線LANにつなぐ端末を、認証サーバ（RADIUSサーバ）で認証してから通信させる仕組み。認証されない端末は、スイッチのポートで通信を止められる。',
  },
  {
    id: 'insider',
    name: '内部不正',
    aliases: ['内部不正'],
    description:
      '従業員や委託先など、組織の内部の人による不正行為。持ち込んだ端末による盗聴や、情報の持ち出しなど。IPAが「組織における内部不正防止ガイドライン」を公開している。',
  },
  {
    id: 'hsm',
    name: 'HSM',
    aliases: ['HSM'],
    description:
      '秘密鍵を安全に保管し、署名や暗号の計算を内部で行う専用の装置。秘密鍵を外に取り出せないので、漏えいを防げる。',
  },
  {
    id: 'crl',
    name: 'CRL（証明書失効リスト）',
    aliases: ['CRL'],
    description:
      '認証局が公開する、失効させた証明書の一覧。受け取った側は、証明書がCRLに載っていないかを確かめる（OCSPで問い合わせる方法もある）。',
  },
  {
    id: 'vuln-assessment',
    name: '脆弱性診断',
    aliases: ['脆弱性診断'],
    description:
      'システムやWebアプリケーションに脆弱性がないかを、ツールや専門家の手作業で調べること。リリースの前や、大きな変更のときに行う。',
  },
  {
    id: 'backup',
    name: 'バックアップ',
    aliases: ['オフラインバックアップ', 'バックアップ'],
    description:
      'データの複製を、別の場所に保管すること。ランサムウェアに備えて、ネットワークから切り離した場所（オフライン）に、世代を分けて保管する。',
  },

  // リスクマネジメント（解説ページ）
  {
    id: 'risk-assessment',
    name: 'リスクアセスメント',
    aliases: ['リスクアセスメント'],
    description: 'リスク特定・リスク分析・リスク評価の3つのプロセスで、リスクを洗い出して大きさを見積もり、対応の要否と優先順位を決めること。',
  },
  {
    id: 'risk-treatment',
    name: 'リスク対応（低減・回避・移転・受容）',
    aliases: ['リスク対応', 'リスク低減', 'リスク回避', 'リスク移転', 'リスク受容'],
    description:
      '評価したリスクへの対応。対策で小さくする低減、原因となる活動をやめる回避、保険や委託でほかの組織と分担する移転（共有）、そのまま受け入れる受容（保有）がある。',
  },
  {
    id: 'residual-risk',
    name: '残留リスク',
    aliases: ['残留リスク'],
    description: 'リスク対応をしたあとに残るリスク。リスク所有者（経営層など）が把握して承認し、定期的に見直す。',
  },
  {
    id: 'isms',
    name: 'ISMS（情報セキュリティマネジメントシステム）',
    aliases: ['ISMS'],
    description: '組織が情報セキュリティを継続して管理・改善する仕組み。要求事項は JIS Q 27001（ISO/IEC 27001）にまとめられ、PDCAで運用する。',
  },
  {
    id: 'soa',
    name: '適用宣言書',
    aliases: ['適用宣言書'],
    description: 'ISMSで、必要な管理策と、それを採用した理由・除外した理由、実施しているかどうかをまとめた文書。',
  },

  // 法令（解説ページ）
  {
    id: 'unauthorized-access-act',
    name: '不正アクセス禁止法',
    aliases: ['不正アクセス禁止法'],
    description:
      'アクセス制御のかかったコンピュータに、他人のIDとパスワードや脆弱性を使って不正に入ることや、IDとパスワードの不正な取得・提供、フィッシングなどの不正入力要求を禁止する法律。',
  },
  {
    id: 'privacy-act',
    name: '個人情報保護法',
    aliases: ['個人情報保護法'],
    description:
      '個人情報を扱う事業者に、利用目的の特定、安全管理措置、第三者提供の制限などを義務づける法律。一定の漏えい等が起きたときは、個人情報保護委員会への報告と本人への通知が必要。',
  },
  {
    id: 'sensitive-personal-info',
    name: '要配慮個人情報',
    aliases: ['要配慮個人情報'],
    description: '人種、信条、病歴、犯罪の経歴など、不当な差別や偏見が生じないよう特に配慮が必要な個人情報。取得には、原則として本人の同意が必要。',
  },
  {
    id: 'trade-secret',
    name: '営業秘密',
    aliases: ['営業秘密'],
    description: '不正競争防止法で保護される秘密の情報。秘密管理性・有用性・非公知性の3つの要件をすべて満たす必要がある。',
  },
  {
    id: 'virus-crime',
    name: 'ウイルス作成罪（不正指令電磁的記録に関する罪）',
    aliases: ['ウイルス作成罪'],
    description: '正当な理由なく、他人のコンピュータで実行させる目的で、マルウェアを作成・提供・供用・取得・保管することを処罰する、刑法の規定。',
  },

  // 監査（解説ページ）
  {
    id: 'system-audit',
    name: 'システム監査',
    aliases: ['システム監査'],
    description: 'ITの利活用に関するリスクへの対応が適切かどうかを、独立した立場の監査人が検証・評価して、保証や助言を行うこと。',
  },
  {
    id: 'audit-evidence',
    name: '監査証拠',
    aliases: ['監査証拠'],
    description: '監査の結論を裏付ける事実。聞き取りだけでなく、ログ、設定、記録などを実際に確かめて入手する。',
  },
  {
    id: 'audit-workpaper',
    name: '監査調書',
    aliases: ['監査調書'],
    description: '監査人が実施した手続き、入手した証拠、結論に至った過程の記録。監査の結論の根拠として作成し、保管する。',
  },
  {
    id: 'internal-control',
    name: '内部統制',
    aliases: ['内部統制', '財務報告の信頼性'],
    description: '業務の有効性と効率性、財務報告の信頼性、法令の遵守、資産の保全を目的に、組織の中に組み込む仕組み。',
  },
  {
    id: 'it-control',
    name: 'IT全般統制・IT業務処理統制',
    aliases: ['IT全般統制', 'IT業務処理統制'],
    description:
      'IT全般統制は、アクセス権の管理や変更管理など、システムが正しく動き続けるための基盤の統制。IT業務処理統制は、入力のチェックや承認など、業務のシステムに組み込まれた統制。',
  },
  {
    id: 'segregation-of-duties',
    name: '職務の分離',
    aliases: ['職務の分離'],
    description: '1人に権限を集中させず、申請と承認、開発と本番への反映などを別の人が行うようにすること。不正や誤りを防ぐ。',
  },

  // CSIRTの体制（解説ページ）
  {
    id: 'soc',
    name: 'SOC',
    aliases: ['SOC'],
    description: 'Security Operation Center。ログやアラートを常時監視し、異常を検知・分析する組織やサービス。',
  },
  {
    id: 'psirt',
    name: 'PSIRT',
    aliases: ['PSIRT'],
    description: '自社が提供する製品やサービスの脆弱性に対応するチーム。報告の受付、調査、修正、利用者への公表を行う。',
  },
  {
    id: 'nco',
    name: '国家サイバー統括室（NCO）',
    aliases: ['国家サイバー統括室'],
    description: '2025年7月に、内閣サイバーセキュリティセンター（NISC）を改組して内閣官房に設置された組織。国のサイバーセキュリティ政策の総合調整を担う。',
  },
  {
    id: 'tlp',
    name: 'TLP（Traffic Light Protocol）',
    aliases: ['TLP'],
    description: '共有する情報に付ける区分（RED、AMBER、GREEN、CLEAR など）で、受け取った側が情報をどこまで広めてよいかを示す。',
  },
  {
    id: 'tabletop',
    name: '机上演習',
    aliases: ['机上演習'],
    description: 'インシデントのシナリオに沿って、関係者が判断や連絡の流れを話し合いながら確かめる訓練。手順書の不足を見つけて見直す。',
  },

  // 脆弱性管理（解説ページ）
  {
    id: 'cve',
    name: 'CVE',
    aliases: ['CVE'],
    description: '脆弱性ごとに付ける共通の識別番号（CVE-年-番号）。同じ脆弱性を、どの情報源でも同じ番号で特定できる。',
  },
  {
    id: 'cvss',
    name: 'CVSS',
    aliases: ['CVSS'],
    description:
      '脆弱性の深刻度を0.0〜10.0の値で評価する共通の方法。v3.1は基本・現状・環境の3つ、v4.0は基本・脅威・環境・補足の評価基準からなる。',
  },
  {
    id: 'cwe',
    name: 'CWE',
    aliases: ['CWE'],
    description: '脆弱性の種類（SQLインジェクション、XSS など）を分類した共通の一覧。',
  },
  {
    id: 'jvn',
    name: 'JVN',
    aliases: ['JVN iPedia', 'JVN'],
    description: 'IPAとJPCERT/CCが共同で運営する、国内向けの脆弱性対策情報のポータル。JVN iPedia は、脆弱性対策情報のデータベース。',
  },
  {
    id: 'kev',
    name: 'KEV',
    aliases: ['KEV'],
    description: '米国のCISAが公開する、実際に悪用が確認された脆弱性の一覧。対応の優先度を決める参考にする。',
  },
  {
    id: 'sbom',
    name: 'SBOM（ソフトウェア部品表）',
    aliases: ['SBOM'],
    description: 'ソフトウェアに含まれる部品（ライブラリなど）とバージョンの一覧。新しい脆弱性が公表されたとき、影響を受ける製品をすぐに特定できる。',
  },
  {
    id: 'early-warning',
    name: '情報セキュリティ早期警戒パートナーシップ',
    aliases: ['情報セキュリティ早期警戒パートナーシップ', '早期警戒パートナーシップ'],
    description:
      '国内で脆弱性の情報を扱う枠組み。発見者はIPAに届け出て、製品の脆弱性はJPCERT/CCが開発者と調整してJVNで公表し、Webサイトの脆弱性はIPAが運営者に通知する。',
  },
  {
    id: 'workaround',
    name: '回避策（緩和策）',
    aliases: ['回避策'],
    description: '修正プログラムをすぐに適用できないときに、通信の制限や機能の無効化などで、脆弱性を悪用されるリスクを下げる対策。',
  },

  // クラウド（解説ページ）
  {
    id: 'cloud-models',
    name: 'IaaS・PaaS・SaaS',
    aliases: ['IaaS', 'PaaS', 'SaaS'],
    description:
      'クラウドサービスの形態。IaaSは仮想マシンなどの基盤、PaaSはアプリケーションを動かす環境、SaaSはアプリケーションそのものを提供する。形態によって、利用者が責任を持つ範囲が変わる。',
  },
  {
    id: 'cspm',
    name: 'CSPM',
    aliases: ['CSPM'],
    description: 'Cloud Security Posture Management。クラウドの設定を継続的に点検し、公開の設定や過剰な権限などの問題を見つける仕組み。',
  },
  {
    id: 'casb',
    name: 'CASB',
    aliases: ['CASB'],
    description: 'Cloud Access Security Broker。社員のクラウドサービスの利用を可視化し、許可していない利用（シャドーIT）やデータの持ち出しを制御する仕組み。',
  },
  {
    id: 'shadow-it',
    name: 'シャドーIT',
    aliases: ['シャドーIT'],
    description: '組織が許可していないクラウドサービスや機器を、社員が業務に使うこと。管理の外で情報が漏えいするおそれがある。',
  },
  {
    id: 'ismap',
    name: 'ISMAP',
    aliases: ['ISMAP-LIU', 'ISMAP'],
    description: '政府情報システムのためのセキュリティ評価制度。政府が求めるセキュリティの要求を満たすクラウドサービスを、あらかじめ評価して登録する。',
  },
  {
    id: 'iac',
    name: 'IaC（インフラのコード化）',
    aliases: ['IaC'],
    description: 'サーバやネットワークなどの設定をコードで管理すること。レビューと自動の検査を経て反映でき、設定ミスを減らせる。',
  },
  {
    id: 'sla',
    name: 'SLA',
    aliases: ['SLA'],
    description: 'Service Level Agreement。サービスの品質（稼働率、障害の連絡の時間など）について、事業者と利用者が合意したもの。',
  },

  // 無線LAN
  {
    id: 'radius',
    name: 'RADIUS',
    aliases: ['RADIUS'],
    description: '利用者や端末の認証を一か所で行うためのプロトコルと、そのサーバ。IEEE 802.1Xでは認証サーバの役割を担い、APやスイッチから認証を任される（UDP/1812）。',
  },
  {
    id: 'peap',
    name: 'PEAP',
    aliases: ['PEAP'],
    description: 'サーバ証明書でTLSのトンネルを作り、その中でIDとパスワード（MSCHAPv2など）を確かめるEAPの方式。端末がサーバ証明書を検証しないと、偽APに認証情報を盗まれる。',
  },
  {
    id: 'eap-tls',
    name: 'EAP-TLS',
    aliases: ['EAP-TLS'],
    description: 'サーバとクライアントの両方が証明書で認証するEAPの方式。パスワードを使わないので、盗まれる認証情報がない。',
  },
  {
    id: 'wpa',
    name: 'WPA2・WPA3',
    aliases: ['WPA3-Enterprise', 'WPA3-Personal', 'WPA2-Enterprise', 'WPA2-Personal', 'WPA3', 'WPA2'],
    description:
      '無線LANのセキュリティの規格。Personalは共通のパスフレーズ、EnterpriseはIEEE 802.1Xで利用者ごとに認証する。WPA3では、PMFが必須になり、PersonalはSAEでオフラインの辞書攻撃に強くなった。',
  },
  {
    id: 'sae',
    name: 'SAE',
    aliases: ['SAE'],
    description: 'WPA3-Personalの鍵の交換の方式。やり取りを傍受されても、パスフレーズをオフラインの辞書攻撃で割り出しにくい。',
  },
  {
    id: 'pmf',
    name: 'PMF（管理フレームの保護）',
    aliases: ['PMF', 'IEEE 802.11w'],
    description: '無線LANの切断などの管理フレームに改ざん検知の値を付けて、偽の切断フレームを受け付けないようにする仕組み（IEEE 802.11w）。WPA3では必須。',
  },
  {
    id: 'four-way-handshake',
    name: '4ウェイハンドシェイク',
    aliases: ['4ウェイハンドシェイク'],
    description: 'APと端末が、PMKと乱数から、その接続だけで使う暗号化の鍵（PTK）を作るための4回のやり取り。',
  },
  {
    id: 'ssid',
    name: 'SSID',
    aliases: ['SSID'],
    description: '無線LANのネットワークの名前。だれでも同じ名前を名乗れるので、SSIDだけでは本物のAPかどうかを確かめられない。',
  },
  {
    id: 'ccmp',
    name: 'CCMP',
    aliases: ['CCMP'],
    description: 'WPA2・WPA3で使う、AESによる無線の区間の暗号化と改ざん検知の方式。',
  },
  {
    id: 'wips',
    name: 'WIPS',
    aliases: ['WIPS'],
    description: '無線の侵入防止システム。APやセンサーで周りの電波を監視し、登録外のAP（偽AP）や不審な切断フレームを検知して、通知や遮断を行う。',
  },
  {
    id: 'mdm',
    name: 'MDM',
    aliases: ['MDM'],
    description: 'Mobile Device Management。会社の端末の設定（無線LANの設定、証明書など）を一括で配布・管理する仕組み。',
  },
  {
    id: 'dynamic-vlan',
    name: '動的VLAN',
    aliases: ['動的VLAN'],
    description: '認証の結果に応じて、端末をつなぐVLANを切り替える仕組み。利用者や端末の種類ごとに、アクセスできる範囲を分けられる。',
  },
  {
    id: 'asset-inventory',
    name: '資産の一覧（資産台帳）',
    aliases: ['資産の一覧', '資産台帳'],
    description: '組織が持つ機器やソフトウェア（製品名と版を含む）の一覧。脆弱性や改ざんが公表されたとき、影響を受ける端末をすぐに特定するために使う。',
  },

  // クラウドストレージ
  {
    id: 'public-access-block',
    name: 'パブリックアクセスのブロック',
    aliases: ['パブリックアクセスのブロック'],
    description: 'クラウドのストレージを、だれでも読める設定（公開）にすることを、組織やアカウントの単位で禁止する設定。',
  },
  {
    id: 'presigned-url',
    name: '期限付きURL（署名付きURL）',
    aliases: ['期限付きURL', '期限付きのURL'],
    description: '特定のファイルだけを、決めた期限まで読めるようにするURL。ストレージを公開せずに、必要な相手とだけ共有できる。',
  },
  {
    id: 'audit-log',
    name: '監査ログ（操作ログ）',
    aliases: ['監査ログ'],
    description: 'だれが、いつ、どの操作（設定の変更、ログイン、データの出力など）をしたかの記録。インシデントの原因や影響を調べる証拠になる。',
  },

  // サプライチェーン
  {
    id: 'supply-chain-attack',
    name: 'サプライチェーン攻撃',
    aliases: ['サプライチェーン攻撃'],
    description: '製品の提供元（ベンダー）や委託先など、取引でつながる組織を足がかりにして、それを利用する組織に侵入する攻撃。更新の改ざんや、委託先の保守回線の悪用などがある。',
  },
  {
    id: 'code-signing',
    name: 'コード署名',
    aliases: ['コード署名'],
    description: 'プログラムや更新のファイルに、作成者（ベンダー）の秘密鍵で付ける電子署名。利用者は公開鍵で検証し、作成者が作ったもので改ざんされていないことを確かめる。',
  },
  {
    id: 'backdoor',
    name: 'バックドア',
    aliases: ['バックドア'],
    description: '正規の認証を経ずに、攻撃者があとから入り込めるように仕込まれた裏口。',
  },
]
