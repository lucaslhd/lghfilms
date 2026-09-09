import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { agentAssets } from './agent-assets.mjs';
import { markdownDocuments, origin, publicData } from '../src/agent-content.js';
import Ajv from 'ajv/dist/2020.js';

const target = process.argv[2];
if (!target || !/^https?:\/\//.test(target)) throw new Error('Usage: npm run verify:public -- https://target.example');
const results = [], failures = [], bodies = new Map();
async function check(label, action) {
  try { await action(); results.push({ label, passed: true }); }
  catch (error) { results.push({ label, passed: false, error: error.message }); failures.push(label); }
}
async function get(path, init = {}) {
  return fetch(new URL(path, target), { ...init, signal: AbortSignal.timeout(30_000) });
}
const assets = agentAssets();
for (const [path, expected] of assets) {
  await check('GET /' + path, async () => {
    const response = await get('/' + path);
    assert.equal(response.status, 200);
    const body = await response.text(); bodies.set(path, body);
    const type = response.headers.get('Content-Type');
    if (path.endsWith('.html')) { assert.match(type, /^text\/html/); assert.ok(body.includes(origin)); }
    else {
      const mime = path === '.well-known/api-catalog' ? 'application/linkset+json' : path.endsWith('.json') ? 'application/json' : path.endsWith('.md') ? 'text/markdown' : path.endsWith('.xml') ? 'application/xml' : 'text/plain';
      assert.ok(type?.startsWith(mime), `Content-Type ${type}; expected ${mime}`);
      assert.equal(body, expected, 'Published content differs from this build');
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
    }
    if (path.endsWith('.json')) JSON.parse(body);
  });
  if (!path.endsWith('.html')) await check('HEAD /' + path, async () => {
    const response = await get('/' + path, { method: 'HEAD' });
    assert.equal(response.status, 200); assert.equal(await response.text(), '');
  });
}
for (const [path, expected] of Object.entries(markdownDocuments)) {
  await check('HTML + discovery ' + path, async () => {
    const response = await get(path, { headers: { Accept: 'text/html' } });
    const body = await response.text(); assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /^text\/html/);
    assert.match(response.headers.get('Vary'), /\bAccept\b/);
    assert.match(response.headers.get('Link'), /rel="alternate"/);
    assert.ok(body.includes(`rel="canonical" href="${origin}${path}"`));
    if (path === '/') { assert.ok(body.includes('id="film-player"')); assert.ok(body.includes('data-filter="Automotivo"')); }
  });
  for (const method of ['GET', 'HEAD']) await check(method + ' Markdown ' + path, async () => {
    const response = await get(path, { method, headers: { Accept: 'text/markdown' } });
    assert.equal(response.status, 200); assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
    assert.match(response.headers.get('Vary'), /\bAccept\b/);
    assert.equal(await response.text(), method === 'HEAD' ? '' : expected);
  });
}
for (const [accept, status, type] of [
  ['text/markdown;q=0.1, text/html;q=0.9', 200, 'text/html'],
  ['text/markdown;q=0.9, text/html;q=0.1', 200, 'text/markdown'],
  ['text/markdown;q=0, */*;q=1', 200, 'text/html'],
  ['text/html;q=0, */*;q=1', 200, 'text/markdown'],
  ['application/json', 406, 'text/plain'],
]) await check('Negotiation ' + accept, async () => {
  const response = await get('/', { headers: { Accept: accept } });
  assert.equal(response.status, status); assert.ok(response.headers.get('Content-Type').startsWith(type));
  await response.arrayBuffer();
});
for (const path of ['/agent-readiness-nonexistent-20260909', '/.well-known/agent-skills/missing/SKILL.md']) {
  for (const accept of ['*/*', 'text/html', 'text/markdown']) await check('404 ' + path + ' ' + accept, async () => {
    const response = await get(path, { headers: { Accept: accept } });
    assert.equal(response.status, 404); const body = await response.text();
    if (accept === 'text/html') { assert.match(response.headers.get('Content-Type'), /^text\/html/); assert.ok(body.includes('Fora de cena.')); }
    else { assert.match(response.headers.get('Content-Type'), /^text\/markdown/); assert.ok(body.includes('/sitemap.xml')); assert.ok(body.includes('/llms.txt')); }
  });
}
await check('Public API rejects POST', async () => {
  const response = await get('/api/site.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 405); assert.equal((await response.json()).error, 'method_not_allowed');
});
await check('Public API OPTIONS', async () => { const response = await get('/api/site.json', { method: 'OPTIONS' }); assert.equal(response.status, 204); assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*'); });
await check('Published skill digest', async () => {
  const index = JSON.parse(bodies.get('.well-known/agent-skills/index.json'));
  for (const skill of index.skills) {
    const response = await get(new URL(skill.url).pathname);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(skill.digest, 'sha256:' + createHash('sha256').update(bytes).digest('hex'));
  }
});
await check('Public API response satisfies OpenAPI schema', async () => {
  const spec = JSON.parse(bodies.get('openapi.json'));
  const validate = new Ajv().compile(spec.components.schemas.PortfolioInformation);
  assert.ok(validate(JSON.parse(bodies.get('api/site.json'))), JSON.stringify(validate.errors));
});
await check('Video manifest and ranged playback remain accessible', async () => {
  const manifest = await get('/media/v1/corvette/index.m3u8');
  assert.equal(manifest.status, 200);
  const content = await manifest.text(); assert.ok(content.includes('#EXT-X-ENDLIST'));
  const segment = content.split('\n').find(line => line.trim() && !line.startsWith('#')).trim();
  const response = await get('/media/v1/corvette/' + segment, { headers: { Range: 'bytes=0-63' } });
  assert.equal(response.status, 206); assert.equal((await response.arrayBuffer()).byteLength, 64);
});
const report = { target, checkedAt: new Date().toISOString(), checks: results.length, passed: results.length - failures.length, failures, results };
await mkdir('verification', { recursive: true });
const filename = `verification/${new URL(target).hostname.replaceAll('.', '-')}.json`;
await writeFile(filename, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ target, checks: report.checks, passed: report.passed, failures, report: filename }, null, 2));
if (failures.length) { for (const r of results.filter(r => !r.passed)) console.error(`${r.label}: ${r.error}`); process.exitCode = 1; }
