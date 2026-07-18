# 0008 Store Brand Specs As W3C Design Tokens JSON

Date: 2026-07-18

## Status

Accepted

## Context

The branding pipeline must store extracted brand data in a format reusable by
both a retrieval CLI and Open Design, across devices. We needed one canonical
stored shape.

## Decision

Store the final brand spec as **W3C Design Tokens** JSON (`$value`/`$type`,
grouped tokens). Colors, typography, spacing, and radii are expressed as design
tokens. This is the stored public contract consumed downstream.

## Alternatives Considered

1. Custom `brand.json` tailored to this repo. Rejected: narrower reuse, no
   external ecosystem.
2. Style Dictionary proprietary config. Rejected: tool-specific; W3C tokens are
   the emerging tool-agnostic standard.

## Consequences

Positive:

- Tool-agnostic, wide ecosystem, reusable in CLI and Open Design.
- Clear typed contract for the analyzer/designer output.

Tradeoffs:

- Slightly more verbose than a bespoke shape.
- Spec is still stabilizing; we pin to the current draft.

## Follow-Up

- Add `scripts/schema/brand/` JSON schemas for raw-signals and brand-spec.
- Revisit if the retrieval CLI needs a flattened index alongside tokens.
