import { useEffect, useRef, useState } from 'react'
import { pathLength, pointAlong, type Point } from '../topology/layout'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * パケット（円）を経路に沿って動かす。
 * key が変わるたびに最初から動かし直す。inset は終点の手前で止める距離（阻止された攻撃用）。
 * 動きを減らす設定の利用者には、アニメーションせずに到達後の状態を表示する。
 */
export function usePacketAnimation(points: readonly Point[], inset: number, key: string) {
  const ref = useRef<SVGCircleElement>(null)
  const pointsRef = useRef(points)
  pointsRef.current = points
  const [arrivedKey, setArrivedKey] = useState<string | null>(null)

  useEffect(() => {
    const circle = ref.current
    const pts = pointsRef.current
    if (!circle || pts.length < 2) {
      setArrivedKey(key)
      return
    }
    const total = pathLength(pts)
    const end = Math.max(0, total - inset)
    const place = (distance: number) => {
      const [x, y] = pointAlong(pts, distance)
      circle.setAttribute('cx', String(x))
      circle.setAttribute('cy', String(y))
    }
    setArrivedKey(null)
    if (prefersReducedMotion()) {
      place(end)
      setArrivedKey(key)
      return
    }
    const duration = Math.max(700, Math.min(1600, total * 5))
    const start = performance.now()
    let frame = 0
    place(0)
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      place(end * easeInOut(t))
      if (t < 1) frame = requestAnimationFrame(tick)
      else setArrivedKey(key)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [key, inset])

  return { ref, arrived: arrivedKey === key }
}
