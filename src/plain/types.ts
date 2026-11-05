import type { Mode } from '../types'

/** 「ひとことで」の説明：モードごとに、ステップの順に並べる */
export type PlainTexts = Readonly<Record<Mode, readonly string[]>>
