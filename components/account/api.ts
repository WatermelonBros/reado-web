/**
 * The Reado service, called from the browser. The session is a cookie the service
 * sets for itself; it reaches the service from this site because both live under
 * the same parent domain (and are both `localhost` in dev).
 */
export const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new ApiError(
      (data as { message?: string }).message ?? "Something went wrong. Try again.",
      res.status,
    );
  return data as T;
}

export const get = <T>(path: string) => request<T>("GET", path);
export const post = <T>(path: string, body: unknown = {}) => request<T>("POST", path, body);
export const del = <T>(path: string) => request<T>("DELETE", path);
export const put = <T>(path: string, body: unknown) => request<T>("PUT", path, body);

/** Where to go once signed in: back to the desktop app's flow, a page of this site
 *  (`?next=`, same-origin paths only), or the account page. */
export const nextAfterSignIn = (flow: string | null, next: string | null = null) =>
  flow
    ? `${API}/v1/auth/desktop/complete?flow=${encodeURIComponent(flow)}`
    : next?.startsWith("/") && !next.startsWith("//")
      ? next
      : "/account";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username?: string;
  plan?: string;
}

/** Avatar fallback, one letter per word: "Test" → "T", "Matteo Poli" → "MP". */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

/** "3 minutes ago", in the reader's language. */
export function ago(iso: string): string {
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
