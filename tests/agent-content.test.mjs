import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import { markdownDocuments, publicData, origin } from '../src/agent-content.js';
import { createTools, registerSiteTools } from '../src/agent-tools.js';
const read = path => readFile(join('dist', path), 'utf8');

test('Canonical and identity use the live domain across all public pages', async () => {
  for (const path of Object.keys(markdownDocuments)) {
    const html = await read(path === '/' ? 'index.html' : path.slice(1) + 'index.html');
    assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`));
    assert.ok(!html.includes('https://lucasgil.aotta.com.br'));
    if (path !== '/brandbook/') {
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
      const person = graph.find(entry => entry['@type'] === 'Person');
      assert.equal(person.name, 'Lucas Gil Henriques'); assert.equal(person.alternateName, 'Lucas Gil Films');
      assert.ok(person.description.length > 40); assert.equal(person.sameAs.length, 3);
    }
  }
});
test('Trust pages contain substantial visible content and functional contact links', async () => {
  for (const slug of ['about', 'contact', 'privacy']) {
    const html = await read(`${slug}/index.html`);
    const main = html.match(/<main[^>]*>(.*?)<\/main>/s)[1].replace(/<[^>]+>/g, '');
    assert.ok(main.length >= 500, `${slug} must have at least 500 visible characters`);
    assert.ok(html.includes('mailto:contato@lucasgilfilms.com') || html.includes(`href="${origin}/contact/"`));
    assert.ok(html.includes('<h1>')); assert.ok(html.includes('lang="pt-BR"'));
  }
});
test('Homepage behavior retains player, filter, contact and deferred media hooks', async () => {
  const html = await read('index.html');
  for (const fragment of ['id="film-player"', 'data-filter="Automotivo"', 'id="mobile-menu"', 'href="https://wa.me/5511915117067?', 'mailto:contato@lucasgilfilms.com']) assert.ok(html.includes(fragment), fragment);
  assert.ok(!/<video[^>]+\bsrc=/.test(html));
  for (const path of ['/about/', '/contact/', '/privacy/']) assert.ok(html.includes(`href="${path}"`));
});
test('llms.txt follows the ordered v2 format and every linked file is published', async () => {
  const text = await read('llms.txt');
  assert.match(text, /^# Lucas Gil Films\n\n> /); assert.ok(text.includes('When to use / Quando usar'));
  let filesSection = false;
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) filesSection = true;
    else if (filesSection && line.trim()) assert.match(line, /^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/);
  }
  for (const [, url] of text.matchAll(/\]\((https:[^)]+)\)/g)) await access(join('dist', new URL(url).pathname));
  assert.match(await read('agent-instructions.md'), /## When to use/);
});
test('Robots declares the chosen content policy and the correct sitemap', async () => {
  const robots = await read('robots.txt');
  assert.match(robots, /User-agent: \*\nAllow: \/\nContent-Signal: search=yes, ai-input=yes, ai-train=no/);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  const sitemap = await read('sitemap.xml');
  for (const path of Object.keys(markdownDocuments)) assert.ok(sitemap.includes(`<loc>${origin}${path}</loc>`));
});
test('OpenAPI schema validates the actual public JSON response', async () => {
  const spec = JSON.parse(await read('openapi.json'));
  assert.equal(spec.openapi, '3.1.0'); assert.equal(spec.servers[0].url, origin);
  assert.deepEqual(spec.security, []); assert.equal(spec.paths['/api/site.json'].get.operationId, 'getPortfolioInformation');
  const validate = new Ajv().compile(spec.components.schemas.PortfolioInformation);
  assert.ok(validate(JSON.parse(await read('api/site.json'))), JSON.stringify(validate.errors));
  const invalid = { ...publicData, contact: { ...publicData.contact, telephone: 123 } };
  assert.equal(validate(invalid), false);
});
test('API catalog links to real endpoint, description and documentation', async () => {
  const catalog = JSON.parse(await read('.well-known/api-catalog'));
  const endpoint = catalog.linkset.find(entry => entry.anchor === origin + '/api/site.json');
  assert.ok(endpoint); assert.equal(endpoint['service-desc'][0].href, origin + '/openapi.json');
  assert.equal(endpoint['service-doc'][0].href, origin + '/developers/');
  assert.match(await read('_headers'), /application\/linkset\+json; profile="https:\/\/www.rfc-editor.org\/info\/rfc9727"/);
});
test('Skill discovery verifies the bytes, names and content of the published artifact', async () => {
  const index = JSON.parse(await read('.well-known/agent-skills/index.json'));
  assert.equal(index.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json');
  for (const skill of index.skills) {
    assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/); assert.ok(skill.name.length <= 64);
    assert.equal(skill.type, 'skill-md');
    const body = await readFile(join('dist', new URL(skill.url).pathname));
    assert.equal(skill.digest, 'sha256:' + createHash('sha256').update(body).digest('hex'));
    assert.match(body.toString(), /^---\nname: lucas-gil-films\ndescription: /);
  }
});
test('Both discovery catalog paths publish identical, valid, resolvable entries', async () => {
  const text = await read('.well-known/ai-catalog.json');
  assert.equal(text, await read('.well-known/ard.json'));
  const catalog = JSON.parse(text); assert.equal(catalog.specVersion, '1.0');
  for (const entry of catalog.entries) {
    assert.match(entry.identifier, /^urn:air:lucasgilfilms\.com:[a-z-]+:[a-z-]+$/);
    assert.match(entry.type, /^[a-z]+\/[a-z.+-]+$/); assert.ok(entry.url && !Object.hasOwn(entry, 'data'));
    assert.ok(entry.representativeQueries.length >= 2);
    await access(join('dist', new URL(entry.url).pathname));
  }
});
test('WebMCP tools return public data only and reject unexpected parameters', async () => {
  const tools = createTools(async () => publicData);
  assert.deepEqual(tools.map(t => t.name), ['get_services', 'get_portfolio', 'get_contact_guidance']);
  for (const [index, tool] of tools.entries()) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.deepEqual(JSON.parse(await tool.execute({})), [publicData.services, publicData.portfolio, publicData.contact][index]);
    await assert.rejects(tool.execute({ email: 'do-not-send@example.com' }), TypeError);
  }
});
test('WebMCP registration is optional and registrations are aborted on navigation', async () => {
  const lifecycle = new EventTarget(); const registrations = [];
  await registerSiteTools(null, lifecycle);
  await registerSiteTools({ registerTool: async (tool, options) => registrations.push({ tool, options }) }, lifecycle, async () => publicData);
  assert.equal(registrations.length, 3);
  lifecycle.dispatchEvent(new Event('pagehide'));
  assert.ok(registrations.every(r => r.options.signal.aborted));
});
test('Failed WebMCP registration aborts already registered tools', async () => {
  let signal;
  await assert.rejects(registerSiteTools({ registerTool: async (_tool, options) => { signal = options.signal; throw new Error('unsupported'); } }, new EventTarget()));
  assert.ok(signal.aborted);
});
