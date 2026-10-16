// ─── Daily Login Rewards ──────────────────────────────────────────────────────
// Streak of 7 days; resets if user misses > 48 h between claims.

const STORAGE_KEY = "tap_daily_rewards_v1";
const MS_24H = 24 * 60 * 60 * 1000;
const MS_48H = 48 * 60 * 60 * 1000;

export const DAILY_REWARDS = [500, 1_000, 2_000, 3_500, 5_000, 7_500, 10_000] as const;

export interface DailyRewardInfo {
  currentDay:  number;   // 1-7 — which day's reward is active
  canClaim:    boolean;  // true = reward available right now
  claimed:     boolean;  // true = already claimed in the current 24-h window
}

interface Persisted {
  streak:      number;   // last successfully-claimed day (1-7)
  lastClaimed: number;   // ms timestamp; 0 = never
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch { /* ignore */ }
  return { streak: 0, lastClaimed: 0 };
}

function save(p: Persisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function getDailyRewardInfo(): DailyRewardInfo {
  const { streak, lastClaimed } = load();
  const now = Date.now();

  // First-ever visit
  if (lastClaimed === 0) {
    return { currentDay: 1, canClaim: true, claimed: false };
  }

  const elapsed = now - lastClaimed;

  if (elapsed < MS_24H) {
    // Same 24-h window — already claimed
    return { currentDay: streak, canClaim: false, claimed: true };
  }

  if (elapsed < MS_48H) {
    // Next day, streak continues (wraps back to 1 after day 7)
    const next = streak >= 7 ? 1 : streak + 1;
    return { currentDay: next, canClaim: true, claimed: false };
  }

  // Missed a day — streak resets
  return { currentDay: 1, canClaim: true, claimed: false };
}

/** Persist the claim and return the coin reward for the current day. */
export function claimDailyReward(): number {
  const info = getDailyRewardInfo();
  if (!info.canClaim) throw new Error("Already claimed");
  save({ streak: info.currentDay, lastClaimed: Date.now() });
  return DAILY_REWARDS[info.currentDay - 1];
}
