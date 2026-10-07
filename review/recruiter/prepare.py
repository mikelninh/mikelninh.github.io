"""One-time, guarded candidate migration. Run on the review branch, never on deploy.
Only explicitly listed portfolio files are edited. Unexpected source anchors fail closed.
No external requests, credentials, clinical recommendations or personal records.
"""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def patch(path, replacements):
    p=ROOT/path
    text=p.read_text()
    for old,new in replacements:
        if text.count(old)!=1:
            raise ValueError(f'Unexpected source in {path}: {old[:90]!r}; review manually.')
        text=text.replace(old,new,1)
    p.write_text(text)

if 'Prepared browser simulation.' in (ROOT/'pruefpilot/index.html').read_text():
    print('Candidate migration already applied; no changes.')
    raise SystemExit(0)

p=ROOT/'beyond-cv/atelier/index.html'
s=p.read_text()
def once(old,new):
    global s
    if s.count(old)!=1: raise ValueError('Beyond source anchor changed: '+old[:90])
    s=s.replace(old,new,1)
once('<title>Michael Ninh — Beyond the CV · Atelier</title>', '<title>Michael Ninh — Beyond the CV</title><meta property="og:url" content="https://mikelninh.github.io/beyond-cv/atelier/"><link rel="canonical" href="https://mikelninh.github.io/beyond-cv/atelier/">')
once('<link rel="stylesheet" href="./atelier.css">','''<link rel="stylesheet" href="./atelier.css"><style>
.life-notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:36px;margin-top:30px}.life-notes article{border-top:1px solid var(--line);padding-top:20px}.life-notes h3{font-size:clamp(23px,2.4vw,30px);line-height:1.18;margin:20px 0 14px}.life-notes p{max-width:34ch}.life-notes .meta{color:var(--accent)}.human-work{border-top:1px solid var(--line);margin-top:30px;padding-top:18px}.human-work .details-body{max-width:76ch}.question-reply{display:inline-block;margin-top:18px}.artifact-caption-text{max-width:220px}.edition a{font-weight:600}.nav-links a{min-height:44px;display:inline-flex;align-items:center}.human-note{max-width:64ch;font-size:18px}.closing .address{display:block;overflow-wrap:anywhere;margin-top:16px}.return-links{display:flex;flex-wrap:wrap;gap:20px;margin:22px 0 0}.privacy-invite{max-width:74ch;margin-bottom:24px}
@media(max-width:720px){.life-notes{grid-template-columns:1fr;gap:14px}.life-notes article{padding-top:16px}.life-notes h3{margin-top:10px}.life-notes p{max-width:none}.artifact-caption-text{max-width:175px}.edition{gap:14px;flex-wrap:wrap}.nav-links{gap:12px}}
</style>''')
once('<span class="brand-note"> / open atelier</span>', '<span class="brand-note"> / beyond the CV</span>')
once('<a href="#work">Work</a><a href="#your-turn">Your turn</a><a href="../../../cv.html">CV ↗</a>', '<a href="../../../selected-work/">Selected work</a><a href="#your-turn">A small gift</a><a href="../../../cv-de.html">CV ↗</a>')
once('<div class="edition"><span>BEYOND THE CV / A NEW CHAPTER</span><a href="../">Original version ↗</a></div>', '<div class="edition"><span>BEYOND THE CV / MEET MICHAEL · EN</span><a href="../../../selected-work/">Here for the work? Start there ↗</a></div>')
once('A person.<br>Not a <em>list.</em>', 'A person.<br> Not a <em>list.</em>')
once('<a class="button primary" href="#work">Something I’m building <span aria-hidden="true">↓</span></a>', '<a class="button primary" href="#person">A little more of me <span aria-hidden="true">↓</span></a>')
once('<span>A small world from my atelier.</span>', '<span class="artifact-caption-text">A small world from my atelier.<br><span class="small">AI-assisted collectible study.</span></span>')
start=s.index('<section class="chapter" id="work"')
end=s.index('<section class="chapter conversation"',start)
s=s[:start]+'''<section class="chapter" id="person" aria-labelledby="person-title"><p class="meta muted">01 / A little life, outside the bullet points</p><h2 id="person-title">A full table.<br> An open <em>mind.</em></h2><p class="human-note">I care about making useful things. I also care about the life happening around them.</p><div class="life-notes">
<article><p class="meta">In the kitchen</p><h3>Love, but edible.</h3><p>Cooking is one of my favourite ways to care for people. Plant-based food, something new to try, and a table that gets louder as the evening goes on.</p></article>
<article><p class="meta">In practice</p><h3>Beginner is a good place to be.</h3><p>Martial arts, music, meditation. I like learning things that ask me to slow down, pay attention, and try again. Not everything needs to become an achievement.</p></article>
<article><p class="meta">In my imagination</p><h3>Some things deserve to exist just for the joy of them.</h3><p>Comics, games, collectible objects and strange little worlds. I’m interested in the stories we attach to things — and the people we share them with.</p></article>
</div></section>
'''+s[end:]
once('<p>Cooking, collecting, learning a new instrument. Not everything needs to become an achievement.</p>', '<p>Tell me what you’re learning, making, or quietly fascinated by. There is no impressive answer to get right.</p>')
once('<p class="status" id="question-status" role="status"></p>', '<a class="text-link question-reply" id="reply-question" href="mailto:mikel_ninh@yahoo.de?subject=Beyond%20the%20CV%20%E2%80%94%20a%20good%20question&amp;body=What%20are%20you%20happily%20a%20beginner%20at%20right%20now%3F%0A%0A">Let’s talk about this ↗</a><p class="hint">Opens an email draft. You decide what to send.</p><p class="status" id="question-status" role="status"></p>')
idx=s.index('<section class="chapter" id="your-turn"')
s=s[:idx]+'''<details class="human-work" id="work"><summary>And what might working together feel like?</summary><div class="details-body"><p>I ask questions, make a small version, and listen to what happens when someone uses it. I care about clear communication, useful details, and being able to say “we don’t know yet”.</p><p>In my AI projects, coding agents do much of the implementation. I shape the problem, architecture, autonomy boundaries and checks. That distinction matters to me.</p><div class="return-links"><a class="text-link" href="../../../selected-work/">Explore selected work ↗</a><a class="text-link" href="../dksr/atelier/" lang="de">One example: inspect the evidence · DE ↗</a></div></div></details>
'''+s[idx:]
once('<p class="hint">Opens your email app. Nothing is sent automatically.</p>', '<p class="hint">Opens your email app. Nothing is sent automatically.</p><a class="address" href="mailto:mikel_ninh@yahoo.de">mikel_ninh@yahoo.de</a>')
once('<details><summary>A small privacy &amp; content note</summary>', '<p class="small muted privacy-invite">Sharing a personal story is an invitation, never a requirement. Nobody owes the internet their private life to deserve an opportunity.</p><details><summary>A small privacy &amp; content note</summary>')
once('This is a new design to try, not a claim of independently measured quality.', 'This page is an introduction, not a personality assessment. There is no scoring and no claim of measured recruiter preference.')
once('<a href="../">Original chapter</a> · <a href="../../../cv.html">CV</a>', '<a href="../../../selected-work/">Selected work</a> · <a href="../../../cv-de.html">CV</a> · <a href="../#future">A longer introduction</a>')
p.write_text(s)

