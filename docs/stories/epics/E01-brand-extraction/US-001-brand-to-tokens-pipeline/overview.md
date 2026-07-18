# Overview

## Current Behavior

The repo has a product contract (`docs/product/overview.md`) describing a
design -> store -> retrieve pipeline, but no extraction pipeline exists. There
are no sub-agent definitions and no stored brand specs.

## Target Behavior

Given a brand website URL, a 3-agent pipeline produces a stored, reusable brand
design system:

1. **brand-crawler** — crawls the site (Playwright for computed CSS/visual
   signals; Firecrawl or Composio fallback for copy/tone/structure) and emits
   raw signals.
2. **brand-analyzer** — turns raw signals into structured, named design data
   (palette roles, type scale, spacing, radii, logo/asset refs).
3. **brand-designer** — writes a W3C Design Tokens JSON spec + assets into the
   repo and pushes a design system into Open Design for cross-device reuse.

The stored tokens are retrievable by agents (CLI/Open Design) on any device.

## Affected Users

- Coding agents (retrieve stored tokens).
- Designers/humans (steer extraction, refine in Open Design).

## Affected Product Docs

- `docs/product/overview.md`

## Non-Goals

- Final retrieval CLI command surface (separate story; layout must settle first).
- Auth/login-walled site crawling.
- Pixel-perfect logo vectorization.
