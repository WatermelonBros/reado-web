"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { Field } from "@/components/ui/Field";
import { Tag } from "@/components/ui/Tag";
import { TextButton, TextLink } from "@/components/ui/TextLink";
import { ApiError, get, initials, post } from "./api";
import { AccountLayout, Lede } from "./AccountLayout";
import { FORGES, type ForgeId, forgeLabel, forgeOAuth } from "./forges";

type Role = "owner" | "admin" | "member";
interface MyOrg {
  id: string;
  name: string;
  slug: string;
  role: Role;
}
interface Joinable {
  orgId: string;
  name: string;
  forge: ForgeId;
  forgeOrg: string;
}
interface Member {
  id: string;
  userId: string;
  role: Role;
  user: { name: string; email: string; image?: string | null };
}
interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: string;
  expiresAt: string;
}
interface FullOrg {
  id: string;
  name: string;
  members: Member[];
  invitations: Invitation[];
}
interface Connection {
  forge: ForgeId;
  forgeOrg: string;
  namespace: string;
  needsReconnect: boolean;
}

/** What the service's `?error=<code>` after connecting a forge means. */
const CONNECT_ERRORS: Record<string, string> = {
  expired: "That connection attempt had expired. Start again from here.",
  signed_out: "You were signed out while connecting. Sign in and start again.",
  link_github: "Link your GitHub account to Reado first (below), then connect again.",
  not_admin: "Only an owner of that organization on the forge can connect it.",
  forbidden: "Only an owner of that organization on the forge can connect it.",
  not_found: "Reado couldn't see that organization. Check the name, and that you're a member.",
  bad_request: "GitHub apps can only be installed on organizations for this — not on a personal account.",
  unavailable: "The forge didn't answer. Try again in a moment.",
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const inviteLink = (id: string) => `${location.origin}/account/invite?id=${encodeURIComponent(id)}`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.02em] text-bright">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <li className="group flex items-center justify-between gap-4 border-t border-line py-[clamp(12px,1.8vh,18px)] transition-colors hover:border-line-strong">
      {children}
    </li>
  );
}

