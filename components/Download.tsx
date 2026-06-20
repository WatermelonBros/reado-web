"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { GITHUB, RELEASES } from "./links";

type OS = "mac" | "win" | "linux";

const TARGETS: { id: string; os: OS; label: string; note: string; re: RegExp }[] = [
  { id: "mac-arm", os: "mac", label: "macOS", note: "Apple Silicon", re: /aarch64\.dmg$/i },
  { id: "mac-x64", os: "mac", label: "macOS", note: "Intel", re: /x64\.dmg$/i },
  { id: "win", os: "win", label: "Windows", note: "x64 installer", re: /x64-setup\.exe$/i },
  { id: "linux", os: "linux", label: "Linux", note: "AppImage", re: /\.AppImage$/i },
];

type Asset = (typeof TARGETS)[number] & { url: string };

function detectOS(): OS {
  const ua = (navigator.userAgent + navigator.platform).toLowerCase();
  if (ua.includes("win")) return "win";
  if (ua.includes("linux") && !ua.includes("android")) return "linux";
  return "mac";
}

const fmtStars = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

// Tiny TTL cache over localStorage so a reloading/returning visitor doesn't
// re-hit GitHub's 60/h anonymous rate limit. ponytail: localStorage + TTL, no
// dep — swap for react-query + a persister only if this grows past two GETs.
const CACHE_TTL = 60 * 60 * 1000; // 1h, matches GitHub's anon rate-limit window

async function cachedJson<T>(url: string, key: string): Promise<T> {
  try {
    const hit = localStorage.getItem(key);
    if (hit) {
      const { t, v } = JSON.parse(hit) as { t: number; v: T };
      if (Date.now() - t < CACHE_TTL) return v;
    }
  } catch {
    // corrupt/unavailable storage — fall through to a live fetch
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${key} ${r.status}`);
  const v = (await r.json()) as T;
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }));
  } catch {
    // quota/private-mode — caching is best-effort, ignore
  }
  return v;
}

const Arrow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 4v13m0 0l5-5m-5 5l-5-5M5 20h14" />
  </svg>
);

const Star = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.6l2.7 6.06 6.6.57-5 4.34 1.5 6.45L12 16.9l-5.8 3.72 1.5-6.45-5-4.34 6.6-.57z" />
  </svg>
);

export function Download() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [os, setOs] = useState<OS>("mac");
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    setOs(detectOS());
    cachedJson<{ assets?: { name: string; browser_download_url: string }[] }>(
      "https://api.github.com/repos/WatermelonBros/reado/releases/latest",
      "reado:releases",
    )
      .then((rel) => {
        const found = TARGETS.map((t) => {
          const a = (rel.assets ?? []).find((x) => t.re.test(x.name));
          return a ? { ...t, url: a.browser_download_url } : null;
        }).filter((x): x is Asset => x !== null);
        setAssets(found);
      })
      .catch(() => setAssets([]));

    cachedJson<{ stargazers_count?: number }>(
      "https://api.github.com/repos/WatermelonBros/reado",
      "reado:repo",
    )
      .then((repo) => {
        if (typeof repo.stargazers_count === "number") setStars(repo.stargazers_count);
      })
      .catch(() => {});
  }, []);

  // Order the list so the visitor's platform leads (Apple Silicon for macOS).
  const prefId = os === "win" ? "win" : os === "linux" ? "linux" : "mac-arm";
  const rows: { id: string; label: string; note: string; href: string; mine: boolean }[] =
    assets.length
      ? [...assets]
          .sort((a, b) => (a.id === prefId ? -1 : b.id === prefId ? 1 : 0))
          .map((a) => ({ id: a.id, label: a.label, note: a.note, href: a.url, mine: a.id === prefId }))
      : TARGETS.map((t) => ({
          id: t.id,
          label: t.label,
          note: t.note,
          href: RELEASES,
          mine: t.id === prefId,
        }));

  return (
    <section
      id="download"
      className="overflow-hidden border-t border-line py-[clamp(100px,18vh,200px)]"
    >
      <div className="gutter grid gap-x-16 gap-y-[clamp(48px,8vh,96px)] lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        {/* left: the statement + the star ask */}
        <Reveal>
          <h2 className="text-[clamp(52px,9vw,132px)] font-semibold leading-[0.88] tracking-[-0.045em] text-bright">
            Start
            <br />
            reading<span className="text-marker">.</span>
          </h2>
          <p className="mt-7 max-w-[34ch] text-[clamp(16px,1.5vw,20px)] leading-[1.5] text-ink/80">
            Free, open source, and signed for every desktop. Reado keeps itself
            up to date from there.
          </p>

          <a
            href={GITHUB}
            target="_blank"
            rel="noopener"
            className="group mt-9 inline-flex items-center gap-3 rounded-full border border-line-strong py-2.5 pr-2.5 pl-5 text-[15px] font-semibold text-ink transition-colors hover:border-marker/60"
          >
            <span className="text-marker transition-transform duration-300 group-hover:rotate-[72deg]">
              <Star />
            </span>
            Star Reado on GitHub
            <span className="rounded-full bg-overlay px-3 py-1 font-mono text-[13px] text-muted tabular-nums">
              {stars !== null ? fmtStars(stars) : "★"}
            </span>
          </a>
        </Reveal>

        {/* right: the download index — big, editorial, no card */}
        <Reveal delay={120}>
          <div className="border-b border-line">
            {rows.map((r) => (
              <a
                key={r.id}
                href={r.href}
                className="group flex items-center justify-between gap-4 border-t border-line py-[clamp(16px,2.4vh,28px)] transition-[padding,border-color] duration-300 hover:border-line-strong hover:pl-3"
              >
                <span className="flex items-center gap-4">
                  <span
                    className={`transition-colors ${r.mine ? "text-marker" : "text-faint group-hover:text-marker"}`}
                  >
                    <Arrow />
                  </span>
                  <span className="text-[clamp(24px,3vw,38px)] font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-bright">
                    {r.label}
                  </span>
                  {r.mine && (
                    <span className="rounded-full border border-marker/40 px-2.5 py-0.5 font-mono text-[11px] tracking-wide text-marker">
                      for you
                    </span>
                  )}
                </span>
                <span className="hidden font-mono text-sm text-faint sm:block">
                  {r.note}
                </span>
              </a>
            ))}
            <a
              href={RELEASES}
              className="mt-6 inline-block text-sm text-muted transition-colors hover:text-ink"
            >
              All downloads &amp; release notes →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
