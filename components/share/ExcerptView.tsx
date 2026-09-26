"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { ButtonLink } from "@/components/ui/Button";
import { Display } from "@/components/ui/Display";
import { Tag } from "@/components/ui/Tag";
import { ago, ApiError, get } from "@/components/account/api";
import { Lede } from "@/components/account/AccountLayout";
import { RELEASES } from "@/components/links";

interface Excerpt {
  repo: string;
  file: string;
  branch: string | null;
  commit: string | null;
  from: number;
  lines: string[];
  highlight: { start: number; end: number } | null;
  comment: {
    type: string;
    state: string;
    messages: { name: string; agent?: string | null; at: number; body: string }[];
  };
  sharedBy: string;
  orgName: string | null;
  expiresAt: string;
}

/** A share link: someone's comment and the code under it, read-only, until it expires. */
export function ExcerptView() {
  const id = useSearchParams().get("id") ?? "";
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "gone" } | { kind: "sign-in" } | { kind: "not-member" } | { kind: "ok"; x: Excerpt }
  >({ kind: "loading" });

  useEffect(() => {
    get<Excerpt>(`/v1/public/excerpts/${encodeURIComponent(id)}`).then(
      (x) => setState({ kind: "ok", x }),
      (e) =>
        setState({
          kind:
            e instanceof ApiError && e.status === 401
              ? "sign-in"
              : e instanceof ApiError && e.status === 403
                ? "not-member"
                : "gone",
        }),
    );
  }, [id]);

  if (state.kind !== "ok") {
    const text = {
      loading: ["Opening the link", "Loading the shared code…"],
      gone: [
        "Link unavailable",
        "This link has expired or was revoked by the person who shared it. Ask them for a new one.",
      ],
      "sign-in": [
        "For members only",
        "This link is for the members of an organization. Sign in with your Reado account to open it.",
      ],
      "not-member": [
        "For members only",
        "This link is for the members of an organization you're not in. Ask the person who shared it to add you.",
      ],
    }[state.kind];
    return (
      <>
        <Nav />
        <main className="gutter grid min-h-dvh content-center pt-[clamp(120px,18vh,180px)] pb-[clamp(64px,10vh,120px)]">
          <Display>{text[0]}</Display>
          <Lede>{text[1]}</Lede>
          {state.kind === "sign-in" && (
            <div className="mt-10">
              <ButtonLink href={`/sign-in?next=${encodeURIComponent(`/s?id=${id}`)}`}>Sign in</ButtonLink>
            </div>
          )}
        </main>
      </>
    );
  }

  const { x } = state;
  const lit = (n: number) => !!x.highlight && n >= x.highlight.start && n <= x.highlight.end;
  const width = String(x.from + x.lines.length).length;
  return (
    <>
      <Nav />
      <main className="gutter pt-[clamp(120px,18vh,180px)] pb-[clamp(64px,10vh,120px)]">
        <p className="font-mono text-[13px] text-muted">
          {x.repo}
          {x.branch && ` · ${x.branch}`}
          {x.commit && ` @ ${x.commit}`}
        </p>
        <h1 className="mt-3 break-all font-mono text-[clamp(20px,2.3vw,30px)] font-semibold tracking-[-0.02em] text-bright">
          {x.file}
          {x.highlight && (
            <span className="text-muted">
              :{x.highlight.start}
              {x.highlight.end !== x.highlight.start && `–${x.highlight.end}`}
            </span>
          )}
        </h1>

        {x.lines.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-surface py-3">
            <pre className="m-0 min-w-max font-mono text-[13px] leading-[1.7]">
              {x.lines.map((line, i) => {
                const n = x.from + i;
                return (
                  <div
                    key={n}
                    className={`flex border-l-2 pr-6 ${lit(n) ? "border-marker bg-marker-soft text-bright" : "border-transparent text-ink"}`}>
                    <span className="select-none px-4 text-right text-faint" style={{ minWidth: `${width + 3}ch` }}>
                      {n}
                    </span>
                    <code>{line || " "}</code>
                  </div>
                );
              })}
            </pre>
          </div>
        )}

        <section className="mt-10 max-w-[72ch]">
          <p className="flex items-center gap-3">
            <Tag>{x.comment.type}</Tag>
            <Tag tone="quiet">{x.comment.state}</Tag>
          </p>
          <ol className="mt-4 border-b border-line">
            {x.comment.messages.map((m, i) => (
              <li key={i} className="border-t border-line py-[clamp(14px,2vh,22px)]">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">{m.name}</span>
                  {m.agent && ` · ${m.agent}`} · {ago(new Date(m.at).toISOString())}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[clamp(15px,1.4vw,17px)] leading-[1.6] text-ink">{m.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-6">
          <p className="text-[15px] text-muted">
            Shared by {x.sharedBy} from Reado
            {x.orgName ? ` with the members of ${x.orgName}` : ""} · this link expires {ago(x.expiresAt)}.
          </p>
          <ButtonLink href={RELEASES} variant="secondary">
            Read code like this in Reado
          </ButtonLink>
        </footer>
      </main>
    </>
  );
}
