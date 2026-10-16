import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Flame, Timer } from "lucide-react";
import { MarketEventType, MarketEventConfig, fmtCountdown } from "./marketEvents";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  BULL_RUN:      TrendingUp,
  MARKET_CRASH:  TrendingDown,
  GAS_FEE_SPIKE: Flame,
} as const;

// ─── Ticker content (scrolling marquee) ───────────────────────────────────────

function TickerText({ cfg }: { cfg: MarketEventConfig }) {
  const text = `${cfg.emoji} ${cfg.label}  ·  ${cfg.tagline}  ·  ${cfg.effectLine}  ·  ${cfg.emoji} ${cfg.label}  ·  ${cfg.tagline}  ·  ${cfg.effectLine}  ·  `;
  return (
    <div className="overflow-hidden flex-1 min-w-0 relative" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
      <motion.div
        animate={{ x: [0, -700] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="flex items-center whitespace-nowrap text-[11px] font-semibold tracking-wide"
        style={{ color: cfg.hex }}
      >
        {text}{text}
      </motion.div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MarketEventBannerProps {
  eventType: MarketEventType | null;
  cfg: MarketEventConfig | null;
  secsLeft: number;
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export default function MarketEventBanner({ eventType, cfg, secsLeft }: MarketEventBannerProps) {
  return (
    <AnimatePresence>
      {eventType && cfg && (
        <motion.div
          key={eventType}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden mx-5 mb-2"
        >
          {/* Outer wrapper with pulsing border */}
          <motion.div
            animate={{ borderColor: [`rgba(${cfg.rgb},0.5)`, `rgba(${cfg.rgb},1)`, `rgba(${cfg.rgb},0.5)`] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-xl border flex items-center gap-2 px-3 py-2 relative overflow-hidden"
            style={{ background: `rgba(${cfg.rgb},0.07)` }}
          >
            {/* Animated background flash */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 0.06, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: `radial-gradient(ellipse at center, rgba(${cfg.rgb},1) 0%, transparent 70%)` }}
            />

            {/* Left: icon + label */}
            <div className="flex items-center gap-1.5 shrink-0">
              {(() => {
                const Icon = ICON_MAP[eventType];
                return (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.hex }} />
                  </motion.div>
                );
              })()}
              <span
                className="text-[10px] font-black tracking-widest uppercase"
                style={{ color: cfg.hex }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-3 shrink-0" style={{ background: `rgba(${cfg.rgb},0.3)` }} />

            {/* Scrolling ticker */}
            <TickerText cfg={cfg} />

            {/* Divider */}
            <div className="w-px h-3 shrink-0" style={{ background: `rgba(${cfg.rgb},0.3)` }} />

            {/* Right: countdown */}
            <div className="flex items-center gap-1 shrink-0">
              <Timer className="w-3 h-3" style={{ color: `rgba(${cfg.rgb},0.7)` }} />
              <motion.span
                key={secsLeft}
                initial={{ scale: 1.15, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[11px] font-black tabular-nums"
                style={{ color: cfg.hex }}
              >
                {fmtCountdown(secsLeft)}
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
