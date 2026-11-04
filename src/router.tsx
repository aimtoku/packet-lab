import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/**
 * 小さなルーター。ページは「/」と「/シナリオID」だけなので、ライブラリは使わない
 * （依存パッケージを増やさないため）。
 */
const listeners = new Set<() => void>()

export function navigate(to: string) {
  if (to === window.location.pathname) return
  window.history.pushState(null, '', to)
  window.scrollTo({ top: 0 })
  listeners.forEach((fn) => fn())
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  useEffect(() => {
    const update = () => setPathname(window.location.pathname)
    listeners.add(update)
    window.addEventListener('popstate', update)
    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])
  return pathname
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** サイト内リンク。新しいタブで開く操作（Ctrl+クリックなど）は、ブラウザに任せる */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handleClick} {...rest} />
}
