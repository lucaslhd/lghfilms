from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from zipfile import ZipFile,ZIP_DEFLATED
from pypdf import PdfReader
import json,hashlib,shutil,html

SITE=Path(__file__).resolve().parents[1];ROOT=SITE.parent;OUT=SITE/'public/brand-assets/v1';WORK=ROOT/'.work/brand-assets-v1'
manifest=json.loads((OUT/'assets-manifest.json').read_text(encoding='utf-8'))
assets=[a for a in manifest['assets'] if a['group'] not in ['documentos','fontes'] and a['id']!='lgh-contato-vcf']
Image.open(OUT/'icones/lgh-icone-512.png').save(OUT/'icones/lgh-favicon.ico',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
next(a for a in assets if a['id']=='lgh-icone')['files']=['icones/lgh-icone.svg','icones/lgh-favicon.ico']
next(a for a in assets if a['id']=='lgh-assinatura-email')['files']=['papelaria/lgh-assinatura-email.svg','papelaria/lgh-assinatura-email.png','papelaria/assinatura-email.html']
for slug,label,usage,formats,pic,notes in [
 ('lgh-proposta-comercial','Proposta comercial','Modelo editável de 3 páginas',['docx','pdf'],'document-previews/lgh-proposta-comercial-01.png','Preencha objetivo, entregas, valores e condições antes de enviar. O PDF apresenta o modelo em branco.'),
 ('lgh-briefing-audiovisual','Briefing audiovisual','Questionário editável de 2 páginas',['docx','pdf'],'document-previews/lgh-briefing-audiovisual-01.png','Preencha com o cliente para definir o projeto.'),
 ('lgh-papel-timbrado','Papel timbrado','Modelo de documento e correspondência',['docx','pdf'],'document-previews/lgh-papel-timbrado-01.png','Instale as fontes do kit antes de editar no Word.'),
 ('lgh-template-apresentacoes','Apresentação LGH','12 layouts editáveis com a estrutura da Aotta adaptada',['pptx','potx','pdf'],'presentation-previews/slide-02.png','O POTX cria uma nova apresentação. Use Novo Slide para escolher um dos 12 layouts ou duplique um exemplo, especialmente as tabelas. Instale as fontes do kit. A grade e a hierarquia foram adaptadas da referência Aotta; os masters são próprios da LGH.'),
 ('lgh-kit-producao','Cronograma e lista de planos','Planilha com datas automáticas e controle de captação',['xlsx','pdf'],'cronograma.png','Defina a data inicial e ajuste os dias e as durações. O exemplo usa dias corridos e não recalcula dependências entre etapas. A segunda aba registra planos e arquivos de captação.'),
 ('lgh-guia-do-kit','Guia de uso','Referência de cores, formatos e aplicações',['pdf'],'document-previews/lgh-guia-do-kit-01.png','Consulte antes de editar ou encaminhar os materiais.')]:
 preview=f'documentos/{slug}-preview.webp';im=Image.open(WORK/pic).convert('RGB');im.thumbnail((1000,1000));im.save(OUT/preview,'WEBP',quality=87)
 assets.append({'id':slug,'group':'documentos','label':label,'usage':usage,'files':[f'documentos/{slug}.{ext}' for ext in formats],'preview':preview,'notes':notes})
assets.append({'id':'lgh-contato-vcf','group':'papelaria','label':'Contato Lucas Gil Henriques','usage':'Contato para importar na agenda','files':['papelaria/lucas-gil-henriques.vcf'],'preview':'papelaria/lgh-cartao-digital-preview.webp','notes':'Contém nome, telefone público e Instagram.'})
for slug,label,file,license in [('space-grotesk','Space Grotesk Semibold','SpaceGrotesk-Semibold.ttf','space-grotesk-OFL.txt'),('manrope','Manrope Regular','Manrope-Regular.ttf','manrope-OFL.txt')]:
 assets.append({'id':slug,'group':'fontes','label':label,'usage':'Fonte para instalar e editar os modelos','files':['fontes/'+file,'fontes/'+license],'preview':'logos/lgh-assinatura-principal-claro-preview.webp','notes':'Licença SIL Open Font License 1.1 incluída.'})
manifest['assets']=assets
manifest['stats']={'pieces':len(assets),'downloads':sum(len(a['files'])for a in assets)}
(OUT/'assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
readme='''# Lucas Gil Films · kit de marca v1

Abra `index.html` no navegador para explorar a galeria, mesmo sem internet.

## Comece por aqui
- Avatar principal: `avatares/lgh-avatar-master-laranja.png`.
- Logo: assinatura principal para fundo claro ou escuro em `logos`.
- Guia: `documentos/lgh-guia-do-kit.pdf`.
- Fontes: instale os dois TTF em `fontes` antes de editar os modelos.

## Conteúdo
Logos em SVG, PNG transparente e PDF vetorial; avatares em três cores para WhatsApp, TikTok, Vimeo, Instagram, YouTube, LinkedIn e Facebook; capas LinkedIn pessoal e página, Facebook e YouTube; modelos para feed, quadrado, story e thumbnail; cartelas, identificação e marcas d'água para vídeo; proposta e briefing em Word; papel timbrado; PowerPoint e POTX com 12 layouts; cronograma e lista de planos em Excel; assinatura HTML; cartão digital e VCF.

## Edição
Os logos SVG têm letras em contornos. Os templates SVG de redes e vídeo mantêm textos editáveis. O PNG é uma imagem pronta: seus textos não são editáveis. As cartelas são estáticas, para inserir no editor de vídeo.

O modelo de apresentação adapta a grade de 57,6 px, a hierarquia e as composições básicas da referência AOTTA Consultoria Template Apresentações v2.1 MAJOR fornecida pelo usuário. Foram criados masters e layouts LGH com a paleta e as fontes da marca. Ele não inclui as fotos, os slides avançados ou a marca Aotta. Os campos de imagem são placeholders nativos. Para reutilizar as tabelas de cronograma e investimento, duplique os slides 9 e 10.

A proposta, o cronograma e os textos entre colchetes são modelos. Valores, datas e condições devem ser definidos para cada trabalho. A planilha usa dias corridos; ajuste o dia inicial de cada etapa quando uma mudança afetar as dependências. PDF da planilha em A3 paisagem.

As capas reservam margem de segurança. Confira a prévia de recorte ao fazer upload. As dimensões dos avatares são exportações de produção, não afirmações de tamanhos mínimos das plataformas.

## Marca e cores
Letras principais: #171513 ou #F5F2ED, ponto #FA6404. Versões monocromáticas: #000000 e #FFFFFF. Avatar principal: lgh. escuro sobre #FA6404. Preserve o ponto, a proporção e o respiro.

Os PDFs vetoriais usam RGB. Para impressão, combine com a gráfica a conversão para o perfil CMYK do suporte.

## Fontes e referências
Space Grotesk Semibold e Manrope Regular, SIL OFL 1.1. Licenças incluídas. Space Grotesk: github.com/google/fonts/tree/main/ofl/spacegrotesk. Manrope: fontes locais do projeto original.

Dimensões de capas: linkedin.com/help/linkedin/answer/a568217 (pessoal), linkedin.com/help/linkedin/answer/a563309 (página), support.google.com/youtube/answer/10456525. Facebook: matriz de produção 1702 × 630 a conferir no upload; a página de ajuda exigiu login na consulta de 09/09/2026.

Contato usado nos arquivos: Lucas Gil Henriques, @lghfilms, +55 11 91511-7067. Não foi incluído e-mail ou domínio ainda não confirmado.
'''
(OUT/'LEIA-ME.md').write_text(readme,encoding='utf-8')
css=(SITE/'src/brand-assets-gallery.css').read_text(encoding='utf-8');js=(SITE/'src/brand-assets-gallery.js').read_text(encoding='utf-8')
page='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lucas Gil Films · Kit de marca</title><style>
@font-face{font-family:LGH;src:url('fontes/SpaceGrotesk-Semibold.ttf');font-weight:600}@font-face{font-family:Manrope;src:url('fontes/Manrope-Regular.ttf')}*{box-sizing:border-box}body{margin:0;background:#0d0c0b;color:#F5F2ED;font-family:Manrope,Arial,sans-serif}main{max-width:1450px;margin:auto;padding:50px 5% 80px}a{color:inherit}header{border-bottom:1px solid #38322d;padding-bottom:35px;margin-bottom:55px;display:flex;gap:30px;align-items:center;justify-content:space-between}header img{width:280px;max-width:65%;height:auto}.eyebrow{font-size:12px;letter-spacing:.13em;color:#B5AFA7}h1{font-family:LGH,sans-serif;font-weight:600;font-size:clamp(46px,7vw,92px);line-height:1;letter-spacing:-.06em;max-width:900px;margin:22px 0}h1 span{color:#FA6404}.intro{max-width:700px;color:#B5AFA7;line-height:1.7}footer{font-size:12px;color:#B5AFA7;margin-top:55px;border-top:1px solid #38322d;padding-top:25px}.asset-card h3{font-family:LGH,sans-serif;font-weight:600}
'''+css+'''</style></head><body><main><header><img src="logos/lgh-assinatura-principal-escuro.svg" alt="lucas gil films."><span class="eyebrow">KIT DE MARCA / V1</span></header><p class="eyebrow">LUCAS GIL HENRIQUES</p><h1>A marca, pronta<br>para <span>usar.</span></h1><p class="intro">Logos, avatares, capas e modelos para o dia a dia. Explore as categorias e baixe os arquivos no formato que precisa.</p><section class="asset-library" data-root="./"><div class="asset-kit-actions"><a class="asset-kit-download" href="../lgh-brand-kit-v1.zip" download>Baixar kit completo ↓</a><a href="documentos/lgh-guia-do-kit.pdf">Guia de uso ↗</a><a href="LEIA-ME.md">Instruções ↗</a></div><label class="asset-search-label" for="asset-search">Buscar uma peça ou plataforma</label><input id="asset-search" class="asset-search" type="search" placeholder="Ex.: WhatsApp, proposta, LinkedIn…"><div class="asset-filters" aria-label="Filtrar por categoria"></div><p class="asset-count" role="status" aria-live="polite"></p><div class="asset-grid"></div><button class="asset-more" type="button" hidden>Mostrar mais peças</button></section><footer>Lucas Gil Films · @lghfilms · +55 11 91511-7067</footer></main><script>window.LGH_BRAND_ASSETS='''+json.dumps(manifest,ensure_ascii=False).replace('</',r'<\/')+''';</script><script>'''+js+'''</script></body></html>'''
(OUT/'index.html').write_text(page,encoding='utf-8')

# Verify delivery paths, format readability and vector logo content.
for a in assets:
 assert (OUT/a['preview']).is_file(),a['preview']
 for f in a['files']:assert (OUT/f).is_file(),f
 for f in a['files']:
  if f.endswith('.png'):
   im=Image.open(OUT/f);im.verify()
  if f.endswith('.pdf'):
   pdf=PdfReader(OUT/f);assert len(pdf.pages)>0
   if a['group']=='logos':assert all(len(p.images)==0 for p in pdf.pages),'Logo PDF should stay vector'
for file in (OUT/'documentos').glob('*.inspect.ndjson'):shutil.move(str(file),str(WORK/file.name))
hashes={str(f.relative_to(OUT)).replace('\\','/'):hashlib.sha256(f.read_bytes()).hexdigest() for f in OUT.rglob('*') if f.is_file() and f.name!='SHA256SUMS.json'}
(OUT/'SHA256SUMS.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')
archive=OUT.parent/'lgh-brand-kit-v1.zip'
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=7)as z:
 for f in OUT.rglob('*'):
  if f.is_file():z.write(f,'lgh-brand-kit-v1/'+str(f.relative_to(OUT)))
with ZipFile(archive)as z:assert z.testzip() is None

# Contact sheets for visual QA; not mixed into the downloadable kit.
font=ImageFont.truetype(str(OUT/'fontes/Manrope-Regular.ttf'),14)
for offset in range(0,len(assets),20):
 batch=assets[offset:offset+20];sheet=Image.new('RGB',(1400,((len(batch)+3)//4)*265),'#ddd9d2');draw=ImageDraw.Draw(sheet)
 for j,a in enumerate(batch):
  im=Image.open(OUT/a['preview']).convert('RGB');im.thumbnail((334,220));x=(j%4)*350+8;y=(j//4)*265+8;sheet.paste(im,(x+(334-im.width)//2,y));draw.text((x,y+229),a['label'][:41],font=font,fill='#171513')
 sheet.save(WORK/f'assets-contact-{offset//20+1}.jpg',quality=92)
print(json.dumps({'pieces':len(assets),'downloadFormats':sum(len(a['files'])for a in assets),'zipMB':round(archive.stat().st_size/1048576,2),'filesInPackage':len(hashes)+1},ensure_ascii=False))
