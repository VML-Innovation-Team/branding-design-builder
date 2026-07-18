# Brand Extraction Pipeline — Human Guide

For developers who want to clone this repo, run the branding pipeline, and
develop it further. For the machine-facing contract, see `AGENT_GUIDE.md`.

## What It Does

Give it a brand's website URL. It extracts the brand's visual design (colors,
fonts, spacing, radii, logo), structures it, and stores a reusable
**W3C Design Tokens** file plus an Open Design system you can open on any device.

```text
brand URL
  → brand-crawler    extract raw signals from the live site
  → brand-analyzer   structure + name them (palette roles, type scale)
  → brand-designer   emit tokens.json + build Open Design system
→ brands/<slug>/tokens.json  (reusable, retrievable by agents)
```

The three stages are **native Claude Code subagents** in `.claude/agents/`.

## Prerequisites

- **Claude Code** (the agents are Claude Code subagents; they auto-load from
  `.claude/agents/`).
- **Playwright MCP** — required. Reads computed CSS for exact colors/fonts.
  Bundled with this workspace's MCP config.
- **Open Design (OD) MCP** — required for stage 3. Run OD locally so the
  `open-design` tools are reachable.
- **Composio MCP** — optional, used for page copy/tone when Firecrawl is absent.
- **Firecrawl MCP** — optional upgrade. Needs `FIRECRAWL_API_KEY`. Not wired by
  default; the crawler falls back to Composio/Playwright text without it.
- **Reference skills** (vendored in `.claude/skills/`, advisory only):
  - `crawl4ai-skill` — optional no-API-key content crawler for `brand-crawler`.
    Needs its `crawl4ai-skill` binary (`pip install crawl4ai-skill`); skipped
    cleanly if absent.
  - `design-tokens` — token-structure conventions for `brand-analyzer` and
    `brand-designer`. Guidance only; it never invents brand values.

**Full environment setup (MCPs, binaries, deps) is in `SETUP.md` — read that
first on a fresh clone.**
- The Harness CLI (`scripts/bin/harness-cli`) — for recording work. Bootstrap
  it once (below).

## Clone & Set Up

```bash
git clone <this-repo-url> branding-design-builder
cd branding-design-builder

# Bootstrap the local (git-ignored) harness database
./scripts/bootstrap-harness.sh        # macOS/Linux
.\scripts\bootstrap-harness.ps1       # Windows PowerShell
```

Open the folder in Claude Code. Confirm the subagents loaded — they appear as
`brand-crawler`, `brand-analyzer`, `brand-designer` in the Agent tool.

## Run It

In Claude Code, ask the main agent to run the pipeline on a URL, e.g.:

> Run the brand pipeline on https://stripe.com

The main agent dispatches the three subagents in sequence. Or drive stages
manually by asking for one subagent at a time (useful when developing):

1. `brand-crawler` on the URL → writes `brands/<slug>/raw-signals.json`.
2. `brand-analyzer` on that slug → writes `brand-spec.json`.
3. `brand-designer` on that slug → writes `tokens.json` + registers a real
   Open Design **design system** (via OD's native brand-extract / `od brand
   finalize` flow — derived light/dark tokens, live component kit, brand-asset
   templates), not a hand-authored HTML page. See decision 0013.

## Output Layout

```text
brands/<brand-slug>/
  source.json        input URL, crawl time, tools used
  raw-signals.json   stage 1 output (schema-validated)
  brand-spec.json    stage 2 output (schema-validated)
  tokens.json        stage 3 output — W3C Design Tokens (the reusable contract)
  assets/            logo, icons, fetched images
```

See decisions `docs/decisions/0008` (token format) and `0009` (layout).

## Retrieve Stored Tokens

```bash
node scripts/design-cli.mjs list              # brand slugs that have tokens
node scripts/design-cli.mjs get <slug>        # full tokens.json (JSON on stdout)
node scripts/design-cli.mjs get <slug> --group color
node scripts/design-cli.mjs path <slug>       # absolute path to tokens.json
node scripts/design-cli.mjs --self-check      # run the CLI's own test
```

This is the retrieval surface agents call (decision 0010).

## Develop It Further

### Change what a stage does

Each subagent is a single markdown file with YAML frontmatter in
`.claude/agents/`. Edit the prose to change behavior, or the `tools:` line to
change what it can call. Reload the Claude Code session to pick up changes.

### Change the data contract

The schemas in `scripts/schema/brand/` are the contract between stages:

- `raw-signals.schema.json` — crawler → analyzer.
- `brand-spec.schema.json` — analyzer → designer.

If you change a stage's output shape, update its schema in the same commit, and
update the downstream agent that reads it.

### Validate output

```bash
# any JSON Schema validator; example with ajv-cli
npx ajv-cli validate -s scripts/schema/brand/raw-signals.schema.json \
  -d brands/<slug>/raw-signals.json
npx ajv-cli validate -s scripts/schema/brand/brand-spec.schema.json \
  -d brands/<slug>/brand-spec.json
```

### Record your work (harness)

This repo tracks work through the Harness CLI. When you change pipeline
behavior, follow `docs/FEATURE_INTAKE.md`: record intake, update the story
under `docs/stories/epics/E01-brand-extraction/`, and record a decision if you
change a settled contract (token format, layout, stage boundaries).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Subagents don't appear | Not opened as a Claude Code project, or `.claude/agents/` missing | Open the repo root in Claude Code; confirm the files exist |
| Colors/fonts empty | Playwright MCP not reachable | Check the Playwright MCP server is running |
| No copy/tone captured | Firecrawl absent and Composio not connected | Add `FIRECRAWL_API_KEY` or connect Composio; else Playwright text is used |
| Stage 3 can't build system | Open Design not running | Start OD locally so `open-design` tools resolve |
| Site blocks crawling | Bot protection / login wall | Out of scope; pick a public marketing site |
