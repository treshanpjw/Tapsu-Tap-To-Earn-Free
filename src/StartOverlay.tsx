import { motion } from "framer-motion";
import { Coins } from "lucide-react";

// ─── Decorative star field ────────────────────────────────────────────────────

const STAR_DATA = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  // golden-angle distribution for even spread
  x:        ((i * 137.508) % 100),
  y:        ((i * 97.3)    % 100),
  size:     1 + (i % 3),
  delay:    (i * 0.22) % 3,
  duration: 2.2 + (i % 4) * 0.4,
}));

function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STAR_DATA.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.08, 0.55, 0.08] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Rotating ring orbiting the coin ─────────────────────────────────────────

function OrbitRing({ size, opacity, duration }: { size: number; opacity: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width:       size,
        height:      size,
        borderColor: `rgba(245,197,24,${opacity})`,
        borderStyle: "dashed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

interface Props {
  onStart: () => void;
}

export default function StartOverlay({ onStart }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #050508 0%, #0b0b1c 55%, #050508 100%)" }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <StarField />

      {/* Soft centre glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 480, height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Content card */}
      <motion.div
        className="relative flex flex-col items-center gap-6 px-8 text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
      >

        {/* Coin with orbit rings */}
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          <OrbitRing size={138} opacity={0.12} duration={12} />
          <OrbitRing size={108} opacity={0.18} duration={8} />

          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(245,197,24,0.1)",
              border:     "2px solid rgba(245,197,24,0.38)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(245,197,24,0.22)",
                "0 0 52px rgba(245,197,24,0.55)",
                "0 0 20px rgba(245,197,24,0.22)",
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Coins className="w-12 h-12" style={{ color: "#f5c518" }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <div>
          <h1
            className="text-4xl font-black tracking-[0.14em] uppercase leading-none"
            style={{
              background:           "linear-gradient(135deg, #f5c518 0%, #fff9c2 50%, #f5c518 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}
          >
            Tap to Earn
          </h1>
          <p className="text-white/35 text-sm mt-2 tracking-wider font-medium">
            Tap your way to the top
          </p>
        </div>

        {/* START button */}
        <motion.button
          onClick={onStart}
          className="relative mt-1 px-12 py-4 rounded-full font-black text-black text-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f7ce3e, #e89b00)",
            boxShadow:  "0 4px 40px rgba(245,197,24,0.55), 0 0 0 1px rgba(245,197,24,0.2)",
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.94 }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ skewX: "-18deg" }}
            animate={{ x: ["-110%", "220%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.1 }}
          />
          <span className="relative tracking-wider">▶&nbsp;&nbsp;TAP TO START</span>
        </motion.button>

        {/* Sound hint */}
        <motion.p
          className="text-white/22 text-[11px] tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          🔊 Background music will begin
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
