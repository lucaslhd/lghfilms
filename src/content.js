// Lucas Gil Films V2 — dez filmes novos aprovados.
export const clips = Object.fromEntries(Array.from({length:10},(_,i)=>{const n=String(i+1).padStart(2,'0');return [`film${n}`,{title:`Film ${n}`,duration:'—'}]}));
const themes=[
 ['AUTOMOTIVO','DETALHES QUE ACELERAM','Design, performance e presença em cada frame.'],
 ['AUTOMOTIVO','LUXO EM CADA DETALHE','Acabamento, tecnologia e experiência traduzidos em imagem.'],
 ['FILME 03','EM ANÁLISE','Capa definitiva será criada a partir do conteúdo real do filme.'],
 ['ODONTOLOGIA','PRECISÃO QUE TRANSFORMA','Tecnologia, cuidado e confiança em uma narrativa visual precisa.'],
 ['ODONTOLOGIA','CONFIANÇA EM CADA SORRISO','Pessoas, atendimento e transformação apresentados com autenticidade.'],
 ['EVENTO & ARTE','IDEIAS EM MOVIMENTO','Cultura, criatividade e experiência transformadas em filme.'],
 ['FILME 07','EM ANÁLISE','Capa definitiva será criada a partir do conteúdo real do filme.'],
 ['AUTOMOTIVO','FORÇA EM CADA DETALHE','Chevrolet, identidade e movimento em uma estética cinematográfica.'],
 ['LIFESTYLE','O QUE REALMENTE IMPORTA','Momentos simples. Grandes histórias.'],
 ['MAKING OF','POR TRÁS DAS CÂMERAS','O processo que dá vida às grandes histórias.']
];
export const projects=themes.map((t,i)=>{const n=String(i+1).padStart(2,'0');return{id:`film${n}`,number:n,category:t[0],label:t[0],title:t[1],description:t[2],posters:[`film${n}`],clips:[`film${n}`],tone:'red'}});
export const media=(id,suffix='720.webp')=>`/media/v3/${id}-${suffix}`;
