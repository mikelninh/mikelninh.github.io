#!/usr/bin/env python3
"""Generate dependency-free browser data from canonical content.json."""
import json,argparse,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
data=json.loads((ROOT/'content.json').read_text())
result='window.GQ_CONTENT = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'
js=ROOT/'content.js'
if args.check:
 if not js.exists() or js.read_text()!=result:
  print('FAIL: content.js is stale. Run build_content.py');sys.exit(1)
 print('PASS: content.js matches canonical content.json')
else:
 js.write_text(result);print('Regenerated:',js)
