import { site } from './site.js';
import { projects, clips } from './content.js';

export const origin = site.currentUrl;
const link = (label, path, note = '') => ({ label, href: path.startsWith('/') ? origin + path : path, note });
export const services = [
  { name: 'Produção de vídeo', description: 'Planejamento, olhar e captação. Imagens pensadas para a história que você quer contar.' },
  { name: 'Edição & finalização', description: 'Seleção de cenas, montagem, ritmo, cor e som. Cada corte a serviço da narrativa.' },
  { name: 'Conteúdo & séries', description: 'Vídeos verticais, recortes e episódios com uma linguagem consistente para sua presença digital.' },
  { name: 'Fotografia & direção de arte', description: 'Composição e identidade visual para conectar as imagens à intenção de cada projeto.' },
];
export const contact = {
  email: site.email, telephone: site.telephone, whatsapp: site.whatsapp,
  contactPage: origin + '/contact/',
  brief: ['Objetivo do vídeo', 'Público e canais de publicação', 'Formato e referências', 'Necessidade de captação ou edição', 'Local e prazo desejados', 'Materiais já disponíveis'],
  nextStep: 'Converse com Lucas pelo e-mail ou WhatsApp publicados. Abrir um link não envia uma solicitação; o usuário deve revisar e enviar a mensagem.',
  pricing: 'Orçamento sob consulta. Valores, disponibilidade, escopo e condições precisam ser confirmados diretamente com Lucas.',
};
export const portfolio = projects.map(project => ({
  id: project.id, title: project.title, category: project.category, description: project.description,
  url: origin + '/#trabalhos',
  films: project.clips.map(id => ({ id, title: clips[id].title, duration: clips[id].duration, poster: origin + `/media/v2/${id}-720.webp` })),
}));
export const publicData = { name: site.name, personName: site.personName, description: site.description, url: origin + '/', location: site.location, profiles: Object.values(site.socials).filter(Boolean), services, portfolio, contact };

