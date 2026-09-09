const status=document.querySelector('#copy-status');
async function copy(value,message){
 try{await navigator.clipboard.writeText(value);status.textContent=message;}
 catch{status.textContent='Selecione o texto abaixo para copiar manualmente.';document.querySelector('pre').focus();}
}
document.querySelector('#copy-yaml').addEventListener('click',()=>copy(document.querySelector('#brand-yaml').textContent,'YAML copiado.'));
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
 const color=button.dataset.copy;
 try{await navigator.clipboard.writeText(color);const label=button.querySelector('strong');label.textContent='Copiado ✓';setTimeout(()=>{label.textContent=color;},1300);}
 catch{status.textContent=`Cor selecionada: ${color}`;}
}));
