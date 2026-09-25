"use client";

import { post } from "./api";

/** The code forges Reado signs in with, links, and verifies organizations through. */
export type ForgeId = "github" | "gitlab" | "bitbucket";

const GitHubMark = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);
const GitLabMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="m23.6 9.593-.033-.086L20.3.98a.851.851 0 0 0-1.626.059L16.47 7.818H7.537L5.333 1.07a.857.857 0 0 0-1.626-.06L.433 9.502l-.032.086a6.066 6.066 0 0 0 2.012 7.01l.01.009.03.021 4.977 3.727 2.462 1.863 1.5 1.132a1.008 1.008 0 0 0 1.22 0l1.499-1.132 2.461-1.863 5.006-3.75.013-.01a6.068 6.068 0 0 0 2.01-7.002z" />
  </svg>
);
const BitbucketMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
  </svg>
);

export const FORGES: { id: ForgeId; label: string; Mark: () => React.JSX.Element; group: string }[] = [
  { id: "github", label: "GitHub", Mark: GitHubMark, group: "organization" },
  { id: "gitlab", label: "GitLab", Mark: GitLabMark, group: "group" },
  { id: "bitbucket", label: "Bitbucket", Mark: BitbucketMark, group: "workspace" },
];

export const forgeLabel = (id: string) => FORGES.find((f) => f.id === id)?.label ?? id;

/**
 * Send the browser through a forge's OAuth: to sign in, or (`link`) to add it to the
 * signed-in account. Bitbucket is a generic OAuth provider on the service, so it has
 * its own endpoints.
 */
export async function forgeOAuth(forge: ForgeId, callbackURL: string, link = false) {
  const absolute = callbackURL.startsWith("http") ? callbackURL : `${location.origin}${callbackURL}`;
  const generic = forge === "bitbucket";
  const path = generic
    ? link
      ? "/api/auth/oauth2/link"
      : "/api/auth/sign-in/oauth2"
    : link
      ? "/api/auth/link-social"
      : "/api/auth/sign-in/social";
  const { url } = await post<{ url: string }>(path, {
    ...(generic ? { providerId: forge } : { provider: forge }),
    callbackURL: absolute,
    // Where the service sends a failure (`?error=<code>`): back to the same page.
    errorCallbackURL: absolute,
  });
  location.href = url;
}
