"use client";

import { useEffect, useState } from "react";

const REPO = "WatermelonBros/reado";
const RELEASES = `https://github.com/${REPO}/releases/latest`;

type Target = { id: string; label: string; note: string; test: (n: string) => boolean };
const TARGETS: Target[] = [
  { id: "mac-arm", label: "macOS", note: "Apple Silicon", test: (n) => /aarch64\.dmg$/i.test(n) },
  { id: "mac-x64", label: "macOS", note: "Intel", test: (n) => /x64\.dmg$/i.test(n) },
  { id: "linux", label: "Linux", note: "AppImage", test: (n) => /\.AppImage$/i.test(n) },
  { id: "win", label: "Windows", note: "Installer", test: (n) => /x64-setup\.exe$/i.test(n) },
];

function detectOS(): string | null {
  if (typeof navigator === "undefined") return null;
  const p = (navigator.userAgent + navigator.platform).toLowerCase();
  if (p.includes("win")) return "win";
  if (p.includes("linux") && !p.includes("android")) return "linux";
  if (p.includes("mac")) return "mac-arm";
  return null;
}

export function Download() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [os, setOs] = useState<string | null>(null);

  useEffect(() => {
    setOs(detectOS());
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rel) => {
        const map: Record<string, string> = {};
        for (const t of TARGETS) {
          const a = (rel.assets || []).find((x: { name: string }) => t.test(x.name));
          if (a) map[t.id] = a.browser_download_url;
        }
        setUrls(map);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="download" className="border-t border-line bg-bg-2/40">
      <div className="mx-auto max-w-[1120px] px-4 py-24 sm:py-28">
        <div className="grid items-end gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-display text-[clamp(32px,5vw,56px)] leading-[1.02] tracking-tight text-ink">
              Start reading.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-muted">
              Free and open source. Signed builds for every desktop, and Reado keeps itself up to
              date from there.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {TARGETS.map((t) => {
              const href = urls[t.id] ?? RELEASES;
              const primary = t.id === os;
              return (
                <a
                  key={t.id}
                  href={href}
                  className={`group flex items-center justify-between rounded-xl border px-4 py-3.5 transition ${
                    primary
                      ? "border-transparent bg-accent text-on-accent"
                      : "border-line-2 bg-bg text-ink hover:border-faint"
                  }`}
                >
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-semibold">{t.label}</span>
                    <span className={`text-[13px] ${primary ? "opacity-75" : "text-faint"}`}>{t.note}</span>
                  </span>
                  <span className={`text-sm ${primary ? "opacity-90" : "text-faint group-hover:text-ink"}`}>
                    {primary ? "Recommended ↓" : "Download ↓"}
                  </span>
                </a>
              );
            })}
            <a
              href={RELEASES}
              target="_blank"
              rel="noopener"
              className="mt-1 text-center text-sm text-faint transition-colors hover:text-ink"
            >
              All downloads &amp; release notes →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
