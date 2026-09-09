"""Build the approved LGH vector artwork. Output stays local until approval."""
from pathlib import Path
import json,base64,html,io,shutil
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

SITE=Path(__file__).resolve().parents[1]
ROOT=SITE.parent
WORK=ROOT/'.work/brand-assets-v1'
OUT=SITE/'public/brand-assets/v1'
RENDER=WORK/'render-inputs'
OUT.mkdir(parents=True,exist_ok=True);RENDER.mkdir(parents=True,exist_ok=True)
INK='#171513';PAPER='#F5F2ED';ORANGE='#FA6404';MUTED='#B5AFA7'
COLORS={'principal-claro':(INK,ORANGE),'principal-escuro':(PAPER,ORANGE),'preto':('#000000','#000000'),'branco':('#FFFFFF','#FFFFFF')}
assets=[];jobs=[]
fonts={}
fontdir=OUT/'fontes';fontdir.mkdir(exist_ok=True)
for key,src,family,weight in [('display','space-grotesk-latin.woff2','Space Grotesk',600),('body','manrope-latin.woff2','Manrope',400)]:
 f=TTFont(WORK/'SpaceGrotesk-variable.ttf' if key=='display' else SITE/'public/fonts'/src)
 if 'fvar' in f:f=instantiateVariableFont(f,{'wght':weight},inplace=False)
 if key=='display':
  static_names={1:'Space Grotesk SemiBold',2:'Regular',4:'Space Grotesk SemiBold',6:'SpaceGrotesk-SemiBold',16:'Space Grotesk',17:'SemiBold'}
  for n in f['name'].names:
   if n.nameID in static_names:n.string=static_names[n.nameID].encode(n.getEncoding())
 f.flavor=None
 filename='SpaceGrotesk-Semibold.ttf' if key=='display' else 'Manrope-Regular.ttf'
 if not (fontdir/filename).exists():f.save(fontdir/filename)
 fonts[key]=(f,family,weight)
for source in ['space-grotesk-OFL.txt','manrope-OFL.txt']:shutil.copy2(SITE/'public/fonts'/source,fontdir/source)

def kern(font,left,right):
 if 'GPOS' not in font:return 0
 t=font['GPOS'].table;total=0
 if not t.FeatureList:return 0
 ids={i for r in t.FeatureList.FeatureRecord if r.FeatureTag=='kern' for i in r.Feature.LookupListIndex}
 for i in ids:
  for original in t.LookupList.Lookup[i].SubTable:
   sub=getattr(original,'ExtSubTable',original)
   if not hasattr(sub,'Coverage') or left not in sub.Coverage.glyphs:continue
   pair=None
   if sub.Format==1:pair=next((p for p in sub.PairSet[sub.Coverage.glyphs.index(left)].PairValueRecord if p.SecondGlyph==right),None)
   elif sub.Format==2:pair=sub.Class1Record[sub.ClassDef1.classDefs.get(left,0)].Class2Record[sub.ClassDef2.classDefs.get(right,0)]
   if pair and pair.Value1:total+=getattr(pair.Value1,'XAdvance',0) or 0
 return total

def metrics(value,size,key='display',tracking=0):
 f=fonts[key][0];cm=f.getBestCmap();gl=[cm.get(ord(c),'.notdef') for c in value];scale=size/f['head'].unitsPerEm
 offsets=[];cursor=0
 for i,g in enumerate(gl):
  offsets.append(cursor);cursor+=f['hmtx'][g][0]*scale
  if i+1<len(gl):cursor+=kern(f,g,gl[i+1])*scale+tracking*size
 return gl,offsets,cursor

def outlined(value,x,y,size,color,key='display',tracking=0,dot=None):
 f=fonts[key][0];gs=f.getGlyphSet();scale=size/f['head'].unitsPerEm
 gl,offsets,width=metrics(value,size,key,tracking);out=[]
 for c,g,o in zip(value,gl,offsets):
  pen=SVGPathPen(gs);gs[g].draw(pen)
  out.append(f'<path fill="{dot if dot and c=="." else color}" d="{pen.getCommands()}" transform="translate({x+o:.3f} {y:.3f}) scale({scale:.7f} {-scale:.7f})"/>')
 return ''.join(out)

