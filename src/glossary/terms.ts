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
      '情報セキュリティの3要素（CIA）。機密性：許可された人だけが情報を見られる。完全性：情報が正確で、改ざんされていない。可用性：必要なときに情報やサービスを使える。',
  },
  {
    id: 'authenticity',
    name: '真正性',
    aliases: ['真正性'],
    description: '利用者や情報が、名乗っているとおりの本物であること。電子署名や認証で確かめる。機密性・完全性・可用性に加えて挙げられる特性の1つ。',
  },
  {
    id: 'non-repudiation',
    name: '否認防止',
    aliases: ['否認防止'],
    description: '後から「その操作はしていない」「送っていない」と否定できないようにすること。送信者の秘密鍵による電子署名で実現する。',
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
    description: '正規の公衆Wi-Fiと同じ名前（SSID）を名乗って、攻撃者が設置する無線LANのアクセスポイント。接続した端末の通信を、攻撃者が中継できる。Evil Twinとも呼ぶ。',
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
    aliases: ['送信元を偽装', '被害者を詐称'],
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
]