old="$('question-count').textContent = String(question + 1).padStart(2, '0') + ' / 08'; $('question-status').textContent = '';"
patch('beyond-cv/atelier/personal.js',[(old,old+"\n    const reply = $('reply-question');\n    if (reply) reply.href = 'mailto:mikel_ninh@yahoo.de?subject=' + encodeURIComponent('Beyond the CV — a good question') + '&body=' + encodeURIComponent(questions[question] + '\\n\\n');")])

p=ROOT/'pruefpilot/index.html';s=p.read_text()
def rep(old,new):
    global s
    if s.count(old)!=1:raise ValueError('PrüfPilot anchor changed: '+old[:90])
    s=s.replace(old,new,1)
rep('<a href="../almedia/">Almedia proof</a>','<a href="../selected-work/#pruefpilot">Arbeitsproben</a><a href="../cv-de.html">CV</a><a href="../beyond-cv/atelier/">Beyond the CV</a>')
rep('<article class="case">','<article class="case" id="review"><p class="sub" role="note"><strong>Prepared browser simulation.</strong> Synthetic cases, locally prepared results. No live model or PDF upload in this view; no message or release leaves this page.</p>')
rep('id="progress">','id="progress" role="status" aria-live="polite">')
rep('id="findingTitle"></strong>','id="findingTitle" role="status" aria-live="polite"></strong>')
rep('id="why" type="button">','id="why" type="button" aria-controls="evidence" aria-expanded="false">')
s=s.replace('Approve &amp; send request →','Approve request · simulate →').replace('Approve & send request →','Approve request · simulate →').replace('Approve &amp; release','Simulate approval')
rep("let active='funding';", "let active='funding', runVersion=0, runTimer=null, completedCase=null;")
rep("function render(){const c=cases[active];", "function render(){runVersion++;if(runTimer!==null){clearTimeout(runTimer);runTimer=null;}completedCase=null;$('run').disabled=false;$('run').setAttribute('aria-busy','false');$('why').textContent='Inspect evidence';$('why').setAttribute('aria-expanded','false');const c=cases[active];")
rep("document.querySelectorAll('.sample').forEach(b=>b.classList.toggle('active',b.dataset.case===active));", "document.querySelectorAll('.sample').forEach(b=>{const selected=b.dataset.case===active;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});")
rep("$('run').onclick=()=>{const c=cases[active];", "$('run').onclick=()=>{if(runTimer!==null)clearTimeout(runTimer);const version=++runVersion, caseId=active, c=cases[active];completedCase=null;$('run').disabled=true;$('run').setAttribute('aria-busy','true');")
rep("setTimeout(()=>{$('findingTitle')", "runTimer=setTimeout(()=>{if(version!==runVersion||caseId!==active)return;runTimer=null;completedCase=caseId;$('run').disabled=false;$('run').setAttribute('aria-busy','false');$('findingTitle')")
rep("$('why').textContent=$('evidence').classList.contains('show')?'Hide evidence':'Inspect evidence'", "$('why').textContent=$('evidence').classList.contains('show')?'Hide evidence':'Inspect evidence';$('why').setAttribute('aria-expanded',String($('evidence').classList.contains('show')))")
rep("$('resolve').onclick=()=>{const r=cases[active].resolution;", "$('resolve').onclick=()=>{if(completedCase!==active)return;const r=cases[active].resolution;")
rep("$('queue').onclick=()=>{const r=cases[active].resolution;", "$('queue').onclick=()=>{if(completedCase!==active||!$('handoff').classList.contains('show'))return;const r=cases[active].resolution;")
rep("$('approve').onclick=()=>{$('released')", "$('approve').onclick=()=>{if(completedCase!==active||!cases[active].pass)return;$('released')")
p.write_text(s)

