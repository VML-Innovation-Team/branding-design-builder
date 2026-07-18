# Design

## Domain Model

- **PortableODPackage** — the committed, device-independent representation of a
  brand's Open Design system, living under `brands/<slug>/`. Derives from the
  already-committed `tokens.json` + `brand-spec.json` + `assets/`, plus an
  **id manifest** recording the OD identifiers from registration.
- **ODIdManifest** — `{ projectId, brandId, designSystemId, previewUrl }` as
  emitted by stage 3's OD run. previewUrl is machine-local and treated as
  informational, not a portable key.
- **SettingsContract** — `.claude/settings.json` declaring MCP servers and hooks;
  secrets referenced by env var name, never inlined.

## Application Flow

```text
(origin device)  stage 3 finalize
   -> brands/<slug>/tokens.json + brand-spec.json + assets/
   -> brands/<slug>/od-system/   (portable OD package + id manifest)   [NEW]
   -> git commit

(second device)  git clone
   -> .claude/settings.json wires MCP (open-design, playwright, ...)   [NEW]
   -> cli apply <slug>          reads brands/<slug>/od-system/          [NEW]
   -> registers the system on the local OD daemon
   -> agent skill wraps `cli apply` for on-demand use                  [NEW]
```

## Interface Contract

- `.claude/settings.json` — MCP server + hook declarations (schema per harness
  settings expectations; env-referenced secrets).
- `brands/<slug>/od-system/` — portable OD package + `manifest.json`
  (ODIdManifest). Exact file shape locked in Phase 2 after Phase 1 discovery.
- CLI: `node scripts/design-cli.mjs apply <slug>` (surface TBD, aligns with the
  existing list/get/path verbs from US-002 / decision 0010).
- Skill: an installable AI skill that triggers on "apply <brand> to Open
  Design" and calls the CLI apply path.

## Data Model

No SQLite change. New artifacts are files under `brands/<slug>/od-system/`.
Harness DB records intake/story/decisions/traces only.

## UI / Platform Impact

- CLI gains an `apply` verb (writes to a local OD daemon via MCP).
- Cross-device: the repo is the transport; OD state is reconstructed locally.
- `.gitignore` already commits durable brand outputs and ignores `assets/screens/`
  — confirm the new `od-system/` package is committed (not screenshot-class).

## Observability

- Apply run recorded as a harness trace (tool = open-design MCP, target slug).
- CLI apply reports the reconstructed OD ids for diffing against origin.

## Alternatives Considered

1. Leave OD state in the daemon, re-crawl on each device. Rejected: wasteful,
   non-deterministic, defeats "stored, reusable" intent.
2. Network sync OD daemon-to-daemon. Rejected: out of scope, adds hosting +
   auth surface; repo-mediated transport is simpler and already the norm.
3. Regenerate the OD system purely from `tokens.json` on apply (no id manifest).
   Deferred — viable if Phase 1 shows registration is a pure function of tokens;
   the id manifest is the safety net if it is not.
