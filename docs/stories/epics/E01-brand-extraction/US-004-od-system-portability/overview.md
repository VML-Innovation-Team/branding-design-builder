# Overview

## Current Behavior

Stage 3 (`brand-designer`) registers an Open Design (OD) design system on the
machine that ran the pipeline (decision 0013). The durable repo artifacts are
`brands/<slug>/tokens.json`, `brand-spec.json`, `raw-signals.json`, and
`assets/`. The registered OD system itself lives in OD's local daemon state
(project id, brandId, designSystemId, previewUrl) — it is **not** captured in
the repo, so it cannot be reconstructed on another device.

There is also no committed `.claude/settings.json`: MCP servers (Open Design,
Playwright, Composio, context7, …) and hooks are configured ad hoc per machine.
A fresh clone on a new device has no declared wiring.

## Target Behavior

1. A committed `.claude/settings.json` declares the MCP servers and hooks the
   pipeline depends on, so a fresh clone wires up deterministically.
2. Each brand's OD design system is **wrapped into `brands/<slug>/`** as a
   portable package (the OD brand/system definition + manifest of ids), not
   just left in OD daemon state.
3. A CLI command + an AI-agent skill let an agent **re-apply** a stored brand's
   OD system to Open Design on any device from the committed package — no
   re-crawl required.

## Affected Users

- Coding agents (apply a stored brand's OD system on a new device).
- Designers/humans (move a brand design system between machines).

## Affected Product Docs

- `docs/product/overview.md`
- `docs/pipeline/AGENT_GUIDE.md`

## Non-Goals

- Hosting/syncing OD state over a network (device-to-device stays repo-mediated).
- Secret management for MCP servers (keys stay out of the repo; settings.json
  references env, never inlines secrets).
- Changing the W3C token format (decision 0008 stands).
