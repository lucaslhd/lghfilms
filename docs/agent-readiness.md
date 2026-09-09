# Publicação e acesso por agentes

O conteúdo de referência está em `src/site.js`, `src/content.js` e `src/agent-content.js`. `scripts/agent-assets.mjs` gera páginas Sobre, Contato, Privacidade e documentação; versões Markdown; instruções de uso; robots e sitemap; descrição OpenAPI; catálogos e índice de habilidades. O build publica somente informações já aprovadas ou presentes no portfólio.

`netlify/edge-functions/agent-access.js` negocia HTML/Markdown com os pesos do cabeçalho Accept, acrescenta Vary: Accept e Link e mantém HTTP 404 nas rotas inexistentes. As requisições de navegação recebem a página visual de erro; agentes recebem Markdown com caminhos de recuperação. A API pública `/api/site.json` é somente leitura, sem credenciais. POST recebe 405; OPTIONS informa os métodos permitidos. Mídia e fontes passam diretamente pelo CDN.

## Formatos implementados

- HTTP e negociação: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [Accept Markdown](https://acceptmarkdown.com/).
- Descoberta por cabeçalho Link: [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html). Catálogo de API: [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html).
- `llms.txt`, guia de links e contexto para modelos: [formato publicado](https://llmstxt.org/).
- Content Signals, declaração de usos autorizados: [especificação](https://contentsignals.org/). Política escolhida: busca e uso em respostas permitidos, treinamento proibido. É uma declaração de preferência; depende do respeito dos consumidores.
- Índice de habilidades: [Agent Skills Discovery](https://github.com/cloudflare/agent-skills-discovery-rfc). O digest SHA-256 é calculado sobre os bytes exatos da habilidade publicada.
- ARD, catálogo de recursos para agentes: [AI Catalog](https://github.com/Agent-Card/ai-catalog). `/.well-known/ard.json` e o alias `ai-catalog.json` anunciam somente a habilidade e a API existentes.
- WebMCP, ferramentas consultáveis pelo agente no navegador: [especificação](https://webmachinelearning.github.io/webmcp/). Registro opcional de três consultas de leitura, com cancelamento ao sair da página. Navegadores sem suporte conservam o fluxo existente.

## Verificação

Execute `npm ci`, `npm run build`, `npm test` e `npm run check`. O build do Netlify executa os testes e o orçamento de desempenho antes de publicar. Para validar um deploy real: `npm run verify:public -- https://URL-DO-DEPLOY`. O relatório JSON em `verification/` inclui status, conteúdo, MIME, negociação, métodos, descoberta, digest e acesso parcial aos vídeos. Um Vite preview sozinho não exercita a função de borda do Netlify.

Os testes não enviam leads, e-mails, mensagens, reservas ou pagamentos. A confirmação de contato acontece no canal escolhido pelo visitante.

## Decisões que permanecem externas ao código

- Descoberta da marca nos resultados de busca exige indexação e consistência de perfis. Solicitar indexação do sitemap no Google Search Console e revisar os links dos perfis depende do acesso a essas contas; nenhum aumento de score ou posição foi estimado.
- Não há API protegida, servidor MCP, autenticação delegada, cadastro de agentes ou checkout. Por isso, não se publicam metadados OAuth/OIDC, cartão de servidor MCP ou mecanismos de pagamento que anunciariam recursos inexistentes. Implementá-los exige definir uma tarefa real, autorização e operação comercial.
- DNS-AID, descoberta de serviços de agentes pelo DNS, exige escolher um serviço efetivamente disponível e seus registros. Os registros de DNS e e-mail existentes não são alterados para simular esse suporte. O catálogo HTTP já oferece descoberta dos recursos reais.
- Reavaliar a página de privacidade se forem adicionados formulários, analytics, pagamentos ou outros processadores.

## Kit de marca

A publicação também inclui a biblioteca preparada em `/brandbook/#assets`, com galeria, filtros, busca e downloads em `/brand-assets/`. Os arquivos permanecem separados da carga inicial da home. Verificar links, busca, filtros e o pacote ZIP ao publicar alterações nessa biblioteca.
