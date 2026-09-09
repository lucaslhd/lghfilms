# Lucas Gil Films — portfólio audiovisual

Site em HTML, CSS e JavaScript, compilado com Vite. Domínio definitivo: https://lucasgilfilms.com/. Hospedagem: projeto `papaya-duckanoo-3a793e` no Netlify; DNS no Cloudflare. A função de borda entrega as representações Markdown e preserva o HTML para navegadores.

Repositório de produção: https://github.com/lucaslhd/lghfilms, branch `main`. Não publicar no antigo projeto `lucasgil-aotta`: ele não atende o domínio definitivo. O ID do projeto correto é `b0020d78-7ad3-4738-b5e4-9cee3b79a88f`.

## Editar

- `src/brand.css`: cores, fontes e largura máxima de 1.600 px.
- `src/content.js`: títulos e agrupamentos dos nove filmes.
- `index.html`: textos, contatos, SEO e Open Graph.
- `src/style.css` e `src/revisions.css`: layout, menu animado e versão móvel.
- `src/main.js`: player, filtros, menu e prévias.

Os agrupamentos são coleções editoriais do portfólio, não uma afirmação de que todos os vídeos de uma coleção pertencem a uma campanha. Os nomes públicos dos três arquivos originalmente genéricos foram escolhidos para apresentação e devem ser confirmados com Lucas. A biografia usa apenas informações do perfil fornecido e do briefing: audiovisual, fotografia, direção de arte e São Paulo. Não reproduz a contagem de anos do currículo, que pode ficar desatualizada.

## Rodar

```sh
npm ci
npm run dev
npm run build
npm test
npm run check
npm run preview
npm run verify:public -- https://lucasgilfilms.com
```

O diretório publicado é `dist`. O Netlify usa `netlify.toml`. Não há servidor de aplicação, banco de dados, rastreadores, cookies de marketing ou chamadas de fontes externas.

## Fontes e identidade

Space Grotesk (títulos) e Manrope (texto), ambas sob SIL Open Font License 1.1 e permitidas em trabalhos comerciais. Os arquivos foram convertidos/subconjuntados para WOFF2 com caracteres latinos e pontuação portuguesa, e hospedados localmente. Os avisos e licenças completos acompanham a distribuição em `public/fonts`. A licença tem condições para redistribuição dos arquivos de fonte; não é uma declaração de domínio público.

- https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt
- https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
- https://openfontlicense.org/how-to-use-ofl-fonts/

Paleta de referência: coral `#E2725B`, rosa `#D58D8D`, laranja `#FA6404`, amarelo `#FFDD44`. Fundo `#171513` e papel `#F5F2ED` dão contraste. A arte do Open Graph foi gerada para este projeto e exportada como JPEG 1200 × 630. As imagens do portfólio são frames dos vídeos fornecidos pelo usuário.

## Desempenho

- HTML estático e conteúdo dos projetos presentes antes de executar JavaScript.
- JavaScript inicial pequeno, sem framework no navegador.
- Player HLS na versão light, importado dinamicamente só após o visitante abrir um filme.
- Nove vídeos completos em 720 × 1280, H.264/AAC, segmentados em aproximadamente quatro segundos; uma resolução por vídeo (não é streaming com múltiplas qualidades).
- Buffer do player limitado a aproximadamente 12 segundos, sem conservar grande histórico.
- Capas AVIF com fallback WebP em 360, 480 e 720 px; tamanhos declarados conforme as duplas, dimensões reservadas e lazy loading.
- Primeiro carrega a imagem de abertura. Após o load e mais 1,8 s, uma única prévia silenciosa de cinco segundos pode começar, também no celular. Economia de dados, 2G e movimento reduzido desativam esse início automático. No desktop, hover troca/inicia prévias; no celular, toque. Há controle Pausar/Reproduzir.
- Prévias param e liberam a fonte ao sair da tela, trocar seleção ou ocultar a aba. O player completo é destruído ao fechar o diálogo ou trocar de filme.
- Fontes locais, `font-display: swap`; preload apenas da fonte dos títulos.
- CSS/JS com nomes derivados do conteúdo e cache de um ano. Mídia em caminhos versionados (`v1` para HLS, `v2` para capas/prévias), também com cache de um ano. HTML revalidado pelo comportamento padrão do Netlify. Open Graph com cache curto.

**Ao alterar mídia, use uma nova versão no caminho (ou hashes de conteúdo) e atualize as regras de cache.** Não substitua um arquivo publicado por conteúdo diferente mantendo URL imutável. Ao mudar o domínio, atualize canonical, Open Graph, robots e sitemap.

