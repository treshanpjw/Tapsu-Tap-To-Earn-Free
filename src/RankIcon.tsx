// ─── Rank-specific SVG icons ─────────────────────────────────────────────────
// Each level gets a progressively more complex, glowing, animated SVG coin.
// All animations use SVG-native animateTransform / animate — zero CSS globals.
// viewBox="0 0 96 96", coin centre = (48,48), radius ≈ 36.

import type { RankDef } from "./rankTypes";

interface P { hex: string; rgb: string; } // rgb = "R,G,B" string

// ─── Shared glow filter (inlined per SVG with unique id) ─────────────────────

function GlowFilter({ id, hex, blur = 5 }: { id: string; hex: string; blur?: number }) {
  return (
    <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="b" />
      <feFlood floodColor={hex} floodOpacity="0.8" result="c" />
      <feComposite in="c" in2="b" operator="in" result="g" />
      <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  );
}

// helper: N evenly-spaced points on a circle
function ring(cx: number, cy: number, r: number, n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

// ─── L1 · Rookie — Simple gold coin ──────────────────────────────────────────
function L1({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g1" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fff9c4" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#7a5500" />
        </radialGradient>
        <GlowFilter id="f1" hex={hex} blur={4} />
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.25)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g1)" filter="url(#f1)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <text x="48" y="60" textAnchor="middle" fontSize="30" fontWeight="900" fontFamily="Georgia,serif" fill="rgba(255,255,255,0.92)">$</text>
      <ellipse cx="33" cy="31" rx="9" ry="5" fill="white" opacity="0.28" transform="rotate(-35 33 31)" />
    </svg>
  );
}

// ─── L2 · Trader — Blue coin with rising candlestick chart ───────────────────
function L2({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g2" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#c8f0ff" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#003a7a" />
        </radialGradient>
        <GlowFilter id="f2" hex={hex} blur={5} />
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.22)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g2)" filter="url(#f2)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* Trending chart line */}
      <polyline points="22,64 32,56 42,59 54,42 66,45 74,30" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Arrow head */}
      <polyline points="66,22 74,30 82,22" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Candles */}
      <rect x="22" y="58" width="5" height="8" rx="1" fill="rgba(255,100,100,0.65)" />
      <rect x="34" y="50" width="5" height="8" rx="1" fill="rgba(100,255,160,0.65)" />
      <rect x="46" y="44" width="5" height="9" rx="1" fill="rgba(100,255,160,0.65)" />
      <ellipse cx="33" cy="31" rx="9" ry="5" fill="white" opacity="0.22" transform="rotate(-35 33 31)" />
    </svg>
  );
}

// ─── L3 · Miner — Green coin with pickaxe and corner gems ────────────────────
function L3({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g3" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#c0ffd0" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#004d25" />
        </radialGradient>
        <GlowFilter id="f3" hex={hex} blur={5} />
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.22)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g3)" filter="url(#f3)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Pickaxe handle */}
      <line x1="36" y1="60" x2="60" y2="36" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
      {/* Pickaxe head */}
      <path d="M60,36 L72,24 L76,36 L64,40 Z" fill="rgba(255,255,255,0.88)" />
      <path d="M60,36 L48,24 L42,30 L54,42 Z" fill="rgba(255,255,255,0.65)" />
      {/* Corner gem diamonds */}
      {([[18,18],[78,18],[18,78],[78,78]] as [number,number][]).map(([x,y],i) => (
        <polygon key={i} points={`${x},${y-8} ${x+5},${y} ${x},${y+8} ${x-5},${y}`} fill="rgba(180,255,200,0.85)" />
      ))}
      {/* Sparkle stars */}
      {([[82,50],[12,46]] as [number,number][]).map(([x,y],i) => (
        <path key={i} d={`M${x},${y-4} L${x+1},${y-1} L${x+4},${y} L${x+1},${y+1} L${x},${y+4} L${x-1},${y+1} L${x-4},${y} L${x-1},${y-1}Z`} fill="white" opacity="0.8" />
      ))}
      <ellipse cx="33" cy="31" rx="9" ry="5" fill="white" opacity="0.22" transform="rotate(-35 33 31)" />
    </svg>
  );
}

