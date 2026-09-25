---
name: Reado (website)
description: The site for Reado, the read-first code IDE. An editorial page on the app's dark ink, not a copy of the app.
colors:
  canvas: "oklch(0.2 0.018 250)"
  surface: "oklch(0.24 0.02 250)"
  overlay: "oklch(0.27 0.022 250)"
  line: "oklch(0.32 0.02 250)"
  line-strong: "oklch(0.42 0.02 250)"
  ink: "oklch(0.8 0.012 250)"
  bright: "oklch(0.95 0.008 250)"
  muted: "oklch(0.62 0.012 250)"
  faint: "oklch(0.5 0.012 250)"
  accent: "oklch(0.74 0.11 260)"
  on-accent: "oklch(0.98 0.01 260)"
  marker: "oklch(0.72 0.16 35)"
  marker-soft: "oklch(0.72 0.16 35 / 0.16)"
  resolved: "oklch(0.76 0.11 150)"
typography:
  display:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(44px, 8.4vw, 120px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(32px, 5vw, 64px)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(20px, 2.3vw, 30px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(16px, 1.5vw, 20px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(15px, 1.4vw, 17px)"
    fontWeight: 400
    lineHeight: 1.6
  field-value:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(18px, 1.6vw, 21px)"
    fontWeight: 400
  label:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  mono-tag:
    fontFamily: "JetBrains Mono, SF Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.025em"
rounded:
  pill: "9999px"
  nav: "8px"
  logo: "9px"
  focus: "4px"
spacing:
  gutter: "clamp(20px, 4.5vw, 72px)"
  section-y: "clamp(56px, 10vh, 120px)"
  row-y: "clamp(20px, 3vh, 32px)"
  field-stack: "28px"
  column-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.bright}"
    typography: "{typography.field-value}"
    rounded: "0"
    padding: "6px 0 10px"
  tag-marker:
    backgroundColor: "transparent"
    textColor: "{colors.marker}"
    typography: "{typography.mono-tag}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  tag-accent:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.mono-tag}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  tag-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.mono-tag}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  text-link:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  text-link-hover:
    textColor: "{colors.ink}"
---

# Design System: Reado (website)

## Overview

**Creative North Star: "The Annotated Page"**

The site is set like an editorial page printed on the app's dark ink. Huge, tight grotesk statements that close on a warm full stop; hairline rules that divide content into index rows; a single cool accent for the one action a section asks for. Nothing is boxed. There are no cards, no panels, no app chrome: content sits directly on the canvas and is organised by type scale and hairlines alone.

It borrows the app's palette (the tokens are copied 1:1 from the app's `reado-dark` theme) but not its interface. The site is a website: its buttons are pills, its fields are single hairlines with the value set large, its lists are editorial rows. The app's controls, icon buttons and form widgets do not appear here. The one place the app's look is reproduced faithfully is the in-page product mock (`components/ReadoMock.tsx`, `components/tour/*`), which is a picture of the product, not part of the site's system.

The voice is calm, precise and quiet. Motion is a single soft rise on scroll; colour is rationed; the marker orange appears as punctuation, never as decoration.

**Key Characteristics:**
- Dark, cool blue-grey canvas; flat, no shadows on site surfaces.
- Display type at up to 120px, weight 600, leading 0.9, tracking -0.04em, ending on a marker-orange full stop.
- Hairline rules (`line`) as the only structure: section tops, index rows, field underlines.
- Two-column composition on a shared gutter rail: statement left, working part right.
- Pill buttons: accent fill for the primary, hairline outline for everything else.

## Colors

A cool, low-chroma blue-grey ink ramp (hue 250) with one cool accent and one warm marker.

### Primary
- **Reading Blue** (`accent`): the primary button fill, the focus ring, the field caret and focus underline, the `accent` tag. One primary action per section.

### Secondary
- **Marker Orange** (`marker`): the full stop that closes every display headline, the "for you"/"this browser" tag, the arrow on the visitor's own download row, the secondary button's hover border, and inline error text. It is the app's open-comment colour; on the site it is punctuation.

### Tertiary
- **Resolved Green** (`resolved`): the app's resolved-comment colour. On the site it marks "shipped" status dots on the roadmap only.

### Neutral
- **Ink Canvas** (`canvas`): the page background everywhere.
- **Raised Ink** (`surface`): hover fill behind nav links and nav icon links; nothing else.
- **Overlay Ink** (`overlay`): the initials avatar disc on the account page.
- **Hairline** (`line`): section dividers, index row rules, the scrolled nav's bottom border.
- **Strong Hairline** (`line-strong`): field underline at rest, secondary button border, quiet tag border, row hover rule, scrollbar thumb.
- **Bright Paper** (`bright`): display and headline type, field values. Reserved for the highest-impact text.
- **Ink** (`ink`): row titles, secondary button text, lede text at 80% opacity.
- **Muted** (`muted`): labels, body copy under headings, text links at rest, nav links.
- **Faint** (`faint`): mono notes on rows, placeholders, footer.

### Named Rules
**The Full Stop Rule.** A display statement ends with a full stop in `marker`. It is the site's signature and the marker's main job; don't spend the marker on fills or backgrounds.

**The One Action Rule.** A section offers at most one `accent`-filled button; every other action is a secondary pill or a text link.

## Typography

**Display Font:** Hanken Grotesk (with -apple-system, Segoe UI, sans-serif)
**Body Font:** Hanken Grotesk
**Label/Mono Font:** JetBrains Mono (with SF Mono, ui-monospace, Menlo)

**Character:** One grotesk carries everything, from 120px statements to 13px hints; weight 600 with steep negative tracking gives the display its density. The mono is small and factual: tags, platform notes, status words.

### Hierarchy
- **Display** (600, clamp(44px, 8.4vw, 120px), 0.9, -0.04em): one per page, the page's statement ("Welcome back.", "Start reading."). Balanced wrapping, `bright`, marker full stop.
- **Headline** (600, clamp(32px, 5vw, 64px), 0.96, -0.03em): section statements beside an index (roadmap horizons, story sections).
- **Title** (600, clamp(20px, 2.3vw, 30px), -0.02em): the title of an index row; download rows step up to clamp(24px, 3vw, 38px).
- **Lede** (400, clamp(16px, 1.5vw, 20px), 1.5): the paragraph under a display, `ink` at 80%, max 34ch beside a form, up to 56ch full-width.
- **Body** (400, clamp(15px, 1.4vw, 17px), 1.6): row descriptions in `muted`, max 58ch.
- **Label** (400, 14px): field labels and text links in `muted`; hints at 13px.
- **Mono tag** (400, 11px, slight tracking, sentence/lower case): tags and row notes. Never uppercase.

### Named Rules
**The Tight Statement Rule.** Big type is tight: leading 0.88 to 0.98 and tracking -0.03em to -0.045em at display and headline sizes. Loose big type is off-system.

## Layout

Every horizontal edge sits on one rail, the gutter (`clamp(20px, 4.5vw, 72px)` inline padding), shared by the nav, headlines, product mock, forms and footer.

Sections are full-bleed, separated by a hairline top border, with vertical padding around `clamp(56px, 10vh, 120px)` (up to `clamp(100px, 18vh, 200px)` for the download finale). At `lg` a section splits into two columns with a 64px column gap: the statement on the left (`0.8fr`–`0.95fr`), the working part on the right (`1.05fr`–`1.2fr`). Below `lg` it stacks.

The account pages use this same split (`AccountLayout`): a full-height grid, statement left, work right capped at 520px and pushed to the right edge. `align="end"` lines a short form up with the headline's foot; `align="start"` lets a long list run down from the top.

Forms stack fields at 28px; the action row sits below with a 24px gap between the primary button and a text link.

## Elevation & Depth

The site is flat. Depth comes from type scale, the ink ramp and hairlines, never from shadows. The one layered surface is the nav once the page scrolls: a 78% canvas mix with a 10px backdrop blur and a hairline bottom border. The `--shadow` token and the inset marker rails exist for the product mock only.

### Named Rules
**The Hairline Not Box Rule.** Structure is a 1px rule, not a container. If content needs grouping, put it in index rows between hairlines; don't reach for a card, panel or shadow.

## Shapes

Two shapes: the full pill (buttons, tags, avatar) and the straight hairline (rows, fields, section rules). Fields have no corners at all. Small 8px rounding appears only on nav links' hover fill; 9px on the logo tile; 4px on the focus outline.

## Components

### Buttons
Soft, confident pills in one size.
- **Shape:** full pill (9999px).
- **Primary:** `accent` fill, `canvas` (dark) text — about 8:1, where `on-accent`'s near-white reads about 2:1 and is kept only for the app mock — 15px semibold, 10px 20px padding. The nav's Download uses the same pill at 14px, 8px 16px.
- **Hover / Focus:** primary brightens (`brightness(1.1)`); focus is the global 2px `accent` outline at 2px offset. Disabled drops to 50% and ignores the pointer.
- **Secondary:** transparent, 1px `line-strong` border, `ink` text; the border warms to `marker` at 60% on hover.

### Chips
- **Style:** Tag. Pill, 1px border at 40% of its tone, mono 11px, transparent fill. Tones: `marker` (default: "for you", "this browser"), `accent` ("Pro"), `quiet` (`line-strong` border, `muted` text).
- **State:** static labels on a row; not interactive.

### Inputs / Fields
Editorial, not boxed.
- **Style:** label above in 14px `muted`; the value set at clamp(18px, 1.6vw, 21px) in `bright` on a single `line-strong` underline, no background, no side padding. An optional hint (13px `muted`) sits right of the label, after the input in the DOM; a plain-text hint is wired as `aria-describedby`, a link hint is not.
- **Focus:** underline turns `accent` and doubles to 2px (a 1px shadow below the border); caret is `accent`. Hover darkens the underline to `muted`.
- **Error:** `:user-invalid` turns the underline `marker`; form errors appear below the actions as 15px `marker` text in a live region.

### Text links
- **TextLink / TextButton:** 14px `muted`, underline offset 4px; on hover `ink` with underline. One hover for every quiet action ("Create an account", a row's "Sign out").

### Navigation
- Fixed, full-width, on the gutter. Logo tile (40px, 9px corners) plus "Reado" at 22px semibold -0.03em. Right side: "Roadmap" and icon links in `muted`, hovering to `ink` on a `surface` fill with 8px corners; the primary Download pill last. Transparent at the top; after 40px of scroll it gains the blurred 78% canvas and a hairline.

### Index row (signature)
The site's list: rows between hairlines, a top border on each row and a bottom border on the list. Title in `ink` at title size, supporting text or a mono note in `muted`/`faint` at the far end. Linked rows go `bright` and their rule goes `line-strong` on hover; download rows also indent 12px. Used by the download index, the roadmap items and the account's session list.

### Display (signature)
The page headline: display type, `bright`, balanced, closing on the marker full stop.

### Product mock (exception)
`ReadoMock` and the tour reproduce the app's UI, including its syntax colours, traffic-light dots, elevated shadow and inset marker rails. That is a faithful picture of the product and is exempt from this system; nothing in it should be copied into site surfaces.

## Do's and Don'ts

### Do:
- **Do** close every display statement with a `marker` full stop (use `Display`).
- **Do** put page content on the gutter rail and split sections statement-left, work-right at `lg`.
- **Do** build lists as hairline index rows, and forms from `Field` hairlines with one primary pill and a text link beside it.
- **Do** keep big type tight: leading 0.88–0.98, tracking -0.03em to -0.045em.
- **Do** reveal sections with the single soft rise (34px, 0.8s, `cubic-bezier(0.16, 1, 0.3, 1)`), and show them static under reduced motion.

### Don't:
- **Don't** use the desktop app's interface components or form controls on the site: no boxed inputs, icon-button toolbars, segmented controls or app dialogs. The product mock is the only place the app's look appears.
- **Don't** put content in cards, panels or shadowed boxes; use hairlines.
- **Don't** fill more than one button per section with `accent`.
- **Don't** use the marker as a fill or background; it is punctuation, status and error text.
- **Don't** set small uppercase mono labels above headings; mono is for tags and row notes, in normal case.
