# Consumer Setup — Using Stored Branding From An Agent

For an AI agent (or developer) that wants to **pull and apply** a stored brand's
design tokens. This is the *consumer* side — you are not extracting new brands
(that's `SETUP.md` + the pipeline), just retrieving ones already stored.

The only hard dependency is **Node.js** (18+). The retrieval CLI
(`scripts/design-cli.mjs`) uses the Node standard library — nothing to
`npm install`.

The CLI resolves brand data relative to its own file location, so it works from
any working directory as long as you call it by its real path. "Installing the
CLI" therefore just means "have this repo checked out somewhere."

---

## Scenario A — Agent working inside this repo

Nothing to install. The skill (`.claude/skills/use-brand-tokens/`) and CLI
(`scripts/design-cli.mjs`) are already here. Verify and go:

```bash
node scripts/design-cli.mjs --self-check   # -> SELF-CHECK OK
node scripts/design-cli.mjs list           # -> ["vml", ...]
```

---

## Scenario B — Agent in another project

### 1. Get the repo (the "install")

```bash
git clone https://github.com/VML-Innovation-Team/branding-design-builder.git
# note the absolute path; call it BRAND_REPO below
```

Verify:

```bash
node /abs/path/to/branding-design-builder/scripts/design-cli.mjs --self-check
```

### 2. Use the CLI by absolute path

```bash
BRAND_REPO=/abs/path/to/branding-design-builder
node "$BRAND_REPO/scripts/design-cli.mjs" list
node "$BRAND_REPO/scripts/design-cli.mjs" get vml
node "$BRAND_REPO/scripts/design-cli.mjs" get vml --group color
```

PowerShell:

```powershell
$BRAND_REPO = "C:\path\to\branding-design-builder"
node "$BRAND_REPO\scripts\design-cli.mjs" get vml
```

Optional convenience alias:

```bash
alias brand="node $BRAND_REPO/scripts/design-cli.mjs"
brand list && brand get vml --group font
```

### 3. Install the skill so your agent knows how to use it

The `use-brand-tokens` skill teaches an agent the CLI contract and how to apply
tokens. Make it available to your agent one of two ways:

**Copy it into your project** (self-contained, recommended):

```bash
mkdir -p .claude/skills
cp -r "$BRAND_REPO/.claude/skills/use-brand-tokens" .claude/skills/
```

```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
Copy-Item -Recurse "$BRAND_REPO\.claude\skills\use-brand-tokens" .claude\skills\
```

**Or install globally** for all your projects:

```bash
mkdir -p ~/.claude/skills
cp -r "$BRAND_REPO/.claude/skills/use-brand-tokens" ~/.claude/skills/
```

After copying, the skill's commands assume you run them from `$BRAND_REPO`. If
your agent runs elsewhere, substitute the absolute path (or the `brand` alias)
for `node scripts/design-cli.mjs` in the skill's examples.

---

## What you can pull

```bash
brand list                      # brand slugs that have tokens
brand get <slug>                # full W3C Design Tokens
brand get <slug> --group color  # color|font|spacing|radius|gradient|shadow|duration|easing|breakpoint
brand path <slug>               # absolute path to tokens.json (assets sit in ../assets/)
```

`get` emits JSON on stdout; unknown slugs exit non-zero and list what's
available. Assets (logo, fonts, icons) are under `<brand dir>/assets/` — derive
it from `brand path <slug>`.

## Notes

- **No network, no API keys** to *consume* brands. Those are only needed to
  *extract* new ones (see `SETUP.md`).
- **Fonts are files.** Brand webfonts live in `assets/fonts/*.woff2`; wire an
  `@font-face` to render them — the family name alone won't resolve.
- **Don't read `brands/<slug>/` files directly** as a workaround; go through the
  CLI so you get the stable contract (it filters scaffolding and gives clean
  errors).