class Art:
 def __init__(self,w,h,title,bg=None):
  self.w=w;self.h=h;self.title=title;self.live=[];self.flat=[]
  if bg:self.rect(0,0,w,h,bg)
 def add(self,s):self.live.append(s);self.flat.append(s)
 def rect(self,x,y,w,h,color):self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>')
 def circle(self,x,y,r,color):self.add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>')
 def line(self,x1,y1,x2,y2,color,width=1):self.add(f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}"/>')
 def text(self,value,x,y,size,color=INK,key='display',tracking=0,maxw=None,logo=False,dot=None,center=False):
  width=metrics(value,size,key,tracking)[2]
  if maxw and width>maxw:size*=maxw/width;width=maxw
  if center:x-=width/2
  flat=outlined(value,x,y,size,color,key,tracking,dot)
  if logo:self.live.append(flat)
  else:
   family,weight=fonts[key][1:]
   self.live.append(f'<text x="{x:.3f}" y="{y:.3f}" font-family="{family}" font-weight="{weight}" font-size="{size:.3f}" letter-spacing="{tracking*size:.3f}" fill="{color}">{html.escape(value)}</text>')
  self.flat.append(flat)
 def logo(self,x,y,size,color=INK,dot=ORANGE,compact=False,maxw=None,center=False):self.text('lgh.' if compact else 'lucas gil films.',x,y,size,color,tracking=-.045,logo=True,dot=dot,maxw=maxw,center=center)
 def svg(self,flat=False):
  body=''.join(self.flat if flat else self.live)
  return f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}" role="img"><title>{html.escape(self.title)}</title>{body}</svg>'
 def save(self,group,name,label,usage,formats=('svg','png'),previewbg=None,notes=''):
  folder=OUT/group;folder.mkdir(exist_ok=True)
  flat=self.svg(True);renderfile=RENDER/f'{group}-{name}.svg';renderfile.write_text(flat,encoding='utf-8')
  files=[]
  for ext in formats:
   target=folder/f'{name}.{ext}';files.append(str(target.relative_to(OUT)).replace('\\','/'))
   if ext=='svg':target.write_text(self.svg(),encoding='utf-8')
   elif ext=='pdf':
    drawing=svg2rlg(io.BytesIO(flat.encode()));drawing.scale(.75,.75);drawing.width*=.75;drawing.height*=.75
    renderPDF.drawToFile(drawing,str(target),title=self.title,author='Lucas Gil Films')
   elif ext in ('png','jpg'):jobs.append({'input':str(renderfile),'output':str(target),'format':ext,'width':self.w,'height':self.h})
  thumb=folder/f'{name}-preview.webp'
  jobs.append({'input':str(renderfile),'output':str(thumb),'format':'webp','width':min(self.w,960),'background':previewbg})
  assets.append({'id':name,'group':group,'label':label,'usage':usage,'width':self.w,'height':self.h,'files':files,'preview':str(thumb.relative_to(OUT)).replace('\\','/'),'notes':notes})

# Signature, descriptor, and compact lockup in four approved colorways.
for variant,(color,dot) in COLORS.items():
 for form in ['assinatura','assinatura-descritor','monograma']:
  compact=form=='monograma';w,h=(640,420) if compact else (1680,420 if form=='assinatura' else 520)
  a=Art(w,h,f'Lucas Gil Films {form} {variant}')
  if compact:a.logo(w/2,285,280,color,dot,True,maxw=450,center=True)
  else:
   a.logo(96,285,230,color,dot,maxw=1488)
   if form=='assinatura-descritor':a.text('produção e edição de vídeos',105,409,50,color,key='body',maxw=1420)
  a.save('logos',f'lgh-{form}-{variant}',f'{form.replace("-"," ").capitalize()} · {variant.replace("-"," ")}', 'Logo transparente para aplicação digital e impressão',('svg','png','pdf'),INK if color in (PAPER,'#FFFFFF') else PAPER,'PDF vetorial em RGB. Para impressão com perfil CMYK específico, solicite conversão à gráfica.')

# Avatars: shared design, exports sized for actual practical use.
for variant,bg,fg,dot in [('laranja',ORANGE,INK,INK),('claro',PAPER,INK,ORANGE),('escuro',INK,PAPER,ORANGE)]:
 a=Art(1080,1080,f'Avatar lgh {variant}',bg);a.logo(540,656,400,fg,dot,True,maxw=715,center=True)
 a.save('avatares',f'lgh-avatar-master-{variant}',f'Avatar principal · {variant}','Matriz quadrada com margem para recorte circular',('svg','png'))
 for platform,size in [('whatsapp',640),('tiktok',400),('vimeo',600),('instagram',1080),('youtube',800),('linkedin',400),('facebook',400)]:
  b=Art(size,size,f'Avatar {platform} {variant}',bg);b.logo(size/2,size*.6074,size*.3704,fg,dot,True,maxw=size*.663,center=True)
  b.save('avatares',f'lgh-avatar-{platform}-{variant}',f'{platform.capitalize()} · {variant}','Avatar com recorte circular previsto',('png',),notes='Dimensão de exportação do kit; não representa tamanho mínimo exigido pela plataforma.')

