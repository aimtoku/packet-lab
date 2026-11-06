import { termIdsIn } from '../glossary/match'
import { audit } from './audit'
import { cloud } from './cloud'
import { cryptoops } from './cryptoops'
import { csirt } from './csirt'
import { law } from './law'
import { malware } from './malware'
import { policy } from './policy'
import { risk } from './risk'
import { securedev } from './securedev'
import type { Topic, TopicBlock } from './types'
import { vuln } from './vuln'
import { zerotrust } from './zerotrust'

/** 解説ページ。表示する順番どおりに並べる */
export const TOPICS: readonly Topic[] = [risk, policy, csirt, vuln, malware, securedev, cryptoops, zerotrust, cloud, law, audit]

export function findTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id)
}

/** 本文のかたまりに含まれる文章 */
export function blockText(block: TopicBlock): string[] {
  switch (block.kind) {
    case 'p':
    case 'note':
      return [block.text]
    case 'list':
      return [...block.items]
    case 'steps':
      return block.items.flatMap((i) => [i.title, i.text])
    case 'table':
      return [...block.head, ...block.rows.flat()]
  }
}

interface TopicIndex {
  /** ページに出てくる用語（出てくる順） */
  terms: string[]
  /** 用語が最初に出てくる節 */
  sections: Map<string, string>
}

function buildIndex(topic: Topic): TopicIndex {
  const terms: string[] = []
  const sections = new Map<string, string>()
  const add = (text: string, section?: string) => {
    for (const id of termIdsIn(text)) {
      if (!terms.includes(id)) terms.push(id)
      if (section && !sections.has(id)) sections.set(id, section)
    }
  }
  add([topic.lead, ...topic.goals].join('\n'))
  for (const s of topic.sections) add([s.title, ...s.blocks.flatMap(blockText)].join('\n'), s.id)
  add(topic.cues.flatMap((c) => [c.cue, c.think]).join('\n'))
  return { terms, sections }
}

const INDEX = new Map(TOPICS.map((t) => [t.id, buildIndex(t)]))

/** 解説ページに出てくる用語 */
export function topicTerms(topicId: string): readonly string[] {
  return INDEX.get(topicId)?.terms ?? []
}

/** 用語が出てくる解説ページと、最初に出てくる節 */
export function topicsMentioning(termId: string): { topic: Topic; section: string | undefined }[] {
  return TOPICS.filter((t) => INDEX.get(t.id)?.terms.includes(termId)).map((topic) => ({
    topic,
    section: INDEX.get(topic.id)?.sections.get(termId),
  }))
}

/** シナリオに関連する解説ページ */
export function topicsForScenario(scenarioId: string): Topic[] {
  return TOPICS.filter((t) => t.related.includes(scenarioId))
}

/** 解説ページのURL（節を指定すると、その節へ移動する） */
export const topicPath = (topicId: string, section?: string) => `/topics/${topicId}${section ? `#${section}` : ''}`
