import { createHash } from 'node:crypto';
import { origin, pages, markdownDocuments, markdownPath, llms, instructions, publicData, identity } from '../src/agent-content.js';
const json = value => JSON.stringify(value, null, 2) + '\n';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const digest = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const schema = value => Array.isArray(value) ? { type: 'array', items: value.length ? schema(value[0]) : {} } : value && typeof value === 'object' ? { type: 'object', required: Object.keys(value), properties: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, schema(entry)])), additionalProperties: false } : { type: typeof value };

function renderPage(path, page) {
  const content = page.sections.map(section => `<section><h2>${escape(section.heading)}</h2>${(section.paragraphs || []).map(p => `<p>${escape(p)}</p>`).join('')}${section.links?.length ? `<ul>${section.links.map(l => `<li><a href="${escape(l.href)}"${/^https:/.test(l.href) && !l.href.startsWith(origin + '/') ? ' rel="noopener noreferrer"' : ''}>${escape(l.label)}</a></li>`).join('')}</ul>` : ''}</section>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#171513"><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${origin}${path}"><link rel="alternate" type="text/markdown" href="${markdownPath(path)}"><link rel="describedby" href="/llms.txt"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/agent-pages.css"><meta property="og:type" content="website"><meta property="og:site_name" content="Lucas Gil Films"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/og-home-v3.jpg"><script type="application/ld+json">${JSON.stringify(identity()).replaceAll('<', '\\u003c')}</script></head><body><a class="skip-link" href="#conteudo">Pular para o conteúdo</a><header><a class="wordmark" href="/">lucas gil films<span>.</span></a><a href="/#trabalhos">Ver trabalhos ↗</a></header><main id="conteudo"><p class="eyebrow">LUCAS GIL FILMS</p><h1>${escape(page.title)}</h1>${content}</main><footer><a href="/about/">Sobre</a><a href="/contact/">Contato</a><a href="/privacy/">Privacidade</a><a href="/">Voltar ao portfólio ↑</a></footer></body></html>`;
}

export function agentAssets() {
  const files = new Map();
  for (const [path, text] of Object.entries(markdownDocuments)) {
    files.set(markdownPath(path).slice(1), text);
    if (path !== '/') files.set(path.slice(1, -1) + '.md', text);
  }
  for (const [path, page] of Object.entries(pages)) if (path !== '/') files.set(path.slice(1) + 'index.html', renderPage(path, page));
  files.set('llms.txt', llms);
  files.set('llms-full.txt', Object.values(markdownDocuments).join('\n---\n\n') + '\n---\n\n' + instructions);
  files.set('agent-instructions.md', instructions);
  files.set('robots.txt', `User-agent: *\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=no\n\nSitemap: ${origin}/sitemap.xml\n`);
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(markdownDocuments).map(path => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>\n`);
  files.set('api/site.json', json(publicData));
  files.set('openapi.json', json({
    openapi: '3.1.0', info: { title: 'Lucas Gil Films — informações públicas', version: '1.0.0', description: 'Consulta de identidade, serviços, portfólio e contato. Somente leitura; não envia mensagens nem realiza reservas ou pagamentos.', contact: { name: 'Lucas Gil Henriques', email: publicData.contact.email, url: origin + '/contact/' } },
    servers: [{ url: origin }], security: [],
    paths: { '/api/site.json': { get: { operationId: 'getPortfolioInformation', summary: 'Consultar serviços, portfólio e contato', description: 'Retorna o conteúdo público do portfólio, sem autenticação. Valores e disponibilidade dependem de confirmação direta.', responses: { '200': { description: 'Informações públicas do site', content: { 'application/json': { schema: { $ref: '#/components/schemas/PortfolioInformation' } } } }, '405': { description: 'Método não permitido; use GET ou HEAD.' } } } } },
    components: { schemas: { PortfolioInformation: schema(publicData) } },
  }));
  files.set('.well-known/api-catalog', json({ linkset: [
    { anchor: origin + '/.well-known/api-catalog', item: [{ href: origin + '/api/site.json', type: 'application/json' }] },
    { anchor: origin + '/api/site.json', 'service-desc': [{ href: origin + '/openapi.json', type: 'application/json' }], 'service-doc': [{ href: origin + '/developers/', type: 'text/html' }] },
  ] }));
  const skillDescription = 'Consulte os serviços e o portfólio de Lucas Gil Films e oriente uma solicitação de orçamento pelos canais oficiais.';
  const skill = `---\nname: lucas-gil-films\ndescription: ${skillDescription}\n---\n\n${instructions}`;
  const skillPath = '/.well-known/agent-skills/lucas-gil-films/SKILL.md';
  files.set(skillPath.slice(1), skill);
  files.set('.well-known/agent-skills/index.json', json({ $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', skills: [{ name: 'lucas-gil-films', type: 'skill-md', description: skillDescription, url: origin + skillPath, digest: digest(skill) }] }));
  const catalog = json({ specVersion: '1.0', host: { identifier: 'lucasgilfilms.com', displayName: 'Lucas Gil Films' }, entries: [
    { identifier: 'urn:air:lucasgilfilms.com:skill:portfolio', displayName: 'Portfólio e contato de Lucas Gil Films', type: 'text/markdown', url: origin + skillPath, representativeQueries: ['Como consultar os filmes de Lucas Gil Films?', 'Como conversar com Lucas sobre produção ou edição de vídeo?'] },
    { identifier: 'urn:air:lucasgilfilms.com:api:public-information', displayName: 'Informações públicas do portfólio', type: 'application/json', url: origin + '/openapi.json', representativeQueries: ['Quais serviços Lucas Gil Films oferece?', 'Quais são os canais oficiais de contato?'] },
  ] });
  files.set('.well-known/ard.json', catalog);
  files.set('.well-known/ai-catalog.json', catalog);
  return files;
}
