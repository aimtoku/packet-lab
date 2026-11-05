import type { Learning } from './types'

export const mail: Learning = {
  guide: {
    goals: [
      'エンベロープFromとヘッダFromの違いを説明できる',
      'SPF・DKIM・DMARCが、それぞれ何を検証するかを説明できる',
      '自社ドメインの詐称を防ぐために、送信側が何を公開するかを説明できる',
    ],
    prerequisites: ['SMTPによるメールの配送', '電子署名とハッシュ関数（DKIMの理解に使う）'],
    misconceptions: [
      {
        wrong: 'SPFで、利用者に見える差出人（ヘッダFrom）を確かめられる',
        right: 'SPFが確かめるのは、エンベロープFromのドメインと送信元IPアドレス。ヘッダFromとの一致はDMARCで確かめる',
      },
      {
        wrong: '自社ドメインの詐称を防ぐのは、受信側の設定だけでよい',
        right: '詐称を見破る材料として、送信ドメイン側がSPF・DKIM・DMARCのレコードを公開する必要がある',
      },
      {
        wrong: 'DKIMは、メールの本文を暗号化する',
        right: 'DKIMは電子署名で、改ざんと署名したドメインを確かめる仕組み。暗号化はしない',
      },
    ],
    comparison: {
      title: '送信ドメイン認証の比較',
      rows: [
        {
          measure: 'SPF',
          stops: '許可していないサーバからの送信',
          limits: 'ヘッダFromの詐称、転送されたときの失敗',
          where: '送信ドメインのDNS（TXTレコード）',
        },
        {
          measure: 'DKIM',
          stops: '本文とヘッダの改ざん、署名ドメインの詐称',
          limits: 'ヘッダFromの詐称（d= が別ドメインのとき）',
          where: '送信MTA（署名）とDNS（公開鍵）',
        },
        {
          measure: 'DMARC',
          stops: 'ヘッダFromの詐称（アライメント）、失敗したときの扱いの指定',
          limits: '似たドメイン（タイプミスを狙ったもの）からの送信',
          where: '送信ドメインのDNS（_dmarc）',
        },
      ],
    },
    cues: [
      { cue: '「取引先を装ったメールで、振込先の変更を依頼された」', think: 'ビジネスメール詐欺（BEC）。メール以外の手段で確かめる。送信ドメイン認証' },
      { cue: '「SPFは pass なのに、表示される差出人が別のドメイン」', think: 'ヘッダFromとのアライメント → DMARC' },
      { cue: '「メールを転送すると、SPFが失敗する」', think: '転送サーバのIPアドレスは許可されていない。DKIMは本文が変わらなければ転送に強い' },
    ],
  },
  quiz: {
    choices: [
      {
        question: 'SPFで、受信側が確かめる対象はどれか。',
        choices: ['エンベロープFromのドメインと、送信元のIPアドレス', 'DKIM署名の公開鍵', '受信者のメールアドレス', 'ヘッダFromのドメインと、メールの本文'],
        answer: 0,
        explanation: '受信側は、エンベロープFrom（MAIL FROM）のドメインのSPFレコードを引き、送信元のIPアドレスが許可されているかを確かめます。',
      },
      {
        question: 'DMARCの役割として、適切なものはどれか。',
        choices: [
          'メールサーバ間の通信を、TLSで保護する',
          'メールの本文を暗号化する',
          'ヘッダFromとSPF・DKIMのドメインの一致を確かめ、失敗したときの扱いを指定する',
          '迷惑メールの送信元IPアドレスの一覧を公開する',
        ],
        answer: 2,
        explanation: 'DMARCは、利用者に見えるヘッダFromのドメインと、SPF・DKIMで確かめたドメインの一致（アライメント）を求め、失敗時の扱い（none・quarantine・reject）を指定します。',
      },
      {
        question: 'DKIMの検証で、受信MTAが公開鍵を取得する場所はどれか。',
        choices: ['受信者のPC', '認証局のCRL', '送信者のメールソフト', '署名の d= と s= が示す、DNSのTXTレコード'],
        answer: 3,
        explanation: '受信MTAは「s=（セレクタ）._domainkey.d=（ドメイン）」のTXTレコードから公開鍵を取得して、署名を検証します。',
      },
      {
        question: 'DMARCのポリシーを段階的に強める順序として、適切なものはどれか。',
        choices: ['reject → quarantine → none', 'none → quarantine → reject', 'quarantine → none → reject', 'none → reject → quarantine'],
        answer: 1,
        explanation: 'none（監視）で集計レポートを見ながら正規の送信元を把握し、quarantine（隔離）、reject（拒否）と強めます。',
      },
    ],
    written: [
      {
        question: '攻撃者が自社のドメインを詐称したメールを、受信側で見破れるようにするため、自社が行うべきことを40字以内で述べよ。',
        limit: 40,
        answer: '自社ドメインのSPF・DKIM・DMARCのレコードを、DNSに公開する。',
        keys: ['SPF・DKIM・DMARC', 'DNSに公開'],
        explanation: '受信側は、送信ドメインが公開したレコードを判断の材料にします。公開していないと、詐称だと判断できません。',
      },
      {
        question: 'DMARCのポリシーを、最初から reject にしない理由を40字以内で述べよ。',
        limit: 40,
        answer: '把握していない正規の送信元からのメールまで、受信を拒否される恐れがあるから。',
        keys: ['正規のメール', '拒否される'],
        explanation: '外部のメール配信サービスなど、自社が把握していない正規の送信元があることがあります。none で集計レポートを見て確かめてから強めます。',
      },
    ],
  },
}
