// ビルド前後のセキュリティチェック。CIで毎回実行し、1つでも問題があれば失敗させる。
// 外部パッケージは使わない（このチェック自体が依存を増やさないように）。
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const errors = []
const fail = (message) => errors.push(message)

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

// 1. ソースコードに、XSSの原因になりやすい書き方がないか
const forbidden = [
  [/dangerouslySetInnerHTML/, 'dangerouslySetInnerHTML（エスケープされないHTMLの埋め込み）'],
  [/\.(innerHTML|outerHTML)\s*=/, 'innerHTML / outerHTML への代入'],
  [/insertAdjacentHTML/, 'insertAdjacentHTML'],
  [/document\.write/, 'document.write'],
  [/\beval\s*\(/, 'eval'],
  [/new\s+Function\s*\(/, 'new Function'],
]
for (const file of walk(join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f))) {
  const text = readFileSync(file, 'utf8')
  for (const [pattern, label] of forbidden) {
    if (pattern.test(text)) fail(`${relative(root, file)}: ${label} は使わない`)
  }
}

// 2. ビルド結果のHTMLに、インラインのスクリプトやスタイル、外部の読み込みがないか
const dist = join(root, 'dist')
if (!existsSync(dist)) {
  fail('dist がありません。先に pnpm run build を実行してください')
} else {
  const html = readFileSync(join(dist, 'index.html'), 'utf8')
  for (const tag of html.match(/<script\b[^>]*>/gi) ?? []) {
    if (!/\bsrc=/.test(tag)) fail(`index.html: インラインスクリプトがあります: ${tag}`)
  }
  if (/<style\b/i.test(html)) fail('index.html: <style> タグがあります')
  if (/\sstyle\s*=/i.test(html)) fail('index.html: style 属性があります')
  if (/\son[a-z]+\s*=/i.test(html)) fail('index.html: onclick などのイベント属性があります')
  for (const m of html.matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    if (/^(https?:)?\/\//i.test(m[1])) fail(`index.html: 外部から読み込んでいます: ${m[1]}`)
  }

  // 3. セキュリティヘッダ
  const headersPath = join(dist, '_headers')
  if (!existsSync(headersPath)) {
    fail('dist/_headers がありません')
  } else {
    const headers = readFileSync(headersPath, 'utf8')
    const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? ''
    if (!csp) fail('_headers: Content-Security-Policy がありません')
    if (/unsafe-inline|unsafe-eval/.test(csp)) fail("_headers: CSP に 'unsafe-inline' / 'unsafe-eval' が含まれています")
    if (!/script-src 'self'(;|$)/.test(csp)) fail("_headers: script-src は 'self' だけにします")
    if (!/frame-ancestors 'none'/.test(csp)) fail("_headers: frame-ancestors 'none' がありません")
    for (const name of ['Strict-Transport-Security', 'X-Content-Type-Options: nosniff', 'Referrer-Policy', 'Permissions-Policy']) {
      if (!headers.includes(name)) fail(`_headers: ${name} がありません`)
    }
  }

  // 4. security.txt（RFC 9116）
  const securityTxt = join(dist, '.well-known', 'security.txt')
  if (!existsSync(securityTxt)) {
    fail('dist/.well-known/security.txt がありません')
  } else {
    const text = readFileSync(securityTxt, 'utf8')
    if (!/^Contact:\s*\S+/m.test(text)) fail('security.txt: Contact がありません')
    const expires = text.match(/^Expires:\s*(\S+)/m)?.[1]
    const days = expires ? (Date.parse(expires) - Date.now()) / 86_400_000 : Number.NaN
    if (!(days > 0)) fail('security.txt: Expires が過ぎています（日付を更新してください）')
    else if (days > 366) fail('security.txt: Expires は1年以内にします')
  }

  // 5. ソースマップを公開しない
  const maps = walk(dist).filter((f) => f.endsWith('.map'))
  if (maps.length > 0) fail(`ソースマップが含まれています: ${maps.map((f) => relative(root, f)).join(', ')}`)
}

if (errors.length > 0) {
  console.error('セキュリティチェックで問題が見つかりました：')
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log('セキュリティチェック：問題なし')
