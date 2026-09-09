// Edit the public titles and group related films here. Source filenames stay in docs only.
export const clips = {
  corvette: { title: 'Corvette', duration: '0:24' },
  g63: { title: 'Mercedes G63', duration: '0:32' },
  encontro: { title: 'Mercedes · Apresentação', duration: '8:59' },
  alice: { title: 'Alice · Transformação', duration: '1:00' },
  enoque: { title: 'Enoque · Parte 2', duration: '1:39' },
  narrativa: { title: 'Uma história para contar', duration: '2:27' },
  palco: { title: 'Em cena', duration: '2:19' },
  cafe: { title: 'Café de pastores', duration: '3:41' },
  fontes: { title: 'Fontes de Sião', duration: '2:46' },
};
export const projects = [
  { id: 'automotivo', number: '01', category: 'Automotivo', label: 'FILMES AUTOMOTIVOS', title: 'Design em movimento.', description: 'Linhas, detalhes e presença. Uma seleção de filmes e apresentações automotivas.', posters: ['corvette', 'g63'], clips: ['corvette', 'g63', 'encontro'], tone: 'coral' },
  { id: 'transformacao', number: '02', category: 'Histórias', label: 'ALICE · TRANSFORMAÇÃO', title: 'Histórias que transformam.', description: 'Pessoas no centro da narrativa. Um filme sobre a transformação de Alice.', posters: ['alice'], clips: ['alice'], tone: 'rose' },
  { id: 'series', number: '03', category: 'Conteúdo & séries', label: 'CONTEÚDO & SÉRIES', title: 'Cada ideia, uma narrativa.', description: 'Falas e ideias ganham ritmo, edição e legendas em uma coleção de vídeos verticais.', posters: ['narrativa', 'cafe'], clips: ['enoque', 'narrativa', 'palco', 'cafe'], tone: 'yellow' },
  { id: 'fontes', number: '04', category: 'Conteúdo & séries', label: 'FONTES DE SIÃO', title: 'A energia do encontro.', description: 'Pessoas, apresentações e momentos de um encontro, registrados em vídeo.', posters: ['fontes'], clips: ['fontes'], tone: 'orange' },
];
export const media = (id, suffix = '720.webp') => `/media/v2/${id}-${suffix}`;
