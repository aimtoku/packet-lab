import type { Learning } from './types'

export const sso: Learning = {
  guide: {
    goals: [
      'SAMLによるシングルサインオンで、ブラウザ・SP・IdPの間のやり取りを説明できる',
      'SPがアサーションで確かめる項目（署名、Audience、有効期限、InResponseTo）と、その理由を説明できる',
      'OAuth 2.0（認可）とOpenID Connect（認証）の違いと、stateパラメータ・PKCEの役割を説明できる',
    ],
    prerequisites: ['電子署名と公開鍵', 'Cookieによるセッション管理と、リダイレクト'],
    misconceptions: [
      {
        wrong: 'SAMLでは、SPがIdPに直接問い合わせて、利用者を確認する',
        right: 'SPとIdPは直接通信しない。IdPが署名したアサーションを、ブラウザがSPへ運ぶ。SPは、事前に登録したIdPの証明書で署名を確かめる',
      },
      {
        wrong: 'OAuth 2.0のアクセストークンを受け取れば、ログインした本人の確認になる',
        right: 'OAuth 2.0は認可（APIを使う権限を与える）の仕組み。本人の認証には、OpenID ConnectのIDトークン（署名、宛先、有効期限、nonce）を検証する',
      },
      {
        wrong: 'IdPで多要素認証にすれば、SPの設定はどうでもよい',
        right: 'SPがアサーションの署名を確かめなければ、偽造したアサーションでIdPを迂回される',
      },
    ],
    comparison: {
      title: 'シングルサインオンの攻撃と対策の比較',
      rows: [
        {
          measure: 'アサーションの署名の検証',
          stops: '偽造したアサーションによるなりすまし',
          limits: 'IdPの署名の鍵が盗まれた場合',
          where: 'SP',
        },
        {
          measure: 'Audience・有効期限・InResponseTo の確認',
          stops: '別のSP向けや、古いアサーションの使い回し',
          limits: '有効期限内に盗まれた、自分宛てのアサーション',
          where: 'SP',
        },
        {
          measure: 'stateパラメータ',
          stops: '攻撃者の認可の結果を、利用者に受け取らせる攻撃（CSRF）',
          limits: '認可コードそのものの横取り',
          where: 'OAuthのクライアント',
        },
        {
          measure: 'PKCE',
          stops: '横取りされた認可コードによる、トークンの取得',
          limits: 'トークンそのものの漏えい',
          where: 'OAuthのクライアントと認可サーバ',
        },
      ],
    },
    cues: [
      { cue: '「SPに、IdPの証明書を事前に登録している」', think: 'アサーションの署名の検証に使う（メタデータの交換）' },
      { cue: '「IdPに記録のないログインが、SPの監査ログにある」', think: 'アサーションの偽造や、SPの検証の不備を疑う' },
      { cue: '「認可コードを横取りされても、アクセストークンを取得されないようにしたい」', think: 'PKCE（code_verifier と code_challenge）' },
    ],
  },
  quiz: {
    choices: [
      {
        question: 'SAMLによるシングルサインオンで、SPがアサーションの署名を検証するために使うものはどれか。',
        choices: ['SPの秘密鍵', '事前に登録したIdPの証明書（公開鍵）', '利用者のパスワード', 'ブラウザのCookie'],
        answer: 1,
        explanation: 'IdPは自分の秘密鍵で署名し、SPはIdPの公開鍵（証明書）で検証します。',
      },
      {
        question: 'SAMLのアサーションに含まれる Audience を、SPが確かめる目的はどれか。',
        choices: [
          'アサーションの署名を作る',
          '利用者のパスワードを確かめる',
          'IdPが動いているかを確かめる',
          '別のSP向けに発行されたアサーションを、使い回されないようにする',
        ],
        answer: 3,
        explanation: 'Audience は、どのSP向けのアサーションかを示します。自分宛てでなければ拒否します。',
      },
      {
        question: 'OAuth 2.0の説明として、適切なものはどれか。',
        choices: [
          '利用者の同意のもとで、クライアントにAPIを使う権限（アクセストークン）を与える',
          '利用者の本人確認の結果を、署名付きのアサーションで伝える',
          '電子メールの送信者のドメインを認証する',
          'IPアドレスから、MACアドレスを調べる',
        ],
        answer: 0,
        explanation: 'OAuth 2.0は認可の仕組みです。イはSAML、ウはSPFやDKIM、エはARPの説明です。',
      },
      {
        question: 'OAuth 2.0の認可コードフローで、PKCEを使う目的はどれか。',
        choices: [
          '攻撃者の認可の結果を、利用者に受け取らせないようにする（CSRF対策）',
          'アクセストークンの有効期限を延ばす',
          '横取りされた認可コードから、アクセストークンを取得されないようにする',
          'IdPの秘密鍵を保護する',
        ],
        answer: 2,
        explanation: 'クライアントだけが知る値（code_verifier）を、トークンの要求で示させます。アは stateパラメータの役割です。',
      },
    ],
    written: [
      {
        question: 'SAMLのSPが、アサーションの署名を検証していなかった。この場合に起きる被害を、40字以内で述べよ。',
        limit: 40,
        answer: '偽造したアサーションで、IdPの認証を経ずに他人になりすましてログインされる。',
        keys: ['アサーションの偽造', 'IdPを経ずになりすまし'],
        explanation: '署名がなければ、アサーションの中身（だれか）を自由に書けます。IdPの多要素認証も迂回されます。',
      },
      {
        question: 'IdPの認証の記録と、SPのログインの記録を突き合わせる目的を、30字以内で述べよ。',
        limit: 30,
        answer: 'IdPを経由していない不正なログインを見つけるため。',
        keys: ['IdPを経由しないログイン', '不正なログインの発見'],
        explanation: '正規のログインなら、SPのログインの直前に、IdPでの認証の記録があるはずです。',
      },
    ],
  },
}
