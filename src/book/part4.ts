import { actor, cell, fig, layers, link, m, map, mAdd, node, note, p, seq, table } from './fig'
import type { Chapter } from './types'

// 第4部 Webアプリケーション

const user = actor('u', '利用者のブラウザ', 'pc')
const bank = actor('bank', '銀行のサイト', 'server', {
  sub: 'bank.example.jp',
})
const evil = actor('evil', '攻撃者のサイト', 'server', { attacker: true })

export const web: Chapter = {
  id: 'web',
  part: 'web',
  title: 'Webのセッション管理とCSRF',
  lead: 'HTTPは1回ごとのやり取りで、前のやり取りを覚えていません。ログインの状態をどう引き継ぐのか（セッション管理）と、その仕組みを悪用するCSRF、そしてその対策を積み上げます。',
  sections: [
    {
      id: 'session',
      title: 'ログインの状態を引き継ぐ',
      blocks: [
        p(
          'HTTPは状態を持たないので、サーバは「さっきログインした人」を覚えていません。そこでサーバは、ログインに成功したら推測されにくいセッションIDを発行し、Cookieとしてブラウザに保存させます。',
        ),
        p(
          'ブラウザは、以後そのサイトへの要求に自動でCookieを付けます。サーバはセッションIDから、だれの要求かを判断します。セッションIDは、ログインしている本人の代わりになる大切な値です。',
        ),
        fig(
          seq(
            [user, bank],
            [
              m('u', 'bank', 'ログイン（ID・パスワード）'),
              mAdd('bank', 'bank', 'セッションIDを発行'),
              mAdd('bank', 'u', 'Set-Cookie: SID=8f3k…'),
              mAdd('u', 'bank', '残高の表示（Cookie: SID=8f3k… が自動で付く）'),
            ],
          ),
          'セッションIDをCookieに入れて、ログインの状態を引き継ぐ',
        ),
      ],
      see: { mode: 'normal', step: 2, label: 'セッションIDを発行' },
    },
    {
      id: 'cookie',
      title: 'Cookieの属性',
      blocks: [
        p('Cookieには、扱い方を指定する属性を付けられます。セッションIDのCookieには、次の属性を付けるのが基本です。'),
        fig(
          layers([
            'Set-Cookie ヘッダ',
            [
              cell('l7', 'SID=8f3k…', 'セッションID', { w: 1.6 }),
              cell('sec', 'Secure', 'HTTPSだけ', { add: true }),
              cell('sec', 'HttpOnly', 'JSから読めない', { add: true }),
              cell('sec', 'SameSite=Lax', '他サイトから付けない', {
                w: 1.3,
                add: true,
              }),
            ],
          ]),
          'セッションIDのCookieに付ける属性',
        ),
        table(
          ['属性', '働き', '防げること'],
          ['Secure', 'HTTPSの通信にだけCookieを付ける', '暗号化されていない通信での盗聴'],
          ['HttpOnly', 'JavaScriptからCookieを読めなくする', 'XSSによるセッションIDの持ち出し'],
          ['SameSite', 'ほかのサイトから始まった要求にCookieを付けない（Lax・Strict）', 'CSRF'],
        ),
      ],
    },
    {
      id: 'csrf',
      title: 'CSRF：利用者に要求を送らせる',
      blocks: [
        p(
          '利用者が銀行のサイトにログインしたまま、攻撃者のサイトを開いたとします。攻撃者のサイトには、銀行への送金の要求を自動で送るフォームが仕込まれています。',
        ),
        p(
          'ブラウザは、銀行への要求に自動でCookieを付けるので、銀行のサイトからは、利用者本人の正規の操作と区別できません。こうして利用者の意図しない操作を実行させるのが、クロスサイトリクエストフォージェリ（CSRF）です。',
        ),
        fig(
          seq(
            [
              user,
              actor('evil', '攻撃者のサイト', 'server', {
                attacker: true,
                add: true,
              }),
              bank,
            ],
            [
              m('u', 'bank', 'ログイン済み（Cookieあり）'),
              mAdd('u', 'evil', '攻撃者のサイトを開く', 'attack'),
              mAdd('evil', 'u', '罠のHTML（自動送信のフォーム）', 'attack'),
              mAdd('u', 'bank', '送金の要求 ＋ Cookie（自動で付く）', 'attack'),
              mAdd('bank', 'bank', '本人の操作と区別できず、送金を実行', 'attack'),
            ],
          ),
          'Cookieが自動で付くことを悪用して、意図しない操作をさせる',
        ),
      ],
      see: { mode: 'attack', step: 4, label: 'Cookieが自動で付く' },
    },
    {
      id: 'token',
      title: '対策：CSRFトークン',
      blocks: [
        p(
          '銀行のサイトは、送金のフォームを表示するときに、推測できない値（CSRFトークン）を埋め込み、セッションと結び付けて覚えておきます。送金の要求を受けたら、トークンが正しいかを確かめます。',
        ),
        p('攻撃者のサイトは、銀行のページの中身を読めないので、正しいトークンを知りません。トークンのない（または正しくない）要求は拒否されます。'),
        fig(
          seq(
            [user, evil, bank],
            [
              mAdd('bank', 'u', 'フォーム ＋ CSRFトークン', 'defense'),
              mAdd('u', 'bank', '送金（トークン付き）→ 実行', 'defense'),
              m('evil', 'u', '罠のHTML', 'attack'),
              mAdd('u', 'bank', '送金（トークンなし）→ 拒否', 'blocked'),
            ],
          ),
          'トークンを知っているのは、正規のページだけ',
        ),
      ],
      see: { mode: 'defense', step: 3, label: 'リクエストを拒否' },
    },
    {
      id: 'samesite',
      title: '対策を重ねる',
      blocks: [
        p(
          'CSRFトークンに加え、Cookieの SameSite 属性で、ほかのサイトから始まった要求にはCookieを付けないようにします。送金やパスワードの変更などの重要な操作では、パスワードの再入力を求めるのも有効です。',
        ),
        fig(
          seq(
            [user, evil, bank],
            [
              m('evil', 'u', '罠のHTML', 'attack'),
              mAdd('u', 'u', 'SameSite=Lax：他サイトからのPOSTにCookieを付けない', 'defense'),
              mAdd('u', 'bank', '送金の要求（Cookieなし）→ ログインしていない扱い', 'blocked'),
            ],
          ),
          'SameSite属性で、他サイトからの要求にCookieを付けない',
        ),
        table(
          ['対策', '仕組み', '注意'],
          ['CSRFトークン', '正規のページだけが知る値を確かめる', 'トークンを推測できない値にする'],
          ['SameSite属性', '他サイトからの要求にCookieを付けない', '古いブラウザでは効かない'],
          ['再認証', '重要な操作でパスワードを再入力させる', '利便性とのバランス'],
          ['Origin・Refererの確認', '要求の出どころを確かめる', 'ヘッダが付かない場合の扱いを決める'],
        ),
      ],
      see: { mode: 'defense', step: 4, label: '正規の操作は通る' },
    },
    {
      id: 'fixation',
      title: 'セッションの乗っ取りと固定化',
      blocks: [
        p('セッションIDが盗まれると、攻撃者はその利用者になりすませます（セッションハイジャック）。盗む方法には、盗聴、XSS（第12章）、推測などがあります。'),
        p(
          '攻撃者があらかじめ用意したセッションIDを利用者に使わせ、利用者がログインした後でそのIDを使う手口が、セッションの固定化です。ログインに成功したら、必ず新しいセッションIDを発行し直すことで防げます。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), user, bank],
            [
              m('x', 'u', 'SID=攻撃者が用意した値 を使わせる', 'attack'),
              m('u', 'bank', 'その SID のままログイン'),
              mAdd('bank', 'u', 'ログイン成功時に新しい SID を発行', 'defense'),
              mAdd('x', 'bank', '古い SID でアクセス → 無効', 'blocked'),
            ],
          ),
          'ログインのたびにセッションIDを発行し直せば、固定化は効かない',
        ),
      ],
    },
  ],
}