/** Your organizations: create one, join one your forge says you belong to, run one. */
export function OrgView() {
  const params = useSearchParams();
  const [mine, setMine] = useState<MyOrg[] | null>(null);
  const [joinable, setJoinable] = useState<Joinable[]>([]);
  const [forges, setForges] = useState<ForgeId[]>([]);
  const [linked, setLinked] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(params.get("id"));
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(() => {
    const ns = params.get("connected");
    return ns ? `Connected ${ns}. Its members can now join, and its projects belong to this organization.` : null;
  });
  const [error, setError] = useState<string | null>(() => {
    const code = params.get("error");
    return code ? (CONNECT_ERRORS[code] ?? "Connecting didn't work. Try again.") : null;
  });

  const load = useCallback(async () => {
    try {
      const s = await get<{ user?: unknown } | null>("/api/auth/get-session");
      if (!s?.user) {
        location.href = "/sign-in";
        return;
      }
      const [orgs, providers, accounts] = await Promise.all([
        get<MyOrg[]>("/v1/orgs/mine"),
        get<Record<ForgeId, boolean>>("/v1/auth/providers"),
        get<{ providerId: string }[]>("/api/auth/list-accounts"),
      ]);
      setMine(orgs);
      setForges(FORGES.map((f) => f.id).filter((id) => providers[id]));
      setLinked(accounts.map((a) => a.providerId));
      setSelected((cur) => (cur && orgs.some((o) => o.id === cur) ? cur : (orgs[0]?.id ?? null)));
      // Asking every connected forge takes a moment; the page doesn't wait for it.
      get<Joinable[]>("/v1/orgs/joinable")
        .then(setJoinable)
        .catch(() => {});
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) location.href = "/sign-in";
      else setError("Can't reach the Reado service right now. Try again in a moment.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = mine?.find((o) => o.id === selected) ?? null;

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    setError(null);
    try {
      const org = await post<{ id: string }>("/api/auth/organization/create", { name, slug: slugify(name) });
      setCreating(false);
      setSelected(org.id);
      await load();
    } catch (x) {
      setError(
        x instanceof ApiError && x.status === 400
          ? "That name is taken. Try another."
          : (x as Error).message,
      );
    }
  }

  async function join(j: Joinable) {
    setError(null);
    try {
      await post(`/v1/orgs/${j.orgId}/join`);
      setSelected(j.orgId);
      setJoinable((js) => js.filter((x) => x.orgId !== j.orgId));
      await load();
    } catch (x) {
      setError((x as Error).message);
    }
  }

  return (
    <AccountLayout
      align="start"
      aside={
        <>
          <Display>{current ? current.name : "Organizations"}</Display>
          <Lede>
            {current
              ? "Its members share comments on its projects. Connect its GitHub, GitLab or Bitbucket organization and colleagues join on their own."
              : "An organization shares comments across its projects. Its forge proves who it is — and who belongs."}
          </Lede>
          {mine && mine.length > 1 && (
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {mine.map((o) => (
                <li key={o.id}>
                  <TextButton
                    className={o.id === selected ? "text-ink underline" : ""}
                    onClick={() => setSelected(o.id)}
                  >
                    {o.name}
                  </TextButton>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8">
            <TextLink href="/account">← Your account</TextLink>
          </p>
        </>
      }
    >
      {notice && <p className="mb-8 text-[15px] text-accent">{notice}</p>}
      {error && <p className="mb-8 text-[15px] text-marker">{error}</p>}
      {mine === null ? (
        <Lede>Loading…</Lede>
      ) : (
        <>
          {joinable.length > 0 && (
            <Section title="You can join">
              <ul className="mt-5 border-b border-line">
                {joinable.map((j) => (
                  <Row key={j.orgId}>
                    <span className="min-w-0">
                      <span className="block truncate text-[clamp(18px,1.8vw,22px)] font-semibold text-ink">{j.name}</span>
                      <span className="text-sm text-muted">
                        you&rsquo;re in {j.forgeOrg} on {forgeLabel(j.forge)}
                      </span>
                    </span>
                    <Button variant="secondary" onClick={() => join(j)}>
                      Join
                    </Button>
                  </Row>
                ))}
              </ul>
            </Section>
          )}

          {current && !creating ? (
            <OrgDetail
              key={current.id}
              org={current}
              forges={forges}
              linked={linked}
              onError={setError}
              onNotice={setNotice}
              onLeft={async () => {
                setSelected(null);
                await load();
              }}
            />
          ) : (
            <Section title={mine.length ? "New organization" : "Create an organization"}>
              <form onSubmit={create} className="mt-6 flex flex-col gap-7">
                <Field label="Name" name="name" required minLength={2} maxLength={60} autoComplete="organization" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Button type="submit">Create →</Button>
                  {creating && <TextButton onClick={() => setCreating(false)}>Cancel</TextButton>}
                </div>
              </form>
            </Section>
          )}
          {current && !creating && (
            <p className="mt-14">
              <TextButton onClick={() => setCreating(true)}>+ New organization</TextButton>
            </p>
          )}
        </>
      )}
    </AccountLayout>
  );
}

function OrgDetail({
  org,
  forges,
  linked,
  onError,
  onNotice,
  onLeft,
}: {
  org: MyOrg;
  forges: ForgeId[];
  linked: string[];
  onError: (m: string | null) => void;
  onNotice: (m: string | null) => void;
  onLeft: () => Promise<void>;
}) {
  const [full, setFull] = useState<FullOrg | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [asking, setAsking] = useState<ForgeId | null>(null);
  const manage = org.role === "owner" || org.role === "admin";
  const here = `/account/org?id=${encodeURIComponent(org.id)}`;

  const load = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([
        get<FullOrg>(`/api/auth/organization/get-full-organization?organizationId=${encodeURIComponent(org.id)}`),
        get<Connection[]>(`/v1/orgs/${org.id}/connections`),
      ]);
      setFull(f);
      setConnections(c);
    } catch (e) {
      onError((e as Error).message);
    }
  }, [org.id, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Run an action, report its failure, reload. */
  const act = (fn: () => Promise<unknown>) => async () => {
    onError(null);
    try {
      await fn();
    } catch (e) {
      onError((e as Error).message);
    }
    await load();
  };

  async function connect(forge: ForgeId, forgeOrg?: string) {
    onError(null);
    if (forge === "github" && !linked.includes("github")) {
      // The installation is checked against your GitHub account: link it first.
      await forgeOAuth(forge, here, true).catch((x) => onError((x as Error).message));
      return;
    }
    try {
      const r = await post<{ url?: string; namespace?: string }>(`/v1/forges/${forge}/connect`, {
        orgId: org.id,
        forgeOrg,
      });
      if (r.url) {
        location.href = r.url; // GitHub: install the app, then come back here.
        return;
      }
      setAsking(null);
      onNotice(`Connected ${r.namespace}. Its members can now join, and its projects belong to ${org.name}.`);
      await load();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // No linked account on that forge yet: link it, then come back and connect.
        await forgeOAuth(forge, here, true).catch((x) => onError((x as Error).message));
        return;
      }
      onError((e as Error).message);
    }
  }

  const pending = full?.invitations.filter((i) => i.status === "pending") ?? [];

  return (
    <>
      <Section title="Members">
        <ul className="mt-5 border-b border-line">
          {full?.members.map((m) => (
            <Row key={m.id}>
              <span className="flex min-w-0 items-center gap-3">
                {m.user.image ? (
                  <img src={m.user.image} alt="" className="h-9 w-9 flex-none rounded-full object-cover" />
                ) : (
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-overlay text-sm font-semibold text-ink">
                    {initials(m.user.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold text-ink">{m.user.name}</span>
                  <span className="block truncate text-sm text-muted">{m.user.email}</span>
                </span>
              </span>
              <span className="flex flex-none items-center gap-4">
                {manage && (org.role === "owner" || m.role !== "owner") ? (
                  <select
                    aria-label={`Role of ${m.user.name}`}
                    value={m.role}
                    onChange={(e) =>
                      void act(() =>
                        post("/api/auth/organization/update-member-role", {
                          memberId: m.id,
                          role: e.target.value,
                          organizationId: org.id,
                        }),
                      )()
                    }
                    className="cursor-pointer rounded-full border border-line-strong bg-transparent px-3 py-1 font-mono text-[12px] text-ink outline-none hover:border-muted focus-visible:border-accent"
                  >
                    {org.role === "owner" && <option value="owner">owner</option>}
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                  </select>
                ) : (
                  <Tag tone={m.role === "member" ? "quiet" : "accent"}>{m.role}</Tag>
                )}
                {manage && m.role !== "owner" && (
                  <TextButton
                    onClick={act(() =>
                      post("/api/auth/organization/remove-member", {
                        memberIdOrEmail: m.id,
                        organizationId: org.id,
                      }),
                    )}
                  >
                    Remove
                  </TextButton>
                )}
              </span>
            </Row>
          ))}
        </ul>
      </Section>

      {manage && (
        <Section title="Invite">
          <form
            className="mt-6 flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = String(new FormData(form).get("email") ?? "");
              void act(async () => {
                await post("/api/auth/organization/invite-member", {
                  email,
                  role: "member",
                  organizationId: org.id,
                });
                form.reset();
                onNotice(`Invitation sent to ${email}. It works for 7 days.`);
              })();
            }}
          >
            <Field
              label="Email"
              name="email"
              type="email"
              required
              hint="They accept with this address, verified"
            />
            <div>
              <Button type="submit">Send invitation →</Button>
            </div>
          </form>
          {pending.length > 0 && (
            <ul className="mt-8 border-b border-line">
              {pending.map((i) => (
                <Row key={i.id}>
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] text-ink">{i.email}</span>
                    <span className="text-sm text-muted">
                      until {new Date(i.expiresAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="flex flex-none items-center gap-4">
                    <TextButton
                      onClick={() =>
                        navigator.clipboard
                          .writeText(inviteLink(i.id))
                          .then(() => onNotice(`Link for ${i.email} copied.`))
                      }
                    >
                      Copy link
                    </TextButton>
                    <TextButton
                      onClick={act(() => post("/api/auth/organization/cancel-invitation", { invitationId: i.id }))}
                    >
                      Cancel
                    </TextButton>
                  </span>
                </Row>
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section title="Forges">
        {connections.length > 0 ? (
          <ul className="mt-5 border-b border-line">
            {connections.map((c) => (
              <Row key={c.namespace}>
                <span className="min-w-0">
                  <span className="flex items-center gap-3 text-[17px] font-semibold text-ink">
                    <span className="truncate">{c.forgeOrg}</span>
                    {c.needsReconnect && <Tag>needs reconnect</Tag>}
                  </span>
                  <span className="text-sm text-muted">{c.namespace}</span>
                </span>
                {manage && c.needsReconnect && (
                  <TextButton onClick={() => void (c.forge === "github" ? connect("github") : setAsking(c.forge))}>
                    Reconnect
                  </TextButton>
                )}
              </Row>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[15px] text-muted">
            Nothing connected yet{manage ? "" : " — an owner or admin can connect one"}.
          </p>
        )}
        {manage && (
          <div className="mt-7 flex flex-col gap-3">
            {FORGES.filter((f) => forges.includes(f.id)).map(({ id, label, Mark, group }) =>
              asking === id ? (
                <form
                  key={id}
                  className="flex flex-col gap-5 border-t border-line pt-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void connect(id, String(new FormData(e.currentTarget).get("forgeOrg") ?? "").trim());
                  }}
                >
                  <Field
                    label={`${label} ${group}`}
                    name="forgeOrg"
                    required
                    placeholder={id === "gitlab" ? "acme or acme/platform" : "acme"}
                    hint="You need to be its owner"
                  />
                  <div className="flex items-center gap-6">
                    <Button type="submit">Connect →</Button>
                    <TextButton onClick={() => setAsking(null)}>Cancel</TextButton>
                  </div>
                </form>
              ) : (
                <Button
                  key={id}
                  variant="secondary"
                  className="w-full py-3"
                  onClick={() => (id === "github" ? void connect(id) : setAsking(id))}
                >
                  <Mark />
                  Connect a {label} {group}
                  {!linked.includes(id) && <span className="font-normal text-muted">· links your account</span>}
                </Button>
              ),
            )}
          </div>
        )}
      </Section>

      <p className="mt-14">
        <TextButton
          onClick={async () => {
            onError(null);
            try {
              await post("/api/auth/organization/leave", { organizationId: org.id });
              await onLeft();
            } catch {
              onError(
                org.role === "owner"
                  ? "You're its only owner. Make someone else owner first."
                  : "Couldn't leave. Try again.",
              );
            }
          }}
        >
          Leave {org.name}
        </TextButton>
      </p>
    </>
  );
}
