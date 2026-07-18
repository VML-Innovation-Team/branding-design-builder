---
name: use-brand-tokens
description: Pull a stored brand's design system (colors, fonts, spacing, radii, gradients, motion, logo, component recipes) from this repo's CLI and apply it when building UI. Use this whenever you are about to style, theme, or build any interface, component, page, email, or asset that should match a stored brand — e.g. "build a landing page for vml", "make this button on-brand", "use the brand colors", "style this to match <brand>", "what's the brand's primary color / font / button look". Prefer this over guessing hex values, font names, or spacing — the real, extracted values live in the CLI and must not be invented.
---

# Use Brand Tokens

This repository stores extracted brand design systems as **W3C Design Tokens**
plus assets, retrievable through a small CLI. When you build anything that
should look on-brand, pull the real values instead of guessing — the whole
point of the store is that `#000000`, `SnowflakeSans`, and the button's exact
`32px 80px` padding are recorded, not approximated.

## When to use this

Reach for this the moment a task involves matching a brand's look: theming a
component, building a page/email/deck, picking colors or fonts, or answering
"what is <brand>'s primary color / heading font / button style". If you catch
yourself about to type a hex value or font name from memory for a brand that
might be stored here, stop and pull it instead.

## The CLI

Run from the repo root. Node (18+) only, no dependencies. If you are in a
different project, call the CLI by its absolute path (it resolves brand data
from its own location, so cwd doesn't matter) — see
`docs/pipeline/CONSUMER_SETUP.md` for cloning the repo and installing this skill
elsewhere.

```bash
node scripts/design-cli.mjs list                     # brand slugs available
node scripts/design-cli.mjs get <slug>               # full tokens.json (JSON on stdout)
node scripts/design-cli.mjs get <slug> --group color # one group: color|font|spacing|radius|gradient|shadow|duration|easing|breakpoint
node scripts/design-cli.mjs path <slug>              # absolute path to the brand's tokens.json
```

Contract you can rely on:
- `get` prints valid JSON to **stdout**. Parse it directly.
- Errors (unknown slug, unknown group) print a one-line message to **stderr**
  and exit **non-zero**, and the message lists what *is* available. Check the
  exit code; on failure, run `list` and pick a real slug.
- `list` returns a JSON array like `["vml"]`. It excludes scaffolding.

## Workflow

1. **Discover** — `list` to see stored brands. If the brand you need isn't
   there, it hasn't been extracted yet; tell the user rather than inventing
   values (they can run the extraction pipeline — see `docs/pipeline/`).
2. **Pull** — `get <slug>` for the whole system, or `get <slug> --group <g>`
   when you only need one axis (e.g. just colors for a palette question).
3. **Apply** — map tokens into whatever you're building (see below).
4. **Assets** — for logo/fonts, resolve the assets dir from `path <slug>`
   (replace the trailing `tokens.json` with `assets/`).

## Token shape

W3C Design Tokens: every leaf is `{ "$type": …, "$value": … }`, nested in
groups. Read `$value`. Example:

```json
{
  "color": {
    "primary": { "$type": "color", "$value": "#000000" },
    "neutral": { "900": { "$type": "color", "$value": "#191919" } },
    "usage":   { "buttonFill": { "$type": "color", "$value": "#000000" } }
  },
  "font":    { "family": { "heading": { "$type": "fontFamily", "$value": "SnowflakeSans, Arial, sans-serif" } } },
  "spacing": { "2": { "$type": "dimension", "$value": "8px" } }
}
```

`color.usage` carries applied rules (text, background, link, buttonFill,
buttonText, …) — prefer these for *how* to apply color, and the top-level
`color.primary/secondary/accent/neutral` for the palette itself.

Component recipes, when present, live in a sibling `components` block (not W3C
tokens — they are composed styles you can apply almost verbatim):

```json
"components": { "button": { "padding": "32px 80px", "borderRadius": "32px",
  "background": "#000000", "color": "#ffffff", "border": "2px solid #ffffff" } }
```

## Applying tokens

Flatten to whatever the target needs. To CSS custom properties, walk the tree
and join the key path:

```
color.primary        -> --color-primary: #000000;
color.neutral.900    -> --color-neutral-900: #191919;
font.family.heading  -> --font-family-heading: SnowflakeSans, Arial, sans-serif;
```

Then reference the variables (`background: var(--color-primary)`), or inline the
`$value`s directly for a one-off. For a component, apply its recipe fields as
CSS properties directly.

## Rules that matter

- **Never invent brand values.** If a value isn't in the tokens, say so — don't
  fill the gap with a plausible-looking hex or font. The store exists precisely
  so brand values are exact.
- **Mind usage context.** A `color.usage` value reflects where it was observed
  (e.g. a `link` sampled from a dark nav may be light) — if you apply it on a
  different surface, sanity-check contrast rather than trusting it blindly.
- **Fonts may be files, not web-safe.** Brand fonts live under `assets/fonts/`
  as woff2. To actually render them, wire an `@font-face` pointing at those
  files; don't assume the family name resolves on its own.
- **A brand with no tokens isn't retrievable.** `list` only shows brands that
  finished extraction. Don't try to read `brands/<slug>/` files directly as a
  workaround — go through the CLI so you get the stable contract.

## Example

**Task:** "Build an on-brand primary button for vml."

```bash
node scripts/design-cli.mjs get vml --group color   # -> primary #000000, usage.buttonText #ffffff
node scripts/design-cli.mjs get vml                 # -> components.button recipe
```

Apply the recipe:

```css
.btn-primary {
  padding: 32px 80px;
  border-radius: 32px;
  background: #000000;   /* color.usage.buttonFill */
  color: #ffffff;        /* color.usage.buttonText */
  border: 2px solid #ffffff;
  font-family: SnowflakeSans, Arial, sans-serif;
}
```