const board = actor('bbs', '掲示板サーバ', 'server')
const victim = actor('v', '閲覧者のブラウザ', 'pc')

export const xss: Chapter = {
  id: 'xss',
  part: 'web',
  title: 'クロスサイトスクリプティング（XSS）',
  lead: '利用者の入力をそのままページに埋め込むと、攻撃者のスクリプトが、ほかの利用者のブラウザで動いてしまいます。ページの組み立て方から、XSSの手口、エスケープとCSPによる対策までを積み上げます。',
  sections: [
    {
      id: 'html',
      title: 'ページは文字列から組み立てられる',
      blocks: [
        p(
          '掲示板のようなWebアプリは、利用者の投稿を保存しておき、一覧ページを表示するときに、投稿の文字列をHTMLの中に埋め込んで返します。ブラウザは、受け取ったHTMLを解釈して画面を作ります。',
        ),
        p('このとき、投稿の中の「<」や「>」がそのまま埋め込まれると、ブラウザは投稿の文字をHTMLのタグとして解釈してしまいます。'),
        fig(
          seq(
            [actor('a', '投稿者', 'pc'), board, victim],
            [
              m('a', 'bbs', '投稿「こんにちは」'),
              m('bbs', 'bbs', 'データベースに保存'),
              m('v', 'bbs', '一覧ページを開く'),
              mAdd('bbs', 'bbs', '投稿をHTMLに埋め込む'),
              m('bbs', 'v', 'HTML'),
            ],
          ),
          '投稿の文字列は、HTMLに埋め込まれて閲覧者に届く',
        ),
      ],
      see: { mode: 'normal', step: 4, label: '投稿をHTMLに埋め込んで返す' },
    },
    {
      id: 'stored',
      title: '格納型XSS',
      blocks: [
        p(
          '攻撃者が、スクリプト（<script>…</script>）を含む投稿を保存させます。ほかの利用者が一覧ページを開くと、スクリプトがそのままHTMLに埋め込まれ、閲覧者のブラウザで実行されます。',
        ),
        p(
          'スクリプトは、掲示板のサイトのページの一部として動くので、そのサイトのCookie（セッションID）を読み、攻撃者のサーバに送れます。攻撃者は、そのセッションIDで閲覧者になりすませます。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), board, victim],
            [
              mAdd('x', 'bbs', '投稿「<script>…</script>」', 'attack'),
              m('v', 'bbs', '一覧ページを開く'),
              mAdd('bbs', 'v', 'スクリプトがそのまま入ったHTML', 'attack'),
              mAdd('v', 'v', 'スクリプトが実行される', 'attack'),
              mAdd('v', 'x', 'セッションIDが攻撃者に届く', 'attack'),
            ],
          ),
          '保存された攻撃者のスクリプトが、閲覧者のブラウザで動く',
        ),
      ],
      see: {
        mode: 'attack',
        step: 3,
        label: 'スクリプトがそのまま埋め込まれる',
      },
    },
    {
      id: 'types',
      title: 'XSSの3つの型',
      blocks: [
        p(
          'スクリプトがどこから来るかによって、XSSは3つに分けられます。どの型でも、「利用者の入力が、エスケープされずにページの中でコードとして解釈される」ことが原因です。',
        ),
        table(
          ['型', 'スクリプトの通り道', '例'],
          ['格納型（持続型）', 'サーバに保存され、閲覧するたびに埋め込まれる', '掲示板、プロフィール欄'],
          ['反射型', 'URLなどに含めた値が、そのまま応答に埋め込まれる', '検索結果の「○○の検索結果」、罠のリンク'],
          ['DOMベース', 'ブラウザ上のJavaScriptが、URLなどの値をそのままページに書き込む', 'location.hash を innerHTML に入れる'],
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), victim, actor('site', '検索サイト', 'server')],
            [
              mAdd('x', 'v', '罠のリンク（URLにスクリプト）', 'attack'),
              mAdd('v', 'site', 'リンクを開く'),
              mAdd('site', 'v', 'URLの値をそのまま埋め込んだHTML', 'attack'),
              mAdd('v', 'v', 'スクリプトが実行される', 'attack'),
            ],
          ),
          '反射型XSS：罠のリンクに含めたスクリプトが、応答に「反射」して動く',
        ),
      ],
    },
    {
      id: 'escape',
      title: '対策1：出力するときにエスケープする',
      blocks: [
        p(
          '根本的な対策は、利用者の入力をHTMLに埋め込むときに、HTMLとして特別な意味を持つ文字を、文字そのものとして表示される形に置き換える（エスケープする）ことです。ブラウザは置き換えた文字をタグとして解釈せず、そのまま表示します。',
        ),
        p(
          'エスケープは「入力を受け取るとき」ではなく、「出力する場所に合わせて、出力するとき」に行います。HTMLの本文、属性の値、JavaScriptの中、URLの中では、必要な処理が違うからです。',
        ),
        fig(
          layers(
            ['投稿された文字列', [cell('l7', '<script>alert(1)</script>', undefined, { w: 4 })]],
            ['エスケープしてから埋め込んだHTML', [cell('sec', '&lt;script&gt;alert(1)&lt;/script&gt;', undefined, { w: 4, add: true })]],
          ),
          '特別な意味を持つ文字を置き換えれば、ただの文字として表示される',
        ),
        table(['文字', '置き換えた形'], ['<', '&lt;'], ['>', '&gt;'], ['&', '&amp;'], ['"', '&quot;'], ["'", '&#39;']),
      ],
      see: { mode: 'defense', step: 3, label: '出力するときにエスケープする' },
    },
    {
      id: 'csp',
      title: '対策2：動いても被害を抑える',
      blocks: [
        p('エスケープの漏れに備えて、被害を抑える対策も重ねます。セッションIDのCookieに HttpOnly 属性を付ければ、スクリプトからCookieを読めません。'),
        p(
          'CSP（Content Security Policy）は、「このページで実行してよいスクリプトは、自分のサイトのファイルだけ」といったルールをブラウザに伝えるHTTPヘッダです。ページに紛れ込んだスクリプトや、外部への送信を止められます。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者のサーバ', 'server', { attacker: true }), board, victim],
            [
              m('bbs', 'v', 'スクリプトが紛れ込んだHTML ＋ CSPヘッダ', 'attack'),
              mAdd('v', 'v', 'CSP：許可していないスクリプトは実行しない', 'defense'),
              mAdd('v', 'v', 'HttpOnly：CookieはJSから読めない', 'defense'),
              mAdd('v', 'x', 'セッションIDの送信は起きない', 'blocked'),
            ],
          ),
          'CSPとHttpOnlyで、エスケープ漏れの被害を抑える',
        ),
        note('このサイトも、インラインのスクリプトを禁止するCSPを設定しています。'),
      ],
      see: {
        mode: 'defense',
        step: 4,
        label: '万一実行されても持ち出させない',
      },
    },
  ],
}

