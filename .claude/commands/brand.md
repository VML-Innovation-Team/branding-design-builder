---
description: Run the full brand extraction pipeline on a URL (crawl → analyze → design)
argument-hint: <brand-url> [slug]
---

Run the three-stage brand extraction pipeline on: **$ARGUMENTS**

Parse `$ARGUMENTS` as `<brand-url> [slug]`. If no slug is given, the crawler
derives one from the domain (`stripe.com` → `stripe`).

Dispatch the three native subagents via the Agent tool in **strict sequence** —
each is a hard dependency on the prior stage's file. Do NOT parallelize. If a
stage fails or a required input file is missing, stop and report; never
fabricate a stage's input.

1. **brand-crawler** (`subagent_type: brand-crawler`) — pass the URL (and slug
   if supplied). Writes `brands/<slug>/source.json` + `raw-signals.json`.
2. **brand-analyzer** (`subagent_type: brand-analyzer`) — pass the slug only.
   Reads `raw-signals.json`, writes `brand-spec.json`.
3. **brand-designer** (`subagent_type: brand-designer`) — pass the slug only.
   Reads `brand-spec.json`, writes `tokens.json` + registers the Open Design
   system.

Gate each stage on the previous file existing and being schema-valid before
dispatching the next. When done, report the slug, per-category counts, the
Open Design project id + previewUrl, and the retrieval command:

```bash
node scripts/design-cli.mjs get <slug>
```

Contract details, invariants, and the degrade ladder live in
`docs/pipeline/AGENT_GUIDE.md` — follow them.
