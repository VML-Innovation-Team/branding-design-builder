# 0010 Retrieval CLI Is A Separate Node Script

Date: 2026-07-18

## Status

Accepted

## Context

The product contract needs a CLI agents call to retrieve stored brand tokens.
An open question (product overview) was whether to extend the existing
`harness-cli` or ship a separate command. The `harness-cli` is a **prebuilt
Rust binary with no source in this repo** — it cannot be extended here. We also
want zero build step and cross-platform reach.

## Decision

Ship retrieval as a standalone **Node script** at `scripts/design-cli.mjs`,
run with `node scripts/design-cli.mjs <command>`. No dependencies (Node stdlib
only: `fs`, `path`, `process`). It reads the `brands/<slug>/` layout from
decision 0009.

Commands: `list`, `get <slug> [--group G]`, `path <slug>`.

## Alternatives Considered

1. Extend `harness-cli` (Rust). Rejected: no source in this repo; binary is
   fetched/prebuilt.
2. A separate Rust/Go binary. Rejected: adds a build+release pipeline for a
   file-reading CLI; not worth it.
3. Bash + jq script. Rejected: jq is not guaranteed present on Windows; Node
   already is (crawl4ai/Playwright toolchain).

## Consequences

Positive:

- Zero build, zero deps, runs on Windows/macOS/Linux.
- JSON-native; easy for agents to parse.

Tradeoffs:

- Requires Node on the host (already true for this repo's tooling).
- Separate from `harness-cli`; two entrypoints to know about.

## Follow-Up

- If a metadata index beyond `tokens.json` is needed, add `brands/<slug>/
  source.json` fields to the `list` output.
