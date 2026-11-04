import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../playback/speed'
import { pointAlong, type Point } from '../topology/layout'

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * パケット（円）を、経路の上の今の位置から target（始点からの距離）まで動かす。
 * resetKey が変わったら（別のステップになったら）始点からやり直す。
 * 着いたら onArrive(arriveKey) を呼ぶ。後ろへ戻るときと、動きを減らす設定のときは、移動せずに置く。
 */
export function usePacketTravel(
  points: readonly Point[],
  target: number,
  travelMs: number,
  resetKey: string,
  arriveKey: string,
  onArrive?: (key: string) => void,
) {
  const ref = useRef<SVGCircleElement>(null)
  const pointsRef = useRef(points)
  pointsRef.current = points
  const onArriveRef = useRef(onArrive)
  onArriveRef.current = onArrive
  const position = useRef(0)
  const lastReset = useRef<string | null>(null)

  useEffect(() => {
    const circle = ref.current
    const pts = pointsRef.current
    if (lastReset.current !== resetKey) {
      lastReset.current = resetKey
      position.current = 0
    }
    const done = () => onArriveRef.current?.(arriveKey)
    if (!circle || pts.length < 2) {
      done()
      return
    }
    const place = (distance: number) => {
      const [x, y] = pointAlong(pts, distance)
      circle.setAttribute('cx', String(x))
      circle.setAttribute('cy', String(y))
      position.current = distance
    }
    const from = position.current
    if (prefersReducedMotion() || travelMs <= 0 || target <= from + 0.5) {
      place(target)
      done()
      return
    }
    const start = performance.now()
    let frame = 0
    place(from)
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / travelMs)
      place(from + (target - from) * easeInOut(t))
      if (t < 1) frame = requestAnimationFrame(tick)
      else done()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [resetKey, arriveKey, target, travelMs])

  return ref
}
