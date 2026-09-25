"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { Field } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";
import { get, nextAfterSignIn, post } from "./api";
import { AccountLayout, Lede } from "./AccountLayout";
import { FORGES, type ForgeId, forgeOAuth } from "./forges";

/** What an OAuth failure (`?error=<code>` from the service) means to the person. */
const OAUTH_ERRORS: Record<string, string> = {
  state_mismatch: "That sign-in attempt had expired. Start again from here.",
  please_restart_the_process: "That sign-in attempt had expired. Start again from here.",
  access_denied: "Sign-in was cancelled.",
  email_not_found:
    "That account didn't share an email address, and Reado needs one. Try again, or use your email below.",
  account_not_linked:
    "An account with this email already exists. Sign in with your email and password, then link this one from your account.",
};
const oauthError = (code: string | null) =>
  code ? (OAUTH_ERRORS[code] ?? "That sign-in didn't work. Try again, or use your email below.") : null;

/** Sign in or create an account. With `?flow=…` it came from the desktop app,
 *  and hands the session back to it when done. */
export function SignInForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const params = useSearchParams();
  const flow = params.get("flow");
  const next = nextAfterSignIn(flow, params.get("next"));
  const [forges, setForges] = useState<ForgeId[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(oauthError(params.get("error")));

  useEffect(() => {
    get<Record<ForgeId, boolean>>("/v1/auth/providers")
      .then((p) => setForges(FORGES.map((f) => f.id).filter((id) => p[id])))
      .catch(() => setError("Can't reach the Reado service right now. Try again in a moment."));
    // Already signed in in this browser: nothing to type.
    get<{ user?: unknown } | null>("/api/auth/get-session")
      .then((s) => {
        if (s?.user) location.href = next;
      })
      .catch(() => {});
  }, [next]);

  async function withForge(forge: ForgeId) {
    setBusy(true);
    setError(null);
    try {
      await forgeOAuth(forge, next);
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
  const carry = flow ? `?flow=${encodeURIComponent(flow)}` : params.get("next") ? `?next=${encodeURIComponent(next)}` : "";
  const otherHref = `${other}${carry}`;

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
      {forges.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {FORGES.filter((f) => forges.includes(f.id)).map(({ id, label, Mark }) => (
              <Button key={id} variant="secondary" className="w-full py-3" onClick={() => withForge(id)} disabled={busy}>
                <Mark />
                Continue with {label}
              </Button>
            ))}
          </div>
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