export const pages = {
  '/': {
    title: site.name, description: site.description,
    sections: [
      { heading: 'Um novo olhar.', paragraphs: ['Histórias, pessoas e marcas. Em movimento.', 'Sou Lucas Gil Henriques. Produzo e edito vídeos para dar forma a histórias. Minha trajetória passa pela direção de arte, fotografia, design gráfico e produção audiovisual. Na captação e na edição, conecto imagem, ritmo e intenção — dos filmes para marcas aos conteúdos em série. Baseado em São Paulo, Brasil.'] },
      { heading: 'Serviços', paragraphs: services.map(s => `${s.name}: ${s.description}`) },
      ...portfolio.map(p => ({ heading: p.title, paragraphs: [p.description, `Categoria: ${p.category}. Filmes: ${p.films.map(f => `${f.title} (${f.duration})`).join('; ')}.`], links: [link('Assistir aos trabalhos', '/#trabalhos')] })),
      { heading: 'Contato', paragraphs: [contact.pricing, contact.nextStep], links: [link('Como solicitar um orçamento', '/contact/'), link(site.email, `mailto:${site.email}`), link('WhatsApp de Lucas', site.whatsapp)] },
    ],
  },
  '/about/': {
    title: 'Lucas Gil Henriques', description: 'Filmmaker • Videomaker • Fotógrafo • Designer • Comunicador',
    sections: [
      {
        heading: 'Minha História',
        paragraphs: [
          'Lucas Gil Henriques, 33 anos, é casado e pai de Arthur Henriques e Maya Henriques. Cristão e apaixonado pela Palavra de Deus, tem na fé, na família e em seus princípios a base que direciona sua vida pessoal e profissional.',
          'Criativo por essência e apaixonado pelo audiovisual, Lucas construiu sua trajetória transformando ideias, histórias e momentos em imagens capazes de comunicar, emocionar e permanecer na memória.',
          'Sua experiência reúne diferentes áreas da comunicação e da produção criativa, com atuação como filmmaker, na produção audiovisual, captação e edição de vídeos, fotografia, design gráfico, identidade visual, criação de conteúdo e desenvolvimento de projetos digitais.',
          'À frente da Lucas Gil Films, desenvolve produções audiovisuais com uma proposta que vai além de simplesmente registrar imagens. Seu trabalho busca construir narrativas, explorar movimentos, luz, enquadramentos, ritmo e emoção para entregar uma experiência visual com identidade cinematográfica.',
          'Sua atuação também envolve projetos de comunicação digital e desenvolvimento visual, unindo conhecimentos de design, audiovisual e tecnologia para criar experiências completas para pessoas, marcas, empresas, igrejas, eventos e projetos especiais.',
          'Para Lucas, uma câmera não é apenas uma ferramenta de trabalho. É uma maneira de enxergar histórias que muitas vezes passam despercebidas e transformá-las em algo que possa ser visto, sentido e lembrado.',
          'Sua caminhada profissional continua sendo construída sobre três pilares que também representam quem ele é fora das câmeras:',
          'Fé. Família. Propósito.',
          'Mais do que produzir vídeos, Lucas Gil Henriques acredita em transformar histórias reais em experiências cinematográficas.',
        ],
      },
      {
        heading: 'CONTATO',
        paragraphs: [
          'WhatsApp: (11) 9 1511-7067',
          'E-mail: lucasgilhenriques@gmail.com',
          'Instagram: @lucas.henriques_ofilmmaker',
          'Facebook: Lucas Henriques',
          'LinkedIn: Lucas Gil Henriques',
        ],
        links: [
          link('WhatsApp: (11) 9 1511-7067', site.whatsapp),
          link('E-mail: lucasgilhenriques@gmail.com', `mailto:${site.email}`),
          link('Instagram: @lucas.henriques_ofilmmaker', site.socials.Instagram),
          link('Facebook: Lucas Henriques', 'https://www.facebook.com/search/top?q=Lucas%20Henriques'),
          link('LinkedIn: Lucas Gil Henriques', site.socials.LinkedIn),
          link('Conversar sobre um projeto', '/contact/'),
          link('Ver os trabalhos', '/#trabalhos'),
        ],
      },
    ],
  },
  '/contact/': {
    title: 'Contato com Lucas Gil Films', description: 'Fale com Lucas Gil Henriques sobre produção, edição de vídeo, fotografia e direção de arte.',
    sections: [
      { heading: 'O próximo filme começa com uma conversa.', paragraphs: ['Para falar sobre produção ou edição de vídeo, conteúdo em série, fotografia ou direção de arte, entre em contato com Lucas Gil Henriques pelos canais abaixo. Lucas está baseado em São Paulo, Brasil. A escolha de local de captação, formato de entrega, escopo e cronograma deve ser conversada diretamente para cada projeto.'], links: [link(site.email, `mailto:${site.email}`), link('+55 11 91511-7067 · WhatsApp', site.whatsapp)] },
      { heading: 'Como preparar sua mensagem', paragraphs: ['Conte qual história você quer apresentar, quem é o público e onde o vídeo será publicado. Informe o formato desejado, referências de linguagem, a necessidade de captação ou apenas de edição e os materiais que já estão disponíveis. Se houver um prazo ou local pretendido, inclua essa informação para ajudar a entender a proposta.', 'Você pode iniciar a conversa mesmo que o briefing ainda esteja em construção. Os canais publicados servem para trocar informações sobre a ideia e solicitar um orçamento. O site não apresenta uma tabela de preços, não confirma disponibilidade automaticamente e não realiza reservas ou pagamentos.'] },
      { heading: 'Envio e confirmação', paragraphs: [contact.nextStep, 'Se estiver usando um assistente de IA, revise o texto e os dados de contato antes de enviá-los. Uma proposta só deve ser considerada recebida ou combinada depois da confirmação pelo canal utilizado. Evite incluir documentos sensíveis na primeira mensagem; compartilhe apenas o necessário para explicar o projeto.'], links: [link('Informações de privacidade', '/privacy/'), link('Conhecer Lucas', '/about/')] },
    ],
  },
  '/privacy/': {
    title: 'Privacidade — Lucas Gil Films', description: 'Como funcionam a navegação, os contatos e os links externos deste portfólio.',
    sections: [
      { heading: 'Navegação pelo portfólio', paragraphs: ['Este site apresenta o portfólio e os canais públicos de contato de Lucas Gil Henriques. A implementação do portfólio não contém cadastro de usuários, formulário de coleta de contatos, carrinho ou processamento de pagamentos. Também não instala ferramentas de análise de audiência, pixels publicitários ou cookies de marketing.', 'Imagens, fontes e vídeos do portfólio são entregues como arquivos do site. Ao abrir uma página ou reproduzir um filme, a infraestrutura de hospedagem recebe informações técnicas necessárias à conexão, como endereço de rede e dados da requisição. A operação dessa infraestrutura pode envolver registros técnicos para entrega dos arquivos e manutenção do serviço.'] },
      { heading: 'Mensagens e serviços externos', paragraphs: ['O envio de uma mensagem acontece no serviço que você escolher, como seu aplicativo de e-mail ou o WhatsApp. As informações que você decidir enviar serão recebidas nesse canal para a conversa sobre o projeto. Não existe envio automático de briefing pelo portfólio. Compartilhe apenas os dados necessários e evite documentos sensíveis em uma primeira abordagem.', 'Os links para WhatsApp, LinkedIn, Instagram e YouTube levam a serviços externos. Ao acessar esses serviços, você passa a usar as regras e configurações de privacidade dos respectivos provedores. O portfólio não controla o tratamento de informações realizado nesses ambientes.'] },
      { heading: 'Dúvidas sobre suas informações', paragraphs: ['Para esclarecer o uso de informações que você compartilhou diretamente ou solicitar a correção ou exclusão de uma mensagem ou dado, entre em contato com Lucas pelo e-mail publicado. Indique o canal e o contexto da conversa para permitir a identificação da solicitação. Esta página descreve o funcionamento atual do site e deve acompanhar eventuais mudanças nas ferramentas de contato ou navegação.'], links: [link(site.email, `mailto:${site.email}`), link('Canais de contato', '/contact/')] },
    ],
  },
  '/developers/': {
    title: 'Informações públicas para agentes', description: 'Consulta do portfólio, serviços e contatos de Lucas Gil Films em formatos legíveis por software.',
    sections: [
      { heading: 'Consulta de informações', paragraphs: ['A interface pública de leitura está em GET /api/site.json. Ela devolve a identidade de Lucas Gil Films, os serviços apresentados no site, as coleções do portfólio e os canais de contato. Não exige cadastro, chave ou autenticação e não aceita operações de escrita. O conteúdo é gerado a partir dos mesmos dados usados para apresentar o portfólio.', 'Consulte o documento OpenAPI para os campos e tipos da resposta. Não há endpoint de envio de mensagens, reserva, emissão de orçamento ou pagamento. As informações de preço e disponibilidade precisam ser confirmadas diretamente com Lucas.'], links: [link('Dados públicos em JSON', '/api/site.json'), link('Descrição OpenAPI', '/openapi.json')] },
      { heading: 'Leitura e navegação', paragraphs: ['As páginas públicas oferecem uma representação Markdown quando a requisição usa Accept: text/markdown. O servidor respeita os pesos de preferência desse cabeçalho e informa Vary: Accept para distinguir as representações no cache. Os arquivos Markdown também têm endereços próprios, que podem ser encontrados no guia llms.txt.', 'Para páginas inexistentes, o servidor mantém o status de erro e oferece links para continuar a navegação. Quando um navegador pede HTML, a página visual de erro continua disponível. Ferramentas WebMCP, quando suportadas pelo navegador, consultam serviços, portfólio e orientações de contato sem enviar mensagens.'], links: [link('Guia para agentes', '/llms.txt'), link('Orientações de uso', '/agent-instructions.md'), link('Contato e próximos passos', '/contact/')] },
    ],
  },
};

