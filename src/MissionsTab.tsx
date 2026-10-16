import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MousePointerClick, Flame, ShoppingCart, Briefcase,
  TrendingUp, PiggyBank, Trophy, CheckCircle2, Clock, Gift,
  type LucideIcon
} from "lucide-react";
import {
  MISSIONS, MissionsState,
  isMissionComplete, isMissionClaimed, getMissionProgress,
  getSecondsUntilMidnight, formatCountdown, UPGRADE_LABELS,
} from "./missions";
import type { RankDef } from "./rankTypes";
import InviteCard from "./InviteCard";
import type { ReferralState, ReferralEntry } from "./referrals";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, MousePointerClick, Flame, ShoppingCart, Briefcase,
  TrendingUp, PiggyBank, Trophy,
};

// ─── Claim toast ──────────────────────────────────────────────────────────────

function ClaimFlash({ reward, hex, rgb, onDone }: { reward: number; hex: string; rgb: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.85 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none"
    >
      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold"
        style={{
          background: "rgba(15,15,25,0.96)",
          borderColor: hex,
          boxShadow: `0 0 20px rgba(${rgb},0.4)`,
          color: hex,
        }}
      >
        <Gift className="w-4 h-4" />
        <span>+{reward} coins claimed!</span>
      </div>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MissionsTabProps {
  missionsState: MissionsState;
  rank: RankDef;
  onClaim: (missionId: string, reward: number) => void;
  dailyCombo: string[];
  referralState: ReferralState;
  onAddReferral: (entry: ReferralEntry, bonus: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MissionsTab({ missionsState, rank, onClaim, dailyCombo, referralState, onAddReferral }: MissionsTabProps) {
  const [countdown, setCountdown] = useState(getSecondsUntilMidnight());
  const [claimFlash, setClaimFlash] = useState<{ reward: number } | null>(null);

  // Countdown ticker
  useEffect(() => {
    const id = setInterval(() => setCountdown(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalRewards = useMemo(
    () => MISSIONS.reduce((sum, m) => sum + (isMissionClaimed(m, missionsState) ? m.reward : 0), 0),
    [missionsState]
  );

  const completedCount = useMemo(
    () => MISSIONS.filter(m => isMissionComplete(m, missionsState)).length,
    [missionsState]
  );

  function handleClaim(missionId: string, reward: number) {
    onClaim(missionId, reward);
    setClaimFlash({ reward });
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 flex flex-col gap-3">

      {/* Invite Friends card — top of Missions tab */}
      <InviteCard
        referralState={referralState}
        rank={rank}
        onAddReferral={onAddReferral}
      />

      {/* Claim flash toast */}
      <AnimatePresence>
        {claimFlash && (
          <ClaimFlash
            reward={claimFlash.reward}
            hex={rank.hex}
            rgb={rank.shadowRgb}
            onDone={() => setClaimFlash(null)}
          />
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Daily Missions</span>
          <span className="text-xs text-white/30 mt-0.5">{completedCount}/{MISSIONS.length} complete</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold"
          style={{
            background: `rgba(${rank.shadowRgb},0.06)`,
            borderColor: `rgba(${rank.shadowRgb},0.2)`,
            color: rank.hex,
          }}
        >
          <Clock className="w-3 h-3" />
          <span>{formatCountdown(countdown)}</span>
        </div>
      </div>

      {/* Daily Secret Combo tracker */}
      <div
        className="rounded-2xl border px-4 pt-3 pb-3.5 flex flex-col gap-2.5"
        style={{
          background: missionsState.comboClaimed
            ? "rgba(0,230,118,0.05)"
            : "rgba(255,255,255,0.03)",
          borderColor: missionsState.comboClaimed
            ? "rgba(0,230,118,0.25)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔐</span>
            <span className="text-xs font-black uppercase tracking-wider text-white">Daily Secret Combo</span>
          </div>
          {missionsState.comboClaimed ? (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,230,118,0.12)", color: "#00e676", border: "1px solid rgba(0,230,118,0.25)" }}
            >
              CLAIMED ✓
            </span>
          ) : (
            <span className="text-[10px] font-semibold" style={{ color: rank.hex }}>
              {missionsState.comboRevealedIds.length} / 3
            </span>
          )}
        </div>

        {/* Progress row — 3 slot pills */}
        <div className="flex gap-2">
          {dailyCombo.map((comboId, i) => {
            const revealed = missionsState.comboRevealedIds.includes(comboId);
            return (
              <motion.div
                key={i}
                layout
                className="flex-1 rounded-xl flex items-center justify-center gap-1.5 py-2 border"
                style={revealed
                  ? { background: "rgba(0,230,118,0.08)", borderColor: "rgba(0,230,118,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }
                }
              >
                {revealed ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#00e676" }} />
                    <span className="text-[9px] font-bold leading-tight text-center px-1" style={{ color: "#00e676" }}>
                      {UPGRADE_LABELS[comboId] ?? comboId}
                    </span>
                  </div>
                ) : (
                  <motion.span
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                    className="text-sm font-black text-white/20"
                  >
                    ?
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Sub-caption */}
        <p className="text-[10px] text-white/25 leading-relaxed">
          {missionsState.comboClaimed
            ? "🎉 All 3 combo upgrades found — +1,000,000 coins awarded!"
            : "Upgrade the 3 hidden items in the Exchange to win +1,000,000 coins"}
        </p>
      </div>

      {/* Total earned today */}
      {totalRewards > 0 && (
        <div
          className="rounded-2xl border px-4 py-2.5 flex items-center gap-2"
          style={{
            background: `rgba(${rank.shadowRgb},0.06)`,
            borderColor: `rgba(${rank.shadowRgb},0.2)`,
          }}
        >
          <Gift className="w-4 h-4 shrink-0" style={{ color: rank.hex }} />
          <span className="text-xs text-muted-foreground">Earned today</span>
          <span className="ml-auto text-sm font-bold" style={{ color: rank.hex }}>
            +{totalRewards.toLocaleString()} coins
          </span>
        </div>
      )}

      {/* Mission cards */}
      {MISSIONS.map((mission, i) => {
        const progress  = getMissionProgress(mission, missionsState);
        const complete  = isMissionComplete(mission, missionsState);
        const claimed   = isMissionClaimed(mission, missionsState);
        const pct       = Math.min(1, progress / mission.goal);
        const Icon      = ICON_MAP[mission.icon] ?? Zap;

        return (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="bg-card border border-card-border rounded-2xl p-4 flex flex-col gap-3"
            style={claimed ? { opacity: 0.55 } : undefined}
            data-testid={`mission-card-${mission.id}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: claimed
                    ? "rgba(255,255,255,0.04)"
                    : `rgba(${rank.shadowRgb},0.1)`,
                  border: `1px solid ${claimed ? "rgba(255,255,255,0.08)" : `rgba(${rank.shadowRgb},0.25)`}`,
                }}
              >
                {claimed ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: rank.hex }} />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: complete ? rank.hex : "#6b7280" }} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-semibold ${claimed ? "text-white/40" : "text-white"}`}>
                    {mission.title}
                  </span>
                  {/* Reward chip */}
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ml-2"
                    style={{
                      background: `rgba(${rank.shadowRgb},0.08)`,
                      color: claimed ? `rgba(${rank.shadowRgb},0.4)` : rank.hex,
                    }}
                  >
                    +{mission.reward.toLocaleString()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{mission.description}</p>
              </div>
            </div>

            {/* Progress bar + counter + claim button */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: claimed ? `rgba(${rank.shadowRgb},0.3)` : rank.gradient }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-white/25">
                    {Math.min(progress, mission.goal).toLocaleString()} / {mission.goal.toLocaleString()}
                  </span>
                  {!claimed && (
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: complete ? rank.hex : "rgba(255,255,255,0.2)" }}
                    >
                      {complete ? "Ready!" : `${Math.round(pct * 100)}%`}
                    </span>
                  )}
                </div>
              </div>

              {/* Claim button */}
              {claimed ? (
                <div className="shrink-0 w-16 h-8 flex items-center justify-center rounded-xl border border-white/8 bg-white/4">
                  <CheckCircle2 className="w-4 h-4 text-white/25" />
                </div>
              ) : (
                <motion.button
                  whileTap={complete ? { scale: 0.92 } : {}}
                  onClick={() => complete && handleClaim(mission.id, mission.reward)}
                  disabled={!complete}
                  className="shrink-0 w-16 h-8 rounded-xl border text-xs font-bold transition-all"
                  style={complete ? {
                    background:  `rgba(${rank.shadowRgb},0.15)`,
                    borderColor: rank.hex,
                    color:       rank.hex,
                    boxShadow:   `0 0 10px rgba(${rank.shadowRgb},0.25)`,
                  } : {
                    background:  "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color:       "rgba(255,255,255,0.2)",
                    cursor:      "not-allowed",
                  }}
                  data-testid={`mission-claim-${mission.id}`}
                >
                  Claim
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