// ─── L4 · Analyst — Purple coin with hexagonal circuit ───────────────────────
function L4({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g4" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#edd5ff" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#2d0070" />
        </radialGradient>
        <GlowFilter id="f4" hex={hex} blur={5} />
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.22)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g4)" filter="url(#f4)" />
      {/* Outer hex */}
      <polygon points="48,22 66,32 66,52 48,62 30,52 30,32" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      {/* Inner hex */}
      <polygon points="48,32 58,38 58,50 48,56 38,50 38,38" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" />
      {/* Circuit traces to rim */}
      <path d="M48,22 L48,14 M66,32 L76,24 M66,52 L76,60 M48,62 L48,70 M30,52 L20,60 M30,32 L20,24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Junction pads */}
      {([[48,14],[76,24],[76,60],[48,70],[20,60],[20,24]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(255,255,255,0.7)" />
      ))}
      {/* Central chip */}
      <rect x="41" y="41" width="14" height="14" rx="2" fill={hex} stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
      <rect x="44" y="44" width="8" height="8" rx="1" fill="rgba(255,255,255,0.38)" />
      <ellipse cx="33" cy="31" rx="9" ry="5" fill="white" opacity="0.18" transform="rotate(-35 33 31)" />
    </svg>
  );
}

// ─── L5 · Whale — Cyan coin with diamond and wave bands ──────────────────────
function L5({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g5" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#c8faff" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#003d4d" />
        </radialGradient>
        <GlowFilter id="f5" hex={hex} blur={6} />
        <clipPath id="c5"><circle cx="48" cy="48" r="36" /></clipPath>
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.22)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g5)" filter="url(#f5)" />
      {/* Wave bands clipped to coin */}
      <g clipPath="url(#c5)">
        {[40,48,56].map((cy,i) => (
          <path key={i} d={`M12,${cy} Q24,${cy-8} 36,${cy} Q48,${cy+8} 60,${cy} Q72,${cy-8} 84,${cy}`}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
        ))}
      </g>
      {/* Outer diamond */}
      <polygon points="48,14 74,48 48,82 22,48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      {/* Diamond cross hair */}
      <line x1="22" y1="48" x2="74" y2="48" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <line x1="48" y1="14" x2="48" y2="82" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Inner gem */}
      <polygon points="48,34 60,48 48,62 36,48" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      {/* Corner sparkles */}
      {([[20,24],[76,24],[20,72],[76,72]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="white" opacity={i < 2 ? 0.7 : 0.45} />
      ))}
      <ellipse cx="33" cy="31" rx="9" ry="5" fill="white" opacity="0.2" transform="rotate(-35 33 31)" />
    </svg>
  );
}

// ─── L6 · Mogul — Orange coin with crown and laurels ─────────────────────────
function L6({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g6" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffe4c4" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#6b2000" />
        </radialGradient>
        <GlowFilter id="f6" hex={hex} blur={6} />
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.28)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g6)" filter="url(#f6)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Crown */}
      <path d="M30,64 L30,46 L38,54 L48,32 L58,54 L66,46 L66,64 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <rect x="29" y="61" width="38" height="7" rx="2.5" fill="rgba(255,210,120,0.75)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      {/* Crown gems */}
      <circle cx="37" cy="57" r="3.5" fill="rgba(255,80,80,0.9)" />
      <circle cx="48" cy="52" r="4" fill="rgba(80,210,255,0.9)" />
      <circle cx="59" cy="57" r="3.5" fill="rgba(255,80,80,0.9)" />
      {/* Laurel branches */}
      <path d="M14,64 Q12,54 16,46 Q19,42 22,44 Q18,52 22,56 Q24,58 27,56 Q22,62 24,70 Q17,68 14,64 Z" fill="rgba(255,255,255,0.28)" />
      <path d="M82,64 Q84,54 80,46 Q77,42 74,44 Q78,52 74,56 Q72,58 69,56 Q74,62 72,70 Q79,68 82,64 Z" fill="rgba(255,255,255,0.28)" />
      <ellipse cx="33" cy="29" rx="8" ry="4.5" fill="white" opacity="0.25" transform="rotate(-35 33 29)" />
    </svg>
  );
}

