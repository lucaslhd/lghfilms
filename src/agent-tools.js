export function createTools(load) {
  const definitions = [
    ['get_services', 'Consultar os serviços de produção, edição, fotografia e direção de arte de Lucas Gil Films.', data => data.services],
    ['get_portfolio', 'Consultar os filmes publicados no portfólio de Lucas Gil Films, com categorias e links.', data => data.portfolio],
    ['get_contact_guidance', 'Obter canais oficiais e orientações para solicitar orçamento. Não envia mensagens e não confirma disponibilidade.', data => data.contact],
  ];
  return definitions.map(([name, description, select]) => ({ name, description,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    async execute(input = {}, options = {}) {
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new TypeError('Esta consulta não recebe parâmetros.');
      options.signal?.throwIfAborted();
      const data = await load(options.signal);
      options.signal?.throwIfAborted();
      return JSON.stringify(select(data));
    },
  }));
}

export async function registerSiteTools(modelContext, lifecycle, load = async signal => {
  const response = await fetch('/api/site.json', { signal, credentials: 'omit', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Não foi possível consultar o portfólio. Use os links públicos da página.');
  return response.json();
}) {
  if (typeof modelContext?.registerTool !== 'function') return () => {};
  const controller = new AbortController();
  const dispose = () => controller.abort();
  lifecycle.addEventListener('pagehide', dispose, { once: true });
  try {
    for (const tool of createTools(load)) await modelContext.registerTool(tool, { signal: controller.signal });
  } catch (error) {
    dispose();
    throw error;
  }
  return dispose;
}
