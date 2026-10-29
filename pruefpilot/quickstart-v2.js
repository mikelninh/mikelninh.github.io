/* Fast, authentic front door to the existing safe review fixture.
   Operates the existing review buttons; public actions remain simulated. */
(()=>{
if(typeof cases==='undefined'||!document.querySelector('#run'))return;
const main=document.querySelector('main'),q=id=>document.getElementById(id);
if(!main)return;
const quick=document.createElement('section');quick.id='ppQuick';quick.className='ppq';quick.setAttribute('aria-labelledby','ppqTitle');
quick.innerHTML=`<div class="ppq-head"><div><span class="ppq-eyebrow">PrüfPilot · Interaktive Demo</span><h1 id="ppqTitle">Dokumente fehlen. <em>Was passiert jetzt?</em></h1><p class="ppq-lead">Ein Antrag enthält fehlende oder widersprüchliche Unterlagen. <strong>PrüfPilot prüft den Fall, erklärt das Problem und bereitet den nächsten sinnvollen Schritt vor.</strong> Die Entscheidung bleibt bei einem Menschen.</p></div><aside class="ppq-aside"><span class="ppq-eyebrow">In 30 Sekunden</span><strong>Aus Dokumenten wird eine klare Aufgabe.</strong><p>Wähle einen Beispielfall. Starte die Prüfung. Sieh das Ergebnis und den vorbereiteten nächsten Schritt.</p></aside></div>
<div class="ppq-progress"><span>1 · Fall wählen</span><span>2 · Prüfen</span><span>3 · Nächsten Schritt sehen</span></div>
<div class="ppq-panel"><h2>Probiere es selbst aus</h2><p>Alle Fälle sind erfunden und enthalten keine persönlichen Daten.</p>
<div class="ppq-cases" role="group" aria-label="Beispielfall wählen">
<button class="ppq-choice" type="button" data-quick-case="funding" aria-pressed="true"><span>Fall 01</span><strong>Förderantrag · Unterlagen fehlen</strong></button>
<button class="ppq-choice" type="button" data-quick-case="travel" aria-pressed="false"><span>Fall 02</span><strong>Reisekosten · Betrag zu hoch</strong></button>
<button class="ppq-choice" type="button" data-quick-case="clean" aria-pressed="false"><span>Fall 03</span><strong>Förderantrag · alles vollständig</strong></button>
</div>
<div class="ppq-flow"><div class="ppq-check"><small>Das Problem</small><h3 id="ppqCaseTitle">Ein Antrag ist unvollständig.</h3><p id="ppqCaseDesc">Fünf Nachweise sind erforderlich. Drei liegen vor.</p><button type="button" id="ppqRun" class="ppq-primary">Fall jetzt prüfen →</button></div>
<div id="ppqOutput" class="ppq-output" data-state="ready" aria-live="polite"><small id="ppqStatus">Noch nicht geprüft</small><h3 id="ppqFinding">Was fehlt? Was ist zu tun?</h3><p id="ppqExplanation">Starte die Prüfung. Du siehst sofort, was das System herausgefunden hat und welcher Schritt als Nächstes folgt.</p>
<div class="ppq-next" id="ppqNext"><button type="button" class="ppq-primary" id="ppqAct">Nächsten Schritt vorbereiten →</button><button type="button" class="ppq-primary ppq-secondary" id="ppqEvidence">Belege ansehen</button></div>
<div id="ppqProof" class="ppq-proof"></div><div id="ppqDraft" class="ppq-draft"><small>Vorbereiteter Entwurf · wird nicht wirklich versendet</small><pre id="ppqDraftText"></pre></div></div></div>
<p class="ppq-boundary">Fiktive Fälle · keine echte Nachricht, Auszahlung oder Freigabe · Quellen und technische Prüfdetails unten einsehbar.</p>
</div>`;
main.insertBefore(quick,main.firstChild);
const advanced=document.createElement('details');advanced.className='ppq-advanced';advanced.id='ppqAdvanced';
const summary=document.createElement('summary');summary.textContent='Alle Unterlagen, Quellen und technischen Prüfdetails öffnen';advanced.appendChild(summary);
for(const selector of ['.proof-section.soft','.as-proof-strip','.as-release-evidence']){const el=main.querySelector(selector);if(el)advanced.appendChild(el);}
main.appendChild(advanced);document.body.classList.add('ppq-ready');document.documentElement.lang='de';
let selected='funding',phase='ready',busy=false;
function ui(state,status,title,description){q('ppqOutput').dataset.state=state;q('ppqStatus').textContent=status;q('ppqFinding').textContent=title;q('ppqExplanation').textContent=description;}
function setCase(key){
 if(!Object.prototype.hasOwnProperty.call(cases,key))return;
 selected=key;phase='ready';busy=false;
 document.querySelectorAll('[data-quick-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quickCase===key)));
 document.querySelector('.sample[data-case="'+key+'"]')?.click();
 const c=cases[key];q('ppqCaseTitle').textContent=key==='funding'?'Zwei Nachweise fehlen.':key==='travel'?'Die Kosten liegen über der Grenze.':'Der Antrag scheint vollständig.';
 q('ppqCaseDesc').textContent=key==='funding'?'Es werden fünf Nachweise verlangt; eingereicht wurden nur drei. Zwei Geldbeträge widersprechen sich.':key==='travel'?'Die Hotelrechnung beträgt 684 €, die zulässige Grenze im Beispiel liegt bei 540 €.':'Alle fünf Pflichtnachweise sind im Beispiel vorhanden.';
 q('ppqRun').disabled=false;q('ppqRun').textContent='Fall jetzt prüfen →';q('ppqNext').classList.remove('show');q('ppqProof').classList.remove('show');q('ppqDraft').classList.remove('show');q('ppqAct').disabled=false;
 ui('ready','Noch nicht geprüft','Was fehlt? Was ist zu tun?','Starte die Prüfung. Du siehst das Ergebnis und den nächsten sinnvollen Schritt.');
}
function clearProof(){q('ppqProof').replaceChildren();q('ppqProof').classList.remove('show');}
function showEvidence(){
 const panel=q('ppqProof'),items=cases[selected].evidence,ul=document.createElement('ul');
 for(const [title,desc] of items){const li=document.createElement('li');const strong=document.createElement('strong');strong.textContent=title+': ';li.append(strong,document.createTextNode(desc));ul.appendChild(li);}
 panel.replaceChildren(ul);panel.classList.add('show');
}
function finishCheck(){
 busy=false;const c=cases[selected],shown=q('result').classList.contains('show');
 if(!shown){ui('ready','Bitte erneut prüfen','Keine Ausgabe sichtbar','Die originale Prüfansicht hat noch kein Ergebnis geliefert.');q('ppqRun').disabled=false;return;}
 phase='checked';q('ppqRun').disabled=false;q('ppqRun').textContent='Erneut prüfen ↻';
 ui(c.pass?'passed':'review',c.pass?'Nachweise vollständig · menschliche Freigabe':'Prüfung abgeschlossen · Korrektur erforderlich',q('findingTitle').textContent,q('findingText').textContent+' '+q('nextText').textContent);
 q('ppqAct').textContent=c.pass?'Freigabe simulieren →':'Anfrage vorbereiten →';q('ppqNext').classList.add('show');
}
q('ppqRun').addEventListener('click',()=>{if(busy)return;busy=true;q('ppqRun').disabled=true;clearProof();q('ppqDraft').classList.remove('show');q('ppqNext').classList.remove('show');ui('ready','Prüfung läuft','Prüfung wird durchgeführt…','Unterlagen und Anforderungen werden gegeneinander abgeglichen.');q('run').click();setTimeout(finishCheck,650);});
q('ppqAct').addEventListener('click',()=>{
 const c=cases[selected];if(phase==='checked'){
  if(c.pass){q('approve').click();phase='done';ui('complete','Freigabe simuliert','Menschliche Freigabe dokumentiert.','Alle Checks waren im fiktiven Beispiel erfolgreich. Es wurde kein echtes externes System verändert.');q('ppqAct').disabled=true;return;}
  q('resolve').click();const draft=q('draftBody').textContent||c.resolution?.body||'';q('ppqDraftText').textContent=draft;q('ppqDraft').classList.add('show');phase='draft';q('ppqAct').textContent='Versand simulieren →';ui('review','Entwurf vorbereitet','Die nächste Handlung ist klar.','Der Text steht zur menschlichen Prüfung bereit. Noch wurde nichts versendet.');return;
 }
 if(phase==='draft'){q('queue').click();phase='done';q('ppqAct').disabled=true;ui('complete','Versand simuliert','Anfrage als versendet markiert.','Nur dieser fiktive Demo-Fall hat seinen Status geändert; keine echte Nachricht wurde verschickt.');}
});
q('ppqEvidence').addEventListener('click',()=>{if(q('ppqProof').classList.contains('show')){clearProof();q('ppqEvidence').textContent='Belege ansehen'}else{showEvidence();q('ppqEvidence').textContent='Belege ausblenden'}});
document.querySelectorAll('[data-quick-case]').forEach(b=>b.addEventListener('click',()=>setCase(b.dataset.quickCase)));
setCase('funding');
})();