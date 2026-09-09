"""Render editable SVG artwork with the site's exact font outlines and wordmark.
Pass the clean photographic background path to also build the homepage composition.
Requires fonttools; SVGs are rasterized with Sharp in render-og.cjs.
"""
from pathlib import Path
import sys,base64
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'design';ART.mkdir(exist_ok=True)
FONT=TTFont(ROOT/'public/fonts/space-grotesk-latin.woff2')
BODY=TTFont(ROOT/'public/fonts/manrope-latin.woff2')
PAPER='#F5F2ED';INK='#171513';ORANGE='#FA6404';MUTED='#B5AFA7'

def kern(font,left,right):
 if 'GPOS' not in font:return 0
 table=font['GPOS'].table
 ids={i for rec in table.FeatureList.FeatureRecord if rec.FeatureTag=='kern' for i in rec.Feature.LookupListIndex}
 total=0
 for i in ids:
  for original in table.LookupList.Lookup[i].SubTable:
   sub=getattr(original,'ExtSubTable',original)
   if not hasattr(sub,'Coverage') or left not in sub.Coverage.glyphs:continue
   pair=None
   if sub.Format==1:
    records=sub.PairSet[sub.Coverage.glyphs.index(left)].PairValueRecord
    pair=next((p for p in records if p.SecondGlyph==right),None)
   elif sub.Format==2:
    pair=sub.Class1Record[sub.ClassDef1.classDefs.get(left,0)].Class2Record[sub.ClassDef2.classDefs.get(right,0)]
   if pair and pair.Value1:total+=getattr(pair.Value1,'XAdvance',0) or 0
 return total

def text(value,x,y,size,fill=PAPER,spacing=0,font=FONT,logo=False):
 glyphset=font.getGlyphSet();cmap=font.getBestCmap();scale=size/font['head'].unitsPerEm
 glyphs=[cmap.get(ord(c),'.notdef') for c in value];offset=0;paths=[]
 for i,glyph in enumerate(glyphs):
  pen=SVGPathPen(glyphset);glyphset[glyph].draw(pen)
  color=ORANGE if logo and value[i]=='.' else fill
  paths.append(f'<path d="{pen.getCommands()}" fill="{color}" transform="translate({x+offset:.3f} {y}) scale({scale:.6f} {-scale:.6f})"/>')
  offset+=font['hmtx'][glyph][0]*scale+spacing*size
  if i+1<len(glyphs):offset+=kern(font,glyph,glyphs[i+1])*scale
 return ''.join(paths)

def svg(body,title):return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630" role="img"><title>{title}</title>{body}</svg>'

# Native brand-book board: restrained label, real logo, specimens and palette.
parts=[f'<rect width="1200" height="630" fill="{INK}"/>',
 '<path d="M66 146H1134M66 434H1134" stroke="#39342f" stroke-width="1"/>',
 text('brand book',68,100,25,MUTED,spacing=-.02),
 text('identidade visual / 01',834,99,15,MUTED,font=BODY),
 text('lucas gil films.',66,294,108,spacing=-.065,logo=True),
 text('um novo olhar.',72,363,25,MUTED,spacing=-.02),
 text('aa',904,307,91,'#D58D8D',spacing=-.07),
 text('space grotesk',897,350,13,MUTED,font=BODY),
 text('manrope',897,373,13,MUTED,font=BODY)]
colors=[('#FA6404','laranja'),('#E2725B','coral'),('#D58D8D','rosa'),('#FFDD44','amarelo')]
for i,(color,label) in enumerate(colors):
 x=68+i*272
 parts.extend([f'<rect x="{x}" y="466" width="250" height="62" rx="2" fill="{color}"/>',text(label,x,562,15,MUTED,font=BODY),text(color.lower(),x+142,562,13,MUTED,font=BODY)])
(ART/'og-brandbook-v2.svg').write_text(svg(''.join(parts),'lucas gil films. — brand book'),encoding='utf-8')

if len(sys.argv)>1:
 background=Path(sys.argv[1]);encoded=base64.b64encode(background.read_bytes()).decode()
 photo=f'<image width="1200" height="630" preserveAspectRatio="xMidYMid slice" xlink:href="data:image/png;base64,{encoded}"/>'
 overlay='<defs><linearGradient id="shade"><stop offset="0" stop-color="#171513" stop-opacity=".45"/><stop offset=".58" stop-color="#171513" stop-opacity=".15"/><stop offset="1" stop-color="#171513" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/>'
 content=photo+overlay+text('lucas gil films.',64,295,94,spacing=-.065,logo=True)+text('produção & edição de vídeos',70,365,26,PAPER,font=BODY)+text('um novo olhar.',70,413,18,MUTED,font=BODY)
 (ART/'og-home-v3.svg').write_text(svg(content,'lucas gil films. — produção e edição de vídeos'),encoding='utf-8')
print('SVG artwork built with the original font outlines.')
