import { clips, projects, media } from './content.js';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
$('#year').textContent=String(new Date().getFullYear());
const grid=$('.film-grid');
for(const project of projects){
 const article=document.createElement('article'); article.className='project-card reveal';
 article.innerHTML=`<button class="project-open" data-project="${project.id}" aria-label="Abrir ${project.title}"><div class="project-visual"></div><div class="project-caption"><div><span>FILM ${project.number}</span><h3>${project.title}</h3></div><span>PLAY ↗</span></div></button>`;
 grid.append(article);
}
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-inview');observer.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));
const menu=$('.menu-dialog'), toggle=$('.menu-toggle');
toggle.addEventListener('click',()=>menu.showModal()); $('.menu-close').addEventListener('click',()=>menu.close()); $$('a',menu).forEach(a=>a.addEventListener('click',()=>menu.close()));
const dialog=$('.film-dialog'),player=$('#film-player'),status=$('.video-status'),retry=$('.retry-video'); let current=null,hls=null;
function stop(){player.pause();if(hls){hls.destroy();hls=null}player.removeAttribute('src');player.load()}
async function play(id){stop();current=id;player.poster=media(id);status.textContent='Carregando filme…';retry.hidden=true;const url=`/media/v3/${id}/index.m3u8`;try{if(player.canPlayType('application/vnd.apple.mpegurl'))player.src=url;else{const {default:Hls}=await import('hls.js/dist/hls.light.mjs');if(!Hls.isSupported())throw Error();hls=new Hls({maxBufferLength:12,maxMaxBufferLength:20});hls.loadSource(url);hls.attachMedia(player)}await player.play().catch(()=>status.textContent='Toque em reproduzir para assistir.')}catch{status.textContent='O filme otimizado ainda está sendo preparado para a V2.';retry.hidden=false}}
function openFilm(id){const p=projects.find(x=>x.id===id);if(!p)return;$('.film-category').textContent=`FILM ${p.number}`;$('#film-title').textContent=p.title;$('#film-description').textContent=p.description;dialog.showModal();play(id)}
$$('[data-project]').forEach(b=>b.addEventListener('click',()=>openFilm(b.dataset.project)));$('.film-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',stop);retry.addEventListener('click',()=>play(current));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
if(matchMedia('(hover:hover) and (pointer:fine)').matches){$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')})}
