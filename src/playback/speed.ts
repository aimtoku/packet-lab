export type Speed = 'slow' | 'normal' | 'fast'

/**
 * travel：機器から機器へ動く時間。
 * 機器に着いてから次へ進むまでの時間は、説明文の長さに合わせる（perChar × 文字数、最低 minDwell）。
 * 単位はミリ秒。
 */
export const SPEEDS: Record<Speed, { label: string; travel: number; perChar: number; minDwell: number }> = {
  slow: { label: 'ゆっくり', travel: 1500, perChar: 110, minDwell: 2600 },
  normal: { label: 'ふつう', travel: 900, perChar: 70, minDwell: 1600 },
  fast: { label: 'はやい', travel: 450, perChar: 35, minDwell: 800 },
}

export const SPEED_ORDER: readonly Speed[] = ['slow', 'normal', 'fast']

/** 説明文を読む時間 */
export function dwellFor(speed: Speed, text: string): number {
  const s = SPEEDS[speed]
  return Math.max(s.minDwell, text.length * s.perChar)
}

const KEY = 'packet-lab:speed'

/** 再生の速さは、このブラウザにだけ覚えておく（使えない環境では毎回「ゆっくり」） */
export function loadSpeed(): Speed {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === 'normal' || v === 'fast' ? v : 'slow'
  } catch {
    return 'slow'
  }
}

export function saveSpeed(speed: Speed) {
  try {
    window.localStorage.setItem(KEY, speed)
  } catch {
    // 保存できない環境では何もしない
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