// ─── L7 · Legend — Red coin with star burst and central flame ─────────────────
function L7({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g7" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffb8c4" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#5a0015" />
        </radialGradient>
        <radialGradient id="g7s" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8c00" /><stop offset="100%" stopColor="#cc0000" />
        </radialGradient>
        <GlowFilter id="f7" hex={hex} blur={7} />
      </defs>
      {/* 8-point star burst behind coin */}
      <polygon
        points="48,6 52,40 82,30 60,48 82,66 52,56 48,90 44,56 14,66 36,48 14,30 44,40"
        fill="url(#g7s)" opacity="0.3" filter="url(#f7)" />
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.22)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g7)" filter="url(#f7)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Central flame */}
      <path d="M48,26 Q53,32 55,40 Q59,34 57,26 Q64,36 62,46 Q64,52 60,57 Q56,64 48,66 Q40,64 36,57 Q32,52 34,46 Q32,36 39,26 Q37,34 41,40 Q43,32 48,26 Z"
        fill="rgba(255,200,80,0.88)" />
      <path d="M48,36 Q51,41 52,46 Q54,43 52,36 Q56,43 54,50 Q52,54 48,56 Q44,54 42,50 Q40,43 44,36 Q42,43 44,46 Q45,41 48,36 Z"
        fill="rgba(255,255,255,0.72)" />
      <ellipse cx="33" cy="29" rx="8" ry="4.5" fill="white" opacity="0.2" transform="rotate(-35 33 29)" />
    </svg>
  );
}

// ─── L8 · Sovereign — Gold coin with spinning outer rings and sun rays ─────────
function L8({ hex, rgb }: P) {
  const spokes = ring(48, 48, 42, 16);
  const cardinalGems = ring(48, 48, 47, 4);
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g8" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fff9c4" /><stop offset="30%" stopColor="#ffd700" /><stop offset="75%" stopColor={hex} /><stop offset="100%" stopColor="#7a5500" />
        </radialGradient>
        <GlowFilter id="f8" hex={hex} blur={7} />
      </defs>
      {/* Slow-spin outer ring */}
      <g>
        <circle cx="48" cy="48" r="44" fill="none" stroke={`rgba(${rgb},0.4)`} strokeWidth="1.5" strokeDasharray="5 4" />
        {spokes.map(([x,y], i) => (
          <line key={i} x1={48 + (x-48)*0.9} y1={48 + (y-48)*0.9} x2={x} y2={y}
            stroke={`rgba(${rgb},0.65)`} strokeWidth={i % 2 === 0 ? 2 : 1} strokeLinecap="round" />
        ))}
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="14s" repeatCount="indefinite" />
      </g>
      {/* Counter-spin ring */}
      <g>
        <circle cx="48" cy="48" r="40" fill="none" stroke={`rgba(${rgb},0.28)`} strokeWidth="1" strokeDasharray="8 5" />
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="-360 48 48" dur="22s" repeatCount="indefinite" />
      </g>
      {/* Static sun rays */}
      {ring(48, 48, 37, 8).map(([x1,y1], i) => {
        const [x2,y2] = [48 + (x1-48)*1.24, 48 + (y1-48)*1.24];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hex} strokeWidth="3" strokeLinecap="round" opacity="0.55" />;
      })}
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.28)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g8)" filter="url(#f8)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {/* Cross */}
      <path d="M48,24 L48,72 M24,48 L72,48" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      {/* Cardinal gems */}
      {cardinalGems.map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={hex} stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
      ))}
      <circle cx="48" cy="48" r="10" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="5" fill="rgba(255,255,255,0.65)" />
      <ellipse cx="33" cy="29" rx="8" ry="4.5" fill="white" opacity="0.28" transform="rotate(-35 33 29)" />
    </svg>
  );
}

