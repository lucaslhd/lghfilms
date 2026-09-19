import { readFile, stat, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve, join } from 'node:path';
import { clips } from '../src/content.js';

const root = resolve('dist');
const html = await readFile(join(root, 'index.html'), 'utf8');
const errors = [];
const requireCheck = (condition, message) => { if (!condition) errors.push(message); };

requireCheck(html.includes('lang="pt-BR"'), 'Missing Portuguese document language');
requireCheck(/https:\/\/[^" ]+\/og-home-v3.jpg/.test(html), 'Missing absolute Open Graph image');
requireCheck(html.includes('Lucas Gil Films'), 'Missing updated identity');
requireCheck(!/<video[^>]+\bsrc=/.test(html), 'Video must not download on initial load');
requireCheck((await stat(join(root, 'og-home-v3.jpg'))).size < 65000, 'Open Graph exceeds 65KB');
requireCheck(!html.includes('<!-- PROJECT_CARDS -->'), 'Portfolio was not rendered at build time');
requireCheck(!html.includes('hls-'), 'Streaming library must not be requested in initial HTML');

const corePaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)].map(m => m[1]);
const coreBytes = gzipSync(html).length + (await Promise.all(
  corePaths.map(async p => gzipSync(await readFile(join(root, p))).length)
)).reduce((a, b) => a + b, 0);
requireCheck(coreBytes < 30000, `Initial HTML/CSS/JS budget exceeded: ${coreBytes}`);

const expectedFilms = Array.from({ length: 10 }, (_, i) => `film${String(i + 1).padStart(2, '0')}`);
const clipIds = Object.keys(clips);
requireCheck(clipIds.length === 10, `V2 must contain exactly 10 films; found ${clipIds.length}`);
requireCheck(expectedFilms.every(id => clipIds.includes(id)), 'V2 film IDs must be film01 through film10');

const source = await readFile(resolve('src/content.js'), 'utf8');
requireCheck(source.includes('/media/v3/'), 'V2 media must use the versioned /media/v3 path');
requireCheck(!source.includes('corvette') && !source.includes('alice') && !source.includes('fontes'), 'Legacy portfolio media must not be referenced by V2 content');

let fontBytes = 0;
for (const name of ['space-grotesk-latin.woff2', 'manrope-latin.woff2']) {
  const data = await readFile(join(root, 'fonts', name));
  fontBytes += data.length;
  requireCheck(data.subarray(0, 4).toString() === 'wOF2', `Invalid WOFF2: ${name}`);
}
requireCheck(fontBytes < 40000, 'Combined font budget exceeded');

const report = {
  coreCompressedBytes: coreBytes,
  fontBytes,
  videos: clipIds.length,
  mediaVersion: 'v3',
  note: 'V2 media derivatives are validated after the optimized film01-film10 assets are generated.',
  errors
};

await writeFile('performance-check.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
