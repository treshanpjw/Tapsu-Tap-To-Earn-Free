// ─── Leaderboard System ───────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id:        string;
  rank:      number;
  name:      string;
  score:     number;
  rankLevel: number; // 1–12
  isPlayer:  boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAMES_POOL = [
  "CryptoKing",   "MoonHodler",   "SatoshiLord",  "DiamondHands",
  "WhaleAlert",   "BitFlipper",   "BullRider",     "GasOptimizer",
  "DegenTrader",  "MemeCoiner",   "NFTHunter",     "BlockchainBro",
  "AlphaSeeker",  "TaprootNode",  "LiquidityLP",   "StakingQueen",
  "HodlForever",  "AltcoinAlex",  "DeFiWizard",    "GweiSaver",
  "ZeroFeeHero",  "RektRecovery", "PumpDetector",  "FudFighter",
  "BearKiller",   "BullishBob",   "FloorPrice",    "VelocityVan",
  "MarginMaster", "YieldFarmer",  "LeveredLisa",   "ShortSqueeze",
  "TrendTrader",  "VolatilityV",  "SwapKing",      "BridgeBuilder",
  "LayerTwoLeo",  "RollupRider",  "StealthMode",   "WhitelistW",
  "MintMachine",  "FlipperFrank", "BluechipBeth",  "Metaversed",
  "PlayToEarn",   "P2EChampion",  "GuildMaster",   "ScholarMode",
  "TourneyTed",   "QuestQueen",   "RaidBoss",      "LootGoblin",
  "SpeedrunS",    "PvPPro",       "GlitchHunter",  "ComboKing",
  "CriticalHit",  "ClutchPlayer", "AceCarry",      "TurboTapper",
  "ClickMaster",  "AutoClicker",  "GrindMode",     "AfkFarmer",
  "IdleIncome",   "PassiveP",     "CompoundCarl",  "InterestIvy",
  "DividendDave", "StakeStar",    "ValidatorV",    "NodeRunner",
  "PoolPirate",   "BoostBoris",   "MultiplierM",   "BonusHunter",
  "JackpotJess",  "LuckyStreak",  "ChainChomp",    "TokenTom",
  "CoinCollect",  "BalanceBot",   "WalletWendy",   "ColdStorageC",
  "SeedPhrase",   "PaperHands",   "SteelNerves",   "ZenTrader",
  "ByteMaster",   "HashRater",    "BlockSmith",    "TxFeeKing",
  "GenesisNode",  "OracleOwl",    "ArbTracer",     "FlashLoanF",
  "SandwichBot",  "LiqSniper",    "FrontRunner",   "DustSweeper",
];

// ─── Seeded PRNG (LCG) ────────────────────────────────────────────────────────

function makePrng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

export function getTodaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ─── Rank level → accent color ────────────────────────────────────────────────

export function rankLevelColor(level: number): string {
  if (level >= 12) return "#f97316"; // Legendary
  if (level >= 11) return "#f59e0b"; // Gold
  if (level >= 9)  return "#ec4899"; // Rose
  if (level >= 7)  return "#a855f7"; // Purple
  if (level >= 5)  return "#3b82f6"; // Blue
  if (level >= 3)  return "#22c55e"; // Green
  return "#9ca3af";                  // Gray
}

// ─── Build ────────────────────────────────────────────────────────────────────

export function buildLeaderboard(
  playerScore:     number,
  playerRankLevel: number,
  dateSeed:        number,
): LeaderboardEntry[] {
  const rand = makePrng(dateSeed);

  /** Score for the Nth mock player (1-based, log-ish decay) */
  function mockScore(n: number): number {
    const t    = Math.pow((100 - n) / 99, 2.0);
    const base = 55_000_000 * t + 50_000;
    const jitter = 1 + (rand() - 0.5) * 0.15;
    return Math.max(0, Math.round(base * jitter));
  }

  /** Rank level for the Nth mock player */
  function mockRankLv(n: number): number {
    const t = (100 - n) / 99;
    return Math.max(1, Math.min(12, Math.round(t * 12 + rand() * 1.5)));
  }

  const usedNames = new Set<string>();
  const mocks: Omit<LeaderboardEntry, "rank">[] = [];

  for (let i = 1; i <= 99; i++) {
    let name = NAMES_POOL[Math.floor(rand() * NAMES_POOL.length)];
    let tries = 0;
    while (usedNames.has(name) && tries++ < 8) {
      name = NAMES_POOL[Math.floor(rand() * NAMES_POOL.length)];
    }
    if (usedNames.has(name)) name = name + String(Math.floor(rand() * 99 + 1));
    usedNames.add(name);

    mocks.push({ id: `mock_${i}`, name, score: mockScore(i), rankLevel: mockRankLv(i), isPlayer: false });
  }

  // Insert player and sort
  const all = [
    ...mocks,
    { id: "player", name: "You", score: playerScore, rankLevel: playerRankLevel, isPlayer: true },
  ].sort((a, b) => b.score - a.score);

  return all.map((e, i) => ({ ...e, rank: i + 1 }));
}
