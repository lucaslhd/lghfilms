import { markdownDocuments, notFound, pagePath, markdownPath } from '../../src/agent-content.js';

// RFC 9110 §12.5.1: the most specific matching media range supplies its quality.
export function mediaPreference(accept, fallback = 'html') {
  if (!accept?.trim()) return fallback;
  const ranges = accept.split(',').map(value => {
    const [media, ...parameters] = value.trim().toLowerCase().split(';').map(s => s.trim());
    let q = 1;
    const mediaParameters = [];
    let afterQuality = false;
    for (const parameter of parameters) {
      if (parameter.startsWith('q=')) {
        q = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(parameter.slice(2)) ? Number(parameter.slice(2)) : 0;
        afterQuality = true;
      } else if (!afterQuality && parameter) mediaParameters.push(parameter);
    }
    return { media, q, mediaParameters };
  });
  function quality(type) {
    const matches = ranges.filter(r => (r.media === type || r.media === 'text/*' || r.media === '*/*') && r.mediaParameters.every(p => /^charset=(?:"utf-8"|utf-8)$/.test(p)));
    matches.sort((a, b) => (b.media === type ? 2 : b.media === 'text/*' ? 1 : 0) - (a.media === type ? 2 : a.media === 'text/*' ? 1 : 0) || b.mediaParameters.length - a.mediaParameters.length || b.q - a.q);
    return matches[0]?.q || 0;
  }
  const html = quality('text/html'), md = quality('text/markdown');
  if (!html && !md) return null;
  if (md === html) return fallback;
  return md > html ? 'markdown' : 'html';
}

export function varyAccept(headers) {
  const vary = headers.get('Vary')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  if (!vary.includes('*')) for (const name of ['Accept', 'Accept-Encoding']) if (!vary.some(v => v.toLowerCase() === name.toLowerCase())) vary.push(name);
  headers.set('Vary', vary.join(', '));
}
export function discoveryHeaders(path) {
  const links = ['</llms.txt>; rel="describedby"; type="text/plain"', '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"'];
  if (path) links.unshift(`<${markdownPath(path)}>; rel="alternate"; type="text/markdown"`);
  return links.join(', ');
}
function machineResponse(body, status, type, request, extra = {}) {
  return new Response(request.method === 'HEAD' ? null : body, { status, headers: {
    'Content-Type': type + '; charset=utf-8',
    'Content-Language': 'pt-BR',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Vary': 'Accept, Accept-Encoding',
    'Link': discoveryHeaders(null),
    ...extra,
  } });
}

export default async function agentAccess(request, context) {
  const pathname = new URL(request.url).pathname;
  const path = pagePath(pathname);
  const isPublicData = pathname === '/api/site.json' || pathname === '/openapi.json' || pathname.startsWith('/.well-known/');
  if (isPublicData && request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Allow': 'GET, HEAD, OPTIONS' } });
  if (!['GET', 'HEAD'].includes(request.method)) {
    if (path || isPublicData) return machineResponse(JSON.stringify({ error: 'method_not_allowed', message: 'Este recurso é somente de leitura.' }), 405, 'application/json', request, { 'Allow': 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Origin': '*' });
    return context.next();
  }
  if (path) {
    const preference = mediaPreference(request.headers.get('Accept'));
    if (!preference) return machineResponse('Available representations: text/html, text/markdown.\n', 406, 'text/plain', request);
    if (preference === 'markdown') return machineResponse(markdownDocuments[path], 200, 'text/markdown', request, { 'Link': discoveryHeaders(path), 'Content-Location': markdownPath(path) });
  }
  const response = await context.next();
  if (response.status === 404 && mediaPreference(request.headers.get('Accept'), 'markdown') !== 'html') return machineResponse(notFound, 404, 'text/markdown', request, { 'X-Robots-Tag': 'noindex' });
  if (path || response.status === 404 || isPublicData || /\.(?:md|txt)$/.test(pathname)) {
    const headers = new Headers(response.headers);
    if (path || response.status === 404) varyAccept(headers);
    headers.set('Link', discoveryHeaders(path));
    if (isPublicData) headers.set('Access-Control-Allow-Origin', '*');
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
}

export const config = { path: '/*', excludedPath: ['/assets/*', '/media/*', '/fonts/*', '/brand-assets/*', '/.netlify/*'] };
