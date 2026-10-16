import { useCallback, useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getHealthCheckQueryKey,
  getGetPlayerSaveQueryKey,
  useClaimGrandChallengeReward,
  useGetPlayerSave,
  useHealthCheck,
  useSavePlayerGame,
} from "@workspace/api-client-react";
import type { ChallengeStatus, PlayerSave } from "@workspace/api-client-react";
import { INITIAL_MISSIONS_STATE, todayStr } from "./missions";
import { REFERRAL_KEY, initReferralState } from "./referrals";
import { AccountControls } from "./account/AccountControls";
import { GrandChallenge } from "./challenge/GrandChallenge";

const GAME_KEY = "tap_game_state_v2";
const MISSIONS_KEY = "tap_missions_v1";
const DAILY_KEY = "tap_daily_rewards_v1";
const SPIN_KEY = "tap_lucky_spin_v1";
const GUEST_BACKUP_KEY = "tap_guest_save_backup_v1";
const MAX_ENERGY = 500;

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

function currentLocalSave(): PlayerSave {
  const now = Date.now();
  const game = safeRead(GAME_KEY, {
    balance: 0,
    tapValue: 1,
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    upgrades: {},
    totalEarned: 0,
    lastSaved: now,
  });
  const missions = safeRead(MISSIONS_KEY, {
    ...INITIAL_MISSIONS_STATE,
    date: todayStr(),
  });
  const referralFallback = initReferralState();
  const referral = safeRead(REFERRAL_KEY, referralFallback);
  const daily = safeRead(DAILY_KEY, { streak: 0, lastClaimed: 0 });
  const spin = safeRead(SPIN_KEY, { lastSpin: 0 });
  return {
    gameState: game as PlayerSave["gameState"],
    missionsState: missions as PlayerSave["missionsState"],
    referralState: referral as PlayerSave["referralState"],
    dailyRewardState: daily as PlayerSave["dailyRewardState"],
    luckySpinState: spin as PlayerSave["luckySpinState"],
  };
}

function writeLocalSave(save: PlayerSave) {
  localStorage.setItem(GAME_KEY, JSON.stringify(save.gameState));
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(save.missionsState));
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(save.referralState));
  localStorage.setItem(DAILY_KEY, JSON.stringify(save.dailyRewardState));
  localStorage.setItem(SPIN_KEY, JSON.stringify(save.luckySpinState));
}

function takeGuestBackup(save: PlayerSave) {
  const backup = {
    gameState: safeRead(GAME_KEY, save.gameState),
    missionsState: safeRead(MISSIONS_KEY, save.missionsState),
    referralState: safeRead(REFERRAL_KEY, save.referralState),
    dailyRewardState: safeRead(DAILY_KEY, save.dailyRewardState),
    luckySpinState: safeRead(SPIN_KEY, save.luckySpinState),
    savedAt: Date.now(),
  };
  localStorage.setItem(GUEST_BACKUP_KEY, JSON.stringify(backup));
}

function restoreGuestBackup() {
  try {
    const raw = localStorage.getItem(GUEST_BACKUP_KEY);
    if (!raw) return false;
    const backup = JSON.parse(raw) as Partial<PlayerSave>;
    if (backup.gameState) localStorage.setItem(GAME_KEY, JSON.stringify(backup.gameState));
    if (backup.missionsState) localStorage.setItem(MISSIONS_KEY, JSON.stringify(backup.missionsState));
    if (backup.referralState) localStorage.setItem(REFERRAL_KEY, JSON.stringify(backup.referralState));
    if (backup.dailyRewardState) localStorage.setItem(DAILY_KEY, JSON.stringify(backup.dailyRewardState));
    if (backup.luckySpinState) localStorage.setItem(SPIN_KEY, JSON.stringify(backup.luckySpinState));
    return true;
  } catch {
    return false;
  }
}

function PlayerSkeleton() {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-[#090a0d] px-5 text-white">
      <div className="w-full max-w-[360px] space-y-4" aria-label="Restoring your cloud save" role="status">
        <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
        <div className="h-28 rounded-3xl border border-white/[0.06] bg-white/[0.035] animate-pulse" />
        <div className="h-72 rounded-[2rem] border border-white/[0.06] bg-white/[0.035] animate-pulse" />
        <p className="text-center text-xs tracking-wide text-white/45">Restoring your progress…</p>
      </div>
    </div>
  );
}

