import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The site's pill buttons. `primary` is the one action a section asks for (accent
 * fill); `secondary` is everything beside it (a hairline pill that warms to the
 * marker on hover). Same shape on every page — the site's own, not the app's.
 */
type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-2.5 text-[15px] font-semibold transition-[filter,border-color,opacity] disabled:pointer-events-none disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-110",
  secondary: "border border-line-strong text-ink hover:border-marker/60",
};

export const buttonClass = (variant: Variant = "primary", extra = "") =>
  `${base} ${variants[variant]} ${extra}`.trim();

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button type="button" className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <a className={buttonClass(variant, className)} {...rest}>
      {children}
    </a>
  );
}
