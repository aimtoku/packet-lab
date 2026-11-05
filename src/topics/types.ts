import type { ChoiceQuestion, ExamCue, WrittenQuestion } from '../learning/types'

/** 解説ページの本文のかたまり */
export type TopicBlock =
  /** 段落 */
  | { kind: 'p'; text: string }
  /** 箇条書き */
  | { kind: 'list'; items: readonly string[] }
  /** 順番のある手順（流れ） */
  | { kind: 'steps'; items: readonly { title: string; text: string }[] }
  /** 表。最初の列は行の見出しとして扱う */
  | { kind: 'table'; head: readonly string[]; rows: readonly (readonly string[])[] }
  /** 補足・注意 */
  | { kind: 'note'; text: string }

export interface TopicSection {
  /** ページ内リンクに使う（英小文字とハイフン） */
  id: string
  title: string
  blocks: readonly TopicBlock[]
}

/** 参考にした公的な資料など */
export interface TopicSource {
  title: string
  url: string
}

/** 解説ページ：シナリオ（通信の図解）にしにくい、管理・法令・体制の分野 */
export interface Topic {
  id: string
  name: string
  /** トップページのカードと、ページの冒頭に出す一文 */
  lead: string
  goals: readonly string[]
  sections: readonly TopicSection[]
  cues: readonly ExamCue[]
  /** 関連するシナリオのID */
  related: readonly string[]
  quiz: {
    choices: readonly ChoiceQuestion[]
    written: readonly WrittenQuestion[]
  }
  /** 法令や組織など、変わりうる情報の時点（例：2026年11月時点） */
  asOf?: string
  sources?: readonly TopicSource[]
}
