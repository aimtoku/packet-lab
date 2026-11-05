import type { Scenario } from "../types";
import { apt } from "./apt";
import { arp } from "./arp";
import { dnshttps, fwdmz, ipport, packet, tcpudp } from "./basics";
import { ddos } from "./ddos";
import { dns } from "./dns";
import { mail } from "./mail";
import { sig } from "./sig";
import { sqli } from "./sqli";
import { sso } from "./sso";
import { storage } from "./storage";
import { supply } from "./supply";
import { tls } from "./tls";
import { vpn } from "./vpn";
import { web } from "./web";
import { wlan } from "./wlan";
import { xss } from "./xss";

/** 表示する順番どおりに並べる */
export const scenarios: readonly Scenario[] = [
  packet,
  ipport,
  tcpudp,
  dnshttps,
  fwdmz,
  sig,
  dns,
  tls,
  mail,
  web,
  xss,
  sqli,
  sso,
  arp,
  wlan,
  apt,
  ddos,
  vpn,
  storage,
  supply,
];

export function findScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
