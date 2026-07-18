# Validation

## Proof Strategy

The pipeline is done when a real brand URL produces a valid W3C Design Tokens
`tokens.json` plus an Open Design system, with each stage's intermediate file
inspectable and schema-valid.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | raw-signals.json and brand-spec.json validate against their JSON schemas |
| Integration | crawler->analyzer->designer handoff produces tokens.json for a fixture site |
| E2E | one real brand URL run end to end; tokens.json opens/reuses in Open Design |
| Platform | tokens.json retrievable on a second device via Open Design project |
| Performance | single-brand run completes without manual intervention |
| Logs/Audit | each stage recorded as a harness trace with tool + targets |

## Fixtures

- One stable public brand site with a clear palette/type system (pick during
  verification; avoid login-walled or bot-blocked sites).
- A saved `raw-signals.json` sample for offline analyzer testing.

## Commands

```text
TBD — add after agent definitions exist.
```

## Acceptance Evidence

Add results after the first real brand run.
