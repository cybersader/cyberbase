// Vault-specific static layout. Reuse Quartz's generated controls and their pinned
// destinations. No client-side rearrangement (including on SPA navigation).
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const [, , quartzDir, page] = process.argv
const { parse, serializeOuter } = createRequire(resolve(quartzDir, 'package.json'))('parse5')
const html = readFileSync(page, 'utf8')
const tree = parse(html, { sourceCodeLocationInfo: true })
const attr = (node, key) => node.attrs?.find(a => a.name === key)?.value
const has = (node, name) => attr(node, 'class')?.split(/\s+/).includes(name)
function* walk(node) { yield node; for (const child of node.childNodes ?? []) yield* walk(child) }
function unique(root, pred, what) {
  const hits = [...walk(root)].filter(pred)
  if (hits.length !== 1) throw Error(`Expected one ${what}; found ${hits.length}`)
  return hits[0]
}
const body = unique(tree, n => n.tagName === 'body' && attr(n, 'data-slug') === 'index', 'homepage')
const hero = unique(body, n => attr(n, 'id') === 'cyberbase-intro' && n.parentNode?.tagName === 'article', 'article introduction')
const nav = unique(body, n => n.tagName === 'nav' && has(n,'cb-note-actions'), 'source toolbar')
const start = nav.sourceCodeLocation.startOffset, end = nav.sourceCodeLocation.endOffset, dest = hero.sourceCodeLocation.endOffset
if (!(end < dest)) throw Error('Unexpected homepage toolbar order')
const actions = nav.childNodes.filter(n => n.tagName)
const labels = ['Edit on GitHub','View source','Copy Markdown','View raw']
if (actions.map(n=>n.tagName).join() !== 'a,a,button,a' || !attr(actions[2],'data-cb-copy-markdown')) throw Error('Unexpected source toolbar controls')
for (const [i, node] of actions.entries()) {
  // Use real text, not CSS-generated labels. Keep the existing Copy span:
  // Quartz updates it for success/failure and leaves focus on the button.
  const name = node.attrs.find(a => a.name === 'aria-label'); if (name) name.value = labels[i]
  if (i === 2) {
    const label = unique(node, n => has(n,'cb-note-action-label'), 'copy status label')
    label.attrs.push({ name:'aria-live', value:'polite' })
  } else node.childNodes.push({ nodeName:'#text', value:labels[i], parentNode:node })
}
const output = html.slice(0,start) + html.slice(end,dest) + serializeOuter(nav) + html.slice(dest)
writeFileSync(page,output)