// ─── L9 · Emperor — Indigo coin with orbiting planet ring ────────────────────
function L9({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g9" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#dde0ff" /><stop offset="55%" stopColor={hex} /><stop offset="100%" stopColor="#1a006b" />
        </radialGradient>
        <GlowFilter id="f9" hex={hex} blur={7} />
      </defs>
      {/* Twinkling star field */}
      {([[12,18],[80,14],[84,72],[10,74],[40,8],[62,86],[88,42]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={i%2===0 ? 1.5 : 1} fill="white">
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2+i*0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.22)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g9)" filter="url(#f9)" />
      <circle cx="48" cy="48" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Orbital ring + orbiting body */}
      <g>
        <ellipse cx="48" cy="48" rx="44" ry="13" fill="none" stroke={`rgba(${rgb},0.5)`} strokeWidth="2.5" />
        <circle cx="92" cy="48" r="4.5" fill={hex}>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="8s" repeatCount="indefinite" />
      </g>
      {/* Orbital shadow arc */}
      <path d="M16,54 Q48,64 80,54" stroke="rgba(0,0,0,0.3)" strokeWidth="3" fill="none" />
      {/* Planet inner glow */}
      <circle cx="48" cy="48" r="14" fill={`rgba(${rgb},0.18)`} stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
      {/* Crescent */}
      <path d="M44,35 Q36,41 36,50 Q36,59 44,64 Q38,59 38,50 Q38,41 44,35 Z" fill="rgba(255,255,255,0.22)" />
      <ellipse cx="33" cy="29" rx="8" ry="4.5" fill="white" opacity="0.18" transform="rotate(-35 33 29)" />
    </svg>
  );
}

// ─── L10 · Titan — Red coin with pulsing lightning and cracks ─────────────────
function L10({ hex, rgb }: P) {
  const burstLines = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const rIn = 36, rOut = 36 + (i % 3 === 0 ? 14 : i % 3 === 1 ? 9 : 5);
    return {
      x1: 48 + Math.cos(a) * rIn, y1: 48 + Math.sin(a) * rIn,
      x2: 48 + Math.cos(a) * rOut, y2: 48 + Math.sin(a) * rOut,
      thick: i % 3 === 0,
    };
  });
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g10" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffaaaa" /><stop offset="45%" stopColor={hex} /><stop offset="100%" stopColor="#4a0012" />
        </radialGradient>
        <GlowFilter id="f10" hex={hex} blur={8} />
      </defs>
      {/* Energy burst lines behind coin */}
      {burstLines.map((l,i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={hex} strokeWidth={l.thick ? 2.5 : 1.2} strokeLinecap="round" opacity="0.55" />
      ))}
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.28)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g10)" filter="url(#f10)" />
      {/* Crack fractures on face */}
      <path d="M48,14 L46,32 L52,38 L48,48 L44,44 L40,62 L46,60 L44,78" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M18,36 L34,42 L36,48 L26,54" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      {/* Pulsing lightning bolts */}
      <g>
        <path d="M14,22 L28,38 L21,40 L38,58" stroke="#ffe033" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <animate attributeName="opacity" values="0.35;1;0.35" dur="1.6s" repeatCount="indefinite" />
      </g>
      <g>
        <path d="M82,22 L68,38 L75,40 L58,58" stroke="#ffe033" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <animate attributeName="opacity" values="0.35;1;0.35" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
      </g>
      {/* Small central bolt */}
      <path d="M51,20 L46,30 L51,30 L44,46" stroke="rgba(255,220,50,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Electric arc circle */}
      <circle cx="48" cy="48" r="22" fill="none" stroke="rgba(255,220,50,0.22)" strokeWidth="1" strokeDasharray="4 3" />
      <ellipse cx="33" cy="29" rx="8" ry="4.5" fill="white" opacity="0.2" transform="rotate(-35 33 29)" />
    </svg>
  );
}

