# Exec Plan

## Goal

Make a stored brand's Open Design system portable across devices: declare MCP +
hooks wiring in a committed `.claude/settings.json`, wrap each brand's OD design
system into `brands/<slug>/`, and add a CLI + AI skill that re-applies it to
Open Design on another machine from the committed package.

## Scope

In scope:

- `.claude/settings.json` (local settings) declaring MCP servers (open-design,
  playwright, composio, context7) + any hooks, referencing env vars for secrets.
- Portable OD package inside `brands/<slug>/` — capture the OD brand/system
  definition + an id manifest (project id, brandId, designSystemId) so the
  system is reconstructable without a re-crawl.
- CLI command to apply a stored brand's OD package to a local OD daemon.
- AI-agent skill wrapping that CLI so an agent applies a brand on demand.
- Docs: AGENT_GUIDE + product overview updates; a decision record for the
  portability format and the settings.json contract.

Out of scope:

- Network sync of OD state (repo-mediated only).
- Secret storage (env-referenced, never inlined).
- Token format changes (decision 0008 stands).

## Risk Classification

Risk flags: External systems (OD daemon, MCP servers), Public contracts
(settings.json shape + CLI surface + portable-package schema), Cross-platform
(second device), Multi-domain (harness config + brand storage + CLI/skill),
Existing behavior (extends stage-3 output).

Hard gates: External provider behavior.

## Work Phases

1. Discovery — inspect the live OD registration output (project/brand/system
   ids, what `get_project`/`get_artifact` return) to learn what must be captured
   for a faithful re-apply. Confirm which MCP servers + hooks are actually in use.
2. Design — lock (a) the `.claude/settings.json` contract, (b) the
   `brands/<slug>/` portable OD package schema + id manifest, (c) the CLI apply
   surface + skill trigger. Record decisions.
3. Validation planning — define proof: fresh-clone wiring works; a brand
   applies to OD on a second device and matches the origin system.
4. Implementation — settings.json; extend stage 3 (or add a finalize step) to
   emit the portable package; CLI apply command; skill.
5. Verification — apply `ford` (or `vml`) from the committed package to a clean
   OD daemon; diff against origin.
6. Harness update — decisions, story status, matrix proof, trace.

## Dev Workflow (note for later)

When this story is picked up:

1. `git checkout feat/od-portability`.
2. Phase 1 discovery FIRST — do not design the package schema until the live OD
   registration payload is inspected on a real brand (`ford` is already
   registered: project `ford-brand`, designSystemId `user:ford-com-vn`).
3. Settings.json is the enabling prerequisite; land it before the CLI/skill so
   the apply path has declared MCP wiring to lean on.
4. Gate each phase on the prior decision being recorded — this is high-risk
   (external provider + public contract), so schema churn is expensive.

## Stop Conditions

Pause for human confirmation if:

- Faithful re-apply requires OD daemon internals not exposed by the MCP tools.
- The portable package would need to embed secrets or machine-specific paths.
- The settings.json contract would diverge from how the harness expects MCP
  servers/hooks to be declared.
