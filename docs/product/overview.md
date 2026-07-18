# Branding Design Builder — Product Overview

## What This Is

A repository for **designing branding with Open Design and storing the results
here for reuse by agents**. Branding artifacts (logos, color tokens, type
scales, component looks, usage rules) are produced in Open Design, committed
into this repo in an agent-readable layout, and exposed through a CLI so any
coding agent can retrieve the right design files without a human in the loop.

The app is the branding library. The harness is how agents build and retrieve it.

## Goal

> An agent can ask "give me the brand's color tokens" or "get the button
> design" from a CLI and receive the stored design files — no manual hunting.

## Primary Users

- **Coding agents** — retrieve stored design files via CLI for downstream work.
- **Designers / humans** — produce and refine branding in Open Design, steer
  what gets stored.

## Core Capabilities (target)

1. **Design** — create branding in Open Design (via the `open-design` MCP tools
   already wired into this workspace).
2. **Store** — persist design output into a stable, reusable repo layout with
   metadata an agent can index.
3. **Retrieve** — a CLI surface an agent calls to list and fetch design files
   by brand, kind (tokens / logo / component), and format.

## How We Build It

We use the harness-engineering concepts already installed in this repo to manage
the buildout: feature intake classifies each piece of work, story packets scope
it, the test matrix records proof, and decisions capture tradeoffs. See the
root `README.md` and `docs/HARNESS.md`.

## Pipeline (in progress)

Story `US-001-brand-to-tokens-pipeline` builds a 3-sub-agent pipeline
(`.claude/agents/`):

1. **brand-crawler** — Playwright (computed CSS) + Firecrawl/Composio (content)
   → `raw-signals.json`.
2. **brand-analyzer** — structure/name signals → `brand-spec.json`.
3. **brand-designer** — W3C Design Tokens `tokens.json` + Open Design system.

Stored per brand under `brands/<slug>/` (decision 0009), tokens in W3C format
(decision 0008).

## Retrieval CLI

Agents fetch stored tokens with `scripts/design-cli.mjs` (decision 0010):

```bash
node scripts/design-cli.mjs list                    # brand slugs with tokens
node scripts/design-cli.mjs get <slug>              # full tokens.json
node scripts/design-cli.mjs get <slug> --group color
node scripts/design-cli.mjs path <slug>             # abs path to tokens.json
```

## Not Yet Decided

These are open and should become decisions (`docs/decisions/`) as we build:

- `.gitignore` policy for large binary assets under `brands/`.
- Whether to wire Firecrawl MCP (needs `FIRECRAWL_API_KEY`) or stay on Composio
  for content crawling.

## Update Rule

When branding capability changes: update this doc, update/create the story
packet, record proof status with the harness CLI, and record a decision if the
change affects layout, retrieval contract, or a settled rule.
