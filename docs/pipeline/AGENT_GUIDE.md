# Brand Extraction Pipeline — Agent Guide

Machine-facing contract for the brand pipeline. If you are an agent asked to
extract, structure, or store a brand, read this. Human setup lives in
`HUMAN_GUIDE.md`.

## Pipeline Shape

Three native Claude Code subagents in `.claude/agents/`, run in strict order.
Each reads the previous stage's file and writes its own. Dispatch via the Agent
tool with `subagent_type`.

| Order | subagent_type | Reads | Writes | Network |
| --- | --- | --- | --- | --- |
| 1 | `brand-crawler` | URL (+ optional slug) | `source.json`, `raw-signals.json` | yes (Playwright, Composio/Firecrawl) |
| 2 | `brand-analyzer` | `raw-signals.json` | `brand-spec.json` | no |
| 3 | `brand-designer` | `brand-spec.json` | `tokens.json` + registered OD design system | Open Design only |

All files live under `brands/<brand-slug>/`. Slug: lowercase domain without TLD
noise (e.g. `stripe.com` → `stripe`), matching `^[a-z0-9-]+$`.

## Dispatch Contract

### Sequential dependency

Stage N requires stage N-1's file to exist and be schema-valid. Do NOT run
stages in parallel — each is a hard dependency on the prior file. If a stage's
input file is missing, run the upstream stage first, don't fabricate input.

### Passing the target

- Stage 1: pass the URL, and the slug if the caller specified one; otherwise
  the crawler derives it.
- Stages 2 and 3: pass the `brand-slug` only. The agent locates its input by
  convention at `brands/<slug>/`.

### Return values

Each subagent's final text IS its return value (not shown to the user
verbatim). Expect a short summary: per-category counts, key choices, file
paths, and (stage 3) the Open Design project id + previewUrl. Relay what the
user needs; the files are the durable artifact.

## Data Contracts (schemas)

- `scripts/schema/brand/raw-signals.schema.json` — stage 1 output.
- `scripts/schema/brand/brand-spec.schema.json` — stage 2 output.
- stage 3 `tokens.json` — W3C Design Tokens (`$type` + `$value`), decision 0008.

A stage that changes its output shape MUST update its schema in the same change
and update the downstream reader.

## Invariants (do not violate)

1. **No invented data.** Every color/size/token must trace to a real signal
   from the live site. The analyzer and designer transform; they do not
   imagine. Unfillable roles go in a `gaps` array, not guessed.
2. **Real timestamps.** `source.json.crawledAt` comes from a shell `date`
   call, never a made-up value.
3. **Read-only crawl.** The crawler observes sites; it never submits forms,
   logs in, or mutates remote state.
4. **Slug consistency.** All five files for one brand share the same slug and
   directory.
5. **Stage isolation.** The analyzer touches no network. Keep its tool set
   free of browser/scrape tools.

## Storage Layout (decision 0009)

```text
brands/<slug>/
  source.json       { url, brandSlug, crawledAt, pagesVisited, toolsUsed, degrades }
  raw-signals.json  colors[], typography[], spacing[], radii[], shadows[], assets[], content{}
  brand-spec.json   palette{}, typography{}, spacing{}, radii{}, shadows{}, assets[], gaps[]
  tokens.json       W3C Design Tokens groups: color, font, spacing, radius
  assets/           binary assets
```

## Reference Skills

Installed globally, invoked via the Skill tool. They are **advisory** — they
inform how a stage works, they do not replace its tools or its data:

| Skill | Used by | Role |
| --- | --- | --- |
| `crawl4ai-skill` | brand-crawler | Optional content crawler (markdown, no API key). Vendored in `.claude/skills/`. Content/copy only — never the source of computed-CSS visual tokens. Needs its `crawl4ai-skill` binary. |
| `design-tokens` | brand-analyzer, brand-designer | Conventions for palette roles, spacing/type scales, token grouping. Vendored in `.claude/skills/`. Reference only — values still come solely from crawled signals, never generated from an aesthetic philosophy. |

## Degrade Ladder

- Firecrawl present (FIRECRAWL_API_KEY) → use it for content.
- Else Composio browser/scrape (if connected) → use it.
- Else Playwright snapshot text → use it and record the degrade in
  `source.json.degrades`.

An absent optional tool is a clean degrade, never a failure. An absent
**Playwright** (visual extraction) or **Open Design** (stage 3) IS a hard stop
— report it, don't proceed with fabricated output.

## Retrieving Stored Brands

After a brand is stored, retrieve it (no need to know the directory shape):

```bash
node scripts/design-cli.mjs list              # -> ["stripe", ...] (JSON on stdout)
node scripts/design-cli.mjs get <slug>        # -> full tokens.json
node scripts/design-cli.mjs get <slug> --group color
node scripts/design-cli.mjs path <slug>       # -> absolute path to tokens.json
```

`get` emits JSON on stdout; errors go to stderr with a non-zero exit and list
available slugs. A brand is retrievable only once stage 3 has written its
`tokens.json` (decision 0010).

## Harness Recording

This is high-risk story `US-001-brand-to-tokens-pipeline` (External systems +
Public contracts). When changing pipeline behavior, run intake
(`docs/FEATURE_INTAKE.md`), update the story, and record a decision for any
change to token format, layout, or stage boundaries. Record each pipeline run
as a trace with `harness-cli trace`.
