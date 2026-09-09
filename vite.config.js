import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { projects, clips, media } from './src/content.js';
import { site } from './src/site.js';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const url = (process.env.SITE_URL || site.currentUrl).replace(/\/$/, '');
const brandYaml = () => {
 const css=readFileSync(new URL('./src/brand.css',import.meta.url),'utf8');
 const token=name=>css.match(new RegExp('--'+name+':\\s*([^;]+)'))?.[1].trim();
 return `brand:
  name: "${site.name}"
  wordmark: "lucas gil films."
  handle: "${site.handle}"
  domain: "${site.finalUrl}"
  descriptor: "produção e edição de vídeos"
colors:
${['orange','orange-surface','on-orange','coral','rose','yellow','ink','paper','muted'].map(k=>`  ${k.replaceAll('-','_')}: "${token(k)}"`).join('\n')}
typography:
  display: "Space Grotesk"
  body: "Manrope"
  license: "SIL Open Font License 1.1"
layout:
  max_width: "${token('site-width')}"
  video_ratio: "9:16"
motion:
  menu_ms: 365
  reduced_motion: true
audio:
  start: "opt-in"
  loops: 2
  style: "jazz instrumental original"
`;
};
const icons = {
 WhatsApp: '<path d="M20.4 3.6A11.7 11.7 0 0 0 2 17.7L.4 23.6l6.1-1.5A11.8 11.8 0 0 0 24 11.8a11.7 11.7 0 0 0-3.6-8.2ZM12 21.6a9.7 9.7 0 0 1-4.9-1.3l-.4-.2-3.6.9.9-3.5-.3-.5A9.8 9.8 0 1 1 12 21.6Zm5.4-7.3c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1a8.1 8.1 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5.3-.4c.1-.2 0-.4 0-.5L9.4 7c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.7 1.2 2.9c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.1-1.3-.1-.2-.3-.3-.6-.5Z"/>',
 LinkedIn: '<path d="M5.4 7.3H2V22h3.4V7.3ZM3.7 1.8a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM22 13.2c0-4.4-2.3-6.4-5.4-6.4-2.5 0-3.6 1.4-4.2 2.3V7.3H9V22h3.4v-8.2c0-2.2.4-4.3 3.1-4.3 2.6 0 2.6 2.5 2.6 4.5v8H22v-8.8Z"/>',
 Instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2"/>',
 YouTube: '<path d="M22.5 7.1a3 3 0 0 0-2.1-2.2C18.5 4.4 12 4.4 12 4.4s-6.5 0-8.4.5a3 3 0 0 0-2.1 2.2A32 32 0 0 0 1 12a32 32 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.2c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.2A32 32 0 0 0 23 12a32 32 0 0 0-.5-4.9ZM9.7 15.6V8.4l6.2 3.6-6.2 3.6Z"/>',
};
const icon = name => `<svg class="social-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">${icons[name] || ''}</svg>`;
const socialLinks = () => Object.entries(site.socials).filter(([,href]) => href).map(([name, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${icon(name)}<span>${name}</span></a>`).join('');
function cards() {
 return projects.map(p => {
  const double = p.posters.length > 1;
  const sizes = double ? '(max-width: 700px) 43vw, 25vw' : '(max-width: 700px) 88vw, 42vw';
  return `<article class="project-card tone-${p.tone}" data-category="${escape(p.category)}">
   <div class="project-visual ${double ? 'double-frame' : 'single-frame'}">
    ${p.posters.map(id => `<button class="preview-frame" data-clip-preview="${id}" aria-label="Reproduzir prévia: ${escape(clips[id].title)}" aria-pressed="false"><picture><source type="image/avif" srcset="${media(id,'360.avif')} 360w, ${media(id,'480.avif')} 480w, ${media(id,'720.avif')} 720w" sizes="${sizes}"/><img src="${media(id,'360.webp')}" srcset="${media(id,'360.webp')} 360w, ${media(id,'480.webp')} 480w, ${media(id)} 720w" sizes="${sizes}" width="720" height="1280" loading="lazy" decoding="async" alt=""/></picture><video muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video><span class="preview-badge" aria-hidden="true">▷ <span>Prévia</span></span></button>`).join('')}
    <span class="project-count">${p.clips.length === 1 ? '1 filme' : p.clips.length + ' filmes'}</span>
   </div>
   <button class="project-open" data-project="${p.id}"><span class="project-caption"><span>${p.label}</span><span>${p.number} /</span><span class="project-title">${p.title}</span></span><span class="project-watch">Assistir ${p.clips.length > 1 ? 'à seleção' : 'ao filme'} <span aria-hidden="true">↗</span></span></button>
  </article>`;
 }).join('\n');
}
export default defineConfig({
 plugins: [{ name: 'portfolio-static-content', transformIndexHtml(html) {
  return html.replaceAll('%SITE_URL%', url).replaceAll('%WHATSAPP%', site.whatsapp)
   .replace('<!-- PROJECT_CARDS -->', cards()).replaceAll('<!-- SOCIAL_LINKS -->', socialLinks()).replace('<!-- LINKEDIN_ICON -->', icon('LinkedIn')).replace('<!-- WHATSAPP_ICON -->', icon('WhatsApp')).replace('<!-- BRAND_YAML -->',escape(brandYaml()));
 }, generateBundle() {
  this.emitFile({type:'asset',fileName:'brand.yaml',source:brandYaml()});
  this.emitFile({type:'asset', fileName:'robots.txt', source:`User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml\n`});
  this.emitFile({type:'asset', fileName:'sitemap.xml', source:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url><url><loc>${url}/brandbook/</loc></url></urlset>`});
  this.emitFile({type:'asset', fileName:'llms.txt', source:`# Lucas Gil Films\n\nProdução e edição de vídeo por Lucas Gil Henriques, São Paulo, Brasil.\n\n## Portfólio\n- [Trabalhos](${url}/#trabalhos): filmes automotivos, histórias e conteúdo em série.\n- [Sobre](${url}/#sobre): trajetória profissional.\n- [Contato](${url}/#contato): conversar sobre um filme.\n`});
 }}],
 build: { target: 'es2022', sourcemap: false, assetsInlineLimit: 0, rolldownOptions:{input:{main:resolve('index.html'),brandbook:resolve('brandbook/index.html')}} }, server: { host: '127.0.0.1' },
});
