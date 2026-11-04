import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// フォントは外部CDNではなく、このサイトから配信する（CSPを 'self' だけに絞るため）
// 日本語の字形は細かく分割されていて、ページで使う文字を含むファイルだけがダウンロードされる
import '@fontsource/ibm-plex-sans-jp/400.css'
import '@fontsource/ibm-plex-sans-jp/700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import './styles.css'

import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('#root が見つかりません')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
