import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pickaxe, Bot, Wallet, Droplets, Palette, Vote, Sprout, Cpu,
  Activity, Coins, Zap, Store, Star, TrendingUp, Award, CheckSquare, ShoppingBag,
  Volume2, VolumeX, Gift
} from "lucide-react";
import MissionsTab from "./MissionsTab";
import ShopTab from "./ShopTab";
import LeaderboardTab from "./LeaderboardTab";
import RankIcon from "./RankIcon";
import DailyRewardsModal from "./DailyRewardsModal";
import { getDailyRewardInfo, claimDailyReward } from "./dailyRewards";
import StartOverlay from "./StartOverlay";
import LuckySpinModal from "./LuckySpinModal";
import { getSpinInfo } from "./luckySpinData";
import type { SpinPrize } from "./luckySpinData";
import MarketEventBanner from "./MarketEventBanner";
import ComboModal from "./ComboModal";
import {
  MarketEventType, EVENT_CONFIGS,
  EVENT_COOLDOWN_SECS, EVENT_DURATION_SECS, randomEvent,
} from "./marketEvents";
import {
  MISSIONS, MissionsState, INITIAL_MISSIONS_STATE,
  todayStr, isMissionComplete, isMissionClaimed,
  getDailyCombo, UPGRADE_LABELS,
} from "./missions";
import {
  ReferralState, ReferralEntry,
  REFERRAL_KEY, initReferralState, parseRefParam,
  calcKickbackHr, REGULAR_BONUS,
} from "./referrals";
import type { RankDef } from "./rankTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameState {
  balance: number;
  tapValue: number;
  energy: number;
  maxEnergy: number;
  upgrades: Record<string, number>;
  totalEarned: number;
  lastSaved: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
}

interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  baseCost: number;
  baseIncome: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY      = "tap_game_state_v2";
const MISSIONS_KEY     = "tap_missions_v1";
const MAX_ENERGY       = 500;
const ENERGY_RECHARGE_RATE  = 1;          // 1 energy/s → full 500 in ~8 min
const OFFLINE_CAP_SECS      = 3 * 3600;   // max 3 h of passive offline income

const UPGRADES: UpgradeDef[] = [
  { id: "u1", name: "Mining Rig",    description: "Basic mining rig setup",       icon: Pickaxe,  baseCost: 100,   baseIncome: 50   },
  { id: "u2", name: "Trading Bot",   description: "Automated crypto trading",     icon: Bot,      baseCost: 250,   baseIncome: 120  },
  { id: "u3", name: "Crypto Wallet", description: "Secure storage solution",      icon: Wallet,   baseCost: 500,   baseIncome: 200  },
  { id: "u4", name: "DeFi Pool",     description: "Liquidity provider rewards",   icon: Droplets, baseCost: 1000,  baseIncome: 400  },
  { id: "u5", name: "NFT Studio",    description: "Mint and trade digital art",   icon: Palette,  baseCost: 2500,  baseIncome: 900  },
  { id: "u6", name: "DAO Vote",      description: "Governance participation",     icon: Vote,     baseCost: 5000,  baseIncome: 1800 },
  { id: "u7", name: "Yield Farm",    description: "Advanced crop rotation",       icon: Sprout,   baseCost: 10000, baseIncome: 3500 },
  { id: "u8", name: "Quantum Node",  description: "Next-gen verification layer",  icon: Cpu,      baseCost: 25000, baseIncome: 8000 },
];

const RANKS: RankDef[] = [
  { level: 1,  title: "Rookie",      threshold: 0,                hex: "#f5c518", color: "#f5c518", shadowRgb: "245,197,24",   gradient: "linear-gradient(135deg,#f5c518,#e89b00)",              particleColor: "#f5c518" },
  { level: 2,  title: "Trader",      threshold: 1_000,            hex: "#00bfff", color: "#00bfff", shadowRgb: "0,191,255",    gradient: "linear-gradient(135deg,#00bfff,#0077cc)",              particleColor: "#00bfff" },
  { level: 3,  title: "Miner",       threshold: 10_000,           hex: "#00e676", color: "#00e676", shadowRgb: "0,230,118",    gradient: "linear-gradient(135deg,#00e676,#00a152)",              particleColor: "#00e676" },
  { level: 4,  title: "Analyst",     threshold: 100_000,          hex: "#c084fc", color: "#c084fc", shadowRgb: "192,132,252",  gradient: "linear-gradient(135deg,#c084fc,#7c3aed)",              particleColor: "#c084fc" },
  { level: 5,  title: "Whale",       threshold: 1_000_000,        hex: "#22d3ee", color: "#22d3ee", shadowRgb: "34,211,238",   gradient: "linear-gradient(135deg,#22d3ee,#0e7490)",              particleColor: "#22d3ee" },
  { level: 6,  title: "Mogul",       threshold: 10_000_000,       hex: "#fb923c", color: "#fb923c", shadowRgb: "251,146,60",   gradient: "linear-gradient(135deg,#fb923c,#c2410c)",              particleColor: "#fb923c" },
  { level: 7,  title: "Legend",      threshold: 100_000_000,      hex: "#f43f5e", color: "#f43f5e", shadowRgb: "244,63,94",    gradient: "linear-gradient(135deg,#f43f5e,#9f1239)",              particleColor: "#f43f5e" },
  { level: 8,  title: "Sovereign",   threshold: 1_000_000_000,    hex: "#ffd700", color: "#ffd700", shadowRgb: "255,215,0",    gradient: "linear-gradient(135deg,#ffd700,#ff6b00,#ffd700)",      particleColor: "#ffd700" },
  { level: 9,  title: "Emperor",     threshold: 10_000_000_000,   hex: "#818cf8", color: "#818cf8", shadowRgb: "129,140,248",  gradient: "linear-gradient(135deg,#818cf8,#4f46e5)",              particleColor: "#818cf8" },
  { level: 10, title: "Titan",       threshold: 100_000_000_000,  hex: "#e11d48", color: "#e11d48", shadowRgb: "225,29,72",    gradient: "linear-gradient(135deg,#e11d48,#881337)",              particleColor: "#e11d48" },
  { level: 11, title: "Cosmic",      threshold: 1_000_000_000_000,hex: "#a78bfa", color: "#a78bfa", shadowRgb: "167,139,250",  gradient: "linear-gradient(135deg,#a78bfa,#7c3aed,#06b6d4)",      particleColor: "#a78bfa" },
  { level: 12, title: "Infinity",    threshold: 10_000_000_000_000,hex:"#f0f0f0", color: "#f0f0f0", shadowRgb: "240,240,240",  gradient: "linear-gradient(135deg,#ffffff,#a0a0ff,#ffffff)",      particleColor: "#f0f0f0" },
];

