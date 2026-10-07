from pathlib import Path
import re
P=Path(__file__).parent
h=(P/'index.html').read_text()
for css in ['style.css','wonder.css']:
 h=h.replace(f'<link rel="stylesheet" href="{css}">','<style>\n'+(P/css).read_text()+'\n</style>')
for js in ['assets.js','coin.js','app.js','wonder.js']:
 h=h.replace(f'<script src="{js}"></script>','<script>\n'+(P/js).read_text().replace('</script','<\\/script')+'\n</script>')
(P/'OUT-OF-PANEL-04.html').write_text(h)
(P.parent/'index.html').write_text(h)
print('Built',len(h),'characters')
