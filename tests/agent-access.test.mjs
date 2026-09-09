import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { mediaPreference, varyAccept } from '../netlify/edge-functions/agent-access.js';
import { markdownDocuments, notFound } from '../src/agent-content.js';

for (const [accept, expected] of [
  [undefined, 'html'], ['', 'html'], ['*/*', 'html'], ['text/*', 'html'],
  ['text/markdown', 'markdown'], ['text/html', 'html'], ['application/json', null],
  ['text/markdown;q=0, text/html;q=0', null], ['text/markdown;q=0, */*;q=1', 'html'],
  ['text/html;q=0, */*;q=1', 'markdown'], ['text/markdown;q=0.5, text/html;q=0.9', 'html'],
  ['text/markdown;q=0.9, text/html;q=0.5', 'markdown'], ['text/markdown;q=1, text/html;q=1', 'html'],
  ['text/markdown; charset=utf-8', 'markdown'], ['text/markdown;variant=unknown', null],
  ['text/markdown;q=bogus, text/html;q=0.5', 'html'], ['text/markdown;q=1.1, text/html', 'html'],
  ['text/*;q=0.9, text/markdown;q=0.1', 'html'], ['TEXT/MARKDOWN', 'markdown'],
  ['text/markdown;q=0.999', 'markdown'], ['text/markdown;q=0.9999', null],
]) test(`Accept ${accept ?? '(absent)'} -> ${expected}`, () => assert.equal(mediaPreference(accept), expected));

test('Vary preserves unrelated fields and deduplicates case-insensitively', () => {
  const headers = new Headers({ Vary: 'Origin, accept-encoding, aCcEpT' });
  varyAccept(headers);
  assert.equal(headers.get('Vary'), 'Origin, accept-encoding, aCcEpT');
});
test('Vary wildcard is preserved', () => { const h = new Headers({ Vary: '*' }); varyAccept(h); assert.equal(h.get('Vary'), '*'); });

const request = (path, accept, method = 'GET') => new Request('https://lucasgilfilms.com' + path, { method, headers: accept ? { Accept: accept } : {} });
test('Every public page negotiates Markdown without an origin fetch', async () => {
  for (const [path, body] of Object.entries(markdownDocuments)) {
    const response = await handler(request(path, 'text/markdown'), { next: () => assert.fail('Markdown must not load HTML') });
    assert.equal(response.status, 200); assert.equal(await response.text(), body);
    assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
    assert.match(response.headers.get('Vary'), /Accept/);
    assert.match(response.headers.get('Link'), /rel="alternate"/);
  }
});
test('HTML body, status and cache metadata pass through intact', async () => {
  const response = await handler(request('/', 'text/html'), { next: async () => new Response('<!doctype html><h1>Um novo olhar.</h1>', { headers: { 'Content-Type': 'text/html', ETag: 'original', Vary: 'Accept-Encoding', 'Cache-Control': 'public, max-age=0' } }) });
  assert.equal(await response.text(), '<!doctype html><h1>Um novo olhar.</h1>');
  assert.equal(response.headers.get('ETag'), 'original');
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0');
  assert.match(response.headers.get('Vary'), /Accept-Encoding, Accept/);
});
test('Unsupported representations return 406 with no cached variant', async () => {
  const response = await handler(request('/', 'application/json'), { next: () => assert.fail() });
  assert.equal(response.status, 406); assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
for (const accept of [undefined, '*/*', 'text/markdown']) test(`Missing page returns real Markdown 404 for ${accept}`, async () => {
  const response = await handler(request('/nonexistent', accept), { next: async () => new Response('Visual 404', { status: 404, headers: { 'Content-Type': 'text/html' } }) });
  assert.equal(response.status, 404); assert.equal(await response.text(), notFound);
  assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
});
test('Browser error page remains HTML with a 404 status', async () => {
  const response = await handler(request('/nonexistent', 'text/html'), { next: async () => new Response('Fora de cena.', { status: 404, headers: { 'Content-Type': 'text/html' } }) });
  assert.equal(response.status, 404); assert.equal(await response.text(), 'Fora de cena.');
});
test('HEAD has the same content type and status with no response body', async () => {
  for (const path of ['/', '/nonexistent']) {
    const response = await handler(request(path, 'text/markdown', 'HEAD'), { next: async () => new Response(null, { status: 404 }) });
    assert.equal(response.status, path === '/' ? 200 : 404); assert.equal(await response.text(), '');
    assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
  }
});
test('Static assets and media range responses remain unmodified', async () => {
  const original = new Response('video chunk', { status: 206, headers: { 'Content-Range': 'bytes 0-10/100', 'Content-Type': 'video/mp2t' } });
  assert.equal(await handler(request('/media/v1/example.ts', '*/*'), { next: async () => original }), original);
});
test('Origin redirects retain their destination and status', async () => {
  const response = await handler(request('/about', 'text/html'), { next: async () => new Response(null, { status: 301, headers: { Location: '/about/' } }) });
  assert.equal(response.status, 301); assert.equal(response.headers.get('Location'), '/about/');
});
test('Public API rejects writes and supports browser preflight', async () => {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await handler(request('/api/site.json', 'application/json', method), { next: () => assert.fail() });
    assert.equal(response.status, 405); assert.match(response.headers.get('Allow'), /GET/);
    assert.equal((await response.json()).error, 'method_not_allowed');
  }
  const options = await handler(request('/api/site.json', '*/*', 'OPTIONS'), { next: () => assert.fail() });
  assert.equal(options.status, 204); assert.equal(options.headers.get('Access-Control-Allow-Origin'), '*');
});
