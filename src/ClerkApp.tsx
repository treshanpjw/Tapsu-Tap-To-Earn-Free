import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import App from "./App";
import { CloudGameShell } from "./CloudGameShell";
import { queryClient } from "./lib/queryClient";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#f5c518",
    colorForeground: "#f1eee4",
    colorMutedForeground: "#9a988f",
    colorDanger: "#e58f70",
    colorBackground: "#141519",
    colorInput: "#0e0f12",
    colorInputForeground: "#f1eee4",
    colorNeutral: "#37383c",
    fontFamily: "Outfit, sans-serif",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#141519] rounded-[22px] w-[440px] max-w-full overflow-hidden border border-white/10 shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#f4f0e5] font-bold tracking-tight",
    headerSubtitle: "text-[#a6a39a]",
    socialButtonsBlockButtonText: "text-[#ece8de] font-semibold",
    formFieldLabel: "text-[#d2cec2] font-medium",
    footerActionLink: "text-[#f5c518] font-semibold hover:text-[#ffdf65]",
    footerActionText: "text-[#a6a39a]",
    dividerText: "text-[#8d8b84]",
    identityPreviewEditButton: "text-[#f5c518]",
    formFieldSuccessText: "text-[#a9d09b]",
    alertText: "text-[#f0aa8e]",
    logoBox: "rounded-xl",
    logoImage: "max-h-10 w-auto",
    socialButtonsBlockButton: "border border-white/10 bg-[#1d1e23] hover:bg-[#25262c]",
    formButtonPrimary: "bg-[#f5c518] text-[#17130a] font-bold hover:bg-[#ffda49] shadow-none",
    formFieldInput: "border border-white/10 bg-[#0e0f12] text-[#f4f0e5] placeholder:text-[#77756e] focus:border-[#f5c518]/70",
    footerAction: "border-t border-white/[0.08]",
    dividerLine: "bg-white/10",
    alert: "border border-[#e58f70]/20 bg-[#e58f70]/[0.08]",
    otpCodeFieldInput: "border border-white/10 bg-[#0e0f12] text-[#f4f0e5]",
    formFieldRow: "gap-1.5",
    main: "gap-5",
  },
};

function SignInPage() {
  return (
    <AuthStage>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthStage>
  );
}

function SignUpPage() {
  return (
    <AuthStage>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthStage>
  );
}

function AuthStage({ children }: { children: ReactNode }) {
  return (
    <main className="cloud-auth-backdrop relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8 text-white">
      <div className="cloud-auth-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative z-10 grid w-full max-w-[980px] items-center gap-8 lg:grid-cols-[1fr_440px] lg:gap-16">
        <section className="hidden max-w-[420px] cloud-enter lg:block">
          <a href={basePath || "/"} aria-label="Tap to Earn home" className="mb-12 inline-flex items-center gap-3">
            <img src={`${basePath}/logo.svg`} alt="" className="h-12 w-12" />
            <span className="text-lg font-extrabold tracking-tight text-white">Tap to Earn</span>
          </a>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5c518]/70">Your progress, everywhere</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] text-white">
            Keep your climb.<br /><span className="text-[#f5c518]">Pick up anywhere.</span>
          </h1>
          <p className="mt-5 max-w-[350px] text-sm leading-7 text-white/50">Sign in to bring your balance, upgrades, missions, and streak along on every device.</p>
          <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/45">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#f5c518]/20 bg-[#f5c518]/[0.08] font-mono text-[#f5c518]">01</span>
            <span>One account. One authoritative cloud save.</span>
          </div>
        </section>
        <div className="cloud-enter w-full">
          <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">
            <img src={`${basePath}/logo.svg`} alt="" className="h-9 w-9" />
            <span className="font-bold tracking-tight text-white">Tap to Earn</span>
          </div>
          {children}
          <p className="mx-auto mt-4 max-w-[380px] text-center text-[10px] leading-relaxed text-white/30">Your game save syncs securely to your account. Guest play remains available from the home screen.</p>
        </div>
      </div>
    </main>
  );
}

function HomePage() {
  return <CloudGameShell Game={App} />;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) client.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);

  return null;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Pick up your climb where you left it." } },
        signUp: { start: { title: "Save your progress", subtitle: "Create an account and keep your game in sync." } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route><Redirect to="/" /></Route>
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function ClerkApp() {
  return (
    <WouterRouter base={basePath}>
      <ClerkRoutes />
    </WouterRouter>
  );
}