for size in [16,32,48,180,192,512]:
 a=Art(size,size,f'Ícone LGH {size}',ORANGE)
 # All three initials remain present, including at favicon sizes.
 a.logo(size/2,size*.66,size*.44,INK,INK,True,maxw=size*.78,center=True)
 a.save('icones',f'lgh-icone-{size}',f'Ícone {size} × {size}','Favicon, atalho e ícone de aplicação',('png',))
a=Art(512,512,'Ícone LGH',ORANGE);a.logo(256,338,225,INK,INK,True,maxw=400,center=True);a.save('icones','lgh-icone','Ícone vetorial','Favicon SVG e símbolo da marca',('svg',))

# Production headers; essential content is deliberately away from profile overlays.
for name,w,h,label in [('linkedin-pessoal',1584,396,'LinkedIn pessoal'),('linkedin-pagina',4200,700,'LinkedIn página'),('facebook',1702,630,'Facebook'),('youtube',2560,1440,'YouTube')]:
 a=Art(w,h,f'Capa {label} Lucas Gil Films',INK)
 if name=='youtube':
  a.circle(2240,190,420,ORANGE);a.circle(180,1350,370,'#24201D')
  a.logo(w/2,727,164,PAPER,ORANGE,maxw=1320,center=True);a.text('produção e edição de vídeos',w/2,822,45,PAPER,key='body',center=True)
  note='Conteúdo principal dentro da área central de 1544 × 422 px. Conferir o recorte no upload.'
 else:
  a.rect(0,0,w*.055,h,ORANGE)
  start=w*(.32 if name=='linkedin-pessoal' else .27 if name=='facebook' else .23)
  a.logo(start,h*.50,h*.30,PAPER,ORANGE,maxw=w*.55 if name=='facebook' else w-start-w*.08)
  a.text('produção e edição de vídeos',start+4,h*.70,h*.067,PAPER,key='body',maxw=w-start-w*.09)
  a.text('@lghfilms',start+4,h*.85,h*.048,MUTED,key='body')
  note='Margem reservada para a foto de perfil. Conferir a prévia de recorte no computador e no celular.'
 a.save('capas',f'lgh-header-{name}',label,'Capa pronta para perfil ou canal',('svg','png','jpg'),notes=note)

# Reusable social layouts with real editable SVG text, plus ready-to-adapt PNG examples.
designs=[('filme','Novo filme',['[Nome do','filme]'],'Assista ao projeto completo',INK,PAPER),('projeto','Projeto',['[Nome do','projeto]'],'[Cliente / ano]',PAPER,INK),('bastidores','Bastidores',['Por trás','do filme'],'[Etapa da produção]',ORANGE,INK),('contato','Vamos filmar',['Seu próximo','filme começa','aqui.'],'Fale com Lucas no WhatsApp',INK,PAPER)]
for name,eyebrow,lines,sub,bg,fg in designs:
 for formatname,w,h in [('quadrado',1080,1080),('feed',1080,1350),('story',1080,1920),('thumbnail',1280,720)]:
  a=Art(w,h,f'Template {eyebrow} {formatname}',bg);margin=w*.08
  a.logo(margin,h*.105,w*.06,fg,fg if bg==ORANGE else ORANGE,maxw=w*.6)
  a.text(eyebrow.upper(),margin,h*.24,w*.024,fg,key='body',tracking=.055,maxw=w*.82)
  fsize=w*(.104 if formatname!='thumbnail' else .07);step=fsize*1.14;start=h*.40
  for j,line in enumerate(lines):a.text(line,margin,start+j*step,fsize,fg,tracking=-.035,maxw=w*.82)
  a.text(sub,margin,h*.79,w*.029,fg,key='body',maxw=w*.82)
  a.line(margin,h*.85,w-margin,h*.85,fg,1)
  a.text('@lghfilms',margin,h*.91,w*.025,fg,key='body')
  a.circle(w-margin-24,h*.9,24,fg if bg==ORANGE else ORANGE)
  a.save('redes',f'lgh-{name}-{formatname}',f'{eyebrow} · {formatname}','Template para editar título e conteúdo antes de publicar',('svg','png'),notes='O SVG mantém o texto editável. Instale as fontes do kit. O PNG mostra a aplicação e não permite editar o texto.')

