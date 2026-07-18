# 0013 Stage 3 Uses Open Design's Native Design-System Feature

Date: 2026-07-18

## Status

Accepted (supersedes the stage-3 build approach in the earlier pipeline)

## Context

Stage 3 (`brand-designer`) originally hand-authored an HTML page and dropped it
into an Open Design project via `create_artifact`/`write_file`. That produces a
**prototype artifact**, not a design system. Open Design ships a first-class
brand / design-system feature (the `brand-extract` skill + `od brand` CLI) that
derives light/dark/compact tokens, a live component kit, and brand-asset
templates, and registers the result as a reusable `user:<id>` design system
selectable across Open Design. We were bypassing it.

## Decision

Stage 3 keeps emitting our W3C `tokens.json` (our durable, CLI-retrievable
contract) AND registers a real Open Design design system through the native
flow:

- `create_project(skill: "brand-extract")` (or reuse an existing brand project)
- `start_run(skill: "brand-extract", prompt=…)` instructing OD to build
  `brand.json` from OUR measured data under `brands/<slug>/` (explicit mapping
  to OD's 7 semantic color roles, typography, logo, imagery, voice, layout),
  then `od brand finalize` to derive tokens and register the design system.
- Poll `get_run` to terminal; capture `designSystemId` + previewUrl.

The agent must NOT fall back to hand-writing HTML if the run fails — it reports
the failure instead. `tokens.json` remains the contract regardless.

## Alternatives Considered

1. Hand-authored HTML artifact (the old approach). Rejected: it is a prototype
   page, not a registered, reusable OD design system.
2. Let OD own extraction end to end (drop our crawler). Rejected: our pipeline
   captures richer, agent-retrievable W3C tokens + deep-crawl categories
   (motion, breakpoints, component recipes) and is our product surface. We keep
   ours and feed OD our measured truth (option A).

## Consequences

Positive:

- A real, reusable OD design system (tokens + component kit + asset templates),
  correct use of the platform.
- Our measured data prevents OD regressing to generic defaults.

Tradeoffs:

- Some overlap between our crawl and OD's own measure step.
- Stage 3 now depends on a long-running OD run (5–30 min) and OD being
  connected; it is no longer a pure local write.

## Follow-Up

- `od` is Open Design's internal CLI, invoked inside a `brand-extract` run —
  not called from our shell.
- Map our `brand-spec.json` fields to OD `brand.json` roles consistently across
  brands.
