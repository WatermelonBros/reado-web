import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The quiet text action beside a primary one ("Create an account", a row's
 * "Sign out"): muted until hovered, then ink with an underline. One hover for all.
 */
const cls =
  "text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-50";

export function TextLink({ className = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a className={`${cls} ${className}`} {...rest}>
      {children}
    </a>
  );
}

export function TextButton({
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className={`${cls} ${className}`} {...rest}>
      {children}
    </button>
  );
}
