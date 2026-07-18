# Documentation Map

This directory holds the project harness and any product contract derived from a
future user-provided spec.

## Main Files

- `HARNESS.md`: how humans and agents collaborate.
- `FEATURE_INTAKE.md`: how prompts become tiny, normal, or high-risk work.
- `ARCHITECTURE.md`: architecture discovery and boundary rules.
- `TEST_MATRIX.md`: legacy proof map; current proof status is queried with
  `scripts/bin/harness-cli query matrix`.
- `HARNESS_BACKLOG.md`: legacy improvement list; current improvement records
  are stored with `scripts/bin/harness-cli backlog`.
- `GLOSSARY.md`: shared terms.
- `contracts/`: versioned machine-readable contracts for optional external
  orchestrators.

## Folders

- `product/`: consumer-project product truth. `overview.md` holds the
  branding-design-builder product contract.
- `stories/`: feature packets and backlog.
- `decisions/`: durable decisions and tradeoffs.
- `demo/`: concrete walkthroughs that show how the harness transforms input
  into agent-ready work.
- `templates/`: reusable spec-intake, story, plan, decision, and validation
  formats.
- `pipeline/`: brand extraction pipeline guides — `SETUP.md` (MCPs, binaries,
  deps), `HUMAN_GUIDE.md` (clone, run, develop), and `AGENT_GUIDE.md` (dispatch
  contract, schemas, invariants).

## Current State

The upstream Harness v0 repository contains an implemented Rust CLI, tests,
installers, and pull-request/release automation. These documents are also
distributed as a generic template, so they do not imply that an installed
consumer repository already has application code, a chosen stack, consumer
tests, deployment automation, or consumer CI.
