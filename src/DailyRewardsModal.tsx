import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, X } from "lucide-react";
import type { RankDef } from "./rankTypes";
import type { DailyRewardInfo } from "./dailyRewards";
import { DAILY_REWARDS } from "./dailyRewards";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtShort(n: number): string {
  return n >= 1_000 ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K` : String(n);
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Day card ────────────────────────────────────────────────────────────────

function DayCard({ day, reward, state, rgb, hex }: {
  day:    number;
  reward: number;
  state:  "past" | "current" | "future";
  rgb:    string;
  hex:    string;
}) {
  const isPast    = state === "past";
  const isCurrent = state === "current";

  return (
    <motion.div
      className="flex flex-col items-center justify-between gap-1 rounded-xl py-2.5 px-0.5 relative overflow-hidden"
      style={{
        background:  isPast    ? `rgba(${rgb},0.08)` : isCurrent ? `rgba(${rgb},0.22)` : "rgba(255,255,255,0.02)",
        border:      `1px solid ${isPast ? `rgba(${rgb},0.22)` : isCurrent ? `rgba(${rgb},0.6)` : "rgba(255,255,255,0.05)"}`,
      }}
      animate={isCurrent ? {
        boxShadow: [`0 0 10px rgba(${rgb},0.15)`, `0 0 24px rgba(${rgb},0.45)`, `0 0 10px rgba(${rgb},0.15)`],
      } : { boxShadow: "none" }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className="text-[8px] font-black text-white/25 uppercase tracking-widest leading-none">
        {DAY_LABELS[day - 1]}
      </span>

      {isPast ? (
        <span className="text-sm leading-none" style={{ color: hex }}>✓</span>
      ) : (
        <Coins className="w-3 h-3" style={{ color: isCurrent ? hex : "rgba(255,255,255,0.18)" }} />
      )}

      <span
        className="text-[8px] font-black leading-tight text-center"
        style={{
          color: isCurrent ? hex : isPast ? `rgba(${rgb},0.7)` : "rgba(255,255,255,0.16)",
        }}
      >
        {fmtShort(reward)}
      </span>
    </motion.div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface Props {
  info:    DailyRewardInfo;
  rank:    RankDef;
  onClaim: () => void;
  onClose: () => void;
}

export default function DailyRewardsModal({ info, rank, onClaim, onClose }: Props) {
  const [localClaimed, setLocalClaimed] = useState(false);
  const alreadyClaimed = info.claimed || localClaimed;
  const reward = DAILY_REWARDS[info.currentDay - 1];

  function handleClaim() {
    if (alreadyClaimed || !info.canClaim) return;
    onClaim();
    setLocalClaimed(true);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-[360px] rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0c0c1a 0%, #181830 100%)" }}
        initial={{ scale: 0.82, opacity: 0, y: 40 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{   scale: 0.92,  opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Rank border */}
        <div className="absolute inset-0 rounded-3xl border pointer-events-none"
          style={{ borderColor: `rgba(${rank.shadowRgb},0.42)` }} />

        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-40 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 90% 100% at 50% 0%, rgba(${rank.shadowRgb},0.2), transparent)` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative px-6 pt-8 pb-5 text-center">
          <motion.div
            className="text-4xl mb-3 select-none"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, repeatDelay: 4 }}
          >
            📅
          </motion.div>

          <h2 className="text-xl font-black text-white tracking-widest uppercase">Daily Rewards</h2>
          <p className="text-[11px] text-white/35 mt-1">Log in every day to build your streak</p>

          {/* Streak chip */}
          <motion.div
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full"
            style={{
              background:  `rgba(${rank.shadowRgb},0.14)`,
              border:      `1px solid rgba(${rank.shadowRgb},0.38)`,
            }}
            animate={{
              boxShadow: [
                `0 0 6px  rgba(${rank.shadowRgb},0.12)`,
                `0 0 18px rgba(${rank.shadowRgb},0.38)`,
                `0 0 6px  rgba(${rank.shadowRgb},0.12)`,
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <span className="text-base leading-none">🔥</span>
            <span className="text-[12px] font-black" style={{ color: rank.hex }}>
              Day {info.currentDay} Streak
            </span>
          </motion.div>
        </div>

        {/* ── 7-day grid ──────────────────────────────────────────────────── */}
        <div className="px-4 pb-4 grid grid-cols-7 gap-1.5">
          {DAILY_REWARDS.map((r, i) => {
            const day = i + 1;
            const state: "past" | "current" | "future" =
              day < info.currentDay || (day === info.currentDay && alreadyClaimed) ? "past"
              : day === info.currentDay && !alreadyClaimed ? "current"
              : "future";
            return (
              <DayCard
                key={day}
                day={day}
                reward={r}
                state={state}
                rgb={rank.shadowRgb}
                hex={rank.hex}
              />
            );
          })}
        </div>

        {/* ── Today's reward summary ──────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <div
            className="rounded-2xl px-4 py-3 text-center"
            style={{
              background: `rgba(${rank.shadowRgb},0.1)`,
              border:     `1px solid rgba(${rank.shadowRgb},0.22)`,
            }}
          >
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/35 mb-1.5">Today's Reward</p>
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-5 h-5" style={{ color: rank.hex }} />
              <motion.span
                className="text-2xl font-black text-white tabular-nums"
                animate={alreadyClaimed ? {} : { scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                +{reward.toLocaleString()}
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-7">
          {alreadyClaimed ? (
            <div
              className="w-full py-4 rounded-2xl text-center text-sm font-bold text-white/30"
              style={{
                background: "rgba(255,255,255,0.03)",
                border:     "1px solid rgba(255,255,255,0.07)",
              }}
            >
              ✓ Reward claimed · Come back tomorrow
            </div>
          ) : (
            <motion.button
              onClick={handleClaim}
              className="relative w-full py-4 rounded-2xl font-black text-[15px] text-white overflow-hidden"
              style={{
                background:  `linear-gradient(135deg, ${rank.hex}bb, ${rank.hex})`,
                boxShadow:   `0 4px 28px rgba(${rank.shadowRgb},0.5)`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 6px 38px rgba(${rank.shadowRgb},0.65)` }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ skewX: "-20deg" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }}
              />
              <span className="relative">🎁 Claim +{reward.toLocaleString()} Coins</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
