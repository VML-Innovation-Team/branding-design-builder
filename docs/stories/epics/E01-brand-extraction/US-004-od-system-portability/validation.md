# Validation

## Proof Strategy

The story is done when, from a clean checkout on a second device, an agent wires
MCP via the committed `.claude/settings.json` and applies a stored brand's OD
package to the local Open Design daemon — reconstructing a design system that
matches the origin — without re-crawling the source site.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `brands/<slug>/od-system/manifest.json` validates against its schema; settings.json parses and declares the expected MCP servers |
| Integration | `cli apply <slug>` reads the committed package and registers a system on a local OD daemon |
| E2E | clean checkout -> settings.json wiring -> `apply ford` -> OD system present; ids/tokens match origin |
| Platform | apply succeeds on a second device (or a reset OD daemon) from the committed package alone |
| Release | applying a brand does not mutate the committed repo artifacts (read-only over `brands/<slug>/`) |

## Fixtures

- `ford` (already registered: project `ford-brand`, designSystemId
  `user:ford-com-vn`) and `vml` as the two stored brands to round-trip.
- A reset/empty OD daemon to simulate a fresh device.

## Commands

```text
TBD — add the `apply` command + settings.json path after Phase 2 locks the
portable-package schema and the settings contract.
```

## Acceptance Evidence

Add results after the first cross-device apply round-trip.
