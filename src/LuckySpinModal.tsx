import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw } from "lucide-react";
import type { RankDef } from "./rankTypes";
import {
  SPIN_PRIZES, getSpinInfo, recordSpin, calcSpinAngle,
  type SpinPrize,
} from "./luckySpinData";

// ─── Constants ────────────────────────────────────────────────────────────────

const N          = SPIN_PRIZES.length;           // 8
const SEG_DEG    = 360 / N;                      // 45
const SPIN_DUR   = 4.8;                          // seconds
const CX = 150, CY = 150, R = 138, LABEL_R = 96;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function segPath(i: number): string {
  const a1 = i * SEG_DEG, a2 = (i + 1) * SEG_DEG;
  const [x1, y1] = polar(a1, R);
  const [x2, y2] = polar(a2, R);
  return `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

function rarityGlow(rarity: SpinPrize["rarity"]): string {
  if (rarity === "epic")  return "0 0 40px rgba(251,146,60,0.7), 0 0 80px rgba(251,146,60,0.3)";
  if (rarity === "rare")  return "0 0 30px rgba(167,139,250,0.6)";
  return "0 0 16px rgba(255,255,255,0.2)";
}

function fmt(n: number): string {
  return n >= 1_000 ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K` : String(n);
}

// ─── SVG Wheel ────────────────────────────────────────────────────────────────

