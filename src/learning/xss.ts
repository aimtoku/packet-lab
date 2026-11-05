import type { Learning } from './types'

export const xss: Learning = {
  guide: {
    goals: [
      '格納型・反射型・DOM-based XSSの違いを説明できる',
      '根本対策（出力時のエスケープ）と、補助的な対策（CSP、HttpOnly属性、WAF）の役割を区別できる',
      'XSSによるセッションハイジャックの流れを説明できる',
    ],
    prerequisites: ['HTMLとJavaScriptの基本', 'Cookieによるセッション管理と、同一オリジンポリシー'],
    misconceptions: [
      {
        wrong: 'Cookieに HttpOnly 属性を付ければ、XSSを防げる',
        right: 'HttpOnlyはCookieの読み取りを防ぐだけ。スクリプトの実行そのもの（偽のフォームの表示など）は防げない',
      },
      {
        wrong: 'XSSの対策は、入力のチェックだけで十分',
        right: '根本対策は、出力する場所に合わせたエスケープ。入力値の検証は補助的な対策',
      },
      {
        wrong: 'WAFを入れれば、アプリケーションの修正は要らない',
        right: 'WAFはすり抜けられることもあるので、アプリケーション側の対策が前提',
      },
    ],
    comparison: {
      title: 'XSSへの対策の比較',
      rows: [
        {
          measure: '出力時のエスケープ',
          stops: 'スクリプトがHTMLとして解釈されること（根本対策）',
          limits: 'エスケープの漏れ',
          where: 'Webアプリケーション',
        },
        {
          measure: 'CSP',
          stops: '許可していないスクリプトの実行',
          limits: '許可した場所に置かれたスクリプトの悪用',
          where: 'Webサーバ（ヘッダ）とブラウザ',
        },
        {
          measure: 'HttpOnly属性',
          stops: 'document.cookie によるCookieの読み取り',
          limits: 'スクリプトの実行そのもの',
          where: 'Cookie',
        },
        {
          measure: 'WAF',
          stops: '既知のパターンの攻撃',
          limits: 'パターンをすり抜ける攻撃',
          where: 'Webサーバの手前',
        },
      ],
    },
    cues: [
      { cue: '「掲示板の投稿を表示した利用者が、被害を受けた」', think: '格納型XSS。投稿を表示した全員が対象' },
      { cue: '「URLのパラメータが、そのまま画面に表示される」', think: '反射型XSS' },
      { cue: '「Cookieに HttpOnly 属性を付けた」', think: 'Cookieの窃取は防げるが、XSSそのものは防げない' },
    ],
  },
  quiz: {
    choices: [
      {
        question: '格納型XSSの説明として、適切なものはどれか。',
        choices: [
          'URLに含めたスクリプトが、そのまま応答に反映される',
          'サーバに保存されたスクリプトが、ページを表示した利用者のブラウザで実行される',
          'ブラウザ側のJavaScriptの処理だけで、スクリプトが実行される',
          'データベースに、不正なSQL文が実行される',
        ],
        answer: 1,
        explanation: 'アは反射型XSS、ウはDOM-based XSS、エはSQLインジェクションの説明です。',
      },
      {
        question: 'XSSの根本的な対策として、最も適切なものはどれか。',
        choices: [
          'ページに出力する文字列を、出力する場所に合わせてエスケープする',
          '通信をHTTPSにする',
          '利用者のパスワードを、複雑なものにする',
          'Cookieに Secure 属性を付ける',
        ],
        answer: 0,
        explanation: 'HTMLの本文、属性値、JavaScriptの中、URLなど、出力する場所ごとに必要なエスケープを行います。',
      },
      {
        question: 'Cookieに HttpOnly 属性を付けたときの効果はどれか。',
        choices: [
          'Cookieが暗号化される',
          'XSSの脆弱性がなくなる',
          'JavaScriptから document.cookie で、Cookieを読めなくなる',
          '他サイトからのリクエストに、Cookieが付かなくなる',
        ],
        answer: 2,
        explanation: 'スクリプトがCookieを読めなくなるので、XSSによるセッションIDの窃取を防げます。ただし、XSSそのものはなくなりません。',
      },
      {
        question: 'CSPで、スクリプトを自サイトのファイルからだけ読み込むよう指定したときの効果として、適切なものはどれか。',
        choices: [
          'すべてのCookieが暗号化される',
          'SQLインジェクションを防げる',
          'サーバ証明書の検証が要らなくなる',
          'ページに直接書かれたスクリプト（インラインスクリプト）は実行されない',
        ],
        answer: 3,
        explanation: '投稿に紛れ込んだスクリプトはインラインスクリプトになるので、エスケープに漏れがあっても実行されにくくなります。',
      },
    ],
    written: [
      {
        question: '掲示板の投稿をエスケープせずに出力すると、閲覧者のCookieが攻撃者に送られてしまう理由を、50字以内で述べよ。',
        limit: 50,
        answer: '投稿に含めたスクリプトが、掲示板サイトのスクリプトとして閲覧者のブラウザで実行されるから。',
        keys: ['スクリプトが実行される', '掲示板サイトのもの（同一オリジン）として'],
        explanation: '同一オリジンのスクリプトとして動くので、そのサイトのCookieを読み取り、攻撃者のサーバへ送れます。',
      },
      {
        question: 'XSSでセッションIDが盗まれた疑いがあるとき、盗まれたIDを使えなくするために行うことを、30字以内で述べよ。',
        limit: 30,
        answer: '全利用者のセッションを無効にし、再ログインさせる。',
        keys: ['セッションの無効化', '再ログイン'],
        explanation: 'だれのセッションIDが盗まれたかを特定しきれないので、全員分を無効にするのが確実です。',
      },
    ],
  },
}
