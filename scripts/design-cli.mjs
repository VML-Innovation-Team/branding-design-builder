#!/usr/bin/env node
// Brand retrieval CLI. Reads the brands/<slug>/ layout (decision 0009) and
// serves stored W3C design tokens (decision 0008). Node stdlib only.
//
//   node scripts/design-cli.mjs list
//   node scripts/design-cli.mjs get <slug> [--group color|font|spacing|radius]
//   node scripts/design-cli.mjs path <slug>
//   node scripts/design-cli.mjs --self-check
//
// stdout = machine data (JSON for `get`); stderr = human messages.

import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// brandsDir is injectable so the self-check can point at a fixture.
function listBrands(brandsDir) {
  if (!existsSync(brandsDir)) return []
  return readdirSync(brandsDir, { withFileTypes: true })
    // Skip underscore-prefixed dirs (e.g. _template scaffold) — not real brands.
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(join(brandsDir, d.name, 'tokens.json')))
    .map((d) => d.name)
    .sort()
}

function tokensPath(brandsDir, slug) {
  return join(brandsDir, slug, 'tokens.json')
}

function getTokens(brandsDir, slug, group) {
  const p = tokensPath(brandsDir, slug)
  if (slug.startsWith('_') || !existsSync(p)) {  // _-prefixed = scaffold, not a brand
    const avail = listBrands(brandsDir)
    const hint = avail.length ? `Available: ${avail.join(', ')}` : 'No brands stored yet.'
    throw new Error(`No tokens for brand "${slug}". ${hint}`)
  }
  const tokens = JSON.parse(readFileSync(p, 'utf8'))
  if (group === undefined) return tokens
  if (!(group in tokens)) {
    throw new Error(`Group "${group}" not in ${slug}/tokens.json. Groups: ${Object.keys(tokens).join(', ')}`)
  }
  return { [group]: tokens[group] }
}

function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) { flags[key] = next; i++ }
      else flags[key] = true
    } else positional.push(argv[i])
  }
  return { positional, flags }
}

function run(argv, brandsDir) {
  const { positional, flags } = parseArgs(argv)
  const cmd = positional[0]
  switch (cmd) {
    case 'list': {
      const brands = listBrands(brandsDir)
      process.stdout.write(JSON.stringify(brands) + '\n')
      return 0
    }
    case 'get': {
      const slug = positional[1]
      if (!slug) { process.stderr.write('usage: get <slug> [--group G]\n'); return 2 }
      const group = typeof flags.group === 'string' ? flags.group : undefined
      const out = getTokens(brandsDir, slug, group)
      process.stdout.write(JSON.stringify(out, null, 2) + '\n')
      return 0
    }
    case 'path': {
      const slug = positional[1]
      if (!slug) { process.stderr.write('usage: path <slug>\n'); return 2 }
      const p = tokensPath(brandsDir, slug)
      if (slug.startsWith('_') || !existsSync(p)) { process.stderr.write(`No tokens for brand "${slug}".\n`); return 1 }
      process.stdout.write(resolve(p) + '\n')
      return 0
    }
    default:
      process.stderr.write('Brand retrieval CLI\n\nCommands:\n  list\n  get <slug> [--group color|font|spacing|radius]\n  path <slug>\n')
      return cmd === undefined ? 0 : 2
  }
}

function selfCheck() {
  const dir = mkdtempSync(join(tmpdir(), 'design-cli-'))
  const assert = (cond, msg) => { if (!cond) throw new Error('SELF-CHECK FAIL: ' + msg) }
  try {
    const brands = join(dir, 'brands')
    mkdirSync(join(brands, 'acme'), { recursive: true })
    mkdirSync(join(brands, 'incomplete'), { recursive: true }) // no tokens.json
    mkdirSync(join(brands, '_template'), { recursive: true })  // scaffold w/ tokens stub
    writeFileSync(tokensPath(brands, 'acme'), JSON.stringify({
      color: { primary: { $type: 'color', $value: '#635bff' } },
      spacing: { 2: { $type: 'dimension', $value: '8px' } },
    }))
    writeFileSync(tokensPath(brands, '_template'), JSON.stringify({ color: {} }))

    assert(JSON.stringify(listBrands(brands)) === JSON.stringify(['acme']), 'list excludes _template and tokenless dirs')
    let tmpl = false
    try { getTokens(brands, '_template') } catch { tmpl = true }
    assert(tmpl, 'get _template throws (scaffold is not a brand)')
    assert(run(['path', '_template'], brands) === 1, 'path _template exits 1')
    assert(getTokens(brands, 'acme').color.primary.$value === '#635bff', 'get returns full tokens')
    const g = getTokens(brands, 'acme', 'color')
    assert('color' in g && !('spacing' in g), 'get --group returns only that group')
    let threw = false
    try { getTokens(brands, 'nope') } catch { threw = true }
    assert(threw, 'unknown slug throws')
    threw = false
    try { getTokens(brands, 'acme', 'nogroup') } catch { threw = true }
    assert(threw, 'unknown group throws')
    assert(run(['list'], brands) === 0, 'list exits 0')
    assert(run(['get'], brands) === 2, 'get without slug exits 2')
    assert(run(['path', 'nope'], brands) === 1, 'path unknown slug exits 1')

    process.stderr.write('SELF-CHECK OK\n')
    return 0
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const argv = process.argv.slice(2)
if (argv[0] === '--self-check') process.exit(selfCheck())
try {
  process.exit(run(argv, join(REPO_ROOT, 'brands')))
} catch (err) {
  // Clean one-line error for agents — no stack trace noise.
  process.stderr.write((err && err.message ? err.message : String(err)) + '\n')
  process.exit(1)
}
