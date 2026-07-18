# 0014 Open Design System Portability via Committed Package

Date: 2026-07-19

## Status

Proposed

## Context

Stage 3 registers an Open Design system in the local OD daemon (decision 0013),
but that registration is not captured in the repo — a fresh clone on another
device cannot reconstruct the system without re-crawling. There is also no
committed `.claude/settings.json`, so MCP servers (open-design, playwright,
composio, context7) and hooks are wired ad hoc per machine. We need a
device-independent way to move a stored brand's OD system between machines.

## Decision

(Proposed — direction only; the concrete schema is locked in US-004 Phase 2
after inspecting the live OD registration payload.)

1. Commit a `.claude/settings.json` declaring the MCP servers + hooks the
   pipeline depends on, referencing secrets by env var name (never inlined).
2. Wrap each brand's OD system into `brands/<slug>/od-system/` — a portable
   package plus an id manifest `{ projectId, brandId, designSystemId,
   previewUrl }`. The repo is the cross-device transport; OD state is
   reconstructed locally, not synced over a network.
3. Add a CLI `apply <slug>` verb and an AI skill wrapping it, so an agent can
   re-apply a stored brand to a local OD daemon from the committed package.

## Alternatives Considered

1. Re-crawl per device — rejected: wasteful, non-deterministic, defeats the
   "stored, reusable" intent.
2. Network sync between OD daemons — rejected: adds hosting + auth surface;
   repo-mediated transport matches the existing model.
3. Regenerate purely from `tokens.json` with no id manifest — deferred: viable
   only if Phase 1 shows registration is a pure function of tokens; the id
   manifest is the safety net otherwise.

## Consequences

Positive:

- A brand's OD system becomes reproducible on any device from the committed repo.
- Declared MCP/hook wiring makes fresh clones deterministic.

Tradeoffs:

- Stage 3 (or a new finalize step) must emit the portable package — more output
  surface and a new schema to maintain.
- previewUrl and any machine-local paths are non-portable and must be excluded
  from the portable keys.

## Follow-Up

- US-004 Phase 1: inspect the live OD registration payload for `ford`
  (`user:ford-com-vn`) to determine what must be captured.
- Lock the `od-system/` package schema + settings.json contract in Phase 2 and
  flip this decision to Accepted.
