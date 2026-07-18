# Setup

Everything needed to run the brand extraction pipeline after cloning. For how
to *use* it once set up, see `HUMAN_GUIDE.md`; for the agent contract, see
`AGENT_GUIDE.md`.

## 1. Prerequisites

| Tool | Why | Required |
| --- | --- | --- |
| **Claude Code** | Runs the sub-agents (`.claude/agents/`) and vendored skills (`.claude/skills/`) | yes |
| **Node.js** (18+) | Retrieval CLI (`scripts/design-cli.mjs`) and font/asset probes | yes |
| **Python** (3.11+) + pip | `crawl4ai-skill` binary (optional content crawler) | optional |
| **git** | version control | yes |
| `curl`, `unzip` | asset/font download in the crawler | yes (curl), optional (unzip) |

## 2. MCP servers

The pipeline talks to these Model Context Protocol servers. They are configured
in the Claude Code environment, not installed by this repo.

| MCP | Used by | Purpose | Required |
| --- | --- | --- | --- |
| **Playwright** (`playwright`) | brand-crawler | Computed-CSS extraction (colors, fonts, spacing, motion, component recipes). The core visual engine. | **yes** |
| **Open Design** (`open-design`) | brand-designer | Build/refresh the cross-device design-system project | **yes** for stage 3 |
| **Composio** (`composio`) | brand-crawler | Fallback content/copy scraping | optional |
| **Firecrawl** | brand-crawler | Preferred content crawler; needs `FIRECRAWL_API_KEY` | optional |

Check what is connected with `/mcp` in Claude Code. If Open Design shows
disconnected, reconnect it before running stage 3 (the designer degrades to
writing a local `design-system/index.html` and cannot push the OD project).

### Open Design

Run the Open Design app/daemon locally so the `open-design` MCP tools resolve.
The designer creates one project per brand slug and serves a previewUrl like
`http://127.0.0.1:<port>/api/projects/<slug>/raw/index.html`.

### Firecrawl (optional upgrade)

Without `FIRECRAWL_API_KEY`, content crawling falls back to crawl4ai → Composio
→ Playwright DOM text. Visual tokens are unaffected (always Playwright computed
CSS). To enable: set `FIRECRAWL_API_KEY` in the environment and wire the
Firecrawl MCP.

## 3. Harness CLI binary

The harness durable layer uses a prebuilt Rust binary (git-ignored, not
committed). Bootstrap it once:

```bash
./scripts/bootstrap-harness.sh        # macOS/Linux
.\scripts\bootstrap-harness.ps1       # Windows PowerShell
```

This creates the local `harness.db` and places `scripts/bin/harness-cli[.exe]`.
Both are git-ignored — each clone bootstraps its own.

## 4. Skills (vendored)

Two advisory skills are vendored into `.claude/skills/` so the repo is
self-contained — no `npx skills add` needed:

| Skill | Used by | Note |
| --- | --- | --- |
| `crawl4ai-skill` | brand-crawler | Optional content crawler. Needs its Python binary: `pip install crawl4ai-skill`. Skipped cleanly if absent. |
| `design-tokens` | brand-analyzer, brand-designer | Token-structure conventions. Advisory only — never generates brand values. |

Install the optional crawl4ai binary:

```bash
pip install crawl4ai-skill
crawl4ai-skill --help   # verify on PATH
```

> Note: installing crawl4ai pulls its own `playwright` Python package and may
> upgrade an existing one. It is independent of the Playwright **MCP** the
> crawler uses for computed CSS.

## 5. Verify the setup

```bash
node scripts/design-cli.mjs --self-check      # retrieval CLI self-test -> SELF-CHECK OK
node scripts/design-cli.mjs list              # -> [] on a fresh clone, or your brands
```

Open the repo in Claude Code and confirm the three sub-agents load
(`brand-crawler`, `brand-analyzer`, `brand-designer`) in the Agent tool.

## 6. First run

Ask Claude Code: “Run the brand pipeline on <url>”. See `HUMAN_GUIDE.md` for the
stage-by-stage walkthrough and troubleshooting.
