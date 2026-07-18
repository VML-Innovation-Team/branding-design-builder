# Design

## Domain Model

- **RawSignals** — unstructured extraction output: color usage (hex + frequency +
  where seen), font-families, font sizes, spacing values, border-radii, asset
  URLs (logo, icons), and optional copy/tone text.
- **BrandSpec** — structured, named design data derived from RawSignals: palette
  roles (primary/secondary/accent/neutral/semantic), type scale (named steps),
  spacing scale, radius scale, asset references.
- **DesignTokens** — BrandSpec serialized as W3C Design Tokens JSON (`$value`,
  `$type`), the stored reusable contract.

## Application Flow

```text
URL
 -> brand-crawler   (Playwright computed CSS + Firecrawl/Composio content)
 -> raw-signals.json
 -> brand-analyzer   (cluster/name -> BrandSpec)
 -> brand-spec.json
 -> brand-designer   (emit tokens + push Open Design system)
 -> tokens.json + assets/ + Open Design project
```

Agents are dispatched via the Agent tool; each stage writes a file the next
stage reads, so stages are independently inspectable (the 3-agent split).

## Interface Contract

- Crawler output: `raw-signals.json` (schema in
  `scripts/schema/brand/raw-signals.schema.json`).
- Analyzer output: `brand-spec.json`.
- Designer output: `tokens.json` (W3C Design Tokens) + `assets/`.
- Stored under a per-brand directory (layout = decision 0008).

## Data Model

No SQLite schema change. Brand artifacts are files on disk under the brand
layout. The harness DB only records intake/story/decisions/traces.

## UI / Platform Impact

- CLI: future retrieval command reads `tokens.json` (separate story).
- Open Design: a design system project created per brand for cross-device reuse.

## Observability

- Each agent run recorded as a harness trace (`harness-cli trace`).
- Crawl targets + tool used (Playwright/Firecrawl/Composio) logged in raw-signals
  metadata.

## Alternatives Considered

1. 2-agent pipeline (crawl+structure merged). Rejected: user wants each stage
   independently inspectable.
2. Custom brand.json instead of W3C tokens. Rejected: standard format has wider
   reuse across CLI and Open Design.
3. Firecrawl-only crawling. Rejected: computed CSS (colors/fonts) needs a live
   DOM; Playwright is primary, Firecrawl adds copy/tone.