const browser = actor('b', 'ブラウザ', 'pc')
const app = actor('app', 'Webアプリ', 'server')
const db = actor('db', 'データベース', 'server')

export const sqli: Chapter = {
  id: 'sqli',
  part: 'web',
  title: 'SQLインジェクション',
  lead: '検索語をSQL文に文字列としてつなげると、入力の一部が命令として解釈されてしまいます。SQL文の組み立て方から攻撃の流れ、プレースホルダによる根本対策、そして重ねる対策までを積み上げます。',
  sections: [
    {
      id: 'app-db',
      title: 'Webアプリとデータベース',
      blocks: [
        p(
          '商品の検索のようなWebアプリは、利用者の検索語を使ってSQL文を組み立て、データベースに問い合わせます。データベースは条件に合う行を返し、Webアプリはそれを画面に表示します。',
        ),
        fig(
          seq(
            [browser, app, db],
            [
              m('b', 'app', '検索語「りんご」'),
              mAdd('app', 'db', "SELECT … WHERE name = 'りんご'"),
              m('db', 'app', '条件に合う行'),
              m('app', 'b', '検索結果の画面'),
            ],
          ),
          'Webアプリは、入力を使ってSQL文を組み立てる',
        ),
      ],
      see: { mode: 'normal', step: 2, label: 'SQL文を組み立てて問い合わせる' },
    },
    {
      id: 'concat',
      title: '文字列をつなげて組み立てる危険',
      blocks: [
        p(
          "SQL文の決まった部分と入力を、文字列としてつなげて組み立てると、入力に「'」（文字列の終わりを表す記号）が含まれたとき、そこから先がSQLの命令として解釈されます。",
        ),
        fig(
          layers(
            [
              '想定した入力',
              [
                cell('l7', "SELECT * FROM items WHERE name = '", undefined, {
                  w: 3,
                }),
                cell('l4', 'りんご', '値', { w: 1 }),
                cell('l7', "'", undefined, { w: 0.3 }),
              ],
            ],
            [
              '攻撃者の入力',
              [
                cell('l7', "SELECT * FROM items WHERE name = '", undefined, {
                  w: 3,
                }),
                cell('sec', "' UNION SELECT … FROM members --", '命令として解釈される', { w: 3, add: true }),
              ],
            ],
          ),
          '入力の一部が、SQL文の構造を変えてしまう',
        ),
      ],
      see: { mode: 'attack', step: 4, label: 'SQL文の構造が変わる' },
    },
    {
      id: 'attack',
      title: '攻撃の流れ',
      blocks: [
        p(
          "攻撃者は、まず「'」を1文字だけ送り、SQLのエラーが画面に出るかを確かめます。エラーが出れば、入力がそのままSQL文に入っていると分かります。エラーの内容から、表の名前や列の数の手がかりも得られます。",
        ),
        p(
          '次に、UNION句などで別の表（会員の表）を読み出す命令を混ぜます。データベースは命令どおりに会員の情報を返し、それが検索結果として画面に表示されます。',
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true, add: true }), app, db],
            [
              mAdd('x', 'app', "' を1文字だけ送る", 'attack'),
              mAdd('app', 'x', 'SQLのエラーがそのまま表示される', 'attack'),
              mAdd('x', 'app', "' UNION SELECT … FROM members --", 'attack'),
              mAdd('app', 'db', '構造が変わったSQL文', 'attack'),
              mAdd('db', 'app', '会員の表が全件返る', 'attack'),
              mAdd('app', 'x', '会員の情報が画面に出る', 'attack'),
            ],
          ),
          'エラーで手がかりを得て、別の表を読み出す',
        ),
      ],
      see: { mode: 'attack', step: 3, label: '別の表を読み出す命令を混ぜる' },
    },
    {
      id: 'placeholder',
      title: '根本対策：プレースホルダ',
      blocks: [
        p(
          "プレースホルダ（バインド変数）を使うと、Webアプリは「SQL文の型（WHERE name = ?）」と「値」を分けてデータベースに渡します。データベースは、値を最後まで「値」としてだけ扱うので、入力に「'」が含まれていても命令にはなりません。",
        ),
        fig(
          seq(
            [actor('x', '攻撃者', 'laptop', { attacker: true }), app, db],
            [
              m('x', 'app', "' UNION SELECT … --", 'attack'),
              mAdd('app', 'db', 'SQL文の型：WHERE name = ?', 'defense'),
              mAdd('app', 'db', "値：' UNION SELECT … --（ただの文字列）", 'defense'),
              mAdd('db', 'app', 'その名前の商品はない（0件）', 'defense'),
            ],
          ),
          'SQL文の型と値を分けて渡せば、入力は命令にならない',
        ),
        note(
          "入力値の「'」を手作業でエスケープする方法もありますが、漏れやすく、データベースの種類によって必要な処理も違います。プレースホルダが第一の対策です。",
        ),
      ],
      see: { mode: 'defense', step: 3, label: '入力値を「値」としてだけ渡す' },
    },
    {
      id: 'layers',
      title: '対策を重ねる',
      blocks: [
        p(
          '根本対策に加えて、被害を小さくする対策を重ねます（多層防御）。WAFは典型的な攻撃の通信を止めますが、書き方を変えるとすり抜けられることがあるので、プレースホルダの代わりにはなりません。',
        ),
        fig(
          map(
            4,
            1,
            [
              node('x', '攻撃者', 'laptop', 0, 0, { attacker: true }),
              node('waf', 'WAF', 'fw', 1, 0, { add: true }),
              node('app', 'Webアプリ', 'server', 2, 0),
              node('db', 'データベース', 'server', 3, 0),
            ],
            [
              link('x', 'waf', {
                arrow: true,
                tone: 'attack',
                label: '攻撃の通信',
              }),
              link('waf', 'app', {
                arrow: true,
                tone: 'defense',
                label: '典型的な攻撃を止める',
                add: true,
              }),
              link('app', 'db', {
                arrow: true,
                tone: 'defense',
                label: '最小権限のアカウント',
                add: true,
              }),
            ],
          ),
          'WAF、プレースホルダ、データベースの最小権限を重ねる',
        ),
        table(
          ['対策', '役割', '注意'],
          ['プレースホルダ', '入力を命令にさせない（根本対策）', 'すべてのSQL文で使う'],
          ['エラーの内容を画面に出さない', '攻撃の手がかりを与えない', 'ログには詳しく残す'],
          ['WAF', '典型的な攻撃の通信を止める', 'すり抜けがある。根本対策の代わりにならない'],
          ['DBアカウントの最小権限', '読める表・できる操作を絞り、被害を小さくする', 'アプリに必要な権限だけにする'],
          ['パスワードのソルト付きハッシュ', '漏えいしても、元のパスワードを分かりにくくする', 'ストレッチングと組み合わせる'],
        ),
        note(
          '漏えいが分かったら、何が読み出されたかをログから確かめ、個人情報保護委員会への報告と本人への通知を検討します。流れは、図解の「事後対応」で確かめられます。',
        ),
      ],
      see: { mode: 'defense', step: 1, label: 'WAFが典型的な攻撃を止める' },
    },
  ],
}
