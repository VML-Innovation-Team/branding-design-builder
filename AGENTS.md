# Agent Instructions

## Project: branding-design-builder

This repo designs branding in Open Design and stores it for agent reuse.

- Product contract: `docs/product/overview.md`.
- Design tooling: the `open-design` MCP server is wired into this workspace
  (use `get_artifact`, `create_artifact`, `write_file`, `list_projects`, etc.).
- Target: agents retrieve stored design files through a CLI. Retrieval is live:
  `node scripts/design-cli.mjs list|get <slug> [--group G]|path <slug>`
  (decision 0010), reading `brands/<slug>/tokens.json` (decision 0009).
- Brand extraction pipeline: three native Claude Code subagents in
  `.claude/agents/` (`brand-crawler` → `brand-analyzer` → `brand-designer`).
  Before dispatching them, read `docs/pipeline/AGENT_GUIDE.md` for the ordering
  dependency, per-brand file layout under `brands/<slug>/`, and invariants
  (no invented data, read-only crawl, real timestamps).

<!-- HARNESS:BEGIN -->
## Harness

Choose the request class before any Harness operation.

- When the requested outcome is only an answer, explanation, review, diagnosis,
  plan, or status report: inspect only the material needed to respond. Keep the
  task read-only. Do not bootstrap, initialize or migrate a database, record
  intake, or record a trace.
- When the user explicitly asks to change, build, fix, or write repository
  artifacts: first run `scripts/bootstrap-harness.sh`
  on macOS/Linux or `.\scripts\bootstrap-harness.ps1` on Windows. Then use
  `docs/FEATURE_INTAKE.md` to classify and record the request, query
  `scripts/bin/harness-cli query matrix --active --summary` on macOS/Linux or
  `.\scripts\bin\harness-cli.exe query matrix --active --summary` on Windows,
  and retrieve only the lane- and task-specific context described in
  `docs/CONTEXT_RULES.md`.
<!-- HARNESS:END -->
