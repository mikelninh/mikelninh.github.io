"""One-time review-branch adjustment; idempotent and exact-anchor guarded."""
from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'selected-work/index.html';s=p.read_text()
marker='/* Recruiter first-click layout */'
css='''.top{padding:14px 0}.hero{padding:28px 0 14px}.hero h1{font-size:clamp(35px,4.2vw,52px);margin:10px 0 14px}.lead{font-size:16px;max-width:76ch}.hero-note{margin-top:10px}.tour{padding-top:12px}.choose{margin-bottom:10px}.tabs{margin-bottom:18px}.panel{padding-top:25px}.description{margin-top:12px;margin-bottom:19px}.panel h2{margin-bottom:13px}@media(max-width:760px){.hero{padding-top:26px}.hero h1{max-width:18ch}}'''
if marker not in s:
    old='Vier eigenständige Arbeitsproben. Wählen Sie ein Problem, testen Sie einen vorbereiteten Ablauf und sehen Sie, was funktioniert — und wo die Grenzen liegen.'
    assert s.count(old)==1 and s.count('</style>')==1,'Unexpected project source; review before editing.'
    s=s.replace(old,'Vier Arbeitsproben. Ein Problem auswählen, einen Ablauf testen — und seine Grenzen erkennen.')
    s=s.replace('</style>',marker+'\n'+css+'\n</style>')
    p.write_text(s)
p=root/'review/recruiter/verify.py';s=p.read_text()
if 'Default project action is visible' not in s:
    old="    page.goto(base+'/selected-work/#careos')"
    new="""    page.set_viewport_size({'width':1440,'height':900})
    page.goto(base+'/selected-work/')
    first=page.locator('#pruefpilot .demo-link').bounding_box()
    assert first and first['y']>=0 and first['y']+first['height']<=900,first
    ok('Default project action is visible in the first 1440 by 900 desktop viewport')
    page.goto(base+'/selected-work/#careos')"""
    assert s.count(old)==1,'Unexpected acceptance source.'
    p.write_text(s.replace(old,new,1))
print('First-click candidate prepared. Browser acceptance remains mandatory.')
