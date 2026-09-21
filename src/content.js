// Lucas Gil Films V2 — seis filmes novos aprovados.
export const clips = Object.fromEntries(['01','02','04','05','06','08'].map(n=>[`film${n}`,{title:`Film ${n}`,duration:'—'}]));
const themes=[
 ['01','AUTOMOTIVO','MERCEDES-BENZ COUPE','Direção, sofisticação e narrativa cinematográfica em cada detalhe.'],
 ['02','AUTOMOTIVO','AUDI Q8 BLACK EDITION','Design imponente, tecnologia e excelência traduzidos em imagem.'],
 ['04','AUTOMOTIVO','BRABUS 800 WIDESTAR','Exclusividade, customização artesanal e presença marcante em cada detalhe.'],
 ['05','ODONTOLOGIA','CONFIANÇA EM CADA SORRISO','Pessoas, atendimento e transformação apresentados com autenticidade.'],
 ['06','EVENTO & BRANDING','PRÊMIO ABC 2025','Cobertura audiovisual, prestígio e celebração das maiores mentes da comunicação.'],
 ['08','AUTOMOTIVO','FORÇA EM CADA DETALHE','Chevrolet, identidade e movimento em uma estética cinematográfica.']
];
export const projects=themes.map((t,i)=>({id:`film${t[0]}`,number:String(i+1).padStart(2,'0'),category:t[1],label:t[1],title:t[2],description:t[3],posters:[`film${t[0]}`],clips:[`film${t[0]}`],tone:'red'}));
export const media=(id,suffix='720.webp')=>`/media/v3/${id}-${suffix}`;
