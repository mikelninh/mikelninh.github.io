/* GOOD QUESTION — Release 1.1: original product photography and a slow Play Desk.
   Product images are externally hosted by their original image publishers; the
   source/variant disclosure lives beside each image. No product affiliate scripts.
*/
(()=>{
 'use strict';
 const catalog=window.GQ_PHOTOS?.products, issue=window.GQ_LETTER;
 if(!catalog||!issue)return;
 const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lang=()=>['de','en','vi'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
 const copy={
  en:{source:'Photograph',different:'Packaging and country may differ; verify the item you buy.',photoUnavailable:'Photograph unavailable — inspect original source',photo:'Real product photograph',title:'We believe stories should sometimes be playable.',deck:'Not every question deserves another paragraph. Try a tiny evidence game, explore a dilemma, and visit our little game prototypes. Finish when you like.',lab:'Label Detective',labSub:'Three ingredient puzzles, original sources and no fake certainty. About two minutes.',labGo:'Play the label game',reef:'One Reef, Three Futures',reefSub:'Ahimsa meets ecology. Three responses to one difficult question; no winning score.',reefGo:'Explore the ethical dilemma',mia:'Mia & The Little Lights',miaSub:'An original interactive rooftop adventure from our creative studio (work in progress).',miaGo:'Visit Mia’s world',tactics:'Tiny Tactics: Friends',tacticsSub:'An experimental multiplayer tactics game. A rough, playable prototype.',tacticsGo:'Try Tiny Tactics',footer:'A game can deepen a question — never replace evidence. No streaks, no autoplay, no endless feed.',feedTitle:'Can we make our next issue better?',feedLead:'Tell us what was useful, what felt confusing, or which question we should explore next. A considered reply matters more than engagement metrics.',rating:'Did you find this edition useful?',choices:['Choose…','Yes, and I would share it','A little, still curious','Not yet — it needs work'],question:'Which topic, product or game should we explore next?',issue:'Open a public feedback draft ↗',copy:'Copy my feedback',private:'Feedback is not automatically sent or recorded. “Open draft” takes you to a public GitHub issue (account required); avoid private information. “Copy” keeps it with you.',copyDone:'Feedback copied. Send it when you wish.',quiz:'Explore original sources',rss:'Follow the Slow Edition by RSS',head:'THE PLAY DESK · ISSUE 001'},
  de:{source:'Produktfoto',different:'Packung und Herkunftsland können abweichen — gekaufte Ware prüfen.',photoUnavailable:'Foto nicht verfügbar – Quelle öffnen',photo:'Echtes Produktfoto',title:'Manche Geschichten möchte man spielen.',deck:'Nicht jede Frage braucht einen weiteren Absatz. Probiere ein kleines Quellen-Spiel, erkunde ein Dilemma und entdecke unsere Spieleprototypen. Danach ist Schluss — ganz bewusst.',lab:'Label Detective',labSub:'Drei Zutatenrätsel, echte Quellen und keine erfundene Gewissheit. Zwei Minuten.',labGo:'Zutatenrätsel spielen',reef:'Ein Riff, drei Zukünfte',reefSub:'Ahimsa trifft Ökologie. Drei Wege, eine schwierige Frage; keine Punktejagd.',reefGo:'Ethisches Dilemma entdecken',mia:'Mia & The Little Lights',miaSub:'Ein selbst entwickeltes Rooftop-Abenteuer aus unserem Kreativstudio (Work in Progress).',miaGo:'Mias Welt besuchen',tactics:'Tiny Tactics: Friends',tacticsSub:'Ein experimentelles Multiplayer-Taktikspiel. Spielbarer, unfertiger Prototyp.',tacticsGo:'Tiny Tactics testen',footer:'Ein Spiel kann eine Frage vertiefen — aber Belege nicht ersetzen. Keine Streaks, kein Autoplay, kein endloser Feed.',feedTitle:'Wie wird die nächste Ausgabe besser?',feedLead:'Was war nützlich? Was verwirrend? Welche Frage sollen wir als Nächstes aufgreifen? Eine durchdachte Rückmeldung ist uns wichtiger als Klickzahlen.',rating:'War diese Ausgabe für dich nützlich?',choices:['Bitte auswählen…','Ja, würde ich teilen','Ein bisschen, bin neugierig','Noch nicht, bitte verbessern'],question:'Welches Thema, Produkt oder Spiel sollen wir anschauen?',issue:'Öffentlichen Feedback-Entwurf öffnen ↗',copy:'Feedback kopieren',private:'Es wird nichts automatisch gesendet oder gespeichert. „Entwurf öffnen“ führt zu einem öffentlichen GitHub-Issue (Konto notwendig), bitte keine privaten Daten eintragen. „Kopieren“ behältst du bei dir.',copyDone:'Feedback kopiert. Schicke es, wenn du magst.',quiz:'Originalquellen erkunden',rss:'Slow Edition per RSS abonnieren',head:'UNSER SPIELREGAL · AUSGABE 001'},
  vi:{source:'Ảnh sản phẩm',different:'Bao bì và thị trường có thể khác; hãy kiểm tra đúng sản phẩm.',photoUnavailable:'Không tải được ảnh — xem nguồn',photo:'Ảnh sản phẩm thật',title:'Đôi khi một câu chuyện nên được chơi.',deck:'Không phải mọi câu hỏi đều cần một đoạn văn nữa. Hãy thử trò kiểm tra nhãn, suy nghĩ về lựa chọn đạo đức và ghé thăm những trò chơi còn đang phát triển của chúng tôi.',lab:'Thám tử nhãn thực phẩm',labSub:'Ba câu đố về thành phần, nguồn gốc và sự không chắc chắn. Khoảng hai phút.',labGo:'Chơi trò kiểm tra nhãn',reef:'Một rạn san hô, ba tương lai',reefSub:'Ahimsa và sinh thái. Ba cách nghĩ về câu hỏi khó, không có điểm thắng.',reefGo:'Khám phá lựa chọn đạo đức',mia:'Mia & The Little Lights',miaSub:'Cuộc phiêu lưu trên mái nhà do studio chúng tôi tạo (đang phát triển).',miaGo:'Đến thế giới của Mia',tactics:'Tiny Tactics: Friends',tacticsSub:'Trò chiến thuật nhiều người thử nghiệm, chưa hoàn thiện.',tacticsGo:'Thử Tiny Tactics',footer:'Trò chơi có thể giúp suy nghĩ nhưng không thay thế bằng chứng. Không chuỗi ngày, không tự phát, không cuộn vô tận.',feedTitle:'Chúng tôi có thể làm số sau tốt hơn?',feedLead:'Điều gì hữu ích? Điều gì khó hiểu? Bạn muốn tìm hiểu câu hỏi nào tiếp theo?',rating:'Số này có hữu ích với bạn?',choices:['Chọn…','Có, tôi muốn chia sẻ','Một chút, tôi vẫn tò mò','Chưa, cần cải thiện'],question:'Chủ đề, sản phẩm hoặc trò chơi tiếp theo?',issue:'Mở bản nháp góp ý công khai ↗',copy:'Sao chép góp ý',private:'Chưa gửi hoặc lưu tự động. Mở bản nháp tạo GitHub issue công khai (cần tài khoản); đừng đưa thông tin riêng tư. Sao chép để giữ nội dung.',copyDone:'Đã sao chép. Bạn có thể gửi khi muốn.',quiz:'Khám phá nguồn gốc',rss:'Theo dõi Slow Edition qua RSS',head:'GÓC TRÒ CHƠI · SỐ 001'}
 };
 const t=k=>(copy[lang()]||copy.en)[k]||k;
 const photoAlt=p=>({de:'Produktfoto: ',en:'Product package photograph: ',vi:'Ảnh bao bì: '}[lang()]||'Product photograph: ')+p.name;
 function renderOne(p){
  const node=$('.product-card[data-product="'+p.id+'"]');
  if(!node||node.querySelector('.gq-photo'))return;
  const container=$('.product-art',node);if(!container)return;
  const record=catalog[p.id];if(!record)return;
  const img=document.createElement('img');
  img.className='gq-photo';img.alt=photoAlt(p);img.loading='lazy';img.decoding='async';img.width=520;img.height=520;
  const sources=[record.url,record.alternate].filter(Boolean);
  let pos=0;let credit;
  img.addEventListener('load',()=>{
   if(img.naturalWidth>64&&img.naturalHeight>64){container.classList.add('has-photo');if(credit)credit.dataset.photoLoaded='true';}
   else img.dispatchEvent(new Event('error'));
  });
  img.addEventListener('error',()=>{
   if(++pos<sources.length)img.src=sources[pos];
   else {
     img.hidden=true;container.classList.remove('has-photo');
     if(credit)credit.querySelector('.source-status').textContent=t('photoUnavailable');
   }
  });
  container.appendChild(img);
  credit=document.createElement('div');credit.className='photo-credit';credit.innerHTML='<span class="source-status">'+escape(t('photo'))+'</span><a href="'+escape(record.photoPage)+'" target="_blank" rel="noopener noreferrer">'+escape(t('source'))+' ↗</a>';
  const note=document.createElement('p');note.className='photo-variant';note.textContent=t('different');
  const info=$('.product-info',node);if(info){info.before(credit);info.before(note)}
  img.src=sources[0];
 }
 function renderWarning(){
  const w=$('#ingredient-warning');if(!w||w.querySelector('.toomba-real-photo'))return;
  const p=catalog.toomba;
  const picture=document.createElement('div');picture.className='toomba-real-photo';
  const link=document.createElement('a');link.href=p.photoPage;link.target='_blank';link.rel='noopener noreferrer';link.textContent=t('source')+' ↗';
  const img=document.createElement('img');img.alt='Nongshim Shin Toomba 113 g cup — EAN 8801043017022';img.loading='lazy';img.width=200;img.height=200;
  img.addEventListener('load',()=>{if(img.naturalWidth>64)img.classList.add('ready')});img.addEventListener('error',()=>{img.remove();picture.appendChild(link)});
  picture.appendChild(img);w.appendChild(picture);w.classList.add('has-real-photo');const old=w.querySelector('.warning-illustration');old?.remove();
  img.src=p.url;
  const caveat=document.createElement('p');caveat.className='photo-version-note';
  caveat.innerHTML='EAN 8801043017022 · <a href="'+escape(p.photoPage)+'" target="_blank" rel="noopener noreferrer">'+escape(p.credit)+' ↗</a>';w.querySelector('div:first-child')?.appendChild(caveat);
 }
 function photos(){(issue.products||[]).filter(p=>p.status!=='not_vegan').forEach(renderOne);renderWarning()}
 const links=[
  {cls:'featured',num:'01 / THIS ISSUE',id:'lab',url:'./label-lab/',emoji:'🧪'},
  {cls:'',num:'02 / EDITORIAL PLAY',id:'reef',url:'../#play',emoji:'🐠'},
  {cls:'',num:'03 / STUDIO PROTOTYPE',id:'mia',url:'https://mikelninh.github.io/beyond-cv/mia-little-lights/',emoji:'🐈'},
  {cls:'',num:'04 / STUDIO PROTOTYPE',id:'tactics',url:'https://mikelninh.github.io/tiny-tactics-friends/',emoji:'♟'}
 ];
 function gameMarkup(){return `<section class="gq-playdesk" id="playdesk"><div class="wrap gq-playdesk-inner">
 <p class="gq-playdesk-kicker">${escape(t('head'))}</p>
 <div class="gq-playdesk-header"><h2>${escape(t('title'))}</h2><p>${escape(t('deck'))}</p></div>
 <div class="gq-game-grid">${links.map(x=>`<article class="gq-game-card ${x.cls}"><div class="gq-game-top"><span class="game-num">${escape(x.num)}</span><h3>${escape(t(x.id))}</h3><p>${escape(t(x.id+'Sub'))}</p></div><a href="${escape(x.url)}" ${x.url.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}><span>${escape(t(x.id+'Go'))}</span><span aria-hidden="true" style="font-size:19px">↗</span></a></article>`).join('')}</div>
 <p class="gq-playdesk-footer">${escape(t('footer'))}</p></div></section>`}
 function feedbackMarkup(){return `<section class="gq-feedback" id="reader-feedback"><div class="wrap gq-feedback-inner"><div><span class="eyebrow orange">THE READER'S DESK / 001</span><h2>${escape(t('feedTitle'))}</h2><p>${escape(t('feedLead'))}</p><a class="gq-nextletter" href="../feed.xml">${escape(t('rss'))} ↗</a></div>
 <form id="gq-feedback-form" class="gq-feedback-form"><label for="gq-feedback-rating">${escape(t('rating'))}</label>
 <select id="gq-feedback-rating" required><option value="">${escape(t('choices')[0])}</option><option value="useful">${escape(t('choices')[1])}</option><option value="partly">${escape(t('choices')[2])}</option><option value="needs-work">${escape(t('choices')[3])}</option></select>
 <label for="gq-feedback-question" style="margin-top:16px">${escape(t('question'))}</label><textarea id="gq-feedback-question" maxlength="650" placeholder="A question, an idea, a kind disagreement…"></textarea>
 <div class="gq-feedback-actions"><button type="submit">${escape(t('issue'))}</button><button type="button" id="gq-copy-feedback" class="secondary">${escape(t('copy'))}</button></div>
 <p class="gq-feedback-note">${escape(t('private'))}</p></form></div></section>`}
 function draftText(){const rating=$('#gq-feedback-rating')?.value||'',comment=$('#gq-feedback-question')?.value?.trim()||'';if(!rating&&!comment)return null;return 'WUNDERPOST 001 · Reader feedback\nEdition: '+location.origin+location.pathname+'\nLanguage: '+lang()+'\nUsefulness: '+(rating||'not selected')+'\nNext topic or correction: '+(comment||'(none given)')+'\n\nThis is a reader-written suggestion, not a confirmed editorial claim. Please do not add sensitive personal information.'}
 function init(){
  const pause=$('#pause');if(!pause)return;
  if(!$('#playdesk'))pause.insertAdjacentHTML('afterend',gameMarkup());
  if(!$('#reader-feedback')){$('.last-page')?.insertAdjacentHTML('afterend',feedbackMarkup())}
  const form=$('#gq-feedback-form');
  form?.addEventListener('submit',e=>{
   e.preventDefault();if(!form.reportValidity())return;
   const body=draftText();if(!body)return;
   const title='GOOD QUESTION · WUNDERPOST 001 reader idea';
   const dest='https://github.com/mikelninh/mikelninh.github.io/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
   window.open(dest,'_blank','noopener,noreferrer');
  });
  $('#gq-copy-feedback')?.addEventListener('click',async()=>{const text=draftText();if(!text)return;
   try{await navigator.clipboard.writeText(text);showToast(t('copyDone'))}
   catch{
    const textarea=$('#gq-feedback-question');textarea?.focus();textarea?.select();showToast(t('private'));
   }
  });
 }
 function showToast(text){const toast=$('#toast');if(!toast)return;toast.textContent=text;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.textContent='',3500)}
 function relang(){
  photos();
  $('#playdesk')?.remove();$('#reader-feedback')?.remove();init();
  $$('img.gq-photo').forEach(img=>{const card=img.closest('.product-card');const prod=issue.products.find(p=>p.id===card?.dataset.product);if(prod)img.alt=photoAlt(prod)});
 }
 init();photos();window.addEventListener('gq:language-changed',relang);
 window.GQ_11_TEST={photoIds:()=>Object.keys(catalog),loadedPhotos:()=>$$('.product-art.has-photo').length,gameCards:()=>$$('.gq-game-card').length,feedbackDestination:()=>$('#gq-feedback-form')?.action||'client draft'};
})();
