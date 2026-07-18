# Exec Plan

## Goal

A brand URL becomes a stored, reusable W3C Design Tokens design system via a
3-sub-agent pipeline, usable from CLI and Open Design across devices.

## Scope

In scope:

- Three agent definitions in `.claude/agents/`: `brand-crawler`,
  `brand-analyzer`, `brand-designer`.
- Token schema decision (W3C Design Tokens) + on-disk brand layout decision.
- Raw-signal contract between crawler and analyzer.
- First real brand run to validate the pipeline end to end.

Out of scope:

- Retrieval CLI command surface (separate story).
- Authenticated/paywalled crawling.
- Logo vectorization.

## Risk Classification

Risk flags:

- External systems (Playwright live sites, Firecrawl/Composio cloud).
- Public contracts (stored token JSON shape + future CLI retrieval).

Hard gates:

- External provider behavior.

## Work Phases

1. Discovery — confirm available MCP tools (Playwright present; Firecrawl absent,
   needs FIRECRAWL_API_KEY; Composio browser/scrape as fallback).
2. Design — lock token schema + brand dir layout + raw-signal contract
   (decisions recorded).
3. Validation planning — define proof for a real brand run.
4. Implementation — write the three agent definitions + schema files.
5. Verification — run the pipeline on one real brand, inspect stored tokens.
6. Harness update — record decisions, story status, matrix proof.

## Stop Conditions

Pause for human confirmation if:

- A target site blocks automated access or requires login.
- Token schema or layout must diverge from the recorded decision.
- Firecrawl key handling would store secrets in the repo.
