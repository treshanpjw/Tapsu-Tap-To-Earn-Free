import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Check, Circle, Crown, LockKeyhole, ShieldCheck, Sparkles, X } from "lucide-react";
import type { ChallengeStatus, MissionsState } from "@workspace/api-client-react";
import { todayStr } from "../missions";

const CHECKPOINTS = [
  { id: "m3", title: "Tap 500 times", detail: "Daily mission 03" },
  { id: "m5", title: "Spend 2,500 on upgrades", detail: "Daily mission 05" },
  { id: "m8", title: "Reach a 10,000 balance", detail: "Daily mission 08" },
] as const;

interface GrandChallengeProps {
  signedIn: boolean;
  status?: ChallengeStatus;
  missions: MissionsState;
  onClaim: () => Promise<unknown>;
  pending: boolean;
  error: string;
}

export function GrandChallenge({ signedIn, status, missions, onClaim, pending, error }: GrandChallengeProps) {
  const [open, setOpen] = useState(false);
  const [claimError, setClaimError] = useState("");
  const claimedToday = missions.date === todayStr() ? missions.claimedIds : [];
  const complete = CHECKPOINTS.filter((checkpoint) =>
    (status?.completedMissionIds ?? []).includes(checkpoint.id) || claimedToday.includes(checkpoint.id),
  ).length;
  const claimed = Boolean(status?.claimed);
  const eligible = Boolean(status?.eligible);
  const ready = claimed || eligible;

  const claim = async () => {
    setClaimError("");
    try {
      await onClaim();
    } catch {
      setClaimError("We could not confirm this claim. Your coins have not been changed.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open Grand Challenge reward"
        className={`group inline-flex min-h-10 items-center gap-2 rounded-2xl border px-3 py-2 text-left shadow-xl backdrop-blur-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518] ${
          claimed
            ? "border-white/10 bg-[#111216]/95 text-white/65"
            : "border-[#f5c518]/35 bg-[#17150f]/95 text-[#f5d45f] hover:border-[#f5c518]/65 hover:bg-[#211d12]"
        }`}
        data-testid="button-grand-challenge"
      >
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#f5c518]/10 text-[#f5c518]"><Crown size={14} aria-hidden="true" /></span>
        <span className="text-xs font-bold">{claimed ? "Reward claimed" : "Grand Challenge"}</span>
        {!claimed && <span className="rounded-md bg-[#f5c518] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#17130a]">+1M</span>}
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default bg-black/40" aria-label="Close Grand Challenge" onClick={() => setOpen(false)} />
          <section className="cloud-card absolute right-0 top-[calc(100%+10px)] z-20 w-[min(370px,calc(100vw-24px))] overflow-hidden rounded-[22px] cloud-enter" role="dialog" aria-modal="true" aria-labelledby="grand-challenge-title" data-testid="panel-grand-challenge">
            <div className="relative overflow-hidden border-b border-white/[0.08] px-5 pb-4 pt-5">
              <div className="absolute -right-6 -top-8 h-36 w-36 rounded-full border border-[#f5c518]/10" />
              <div className="absolute -right-1 -top-2 h-24 w-24 rounded-full border border-[#f5c518]/10" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5c518]/70">
                    <Sparkles size={12} aria-hidden="true" /> One-time account reward
                  </p>
                  <h2 id="grand-challenge-title" className="mt-2 text-[25px] font-extrabold leading-none tracking-tight text-white">Grand Challenge</h2>
                  <p className="mt-2 max-w-[250px] text-xs leading-relaxed text-white/50">Complete three daily milestones. The million-coin reward is yours once, across every device.</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close challenge details" className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white" data-testid="button-close-grand-challenge">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="relative mt-4 flex items-end justify-between">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">{claimed ? "Completed" : `${complete} of 3 checkpoints`}</p>
                <p className="font-mono text-xl font-medium tracking-tight text-[#f5c518]">1,000,000 <span className="text-[10px] uppercase text-white/40">coins</span></p>
              </div>
              <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-[#f5c518] transition-[width] duration-500" style={{ width: `${claimed ? 100 : (complete / 3) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-2 px-4 py-4">
              {CHECKPOINTS.map((checkpoint) => {
                const done = (status?.completedMissionIds ?? []).includes(checkpoint.id) || claimedToday.includes(checkpoint.id);
                return (
                  <div key={checkpoint.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${done ? "border-[#8ebf87]/20 bg-[#8ebf87]/[0.055]" : "border-white/[0.06] bg-white/[0.025]"}`} data-testid={`status-challenge-${checkpoint.id}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${done ? "bg-[#8ebf87]/15 text-[#9bc68d]" : "bg-white/[0.05] text-white/25"}`}>
                      {done ? <Check size={14} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-xs font-semibold ${done ? "text-white/85" : "text-white/65"}`}>{checkpoint.title}</span>
                      <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-white/35">{checkpoint.detail} · {checkpoint.id.toUpperCase()}</span>
                    </span>
                    {done && <span className="text-[9px] font-bold uppercase tracking-wider text-[#9bc68d]">Done</span>}
                  </div>
                );
              })}
            </div>

            <div className="px-4 pb-4">
              {claimed ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#8ebf87]/20 bg-[#8ebf87]/[0.08] px-4 py-3 text-xs font-semibold text-[#b7d9ae]" data-testid="status-challenge-claimed">
                  <ShieldCheck size={15} aria-hidden="true" /> Claimed once for this account
                </div>
              ) : !signedIn ? (
                <div className="space-y-2">
                  <p className="text-center text-[11px] leading-relaxed text-white/45">Sign in to unlock and securely claim this account-only reward.</p>
                  <Link href="/sign-in" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f5c518] px-4 text-xs font-bold text-[#17130a] transition hover:bg-[#ffda49]" data-testid="link-challenge-sign-in">
                    Sign in to claim <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <button type="button" onClick={claim} disabled={!ready || pending} className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition disabled:cursor-not-allowed ${
                  ready ? "bg-[#f5c518] text-[#17130a] hover:bg-[#ffda49]" : "border border-white/[0.08] bg-white/[0.04] text-white/35"
                }`} data-testid="button-claim-grand-challenge" aria-label={ready ? "Claim one million coins" : "Complete all three missions to unlock"}>
                  {pending ? <><span className="h-3.5 w-3.5 animate-pulse rounded-full bg-current" /> Confirming reward…</> : ready ? <><Crown size={15} aria-hidden="true" /> Claim 1,000,000 coins</> : <><LockKeyhole size={14} aria-hidden="true" /> Complete all three to unlock</>}
                </button>
              )}
              {(claimError || error) && <p className="mt-2 text-center text-[11px] text-[#e89a75]" role="alert" data-testid="status-challenge-error">{claimError || error}</p>}
              {!claimed && signedIn && !ready && <p className="mt-2 text-center text-[10px] leading-relaxed text-white/35">Challenge progress is saved to your account, even when you complete missions on different days.</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
