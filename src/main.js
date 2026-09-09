import { clips, projects, media } from './content.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
$('#year').textContent = String(new Date().getFullYear());

// Native dialog keeps keyboard focus inside the animated mobile menu.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = $('.menu-dialog'), menuToggle = $('.menu-toggle');
let closeMenuTimer;
menuToggle.addEventListener('click', () => {
  clearTimeout(closeMenuTimer); menu.classList.remove('is-closing');
  menu.showModal(); menuToggle.setAttribute('aria-expanded','true');
  document.body.classList.add('dialog-open'); stopPreviews();
});
function closeMenu() {
  if (!menu.open || menu.classList.contains('is-closing')) return;
  if (reducedMotion.matches) { menu.close(); return; }
  menu.classList.add('is-closing'); closeMenuTimer=setTimeout(()=>menu.close(),140);
}
$('.menu-close').addEventListener('click', closeMenu);
$$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
menu.addEventListener('close', () => {
  clearTimeout(closeMenuTimer); menu.classList.remove('is-closing');
  menuToggle.setAttribute('aria-expanded','false'); document.body.classList.remove('dialog-open');
});

$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  stopPreviews();
  const filter = button.dataset.filter;
  $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  let count = 0;
  $$('.project-card').forEach(card => { card.hidden = filter !== 'Todos' && card.dataset.category !== filter; if (!card.hidden) count++; });
  $('.project-grid').classList.toggle('filtered', filter !== 'Todos');
  $('.filter-status').textContent = `${count} ${count === 1 ? 'seleção encontrada' : 'seleções encontradas'}.`;
}));

// One silent preview at a time; no video request before a hover or explicit tap.
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const mobile=matchMedia('(max-width: 700px)');
const connection=navigator.connection;
const allowHover=()=>finePointer.matches&&!reducedMotion.matches&&!connection?.saveData&&!/2g/.test(connection?.effectiveType||'');
let activePreview='corvette', previewVideo=null, previewOwner=null, previewGeneration=0, hoverTimer;
const motionButton=$('.motion-control');
function syncPreviewControls() {
  const playing=previewOwner?.dataset.hero===activePreview;
  motionButton.setAttribute('aria-pressed',String(!!playing));
  $('.motion-label').textContent=playing?'Pausar':'Reproduzir';
  $('.motion-icon').textContent=playing?'Ⅱ':'▷';
}
function stopPreviews() {
  clearTimeout(hoverTimer); previewGeneration++;
  if(previewVideo){previewVideo.pause();previewVideo.removeAttribute('src');previewVideo.load();previewVideo.classList.remove('is-playing');}
  if(previewOwner){previewOwner.classList.remove('is-playing');if(previewOwner.matches('button'))previewOwner.setAttribute('aria-pressed','false');}
  previewVideo=null;previewOwner=null;syncPreviewControls();
}
async function startPreview(owner,id) {
  if(document.hidden||menu.open||$('.film-dialog').open)return;
  if(previewOwner===owner)return;
  stopPreviews();const generation=previewGeneration;
  const video=$('video',owner);previewVideo=video;previewOwner=owner;
  video.muted=true;video.src=media(id,'preview.mp4');
  try {
    await video.play();
    if(generation!==previewGeneration)return;
    video.classList.add('is-playing');owner.classList.add('is-playing');
    if(owner.matches('button'))owner.setAttribute('aria-pressed','true');
    syncPreviewControls();
  }catch{if(generation===previewGeneration)stopPreviews();}
}
function selectHero(id) {
  activePreview=id;
  $$('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preview===id)));
  $$('.hero-frame').forEach(frame=>frame.classList.toggle('is-active',frame.dataset.hero===id));
  const img=$(`[data-hero="${id}"] img`);
  if(img.dataset.mobilePoster){img.src=media(id,'480.webp');img.srcset=`${media(id,'480.webp')} 480w, ${media(id)} 720w`;img.sizes='100vw';delete img.dataset.mobilePoster;}
  syncPreviewControls();
}
function attachHover(owner,id) {
  owner.addEventListener('pointerenter',()=>{
    if(!allowHover())return;
    clearTimeout(hoverTimer);
    hoverTimer=setTimeout(()=>{if(owner.dataset.hero)selectHero(id);startPreview(owner,id);},160);
  });
  owner.addEventListener('pointerleave',()=>{clearTimeout(hoverTimer);if(previewOwner===owner)stopPreviews();});
}
$$('[data-clip-preview]').forEach(owner=>{
  const id=owner.dataset.clipPreview;attachHover(owner,id);
  owner.addEventListener('click',()=>{if(previewOwner===owner)stopPreviews();else startPreview(owner,id);});
});
$$('[data-hero]').forEach(owner=>attachHover(owner,owner.dataset.hero));
motionButton.addEventListener('click',()=>{
  const owner=$(`[data-hero="${activePreview}"]`);
  if(previewOwner===owner)stopPreviews();else startPreview(owner,activePreview);
});
$$('[data-preview]').forEach(button=>button.addEventListener('click',()=>{
  stopPreviews();selectHero(button.dataset.preview);
  startPreview($(`[data-hero="${activePreview}"]`),activePreview);
}));
const previewObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(!entry.isIntersecting&&entry.target===previewOwner)stopPreviews();},{threshold:.15});
$$('[data-hero], [data-clip-preview]').forEach(owner=>previewObserver.observe(owner));
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPreviews();stopAmbient();$('#film-player').pause();}});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)stopPreviews();});
mobile.addEventListener('change',()=>stopPreviews());

