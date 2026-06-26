import type { ReactNode } from "react";

/** The demo project's file tree. */
export const DEMO_TREE = [
  { name: "src", dir: true, depth: 0 },
  { name: "cart.ts", dir: false, depth: 1 },
  { name: "discounts.ts", dir: false, depth: 1 },
  { name: "types.ts", dir: false, depth: 1 },
  { name: "index.ts", dir: false, depth: 1 },
  { name: "package.json", dir: false, depth: 0 },
] as const;

// Hand-highlighted spans (perfect highlighting, zero runtime cost, 60fps-safe).
const K = ({ children }: { children: ReactNode }) => <span className="text-syn-keyword">{children}</span>;
const C = ({ children }: { children: ReactNode }) => <span className="text-syn-control">{children}</span>;
const D = ({ children }: { children: ReactNode }) => <span className="text-syn-definition">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-syn-string">{children}</span>;
const N = ({ children }: { children: ReactNode }) => <span className="text-syn-number">{children}</span>;
const M = ({ children }: { children: ReactNode }) => <span className="text-syn-comment">{children}</span>;
const P = ({ children }: { children: ReactNode }) => <span className="text-syn-punctuation">{children}</span>;

/** cart.ts — a believable TS file with a subtle money bug (no rounding/clamp). */
export const DEMO_LINES: ReactNode[] = [
  <>
    <K>import</K> <P>{"{"}</P> CartItem<P>,</P> Discount <P>{"}"}</P> <K>from</K> <S>&quot;./types&quot;</S>
    <P>;</P>
  </>,
  <>
    <K>import</K> <P>{"{"}</P> DISCOUNTS <P>{"}"}</P> <K>from</K> <S>&quot;./discounts&quot;</S>
    <P>;</P>
  </>,
  <>&nbsp;</>,
  <>
    <M>{"// Apply a discount code to the cart and return the amount due."}</M>
  </>,
  <>
    <K>export</K> <K>function</K> <D>applyDiscount</D>
    <P>(</P>items<P>:</P> CartItem<P>[],</P> code<P>:</P> <D>string</D>
    <P>)</P>
    <P>:</P> <D>number</D> <P>{"{"}</P>
  </>,
  <>
    {"  "}
    <K>const</K> total <P>=</P> items<P>.</P>
    <D>reduce</D>
    <P>((</P>sum<P>,</P> i<P>)</P> <C>=&gt;</C> sum <P>+</P> i<P>.</P>price <P>*</P> i<P>.</P>qty<P>,</P> <N>0</N>
    <P>);</P>
  </>,
  <>
    {"  "}
    <K>const</K> rule <P>=</P> DISCOUNTS<P>[</P>code<P>];</P>
  </>,
  <>
    {"  "}
    <C>if</C> <P>(</P>
    <P>!</P>rule<P>)</P> <C>return</C> total<P>;</P>
  </>,
  <>&nbsp;</>,
  <>
    {"  "}
    <M>{"// percent off, applied to the running total"}</M>
  </>,
  <>
    {"  "}
    <C>return</C> total <P>-</P> total <P>*</P> rule<P>.</P>percent<P>;</P>
  </>,
  <>
    <P>{"}"}</P>
  </>,
];
