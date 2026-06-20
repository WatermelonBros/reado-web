import Image from "next/image";

const REPO = "https://github.com/WatermelonBros/reado";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-[2px]">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
          <Image src="/icon.png" alt="" width={28} height={28} className="rounded-[7px]" />
          <span className="font-display text-[19px] tracking-tight text-ink">Reado</span>
        </a>
        <div className="flex items-center gap-5 text-sm text-muted">
          <a
            href="https://watermelon-studio.it"
            target="_blank"
            rel="noopener"
            className="hidden text-[13px] text-faint transition-colors hover:text-ink sm:inline"
          >
            by Watermelon&nbsp;Studio
          </a>
          <a href={REPO} target="_blank" rel="noopener" className="transition-colors hover:text-ink">
            GitHub
          </a>
          <a
            href="#download"
            className="rounded-lg bg-accent px-3.5 py-1.5 font-semibold text-on-accent transition hover:brightness-110"
          >
            Download
          </a>
        </div>
      </nav>
    </header>
  );
}