const INITIAL_STATE: GameState = {
  balance: 0, tapValue: 1, energy: MAX_ENERGY,
  maxEnergy: MAX_ENERGY, upgrades: {}, totalEarned: 0, lastSaved: Date.now(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

function calcCost(baseCost: number, level: number) {
  return Math.floor(baseCost * Math.pow(1.15, level));
}

function calcPassiveHr(upgrades: Record<string, number>) {
  return UPGRADES.reduce((t, u) => t + (upgrades[u.id] || 0) * u.baseIncome, 0);
}

function getRank(totalEarned: number): RankDef {
  let r = RANKS[0];
  for (const rank of RANKS) { if (totalEarned >= rank.threshold) r = rank; else break; }
  return r;
}

function getNextRank(level: number): RankDef | null {
  return RANKS.find(r => r.level === level + 1) ?? null;
}

function resetMissionsIfNewDay(ms: MissionsState): MissionsState {
  const today = todayStr();
  if (ms.date === today) return ms;
  return { ...INITIAL_MISSIONS_STATE, date: today };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelUpToast({ rank, onDone }: { rank: RankDef; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ y: -80, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -80, opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none"
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-sm"
        style={{ background: "rgba(15,15,25,0.95)", borderColor: rank.hex, boxShadow: `0 0 30px rgba(${rank.shadowRgb},0.5)` }}>
        <motion.div animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Award className="w-7 h-7" style={{ color: rank.hex }} />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Rank Up!</span>
          <span className="text-lg font-black tracking-tight" style={{ color: rank.hex }}>{rank.title}</span>
        </div>
        <span className="text-xs text-white/40 ml-1">Lv.{rank.level}</span>
      </div>
    </motion.div>
  );
}

function RankBadge({ rank, totalEarned }: { rank: RankDef; totalEarned: number }) {
  const next = getNextRank(rank.level);
  const pct  = next ? Math.min(1, (totalEarned - rank.threshold) / (next.threshold - rank.threshold)) : 1;
  return (
    <div className="mx-5 mb-3 rounded-2xl border px-4 py-2.5 flex items-center gap-3"
      style={{ background: `rgba(${rank.shadowRgb},0.06)`, borderColor: `rgba(${rank.shadowRgb},0.3)` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
        style={{ background: rank.gradient, color: "#0e0e14", boxShadow: `0 0 12px rgba(${rank.shadowRgb},0.4)` }}>
        {rank.level}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold tracking-wide" style={{ color: rank.hex }}>{rank.title}</span>
          {next
            ? <span className="text-[10px] text-white/30 font-medium">{formatNumber(totalEarned)} / {formatNumber(next.threshold)}</span>
            : <span className="text-[10px] font-semibold" style={{ color: rank.hex }}>MAX RANK</span>}
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: rank.gradient }}
            initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        </div>
      </div>
      {next && (
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border opacity-40"
            style={{ borderColor: next.hex, color: next.hex }}>{next.level}</div>
          <span className="text-[9px] text-white/20 mt-0.5 font-medium">{next.title}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [gameState,    setGameState]    = useState<GameState>(INITIAL_STATE);
  const [missionsState,setMissionsState]= useState<MissionsState>({ ...INITIAL_MISSIONS_STATE, date: todayStr() });
  const [activeTab,    setActiveTab]    = useState<"tap" | "exchange" | "missions" | "shop" | "leaderboard">("tap");
  const [particles,    setParticles]    = useState<Particle[]>([]);
  const [levelUpRank,  setLevelUpRank]  = useState<RankDef | null>(null);
  const [activeEvent,    setActiveEvent]   = useState<MarketEventType | null>(null);
  const [eventSecsLeft,  setEventSecsLeft] = useState(0);
  const [showComboModal, setShowComboModal]= useState(false);
  const [referralState,  setReferralState] = useState<ReferralState>(initReferralState);
  const [showHrBreakdown,setShowHrBreakdown]= useState(false);
  const [muted,          setMuted]          = useState(false);
  const [gameStarted,    setGameStarted]    = useState(false);
  const [dailyInfo,      setDailyInfo]      = useState(() => getDailyRewardInfo());
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showSpinModal,  setShowSpinModal]  = useState(false);
  const [spinCanSpin,    setSpinCanSpin]    = useState(() => getSpinInfo().canSpin);

  const particleId     = useRef(0);
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const audioStarted   = useRef(false);
  const initialized    = useRef(false);
  const prevRankLv     = useRef(1);
  const activeEventRef = useRef<MarketEventType | null>(null);
  const passiveMultRef = useRef(1);
  const tapMultRef     = useRef(1);

  // Keep refs in sync with event state (synchronous — safe in render body for refs)
  activeEventRef.current = activeEvent;
  const eventCfg         = activeEvent ? EVENT_CONFIGS[activeEvent] : null;
  passiveMultRef.current = eventCfg?.passiveMult  ?? 1;
  tapMultRef.current     = eventCfg?.tapMult      ?? 1;
  const upgradeCostMult      = eventCfg?.upgradeCostMult      ?? 1;
  const missionRewardMult    = eventCfg?.missionRewardMult    ?? 1;

  // Derived
  const passiveHr  = useMemo(() => calcPassiveHr(gameState.upgrades), [gameState.upgrades]);
  const passiveSec = passiveHr / 3600;
  const rank       = useMemo(() => getRank(gameState.totalEarned), [gameState.totalEarned]);
  const effectivePassiveHr  = passiveHr  * (eventCfg?.passiveMult ?? 1);
  const effectiveTapDisplay = rank.level * (eventCfg?.tapMult ?? 1);

  // Daily secret combo — deterministic seed from today's date
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dailyCombo = useMemo(() => getDailyCombo(todayStr()), []);

  // 10% passive-income kickback from all referred friends
  const kickbackHr = useMemo(() => calcKickbackHr(referralState.referrals), [referralState.referrals]);

  // Pending-mission badge count
  const pendingMissions = useMemo(
    () => MISSIONS.filter(m => isMissionComplete(m, missionsState) && !isMissionClaimed(m, missionsState)).length,
    [missionsState]
  );

  // ── Background music ────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}bg-music.mp3`);
    audio.loop   = true;
    audio.volume = 0.35;
    audio.muted  = false;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const startAudio = useCallback(() => {
    if (!audioStarted.current && audioRef.current) {
      audioRef.current.play().catch(() => {/* autoplay blocked — user must interact again */});
      audioStarted.current = true;
    }
  }, []);

  const handleDailyRewardClaim = useCallback(() => {
    try {
      const reward = claimDailyReward();
      setGameState(prev => ({
        ...prev,
        balance:     prev.balance     + reward,
        totalEarned: prev.totalEarned + reward,
      }));
      // Burst of particles from screen centre
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight * 0.52;
      const slice = Math.floor(reward / 5);
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const p = {
            id: ++particleId.current,
            x: cx + (Math.random() - 0.5) * 100,
            y: cy + (Math.random() - 0.5) * 50,
            value: slice,
          };
          setParticles(pts => [...pts, p]);
          setTimeout(() => setParticles(pts => pts.filter(pt => pt.id !== p.id)), 1200);
        }, i * 130);
      }
      setDailyInfo(getDailyRewardInfo());
    } catch { /* already claimed */ }
  }, []);

  // ── Lucky Spin prize handler ──────────────────────────────────────────────
  const handleSpinPrize = useCallback((prize: SpinPrize) => {
    if (prize.type === "coins" && prize.value > 0) {
      setGameState(prev => ({
        ...prev,
        balance:     prev.balance     + prize.value,
        totalEarned: prev.totalEarned + prize.value,
      }));
    } else if (prize.type === "energy") {
      setGameState(prev => ({ ...prev, energy: prev.maxEnergy }));
    }
    setSpinCanSpin(false);
  }, []);

  // ── Game start (handles autoplay gate) ────────────────────────────────────
  const handleGameStart = useCallback(() => {
    setGameStarted(true);
    startAudio();
    // Show daily rewards after the start animation fades out
    if (getDailyRewardInfo().canClaim) {
      setTimeout(() => setShowDailyModal(true), 900);
    }
  }, [startAudio]);

  // Detect rank-up
  useEffect(() => {
    if (rank.level > prevRankLv.current) {
      setLevelUpRank(rank);
      prevRankLv.current = rank.level;
    }
  }, [rank]);

  // ── Combo completion detection ─────────────────────────────────────────────
  useEffect(() => {
    if (missionsState.comboClaimed) return;
    const allRevealed = dailyCombo.length === 3 &&
      dailyCombo.every(id => missionsState.comboRevealedIds.includes(id));
    if (!allRevealed) return;
    // Award 1 million coins and show celebration modal
    setGameState(prev => ({
      ...prev,
      balance:     prev.balance + 1_000_000,
      totalEarned: prev.totalEarned + 1_000_000,
    }));
    setMissionsState(prev => ({ ...prev, comboClaimed: true }));
    setShowComboModal(true);
  }, [missionsState.comboRevealedIds, missionsState.comboClaimed, dailyCombo]);

  // ── Market event: trigger every EVENT_COOLDOWN_SECS ────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!activeEventRef.current) {
        setActiveEvent(randomEvent());
        setEventSecsLeft(EVENT_DURATION_SECS);
      }
    }, EVENT_COOLDOWN_SECS * 1000);
    return () => clearInterval(id);
  }, []);

  // ── Market event: countdown while active ──────────────────────────────────
  useEffect(() => {
    if (!activeEvent) return;
    const id = setInterval(() => {
      setEventSecsLeft(prev => {
        if (prev <= 1) {
          setActiveEvent(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeEvent]);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Game state
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p    = JSON.parse(saved) as GameState;
        const now  = Date.now();
        const sOff    = Math.floor((now - p.lastSaved) / 1000);
        // Offline passive income is capped at OFFLINE_CAP_SECS (3 h max)
        const sOffCap = Math.min(sOff, OFFLINE_CAP_SECS);
        let offEarnings = 0, newEnergy = p.energy;
        if (sOff > 0) {
          offEarnings = Math.floor(sOffCap * calcPassiveHr(p.upgrades) / 3600);
          newEnergy   = Math.min(MAX_ENERGY, p.energy + sOffCap * ENERGY_RECHARGE_RATE);
        }
        const loaded: GameState = {
          ...INITIAL_STATE, ...p,
          balance:     p.balance + offEarnings,
          totalEarned: (p.totalEarned ?? 0) + offEarnings,
          energy:      newEnergy,
          maxEnergy:   MAX_ENERGY,
          lastSaved:   now,
        };
        setGameState(loaded);
        prevRankLv.current = getRank(loaded.totalEarned).level;
      } catch { /* ignore */ }
    }

    // Missions state
    const savedM = localStorage.getItem(MISSIONS_KEY);
    if (savedM) {
      try {
        const pm = JSON.parse(savedM) as MissionsState;
        // Merge with defaults so new fields (comboRevealedIds, comboClaimed) are never undefined
        setMissionsState(resetMissionsIfNewDay({ ...INITIAL_MISSIONS_STATE, ...pm }));
      } catch { /* ignore */ }
    }

    // Referral state
    const savedR = localStorage.getItem(REFERRAL_KEY);
    let newRef: ReferralState;
    if (savedR) {
      try {
        const pr = JSON.parse(savedR) as ReferralState;
        newRef = { ...initReferralState(), ...pr };
      } catch { newRef = initReferralState(); }
    } else {
      newRef = initReferralState();
    }
    // Apply join bonus if opened via referral link for the first time
    const refParam = parseRefParam();
    if (refParam && refParam !== newRef.myUserId && !newRef.joinBonusClaimed) {
      newRef = { ...newRef, referredBy: refParam, joinBonusClaimed: true };
      setGameState(prev => ({
        ...prev,
        balance:     prev.balance + REGULAR_BONUS,
        totalEarned: prev.totalEarned + REGULAR_BONUS,
      }));
    }
    setReferralState(newRef);
  }, []);

  // ── Passive income tick ────────────────────────────────────────────────────
  useEffect(() => {
    if (!passiveSec) return;
    const id = setInterval(() => {
      const effectiveSec = passiveSec * passiveMultRef.current;
      setGameState(prev => ({
        ...prev,
        balance:     prev.balance + effectiveSec,
        totalEarned: prev.totalEarned + effectiveSec,
      }));
      setMissionsState(prev => ({
        ...prev,
        passiveEarnedToday: prev.passiveEarnedToday + effectiveSec,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [passiveSec]);

  // ── Energy recharge ────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setGameState(prev => {
        if (prev.energy >= prev.maxEnergy) return prev;
        return { ...prev, energy: Math.min(prev.maxEnergy, prev.energy + ENERGY_RECHARGE_RATE) };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Persist ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setGameState(prev => {
        const s = { ...prev, lastSaved: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        return s;
      });
      setMissionsState(prev => {
        const fresh = resetMissionsIfNewDay(prev);
        localStorage.setItem(MISSIONS_KEY, JSON.stringify(fresh));
        return fresh;
      });
      setReferralState(prev => {
        localStorage.setItem(REFERRAL_KEY, JSON.stringify(prev));
        return prev;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // ── Tap ────────────────────────────────────────────────────────────────────
  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startAudio();
    setGameState(prev => {
      if (prev.energy <= 0) return prev;
      let x = window.innerWidth / 2, y = window.innerHeight / 2;
      if ("touches" in e && e.touches.length > 0) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
      else if ("clientX" in e) { x = e.clientX; y = e.clientY; }
      const effectiveTap = Math.floor(getRank(prev.totalEarned).level * tapMultRef.current);
      const p: Particle = { id: ++particleId.current, x, y, value: effectiveTap };
      setParticles(pts => [...pts, p]);
      setTimeout(() => setParticles(pts => pts.filter(pt => pt.id !== p.id)), 850);
      return { ...prev, balance: prev.balance + effectiveTap, totalEarned: prev.totalEarned + effectiveTap, energy: prev.energy - 1 };
    });
    setMissionsState(prev => ({
      ...prev,
      tapsToday: prev.tapsToday + 1,
      balancePeak: Math.max(prev.balancePeak, gameState.balance + Math.floor(rank.level * tapMultRef.current)),
    }));
  }, [gameState.balance, rank.level]);

  // ── Buy upgrade ────────────────────────────────────────────────────────────
  const buyUpgrade = useCallback((upgradeId: string, cost: number) => {
    setGameState(prev => {
      if (prev.balance < cost) return prev;
      return { ...prev, balance: prev.balance - cost, upgrades: { ...prev.upgrades, [upgradeId]: (prev.upgrades[upgradeId] || 0) + 1 } };
    });
    setMissionsState(prev => {
      // Reveal combo slot if this upgrade is part of today's combo and not yet revealed
      const alreadyRevealed = prev.comboRevealedIds.includes(upgradeId);
      const isComboItem = dailyCombo.includes(upgradeId);
      const newRevealedIds = isComboItem && !alreadyRevealed
        ? [...prev.comboRevealedIds, upgradeId]
        : prev.comboRevealedIds;
      return {
        ...prev,
        upgradeSpendToday: prev.upgradeSpendToday + cost,
        comboRevealedIds: newRevealedIds,
      };
    });
  }, [dailyCombo]);

  // ── Claim mission ──────────────────────────────────────────────────────────
  const claimMission = useCallback((missionId: string, reward: number) => {
    const evCfg = activeEventRef.current ? EVENT_CONFIGS[activeEventRef.current] : null;
    const effectiveReward = Math.floor(reward * (evCfg?.missionRewardMult ?? 1));
    setGameState(prev => ({ ...prev, balance: prev.balance + effectiveReward, totalEarned: prev.totalEarned + effectiveReward }));
    setMissionsState(prev => ({ ...prev, claimedIds: [...prev.claimedIds, missionId] }));
  }, []);

  // ── Claim shop offer ────────────────────────────────────────────────────────
  const claimShopOffer = useCallback((coins: number) => {
    setGameState(prev => ({ ...prev, balance: prev.balance + coins, totalEarned: prev.totalEarned + coins }));
  }, []);

  // ── Add referral (invite bonus) ────────────────────────────────────────────
  const handleAddReferral = useCallback((entry: ReferralEntry, bonus: number) => {
    setReferralState(prev => ({ ...prev, referrals: [...prev.referrals, entry] }));
    setGameState(prev => ({
      ...prev,
      balance:     prev.balance + bonus,
      totalEarned: prev.totalEarned + bonus,
    }));
  }, []);

  // ── Rank-derived styles ────────────────────────────────────────────────────
  const btnStyle   = useMemo(() => ({ boxShadow: `0 0 50px rgba(${rank.shadowRgb},0.35)`, borderColor: rank.hex }), [rank]);
  const ring1Style = useMemo(() => ({ borderColor: `rgba(${rank.shadowRgb},0.25)` }), [rank]);
  const ring2Style = useMemo(() => ({ borderColor: `rgba(${rank.shadowRgb},0.15)` }), [rank]);

  // ── Update balance peak for missions ──────────────────────────────────────
  useEffect(() => {
    setMissionsState(prev => ({
      ...prev,
      balancePeak: Math.max(prev.balancePeak, gameState.balance),
    }));
  }, [gameState.balance]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#050508] p-0 md:p-4 font-sans select-none overflow-hidden text-foreground">

      {/* Level-up toast */}
      <AnimatePresence>
        {levelUpRank && <LevelUpToast rank={levelUpRank} onDone={() => setLevelUpRank(null)} />}
      </AnimatePresence>

      {/* Lucky Spin modal */}
      <AnimatePresence>
        {showSpinModal && (
          <LuckySpinModal
            rank={rank}
            onPrizeClaimed={handleSpinPrize}
            onClose={() => setShowSpinModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Daily rewards modal */}
      <AnimatePresence>
        {showDailyModal && (
          <DailyRewardsModal
            info={dailyInfo}
            rank={rank}
            onClaim={handleDailyRewardClaim}
            onClose={() => {
              setShowDailyModal(false);
              setDailyInfo(getDailyRewardInfo());
            }}
          />
        )}
      </AnimatePresence>

      {/* Combo celebration modal */}
      <AnimatePresence>
        {showComboModal && (
          <ComboModal
            revealedIds={missionsState.comboRevealedIds}
            rank={rank}
            onClose={() => setShowComboModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Smartphone frame */}
      <div className="relative w-full h-[100dvh] md:h-[850px] max-w-[430px] bg-background md:rounded-[2.5rem] md:border-8 border-[#1a1a2e] overflow-hidden flex flex-col shadow-2xl">

        {/* Rank-colored ambient glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] blur-[100px] pointer-events-none transition-colors duration-1000"
          style={{ background: `rgba(${rank.shadowRgb},0.08)` }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[40%] blur-[100px] pointer-events-none transition-colors duration-1000"
          style={{ background: `rgba(${rank.shadowRgb},0.05)` }} />

        {/* ── Stats bar ── */}
        <div className="px-5 pt-7 pb-3 relative z-10 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Total Balance</span>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 transition-colors duration-700" style={{ color: rank.hex }} />
                <span className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                  {formatNumber(Math.floor(gameState.balance))}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Icon buttons row — gift + mute */}
              <div className="flex items-center gap-1.5">
                {/* Daily reward */}
                <button
                  onClick={() => setShowDailyModal(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    background:  dailyInfo.canClaim && !dailyInfo.claimed
                      ? `rgba(${rank.shadowRgb},0.18)` : "rgba(255,255,255,0.04)",
                    borderColor: dailyInfo.canClaim && !dailyInfo.claimed
                      ? `rgba(${rank.shadowRgb},0.55)` : "rgba(255,255,255,0.1)",
                    boxShadow:   dailyInfo.canClaim && !dailyInfo.claimed
                      ? `0 0 12px rgba(${rank.shadowRgb},0.35)` : undefined,
                  }}
                  aria-label="Daily rewards"
                >
                  <Gift className="w-3.5 h-3.5" style={{
                    color: dailyInfo.canClaim && !dailyInfo.claimed ? rank.hex : "rgba(255,255,255,0.28)",
                  }} />
                </button>

                {/* Mute / Unmute toggle */}
                <button
                  onClick={() => { startAudio(); setMuted(m => !m); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    background:   muted ? "rgba(255,255,255,0.05)" : `rgba(${rank.shadowRgb},0.1)`,
                    borderColor:  muted ? "rgba(255,255,255,0.12)"  : `rgba(${rank.shadowRgb},0.35)`,
                  }}
                  aria-label={muted ? "Unmute music" : "Mute music"}
                >
                  {muted
                    ? <VolumeX className="w-3.5 h-3.5 text-white/35" />
                    : <Volume2 className="w-3.5 h-3.5" style={{ color: rank.hex }} />
                  }
                </button>
              </div>

              {/* Tap chip — crimson during MARKET_CRASH, normal otherwise */}
              <div
                className="px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium border transition-colors duration-500"
                style={eventCfg?.tapMult && eventCfg.tapMult > 1
                  ? { background: `rgba(${eventCfg.rgb},0.12)`, borderColor: `rgba(${eventCfg.rgb},0.4)`, color: eventCfg.hex }
                  : undefined}
              >
                <Zap className="w-3 h-3" style={eventCfg?.tapMult && eventCfg.tapMult > 1 ? { color: eventCfg.hex } : { color: "var(--secondary)" }} />
                <span>+{formatNumber(effectiveTapDisplay)} / tap</span>
              </div>
              {/* Passive /hr chip — tappable, shows friends kickback breakdown */}
              <button
                onClick={() => setShowHrBreakdown(v => !v)}
                className="px-3 py-1.5 rounded-full flex flex-col items-end gap-0.5 text-xs font-medium border transition-colors duration-500"
                style={eventCfg && eventCfg.passiveMult !== 1
                  ? { background: `rgba(${eventCfg.rgb},0.12)`, borderColor: `rgba(${eventCfg.rgb},0.4)`, color: eventCfg.hex }
                  : undefined}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3" style={eventCfg && eventCfg.passiveMult !== 1 ? { color: eventCfg.hex } : { color: "var(--secondary)" }} />
                  <span>{formatNumber(effectivePassiveHr + kickbackHr)} / hr</span>
                </div>
                {kickbackHr > 0 && (
                  <AnimatePresence>
                    {showHrBreakdown && (
                      <motion.span
                        key="kb"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[9px] font-black leading-none"
                        style={{ color: "#a78bfa" }}
                      >
                        +{formatNumber(kickbackHr)}/hr from friends
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Market event banner ── */}
        <MarketEventBanner eventType={activeEvent} cfg={eventCfg} secsLeft={eventSecsLeft} />

        {/* ── Rank badge ── */}
        <RankBadge rank={rank} totalEarned={gameState.totalEarned} />

        {/* ── Main content ── */}
        <div className="flex-1 relative z-10 overflow-hidden flex flex-col">

          {/* TAP ROOM */}
          {activeTab === "tap" && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-10">
              <div className="relative">
                <div className="absolute inset-[-20%] rounded-full border animate-[spin_10s_linear_infinite]" style={ring1Style} />
                <div className="absolute inset-[-10%] rounded-full border animate-[spin_15s_linear_infinite_reverse]" style={ring2Style} />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  onClick={handleTap} onTouchStart={handleTap}
                  className="relative w-56 h-56 rounded-full bg-gradient-to-br from-card to-background border-4 flex items-center justify-center overflow-hidden group touch-manipulation transition-[border-color,box-shadow] duration-700"
                  style={btnStyle} data-testid="main-clicker"
                >
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle, rgba(${rank.shadowRgb},0.15) 0%, transparent 70%)` }} />
                  <div className="w-24 h-24 transition-all duration-700">
                    <RankIcon rank={rank} />
                  </div>
                </motion.button>
              </div>

              {/* Lucky Spin button */}
              <motion.button
                onClick={() => setShowSpinModal(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black border transition-all duration-300"
                style={{
                  background:  `rgba(${rank.shadowRgb},0.1)`,
                  borderColor: spinCanSpin ? `rgba(${rank.shadowRgb},0.55)` : `rgba(${rank.shadowRgb},0.22)`,
                  color:       rank.hex,
                  boxShadow:   spinCanSpin ? `0 0 16px rgba(${rank.shadowRgb},0.35)` : "none",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base leading-none">🎰</span>
                Lucky Spin
                {spinCanSpin && (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <div className="w-full max-w-[280px] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-secondary" /><span>Energy</span></div>
                  <span>{Math.floor(gameState.energy)} / {gameState.maxEnergy}</span>
                </div>
                <div className="h-3 w-full bg-card rounded-full overflow-hidden border border-card-border">
                  <div className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%`, background: `linear-gradient(to right, #00bfff, ${rank.hex})` }} />
                </div>
              </div>
            </div>
          )}

          {/* EXCHANGE */}
          {activeTab === "exchange" && (
            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 space-y-3">

              {/* ── Daily Secret Combo mystery slots ── */}
              <div className="rounded-2xl border border-card-border bg-card px-4 pt-3.5 pb-4 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🔐</span>
                      <span className="text-xs font-black uppercase tracking-wider text-white">Daily Secret Combo</span>
                    </div>
                    <span className="text-[10px] text-white/30 pl-5">Upgrade all 3 hidden items to win +1,000,000 coins</span>
                  </div>
                  {missionsState.comboClaimed ? (
                    <span className="text-[10px] font-black px-2 py-1 rounded-full"
                      style={{ background: "rgba(0,230,118,0.12)", color: "#00e676", border: "1px solid rgba(0,230,118,0.3)" }}>
                      CLAIMED ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-white/30">
                      {missionsState.comboRevealedIds.length}/3
                    </span>
                  )}
                </div>

                {/* 3 mystery slots */}
                <div className="grid grid-cols-3 gap-2">
                  {dailyCombo.map((comboId, slotIdx) => {
                    const revealed = missionsState.comboRevealedIds.includes(comboId);
                    const upgrade  = UPGRADES.find(u => u.id === comboId);
                    const Icon     = upgrade?.icon;
                    return (
                      <motion.div
                        key={slotIdx}
                        layout
                        className="rounded-xl flex flex-col items-center justify-center gap-1.5 py-3 border relative overflow-hidden"
                        style={revealed
                          ? { background: "rgba(0,230,118,0.07)", borderColor: "rgba(0,230,118,0.35)" }
                          : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }
                        }
                      >
                        {revealed && Icon ? (
                          <>
                            {/* Subtle green shimmer on reveal */}
                            <motion.div
                              initial={{ opacity: 0.6 }} animate={{ opacity: 0 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: "radial-gradient(circle, rgba(0,230,118,0.25) 0%, transparent 70%)" }}
                            />
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(0,230,118,0.12)" }}>
                              <Icon className="w-4 h-4" style={{ color: "#00e676" }} />
                            </div>
                            <span className="text-[9px] font-bold text-center leading-tight px-1"
                              style={{ color: "#00e676" }}>
                              {UPGRADE_LABELS[comboId]}
                            </span>
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]"
                              style={{ background: "#00e676" }}>
                              ✓
                            </motion.div>
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: slotIdx * 0.3 }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)" }}
                            >
                              <span className="text-base font-black text-white/20">?</span>
                            </motion.div>
                            <span className="text-[9px] text-white/20 font-medium">Mystery</span>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Claimed banner */}
                {missionsState.comboClaimed && (
                  <div className="rounded-xl py-2 text-center text-[11px] font-black"
                    style={{ background: "rgba(0,230,118,0.08)", color: "#00e676", border: "1px solid rgba(0,230,118,0.2)" }}>
                    🎉 Combo complete — +1,000,000 coins awarded today!
                  </div>
                )}
              </div>

              <div className="bg-card border border-card-border rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 shrink-0" style={{ color: rank.hex }} />
                <div>
                  <div className="text-xs text-muted-foreground">All-time earned</div>
                  <div className="text-sm font-bold text-white">{formatNumber(Math.floor(gameState.totalEarned))} coins</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: rank.hex }} />
                  <span className="text-sm font-bold" style={{ color: rank.hex }}>{rank.title}</span>
                </div>
              </div>
              {/* Gas Fee Spike warning strip */}
              {activeEvent === "GAS_FEE_SPIKE" && eventCfg && (
                <div className="rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold mb-1"
                  style={{ background: `rgba(${eventCfg.rgb},0.1)`, border: `1px solid rgba(${eventCfg.rgb},0.3)`, color: eventCfg.hex }}>
                  <span>⛽</span>
                  <span>Gas Fee Spike active — all upgrade costs +20%</span>
                </div>
              )}
              {UPGRADES.map(upgrade => {
                const level    = gameState.upgrades[upgrade.id] || 0;
                const baseCost = calcCost(upgrade.baseCost, level);
                const cost     = Math.ceil(baseCost * upgradeCostMult);
                const can      = gameState.balance >= cost;
                const Icon     = upgrade.icon;
                const spiked   = upgradeCostMult > 1;
                return (
                  <div key={upgrade.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4"
                    data-testid={`upgrade-card-${upgrade.id}`}>
                    <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-white truncate pr-2">{upgrade.name}</h3>
                        <span className="text-xs font-medium bg-background px-2 py-0.5 rounded text-muted-foreground shrink-0">Lv.{level}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">{upgrade.description}</p>
                      <div className="text-xs font-medium text-secondary">+{formatNumber(upgrade.baseIncome * Math.max(1, level))} / hr</div>
                    </div>
                    <button
                      onClick={() => buyUpgrade(upgrade.id, cost)} disabled={!can}
                      className={`shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all ${can ? "active:scale-95 hover:opacity-90" : "opacity-40 cursor-not-allowed"}`}
                      style={can ? { background: `rgba(${rank.shadowRgb},0.12)`, borderColor: `rgba(${rank.shadowRgb},0.35)`, color: rank.hex } : undefined}
                      data-testid={`upgrade-buy-${upgrade.id}`}
                    >
                      <span className="text-xs font-semibold mb-0.5">BUY</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Coins className="w-3 h-3" />
                        <span style={spiked ? { color: eventCfg?.hex } : undefined}>{formatNumber(cost)}</span>
                      </div>
                      {spiked && <span className="text-[9px] opacity-60 mt-0.5">+20%</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* MISSIONS */}
          {activeTab === "missions" && (
            <MissionsTab
              missionsState={missionsState}
              rank={rank}
              onClaim={claimMission}
              dailyCombo={dailyCombo}
              referralState={referralState}
              onAddReferral={handleAddReferral}
            />
          )}

          {/* SHOP */}
          {activeTab === "shop" && (
            <ShopTab rank={rank} allRanks={RANKS} onClaim={claimShopOffer} />
          )}

          {/* LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <LeaderboardTab
              totalEarned={gameState.totalEarned}
              playerRankLevel={rank.level}
              rank={rank}
            />
          )}
        </div>

        {/* ── Bottom Nav ── */}
        <div className="relative z-20 bg-card border-t border-card-border p-4 pb-8 md:pb-4 flex gap-2">

          {/* Tap Room tab */}
          <button onClick={() => setActiveTab("tap")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-colors ${activeTab === "tap" ? "text-white" : "text-muted-foreground hover:bg-white/5"}`}
            style={activeTab === "tap" ? { background: `rgba(${rank.shadowRgb},0.12)` } : undefined}
            data-testid="tab-tap">
            <Zap className="w-5 h-5" style={activeTab === "tap" ? { color: rank.hex } : undefined} />
            <span className="text-xs font-medium">Tap Room</span>
          </button>

          {/* Exchange tab */}
          <button onClick={() => setActiveTab("exchange")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-colors ${activeTab === "exchange" ? "text-white" : "text-muted-foreground hover:bg-white/5"}`}
            style={activeTab === "exchange" ? { background: `rgba(${rank.shadowRgb},0.12)` } : undefined}
            data-testid="tab-exchange">
            <Store className="w-5 h-5" style={activeTab === "exchange" ? { color: rank.hex } : undefined} />
            <span className="text-xs font-medium">Exchange</span>
          </button>

          {/* Missions tab */}
          <button onClick={() => setActiveTab("missions")}
            className={`relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${activeTab === "missions" ? "text-white" : "text-muted-foreground hover:bg-white/5"}`}
            style={activeTab === "missions" ? { background: `rgba(${rank.shadowRgb},0.12)` } : undefined}
            data-testid="tab-missions">
            <div className="relative">
              <CheckSquare className="w-5 h-5" style={activeTab === "missions" ? { color: rank.hex } : undefined} />
              <AnimatePresence>
                {pendingMissions > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black"
                    style={{ background: rank.hex }}
                  >
                    {pendingMissions}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-xs font-medium">Missions</span>
          </button>

          {/* Shop tab */}
          <button onClick={() => setActiveTab("shop")}
            className={`relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${activeTab === "shop" ? "text-white" : "text-muted-foreground hover:bg-white/5"}`}
            style={activeTab === "shop" ? { background: `rgba(${rank.shadowRgb},0.12)` } : undefined}
            data-testid="tab-shop">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" style={activeTab === "shop" ? { color: rank.hex } : undefined} />
              {rank.level >= 5 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full"
                  style={{ background: rank.hex, boxShadow: `0 0 6px ${rank.hex}` }}
                />
              )}
            </div>
            <span className="text-[10px] font-medium">VIP Shop</span>
          </button>

          {/* Leaderboard tab */}
          <button onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${activeTab === "leaderboard" ? "text-white" : "text-muted-foreground hover:bg-white/5"}`}
            style={activeTab === "leaderboard" ? { background: `rgba(${rank.shadowRgb},0.12)` } : undefined}
            data-testid="tab-leaderboard">
            <Award className="w-5 h-5" style={activeTab === "leaderboard" ? { color: rank.hex } : undefined} />
            <span className="text-[10px] font-medium">Rankings</span>
          </button>
        </div>
      </div>

      {/* Start overlay — shown on every page load to satisfy browser autoplay policy */}
      <AnimatePresence>
        {!gameStarted && <StartOverlay onStart={handleGameStart} />}
      </AnimatePresence>

      {/* Particle overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div key={p.id}
              initial={{ x: p.x, y: p.y, opacity: 1, scale: 1.2 }}
              animate={{ x: p.x, y: p.y - 90, opacity: 0, scale: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-xl font-black pointer-events-none whitespace-nowrap"
              style={{ color: rank.hex, filter: `drop-shadow(0 0 8px rgba(${rank.shadowRgb},0.8))`, left: 0, top: 0 }}
            >
              +{p.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
