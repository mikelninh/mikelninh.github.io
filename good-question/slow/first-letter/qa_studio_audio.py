#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
root=Path(__file__).resolve().parent
manifest=json.loads((root/'audio-manifest.js').read_text().split('window.GQ_NARRATION=',1)[1].rstrip(';\n'))
assert set(manifest['tracks'])=={'en','de','vi'}
assert all(x is None for x in manifest['tracks'].values()),'Never claim studio audio without real tracks'
page=(root/'index.html').read_text()
for n in ['audio-manifest.js','studio-player.js','../audio-v11.js']:
 assert f'src="./{n}"' in page if not n.startswith('../') else f'src="{n}"' in page, n
 assert (root/n).resolve().is_file(),n
for n in ['studio-player.js','audio-manifest.js']:
 p=subprocess.run(['node','--check',str(root/n)],capture_output=True,text=True)
 assert p.returncode==0,p.stderr
assert 'mediaSession' in (root/'studio-player.js').read_text()
assert 'playbackRate' in (root/'studio-player.js').read_text()
print('PASS: real MP3 player module, source manifest, no fake audio tracks, JS syntax')
