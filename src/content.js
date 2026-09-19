// Lucas Gil Films V2 — dez filmes novos aprovados.
export const clips = Object.fromEntries(Array.from({length:10},(_,i)=>{const n=String(i+1).padStart(2,'0');return [`film${n}`,{title:`Film ${n}`,duration:'—'}]}));
const themes=[
 ['AUTOMOTIVO','SUPERCARROS','Paixão sobre rodas. Performance em outro nível.'],
 ['CASAMENTO','UM DIA PARA SEMPRE','Emoção em cada detalhe. Histórias de amor reais.'],
 ['EVENTOS','PROPÓSITO EM MOVIMENTO','Eventos que inspiram e deixam legado.'],
 ['DOCUMENTÁRIO','VIDAS REAIS','Histórias que precisam ser contadas.'],
 ['DRONE','OUTRA PERSPECTIVA','O mundo visto de cima. Beleza em cada ângulo.'],
 ['INSTITUCIONAL','MARCAS QUE CONSTROEM','Mais que empresas, pessoas e propósitos.'],
 ['BEAUTY','BELEZA EM MOVIMENTO','Estética, sensibilidade e autenticidade.'],
 ['GASTRONOMIA','SABORES QUE INSPIRAM','Experiências que despertam os sentidos.'],
 ['LIFESTYLE','O QUE REALMENTE IMPORTA','Momentos simples. Grandes histórias.'],
 ['MAKING OF','POR TRÁS DAS CÂMERAS','O processo que dá vida às grandes histórias.']
];
export const projects=themes.map((t,i)=>{const n=String(i+1).padStart(2,'0');return{id:`film${n}`,number:n,category:t[0],label:t[0],title:t[1],description:t[2],posters:[`film${n}`],clips:[`film${n}`],tone:'red'}});
export const media=(id,suffix='720.webp')=>`/media/v3/${id}-${suffix}`;
