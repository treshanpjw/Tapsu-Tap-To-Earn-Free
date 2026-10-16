import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Coins, Sparkles, Gift, Star, Crown, Zap, ChevronRight } from "lucide-react";
import type { RankDef } from "./rankTypes";

// ─── Coin Packages ────────────────────────────────────────────────────────────

export interface CoinPackage {
  id: string;
  label: string;
  price: string;         // display price
  coins: number;         // base coins
  bonus: number;         // bonus coins on top
  tag?: string;          // e.g. "Most Popular", "Best Value"
  highlight?: boolean;   // extra glow ring
  minRankLevel: number;  // minimum rank level to claim
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "p01",  label: "Starter Pack",     price: "$10",     coins: 100,     bonus: 0,      minRankLevel: 5 },
  { id: "p02",  label: "Basic Pack",       price: "$25",     coins: 250,     bonus: 0,      minRankLevel: 5 },
  { id: "p03",  label: "Bronze Pack",      price: "$50",     coins: 500,     bonus: 25,     minRankLevel: 5 },
  { id: "p04",  label: "Silver Pack",      price: "$100",    coins: 1_000,   bonus: 100,    minRankLevel: 5 },
  { id: "p05",  label: "Gold Pack",        price: "$250",    coins: 2_500,   bonus: 375,    tag: "Most Popular", minRankLevel: 6 },
  { id: "p06",  label: "Platinum Pack",    price: "$500",    coins: 5_000,   bonus: 1_000,  minRankLevel: 6 },
  { id: "p07",  label: "Diamond Pack",     price: "$1,000",  coins: 10_000,  bonus: 2_500,  tag: "Best Value", highlight: true, minRankLevel: 7 },
  { id: "p08",  label: "Elite Pack",       price: "$2,500",  coins: 25_000,  bonus: 8_000,  minRankLevel: 7 },
  { id: "p09",  label: "Master Pack",      price: "$5,000",  coins: 50_000,  bonus: 20_000, tag: "Exclusive",  highlight: true, minRankLevel: 8 },
  { id: "p10",  label: "Grandmaster Pack", price: "$10,000", coins: 100_000, bonus: 50_000, minRankLevel: 9  },
  { id: "p11",  label: "Legendary Pack",   price: "$25,000", coins: 250_000, bonus: 150_000,tag: "Ultimate",   highlight: true, minRankLevel: 10 },
];