// ─── L11 · Cosmic — Purple/cyan spinning galaxy spiral arms ───────────────────
function L11({ hex, rgb }: P) {
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g11" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#edd5ff" /><stop offset="35%" stopColor={hex} /><stop offset="70%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#2d0070" />
        </radialGradient>
        <radialGradient id="g11c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" /><stop offset="40%" stopColor={hex} /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <GlowFilter id="f11" hex={hex} blur={8} />
        <filter id="f11o" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feFlood floodColor={hex} floodOpacity="0.9" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="48" cy="50" r="37" fill={`rgba(${rgb},0.28)`} />
      <circle cx="48" cy="48" r="36" fill="url(#g11)" filter="url(#f11)" />
      {/* Rotating spiral arms */}
      <g>
        <path d="M48,48 Q55,34 68,30 Q78,28 80,40" stroke="rgba(255,255,255,0.38)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M48,48 Q34,56 30,68 Q28,78 40,80" stroke="rgba(255,255,255,0.38)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M48,48 Q40,34 32,30 Q22,28 20,42" stroke="rgba(6,182,212,0.32)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M48,48 Q60,60 64,72 Q66,82 54,84" stroke="rgba(6,182,212,0.32)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="22s" repeatCount="indefinite" />
      </g>
      {/* Nebula orbs */}
      {([[16,20,7,"#a78bfa"],[78,24,5,"#06b6d4"],[12,68,6,"#a78bfa"],[80,72,5,"#06b6d4"]] as [number,number,number,string][]).map(([cx,cy,r,fill],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity="0.45" filter="url(#f11o)">
          <animate attributeName="opacity" values="0.35;0.7;0.35" dur={`${2.5+i*0.7}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Galactic core */}
      <circle cx="48" cy="48" r="12" fill="url(#g11c)" />
      <circle cx="48" cy="48" r="6" fill="rgba(255,255,255,0.75)" />
      {/* Star dots */}
      {([[28,14],[64,12],[84,44],[74,82],[24,82],[8,52]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="white" opacity="0.7" />
      ))}
      <ellipse cx="33" cy="29" rx="8" ry="4.5" fill="white" opacity="0.2" transform="rotate(-35 33 29)" />
    </svg>
  );
}

// ─── L12 · Infinity — Prismatic rays, sacred geometry, dual halos ─────────────
function L12({ hex, rgb }: P) {
  const rayColors = ["#ff8888", "#ffcc88", "#88ff99", "#88eeff", "#aaaaff", "#ee88ff"];
  return (
    <svg viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g12" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="white" /><stop offset="40%" stopColor="#e0e0ff" /><stop offset="75%" stopColor={hex} /><stop offset="100%" stopColor="#808080" />
        </radialGradient>
        <GlowFilter id="f12" hex="white" blur={9} />
      </defs>
      {/* Prismatic rays (12 tapered polygons) */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const a1 = a - 0.07, a2 = a + 0.07;
        const r1 = 36, r2 = 48;
        const pts = [
          `${48 + Math.cos(a1) * r1},${48 + Math.sin(a1) * r1}`,
          `${48 + Math.cos(a) * r2},${48 + Math.sin(a) * r2}`,
          `${48 + Math.cos(a2) * r1},${48 + Math.sin(a2) * r1}`,
        ].join(" ");
        return <polygon key={i} points={pts} fill={rayColors[i % 6]} opacity="0.6" />;
      })}
      {/* Slow outer halo CW */}
      <g>
        <circle cx="48" cy="48" r="46" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="7 5" />
        {ring(48, 48, 46, 6).map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2.8" fill="rgba(255,255,255,0.65)" />
        ))}
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="28s" repeatCount="indefinite" />
      </g>
      {/* Counter halo CCW */}
      <g>
        <circle cx="48" cy="48" r="41" fill="none" stroke="rgba(200,200,255,0.22)" strokeWidth="1" strokeDasharray="4 8" />
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="-360 48 48" dur="18s" repeatCount="indefinite" />
      </g>
      <circle cx="48" cy="50" r="37" fill="rgba(240,240,240,0.28)" />
      <circle cx="48" cy="48" r="36" fill="url(#g12)" filter="url(#f12)" />
      {/* Sacred hexagram */}
      <polygon points="48,20 68,54 28,54" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <polygon points="48,76 28,42 68,42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      {/* Inner circles */}
      <circle cx="48" cy="48" r="24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="16" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      {/* Infinity symbol */}
      <path d="M33,48 A7,7 0 1,1 33,48.01 M47,48 A7,7 0 1,0 63,48 A7,7 0 1,0 47,48" stroke="rgba(255,255,255,0.88)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {/* Crystal facet lines */}
      {([[28,28],[68,28],[68,68],[28,68]] as [number,number][]).map(([x,y],i) => (
        <line key={i} x1={x} y1={y} x2={48} y2={48} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* Divine core pulse */}
      <circle cx="48" cy="48" r="7" fill="rgba(255,255,255,0.88)">
        <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="48" cy="48" r="3.5" fill="white" />
    </svg>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

interface RankIconProps { rank: RankDef; }

export default function RankIcon({ rank }: RankIconProps) {
  const p: P = { hex: rank.hex, rgb: rank.shadowRgb };
  switch (rank.level) {
    case 1:  return <L1  {...p} />;
    case 2:  return <L2  {...p} />;
    case 3:  return <L3  {...p} />;
    case 4:  return <L4  {...p} />;
    case 5:  return <L5  {...p} />;
    case 6:  return <L6  {...p} />;
    case 7:  return <L7  {...p} />;
    case 8:  return <L8  {...p} />;
    case 9:  return <L9  {...p} />;
    case 10: return <L10 {...p} />;
    case 11: return <L11 {...p} />;
    default: return <L12 {...p} />;
  }
}
