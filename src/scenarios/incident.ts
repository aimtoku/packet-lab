import { PHASE_LABEL, type Actor, type Phase, type StateChange, type StateTable } from '../types'

/**
 * 事後対応（インシデント対応）で共通に使う部品。
 * 攻撃が成功してしまったあと、社内のCSIRTが「どの機器で何をするか」を、
 * 検知 → トリアージ → 封じ込め → 証拠保全 → 根絶・復旧 → 報告 → 再発防止 の順に追う。
 */

/** 社内のCSIRT。事後対応のときだけ登場し、構成図では社内LANの席（soc）に置く */
export const CSIRT: Actor<'csirt'> = { id: 'csirt', name: 'CSIRT', sub: '社内の対応チーム', onlyIn: ['incident'] }

/** 対応の記録。段階ごとに、何を判断し、何をしたかを書き残す */
export const IR_TABLE: StateTable = { id: 'ir', title: 'インシデント対応の記録', columns: ['段階', '判断したこと・したこと'], modes: ['incident'] }

/** 対応の記録に1行書く */
export const ir = (phase: Phase, value: string, at?: StateChange['at']): StateChange => ({
  table: 'ir',
  key: PHASE_LABEL[phase],
  value,
  ...(at ? { at } : {}),
})
