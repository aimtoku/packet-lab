/** 表示モード：正常な通信、攻撃、対策 */
export type Mode = 'normal' | 'attack' | 'defense'

/**
 * ステップの種類。矢印の色と意味が決まる。
 * - normal：正常な通信
 * - attack：攻撃
 * - blocked：対策によって止められた攻撃
 * - defense：対策が働いている通信
 * - discarded：届いたが捨てられた通信
 */
export type StepKind = 'normal' | 'attack' | 'blocked' | 'defense' | 'discarded'

/** 構成図に描く機器の種類 */
export type DeviceType = 'server' | 'pc' | 'laptop' | 'switch' | 'fw' | 'ap' | 'cloud'

/** 構成図上の機器の配置場所 */
export type NodeId =
  | 'web'
  | 'mail'
  | 'adns'
  | 'dsw'
  | 'fw'
  | 'sw'
  | 'pc'
  | 'cache'
  | 'inet'
  | 'ext1'
  | 'ext2'
  | 'lan2'
  | 'laptop'
  | 'ap'
  | 'fakeap'

/** シナリオで使うときだけ表示する機器 */
export type OptionalNodeId = 'ext1' | 'ext2' | 'lan2'

export interface Actor<A extends string> {
  id: A
  name: string
  sub: string
  attacker?: boolean
}

export interface Step<A extends string> {
  from: A
  to: A
  kind: StepKind
  /** 矢印に添える短いラベル */
  label: string
  title: string
  /** パケットの主要フィールド [名前, 値] */
  fields: readonly (readonly [string, string])[]
  note: string
  /** 支援士試験で押さえたい点 */
  point?: string
}

export interface ScenarioTopology<A extends string> {
  /** 登場人物を、構成図のどの機器に置くか */
  map: Record<A, NodeId>
  /** 外出先（公衆Wi-Fi）のエリアを表示するか */
  mobile?: boolean
  /** シナリオごとに置く機器（インターネット側の ext1・ext2、社内LANの lan2）の種類と名前 */
  devices?: Partial<Record<OptionalNodeId, { type: DeviceType; name: string; sub: string }>>
  /** 既定の機器名を、このシナリオ用に書き換える */
  labels?: Partial<Record<NodeId, readonly [string, string]>>
  /** このシナリオでは表示しない機器 */
  hidden?: readonly NodeId[]
  /** 対策モードで、対策を実施する機器 */
  shields: readonly NodeId[]
}

export interface Scenario<A extends string = string> {
  id: string
  name: string
  threat: string
  actors: readonly Actor<A>[]
  summary: Record<Mode, string>
  steps: Record<Mode, readonly Step<A>[]>
  points: readonly string[]
  topology: ScenarioTopology<A>
}

/**
 * シナリオを定義する。登場人物（actors）の id だけが有効な値になるので、
 * ステップの from / to や topology.map に存在しない id を書くと型エラーになる。
 */
export function defineScenario<A extends string>(
  scenario: Omit<Scenario<NoInfer<A>>, 'actors'> & { actors: readonly Actor<A>[] },
): Scenario<A> {
  return scenario
}
