import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Users, Zap, Send } from "lucide-react";
import {
  ReferralEntry, ReferralState,
  getReferralLink, makeMockInvitee,
  calcKickbackHr, formatTimeAgo,
  REGULAR_BONUS, PREMIUM_BONUS, MAX_INVITES,
} from "./referrals";
import type { RankDef } from "./rankTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

function levelLabel(level: number): string {
  const labels = ["", "Rookie", "Trader", "Miner", "Analyst", "Whale"];
  return labels[level] ?? `Lv.${level}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InviteCardProps {
  referralState: ReferralState;
  rank:          RankDef;
  onAddReferral: (entry: ReferralEntry, bonus: number) => void;
}

// ─── Friend row ──────────────────────────────────────────────────────────────

function FriendRow({ entry, index }: { entry: ReferralEntry; index: number }) {
  const kickback = entry.passiveHr * 0.1;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="flex items-center gap-3 py-2.5 px-1 border-b last:border-b-0"
      style={{ borderColor: "rgba(167,139,250,0.1)" }}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
        style={{ background: entry.premium ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)", color: entry.premium ? "#a78bfa" : "#9ca3af" }}>
        {entry.name[0]}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white truncate">{entry.name}</span>
          {entry.premium && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
              ✈ PRO
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-white/30">{levelLabel(entry.level)}</span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] text-white/30">{formatTimeAgo(entry.joinedAt)}</span>
        </div>
      </div>

      {/* Kickback badge */}
      <div className="shrink-0 flex flex-col items-end">
        <span className="text-[11px] font-black" style={{ color: "#a78bfa" }}>
          +{formatNum(kickback)}/hr
        </span>
        <span className="text-[9px] text-white/25">kickback</span>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InviteCard({ referralState, rank, onAddReferral }: InviteCardProps) {
  const [copied,      setCopied]      = useState(false);
  const [inviting,    setInviting]    = useState<"regular" | "premium" | null>(null);
  const [lastBonus,   setLastBonus]   = useState<number | null>(null);

  const link = getReferralLink(referralState.myUserId);
  const kickbackHr = calcKickbackHr(referralState.referrals);
  const atMax = referralState.referrals.length >= MAX_INVITES;

  // ── Copy link ────────────────────────────────────────────────────────────
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [link]);

  // ── Simulate invite ───────────────────────────────────────────────────────
  const handleInvite = useCallback((premium: boolean) => {
    if (atMax) return;
    const type = premium ? "premium" : "regular";
    setInviting(type);
    setTimeout(() => {
      const entry  = makeMockInvitee(premium);
      const bonus  = premium ? PREMIUM_BONUS : REGULAR_BONUS;
      onAddReferral(entry, bonus);
      setLastBonus(bonus);
      setInviting(null);
      setTimeout(() => setLastBonus(null), 2500);
    }, 900);
  }, [atMax, onAddReferral]);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "rgba(88,28,220,0.06)", borderColor: "rgba(167,139,250,0.2)" }}>

      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(167,139,250,0.15)" }}>
            <Users className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white">Invite Friends</span>
            <p className="text-[9px] text-white/30 mt-0.5">Both you and your friend earn coins</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Users className="w-2.5 h-2.5" style={{ color: "#a78bfa" }} />
          <span className="text-[10px] font-black" style={{ color: "#a78bfa" }}>
            {referralState.referrals.length}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">

        {/* Referral link */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Your referral link</span>
          <div className="flex gap-2 items-stretch">
            <div className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-[10px] font-mono text-white/40 truncate"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {link}
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={copyLink}
              className="shrink-0 flex items-center gap-1.5 px-3.5 rounded-xl text-[11px] font-black transition-all"
              style={copied
                ? { background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.35)", color: "#00e676" }
                : { background: "rgba(167,139,250,0.18)", border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="flex items-center gap-1">
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Invite buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Regular invite */}
          <motion.button
            whileTap={!atMax ? { scale: 0.95 } : {}}
            onClick={() => handleInvite(false)}
            disabled={!!inviting || atMax}
            className="flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden"
            style={!atMax
              ? { background: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.3)", color: "#c4b5fd" }
              : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.2)" }}
          >
            {inviting === "regular" ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                <Zap className="w-4 h-4" />
              </motion.div>
            ) : (
              <Users className="w-4 h-4" />
            )}
            <span className="text-[10px]">Invite Friend</span>
            <span className="text-[10px] font-black" style={{ color: "#a78bfa" }}>+{formatNum(REGULAR_BONUS)} each</span>
          </motion.button>

          {/* Telegram Premium invite */}
          <motion.button
            whileTap={!atMax ? { scale: 0.95 } : {}}
            onClick={() => handleInvite(true)}
            disabled={!!inviting || atMax}
            className="flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden"
            style={!atMax
              ? { background: "rgba(56,189,248,0.08)", borderColor: "rgba(56,189,248,0.3)", color: "#7dd3fc" }
              : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.2)" }}
          >
            {inviting === "premium" ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                <Zap className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="text-[10px]">Telegram Premium</span>
            <span className="text-[10px] font-black" style={{ color: "#38bdf8" }}>+{formatNum(PREMIUM_BONUS)} each</span>
          </motion.button>
        </div>

        {/* Bonus flash */}
        <AnimatePresence>
          {lastBonus !== null && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-xs font-black rounded-xl py-2"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
            >
              🎉 Friend joined! You both received +{formatNum(lastBonus)} coins
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kickback summary */}
        {kickbackHr > 0 && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
            <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#a78bfa" }} />
            <div className="flex-1">
              <span className="text-[10px] text-white/40">Friend kickback</span>
            </div>
            <span className="text-xs font-black" style={{ color: "#a78bfa" }}>
              +{formatNum(kickbackHr)} / hr
            </span>
          </div>
        )}

        {/* Referrals list */}
        {referralState.referrals.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">My Referrals</span>
              <span className="text-[10px] text-white/25">{referralState.referrals.length} friends</span>
            </div>
            <div className="flex flex-col max-h-[200px] overflow-y-auto rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="px-3">
                {[...referralState.referrals].reverse().map((entry, i) => (
                  <FriendRow key={entry.userId} entry={entry} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
