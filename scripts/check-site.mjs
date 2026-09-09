import { readFile, stat, readdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve, join } from 'node:path';
import { clips } from '../src/content.js';

const root = resolve('dist');
const html = await readFile(join(root,'index.html'),'utf8');
const errors=[];
const requireCheck=(condition,message)=>{if(!condition)errors.push(message);};
requireCheck(html.includes('lang="pt-BR"'),'Missing Portuguese document language');
requireCheck(/https:\/\/[^" ]+\/og-home-v3.jpg/.test(html),'Missing absolute Open Graph image');
requireCheck(html.includes('Lucas Gil Films'),'Missing updated identity');
requireCheck(html.includes('https://wa.me/5511915117067?text=Lucas%2C%20me%20ajuda%20com%20um%20filme%3F'),'Missing WhatsApp message');
requireCheck(!/<video[^>]+\bsrc=/.test(html),'Video must not download on initial load');
requireCheck((await stat(join(root,'og-home-v3.jpg'))).size<65000,'Open Graph exceeds 65KB');
requireCheck(!html.includes('<!-- PROJECT_CARDS -->'),'Portfolio was not rendered at build time');
requireCheck(!html.includes('hls-'),'Streaming library must not be requested in initial HTML');
requireCheck(!/src="[^" ]*ambient-/.test(html),'Ambient music module must stay deferred');
const book = await readFile(join(root,'brandbook/index.html'),'utf8');
const yaml = await readFile(join(root,'brand.yaml'),'utf8');
requireCheck(book.includes('Copiar YAML')&&book.includes('Space Grotesk')&&book.includes('Aplicações'),'Incomplete brand book');
requireCheck(!yaml.includes('undefined')&&yaml.includes('loops: 2')&&yaml.includes('#FA6404'),'Invalid brand YAML');
const corePaths=[...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)].map(m=>m[1]);
const coreBytes=gzipSync(html).length+(await Promise.all(corePaths.map(async p=>gzipSync(await readFile(join(root,p))).length))).reduce((a,b)=>a+b,0);
requireCheck(coreBytes<18000,`Initial HTML/CSS/JS budget exceeded: ${coreBytes}`);
const fontPaths=['space-grotesk-latin.woff2','manrope-latin.woff2'];
let fontBytes=0;
for(const name of fontPaths){const data=await readFile(join(root,'fonts',name));fontBytes+=data.length;requireCheck(data.subarray(0,4).toString()==='wOF2',`Invalid WOFF2: ${name}`);}
requireCheck(fontBytes<40000,'Combined font budget exceeded');
let segments=0,totalVideoBytes=0;
for(const id of Object.keys(clips)){
  const directory=join(root,'media/v1',id);
  const playlist=await readFile(join(directory,'index.m3u8'),'utf8');
  requireCheck(playlist.includes('#EXT-X-ENDLIST'),`Incomplete video: ${id}`);
  const files=playlist.split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('#'));
  requireCheck(files.length>0,`No video segments: ${id}`);
  for(const file of files){
    requireCheck(!file.includes('..')&&!file.startsWith('http'),`Unexpected segment reference: ${file}`);
    const info=await stat(join(directory,file));
    requireCheck(info.size>0&&info.size<2_000_000,`Video segment budget invalid: ${id}/${file}`);
    totalVideoBytes+=info.size;segments++;
  }
  for(const width of [360,480,720]) for(const ext of ['webp','avif']) await stat(join(root,`media/v2/${id}-${width}.${ext}`));
}
for(const resource of ['corvette','alice','fontes','g63','narrativa','cafe']){
  const info=await stat(join(root,`media/v2/${resource}-preview.mp4`));
  requireCheck(info.size<450000,`Hero preview too large: ${resource}`);
}
const headerFontsImages=fontBytes+(await Promise.all(['corvette','alice','fontes'].map(async id=>(await stat(join(root,`media/v2/${id}-720.avif`))).size))).reduce((a,b)=>a+b,0);
const report={coreCompressedBytes:coreBytes,fontBytes,desktopHeroPostersPlusFontsBytes:headerFontsImages,videos:Object.keys(clips).length,segments,videoBytes:totalVideoBytes,errors};
await writeFile('performance-check.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
