export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-4 py-8 text-[13.5px] text-faint">
        <span>
          MIT · built with Tauri, React &amp; Rust · by{" "}
          <a
            href="https://watermelon-studio.it"
            target="_blank"
            rel="noopener"
            className="text-muted transition-colors hover:text-ink"
          >
            Watermelon Studio
          </a>
        </span>
        <a
          href="https://github.com/WatermelonBros/reado"
          target="_blank"
          rel="noopener"
          className="text-muted transition-colors hover:text-ink"
        >
          github.com/WatermelonBros/reado
        </a>
      </div>
    </footer>
  );
}
