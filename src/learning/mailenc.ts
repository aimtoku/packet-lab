import type { Learning } from './types'

export const mailenc: Learning = {
  guide: {
    goals: [
      'STARTTLSの仕組みと、経路上でSTARTTLSの表示を消されると平文で送ってしまう理由を説明できる',
      'MTA-STS・DANEで、メールサーバ間の暗号化を必須にする仕組みを説明できる',
      'TLS（経路の暗号化）とS/MIME（メールそのものの暗号化）の守る範囲の違いと、S/MIMEで使う鍵を説明できる',
    ],
    prerequisites: ['メールの送信の流れ（SMTP、MTA）', 'HTTPSとサーバ証明書', '電子署名と公開鍵'],
    misconceptions: [
      {
        wrong: 'メールサーバ同士がSTARTTLSに対応していれば、メールは必ず暗号化される',
        right: '既定は日和見的な暗号化で、STARTTLSの表示を消されると平文で送る。必ず暗号化するには、MTA-STSやDANEで必須にする',
      },
      {
        wrong: 'STARTTLSで送れば、受信者のメールサーバの中でもメールは暗号化されている',
        right: 'TLSが守るのは通信の区間だけ。サーバの中では平文。サーバの中でも守るには、S/MIMEなどでメールそのものを暗号化する',
      },
      {
        wrong: 'S/MIMEの暗号化には、送信者の秘密鍵を使う',
        right: '暗号化は受信者の公開鍵（証明書）、復号は受信者の秘密鍵。送信者の秘密鍵は署名に使う',
      },
    ],
    comparison: {
      title: 'メールを守る方式の比較',
      rows: [
        {
          measure: 'STARTTLS（日和見的な暗号化）',
          stops: '経路上での受動的な盗聴',
          limits: 'STARTTLSの表示を消すダウングレード攻撃。サーバの中では平文',
          where: '送信MTAと受信MTAの間',
        },
        {
          measure: 'MTA-STS・DANE',
          stops: 'ダウングレード攻撃、偽の受信MTAへの配送',
          limits: 'サーバの中では平文。双方の対応が必要',
          where: '送信MTA（受信側が方針を公開）',
        },
        {
          measure: 'S/MIME・PGP',
          stops: '経路上とサーバの中での盗み見、改ざん、なりすまし',
          limits: '受信者の証明書が必要。件名などのヘッダは暗号化されないことがある',
          where: '送信者と受信者のメールソフト',
        },
        {
          measure: 'SPF・DKIM・DMARC',
          stops: '送信元のなりすまし',
          limits: '中身の盗み見は防げない（暗号化ではない）',
          where: '受信MTAでの検証',
        },
      ],
    },
    cues: [
      { cue: '「受信MTAがSTARTTLSに対応しているのに、平文で配送されていた」', think: '経路上でのSTARTTLSのダウングレードを疑う' },
      { cue: '「メールサーバの管理者にも、メールの内容を読まれないようにしたい」', think: 'S/MIMEなどのエンドツーエンドの暗号化' },
      { cue: '「受信側が、TLSを必須にする方針をHTTPSで公開する」', think: 'MTA-STS。失敗の報告はTLS-RPT' },
    ],
  },
  quiz: {
    choices: [
      {
        question: 'S/MIMEでメールを暗号化して送るとき、暗号化に使う鍵はどれか。',
        choices: ['送信者の秘密鍵', '受信者の公開鍵', '送信者の公開鍵', '受信者の秘密鍵'],
        answer: 1,
        explanation: '受信者の公開鍵で暗号化し、受信者だけが持つ秘密鍵で復号します。署名には送信者の秘密鍵を使います。',
      },
      {
        question: 'STARTTLSによるメールの暗号化が、経路上の攻撃者に無効にされる理由はどれか。',
        choices: [
          'TLSの暗号が古く、解読できるから',
          '受信MTAの秘密鍵が公開されているから',
          'TLSに切り替える前のやり取りは平文で、STARTTLSの表示を消せるから',
          'メールの本文が暗号化されないから',
        ],
        answer: 2,
        explanation: '切り替えの前のEHLOの応答は暗号化されていません。表示を消されると、日和見的な暗号化では平文で送ります。',
      },
      {
        question: 'MTA-STSの説明として、適切なものはどれか。',
        choices: [
          '受信側のドメインが、TLSを必須にする方針をDNSとHTTPSで公開し、送信MTAに守らせる',
          '送信者のIPアドレスをDNSに登録し、受信側で送信元を確かめる',
          'メールの本文に、送信ドメインの秘密鍵で署名する',
          'メールソフトから送信MTAへの送信に、SMTP認証を必須にする',
        ],
        answer: 0,
        explanation: 'イはSPF、ウはDKIM、エはサブミッションポートでのSMTP認証です。',
      },
      {
        question: 'メールのTLS（STARTTLS）では守れないが、S/MIMEでは守れるものはどれか。',
        choices: ['送信MTAと受信MTAの間の通信の盗聴', 'メールソフトと送信MTAの間の通信の盗聴', '経路上の受動的な盗聴', '受信MTAの中に保存されたメールの盗み見'],
        answer: 3,
        explanation: 'TLSが守るのは通信の区間だけです。サーバの中に保存されたメールは、S/MIMEなどで本文を暗号化しないと守れません。',
      },
    ],
    written: [
      {
        question: 'メールサーバ間のSTARTTLSを、日和見的な暗号化のまま使うことの問題点を、40字以内で述べよ。',
        limit: 40,
        answer: 'STARTTLSの表示を経路上で消されると、平文でメールを送ってしまう。',
        keys: ['STARTTLSの表示を消される', '平文で送ってしまう'],
        explanation: '暗号化できない相手にも届けることを優先するので、ダウングレード攻撃に弱くなります。',
      },
      {
        question: 'MTA-STSの方針をHTTPSで取得する理由を、35字以内で述べよ。',
        limit: 35,
        answer: '経路上の攻撃者に、方針を書き換えられないようにするため。',
        keys: ['方針の改ざんの防止', 'サーバ証明書で守られた通信'],
        explanation: '方針そのものを平文で取得すると、方針ごと書き換えられてしまいます。',
      },
    ],
  },
}
