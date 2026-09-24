"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { Field } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";
import { post } from "./api";
import { AccountLayout, Lede } from "./AccountLayout";

/** Ask for a reset link. The answer is the same whether or not the email has an account. */
export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/request-password-reset", {
        email: new FormData(e.currentTarget).get("email"),
        redirectTo: `${location.origin}/reset-password`,
      });
      setSent(true);
    } catch (x) {
      setError((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountLayout
      aside={
        <>
          <Display>
            Forgot it<br />happens
          </Display>
          <Lede>We&rsquo;ll email you a link to choose a new one. It works once, for 30 minutes.</Lede>
        </>
      }
    >
      {sent ? (
        <div role="status">
          <p className="text-[clamp(18px,1.8vw,22px)] font-semibold text-bright">Check your email.</p>
          <p className="mt-3 max-w-[40ch] text-[15px] leading-[1.6] text-muted">
            If an account uses that address, a reset link is on its way. Nothing arrived? Look in spam, or try again
            in a minute.
          </p>
          <TextLink href="/sign-in" className="mt-6 inline-block">
            Back to sign in
          </TextLink>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-7">
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send reset link →"}
            </Button>
            <TextLink href="/sign-in">Back to sign in</TextLink>
          </div>
          <p role="alert" aria-live="polite" className="min-h-6 text-[15px] text-marker">
            {error}
          </p>
        </form>
      )}
    </AccountLayout>
  );
}

/** Choose a new password from the emailed link (`?token=…`). */
export function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token");
  const broken = !token || params.get("error") !== null;
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/reset-password", {
        newPassword: new FormData(e.currentTarget).get("password"),
        token,
      });
      setDone(true);
    } catch (x) {
      setError((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountLayout
      aside={
        <>
          <Display>{done ? "All set" : "A new password"}</Display>
          <Lede>
            {done
              ? "Every device that was signed in has been signed out, so the old password is no use to anyone."
              : "Pick something you don't use anywhere else."}
          </Lede>
        </>
      }
    >
      {done ? (
        <ButtonLink href="/sign-in">Sign in →</ButtonLink>
      ) : broken ? (
        <div role="alert">
          <p className="text-[clamp(18px,1.8vw,22px)] font-semibold text-bright">This link has expired or was used.</p>
          <p className="mt-3 text-[15px] text-muted">Reset links work once, for 30 minutes.</p>
          <ButtonLink href="/forgot-password" variant="secondary" className="mt-6">
            Send a new link
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-7">
          <Field
            label="New password"
            hint="At least 10 characters"
            name="password"
            type="password"
            minLength={10}
            autoComplete="new-password"
            required
          />
          <div className="mt-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save new password →"}
            </Button>
          </div>
          <p role="alert" aria-live="polite" className="min-h-6 text-[15px] text-marker">
            {error}
          </p>
        </form>
      )}
    </AccountLayout>
  );
}
