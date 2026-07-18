# Brands

One directory per extracted brand, keyed by slug (lowercase domain, e.g.
`vml`). Each brand is produced by the 3-agent pipeline (see
`docs/pipeline/`) and is retrievable via `node scripts/design-cli.mjs`.

## Standard Layout

```text
brands/<slug>/
  source.json        input URL, crawl time, discovery method, tools, degrades
  raw-signals.json   stage 1 (brand-crawler) — raw extracted signals
  brand-spec.json    stage 2 (brand-analyzer) — structured, named design data
  tokens.json        stage 3 (brand-designer) — W3C Design Tokens (the contract)
  assets/
    logo.svg         primary logo (see also logo-header.svg, favicon.svg, etc.)
    fonts/           brand webfonts (woff2), when downloadable
    icons/           representative brand icons
    imagery/         representative art-direction samples
    screens/         page screenshots (git-ignored — reproducible)
```

Stage 3 also registers a reusable **Open Design design system** for the brand
(derived light/dark tokens, live component kit, brand-asset templates) via OD's
native brand feature — that lives inside Open Design, not as a file here
(decision 0013).

`_template/` holds this skeleton with empty stubs. It is the shape every brand
follows; the pipeline fills it. See decisions `0008` (token format), `0009`
(layout), `0011` (fonts), `0012` (deep crawl), `0013` (OD design system).

## Retrieval

```bash
node scripts/design-cli.mjs list              # brand slugs with tokens
node scripts/design-cli.mjs get <slug>        # full tokens.json
node scripts/design-cli.mjs get <slug> --group color
node scripts/design-cli.mjs path <slug>       # absolute path to tokens.json
```

## Committed vs ignored

Durable outputs (tokens, spec, raw signals, logo/font/icon/imagery assets, the
design-system render) are committed. Page screenshots under `assets/screens/`
are git-ignored — they are large and regenerated on any re-crawl.
