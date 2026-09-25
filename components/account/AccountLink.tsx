"use client";

import { useEffect, useState } from "react";
import { get, initials, type SessionUser } from "./api";

/**
 * The account corner of the nav: "Sign in" when signed out, your avatar (to
 * /account) when signed in. The site is static, so the session is asked for after
 * load; meanwhile the slot takes the size of what this browser showed last time
 * (remembered locally), so the nav doesn't jump. The account is
 * optional — this stays a quiet link, never competing with Download.
 */
const SEEN = "reado.account.signedIn";

export function AccountLink() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [wasSignedIn, setWasSignedIn] = useState(false);

  useEffect(() => {
    try {
      setWasSignedIn(localStorage.getItem(SEEN) === "1");
    } catch {}
    get<{ user?: SessionUser } | null>("/api/auth/get-session")
      .then((s) => setUser(s?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    try {
      localStorage.setItem(SEEN, user ? "1" : "0");
    } catch {}
  }, [user]);

  const slot = "grid h-9 items-center";
  if (user === undefined)
    return <span className={`${slot} ${wasSignedIn ? "ml-2 w-9" : "w-[64px]"}`} aria-hidden />;

  if (!user)
    return (
      <a
        href="/sign-in"
        className={`${slot} w-[64px] justify-items-center rounded-lg text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink`}
      >
        Sign in
      </a>
    );

  const name = user.name || user.username || "Your account";
  return (
    <a href="/account" aria-label={`Your account (${name})`} title={name} className={`${slot} group ml-2 w-9 justify-items-center`}>
      {user.image ? (
        <img
          src={user.image}
          alt=""
          width={30}
          height={30}
          className="h-[30px] w-[30px] rounded-full object-cover ring-1 ring-line transition-shadow group-hover:ring-2 group-hover:ring-accent"
        />
      ) : (
        <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-overlay text-xs font-semibold text-ink ring-1 ring-line transition-shadow group-hover:ring-2 group-hover:ring-accent">
          {initials(name)}
        </span>
      )}
    </a>
  );
}