// The poster gets priority. Then one small, muted hero loop may play on mobile too.
window.addEventListener('load',()=>{
  if(reducedMotion.matches||connection?.saveData||/2g/.test(connection?.effectiveType||''))return;
  setTimeout(()=>{
    const owner=$(`[data-hero="${activePreview}"]`), rect=$('.hero').getBoundingClientRect();
    if(!previewOwner&&!document.hidden&&!menu.open&&!$('.film-dialog').open&&rect.bottom>100&&rect.top<innerHeight)startPreview(owner,activePreview);
  },1800);
},{once:true});

const dialog = $('.film-dialog'), player = $('#film-player'), status = $('.video-status'), retry = $('.retry-video');
let project = null, currentClip = null, hls = null, playbackGeneration = 0;
function stopFilm() {
  playbackGeneration++;
  player.pause();
  if(hls){hls.destroy();hls=null;}
  player.removeAttribute('src');player.load();status.textContent='';retry.hidden=true;
}
function showVideoError() {status.textContent='Não foi possível carregar o filme. Verifique a conexão e tente novamente.'; retry.hidden=false;}
async function playClip(id) {
  stopFilm();
  const generation=playbackGeneration;
  currentClip=id;
  player.poster=media(id);
  player.setAttribute('aria-label',clips[id].title);
  $$('.episode').forEach(b=>b.setAttribute('aria-current',String(b.dataset.clip===id)));
  status.textContent='Carregando filme…';
  const url=`/media/v1/${id}/index.m3u8`;
  try {
    if(player.canPlayType('application/vnd.apple.mpegurl')) player.src=url;
    else {
      // The streaming library is absent from initial page load; import only after a click.
      const {default:Hls}=await import('hls.js/dist/hls.light.mjs');
      if(generation!==playbackGeneration || !dialog.open)return;
      if(!Hls.isSupported())throw new Error('HLS unsupported');
      hls=new Hls({maxBufferLength:12,maxMaxBufferLength:20,backBufferLength:0,capLevelToPlayerSize:true});
      hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal && generation===playbackGeneration)showVideoError();});
      hls.loadSource(url);hls.attachMedia(player);
    }
    await player.play().catch(()=>{if(generation===playbackGeneration)status.textContent='Toque em reproduzir para assistir.';});
  } catch { if(generation===playbackGeneration)showVideoError(); }
}
player.addEventListener('playing',()=>{status.textContent='';retry.hidden=true;});
player.addEventListener('error',()=>{if(dialog.open && player.getAttribute('src'))showVideoError();});
retry.addEventListener('click',()=>playClip(currentClip));
function openProject(id) {
  project=projects.find(p=>p.id===id);if(!project)return;
  $('.film-category').textContent=project.label;
  $('#film-title').textContent=project.title;
  $('#film-description').textContent=project.description;
  $('.episode-count').textContent=String(project.clips.length).padStart(2,'0');
  const container=$('.episodes');container.replaceChildren();
  project.clips.forEach(id=>{
    const button=document.createElement('button');button.className='episode';button.dataset.clip=id;
    const img=document.createElement('img');img.src=media(id,'360.webp');img.width=38;img.height=55;img.alt='';img.loading='lazy';
    const name=document.createElement('span');name.textContent=clips[id].title;
    const duration=document.createElement('small');duration.textContent=clips[id].duration;
    button.append(img,name,duration);button.addEventListener('click',()=>playClip(id));container.append(button);
  });
  dialog.showModal();document.body.classList.add('dialog-open');stopPreviews();stopAmbient();playClip(project.clips[0]);
}
$$('[data-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project)));
$('.film-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{stopFilm();document.body.classList.remove('dialog-open');});
$('.film-details .text-link').addEventListener('click',()=>dialog.close());

const header = $('.site-header');
new IntersectionObserver(([entry])=>header.classList.toggle('is-scrolled',!entry.isIntersecting),{rootMargin:'-96px 0px 0px 0px'}).observe($('.hero'));
const contactObserver=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){entry.target.classList.add('is-inview');contactObserver.disconnect();}},{threshold:.18});
contactObserver.observe($('.contact'));
let ambient=null, soundGeneration=0, soundHasPlayed=false;
const soundButton=$('.sound-control');
function resetSound(){soundButton.setAttribute('aria-pressed','false');$('.sound-label').textContent=soundHasPlayed?'Repetir som':'Som ambiente';}
function stopAmbient(){soundGeneration++;if(ambient){ambient.stop();ambient=null;}resetSound();}
soundButton.addEventListener('click',async()=>{
  if(ambient){stopAmbient();return;}
  const generation=++soundGeneration;
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio){$('.sound-label').textContent='Som indisponível';return;}
  const context=new Audio();
  try{
    await context.resume();
    const {playAmbient}=await import('./ambient.js');
    if(generation!==soundGeneration||document.hidden){await context.close();return;}
    soundHasPlayed=true;ambient=playAmbient(context,()=>{ambient=null;resetSound();});
    soundButton.setAttribute('aria-pressed','true');$('.sound-label').textContent='Pausar som';
  }catch{await context.close();$('.sound-label').textContent='Tentar som novamente';}
});
// WebMCP is progressive enhancement; browsers without it load no extra module.
const modelContext = document.modelContext || navigator.modelContext;
if (typeof modelContext?.registerTool === 'function') {
  import('./agent-tools.js').then(({ registerSiteTools }) => registerSiteTools(modelContext, window)).catch(() => {});
}