for fmt,w,h in [('horizontal',1920,1080),('vertical',1080,1920)]:
 for kind in ['abertura','encerramento']:
  a=Art(w,h,f'Cartela {kind} {fmt}',INK)
  if kind=='abertura':
   a.text('LUCAS GIL FILMS APRESENTA',w/2,h*.34,w*.021,PAPER,key='body',center=True,maxw=w*.80)
   a.text('[Nome do filme]',w/2,h*.52,w*.075,PAPER,center=True,maxw=w*.84)
   a.text('[Cliente / ano]',w/2,h*.64,w*.025,MUTED,key='body',center=True)
  else:
   a.logo(w/2,h*.49,w*.095,PAPER,ORANGE,center=True,maxw=w*.82)
   a.text('produção e edição de vídeos',w/2,h*.61,w*.025,PAPER,key='body',center=True)
   a.text('@lghfilms',w/2,h*.69,w*.022,MUTED,key='body',center=True)
  a.save('video',f'lgh-cartela-{kind}-{fmt}',f'{kind.capitalize()} · {fmt}','Cartela estática para edição de vídeo',('svg','png'))
 a=Art(w,h,f'Identificação {fmt}')
 x=w*.07;y=h*.78;bw=w*.80 if fmt=='vertical' else w*.49;bh=h*.14
 a.rect(x,y,bw,bh,INK);a.rect(x,y,bw*.014,bh,ORANGE)
 a.text('[Nome e sobrenome]',x+30,y+bh*.43,w*.03,PAPER,maxw=bw-65)
 a.text('[Função / participação]',x+30,y+bh*.78,w*.021,MUTED,key='body',maxw=bw-65)
 a.save('video',f'lgh-identificacao-{fmt}',f'Identificação · {fmt}','Sobreposição transparente com nome e função',('svg','png'),PAPER)
for color in ['preto','branco']:
 for compact in [False,True]:
  a=Art(900 if not compact else 400,240,'Marca d’água Lucas Gil Films')
  a.logo(20,165,120 if not compact else 180,COLORS[color][0],COLORS[color][1],compact,maxw=a.w-40)
  a.save('video',f'lgh-marca-dagua-{color}-'+('compacta' if compact else 'assinatura'),f'Marca d’água {color} '+('compacta' if compact else 'assinatura'),'Ajustar escala e opacidade no editor de vídeo',('svg','png'),INK if color=='branco' else PAPER)

# Digital contact card, using confirmed public contact only.
a=Art(1080,1350,'Cartão digital Lucas Gil Films',PAPER)
a.logo(86,176,89,INK,ORANGE,maxw=906);a.text('Lucas Gil Henriques',86,450,63,INK,maxw=910)
a.text('Produção e edição de vídeos',86,543,39,INK,key='body',maxw=908)
a.line(86,670,994,670,INK)
for line,y,size in [('@lghfilms',798,59),('+55 11 91511-7067',886,47),('São Paulo / Brasil',1148,31)]:a.text(line,86,y,size,INK,key='body',maxw=910)
a.circle(949,1180,45,ORANGE)
a.save('papelaria','lgh-cartao-digital','Cartão digital','Contato para compartilhar em mensagens',('svg','png','pdf'))
a=Art(1200,360,'Assinatura de e-mail Lucas Gil Films',PAPER)
a.rect(0,0,15,360,ORANGE);a.logo(54,128,86,INK,ORANGE,maxw=1090)
a.text('Lucas Gil Henriques',60,208,32,INK,key='body');a.text('Produção e edição de vídeos',60,260,27,INK,key='body')
a.text('@lghfilms   +55 11 91511-7067',60,313,25,INK,key='body')
a.save('papelaria','lgh-assinatura-email','Assinatura de e-mail','Versão em imagem e SVG',('svg','png'))

(OUT/'papelaria/assinatura-email.html').write_text('''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Assinatura Lucas Gil Films</title><body><table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#171513;border-left:5px solid #FA6404"><tr><td style="padding:12px 20px;font-size:25px;font-weight:700">lucas gil films<span style="color:#FA6404">.</span></td></tr><tr><td style="padding:0 20px 6px;font-size:15px"><strong>Lucas Gil Henriques</strong></td></tr><tr><td style="padding:0 20px 12px;font-size:13px">Produção e edição de vídeos</td></tr><tr><td style="padding:0 20px 12px;font-size:13px"><a style="color:#171513" href="https://www.instagram.com/lghfilms/">@lghfilms</a> &nbsp; <a style="color:#171513" href="https://wa.me/5511915117067">+55 11 91511-7067</a></td></tr></table></body></html>''',encoding='utf-8')
(OUT/'papelaria/lucas-gil-henriques.vcf').write_text('BEGIN:VCARD\nVERSION:3.0\nFN:Lucas Gil Henriques\nN:Henriques;Lucas;Gil;;\nORG:Lucas Gil Films\nTITLE:Produção e edição de vídeos\nTEL;TYPE=CELL:+5511915117067\nURL:https://www.instagram.com/lghfilms/\nEND:VCARD\n',encoding='utf-8')
(OUT/'assets-manifest.json').write_text(json.dumps({'version':'1.0','brand':'Lucas Gil Films','assets':assets},ensure_ascii=False,indent=2),encoding='utf-8')
(WORK/'raster-jobs.json').write_text(json.dumps(jobs,indent=2),encoding='utf-8')
print(json.dumps({'artworks':len(assets),'rasterJobs':len(jobs),'output':str(OUT)}))
