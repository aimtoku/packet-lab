import { useState, type ReactNode } from 'react'

/** 「詳しく見る」の項目 */
export type MoreId = 'packet' | 'state' | 'sequence' | 'points'

const STORAGE_KEY = 'packet-lab:more'

function loadOpen(): Set<MoreId> {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown
    return new Set(Array.isArray(saved) ? (saved.filter((v) => typeof v === 'string') as MoreId[]) : [])
  } catch {
    return new Set()
  }
}

/** 開いている項目を覚えておく（ステップやシナリオを移っても、開いたまま） */
export function useMoreOpen() {
  const [open, setOpen] = useState<Set<MoreId>>(loadOpen)
  const set = (id: MoreId, value: boolean) =>
    setOpen((prev) => {
      if (prev.has(id) === value) return prev
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // 保存できない環境（プライベートブラウズなど）では、このページを開いている間だけ覚える
      }
      return next
    })
  return [open, set] as const
}

interface Props {
  id: MoreId
  title: string
  /** 見出しの横に添える一言（「このステップで変化あり」など） */
  badge?: string
  open: boolean
  onToggle: (id: MoreId, open: boolean) => void
  children: ReactNode
}

/** 普段は閉じておき、必要なときに開く詳しい情報 */
export function More({ id, title, badge, open, onToggle, children }: Props) {
  return (
    <details className={`more more-${id}`} open={open} onToggle={(e) => onToggle(id, e.currentTarget.open)}>
      <summary>
        <span className="more-title">{title}</span>
        {badge && <span className="more-badge">{badge}</span>}
      </summary>
      <div className="more-body">{children}</div>
    </details>
  )
}