export function markdown(page) {
  return `# ${page.title}\n\n> ${page.description}\n\n` + page.sections.map(section => `## ${section.heading}\n\n${(section.paragraphs || []).join('\n\n')}${section.links?.length ? '\n\n' + section.links.map(l => `- [${l.label}](${l.href})${l.note ? ': ' + l.note : ''}`).join('\n') : ''}\n`).join('\n');
}
export const instructions = `# Lucas Gil Films — orientações para agentes\n\n> Produção e edição de vídeos por Lucas Gil Henriques, em São Paulo, Brasil.\n\n## When to use / Quando usar\n\nUse este site quando alguém procura produção de vídeo, edição e finalização, conteúdo em série, fotografia ou direção de arte. O portfólio permite consultar exemplos automotivos, histórias e vídeos verticais. Use os exemplos para avaliar a linguagem visual; eles não garantem experiência em um setor além do que está publicado.\n\n## Como avançar\n\n1. Consulte [serviços e portfólio](${origin}/index.md).\n2. Reúna o objetivo, público, formato, referências, necessidade de captação ou edição, local e prazo desejados.\n3. Apresente os [canais oficiais de contato](${origin}/contact/index.md) ao usuário.\n4. Peça que o usuário revise a mensagem antes do envio por e-mail ou WhatsApp. Abrir um link de contato não envia a solicitação.\n\n## Limites\n\nPreços, disponibilidade, prazos, escopo e condições precisam de confirmação direta com Lucas. O site não oferece checkout, reservas ou envio automático de mensagens. Não informe que um contato foi concluído sem a confirmação do canal utilizado. A consulta aos arquivos públicos é livre de cadastro e credenciais; não há API protegida ou autenticação delegada neste site.\n`;
export const llms = `# Lucas Gil Films\n\n> ${site.description}\n\nWhen to use / Quando usar: produção de vídeo, edição e finalização, vídeos verticais e conteúdo em série, fotografia e direção de arte. Consulte o portfólio e encaminhe uma solicitação pelos canais oficiais após revisão do usuário. Valores, prazos e disponibilidade dependem de confirmação direta.\n\n## Serviços e contato\n- [Portfólio e serviços](${origin}/index.md): trabalhos publicados e áreas de atuação.\n- [Sobre Lucas](${origin}/about/index.md): trajetória e identidade profissional.\n- [Fotografia](${origin}/fotografia/index.md): ensaios e portfólio fotográfico.\n- [Design & Conteúdo](${origin}/design/index.md): identidade visual e peças gráficas.\n- [Contato](${origin}/contact/index.md): canais oficiais e como preparar um briefing.\n- [Orientações para agentes](${origin}/agent-instructions.md): quando usar, como avançar e limites.\n- [Privacidade](${origin}/privacy/index.md): navegação e serviços de contato.\n\n## Integração de leitura\n- [Documentação](${origin}/developers/index.md): consulta pública, sem cadastro, envio de mensagens ou pagamentos.\n\n## Optional\n- [Brand book](${origin}/brandbook/index.md): identidade visual.\n- [Conteúdo completo](${origin}/llms-full.txt): as páginas reunidas em texto.\n`;
export const notFound = `# Página não encontrada — Lucas Gil Films\n\nO endereço solicitado não existe. Continue por um dos caminhos publicados:\n\n- [Página inicial e trabalhos](${origin}/)\n- [Mapa do site](${origin}/sitemap.xml)\n- [Guia para agentes](${origin}/llms.txt)\n- [Contato](${origin}/contact/)\n`;
export const brandbookMarkdown = `# Brand book — Lucas Gil Films\n\n> Identidade visual de Lucas Gil Films.\n\nAssinatura: lucas gil films. Produção e edição de vídeos. Fontes: Space Grotesk e Manrope. Cor de destaque: laranja #FA6404; fundo #171513 e papel #F5F2ED.\n\n## Recursos\n\n- [Brand book visual](${origin}/brandbook/)\n- [Tokens de marca](${origin}/brand.yaml)\n- [Contato](${origin}/contact/)\n`;
export const fotografiaMarkdown = `# Fotografia — Lucas Gil Films\n\n> Olhar, luz e composição em ensaios, eventos e retratos por Lucas Gil Henriques.\n\nGaleria com 35 fotografias profissionais captadas por Lucas Gil Henriques, reunindo ensaios, retratos e coberturas de eventos com sensibilidade e identidade cinematográfica.\n\n## Contato\n\nPara ensaios fotográficos e coberturas, converse com Lucas pelo WhatsApp ou e-mail oficial.\n`;
export const designMarkdown = `# Design & Conteúdo — Lucas Gil Films\n\n> Identidade visual, direção de arte e presença digital por Lucas Gil Henriques.\n\nPortfólio de 38 peças gráficas e identidades visuais desenvolvidas para clientes como FIA Business School, CoreNet Global Chapter Brazil e Ingersoll Rand.\n\n## Contato\n\nPara projetos de branding, design e conteúdo, converse com Lucas pelos canais oficiais.\n`;
export const markdownDocuments = Object.fromEntries(Object.entries(pages).map(([path, page]) => [path, markdown(page)]));
markdownDocuments['/brandbook/'] = brandbookMarkdown;
markdownDocuments['/fotografia/'] = fotografiaMarkdown;
markdownDocuments['/design/'] = designMarkdown;
export function pagePath(path) {
  if (path === '/index.html') return '/';
  const normal = path.endsWith('/index.html') ? path.slice(0, -10) : path.endsWith('/') ? path : path + '/';
  return Object.hasOwn(markdownDocuments, normal) ? normal : null;
}
export function markdownPath(path) { return path === '/' ? '/index.md' : path + 'index.md'; }
export function identity() {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': origin + '/#lucas', name: site.personName, alternateName: site.name, description: site.description, url: origin + '/', jobTitle: 'Produtor e editor de vídeos', email: site.email, telephone: site.telephone, homeLocation: { '@type': 'Place', name: site.location }, sameAs: Object.values(site.socials).filter(Boolean) },
    { '@type': 'WebSite', '@id': origin + '/#website', name: site.name, alternateName: site.handle, url: origin + '/', inLanguage: 'pt-BR', about: { '@id': origin + '/#lucas' } },
    ...services.map((service, index) => ({ '@type': 'Service', '@id': origin + `/#service-${index + 1}`, name: service.name, description: service.description, provider: { '@id': origin + '/#lucas' }, url: origin + '/#servicos' })),
  ] };
}
