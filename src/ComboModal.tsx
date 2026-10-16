import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Trophy, Sparkles, CheckCircle2 } from "lucide-react";
import { UPGRADE_LABELS } from "./missions";
import type { RankDef } from "./rankTypes";

// ─── Floating coin particle ───────────────────────────────────────────────────

function CoinBurst() {
  const coins = Array.from({ length: 18 }, (_, i) => {
    const angle  = (i / 18) * 360;
    const dist   = 80 + Math.random() * 80;
    const rad    = (angle * Math.PI) / 180;
    return {
      id: i,
      tx: Math.cos(rad) * dist,
      ty: Math.sin(rad) * dist,
      delay: Math.random() * 0.3,
      scale: 0.6 + Math.random() * 0.8,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {coins.map(c => (
        <motion.div
          key={c.id}
          className="absolute text-xl"
          initial={{ x: 0, y: 0, opacity: 1, scale: c.scale }}
          animate={{ x: c.tx, y: c.ty, opacity: 0, scale: 0 }}
          transition={{ duration: 1.1, delay: c.delay, ease: "easeOut" }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

// ─── Reveal card ─────────────────────────────────────────────────────────────

function RevealCard({ upgradeId, index }: { upgradeId: string; index: number }) {
  const name = UPGRADE_LABELS[upgradeId] ?? upgradeId;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.12, type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border"
      style={{ background: "rgba(255,215,0,0.07)", borderColor: "rgba(255,215,0,0.3)" }}
    >
      <CheckCircle2 className="w-5 h-5 text-[#00e676]" />
      <span className="text-[11px] font-bold text-white/80 text-center leading-tight">{name}</span>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ComboModalProps {
  revealedIds: string[];
  rank: RankDef;
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function ComboModal({ revealedIds, rank, onClose }: ComboModalProps) {
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false;
    return () => { closedRef.current = true; };
  }, []);

  function handleClose() {
    if (!closedRef.current) onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[20000] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative w-full max-w-[340px] rounded-3xl border overflow-hidden flex flex-col items-center gap-0 text-center"
        style={{
          background: "linear-gradient(160deg,#0f0f1a 0%,#1a1130 100%)",
          borderColor: "rgba(255,215,0,0.35)",
          boxShadow: "0 0 60px rgba(255,215,0,0.2), 0 0 120px rgba(255,165,0,0.1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: "linear-gradient(90deg,#ffd700,#ff6b00,#ffd700)" }} />

        {/* Burst container */}
        <div className="relative w-full flex items-center justify-center pt-10 pb-2">
          <CoinBurst />
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ffd700,#ff8c00)", boxShadow: "0 0 30px rgba(255,215,0,0.5)" }}
          >
            <Trophy className="w-10 h-10 text-black" />
          </motion.div>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="px-6 pb-1"
        >
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1"
            style={{ color: "rgba(255,215,0,0.6)" }}>
            Daily Secret Combo
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
            COMBO CRACKED!
          </h2>
          <p className="text-xs text-white/40 mt-1">You found all 3 hidden upgrades today</p>
        </motion.div>

        {/* Revealed cards */}
        <div className="grid grid-cols-3 gap-2 px-5 pt-4 pb-4 w-full">
          {revealedIds.map((id, i) => (
            <RevealCard key={id} upgradeId={id} index={i} />
          ))}
        </div>

        {/* Reward strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 250 }}
          className="mx-5 mb-4 w-[calc(100%-40px)] rounded-2xl py-4 flex flex-col items-center gap-1"
          style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)" }}
        >
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6" style={{ color: "#ffd700" }} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-3xl font-black"
              style={{ color: "#ffd700", textShadow: "0 0 20px rgba(255,215,0,0.5)" }}
            >
              +1,000,000
            </motion.span>
          </div>
          <span className="text-xs text-white/40 font-medium">coins added to your balance</span>
        </motion.div>

        {/* Collect button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClose}
          className="mx-5 mb-6 w-[calc(100%-40px)] py-3.5 rounded-2xl font-black text-sm tracking-wide text-black transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg,#ffd700,#ff8c00)",
            boxShadow: "0 0 24px rgba(255,215,0,0.4)",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            COLLECT REWARD
            <Sparkles className="w-4 h-4" />
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
