import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, UserPlus, Copy, Check, Coins } from "lucide-react";
import { buildLeaderboard, getTodaySeed, rankLevelColor } from "./leaderboard";
import type { RankDef } from "./rankTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardTabProps {
  totalEarned:     number;
  playerRankLevel: number;
  rank:            RankDef;
}

interface EntryShape {
  id: string;
  rank: number;
  name: string;
  score: number;
  rankLevel: number;
  isPlayer: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KICKBACK_RATE = 0.05; // 5% of each friend's earnings back to you

const RANK_TITLES = [
  "", "Rookie", "Trader", "Miner", "Analyst", "Whale",
  "Mogul", "Legend", "Sovereign", "Emperor", "Titan", "Cosmic", "Infinity",
];

const MOCK_FRIENDS = [
  { id: "f1", name: "Alex Crypto",    earned: 247_300, rankLevel: 6 },
  { id: "f2", name: "Maya Whale",     earned: 183_500, rankLevel: 5 },
  { id: "f3", name: "ZeroX_Mike",     earned: 92_800,  rankLevel: 4 },
  { id: "f4", name: "Satoshi_Jr",     earned: 61_200,  rankLevel: 3 },
  { id: "f5", name: "CoinHunter99",   earned: 44_100,  rankLevel: 3 },
  { id: "f6", name: "BlockchainBob",  earned: 28_900,  rankLevel: 2 },
  { id: "f7", name: "TapMaster_Lee",  earned: 18_400,  rankLevel: 2 },
  { id: "f8", name: "CryptoKitty",    earned: 7_200,   rankLevel: 1 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(Math.floor(n));
}

function medal(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Global sub-tab components ────────────────────────────────────────────────

function PodiumCard({ entry, blockHeight, delay }: { entry: EntryShape; blockHeight: number; delay: number }) {
  const hex = entry.isPlayer ? "#f59e0b" : rankLevelColor(entry.rankLevel);
  const rgb = hexToRgb(hex);
  return (
    <motion.div
      className="flex flex-col items-center gap-1 flex-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <div className="text-xl mb-0.5">{medal(entry.rank)}</div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2"
        style={{
          background:  `rgba(${rgb},0.15)`,
          borderColor: hex,
          color:       hex,
          boxShadow:   `0 0 12px rgba(${rgb},0.3)`,
        }}
      >
        {entry.isPlayer ? "★" : entry.name[0].toUpperCase()}
      </div>
      <span className="text-[10px] font-bold text-white/80 truncate max-w-[64px] text-center leading-tight">
        {entry.name}
      </span>
      <span className="text-[9px] font-black" style={{ color: hex }}>{fmt(entry.score)}</span>
      <motion.div
        className="w-full rounded-t-lg mt-1 flex justify-center pt-1"
        style={{
          height:      blockHeight,
          transformOrigin: "bottom",
          background:  `rgba(${rgb},0.1)`,
          borderTop:   `2px solid ${hex}`,
          borderLeft:  `1px solid rgba(${rgb},0.25)`,
          borderRight: `1px solid rgba(${rgb},0.25)`,
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: delay + 0.15, duration: 0.5, ease: "easeOut" }}
      >
        <span className="text-[10px] font-black" style={{ color: hex }}>#{entry.rank}</span>
      </motion.div>
    </motion.div>
  );
}

function LeaderRow({ entry, index, rankHex }: { entry: EntryShape; index: number; rankHex: string }) {
  const hex = entry.isPlayer ? rankHex : rankLevelColor(entry.rankLevel);
  const rgb = hexToRgb(hex);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.35), duration: 0.2 }}
      className="flex items-center gap-2.5 py-2 px-3 rounded-xl"
      style={entry.isPlayer ? {
        background:   `rgba(${hexToRgb(rankHex)},0.1)`,
        border:       `1px solid rgba(${hexToRgb(rankHex)},0.35)`,
      } : {
        background:   "rgba(255,255,255,0.02)",
        border:       "1px solid transparent",
      }}
    >
      <span
        className="w-7 text-center text-[11px] font-black shrink-0"
        style={{ color: entry.rank <= 3 ? hex : "rgba(255,255,255,0.25)" }}
      >
        {entry.rank <= 3 ? medal(entry.rank) : `#${entry.rank}`}
      </span>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
        style={{ background: `rgba(${rgb},0.14)`, color: hex }}
      >
        {entry.isPlayer ? "★" : entry.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="text-xs font-bold truncate block"
          style={{ color: entry.isPlayer ? "white" : "rgba(255,255,255,0.7)" }}
        >
          {entry.name}
          {entry.isPlayer && (
            <span
              className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: `rgba(${hexToRgb(rankHex)},0.18)`, color: rankHex }}
            >
              YOU
            </span>
          )}
        </span>
      </div>
      <span
        className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
        style={{ background: `rgba(${rgb},0.1)`, color: hex }}
      >
        Lv.{entry.rankLevel}
      </span>
      <span
        className="text-[11px] font-black shrink-0 w-14 text-right tabular-nums"
        style={{ color: entry.isPlayer ? rankHex : "rgba(255,255,255,0.45)" }}
      >
        {fmt(entry.score)}
      </span>
    </motion.div>
  );
}

