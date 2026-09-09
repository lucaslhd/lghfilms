import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const domain = 'lucasgilfilms.com';
const owner = '_index._agents.' + domain;
const catalog = 'https://' + domain + '/.well-known/ard.json';
const expectedDS = '2371 13 2 CC4D30158681711DFA16D478B32E5BF5AEE499EED4B75EB75A6599323D0C25FD';
const results = [], evidence = [];
async function check(label, action) {
  try { await action(); results.push({ label, passed: true }); }
  catch (error) { results.push({ label, passed: false, error: error.message }); }
}
async function dns(resolver, name, type) {
  const url = new URL(resolver);
  for (const [key, value] of Object.entries({ name, type, do: 'true', cd: 'false' })) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  const answer = await response.json();
  evidence.push({ resolver, name, type, answer });
  assert.equal(answer.Status, 0, 'DNS query failed');
  return answer;
}
for (const resolver of ['https://cloudflare-dns.com/dns-query', 'https://dns.google/resolve']) {
  let service;
  await check(resolver + ' SVCB ServiceMode and real catalog', async () => {
    service = await dns(resolver, owner, 'SVCB');
    const record = service.Answer?.find(r => r.type === 64);
    assert.ok(record, 'No SVCB answer');
    const value = record.data.replaceAll('"', '');
    assert.match(value, /^1 lucasgilfilms\.com\./);
    assert.match(value, /(?:^|\s)alpn=h2,http\/1\.1(?:\s|$)/);
    assert.match(value, /(?:^|\s)port=443(?:\s|$)/);
    assert.ok(value.includes('key65400=' + catalog));
    assert.match(value, /(?:^|\s)mandatory=alpn,port(?:\s|$)/);
  });
  await check(resolver + ' authenticated DNSSEC discovery', async () => {
    assert.ok(service, 'SVCB query unavailable');
    assert.equal(service.AD, true, 'Zone signing is insufficient: the validating resolver must return AD=true');
    assert.ok(service.Answer.some(r => r.type === 46), 'Missing DNSSEC signature');
  });
  await check(resolver + ' parent DS matches Cloudflare signing key', async () => {
    const answer = await dns(resolver, domain, 'DS');
    assert.ok(answer.Answer?.some(r => r.type === 43 && r.data.toUpperCase() === expectedDS), 'Parent DS missing or different');
  });
  await check(resolver + ' website and mail still resolve', async () => {
    const [addresses, mail] = await Promise.all([dns(resolver, domain, 'A'), dns(resolver, domain, 'MX')]);
    assert.ok(addresses.Answer?.some(r => r.type === 1));
    for (const target of ['route1.mx.cloudflare.net', 'route2.mx.cloudflare.net', 'route3.mx.cloudflare.net']) {
      assert.ok(mail.Answer?.some(r => r.type === 15 && r.data.replace(/\.$/, '').endsWith(target)), target);
    }
  });
}
await check('Catalog and advertised resources respond over HTTPS', async () => {
  const response = await fetch(catalog, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /^application\/json/);
  const data = await response.json();
  assert.equal(data.host.identifier, domain);
  assert.ok(data.entries.length > 0);
  for (const entry of data.entries) {
    assert.ok(entry.url.startsWith('https://' + domain + '/'));
    const resource = await fetch(entry.url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
    assert.equal(resource.status, 200, entry.url);
  }
});
const failed = results.filter(r => !r.passed);
const report = { checkedAt: new Date().toISOString(), domain, owner, checks: results.length, passed: results.length - failed.length, results, evidence };
await mkdir('verification', { recursive: true });
await writeFile('verification/dns-aid.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ checks: report.checks, passed: report.passed, failed }, null, 2));
process.exitCode = failed.length ? 1 : 0;
