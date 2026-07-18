# 0012 Sitemap-Driven Deep Crawl For Brand Material

Date: 2026-07-18

## Status

Accepted

## Context

A homepage-only crawl misses where brand material actually lives: `/brand`,
`/press`, `/about`, `/newsroom`, style/press-kit pages. It also captured only a
narrow signal set (flat colors, type, spacing, radii, shadows, logo, fonts).
High- and medium-value brand signals — gradients, color usage pairs, motion,
iconography, imagery, component recipes, breakpoints, dark mode, declared theme
colors — were not captured.

## Decision

The crawler discovers pages via `sitemap.xml` (and `robots.txt` → sitemap
pointer), scores URLs to prioritize brand-relevant paths, crawls a **bounded**
set (cap ~8 pages), and captures an expanded signal set:

High value: gradients, color usage pairs (text-on-bg, link, button
fill/border), motion (transition/animation/easing/duration), logo variants.
Medium value: iconography style, imagery/art-direction samples, component
recipes (computed button/card look), breakpoints, dark-mode palette (toggle or
`prefers-color-scheme`), `manifest.json` declared theme colors + icon set.

### Guardrails

- Hard page cap (default 8) to bound external requests and fan-out.
- Read-only: never submit forms or log in.
- Prefer a brand/press page when the sitemap reveals one.
- Absent sitemap → fall back to nav-link discovery (current behavior).

## Alternatives Considered

1. Homepage-only (status quo). Rejected: misses brand/press pages and the
   richer signal set.
2. Unbounded full-site crawl. Rejected: cost, rate-limit risk, diminishing
   returns; a brand system saturates in a handful of pages.

## Consequences

Positive:

- Reaches the pages with real brand material; captures a usable system, not a
  bag of atoms.

Tradeoffs:

- More external requests (bounded by cap).
- Bigger raw-signals.json and more analyzer work.
- JS-injected styles/fonts and canvas/video imagery can still be missed.

## Follow-Up

- Analyzer + designer must consume the new categories (usage pairs, gradients,
  motion, dark mode) into the spec and tokens.
- Non-goals for now: exhaustive voice/tone guide, full component library
  reconstruction — capture recipes, not a full design system rebuild (YAGNI).
