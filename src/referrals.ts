// ─── Referral / Invite System ────────────────────────────────────────────────

export interface ReferralEntry {
  userId:   string;
  name:     string;
  level:    number;
  passiveHr: number;   // friend's /hr passive income (used for 10% kickback)
  joinedAt: number;    // timestamp ms
  premium:  boolean;   // joined via Telegram Premium invite
}

export interface ReferralState {
  myUserId:        string;
  referredBy:      string | null;  // userId who referred us (from ?ref= param)
  joinBonusClaimed: boolean;        // whether we've claimed our own join bonus
  referrals:       ReferralEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const REFERRAL_KEY    = "tap_referrals_v1";
export const REGULAR_BONUS   = 25_000;
export const PREMIUM_BONUS   = 75_000;
export const KICKBACK_RATE   = 0.10;   // 10% of each friend's /hr
export const MAX_INVITES      = 20;    // cap total referrals

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NAMES   = ["Jordan", "Taylor", "Casey", "River", "Quinn", "Blake", "Morgan", "Avery", "Skyler", "Drew"];
const MOCK_HRS     = [900, 1800, 2100, 3600, 4800, 7200, 10000, 12000];

const INITIAL_MOCK_REFERRALS: ReferralEntry[] = [
  { userId: "mock_alex",  name: "Alex",  level: 3, passiveHr: 4800, joinedAt: Date.now() - 86_400_000 * 2, premium: false },
  { userId: "mock_sarah", name: "Sarah", level: 1, passiveHr: 900,  joinedAt: Date.now() - 86_400_000 * 5, premium: true  },
  { userId: "mock_mike",  name: "Mike",  level: 2, passiveHr: 2100, joinedAt: Date.now() - 86_400_000 * 1, premium: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateUserId(): string {
  return "u" + Math.random().toString(36).slice(2, 9);
}

/** Returns a shareable URL for the current page with ?ref=<userId>. */
export function getReferralLink(userId: string): string {
  if (typeof window === "undefined") return `https://pike.replit.dev/tap-to-earn/?ref=${userId}`;
  const base = window.location.href.split("?")[0];
  return `${base}?ref=${userId}`;
}

/** Reads the `?ref=` query param from the current URL, or null. */
export function parseRefParam(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("ref");
}

/** Sum 10% of every referred friend's hourly passive income. */
export function calcKickbackHr(referrals: ReferralEntry[]): number {
  return referrals.reduce((sum, r) => sum + r.passiveHr * KICKBACK_RATE, 0);
}

export function formatTimeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Creates a fresh referral state with mock pre-populated friends. */
export function initReferralState(): ReferralState {
  return {
    myUserId:        generateUserId(),
    referredBy:      null,
    joinBonusClaimed: false,
    referrals:       [...INITIAL_MOCK_REFERRALS],
  };
}

/** Creates a new mock invitee entry. */
export function makeMockInvitee(premium: boolean): ReferralEntry {
  const name      = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const passiveHr = MOCK_HRS[Math.floor(Math.random() * MOCK_HRS.length)];
  const level     = Math.floor(Math.random() * 4) + 1;
  return {
    userId:   generateUserId(),
    name,
    level,
    passiveHr,
    joinedAt: Date.now(),
    premium,
  };
}
