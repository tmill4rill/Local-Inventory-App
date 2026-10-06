// Saves the hosted product photos into assets/products/<id>.png so you have local copies.
// Usage: npm run fetch-images
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const src = await readFile(new URL('../src/data/productImages.ts', import.meta.url), 'utf8');
const cdn = src.match(/const CDN = '([^']+)'/)[1];
const entries = [...src.matchAll(/'(p-[\w-]+)': `\$\{CDN\}([^`]+)`/g)];
const dir = new URL('../assets/products/', import.meta.url);
await mkdir(dir, { recursive: true });
for (const [, id, file] of entries) {
  const res = await fetch(cdn + file);
  if (!res.ok) { console.error(`✗ ${id}: HTTP ${res.status}`); continue; }
  await writeFile(new URL(`${id}.png`, dir), Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${id}`);
}
