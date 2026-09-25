import type { ReactNode } from "react";

/**
 * A page's headline, set big and tight, ending on the marker-coloured full stop
 * the whole site closes its statements with ("Start reading.").
 */
export function Display({
  children,
  as: Tag = "h1",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag
      className={`text-[clamp(44px,8.4vw,120px)] font-semibold leading-[0.9] tracking-[-0.04em] text-balance text-bright ${className}`}
    >
      {children}
      <span className="text-marker">.</span>
    </Tag>
  );
}
