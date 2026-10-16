// ─── Market Event System ──────────────────────────────────────────────────────

export type MarketEventType = "BULL_RUN" | "MARKET_CRASH" | "GAS_FEE_SPIKE";

export interface MarketEventConfig {
  type: MarketEventType;
  label: string;
  emoji: string;
  tagline: string;
  effectLine: string;
  hex: string;
  rgb: string;
  passiveMult: number;   // multiplier on /hr passive income
  tapMult: number;       // multiplier on tap value
  upgradeCostMult: number; // multiplier on upgrade costs
  missionRewardMult: number; // multiplier on mission reward claims
}

export const EVENT_CONFIGS: Record<MarketEventType, MarketEventConfig> = {
  BULL_RUN: {
    type: "BULL_RUN",
    label: "BULL RUN",
    emoji: "🚀",
    tagline: "Markets are surging — passive income DOUBLED!",
    effectLine: "Passive income ×2",
    hex: "#00ff88",
    rgb: "0,255,136",
    passiveMult: 2,
    tapMult: 1,
    upgradeCostMult: 1,
    missionRewardMult: 1,
  },
  MARKET_CRASH: {
    type: "MARKET_CRASH",
    label: "MARKET CRASH",
    emoji: "📉",
    tagline: "Panic selling — passive halved, but tap value ×5!",
    effectLine: "Passive ×0.5 · Tap ×5",
    hex: "#ef4444",
    rgb: "239,68,68",
    passiveMult: 0.5,
    tapMult: 5,
    upgradeCostMult: 1,
    missionRewardMult: 1,
  },
  GAS_FEE_SPIKE: {
    type: "GAS_FEE_SPIKE",
    label: "GAS FEE SPIKE",
    emoji: "⛽",
    tagline: "Network congested — upgrades cost more, missions reward 2×!",
    effectLine: "Upgrades +20% · Missions ×2",
    hex: "#f59e0b",
    rgb: "245,158,11",
    passiveMult: 1,
    tapMult: 1,
    upgradeCostMult: 1.2,
    missionRewardMult: 2,
  },
};

export const ALL_EVENTS: MarketEventType[] = ["BULL_RUN", "MARKET_CRASH", "GAS_FEE_SPIKE"];

export const EVENT_COOLDOWN_SECS = 20 * 60; // 1200s between events
export const EVENT_DURATION_SECS = 3 * 60;  // 180s event duration

export function randomEvent(): MarketEventType {
  return ALL_EVENTS[Math.floor(Math.random() * ALL_EVENTS.length)];
}

export function fmtCountdown(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
