"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { Field } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";
import { get, nextAfterSignIn, post } from "./api";
import { AccountLayout, Lede } from "./AccountLayout";

const GitHubMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

/** What an OAuth failure (`?error=<code>` from the service) means to the person. */
const OAUTH_ERRORS: Record<string, string> = {
  state_mismatch: "That sign-in attempt had expired. Start again from here.",
  please_restart_the_process: "That sign-in attempt had expired. Start again from here.",
  access_denied: "GitHub sign-in was cancelled.",
  email_not_found:
    "GitHub didn't share an email address, and Reado needs one for your account. Try again, or use your email below.",
  account_not_linked:
    "An account with this email already exists. Sign in with your email and password, then link GitHub from your account.",
};
const oauthError = (code: string | null) =>
  code ? (OAUTH_ERRORS[code] ?? "Signing in with GitHub didn't work. Try again, or use your email below.") : null;

/** Sign in or create an account. With `?flow=…` it came from the desktop app,
 *  and hands the session back to it when done. */
export function SignInForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const params = useSearchParams();
  const flow = params.get("flow");
  const next = nextAfterSignIn(flow);
  const [github, setGithub] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(oauthError(params.get("error")));

  useEffect(() => {
    get<{ github: boolean }>("/v1/auth/providers")
      .then((p) => setGithub(p.github))
      .catch(() => setError("Can't reach the Reado service right now. Try again in a moment."));
    // Already signed in in this browser: nothing to type.
    get<{ user?: unknown } | null>("/api/auth/get-session")
      .then((s) => {
        if (s?.user) location.href = next;
      })
      .catch(() => {});
  }, [next]);

  const absolute = (href: string) => (href.startsWith("http") ? href : `${location.origin}${href}`);

  async function withGitHub() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await post<{ url: string }>("/api/auth/sign-in/social", {
        provider: "github",
        callbackURL: absolute(next),
      });
      location.href = url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      if (mode === "sign-up")
        await post("/api/auth/sign-up/email", {
          name: f.get("name"),
          email: f.get("email"),
          password: f.get("password"),
        });
      else await post("/api/auth/sign-in/email", { email: f.get("email"), password: f.get("password") });
      location.href = next;
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  const signIn = mode === "sign-in";
  const other = signIn ? "/sign-up" : "/sign-in";
  const otherHref = flow ? `${other}?flow=${encodeURIComponent(flow)}` : other;

  return (
    <AccountLayout
      aside={
        <>
          <Display>{signIn ? <>Welcome<br />back</> : <>Make it<br />yours</>}</Display>
          <Lede>
            {flow
              ? "Sign in here, and Reado picks up where you left it — you'll be sent straight back to the app."
              : signIn
                ? "Your account, your plan, and every place you're signed in."
                : "An account is optional. It syncs your settings between machines and is where Pro lives."}
          </Lede>
        </>
      }
    >
      {github && (
        <>
          <Button variant="secondary" className="w-full py-3" onClick={withGitHub} disabled={busy}>
            <GitHubMark />
            Continue with GitHub
          </Button>
          <p className="my-8 flex items-center gap-4 text-sm text-muted">
            <span className="h-px flex-1 bg-line" />
            or with your email
            <span className="h-px flex-1 bg-line" />
          </p>
        </>
      )}

      <form onSubmit={submit} className="flex flex-col gap-7">
        {!signIn && <Field label="Name" name="name" autoComplete="name" required />}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          // "Forgot password?" returns here once the service sends real email;
          // /forgot-password and /reset-password are built and waiting.
          hint={signIn ? undefined : "At least 10 characters"}
          name="password"
          type="password"
          minLength={signIn ? undefined : 10}
          autoComplete={signIn ? "current-password" : "new-password"}
          required
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button type="submit" disabled={busy}>
            {busy ? (signIn ? "Signing in…" : "Creating…") : signIn ? "Sign in →" : "Create account →"}
          </Button>
          <TextLink href={otherHref}>{signIn ? "New here? Create an account" : "Already have one? Sign in"}</TextLink>
        </div>
        <p role="alert" aria-live="polite" className="min-h-6 text-[15px] text-marker">
          {error}
        </p>
      </form>
    </AccountLayout>
  );
}
