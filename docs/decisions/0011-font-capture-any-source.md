# 0011 Capture Brand Fonts From Any Source, With Link Fallback

Date: 2026-07-18

## Status

Accepted

## Context

The pipeline must capture a brand's actual fonts, not just font-family names.
A Google-Fonts-only tool fails on most real brands: VML's font is
`SnowflakeSans` (proprietary, self-hosted), and enterprises commonly license
custom fonts (Circular, GT America, etc.). Fonts live in `@font-face src` URLs
in the site's CSS, which may point to self-hosted files, Google Fonts, or
licensed/obfuscated sources.

## Decision

The crawler captures fonts **source-agnostically**:

1. Read `@font-face` rules from the live stylesheets (via computed CSS /
   `document.styleSheets`), collecting each family's `src` URLs and weights.
2. Download every fetchable font file into `brands/<slug>/assets/fonts/`
   (curl). Prefer `woff2`.
3. If a family resolves to a **Google Font**, fetch a self-host bundle via the
   `google-webfonts-helper` API (`https://gwfh.mranftl.com/api/fonts/<id>`) —
   a REST endpoint, no CLI or key.
4. **Proprietary / non-downloadable**: record the family name + source URL in
   the spec, mark it `downloaded:false`, and rely on the CSS font stack
   fallback (e.g. Arial/sans-serif). NEVER fabricate or substitute a font file.

No new dependency — `curl` only.

## Alternatives Considered

1. Google-Fonts-only CLI (`google-font-installer`, etc.). Rejected: returns
   nothing for VML and most custom-font brands; adds an npm dep.
2. Silent best-effort (skip what fails, no metadata). Rejected: loses the
   record of which fonts are missing and why.

## Consequences

Positive:

- Captures self-hosted + proprietary + Google fonts with one mechanism.
- Honest about what could not be fetched; no fake fonts.

Tradeoffs:

- Licensed fonts still can't be legally/technically bundled — we store a
  reference, not the file.
- `@font-face` extraction can miss fonts injected by JS after load.

## Follow-Up

- tokens.json font tokens keep the family stack; a downloaded file is an asset
  reference, not a token value.
- Revisit if a brand serves fonts only via a JS font loader.
