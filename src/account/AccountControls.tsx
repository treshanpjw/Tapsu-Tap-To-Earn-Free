import { useState } from "react";
import { Link } from "wouter";
import { Check, Cloud, CloudOff, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

type AccountUser = {
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  imageUrl?: string;
} | null;

interface AccountControlsProps {
  signedIn: boolean;
  user: AccountUser | undefined;
  syncError: string;
  healthAvailable: boolean;
  signOut: () => void;
}

export function AccountControls({ signedIn, user, syncError, healthAvailable, signOut }: AccountControlsProps) {
  const [open, setOpen] = useState(false);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Player account";
  const email = user?.primaryEmailAddress?.emailAddress || "Signed in";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "P";

  if (!signedIn) {
    return (
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#111216]/95 p-1.5 shadow-2xl backdrop-blur-xl" data-testid="account-guest-controls">
        <span className="hidden items-center gap-1.5 px-2 text-[11px] font-medium text-white/50 sm:flex">
          <UserRound size={13} aria-hidden="true" /> Guest save
        </span>
        <Link href="/sign-in" className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white/75 transition hover:bg-white/[0.07] hover:text-white" data-testid="link-sign-in" aria-label="Sign in to sync your game">
          <LogIn size={14} aria-hidden="true" /> Sign in
        </Link>
        <Link href="/sign-up" className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#f5c518] px-3 text-xs font-bold text-[#17130a] transition hover:bg-[#ffda49]" data-testid="link-create-account">
          Save progress
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Account menu for ${name}`}
        className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-[#111216]/95 px-2.5 text-left shadow-2xl backdrop-blur-xl transition hover:border-[#f5c518]/40 hover:bg-[#191a1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518]"
        data-testid="button-account-menu"
      >
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="h-7 w-7 rounded-xl object-cover" />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#f5c518] text-[10px] font-black text-[#17130a]">{initials}</span>
        )}
        <span className="hidden max-w-[132px] truncate text-xs font-semibold text-white/90 sm:block">{name}</span>
        <span className="grid h-2 w-2 place-items-center rounded-full bg-[#8ebf87]" aria-label="Cloud account active" />
      </button>

      {open && (
        <div className="cloud-card absolute right-0 top-[calc(100%+10px)] z-20 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl p-4 cloud-enter" role="dialog" aria-label="Account and cloud save status" data-testid="panel-account">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{name}</p>
              <p className="mt-0.5 truncate text-xs text-white/45">{email}</p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#f5c518]/20 bg-[#f5c518]/10 text-[#f5c518]">
              <ShieldCheck size={17} aria-hidden="true" />
            </span>
          </div>
          <div className="my-4 h-px bg-white/[0.08]" />
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2.5">
            {syncError || !healthAvailable ? <CloudOff size={15} className="text-[#e89a75]" aria-hidden="true" /> : <Cloud size={15} className="text-[#9bc68d]" aria-hidden="true" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white/85">{syncError ? "Sync needs attention" : healthAvailable ? "Cloud save enabled" : "Connection unavailable"}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-white/45">{syncError || (healthAvailable ? "Your progress is saved to this account." : "Your progress remains safe on this device.")}</p>
            </div>
            {!syncError && healthAvailable && <Check size={14} className="shrink-0 text-[#9bc68d]" aria-hidden="true" />}
          </div>
          <button type="button" onClick={signOut} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white" data-testid="button-sign-out">
            <LogOut size={14} aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
