import { createHash } from 'node:crypto';
import { origin, pages, markdownDocuments, markdownPath, llms, instructions, publicData, identity } from '../src/agent-content.js';
const json = value => JSON.stringify(value, null, 2) + '\n';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const digest = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const schema = value => Array.isArray(value) ? { type: 'array', items: value.length ? schema(value[0]) : {} } : value && typeof value === 'object' ? { type: 'object', required: Object.keys(value), properties: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, schema(entry)])), additionalProperties: false } : { type: typeof value };

import { site } from '../src/site.js';

function renderPage(path, page) {
  if (path === '/about/') {
    const storySection = page.sections.find(s => s.heading === 'Minha História') || page.sections[0];
    const storyHtml = storySection ? `<section class="bio-content">${storySection.paragraphs.map(p => {
      if (p === 'Fé. Família. Propósito.') {
        return `<p class="pillars-highlight"><span class="pillar-word">Fé.</span> <span class="pillar-word">Família.</span> <span class="pillar-word">Propósito.</span></p>`;
      }
      return `<p>${escape(p)}</p>`;
    }).join('')}</section>` : '';

    const contactHtml = `<section class="bio-contact" id="contato">
      <h2>CONTATO</h2>
      <div class="contact-links-grid">
        <a class="contact-card" href="${escape(site.whatsapp)}" target="_blank" rel="noopener noreferrer">
          <span class="contact-label">WhatsApp</span>
          <span class="contact-value">(11) 9 1511-7067 ↗</span>
        </a>
        <a class="contact-card" href="mailto:${escape(site.email)}">
          <span class="contact-label">E-mail</span>
          <span class="contact-value">${escape(site.email)} ↗</span>
        </a>
        <a class="contact-card" href="${escape(site.socials.Instagram)}" target="_blank" rel="noopener noreferrer">
          <span class="contact-label">Instagram</span>
          <span class="contact-value">@lucas.henriques_ofilmmaker ↗</span>
        </a>
        <a class="contact-card" href="https://www.facebook.com/search/top?q=Lucas%20Henriques" target="_blank" rel="noopener noreferrer">
          <span class="contact-label">Facebook</span>
          <span class="contact-value">Lucas Henriques ↗</span>
        </a>
        <a class="contact-card" href="${escape(site.socials.LinkedIn)}" target="_blank" rel="noopener noreferrer">
          <span class="contact-label">LinkedIn</span>
          <span class="contact-value">Lucas Gil Henriques ↗</span>
        </a>
      </div>
      <div class="bio-actions">
        <a class="btn-bio-red" href="${origin}/contact/">Conversar sobre um projeto <span>→</span></a>
        <a class="btn-bio-ghost" href="/#filmes">Ver trabalhos selecionados <span>↗</span></a>
      </div>
    </section>`;

    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#050505"><title>${escape(page.title)} — Lucas Gil Films</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${origin}${path}"><link rel="alternate" type="text/markdown" href="${markdownPath(path)}"><link rel="describedby" href="/llms.txt"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/agent-pages.css"><meta property="og:type" content="profile"><meta property="og:site_name" content="Lucas Gil Films"><meta property="og:title" content="${escape(page.title)} — Lucas Gil Films"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/og-home-v3.jpg"><script type="application/ld+json">${JSON.stringify(identity()).replaceAll('<', '\\u003c')}</script></head><body class="page-about"><a class="skip-link" href="#conteudo">Pular para o conteúdo</a><header class="site-header-subpage"><a class="wordmark" href="/">lucas gil films<span>.</span></a><nav class="subpage-nav"><a href="/">Início</a><a href="/about/" class="active">Sobre</a><a href="/#filmes">Trabalhos</a><a href="/#servicos">Serviços</a><a href="/contact/">Contato</a></nav><a class="nav-cta-subpage" href="${escape(site.whatsapp)}" target="_blank" rel="noopener">VAMOS CONVERSAR <span>→</span></a></header><main id="conteudo" class="about-main"><div class="bio-intro"><div class="bio-portrait"><img src="/images/lucas-portrait.png" alt="Lucas Gil Henriques" width="160" height="160" loading="eager" decoding="async"></div><div class="bio-headings"><p class="eyebrow">MINHA HISTÓRIA</p><h1>${escape(page.title)}</h1><p class="bio-role">${escape(page.description)}</p></div></div>${storyHtml}${contactHtml}</main><footer><div class="footer-inner"><a class="footer-brand" href="/">LUCAS GIL <b>FILMS</b></a><nav class="footer-nav"><a href="/">Início</a><a href="/about/">Sobre</a><a href="/contact/">Contato</a><a href="/privacy/">Privacidade</a><a href="/#filmes">Trabalhos</a></nav><p>© 2026 Lucas Gil Henriques</p><a class="back-top" href="#conteudo">Voltar ao topo ↑</a></div></footer></body></html>`;
  }

  const content = page.sections.map(section => `<section><h2>${escape(section.heading)}</h2>${(section.paragraphs || []).map(p => `<p>${escape(p)}</p>`).join('')}${section.links?.length ? `<ul>${section.links.map(l => `<li><a href="${escape(l.href)}"${/^https:/.test(l.href) && !l.href.startsWith(origin + '/') ? ' rel="noopener noreferrer"' : ''}>${escape(l.label)}</a></li>`).join('')}</ul>` : ''}</section>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#050505"><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${origin}${path}"><link rel="alternate" type="text/markdown" href="${markdownPath(path)}"><link rel="describedby" href="/llms.txt"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/agent-pages.css"><meta property="og:type" content="website"><meta property="og:site_name" content="Lucas Gil Films"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/og-home-v3.jpg"><script type="application/ld+json">${JSON.stringify(identity()).replaceAll('<', '\\u003c')}</script></head><body><a class="skip-link" href="#conteudo">Pular para o conteúdo</a><header class="site-header-subpage"><a class="wordmark" href="/">lucas gil films<span>.</span></a><nav class="subpage-nav"><a href="/">Início</a><a href="/about/">Sobre</a><a href="/contact/">Contato</a></nav><a class="nav-cta-subpage" href="/#trabalhos">Ver trabalhos ↗</a></header><main id="conteudo"><p class="eyebrow">LUCAS GIL FILMS</p><h1>${escape(page.title)}</h1>${content}</main><footer><div class="footer-inner"><a href="/about/">Sobre</a><a href="/contact/">Contato</a><a href="/privacy/">Privacidade</a><a href="/">Voltar ao portfólio ↑</a></div></footer></body></html>`;
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