notice='''<aside aria-label="About this work sample" style="max-width:1120px;margin:0 auto;padding:14px 18px;border-bottom:1px solid #d8e3dc;font:13px/1.6 system-ui;color:#284136;background:#f0f5f1"><strong>Michael Ninh · eigenständige Arbeitsprobe.</strong> Synthetischer, lokal vorbereiteter Fall; keine Klinik-Anbindung und keine Behandlungsempfehlung.<br>Zum Ausprobieren: Quelle des ausstehenden Befunds öffnen, dann zur Übergabe wechseln. <span style="display:inline-flex;flex-wrap:wrap;gap:16px;margin-top:6px"><a href="/selected-work/#careos">Zur Arbeitsprobe</a><a href="/cv-de.html">Lebenslauf</a><a href="/beyond-cv/atelier/">Beyond the CV · EN</a><a href="mailto:mikel_ninh@yahoo.de">Gespräch</a></span></aside>'''
oldcp="function cp(t,b){if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(function(){var o=b.textContent;b.textContent='✓ Kopiert';setTimeout(function(){b.textContent=o},1200)})}}"
newcp="""function cp(t,b){function fallback(){var n=document.getElementById('care-copy-fallback');if(!n){n=document.createElement('section');n.id='care-copy-fallback';n.style.cssText='margin:16px 0;padding:16px;border:1px solid #b9cfc3;border-radius:12px;background:#fff';var label=document.createElement('label');label.htmlFor='care-copy-text';label.textContent='Kopieren nicht verfügbar. Text hier markieren und manuell kopieren:';label.setAttribute('role','status');var a=document.createElement('textarea');a.id='care-copy-text';a.readOnly=true;a.style.cssText='display:block;width:100%;min-height:180px;margin-top:12px;font:inherit';n.append(label,a);b.parentNode.appendChild(n);}document.getElementById('care-copy-text').value=t;n.hidden=false;document.getElementById('care-copy-text').focus();document.getElementById('care-copy-text').select();}if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(function(){var o=b.textContent;b.textContent='✓ Kopiert';setTimeout(function(){b.textContent=o},1200)}).catch(fallback)}else fallback()}"""
patch('careos/sjk/index.html',[
('<body>','<body>'+notice),
("window.scrollTo({top:0,behavior:'smooth'})","all('[data-go]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})"),
("x.classList.toggle('show');b.textContent=x.classList.contains('show')?'Quelle schließen ×':'Quelle prüfen →'","x.classList.toggle('show');b.setAttribute('aria-expanded',String(x.classList.contains('show')));b.textContent=x.classList.contains('show')?'Quelle schließen ×':'Quelle prüfen →'"),
(oldcp,newcp)])
patch('beyond-cv/link_portfolio.py',[
("HOME_LINK = '<a href=\"beyond-cv/\">Beyond CV</a>'", "HOME_LINK = '<a href=\"beyond-cv/atelier/\">Beyond CV</a>'"),
("if 'href=\"beyond-cv/\"' in html or 'href=\"/beyond-cv/\"' in html:","if any(link in html for link in ('href=\"beyond-cv/\"', 'href=\"/beyond-cv/\"', 'href=\"beyond-cv/atelier/\"', 'href=\"/beyond-cv/atelier/\"')):")])
patch('beyond-cv/atelier/verify.py',[
('.nav-links a[href="../../../cv.html"]','.nav-links a[href="../../../cv-de.html"]'),
("page.locator('#work a[href=\"../dksr/atelier/\"]').click()", "page.locator('#work summary').click()\n        page.locator('#work a[href=\"../dksr/atelier/\"]').click()")])
print('Guarded candidate prepared. Run browser tests before committing generated changes.')
