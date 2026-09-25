"use client";

import { type InputHTMLAttributes, type ReactNode, useId } from "react";

/**
 * A form field in the site's editorial register: the label above, the value set
 * large on a single hairline — the same line the download index draws — instead
 * of a boxed app control. The line thickens to the accent while you type.
 *
 * `hint` sits to the right of the label but after the input in the document, so
 * a link there ("Forgot password?") is neither part of the input's name nor ahead
 * of it in tab order.
 */
export function Field({
  label,
  hint,
  className = "",
  id,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode }) {
  const auto = useId();
  const inputId = id ?? auto;
  // A plain-text hint is part of the field's description; a link hint is not.
  const describedBy = typeof hint === "string" ? `${inputId}-hint` : undefined;
  return (
    <div className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 ${className}`}>
      <label htmlFor={inputId} className="col-start-1 row-start-1 text-sm text-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={describedBy}
        className="col-span-2 row-start-2 mt-1.5 block w-full border-0 border-b border-line-strong bg-transparent px-0 pt-1.5 pb-2.5 text-[clamp(18px,1.6vw,21px)] text-bright caret-accent outline-none transition-colors placeholder:text-faint hover:border-muted focus:border-accent focus:shadow-[0_1px_0_var(--color-accent)] focus-visible:outline-none user-invalid:border-marker"
        {...input}
      />
      {hint && (
        <span id={describedBy} className="col-start-2 row-start-1 text-[13px] text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}