// ─── Friends sub-tab ──────────────────────────────────────────────────────────

function FriendRow({ friend, index, rankHex }: {
  friend: (typeof MOCK_FRIENDS)[number];
  index:  number;
  rankHex: string;
}) {
  const hex = rankLevelColor(friend.rankLevel);
  const rgb = hexToRgb(hex);
  const kickback = Math.floor(friend.earned * KICKBACK_RATE);

  return (
    <motion.div
      className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.22 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border"
        style={{ background: `rgba(${rgb},0.14)`, color: hex, borderColor: `rgba(${rgb},0.3)` }}
      >
        {friend.name[0].toUpperCase()}
      </div>

      {/* Name + rank */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white/85 truncate leading-tight">{friend.name}</p>
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-full inline-block mt-0.5"
          style={{ background: `rgba(${rgb},0.1)`, color: hex }}
        >
          {RANK_TITLES[friend.rankLevel]}
        </span>
      </div>

      {/* Coins earned */}
      <div className="text-right shrink-0">
        <p className="text-[10px] text-white/30 uppercase tracking-wider leading-tight mb-0.5">Earned</p>
        <p className="text-[11px] font-black text-white/65 tabular-nums">{fmt(friend.earned)}</p>
      </div>

      {/* Kickback */}
      <div
        className="text-right shrink-0 pl-3 border-l"
        style={{ borderColor: `rgba(${hexToRgb(rankHex)},0.18)` }}
      >
        <p className="text-[10px] text-white/30 uppercase tracking-wider leading-tight mb-0.5">Kickback</p>
        <p className="text-[11px] font-black tabular-nums" style={{ color: rankHex }}>
          +{fmt(kickback)}
        </p>
      </div>
    </motion.div>
  );
}

function FriendsContent({ rank }: { rank: RankDef }) {
  const [copied, setCopied] = useState(false);
  const totalKickback = MOCK_FRIENDS.reduce((s, f) => s + Math.floor(f.earned * KICKBACK_RATE), 0);
  const rgb = rank.shadowRgb;

  function handleInvite() {
    navigator.clipboard?.writeText("https://t.me/TapToEarnBot?start=ref_you").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Kickback summary card ─────────────────────────────────────────── */}
      <motion.div
        className="relative overflow-hidden rounded-2xl px-4 py-4"
        style={{
          background:  `linear-gradient(135deg, rgba(${rgb},0.18) 0%, rgba(${rgb},0.06) 100%)`,
          border:      `1px solid rgba(${rgb},0.38)`,
          boxShadow:   `0 4px 28px rgba(${rgb},0.12)`,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${rgb},0.12), transparent)` }} />

        <div className="relative flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `rgba(${rgb},0.18)`, border: `1px solid rgba(${rgb},0.35)` }}
          >
            <Coins className="w-6 h-6" style={{ color: rank.hex }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/40 mb-0.5">
              Total Referral Kickback Income
            </p>
            <motion.p
              className="text-2xl font-black text-white tabular-nums leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              +{totalKickback.toLocaleString()}
            </motion.p>
            <p className="text-[10px] text-white/35 mt-0.5">
              {MOCK_FRIENDS.length} friends · {(KICKBACK_RATE * 100).toFixed(0)}% of their earnings
            </p>
          </div>
        </div>

        {/* Stat chips */}
        <div className="relative flex gap-2 mt-3 flex-wrap">
          {[
            { label: "Friends", value: MOCK_FRIENDS.length },
            { label: "Active today", value: 3 },
            { label: "Top friend", value: fmt(MOCK_FRIENDS[0].earned) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 min-w-[60px] rounded-xl px-2 py-1.5 text-center"
              style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.18)` }}
            >
              <p className="text-[9px] text-white/35 uppercase tracking-wider">{label}</p>
              <p className="text-xs font-black" style={{ color: rank.hex }}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Invite button ─────────────────────────────────────────────────── */}
      <motion.button
        onClick={handleInvite}
        className="relative w-full py-3.5 rounded-2xl font-black text-sm overflow-hidden flex items-center justify-center gap-2"
        style={{
          background: copied
            ? `rgba(${rgb},0.12)`
            : `linear-gradient(135deg, ${rank.hex}cc, ${rank.hex})`,
          border:     copied ? `1px solid rgba(${rgb},0.35)` : "1px solid transparent",
          color:      copied ? rank.hex : "#000",
          boxShadow:  copied ? "none" : `0 4px 24px rgba(${rgb},0.45)`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Shimmer */}
        {!copied && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ skewX: "-20deg" }}
            animate={{ x: ["-100%", "220%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {copied
            ? <><Check className="w-4 h-4" />Link copied!</>
            : <><UserPlus className="w-4 h-4" />Invite a Friend<Copy className="w-3.5 h-3.5 opacity-60" /></>
          }
        </span>
      </motion.button>

      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5" style={{ color: rank.hex }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: rank.hex }}>
          Your Friends
        </span>
        <div className="flex-1 h-px" style={{ background: `rgba(${rgb},0.15)` }} />
        <span className="text-[10px] text-white/25">{MOCK_FRIENDS.length} invited</span>
      </div>

      {/* ── Friends list ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        {MOCK_FRIENDS.map((f, i) => (
          <FriendRow key={f.id} friend={f} index={i} rankHex={rank.hex} />
        ))}
      </div>

      {/* ── Earn more CTA ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-4 py-3 text-center"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px dashed rgba(255,255,255,0.08)" }}
      >
        <p className="text-[10px] text-white/30 leading-relaxed">
          Earn <span className="font-black" style={{ color: rank.hex }}>5%</span> kickback on every coin your friends earn.
          Invite more to grow your passive income.
        </p>
      </div>

    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LeaderboardTab({ totalEarned, playerRankLevel, rank }: LeaderboardTabProps) {
  const [subTab, setSubTab] = useState<"global" | "friends">("global");

  const entries = useMemo(
    () => buildLeaderboard(totalEarned, playerRankLevel, getTodaySeed()),
    [totalEarned, playerRankLevel],
  );

  const top3      = entries.slice(0, 3);
  const rest      = entries.slice(3);
  const playerRow = entries.find(e => e.isPlayer);

  const podiumOrder  = [top3[1], top3[0], top3[2]].filter((e): e is EntryShape => Boolean(e));
  const blockHeights = [40, 64, 28];

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 flex flex-col gap-3">

      {/* ── Sub-tab toggle ──────────────────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {(["global", "friends"] as const).map(tab => {
          const active = subTab === tab;
          const Icon   = tab === "global" ? Trophy : Users;
          const label  = tab === "global" ? "Global" : "Friends";
          return (
            <motion.button
              key={tab}
              onClick={() => setSubTab(tab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-colors duration-200"
              style={active
                ? { background: rank.hex, color: "#000", boxShadow: `0 2px 12px rgba(${rank.shadowRgb},0.45)` }
                : { color: "rgba(255,255,255,0.35)" }
              }
              whileTap={{ scale: 0.97 }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {tab === "friends" && !active && (
                <span
                  className="text-[8px] font-black px-1 rounded-full"
                  style={{ background: `rgba(${rank.shadowRgb},0.25)`, color: rank.hex }}
                >
                  {MOCK_FRIENDS.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {subTab === "global" && (
          <motion.div
            key="global"
            className="flex flex-col gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0  }}
            exit={{   opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: rank.hex }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: rank.hex }}>
                  Global Rankings
                </span>
              </div>
              <span className="text-[10px] text-white/30">Top 100 · Resets daily</span>
            </div>

            {/* Podium */}
            <div
              className="flex items-end justify-center gap-2 pt-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 0 }}
            >
              {podiumOrder.map((e, i) => (
                <PodiumCard key={e.id} entry={e} blockHeight={blockHeights[i]} delay={i * 0.08} />
              ))}
            </div>

            {/* Your rank card (outside top 3) */}
            {playerRow && playerRow.rank > 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
                style={{
                  background:   `rgba(${hexToRgb(rank.hex)},0.07)`,
                  borderColor:  `rgba(${hexToRgb(rank.hex)},0.35)`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black"
                  style={{ background: `rgba(${hexToRgb(rank.hex)},0.14)`, color: rank.hex }}
                >
                  ★
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Your Rank</div>
                  <div className="text-2xl font-black text-white leading-none">#{playerRow.rank}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40">Total Earned</div>
                  <div className="text-sm font-black" style={{ color: rank.hex }}>{fmt(totalEarned)}</div>
                </div>
                <div className="text-right pl-3 border-l" style={{ borderColor: `rgba(${hexToRgb(rank.hex)},0.2)` }}>
                  <div className="text-[10px] text-white/40">Rank</div>
                  <div className="text-xs font-black" style={{ color: rank.hex }}>{rank.title}</div>
                </div>
              </motion.div>
            )}

            {/* Full ranked list */}
            <div className="flex flex-col gap-0.5">
              {top3.map((e, i) => (
                <LeaderRow key={e.id} entry={e} index={i} rankHex={rank.hex} />
              ))}
              <div className="flex items-center gap-2 py-1.5">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                <span className="text-[9px] text-white/20 uppercase tracking-widest px-1">top 100</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
              {rest.map((e, i) => (
                <LeaderRow key={e.id} entry={e} index={i + 3} rankHex={rank.hex} />
              ))}
            </div>
          </motion.div>
        )}

        {subTab === "friends" && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0  }}
            exit={{   opacity: 0, x: 12  }}
            transition={{ duration: 0.2 }}
          >
            <FriendsContent rank={rank} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