function WheelSVG({ rotation, spinning }: { rotation: number; spinning: boolean }) {
  return (
    <div
      style={{
        transform:  `rotate(${rotation}deg)`,
        transition: spinning
          ? `transform ${SPIN_DUR}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
          : "none",
        willChange: "transform",
        borderRadius: "50%",
      }}
    >
      <svg viewBox="0 0 300 300" width={280} height={280} style={{ display: "block" }}>
        {/* Segments */}
        {SPIN_PRIZES.map((prize, i) => {
          const mid = (i + 0.5) * SEG_DEG;
          const [lx, ly] = polar(mid, LABEL_R);
          return (
            <g key={prize.id}>
              <path d={segPath(i)} fill={prize.color} stroke="rgba(0,0,0,0.55)" strokeWidth={2} />
              {/* Divider line */}
              {(() => {
                const [dx, dy] = polar(i * SEG_DEG, R);
                return <line x1={CX} y1={CY} x2={dx} y2={dy} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />;
              })()}
              {/* Label group, rotated to face outward */}
              <g transform={`translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${mid})`}>
                <text x={0} y={-10} textAnchor="middle" fontSize={14} dominantBaseline="middle">
                  {prize.emoji}
                </text>
                <text x={0} y={6} textAnchor="middle" fontSize={8.5}
                  fill="rgba(255,255,255,0.92)" fontWeight="bold" dominantBaseline="middle"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {prize.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* Outer ring */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="rgba(255,255,255,0.14)" strokeWidth={3} />
        {/* Tick marks */}
        {Array.from({ length: N }).map((_, i) => {
          const [tx, ty] = polar(i * SEG_DEG, R - 4);
          const [tx2, ty2] = polar(i * SEG_DEG, R + 6);
          return (
            <line key={i} x1={tx} y1={ty} x2={tx2} y2={ty2}
              stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
          );
        })}
        {/* Centre hub */}
        <circle cx={CX} cy={CY} r={24} fill="#0c0c1c"
          stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <circle cx={CX} cy={CY} r={10} fill="rgba(255,255,255,0.06)" />
      </svg>
    </div>
  );
}

// ─── Prize popup ─────────────────────────────────────────────────────────────

function PrizePopup({ prize, rank, onClose }: {
  prize: SpinPrize;
  rank:  RankDef;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Burst */}
      <motion.div
        className="absolute w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${rank.shadowRgb},0.25), transparent 70%)` }}
        animate={{ scale: [0.8, 1.6, 1.2], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 0.8 }}
      />

      <motion.div
        className="flex flex-col items-center gap-3 px-8 text-center"
        initial={{ scale: 0.6, y: 20 }}
        animate={{ scale: 1,   y: 0  }}
        transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.05 }}
      >
        <motion.div
          className="text-6xl select-none"
          animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {prize.emoji}
        </motion.div>

        <div>
          {prize.type === "nothing" ? (
            <>
              <p className="text-lg font-black text-white/60">No prize this time</p>
              <p className="text-sm text-white/35 mt-1">Come back tomorrow!</p>
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
                {prize.rarity === "epic" ? "🔥 EPIC WIN!" : prize.rarity === "rare" ? "✨ RARE PRIZE!" : "You won"}
              </p>
              <motion.p
                className="text-3xl font-black text-white leading-tight"
                style={{ textShadow: rarityGlow(prize.rarity) }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {prize.popupMsg}
              </motion.p>
              {prize.type === "coins" && (
                <p className="text-sm font-bold mt-1" style={{ color: rank.hex }}>
                  +{prize.value.toLocaleString()} added to balance
                </p>
              )}
              {prize.type === "energy" && (
                <p className="text-sm font-bold mt-1 text-cyan-400">Energy fully restored!</p>
              )}
            </>
          )}
        </div>

        <motion.button
          onClick={onClose}
          className="mt-2 px-8 py-3 rounded-2xl font-black text-sm"
          style={{
            background: `linear-gradient(135deg, ${rank.hex}bb, ${rank.hex})`,
            color: "#000",
            boxShadow: `0 4px 20px rgba(${rank.shadowRgb},0.45)`,
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Countdown display ───────────────────────────────────────────────────────

function fmtCountdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface Props {
  rank:        RankDef;
  onPrizeClaimed: (prize: SpinPrize) => void;
  onClose:     () => void;
}

export default function LuckySpinModal({ rank, onPrizeClaimed, onClose }: Props) {
  const spinInfo                    = getSpinInfo();
  const [rotation,   setRotation]   = useState(0);
  const [spinning,   setSpinning]   = useState(false);
  const [result,     setResult]     = useState<SpinPrize | null>(null);
  const [spunOnce,   setSpunOnce]   = useState(false);
  const rotRef                      = useRef(0);

  const canSpin = spinInfo.canSpin && !spunOnce && !spinning;

  const handleSpin = useCallback(() => {
    if (!canSpin) return;

    const targetIdx = Math.floor(Math.random() * SPIN_PRIZES.length);
    const nextRot   = calcSpinAngle(rotRef.current, targetIdx);

    rotRef.current = nextRot;
    setRotation(nextRot);
    setSpinning(true);
    recordSpin();

    setTimeout(() => {
      setSpinning(false);
      setResult(SPIN_PRIZES[targetIdx]);
      setSpunOnce(true);
      onPrizeClaimed(SPIN_PRIZES[targetIdx]);
    }, SPIN_DUR * 1000 + 300);
  }, [canSpin, onPrizeClaimed]);

  const rgb = rank.shadowRgb;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-[360px] rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(160deg, #0c0c1a 0%, #181830 100%)" }}
        initial={{ scale: 0.82, opacity: 0, y: 40 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{   scale: 0.9,   opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Rank border */}
        <div className="absolute inset-0 rounded-3xl border pointer-events-none"
          style={{ borderColor: `rgba(${rgb},0.42)` }} />

        {/* Top glow */}
        <div className="absolute top-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 90% 100% at 50% 0%, rgba(${rgb},0.18), transparent)` }} />

        {/* Close button */}
        <button onClick={onClose}
          className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="relative px-6 pt-7 pb-3 text-center">
          <div className="text-3xl mb-2 select-none">🎰</div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Lucky Spin</h2>
          <p className="text-[11px] text-white/35 mt-1">
            {spunOnce ? "See you tomorrow for another spin!" : "1 free spin every 24 hours"}
          </p>
        </div>

        {/* Wheel container */}
        <div className="relative flex items-center justify-center py-2">
          {/* Outer glow ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 296, height: 296,
              border: `3px solid rgba(${rgb},${spinning ? "0.55" : "0.25"})`,
              borderRadius: "50%",
              boxShadow: spinning
                ? `0 0 32px rgba(${rgb},0.4), inset 0 0 32px rgba(${rgb},0.1)`
                : `0 0 16px rgba(${rgb},0.2)`,
              transition: "box-shadow 0.5s, border-color 0.5s",
            }}
          />

          {/* Pointer triangle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div style={{
              width: 0, height: 0,
              borderLeft:  "11px solid transparent",
              borderRight: "11px solid transparent",
              borderTop:   `22px solid ${rank.hex}`,
              filter:      `drop-shadow(0 2px 6px rgba(${rgb},0.7))`,
            }} />
          </div>

          <WheelSVG rotation={rotation} spinning={spinning} />

          {/* Prize overlay */}
          <AnimatePresence>
            {result && (
              <PrizePopup
                prize={result}
                rank={rank}
                onClose={() => { setResult(null); onClose(); }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Spin button */}
        <div className="px-5 pb-7 pt-3">
          {canSpin ? (
            <motion.button
              onClick={handleSpin}
              className="relative w-full py-4 rounded-2xl font-black text-[15px] overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${rank.hex}bb, ${rank.hex})`,
                color:      "#000",
                boxShadow:  `0 4px 28px rgba(${rgb},0.5)`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 6px 38px rgba(${rgb},0.65)` }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ skewX: "-20deg" }}
                animate={{ x: ["-110%", "220%"] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                SPIN THE WHEEL
              </span>
            </motion.button>
          ) : spinning ? (
            <div
              className="w-full py-4 rounded-2xl text-center font-black text-sm text-white/40"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Spinning...
              </motion.span>
            </div>
          ) : (
            <div
              className="w-full py-4 rounded-2xl text-center font-bold text-sm text-white/30"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {spunOnce
                ? "✓ Spun today · Come back in 24h"
                : `Next spin in ${fmtCountdown(spinInfo.msUntilNext)}`
              }
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