// Required rank to enter the shop at all
export const SHOP_MIN_RANK = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCoins(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

// ─── Claim toast ──────────────────────────────────────────────────────────────

function ClaimToast({
  pkg, hex, rgb, onDone,
}: { pkg: CoinPackage; hex: string; rgb: string; onDone: () => void }) {
  const total = pkg.coins + pkg.bonus;
  return (
    <motion.div
      initial={{ y: -80, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -80, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onAnimationComplete={() => { setTimeout(onDone, 2200); }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none w-72"
    >
      <div
        className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border shadow-2xl text-center"
        style={{
          background: "rgba(12,12,22,0.97)",
          borderColor: hex,
          boxShadow: `0 0 40px rgba(${rgb},0.45), 0 0 80px rgba(${rgb},0.15)`,
        }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.4, 1] }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <Sparkles className="w-8 h-8" style={{ color: hex }} />
        </motion.div>
        <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">Exclusive Offer Claimed!</span>
        <span className="text-2xl font-black" style={{ color: hex }}>
          +{formatCoins(total)} Coins
        </span>
        <span className="text-xs text-white/40">{pkg.label} added to your balance</span>
      </div>
    </motion.div>
  );
}

// ─── Locked screen ────────────────────────────────────────────────────────────

function LockedScreen({ currentRank, requiredRank, hex, rgb }: {
  currentRank: RankDef;
  requiredRank: RankDef;
  hex: string;
  rgb: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5 text-center">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full flex items-center justify-center border-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <Lock className="w-9 h-9 text-white/25" />
      </motion.div>

      <div className="flex flex-col gap-1">
        <span className="text-lg font-black text-white/70">VIP Offers Locked</span>
        <span className="text-sm text-white/35">
          Exclusive coin packs are only available to high-ranking players.
        </span>
      </div>

      <div
        className="rounded-2xl border px-5 py-4 w-full flex flex-col gap-3"
        style={{
          background: `rgba(${rgb},0.05)`,
          borderColor: `rgba(${rgb},0.2)`,
        }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Your rank</span>
          <span className="font-bold" style={{ color: currentRank.hex }}>{currentRank.title} (Lv.{currentRank.level})</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Required rank</span>
          <span className="font-bold" style={{ color: requiredRank.hex }}>{requiredRank.title} (Lv.{requiredRank.level})</span>
        </div>
        <div className="h-px bg-white/8" />
        <p className="text-xs text-white/35 leading-relaxed">
          Keep tapping and buying upgrades to reach <span style={{ color: requiredRank.hex }} className="font-semibold">{requiredRank.title}</span> rank and unlock exclusive free coin offers.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/25">
        <Zap className="w-3 h-3" />
        <span>Earn {(requiredRank.threshold / 1000).toFixed(0)}K all-time coins to unlock</span>
      </div>
    </div>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg, rank, canClaim, onClaim, index,
}: {
  pkg: CoinPackage;
  rank: RankDef;
  canClaim: boolean;
  onClaim: (pkg: CoinPackage) => void;
  index: number;
}) {
  const total    = pkg.coins + pkg.bonus;
  const isLocked = !canClaim;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.3 }}
      className="relative rounded-2xl border overflow-hidden"
      style={
        pkg.highlight && canClaim
          ? {
              borderColor: rank.hex,
              background: `rgba(${rank.shadowRgb},0.06)`,
              boxShadow: `0 0 18px rgba(${rank.shadowRgb},0.12)`,
            }
          : {
              borderColor: isLocked ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
              background: isLocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
            }
      }
    >
      {/* Tag badge */}
      {pkg.tag && canClaim && (
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black"
          style={{ background: rank.gradient, color: "#0e0e14" }}
        >
          {pkg.tag}
        </div>
      )}

      <div className="flex items-center gap-4 p-4">
        {/* Coin icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isLocked
              ? "rgba(255,255,255,0.04)"
              : `rgba(${rank.shadowRgb},0.1)`,
            border: `1px solid ${isLocked ? "rgba(255,255,255,0.08)" : `rgba(${rank.shadowRgb},0.25)`}`,
          }}
        >
          {isLocked
            ? <Lock className="w-5 h-5 text-white/20" />
            : <Coins className="w-6 h-6" style={{ color: rank.hex }} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-bold ${isLocked ? "text-white/30" : "text-white"}`}>
              {pkg.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-black ${isLocked ? "text-white/20" : ""}`}
              style={!isLocked ? { color: rank.hex } : undefined}>
              {formatCoins(pkg.coins)}
            </span>
            {pkg.bonus > 0 && !isLocked && (
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: `rgba(${rank.shadowRgb},0.15)`, color: rank.hex }}
              >
                +{formatCoins(pkg.bonus)} bonus
              </span>
            )}
            {pkg.bonus > 0 && isLocked && (
              <span className="text-[11px] text-white/15">+{formatCoins(pkg.bonus)} bonus</span>
            )}
          </div>
          {!isLocked && (
            <span className="text-[10px] text-white/35">Total: {formatCoins(total)} coins</span>
          )}
          {isLocked && (
            <span className="text-[10px] text-white/20">Requires Lv.{pkg.minRankLevel}</span>
          )}
        </div>

        {/* CTA button */}
        <div className="shrink-0">
          {isLocked ? (
            <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-white/8 opacity-40">
              <span className="text-xs font-bold text-white/30">FREE</span>
              <span className="text-[10px] text-white/20">{pkg.price}</span>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onClaim(pkg)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border active:opacity-80 transition-opacity"
              style={{
                background: `rgba(${rank.shadowRgb},0.12)`,
                borderColor: rank.hex,
              }}
            >
              <span className="text-xs font-black" style={{ color: rank.hex }}>FREE</span>
              <span className="text-[10px]" style={{ color: `rgba(${rank.shadowRgb.split(",").join(",")},0.7)` }}>
                {pkg.price} value
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Shop Tab ─────────────────────────────────────────────────────────────

interface ShopTabProps {
  rank: RankDef;
  allRanks: RankDef[];
  onClaim: (coins: number) => void;
}

export default function ShopTab({ rank, allRanks, onClaim }: ShopTabProps) {
  const [claimedToast, setClaimedToast] = useState<CoinPackage | null>(null);
  const [claimedIds,   setClaimedIds]   = useState<Set<string>>(new Set());

  const isUnlocked    = rank.level >= SHOP_MIN_RANK;
  const requiredRank  = allRanks.find(r => r.level === SHOP_MIN_RANK)!;

  function handleClaim(pkg: CoinPackage) {
    if (claimedIds.has(pkg.id)) return;
    const total = pkg.coins + pkg.bonus;
    onClaim(total);
    setClaimedIds(prev => new Set([...prev, pkg.id]));
    setClaimedToast(pkg);
  }

  if (!isUnlocked) {
    return (
      <LockedScreen
        currentRank={rank}
        requiredRank={requiredRank}
        hex={rank.hex}
        rgb={rank.shadowRgb}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 flex flex-col gap-3">

      {/* Claim toast */}
      <AnimatePresence>
        {claimedToast && (
          <ClaimToast
            pkg={claimedToast}
            hex={rank.hex}
            rgb={rank.shadowRgb}
            onDone={() => setClaimedToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        className="rounded-2xl border px-4 py-3 flex items-center gap-3"
        style={{
          background: `rgba(${rank.shadowRgb},0.06)`,
          borderColor: `rgba(${rank.shadowRgb},0.25)`,
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: rank.gradient }}>
          <Crown className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-white">VIP Exclusive Offers</div>
          <div className="text-[10px] text-white/40">
            Your <span style={{ color: rank.hex }}>{rank.title}</span> rank unlocks free coin packs
          </div>
        </div>
        <Star className="w-4 h-4 shrink-0" style={{ color: rank.hex }} />
      </div>

      {/* "How it works" pill */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8">
        <Gift className="w-4 h-4 text-white/30 shrink-0" />
        <p className="text-[10px] text-white/35 leading-relaxed">
          As a high-ranking player, these coin packs are completely free. Click any package to claim the coins instantly. Each pack can only be claimed once.
        </p>
      </div>

      {/* Package list */}
      <div className="flex flex-col gap-2.5">
        {COIN_PACKAGES.map((pkg, i) => {
          const alreadyClaimed = claimedIds.has(pkg.id);
          const pkgLocked      = rank.level < pkg.minRankLevel;
          const canClaim       = !alreadyClaimed && !pkgLocked;

          return (
            <div key={pkg.id} className="relative">
              <PackageCard
                pkg={pkg}
                rank={rank}
                canClaim={canClaim}
                onClaim={handleClaim}
                index={i}
              />
              {/* Claimed overlay */}
              {alreadyClaimed && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(10,10,18,0.7)" }}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15">
                    <ChevronRight className="w-3 h-3 text-white/30" />
                    <span className="text-xs text-white/40 font-semibold">Claimed</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="text-center text-[10px] text-white/20 pt-2">
        Higher rank packs unlock as you progress · Packs are one-time per session
      </div>
    </div>
  );
}
