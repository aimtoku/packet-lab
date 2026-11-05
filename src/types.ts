/** 表示モード：正常な通信、攻撃、対策、事後対応（攻撃が成功したあとのインシデント対応） */
export type Mode = 'normal' | 'attack' | 'defense' | 'incident'

/**
 * ステップの種類。矢印の色と意味が決まる。
 * - normal：正常な通信
 * - attack：攻撃
 * - blocked：対策によって止められた攻撃
 * - defense：対策が働いている通信
 * - discarded：届いたが捨てられた通信
 * - response：インシデント対応（検知、封じ込め、証拠保全など）
 */
export type StepKind = 'normal' | 'attack' | 'blocked' | 'defense' | 'discarded' | 'response'

/** インシデント対応の段階 */
export type Phase = 'detect' | 'triage' | 'contain' | 'preserve' | 'recover' | 'report' | 'improve'

export const PHASES: readonly Phase[] = ['detect', 'triage', 'contain', 'preserve', 'recover', 'report', 'improve']

export const PHASE_LABEL: Record<Phase, string> = {
  detect: '検知',
  triage: 'トリアージ',
  contain: '封じ込め',
  preserve: '証拠保全',
  recover: '根絶・復旧',
  report: '報告',
  improve: '再発防止',
}

/** 構成図に描く機器の種類（team は機器ではなく、CSIRTなどの人の集まり） */
export type DeviceType = 'server' | 'pc' | 'laptop' | 'switch' | 'fw' | 'ap' | 'cloud' | 'team'

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
  | 'soc'

/** シナリオで使うときだけ表示する機器（soc はCSIRTの席。ケーブルではつながない） */
export type OptionalNodeId = 'ext1' | 'ext2' | 'lan2' | 'soc'

export interface Actor<A extends string> {
  id: A
  name: string
  sub: string
  attacker?: boolean
  /** このモードでだけ登場する（CSIRTは事後対応だけ） */
  onlyIn?: readonly Mode[]
}

/**
 * パケットの層。l2：Ethernet、tunnel：トンネルの外側のヘッダ（IPsec など）、l3：IP、l4：TCP・UDP、
 * sec：中身を暗号化する層（TLS など）、l7：中身（DNS、HTTPなど）
 */
export type Layer = 'l2' | 'tunnel' | 'l3' | 'l4' | 'sec' | 'l7'

/** トンネル（IPsec の ESP など）。元のパケットを暗号化して、新しいIPヘッダを付ける */
export interface Tunnel {
  /** トンネルのプロトコル（ESP など） */
  name: string
  /** 外側のIPヘッダの送信元と宛先。名前を省略すると、ステップの送信元・宛先の名前を使う */
  srcName?: string
  dstName?: string
  srcIp?: string
  dstIp?: string
  transport?: 'UDP'
  srcPort?: string
  dstPort?: string
}

/** パケットの見出し（層ごとの表示に使う） */
export interface Wire {
  /** 中身のプロトコル（DNS、HTTP、TLS など） */
  app: string
  /** トランスポート層。ARPのように使わないものは省略 */
  transport?: 'UDP' | 'TCP'
  srcPort?: string
  dstPort?: string
  /** IPアドレス。省略すると、送信元と宛先は機器の名前だけを表示する */
  srcIp?: string
  dstIp?: string
  /** IPヘッダの送信元・宛先の名前。省略すると、ステップの送信元・宛先の名前を使う（最終的な宛先が別のときに書く） */
  srcName?: string
  dstName?: string
  /** MACアドレス。同じLANの中の話で、注目するときだけ書く */
  srcMac?: string
  dstMac?: string
  /** IPを使わないプロトコル（ARPなど） */
  noIp?: boolean
  /** 中身を暗号化している層の名前（TLS など） */
  secure?: string
  /** トンネルで運ぶとき（IPsec VPN など） */
  tunnel?: Tunnel
  /** 特に注目する層 */
  focus?: readonly Layer[]
  /** 層の表示に添える一言 */
  remark?: string
}

/** 状態の変化の色分け */
export type Tone = 'normal' | 'attack' | 'defense'

/** 状態の表の、最初の行 [項目, 値] または [項目, 値, 色分け] */
export type StateRowInit = readonly [string, string] | readonly [string, string, Tone]

/** 機器の中の状態（ARPテーブル、DNSのキャッシュなど）の表 */
export interface StateTable {
  id: string
  title: string
  columns: readonly [string, string]
  /** この表を表示するモード。省略するとすべてのモード */
  modes?: readonly Mode[]
  /** モードごとの、最初の状態 */
  initial?: Partial<Record<Mode, readonly StateRowInit[]>>
}

/** ステップの結果として、状態の表の1行を書き換える（なければ追加する） */
export interface StateChange {
  table: string
  key: string
  value: string
  tone?: Tone
  /** パケットがこの機器に着いた時点で変わる。省略すると、ステップの最後（宛先に着いたとき） */
  at?: NodeId
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
  /** 送信元で何をするか（区切りの最初に表示） */
  send?: string
  /** 経由する機器で何が起きるか（既定の説明を上書き）。キーは構成図の機器 */
  via?: Partial<Record<NodeId, string>>
  /** 宛先で何が起きるか（区切りの最後に表示） */
  receive?: string
  /** 阻止されるステップで、パケットが止められる機器。省略すると宛先の手前 */
  blockedAt?: NodeId
  /** インシデント対応の段階（事後対応のステップに書く） */
  phase?: Phase
  /** パケットの見出し */
  wire?: Wire
  /** このステップで変わる状態 */
  changes?: readonly StateChange[]
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
  /** 事後対応（インシデント対応）で押さえる論点 */
  incidentPoints: readonly string[]
  topology: ScenarioTopology<A>
  /** 機器の中の状態の表 */
  states?: readonly StateTable[]
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
