"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { TextButton } from "@/components/ui/TextLink";
import { get, post } from "./api";
import { AccountLayout, Lede } from "./AccountLayout";

interface Invitation {
  id: string;
  email: string;
  organizationName: string;
  inviterEmail: string;
}

/** An invitation link: sign in with the invited address, then accept or decline. */
export function InviteView() {
  const id = useSearchParams().get("id") ?? "";
  const back = `/account/invite?id=${encodeURIComponent(id)}`;
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "signed-out" }
    | { kind: "invalid" }
    | { kind: "unverified" }
    | { kind: "open"; inv: Invitation; email: string }
  >({ kind: "loading" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await get<{ user?: { email: string } } | null>("/api/auth/get-session").catch(() => null);
      if (!s?.user) return setState({ kind: "signed-out" });
      try {
        const inv = await get<Invitation>(`/api/auth/organization/get-invitation?id=${encodeURIComponent(id)}`);
        setState({ kind: "open", inv, email: s.user.email });
      } catch (e) {
        // Unverified address; otherwise expired, cancelled, used, or for another email.
        setState({ kind: (e as Error).message.toLowerCase().includes("verif") ? "unverified" : "invalid" });
      }
    })();
  }, [id]);

  async function answer(accept: boolean) {
    setError(null);
    try {
      await post(`/api/auth/organization/${accept ? "accept" : "reject"}-invitation`, { invitationId: id });
      location.href = accept ? "/account/org" : "/account";
    } catch (e) {
      setError(
        (e as Error).message.toLowerCase().includes("verif")
          ? "Confirm your email address first — the link is in the email we sent when you signed up."
          : (e as Error).message,
      );
    }
  }

  const heading = state.kind === "open" ? <>Join {state.inv.organizationName}</> : "Invitation";
  return (
    <AccountLayout
      aside={
        <>
          <Display>{heading}</Display>
          <Lede>
            {state.kind === "open"
              ? `${state.inv.inviterEmail} invited ${state.inv.email}. Members share comments on the organization's projects.`
              : state.kind === "signed-out"
                ? "Sign in with the email address the invitation was sent to, and you'll come back here."
                : state.kind === "unverified"
                  ? "Confirm your email address first — the link is in the email we sent when you signed up — then open this invitation again."
                  : state.kind === "invalid"
                  ? "This invitation has expired, was cancelled, or is for another email address. Ask for a new one."
                  : "Loading the invitation…"}
          </Lede>
        </>
      }
    >
      {state.kind === "signed-out" && (
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={`/sign-in?next=${encodeURIComponent(back)}`}>Sign in →</ButtonLink>
          <ButtonLink variant="secondary" href={`/sign-up?next=${encodeURIComponent(back)}`}>
            Create an account
          </ButtonLink>
        </div>
      )}
      {state.kind === "open" && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button onClick={() => answer(true)}>Accept →</Button>
          <TextButton onClick={() => answer(false)}>Decline</TextButton>
        </div>
      )}
      {error && <p className="mt-6 text-[15px] text-marker">{error}</p>}
    </AccountLayout>
  );
}
