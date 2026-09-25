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

/** Where to go once signed in: back to the desktop app's flow, or the account page. */
export const nextAfterSignIn = (flow: string | null) =>
  flow ? `${API}/v1/auth/desktop/complete?flow=${encodeURIComponent(flow)}` : "/account";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username?: string;
  plan?: string;
}
