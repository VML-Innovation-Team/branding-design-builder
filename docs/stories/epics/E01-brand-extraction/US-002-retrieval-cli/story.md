# US-002 Brand Retrieval CLI

## Status

in_progress

## Lane

normal

## Product Contract

An agent (or human) can list stored brands and fetch a brand's design tokens
from the command line, reading the `brands/<slug>/` layout (decision 0009),
without knowing the internal directory shape.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/decisions/0009-brand-storage-layout.md`
- `docs/decisions/0010-retrieval-cli-node.md`

## Acceptance Criteria

- `list` prints every brand slug that has a `tokens.json`.
- `get <slug>` prints that brand's `tokens.json`.
- `get <slug> --group <color|font|spacing|radius>` prints just that token group.
- `path <slug>` prints the absolute path to the brand's `tokens.json`.
- Unknown slug exits non-zero with a clear message listing available slugs.
- Machine-friendly: `get` output is valid JSON on stdout, errors go to stderr.

## Design Notes

- Commands: `list`, `get <slug> [--group G]`, `path <slug>`.
- Queries: reads `brands/*/tokens.json` on local disk. No network, no DB.
- API: stdout = JSON/plain data; stderr = human messages; exit code signals ok.
- Tables: none.
- Domain rules: a brand "exists" for retrieval only if `tokens.json` is present
  (intermediate-only brands are not retrievable).
- UI surfaces: CLI (`node scripts/design-cli.mjs ...`).

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | self-check drives list/get/get--group/path/unknown-slug against a fixture brand |
| Integration | runs against a real `brands/<slug>/` once the pipeline produces one |
| E2E | agent calls the CLI and receives tokens (after first real brand run) |
| Platform | node script runs on Windows/macOS/Linux |
| Release | n/a |

## Harness Delta

- Decision 0010: retrieval CLI is a separate Node script (harness-cli is a
  prebuilt binary with no source here, so it cannot be extended).

## Evidence

Add self-check output after implementation.
