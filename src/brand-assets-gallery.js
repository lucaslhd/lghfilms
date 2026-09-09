(() => {
 const library=document.querySelector('.asset-library');if(!library)return;
 const root=library.dataset.root||'/brand-assets/v1/';
 if(location.protocol==='file:'){const zip=library.querySelector('.asset-kit-download');if(zip)zip.hidden=true;}
 const groupNames={logos:'Logos',avatares:'Avatares',capas:'Capas',redes:'Redes sociais',video:'Vídeo',icones:'Ícones',documentos:'Documentos e modelos',papelaria:'Papelaria',fontes:'Fontes'};
 const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
 async function init(){
  const data=window.LGH_BRAND_ASSETS||await fetch(root+'assets-manifest.json').then(r=>{if(!r.ok)throw Error();return r.json();});
  const assets=data.assets;let group='all',query='',limit=18;
  const filters=library.querySelector('.asset-filters'),grid=library.querySelector('.asset-grid'),count=library.querySelector('.asset-count'),more=library.querySelector('.asset-more');
  for(const [id,label]of [['all','Tudo'],...Object.entries(groupNames)]){const b=el('button','asset-filter',label);b.type='button';b.dataset.group=id;b.setAttribute('aria-pressed',String(id==='all'));b.addEventListener('click',()=>{group=id;limit=18;filters.querySelectorAll('button').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));draw();});filters.append(b);}
  const preferred=['lgh-avatar-master-laranja','lgh-assinatura-principal-claro','lgh-template-apresentacoes','lgh-proposta-comercial','lgh-kit-producao','lgh-header-linkedin-pessoal'];
  const ordered=[...assets].sort((a,b)=>{const x=preferred.indexOf(a.id),y=preferred.indexOf(b.id);return(x<0?999:x)-(y<0?999:y);});
  function draw(){
   const list=ordered.filter(a=>(group==='all'||a.group===group)&&norm(a.label+' '+a.usage+' '+a.id).includes(query));grid.replaceChildren();count.textContent=`${list.length} ${list.length===1?'peça disponível':'peças disponíveis'}`;
   for(const a of list.slice(0,limit)){
    const card=el('article','asset-card'),preview=el('a','asset-preview');preview.href=root+a.preview;preview.target='_blank';preview.rel='noopener';preview.setAttribute('aria-label','Ver prévia de '+a.label);
    const img=el('img');img.src=root+a.preview;img.alt=a.label;img.loading='lazy';img.width=960;img.height=600;preview.append(img);card.append(preview);
    const content=el('div','asset-card-content');content.append(el('p','asset-category',groupNames[a.group]||a.group),el('h3',null,a.label),el('p','asset-usage',a.usage));
    if(a.width&&a.height)content.append(el('p','asset-size',`${a.width} × ${a.height} px`));
    const downloads=el('div','asset-downloads');for(const file of a.files){const link=el('a',null,file.split('.').pop().toUpperCase()+' ↓');link.href=root+file;link.download=file.split('/').pop();link.setAttribute('aria-label','Baixar '+a.label+' em '+file.split('.').pop());downloads.append(link);}content.append(downloads);
    if(a.notes){const details=el('details','asset-notes');details.append(el('summary',null,'Como usar'),el('p',null,a.notes));content.append(details);}
    card.append(content);grid.append(card);
   }
   more.hidden=list.length<=limit;
  }
  library.querySelector('input[type="search"]').addEventListener('input',e=>{query=norm(e.target.value.trim());limit=18;draw();});
  more.addEventListener('click',()=>{limit+=18;draw();});draw();
 }
 init().catch(()=>{library.querySelector('.asset-count').textContent='Não foi possível carregar a galeria. O pacote completo continua disponível para download.';});
})();
