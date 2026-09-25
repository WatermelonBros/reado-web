"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { Tag } from "@/components/ui/Tag";
import { TextButton, TextLink } from "@/components/ui/TextLink";
import { ApiError, get, initials, post, type SessionUser } from "./api";
import { AccountLayout, Lede } from "./AccountLayout";
import { FORGES, type ForgeId, forgeOAuth } from "./forges";

interface SessionRow {
  token: string;
  userAgent?: string | null;
  updatedAt: string;
}

/** A session's label: the desktop app names itself; a browser is named from its user agent. */
function where(s: SessionRow): string {
  const ua = s.userAgent ?? "";
  if (ua.startsWith("Reado")) return ua.replace(/^Reado · /, "Reado — ");
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

/** "3 minutes ago", in the reader's language. */
function ago(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
  ];
  let v = s;
  for (const [unit, size] of steps) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
    v /= size;
  }
  return rtf.format(Math.round(v), "year");
}

/** The signed-in account: who you are, your plan, and where you're signed in. */
export function AccountView() {
  const [me, setMe] = useState<{ user: SessionUser; session: { token: string } } | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [linked, setLinked] = useState<string[]>([]);
  const [forges, setForges] = useState<ForgeId[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const s = await get<{ user: SessionUser; session: { token: string } } | null>("/api/auth/get-session");
      if (!s) {
        location.href = "/sign-in";
        return;
      }
      setMe(s);
      const [rows, accounts, providers] = await Promise.all([
        get<SessionRow[]>("/api/auth/list-sessions"),
        get<{ providerId: string }[]>("/api/auth/list-accounts"),
        get<Record<ForgeId, boolean>>("/v1/auth/providers"),
      ]);
      setSessions(rows);
      setLinked(accounts.map((a) => a.providerId));
      setForges(FORGES.map((f) => f.id).filter((id) => providers[id]));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) location.href = "/sign-in";
      else setError("Can't reach the Reado service right now. Try again in a moment.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const u = me?.user;
  const first = u?.name?.split(" ")[0];

  return (
    <AccountLayout
      align="start"
      aside={
        <>
          <Display>{first ? <>Hi, {first}</> : "Your account"}</Display>
          {u ? (
            <div className="mt-8 flex items-center gap-4">
              {u.image ? (
                <img src={u.image} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-overlay text-lg font-semibold text-ink">
                  {initials(u.name || u.username || "")}
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-3 text-lg font-semibold text-ink">
                  <span className="truncate">@{u.username}</span>
                  <Tag tone={u.plan === "pro" ? "accent" : "quiet"}>{u.plan === "pro" ? "Pro" : "Free"}</Tag>
                </p>
                <p className="truncate text-[15px] text-muted">{u.email}</p>
              </div>
            </div>
          ) : (
            <Lede>{error ?? "Loading your account…"}</Lede>
          )}
          {u && (
            <Lede>
              {u.plan === "pro"
                ? "Pro is on for this account, in every Reado you sign in to."
                : "You're on the free plan: the whole app, plus your settings synced between machines."}
            </Lede>
          )}
        </>
      }
    >
      {me && (
        <>
          <h2 className="text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.02em] text-bright">
            Where you&rsquo;re signed in
          </h2>
          <ul className="mt-5 border-b border-line">
            {[...sessions]
              // This browser first, then the most recently active.
              .sort((a, b) =>
                a.token === me.session.token ? -1 : b.token === me.session.token ? 1 : b.updatedAt.localeCompare(a.updatedAt),
              )
              .map((s) => {
              const here = s.token === me.session.token;
              return (
                <li
                  key={s.token}
                  className="group flex items-center justify-between gap-4 border-t border-line py-[clamp(14px,2vh,22px)] transition-colors hover:border-line-strong"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-3 text-[clamp(18px,1.8vw,22px)] font-semibold tracking-[-0.01em] text-ink transition-colors group-hover:text-bright">
                      <span className="truncate">{where(s)}</span>
                      {here && <Tag>this browser</Tag>}
                    </span>
                    <span className="text-sm text-muted" title={new Date(s.updatedAt).toLocaleString()}>
                      active {ago(s.updatedAt)}
                    </span>
                  </span>
                  {!here && (
                    <TextButton
                      className="flex-none"
                      onClick={async () => {
                        await post("/api/auth/revoke-session", { token: s.token }).catch(() =>
                          setError("Couldn't sign that device out. Try again."),
                        );
                        void load();
                      }}
                    >
                      Sign out
                    </TextButton>
                  )}
                </li>
              );
            })}
          </ul>
          <h2 className="mt-14 text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.02em] text-bright">
            How you sign in
          </h2>
          <ul className="mt-5 border-b border-line">
            {linked.includes("credential") && (
              <li className="flex items-center justify-between gap-4 border-t border-line py-[clamp(14px,2vh,22px)]">
                <span className="text-[clamp(18px,1.8vw,22px)] font-semibold tracking-[-0.01em] text-ink">
                  Email and password
                </span>
              </li>
            )}
            {FORGES.filter((f) => forges.includes(f.id) || linked.includes(f.id)).map(({ id, label, Mark }) => (
              <li
                key={id}
                className="flex items-center justify-between gap-4 border-t border-line py-[clamp(14px,2vh,22px)]"
              >
                <span className="flex items-center gap-3 text-[clamp(18px,1.8vw,22px)] font-semibold tracking-[-0.01em] text-ink">
                  <Mark />
                  {label}
                  {!linked.includes(id) && <span className="text-sm font-normal text-muted">not linked</span>}
                </span>
                {linked.includes(id) ? (
                  linked.length > 1 && (
                    <TextButton
                      onClick={async () => {
                        await post("/api/auth/unlink-account", { providerId: id }).catch(() =>
                          setError(`Couldn't unlink ${label}. Try again.`),
                        );
                        void load();
                      }}
                    >
                      Unlink
                    </TextButton>
                  )
                ) : (
                  <TextButton
                    onClick={() => forgeOAuth(id, "/account", true).catch((e) => setError((e as Error).message))}
                  >
                    Link
                  </TextButton>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] text-muted">
            A linked GitHub, GitLab or Bitbucket account is also how Reado knows which of your{" "}
            <TextLink href="/account/org" className="text-[15px]">
              organizations
            </TextLink>{" "}
            you belong to.
          </p>

          <Button
            variant="secondary"
            className="mt-14"
            onClick={async () => {
              await post("/api/auth/sign-out").catch(() => {});
              location.href = "/sign-in";
            }}
          >
            Sign out of this browser
          </Button>
          {error && <p className="mt-4 text-[15px] text-marker">{error}</p>}
        </>
      )}
    </AccountLayout>
  );
}
