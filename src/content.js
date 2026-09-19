// Lucas Gil Films V2 — somente os dez filmes novos aprovados.
export const clips = Object.fromEntries(
  Array.from({length:10},(_,i)=>{
    const n=String(i+1).padStart(2,'0');
    return [`film${n}`,{title:`Film ${n}`,duration:'—'}];
  })
);

export const projects = Array.from({length:10},(_,i)=>{
  const n=String(i+1).padStart(2,'0');
  return {
    id:`film${n}`, number:n, category:'Filmes',
    label:'SELECTED WORK', title:`Film ${n}`,
    description:'Direção, captação e edição por Lucas Gil Films.',
    posters:[`film${n}`], clips:[`film${n}`], tone:'red'
  };
});

export const media = (id, suffix='720.webp') => `/media/v3/${id}-${suffix}`;
