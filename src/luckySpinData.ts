// ─── Lucky Spin — data + localStorage ───────────────────────────────────────
// Completely independent from the Daily Login Rewards system.

export const SPIN_STORAGE_KEY = "tap_lucky_spin_v1";
const MS_24H = 24 * 60 * 60 * 1000;

// ─── Prize definition ────────────────────────────────────────────────────────

export type PrizeType = "coins" | "energy" | "nothing";
export type PrizeRarity = "common" | "rare" | "epic";

export interface SpinPrize {
  id:       string;
  label:    string;        // shown on the wheel segment
  popupMsg: string;        // shown in the result popup
  emoji:    string;
  color:    string;        // segment fill
  type:     PrizeType;
  value:    number;        // coin amount (0 for energy / nothing)
  rarity:   PrizeRarity;
}

// 8 segments – clockwise order, starting from 12-o'clock
export const SPIN_PRIZES: SpinPrize[] = [
  { id: "s1", label: "500",      popupMsg: "500 Coins",          emoji: "🪙", color: "#1f2d40", type: "coins",   value: 500,    rarity: "common" },
  { id: "s2", label: "2,500",    popupMsg: "2,500 Coins",        emoji: "💰", color: "#1a3a6b", type: "coins",   value: 2500,   rarity: "common" },
  { id: "s3", label: "⚡ Refill", popupMsg: "Full Energy Refill", emoji: "⚡", color: "#074e5e", type: "energy",  value: 0,      rarity: "rare"   },
  { id: "s4", label: "10,000",   popupMsg: "10,000 Coins",       emoji: "💎", color: "#3b0764", type: "coins",   value: 10_000, rarity: "rare"   },
  { id: "s5", label: "Try Again",popupMsg: "Better luck next time!", emoji: "😅", color: "#450a0a", type: "nothing",value: 0,   rarity: "common" },
  { id: "s6", label: "50,000",   popupMsg: "50,000 Coins! 🔥",   emoji: "🔥", color: "#78350f", type: "coins",   value: 50_000, rarity: "epic"   },
  { id: "s7", label: "1,000",    popupMsg: "1,000 Coins",        emoji: "🪙", color: "#1e3a5f", type: "coins",   value: 1_000,  rarity: "common" },
  { id: "s8", label: "5,000",    popupMsg: "5,000 Coins",        emoji: "✨", color: "#2e1065", type: "coins",   value: 5_000,  rarity: "rare"   },
];

// ─── Storage helpers ─────────────────────────────────────────────────────────

interface Persisted { lastSpin: number }

function load(): Persisted {
  try {
    const s = localStorage.getItem(SPIN_STORAGE_KEY);
    if (s) return JSON.parse(s) as Persisted;
  } catch { /* ignore */ }
  return { lastSpin: 0 };
}

export function getSpinInfo(): { canSpin: boolean; msUntilNext: number } {
  const { lastSpin } = load();
  const elapsed = Date.now() - lastSpin;
  if (lastSpin === 0 || elapsed >= MS_24H) return { canSpin: true, msUntilNext: 0 };
  return { canSpin: false, msUntilNext: MS_24H - elapsed };
}

export function recordSpin(): void {
  localStorage.setItem(SPIN_STORAGE_KEY, JSON.stringify({ lastSpin: Date.now() }));
}

// ─── Spin angle math ─────────────────────────────────────────────────────────
// The pointer sits at the top (12-o'clock = 0°). Segments are drawn clockwise
// starting from 0°. To land segment `targetIndex` under the pointer we need
// the wheel rotation to satisfy:
//   (targetIndex + 0.5) * SEG_DEG + rotation ≡ 0 (mod 360)
//   rotation ≡ 360 - (targetIndex + 0.5) * SEG_DEG  (mod 360)

const SEG_DEG = 360 / SPIN_PRIZES.length; // 45

export function calcSpinAngle(prevRotation: number, targetIndex: number): number {
  const targetCenter = (targetIndex + 0.5) * SEG_DEG;
  const targetWheel  = (360 - targetCenter % 360 + 360) % 360;
  const current      = ((prevRotation % 360) + 360) % 360;
  let   delta        = (targetWheel - current + 360) % 360;
  // Guarantee at least one full spin past the target
  if (delta < SEG_DEG) delta += 360;
  const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360; // 5-8 full rotations
  return prevRotation + delta + fullSpins;
}