export function CloudGameShell({ Game }: { Game: React.ComponentType }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const signedIn = Boolean(isLoaded && user);
  const userId = user?.id;
  const saveQuery = useGetPlayerSave({
    query: {
      enabled: signedIn,
      queryKey: getGetPlayerSaveQueryKey(),
      retry: false,
    },
  });
  const healthQuery = useHealthCheck({ query: { retry: false, queryKey: getHealthCheckQueryKey() } });
  const saveMutation = useSavePlayerGame();
  const claimMutation = useClaimGrandChallengeReward();
  const saveFnRef = useRef(saveMutation.mutateAsync);
  const claimFnRef = useRef(claimMutation.mutateAsync);
  saveFnRef.current = saveMutation.mutateAsync;
  claimFnRef.current = claimMutation.mutateAsync;
  const initializedAccount = useRef<string | null>(null);
  const lastAccount = useRef<string | null>(null);
  const restoreGuestAfterSignOut = useRef(false);
  const latestFingerprint = useRef("");
  const saving = useRef(false);
  const [gameVersion, setGameVersion] = useState("guest");
  const [syncError, setSyncError] = useState("");
  const [localMissions, setLocalMissions] = useState(() =>
    safeRead(MISSIONS_KEY, { ...INITIAL_MISSIONS_STATE, date: todayStr() }),
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!signedIn) {
      if (lastAccount.current) {
        if (restoreGuestAfterSignOut.current && restoreGuestBackup()) setGameVersion(`guest-${Date.now()}`);
        restoreGuestAfterSignOut.current = false;
        lastAccount.current = null;
      }
      setGameVersion((current) => current.startsWith("guest") ? current : "guest");
      return;
    }
    if (!userId || saveQuery.isLoading || initializedAccount.current === userId) return;
    if (saveQuery.isError) {
      initializedAccount.current = userId;
      lastAccount.current = userId;
      setSyncError("Cloud save is temporarily unavailable. Your game is still playable on this device.");
      setGameVersion(userId);
      return;
    }
    const response = saveQuery.data;
    if (!response) return;

    initializedAccount.current = userId;
    lastAccount.current = userId;
    setSyncError("");
    let saveToApply: PlayerSave;
    if (response.save) {
      const local = currentLocalSave();
      takeGuestBackup(local);
      restoreGuestAfterSignOut.current = true;
      saveToApply = response.save;
      writeLocalSave(saveToApply);
      latestFingerprint.current = JSON.stringify(saveToApply);
      setGameVersion(`${userId}-cloud-${Date.now()}`);
    } else {
      restoreGuestAfterSignOut.current = false;
      saveToApply = currentLocalSave();
      void saveFnRef.current({ data: { save: saveToApply } })
        .then(() => {
          latestFingerprint.current = JSON.stringify(saveToApply);
          void queryClient.invalidateQueries({ queryKey: getGetPlayerSaveQueryKey() });
        })
        .catch(() => setSyncError("Your progress is on this device, but the first cloud sync could not finish."));
      setGameVersion(`${userId}-seed-${Date.now()}`);
    }
  }, [isLoaded, signedIn, userId, saveQuery.isLoading, saveQuery.isError, saveQuery.data, queryClient]);

  useEffect(() => {
    if (!signedIn || !userId || gameVersion === "guest" || gameVersion.startsWith("guest-")) return;
    const timer = window.setInterval(() => {
      if (saving.current || initializedAccount.current !== userId) return;
      const save = currentLocalSave();
      const fingerprint = JSON.stringify(save);
      if (!fingerprint || fingerprint === latestFingerprint.current) return;
      saving.current = true;
      void saveFnRef.current({ data: { save } })
        .then(() => {
          latestFingerprint.current = fingerprint;
          setSyncError("");
          void queryClient.invalidateQueries({ queryKey: getGetPlayerSaveQueryKey() });
        })
        .catch(() => setSyncError("Cloud sync paused. Your local progress is safe and will retry automatically."))
        .finally(() => { saving.current = false; });
    }, 3300);
    return () => window.clearInterval(timer);
  }, [signedIn, userId, gameVersion, queryClient]);

  useEffect(() => {
    const poll = window.setInterval(() => {
      setLocalMissions(safeRead(MISSIONS_KEY, { ...INITIAL_MISSIONS_STATE, date: todayStr() }));
    }, 900);
    return () => window.clearInterval(poll);
  }, []);

  const replaceFromServer = useCallback((save: PlayerSave) => {
    writeLocalSave(save);
    latestFingerprint.current = JSON.stringify(save);
    setGameVersion(`${userId ?? "account"}-reward-${Date.now()}`);
  }, [userId]);

  const handleChallengeClaim = useCallback(async () => {
    while (saving.current) {
      await new Promise((resolve) => window.setTimeout(resolve, 40));
    }
    saving.current = true;
    try {
      const latestSave = currentLocalSave();
      const savedResponse = await saveFnRef.current({ data: { save: latestSave } });
      latestFingerprint.current = JSON.stringify(savedResponse.save ?? latestSave);

      const response = await claimFnRef.current();
      replaceFromServer(response.save);
      queryClient.setQueryData(getGetPlayerSaveQueryKey(), {
        save: response.save,
        challenge: response.challenge,
      });
      await queryClient.invalidateQueries({ queryKey: getGetPlayerSaveQueryKey() });
      setSyncError("");
      return response;
    } catch (error) {
      setSyncError("Cloud sync could not confirm the reward. Your coins have not changed.");
      throw error;
    } finally {
      saving.current = false;
    }
  }, [queryClient, replaceFromServer]);

  const isRestoring = signedIn && saveQuery.isLoading && !initializedAccount.current;
  const challenge = saveQuery.data?.challenge as ChallengeStatus | undefined;
  const gameAllowed = !signedIn || !userId || initializedAccount.current === userId || saveQuery.isError;

  if (!isLoaded || isRestoring || (signedIn && !gameAllowed)) return <PlayerSkeleton />;

  return (
    <div className="cloud-shell">
      <Game key={gameVersion} />
      <div className="fixed right-3 top-3 z-[12000] flex max-w-[calc(100vw-24px)] flex-col items-end gap-2 sm:right-5 sm:top-5">
        <AccountControls
          signedIn={signedIn}
          user={user}
          syncError={syncError}
          healthAvailable={!healthQuery.isError}
          signOut={() => signOut({ redirectUrl: import.meta.env.BASE_URL })}
        />
        <GrandChallenge
          signedIn={signedIn}
          status={challenge}
          missions={localMissions}
          onClaim={handleChallengeClaim}
          pending={claimMutation.isPending}
          error={claimMutation.error ? "The reward could not be claimed. Please try again." : ""}
        />
      </div>
    </div>
  );
}
