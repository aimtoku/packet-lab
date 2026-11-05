import type { Learning } from './types'

export const web: Learning = {
  guide: {
    goals: [
      'CSRFが「正規のセッションのまま、利用者の意図しない操作をさせる」攻撃であることを説明できる',
      'CSRFトークンとSameSite属性が、それぞれどのように攻撃を防ぐかを説明できる',
      'Cookieの属性（Secure・HttpOnly・SameSite）が、それぞれ何を防ぐかを区別できる',
    ],
    prerequisites: ['HTTPのリクエスト（GETとPOST）', 'Cookieによるセッション管理（セッションID）'],
    misconceptions: [
      {
        wrong: 'CSRFは、セッションIDを盗む攻撃である',
        right: 'セッションIDは盗まない。ブラウザが自動で付けるCookieを利用して、正規のセッションのまま操作させる',
      },
      {
        wrong: 'Cookieに HttpOnly 属性を付ければ、CSRFを防げる',
        right: 'HttpOnlyはJavaScriptからの読み取りを防ぐもので、CSRFは防げない。CSRFにはトークンやSameSite属性で対策する',
      },
      {
        wrong: 'HTTPSにすれば、CSRFは防げる',
        right: '罠ページから送らせるリクエストもHTTPSで届く。暗号化はCSRFの対策にならない',
      },
    ],
    comparison: {
      title: 'CSRFへの対策の比較',
      rows: [
        {
          measure: 'CSRFトークン',
          stops: '他サイトから送らせたリクエスト（攻撃者はトークンを知らない）',
          limits: 'XSSでトークンを読み取られた場合',
          where: 'Webアプリケーション',
        },
        {
          measure: 'SameSite属性（Lax・Strict）',
          stops: '他サイトを起点とするPOSTに、Cookieが付くこと',
          limits: '同じサイトの中からの攻撃、古いブラウザ',
          where: 'Cookie（サーバが指定し、ブラウザが守る）',
        },
        {
          measure: '重要な操作の前の再認証',
          stops: '利用者が知らない間の操作',
          limits: '利用者がだまされて入力した場合',
          where: 'Webアプリケーション',
        },
        {
          measure: 'Origin・Refererの確認',
          stops: '他サイトを起点とするリクエスト',
          limits: 'ヘッダが送られない場合の扱い',
          where: 'Webアプリケーション',
        },
      ],
    },
    cues: [
      { cue: '「ログイン中の利用者が罠サイトを開くと、意図しない送金が行われた」', think: 'CSRF。トークン、SameSite属性、再認証' },
      { cue: '「hidden項目に、推測できない値を埋め込んで検証する」', think: 'CSRFトークン（セッションと対応付けて検証）' },
      { cue: '「ログインに成功したときに、セッションIDを発行し直す」', think: 'セッション固定攻撃の対策' },
    ],
  },
  quiz: {
    choices: [
      {
        question: 'CSRFの説明として、適切なものはどれか。',
        choices: ['データベースに、不正なSQL文を実行させる', '利用者のブラウザで、攻撃者のスクリプトを実行させる', 'ログイン中の利用者に、意図しないリクエストを送らせる', '利用者のセッションIDを盗んで、なりすます'],
        answer: 2,
        explanation: 'CSRFは、正規のセッションのまま、利用者の意図しない操作をさせる攻撃です。アはSQLインジェクション、イはXSS、エはセッションハイジャックの説明です。',
      },
      {
        question: 'CSRFの対策として、適切なものはどれか。',
        choices: [
          '出力するときに、HTMLの特殊文字をエスケープする',
          'パスワードを、ハッシュ値で保存する',
          'Cookieに HttpOnly 属性を付ける',
          'フォームに、セッションと対応する推測できないトークンを埋め込み、受け取ったときに検証する',
        ],
        answer: 3,
        explanation: '攻撃者は利用者のトークンを知ることができないので、罠ページから正しいリクエストを作れません。アはXSSの対策です。',
      },
      {
        question: 'Cookieの SameSite=Lax 属性の効果はどれか。',
        choices: [
          'JavaScriptから、Cookieを読めなくする',
          '他サイトを起点とするPOSTのリクエストに、Cookieを付けない',
          'ブラウザを閉じると、Cookieを消す',
          'HTTPSのときだけ、Cookieを送る',
        ],
        answer: 1,
        explanation: 'アはHttpOnly属性、エはSecure属性の効果です。SameSite=Lax では、他サイトからのリンクによるGETの移動にはCookieが付きますが、POSTには付きません。',
      },
      {
        question: 'ログインに成功したときにセッションIDを発行し直すことで、防げる攻撃はどれか。',
        choices: ['セッション固定攻撃', 'CSRF', 'DNSキャッシュポイズニング', 'SQLインジェクション'],
        answer: 0,
        explanation: '攻撃者が事前に用意したセッションIDを利用者に使わせても、ログインの時点でIDが変わるので、攻撃者はそのセッションを使えません。',
      },
    ],
    written: [
      {
        question: 'CSRFトークンを使うと、攻撃者が罠ページで正しいリクエストを作れない理由を、40字以内で述べよ。',
        limit: 40,
        answer: 'トークンは推測できない値で、攻撃者は利用者のトークンを知ることができないから。',
        keys: ['推測できない', '攻撃者が知ることができない'],
        explanation: 'サーバはトークンをセッションと対応付けて保存し、リクエストのトークンと照合します。罠ページには正しいトークンを入れられません。',
      },
      {
        question: 'CSRFの脆弱性による被害が起きたあと、止めていた送金機能を再開する前に行うべきことを、40字以内で述べよ。',
        limit: 40,
        answer: '脆弱性を修正し、ほかの画面も含めて脆弱性診断で問題がないことを確かめる。',
        keys: ['脆弱性の修正', '脆弱性診断で確認'],
        explanation: '原因を取り除かずに再開すると、同じ攻撃が続きます。同じ作り込みがほかの画面にないかも確かめます。',
      },
    ],
  },
}
