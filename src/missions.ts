// ─── Mission System ───────────────────────────────────────────────────────────

export type MissionType = "taps" | "upgradeSpend" | "passive" | "balance";

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  icon: string;              // lucide icon name string (used as key lookup in the tab)
  type: MissionType;
  goal: number;              // target value
  reward: number;            // coins awarded on claim
}

export interface MissionsState {
  date: string;              // "YYYY-MM-DD" — resets every day
  tapsToday: number;
  upgradeSpendToday: number;
  passiveEarnedToday: number;
  balancePeak: number;       // highest balance reached today
  claimedIds: string[];
  comboRevealedIds: string[]; // which of today's secret combo items the player has upgraded
  comboClaimed: boolean;      // true once the +1M reward has been awarded
}

// ─── Daily Secret Combo ───────────────────────────────────────────────────────

/** All upgrade IDs that can appear in the daily combo. Must stay in sync with UPGRADES in App.tsx. */
export const COMBO_POOL = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"] as const;

/** Human-readable names for combo slot labels (mirrors UPGRADES in App.tsx). */
export const UPGRADE_LABELS: Record<string, string> = {
  u1: "Mining Rig",
  u2: "Trading Bot",
  u3: "Crypto Wallet",
  u4: "DeFi Pool",
  u5: "NFT Studio",
  u6: "DAO Vote",
  u7: "Yield Farm",
  u8: "Quantum Node",
};

/**
 * Derives today's secret combo (3 upgrade IDs) from the date string using a
 * simple LCG seed so every player gets the same combo on the same day.
 */
export function getDailyCombo(dateStr: string): string[] {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed * 31) + dateStr.charCodeAt(i)) >>> 0;
  }
  const pool = [...COMBO_POOL] as string[];
  const result: string[] = [];
  for (let i = 0; i < 3; i++) {
    seed = ((seed * 1_664_525) + 1_013_904_223) >>> 0;
    const idx = seed % pool.length;
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export const MISSIONS: MissionDef[] = [
  {
    id: "m1",
    title: "First Steps",
    description: "Tap the coin 25 times today",
    icon: "Zap",
    type: "taps",
    goal: 25,
    reward: 50,
  },
  {
    id: "m2",
    title: "Tap Marathon",
    description: "Tap the coin 100 times today",
    icon: "MousePointerClick",
    type: "taps",
    goal: 100,
    reward: 300,
  },
  {
    id: "m3",
    title: "Tap Legend",
    description: "Tap the coin 500 times today",
    icon: "Flame",
    type: "taps",
    goal: 500,
    reward: 2000,
  },
  {
    id: "m4",
    title: "Small Investment",
    description: "Spend 100 coins on upgrades",
    icon: "ShoppingCart",
    type: "upgradeSpend",
    goal: 100,
    reward: 150,
  },
  {
    id: "m5",
    title: "Portfolio Builder",
    description: "Spend 2500 coins on upgrades",
    icon: "Briefcase",
    type: "upgradeSpend",
    goal: 2500,
    reward: 5000,
  },
  {
    id: "m6",
    title: "Passive Earner",
    description: "Earn 200 coins from passive income",
    icon: "TrendingUp",
    type: "passive",
    goal: 200,
    reward: 800,
  },
  {
    id: "m7",
    title: "Crypto Hoarder",
    description: "Earn 2000 coins from passive income",
    icon: "PiggyBank",
    type: "passive",
    goal: 2000,
    reward: 6000,
  },
  {
    id: "m8",
    title: "High Roller",
    description: "Reach a balance of 10,000 coins",
    icon: "Trophy",
    type: "balance",
    goal: 10000,
    reward: 3000,
  },
];

export const INITIAL_MISSIONS_STATE: MissionsState = {
  date: "",
  tapsToday: 0,
  upgradeSpendToday: 0,
  passiveEarnedToday: 0,
  balancePeak: 0,
  claimedIds: [],
  comboRevealedIds: [],
  comboClaimed: false,
};

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMissionProgress(mission: MissionDef, ms: MissionsState): number {
  switch (mission.type) {
    case "taps":         return ms.tapsToday;
    case "upgradeSpend": return ms.upgradeSpendToday;
    case "passive":      return ms.passiveEarnedToday;
    case "balance":      return ms.balancePeak;
  }
}

export function isMissionComplete(mission: MissionDef, ms: MissionsState): boolean {
  return getMissionProgress(mission, ms) >= mission.goal;
}

export function isMissionClaimed(mission: MissionDef, ms: MissionsState): boolean {
  return ms.claimedIds.includes(mission.id);
}

export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
