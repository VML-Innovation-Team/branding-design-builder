# branding-design-builder

Extract a brand's design system from its website, store it in an agent-readable
layout, and retrieve it from a CLI — built with Open Design and driven by
native Claude Code sub-agents.

Point the pipeline at a brand URL. It crawls the live site, extracts the real
design system (colors, gradients, type, fonts, spacing, radii, shadows, motion,
logo, icons, component recipes), stores it as **W3C Design Tokens** plus assets,
and builds a reusable design system in Open Design. A coding agent can then
fetch any brand's tokens from a CLI — no hunting through chat history or
scattered files.

> **Goal:** an agent asks “get the brand's color tokens” or “get the button
> design” from a CLI and receives the stored design files.

The app is the branding library. The harness is how agents build and retrieve it.

## How It Works

Three native Claude Code sub-agents (`.claude/agents/`) run in sequence:

```text
brand URL
  → brand-crawler    sitemap-driven crawl; extract raw signals via computed CSS
                     (Playwright) + content (Firecrawl/crawl4ai/Composio)
  → brand-analyzer   structure + name signals (palette roles, type scale,
                     color-usage rules, component recipes)
  → brand-designer   emit W3C Design Tokens + build an Open Design system
→ brands/<slug>/tokens.json   (+ logo, fonts, icons, imagery, rendered page)
```

Each stage writes one inspectable file, so the pipeline is transparent and
re-runnable. Two advisory skills are vendored in `.claude/skills/`
(`crawl4ai-skill`, `design-tokens`).

## What Gets Captured

Per brand, from the live site (never invented — absent signals are recorded as
gaps, not fabricated):

- **Color** — palette roles, neutral ramp, and usage rules (text, link, button
  fill/text) derived from real on-page pairs
- **Gradients** — actual CSS gradient values
- **Typography** — families, full size scale, weights, line-heights
- **Fonts** — downloaded webfont files (woff2) when available; proprietary
  fonts are recorded with a link fallback
- **Spacing, radii, shadows, motion, breakpoints**
- **Logo** — inline-SVG or URL assets, resolved to self-contained files
- **Icons, imagery** — representative samples
- **Component recipes** — the computed look of the real button/card, so an agent
  can rebuild them, not guess
- **Manifest** — the brand's own declared theme colors

## Retrieve A Stored Brand

```bash
node scripts/design-cli.mjs list                     # brand slugs with tokens
node scripts/design-cli.mjs get <slug>               # full tokens.json
node scripts/design-cli.mjs get <slug> --group color # one token group
node scripts/design-cli.mjs path <slug>              # absolute path to tokens.json
```

`get` emits JSON on stdout; unknown slugs exit non-zero and list what's
available — built for agents to parse.

## Storage Layout

```text
brands/<slug>/
  source.json        input URL, crawl time, discovery method, tools, degrades
  raw-signals.json   stage 1 — raw extracted signals
  brand-spec.json    stage 2 — structured, named design data
  tokens.json        stage 3 — W3C Design Tokens (the reusable contract)
  design-system/index.html   rendered, self-contained design-system page
  assets/            logo, fonts/, icons/, imagery/, screens/ (screens git-ignored)
```

`brands/_template/` is the skeleton every brand follows. See `brands/README.md`.

## Quick Start

1. Read `docs/pipeline/SETUP.md` — MCP servers (Playwright, Open Design),
   Node, the optional crawl4ai binary, and the harness bootstrap.
2. Bootstrap the local harness state:
   ```bash
   ./scripts/bootstrap-harness.sh        # macOS/Linux
   .\scripts\bootstrap-harness.ps1       # Windows PowerShell
   ```
3. Open the repo in Claude Code; confirm the three sub-agents load.
4. Ask: “Run the brand pipeline on `<url>`”.
5. Retrieve: `node scripts/design-cli.mjs get <slug>`.

## Docs

- **Setup**: `docs/pipeline/SETUP.md` — MCP servers, binaries, dependencies.
  Read this first on a fresh clone.
- **Humans**: `docs/pipeline/HUMAN_GUIDE.md` — run and develop the pipeline.
- **Agents**: `docs/pipeline/AGENT_GUIDE.md` — the dispatch contract, data
  schemas, and invariants for the three sub-agents.
- **Consuming branding**: `docs/pipeline/CONSUMER_SETUP.md` — how an agent in
  this repo *or another project* installs the CLI + `use-brand-tokens` skill
  and pulls stored brands.
- **Brands**: `brands/README.md` — the standard per-brand layout and retrieval
  commands; `brands/_template/` is the skeleton every brand follows.
- **Product contract**: `docs/product/overview.md`.

## How We Build It

This repo is built on top of the `repository-harness` engineering layer:
feature intake classifies each piece of work, story packets scope it, decisions
capture tradeoffs, and a durable CLI records proof. That machinery is how we
build the branding library effectively — it is not the product itself. The
sections below document it.

Key decisions live in `docs/decisions/`:

- `0008` — store brand specs as W3C Design Tokens
- `0009` — per-brand on-disk storage layout
- `0010` — retrieval CLI is a standalone Node script
- `0011` — capture fonts from any source, with link fallback
- `0012` — sitemap-driven deep crawl for brand material

## The Harness Approach

A repository starts to have a harness when it helps an agent answer practical
engineering questions without relying only on chat history:

- What should I read first?
- What type of work is this?
- Which product contract does it affect?
- How risky is the change?
- What proof will show the work is done?
- What decision or lesson should future agents inherit?

In this repo, those answers live in:

- `AGENTS.md` — the stable agent shim with local project notes and Harness
  doc links.
- `docs/HARNESS.md` — the human-agent collaboration model.
- `docs/FEATURE_INTAKE.md` — tiny, normal, and high-risk work classification.
- `docs/ARCHITECTURE.md` — architecture discovery and boundary rules.
- `docs/TEST_MATRIX.md` — behavior-to-proof validation expectations.
- `docs/stories/` — story packets and backlog items.
- `docs/decisions/` — durable decisions and tradeoffs.
- `docs/templates/` — reusable spec, story, decision, and validation templates.

The upstream harness is described at:

https://openai.com/index/harness-engineering/

## Install The Harness Into Another Project

The engineering layer under this repo is reusable. From a target project
directory:

```bash
curl -fsSL "https://raw.githubusercontent.com/hoangnb24/repository-harness/main/scripts/install-harness.sh?$(date +%s)" | bash -s -- --yes
```

On Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm "https://raw.githubusercontent.com/hoangnb24/repository-harness/main/scripts/install-harness.ps1"))) -Yes
```

Add `--claude` (Bash) to also install a `CLAUDE.md` that imports `AGENTS.md`,
since Claude Code does not auto-load `AGENTS.md`. See the harness repository for
merge/override/dry-run options and CLI release details.

## Repository Structure

```text
branding-design-builder/
  .claude/
    agents/          brand-crawler, brand-analyzer, brand-designer
    skills/          vendored crawl4ai-skill, design-tokens
  brands/
    _template/       per-brand skeleton
    <slug>/          extracted brands
  scripts/
    design-cli.mjs   brand retrieval CLI
    schema/brand/    raw-signals + brand-spec JSON schemas
    bootstrap-harness.*
  docs/
    pipeline/        SETUP, HUMAN_GUIDE, AGENT_GUIDE
    product/         product contract
    decisions/       durable decisions
    stories/         work packets
  AGENTS.md
  README.md
```

## Current State

The pipeline runs end to end: a brand URL produces stored W3C Design Tokens,
downloaded assets, and an Open Design system, all retrievable via the CLI. VML
(`brands/vml/`) is the first real brand extracted through it.
