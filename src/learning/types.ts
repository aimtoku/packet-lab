/** よくある誤解：誤った理解と、正しい理解 */
export interface Misconception {
  wrong: string
  right: string
}

/** 対策の比較表の1行 */
export interface CompareRow {
  /** 対策 */
  measure: string
  /** 防げること */
  stops: string
  /** 防げないこと・注意 */
  limits: string
  /** どこで行うか */
  where: string
}

/** 午後の問題文の手がかり：問題文にこう書かれていたら、こう考える */
export interface ExamCue {
  cue: string
  think: string
}

/** 学習の手引き */
export interface Guide {
  /** 学習目標（「〜を説明できる」） */
  goals: readonly string[]
  /** 前提となる知識 */
  prerequisites: readonly string[]
  misconceptions: readonly Misconception[]
  comparison: { title: string; rows: readonly CompareRow[] }
  cues: readonly ExamCue[]
}

/** 午前の形式（4択）の問題 */
export interface ChoiceQuestion {
  question: string
  /** 選択肢（ア・イ・ウ・エ） */
  choices: readonly [string, string, string, string]
  /** 正解の選択肢の番号（0〜3） */
  answer: 0 | 1 | 2 | 3
  explanation: string
}

/** 午後の形式（記述）の問題 */
export interface WrittenQuestion {
  question: string
  /** 字数の上限 */
  limit: number
  /** 解答例 */
  answer: string
  /** 採点のポイント（解答に含めたい要素） */
  keys: readonly string[]
  explanation: string
}

export interface Learning {
  guide: Guide
  quiz: {
    choices: readonly ChoiceQuestion[]
    written: readonly WrittenQuestion[]
  }
}
