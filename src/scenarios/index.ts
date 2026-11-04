import type { Scenario } from '../types'
import { dns } from './dns'
import { mail } from './mail'
import { tls } from './tls'
import { web } from './web'

/** 表示する順番どおりに並べる */
export const scenarios: readonly Scenario[] = [dns, tls, mail, web]

export function findScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id)
}