`npm run check` verifica o orçamento inicial de HTML/CSS/JS, fontes WOFF2 reais, posters e integridade dos manifests/segmentos dos nove filmes. `performance-check.json` registra os tamanhos; não é um teste de Lighthouse nem uma medição de conexão móvel real.

Documentação de referência para cache: https://docs.netlify.com/build/caching/caching-overview/.

## Fontes originais

Os arquivos originais, cerca de 3,915 GB, permanecem na pasta de Lucas. Este repositório contém apenas as cópias otimizadas para o site, cerca de 289 MB de vídeo. Esse total não é baixado na entrada da página: a mídia completa é transmitida apenas conforme a reprodução solicitada.

O perfil PDF e a referência visual são materiais de briefing e não fazem parte da pasta pública.

## Revisão de identidade e carregamento

Nome: Lucas Gil Films. Instagram e YouTube: `lghfilms`. TikTok permanece desativado em `src/site.js` até ter o perfil confirmado. O telefone abre WhatsApp com a mensagem “Lucas, me ajuda com um filme?”.

O domínio definitivo é `lucasgilfilms.com`. Canonical, Open Graph, dados estruturados, robots e sitemap derivam de `src/site.js`. A antiga variável `SITE_URL` não sobrescreve essa fonte; isso evita publicar referências ao subdomínio temporário por uma configuração de build desatualizada.

A imagem `og-home-v3.jpg` tem 1200 × 630 e 56.555 bytes (JPEG progressivo). A URL nova evita reutilizar a arte antiga em novos compartilhamentos. O tom de superfície laranja é mais profundo para preservar a leitura do texto branco; os acentos mantêm #FA6404.

O relatório fornecido em 08/09/2026 foi executado em `127.0.0.1:5173` (Vite de desenvolvimento): desempenho 83, FCP 2,5 s e LCP 4,2 s. Incluía cliente Vite e extensões do navegador. As capas superdimensionadas e os nomes acessíveis dos botões foram corrigidos. A versão compilada usa aproximadamente 17,3 KB de HTML/CSS/JS comprimidos; as três capas principais AVIF mais ambas as fontes somam 71 KB, antes 179 KB. Esses números são tamanhos de arquivos, não uma nova nota de Lighthouse.

Validação: build, orçamento/integridade de mídia; layout centralizado em 2560 × 1080; prévia por toque, abertura e reprodução do filme completo, menu, navegação e cores em 390 × 844. O menu respeita movimento reduzido.

## Brand book, movimento e som

A página `/brandbook/` reúne a assinatura tipográfica, a paleta, as fontes, aplicações em cartão, story e cartela de vídeo, além de Open Graph e YAML copiável/baixável. O arquivo `/brand.yaml` é gerado a partir de `src/brand.css` e `src/site.js` durante o build. As aplicações são demonstrações em HTML/CSS.

O hero usa “Um novo olhar”, com entrada por máscara, traço e um detalhe orbital em CSS. O contato entra ao chegar à tela. O cabeçalho é fixo, com a descrição alinhada ao centro junto do logo e ícone cinza de WhatsApp. `src/motion.css` concentra esses ajustes.

A trilha original de oito compassos está em `src/ambient.js`: harmonia, baixo e melodia sintetizados com Web Audio, sem gravações de terceiros. Só inicia pelo botão Som ambiente, toca dois ciclos (cerca de 51 segundos) e para, podendo ser religada. O módulo de aproximadamente 0,85 KB comprimido só é importado ao ligar o som. Abrir um filme ou ocultar a aba interrompe a trilha.

O cabeçalho desktop conserva o fundo transparente e o mesmo espaçamento ao rolar. O tratamento de fundo após a abertura se aplica somente ao celular.

O brand book tem um compartilhamento próprio: `og-brandbook-v2.jpg`, com “Brand book” na imagem, no título Open Graph/Twitter e na descrição. A arte geral do portfólio segue independente.


Os dois Open Graphs usam agora a assinatura tipográfica real em minúsculas, com o ponto laranja. A home pesa 56.555 bytes; o brand book, 23.639 bytes, em uma composição sem fotografia, com paleta e amostra tipográfica. Os SVGs editáveis estão em `design/`. `scripts/build-og.py` usa FontTools para preservar os contornos da fonte local; `scripts/render-og.cjs` usa Sharp para exportar JPEG otimizado. Nenhuma dessas dependências entra no navegador ou no build normal do site.
