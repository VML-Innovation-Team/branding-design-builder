# 0009 Per-Brand On-Disk Storage Layout

Date: 2026-07-18

## Status

Accepted

## Context

Extracted brands must be stored in a stable, predictable layout so an agent can
retrieve them by brand and kind without hunting. The pipeline has three stages
that each emit a file, and we want intermediate outputs inspectable.

## Decision

Store each brand under `brands/<brand-slug>/`:

```text
brands/<brand-slug>/
  source.json        # input URL, crawl timestamp, tools used
  raw-signals.json   # brand-crawler output
  brand-spec.json    # brand-analyzer output (structured, named)
  tokens.json        # brand-designer output (W3C Design Tokens — the contract)
  assets/            # logo, icons, fetched images
```

`tokens.json` is the reusable contract (decision 0008). The Open Design project
name mirrors `<brand-slug>` for cross-device reuse.

## Alternatives Considered

1. Flat `brands/<slug>-tokens.json` only. Rejected: loses inspectable
   intermediates and assets.
2. Store inside `docs/product/`. Rejected: those are contracts/prose, not a
   binary+data asset store.

## Consequences

Positive:

- Predictable retrieval path; each pipeline stage maps to one file.
- Intermediates kept for debugging and re-runs.

Tradeoffs:

- `brands/` may grow large with assets; revisit git-lfs/ignore if needed.

## Follow-Up

- Retrieval CLI (separate story) reads `brands/<slug>/tokens.json`.
- Decide `.gitignore` policy for large assets after the first real run.
