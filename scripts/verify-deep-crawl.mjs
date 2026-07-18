#!/usr/bin/env node
// US-003 proof: the deep-crawl categories (decision 0012) are present in a
// stored brand's raw-signals.json. Exits non-zero if any are missing.
// Usage: node scripts/verify-deep-crawl.mjs [slug]  (default: vml)

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const slug = process.argv[2] || 'vml'
const p = join(root, 'brands', slug, 'raw-signals.json')

if (!existsSync(p)) { console.error(`no raw-signals for ${slug}`); process.exit(1) }
const s = JSON.parse(readFileSync(p, 'utf8'))

// Deep-crawl categories that must exist (decision 0012). darkMode may be null
// (a valid "no dark theme" result), so presence of the key is enough.
const required = ['gradients', 'colorPairs', 'motion', 'logoVariants', 'icons', 'imagery', 'components', 'breakpoints', 'manifest']
const missing = required.filter((k) => !(k in s))

if (missing.length) { console.error(`missing deep-crawl categories: ${missing.join(', ')}`); process.exit(1) }
const counts = required.map((k) => `${k}:${Array.isArray(s[k]) ? s[k].length : (s[k] === null ? 'null' : 'set')}`).join(' ')
console.log(`DEEP-CRAWL OK (${slug}) ${counts}`)
