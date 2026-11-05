import type { Learning } from './types'

export const wlan: Learning = {
  guide: {
    goals: [
      'IEEE 802.1Xの3つの役割（サプリカント、オーセンティケータ、認証サーバ）と、認証の流れを説明できる',
      '偽APによる認証情報の窃取が、端末でサーバ証明書を検証しないと成り立つ理由を説明できる',
      'WPA3（SAE、PMF）とEAP-TLSが、それぞれどの攻撃を防ぐかを説明できる',
    ],
    prerequisites: ['電子証明書と認証局（CA）', 'TLSのハンドシェイクの流れ'],
    misconceptions: [
      {
        wrong: 'WPA2-Personal でも、パスフレーズが長ければ全社で共有して問題ない',
        right: '全員が同じパスフレーズだと、退職者や盗み見た人もつなげて、だれの接続かも区別できない。社内では、利用者ごとに認証する IEEE 802.1X を使う',
      },
      {
        wrong: 'IEEE 802.1X で認証していれば、偽APにつながっても安全',
        right: '端末がサーバ証明書を検証しないと、偽のRADIUSとTLSでつながり、認証情報を盗まれる',
      },
      {
        wrong: 'MACアドレスで許可した端末だけにすれば、なりすましは防げる',
        right: 'MACアドレスは簡単に偽装できる。証明書など、偽装しにくい情報で認証する',
      },
    ],
    comparison: {
      title: '無線LANへの攻撃への対策の比較',
      rows: [
        {
          measure: 'サーバ証明書の検証',
          stops: '偽APの偽のRADIUSへ、認証情報を送ってしまうこと',
          limits: '利用者が警告を無視して続行できる設定',
          where: '端末（MDMで設定を配る）',
        },
        {
          measure: 'EAP-TLS（クライアント証明書）',
          stops: 'パスワードの窃取と、なりすまし',
          limits: '証明書の入った端末そのものの盗難',
          where: '端末とRADIUSサーバ',
        },
        {
          measure: 'PMF（WPA3で必須）',
          stops: '偽の切断フレームによる強制的な切断',
          limits: '電波の妨害（ジャミング）',
          where: 'APと端末',
        },
        {
          measure: 'SAE（WPA3-Personal）',
          stops: '4ウェイハンドシェイクを傍受した、オフラインの辞書攻撃',
          limits: 'パスフレーズそのものの漏えい',
          where: 'APと端末',
        },
        {
          measure: 'WIPS',
          stops: '偽APや、不審な切断フレームの見逃し',
          limits: 'センサーの範囲の外にある偽AP',
          where: 'APやセンサー',
        },
      ],
    },
    cues: [
      { cue: '「無線LANの接続が、何度も切れる」', think: '偽の切断フレーム（偽APへ誘導する準備）の可能性。PMF、WIPS' },
      { cue: '「端末で、サーバ証明書を検証しない設定になっていた」', think: '偽APに認証情報を盗まれるおそれ。MDMで検証を必須にする' },
      { cue: '「WPA2-Personal のパスフレーズを、全社員で共有している」', think: 'IEEE 802.1X（WPA2・WPA3-Enterprise）で、利用者ごとに認証する' },
    ],
  },
  quiz: {
    choices: [
      {
        question: 'IEEE 802.1Xで、オーセンティケータの役割を担う機器はどれか。',
        choices: ['無線LANにつなぐ端末', 'RADIUSサーバ', '無線LANのAP', 'DHCPサーバ'],
        answer: 2,
        explanation: 'アはサプリカント、イは認証サーバです。APは、認証が済むまで端末の通信を止め、EAPをRADIUSサーバへ中継します。',
      },
      {
        question: 'WPA3で必須となったPMFが防ぐ攻撃として、適切なものはどれか。',
        choices: ['偽の切断フレームで、端末の接続を切る攻撃', 'パスワードの総当たり攻撃', 'SQLインジェクション', 'DNSのキャッシュポイズニング'],
        answer: 0,
        explanation: 'PMFは、切断などの管理フレームに改ざん検知の値を付けるので、偽の切断フレームを受け付けません。',
      },
      {
        question: 'PEAPで無線LANにつなぐ端末が、サーバ証明書を検証する目的はどれか。',
        choices: [
          '通信を速くする',
          '接続先のRADIUSサーバが本物かを確かめ、偽APに認証情報を渡さない',
          '端末のMACアドレスを隠す',
          'APの電波を強くする',
        ],
        answer: 1,
        explanation: '検証しないと、偽APが用意した偽のRADIUSとTLSでつながり、ID・パスワードの応答を盗まれます。',
      },
      {
        question: 'WPA3-PersonalのSAEの特徴として、適切なものはどれか。',
        choices: [
          '利用者ごとに、クライアント証明書で認証する',
          '管理フレームを保護しない',
          'RADIUSサーバが必須になる',
          'やり取りを傍受されても、パスフレーズをオフラインの辞書攻撃で割り出しにくい',
        ],
        answer: 3,
        explanation: 'アはEAP-TLS、ウはWPA3-Enterprise（IEEE 802.1X）の特徴です。WPA3ではPMFが必須なので、イは誤りです。',
      },
    ],
    written: [
      {
        question: 'EAP-TLSで認証すると、偽APにつながっても認証情報を盗まれにくい理由を、40字以内で述べよ。',
        limit: 40,
        answer: 'パスワードを使わず、秘密鍵は端末から出ないので、盗める情報がないから。',
        keys: ['パスワードを使わない', '秘密鍵は端末の外に出ない'],
        explanation: '秘密鍵をTPMに保存すると、端末からも取り出せません。端末の盗難には、端末のロックや証明書の失効で備えます。',
      },
      {
        question: 'RADIUSの認証のログを、資産台帳と突き合わせる目的を、30字以内で述べよ。',
        limit: 30,
        answer: '登録のない端末からの、不正な接続を見つけるため。',
        keys: ['登録のない端末', '不正な接続の発見'],
        explanation: 'IDとパスワードが正しくても、会社の端末でなければ、盗まれた認証情報による接続の疑いがあります。',
      },
    ],
  },
}
