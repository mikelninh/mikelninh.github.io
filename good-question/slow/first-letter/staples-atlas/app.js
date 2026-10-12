/* GOOD THINGS / 70-PRODUCT ATLAS
  Research shortlist, not authenticated published reviews.
  No remote ratings, no trackers, no affiliate links or discount codes.
*/
(()=>{
'use strict';
const data=window.GQ_TIER_CATALOG;
if(!data?.items?.length)return;
const $=(s,parent=document)=>parent.querySelector(s);
const $$=(s,parent=document)=>Array.from(parent.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const validLang=['de','en','vi'];
const qs=new URLSearchParams(location.search);
const getStore=k=>{try{return localStorage.getItem(k)}catch{return null}};
const putStore=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
let language=validLang.includes(qs.get('lang'))?qs.get('lang'):getStore('gq-atlas-lang')||'de';
if(!validLang.includes(language))language='de';
const choices=['','S','A','B','C','D'];
const ids=new Set(data.items.filter(x=>x.cat!=='watch').map(x=>x.id));
const products=data.items.filter(x=>x.cat!=='watch'),watch=data.items.find(x=>x.cat==='watch');
const cats=['all','drinks','tofu','yogurt','cheese','meat','spreads','chips','chocolate','ramen'];
const catLabels={
de:{all:'Alle',drinks:'Pflanzendrinks',tofu:'Tofu & Tempeh',yogurt:'Joghurt',cheese:'Käsealternativen',meat:'Fleischalternativen',spreads:'Aufschnitt & Aufstriche',chips:'Chips',chocolate:'Schokolade',ramen:'Ramen'},
en:{all:'All',drinks:'Plant milks',tofu:'Tofu & Tempeh',yogurt:'Yogurt',cheese:'Cheese alternatives',meat:'Meat alternatives',spreads:'Deli & spreads',chips:'Crisps & chips',chocolate:'Chocolate',ramen:'Ramen'},
vi:{all:'Tất cả',drinks:'Sữa thực vật',tofu:'Đậu phụ & tempeh',yogurt:'Sữa chua',cheese:'Phô mai thực vật',meat:'Thay thế thịt',spreads:'Đồ kẹp bánh & phết',chips:'Khoai tây chiên',chocolate:'Sô cô la',ramen:'Mì ramen'}
};
const text={
de:{letter:'Zum Magazin',ramen:'Ramen Passport ↗',how:'Wie wir bewerten',titleTop:'Unser gutes',titleBottom:'Zeug.',heroLead:'Alles, was wir im Alltag probieren wollen. Vom knusprigen Snack bis zum Tofu, der vielleicht die Küche rettet. Zwei Menschen, zwei Meinungen — und keine ausgedachten Tests.',seeAll:'70 Produkte entdecken',share:'Liste teilen',lineOne:'FÜR NEUGIERIGE ESSER',lineTwo:'S / A / B / C — erst nach echtem Probieren',ourPromise:'UNSER VERSPRECHEN',protocolTitle:'Ein Lieblingsprodukt muss man sich verdienen.',protocolText:'Wir starten ohne erfundene Noten. Mikel und Huong dürfen unabhängig testen, widersprechen und später ihre persönlichen Ratings freigeben. Herstellerangaben sind keine eigene Etikettenprüfung. Die Fotos zeigen teils andere Landesverpackungen.',photoLimit:'Produktabbildungen stammen von verlinkten Händler-/Herstellerseiten; Nutzungsrechte, Hotlinks und Varianten müssen vor einer kommerziellen Veröffentlichung weiter geklärt werden.',catalogue:'Das ganze Regal.',catalogueLead:'70 echte Produktkandidaten aus neun Kategorien. Noch keine von euch freigegebenen Bewertungen.',items:'Produkte',shop:'Händler',view:'Ansicht',allProducts:'Alle Produkte',notRated:'Noch nicht bewertet',rated:'Mit Bewertung',savedOnly:'Einkaufsmerkliste',resetFilter:'Zurücksetzen',editorialDisclaimer:'Jede Karte zeigt ein konkretes Produktfoto mit Quelle — nicht zwingend die aktuellste Packung aus deinem Markt. Vegan-Status, Rezeptur, Allergene, Preis und Verfügbarkeit bitte immer vor dem Kauf am Etikett prüfen. Keine Affiliate-Links aktiv.',tiersHeadline:'Zwei Herzen, zwei Meinungen.',shareGrades:'Entwurf teilen',unverified:'Wichtig: Diese Noten stammen aus dem Browser, nicht aus einem verifizierten Mikel-/Huong-Konto. Persönliche Urteile werden erst nach Freigabe als echte Empfehlungen veröffentlicht.',yourBasket:'Unsere nächste Einkaufsliste',basketExplain:'Markierte Produkte werden lokal auf diesem Gerät gespeichert. Du kannst die Produktnamen kopieren, um sie beim nächsten Einkauf zu suchen.',copyBasket:'Einkaufsliste kopieren',clearPersonal:'Bewertungsentwurf löschen',watchTitle:'Lieber einmal mehr hinschauen.',watchText:'Ein Produkt zu mögen macht es nicht vegan. Bei dieser konkreten Toomba-Variante werden Milchbestandteile und Fischaroma gelistet. Deshalb erscheint sie nicht als vegane Kaufempfehlung.',whatsNext:'Snacks heute. Restaurants morgen.',whatsNextBody:'Einmal zusammen testen, ehrliche Notizen sammeln, aktualisieren. Unsere Restaurants und Teefavoriten bekommen später eigene, sorgfältig geprüfte Kapitel.',suggest:'Produkt vorschlagen ↗',footerNote:'Keine bezahlten Rankings. Keine erfundenen Lieblingsprodukte. Ein Regal voller Möglichkeiten.',shareTitle:'Deine Tier List teilen',shareNotes:'Der Link enthält nur die von dir eingetragenen S-/A-/B-/C-Noten und die Sprache. Er bestätigt nicht, wer sie vergeben hat.',theLink:'Dein Link',copyLink:'Link kopieren',searchHint:'Marke oder Produkt suchen …',allStore:'Alle',otherStore:'Andere',choose:'Noch nicht getestet',photo:'Fotoquelle',source:'Produktquelle',variant:'Anderes Markt-/Verpackungsbild: ',local:'Lokal gespeichert',mark:'Einkaufsliste',unmark:'Aus Einkaufsliste entfernen',unratedText:'Noch keine Ratings — wir testen zuerst.',emptyText:'Hier ist gerade nichts. Andere Filter probieren?',more:'Weitere Produkte laden',copyOk:'Einkaufsliste kopiert',copyFails:'Kopieren nicht möglich. Text markieren.',resetConfirm:'Beide Bewertungsentwürfe und Einkaufsliste wirklich löschen?',defaultNote:'Etikett vor Kauf prüfen',market:'Abweichende Marktverpackung',outdated:'Verpackung kann abweichen',photoMissing:'Foto nicht verfügbar',photoOpen:'Packshot öffnen',pack:'Packung prüfen',warning:'Nicht vegan in dieser Variante',gradeA:'Eigene Bewertung',snapshot:'Geteilter, nicht identitätsgeprüfter Entwurf',nothingSaved:'Noch nichts markiert.',linkCopy:'Link kopiert',copied:'Kopiert',draft:'Lokal bearbeitbar'},
en:{letter:'The letter',ramen:'Ramen Passport ↗',how:'How we rate',titleTop:'The good',titleBottom:'things.',heroLead:'Things we actually want to try — from crunchy snacks to a tofu that just might rescue dinner. Two people, two opinions, zero imaginary taste tests.',seeAll:'Explore 70 products',share:'Share the list',lineOne:'FOR CURIOUS EATERS',lineTwo:'S / A / B / C — only after real testing',ourPromise:'OUR PROMISE',protocolTitle:'A favourite should earn its place.',protocolText:'We begin without invented ratings. Mikel and Huong can taste independently, disagree and approve their own recommendations later. Retailer claims are not our personal label checks. Some photos are from other markets.',photoLimit:'Product images are linked from original publisher pages; image rights, external hosting and country variants require review before commercial release.',catalogue:'The whole shelf.',catalogueLead:'70 product candidates across nine categories. No ratings attributed to either of us yet.',items:'products',shop:'Retailer',view:'View',allProducts:'All products',notRated:'Not yet rated',rated:'Rated',savedOnly:'Shopping shortlist',resetFilter:'Reset',editorialDisclaimer:'Every card has a sourced product photo, not necessarily the latest package sold locally. Always check the actual ingredients, vegan status, allergens, price and availability. No affiliate links are active.',tiersHeadline:'Two hearts, two opinions.',shareGrades:'Share draft tiers',unverified:'These grades are entered in this browser, not authenticated as Mikel or Huong’s personal reviews. We will only publish attributed opinions with their explicit approval.',yourBasket:'Our next shopping list',basketExplain:'Saved products remain locally on this device. Copy the names to help find them on your next shop.',copyBasket:'Copy shopping list',clearPersonal:'Clear draft grades',watchTitle:'One more look at the label.',watchText:'Enjoying a flavour doesn’t make it vegan. The specific listed Toomba variant includes milk-derived ingredients and fish flavouring, and is excluded from vegan recommendations.',whatsNext:'Snacks today. Restaurants tomorrow.',whatsNextBody:'Taste together, take real notes and update. Restaurants and tea favourites deserve their own carefully researched chapters.',suggest:'Suggest a product ↗',footerNote:'No paid rankings. No invented favourites. Just possibilities worth trying.',shareTitle:'Share your Tier List',shareNotes:'The link contains only the grades entered here and the language, not proof of who actually rated them.',theLink:'Your link',copyLink:'Copy link',searchHint:'Search brands and products …',allStore:'All',otherStore:'Other',choose:'Not tested',photo:'Photo source',source:'Product source',variant:'Packaging from another market: ',local:'Saved locally',mark:'Add to shopping list',unmark:'Remove from list',unratedText:'No ratings yet — taste first.',emptyText:'Nothing here yet. Try another filter.',more:'Load more',copyOk:'Shopping list copied',copyFails:'Could not copy. Select the text instead.',resetConfirm:'Delete both local grade drafts and the shopping list?',defaultNote:'Check the pack before buying',market:'Different market packaging',outdated:'Packaging may change',photoMissing:'Photo unavailable',photoOpen:'Open packshot',pack:'Check packet',warning:'Not vegan: this listed variant',gradeA:'Your grade',snapshot:'Shared, non-verified draft',nothingSaved:'Nothing saved yet.',linkCopy:'Link copied',copied:'Copied',draft:'Local edit'},
vi:{letter:'Về tạp chí',ramen:'Ramen Passport ↗',how:'Cách đánh giá',titleTop:'Những món',titleBottom:'tốt đẹp.',heroLead:'Những món chúng tôi thật sự muốn thử: từ snack giòn đến đậu phụ cho bữa tối. Hai người, hai ý kiến, không có thử vị bịa đặt.',seeAll:'Khám phá 70 sản phẩm',share:'Chia sẻ',lineOne:'DÀNH CHO NGƯỜI TÒ MÒ',lineTwo:'S / A / B / C — chỉ sau khi thật sự thử',ourPromise:'CAM KẾT',protocolTitle:'Món yêu thích cần được chứng minh.',protocolText:'Chúng tôi bắt đầu mà chưa gán điểm. Mikel và Huong có thể tự thử, bất đồng và tự phê duyệt nhận xét của mình. Thông tin hãng không thay kiểm tra nhãn; một số ảnh từ thị trường khác.',photoLimit:'Ảnh sản phẩm đến từ trang của hãng và cửa hàng; quyền sử dụng, liên kết ảnh và phiên bản theo nước cần được kiểm tra.',catalogue:'Cả kệ đồ.',catalogueLead:'70 sản phẩm ứng viên trong chín nhóm. Chưa có điểm cá nhân chính thức.',items:'sản phẩm',shop:'Cửa hàng',view:'Hiển thị',allProducts:'Tất cả',notRated:'Chưa đánh giá',rated:'Đã đánh giá',savedOnly:'Danh sách mua',resetFilter:'Đặt lại',editorialDisclaimer:'Mỗi thẻ có ảnh sản phẩm và nguồn, có thể khác gói hiện tại tại Đức. Trước khi mua, luôn kiểm tra thành phần, thuần chay, dị ứng, giá và hàng có sẵn. Chưa có liên kết affiliate.',tiersHeadline:'Hai trái tim, hai sở thích.',shareGrades:'Chia sẻ bản nháp',unverified:'Điểm được nhập trong trình duyệt, chưa xác minh là ý kiến thật của Mikel hay Huong. Chỉ công bố khi từng người đồng ý.',yourBasket:'Danh sách mua tiếp theo',basketExplain:'Món được đánh dấu lưu trên thiết bị này. Sao chép để tìm khi đi chợ.',copyBasket:'Sao chép danh sách',clearPersonal:'Xóa điểm nháp',watchTitle:'Hãy đọc kỹ nhãn.',watchText:'Thích một hương vị không có nghĩa nó thuần chay. Phiên bản Toomba cụ thể này được liệt kê có sữa và hương cá, nên không được quảng bá như món thuần chay.',whatsNext:'Snack hôm nay. Quán ăn ngày mai.',whatsNextBody:'Cùng thử, ghi nhận thật, cập nhật. Nhà hàng và trà sẽ có chương riêng được kiểm tra kỹ.',suggest:'Gợi ý sản phẩm ↗',footerNote:'Không xếp hạng trả tiền. Không bịa món yêu thích. Chỉ có những điều đáng thử.',shareTitle:'Chia sẻ Tier List',shareNotes:'Liên kết chỉ có các điểm được nhập và ngôn ngữ, không chứng minh người đánh giá.',theLink:'Liên kết',copyLink:'Sao chép liên kết',searchHint:'Tìm thương hiệu hoặc sản phẩm …',allStore:'Tất cả',otherStore:'Khác',choose:'Chưa thử',photo:'Nguồn ảnh',source:'Nguồn sản phẩm',variant:'Bao bì từ thị trường khác: ',local:'Lưu cục bộ',mark:'Thêm vào danh sách mua',unmark:'Bỏ khỏi danh sách',unratedText:'Chưa có điểm — hãy thử trước.',emptyText:'Chưa có món phù hợp, thử bộ lọc khác.',more:'Xem thêm',copyOk:'Đã sao chép danh sách',copyFails:'Không thể sao chép. Hãy chọn văn bản.',resetConfirm:'Xóa điểm nháp của cả hai và danh sách mua?',defaultNote:'Kiểm tra nhãn trước khi mua',market:'Bao bì nước khác',outdated:'Bao bì có thể thay đổi',photoMissing:'Không tải được ảnh',photoOpen:'Mở ảnh gói',pack:'Kiểm tra gói',warning:'Không thuần chay ở bản này',gradeA:'Điểm của bạn',snapshot:'Bản nháp chia sẻ chưa xác minh',nothingSaved:'Chưa lưu món nào.',linkCopy:'Đã sao chép liên kết',copied:'Đã sao chép',draft:'Chỉnh sửa cục bộ'}
};
const currentIds=products.map(x=>x.id);
const readState=()=>{
 let obj={mikel:{},huong:{},saved:[]};
 try{const p=JSON.parse(getStore('gq-atlas-ratings-1')||'null');if(p&&typeof p==='object')obj=p}catch{}
 for(const who of ['mikel','huong']){
  const ratings={};for(const [id,v] of Object.entries(obj[who]||{}))if(ids.has(id)&&choices.includes(v)&&v)ratings[id]=v;
  obj[who]=ratings;
 }
 obj.saved=[...new Set((Array.isArray(obj.saved)?obj.saved:[]).filter(x=>ids.has(x)))];
 return obj;
};
let state=readState(),filter='all',store='all',view='all',term='',limit=24,snapshot=false;
const shareInput=qs.get('ratings')||'';
if(shareInput&&shareInput.length<3500){
 let used=0;const m={mikel:{},huong:{},saved:[]};
 for(const part of shareInput.split(',')){
  if(++used>products.length)break;
  const [id,value]=part.split(':');
  if(!ids.has(id)||!value||!/^([SABCD-])([SABCD-])$/.test(value))continue;
  if(value[0]!=='-')m.mikel[id]=value[0];
  if(value[1]!=='-')m.huong[id]=value[1];snapshot=true;
 }
 if(snapshot){state={...m,saved:state.saved};putStore('gq-atlas-ratings-1',JSON.stringify(state))}
}
const T=k=>text[language][k]||text.de[k]||k;
const saveState=()=>{if(!putStore('gq-atlas-ratings-1',JSON.stringify(state)))toast(T('local'))};
const format=(cat)=>catLabels[language][cat]||cat;
const imageHost=url=>{try{return new URL(url).hostname.replace(/^www\./,'')}catch{return 'Bildquelle'}};
const sanitizeUrl=url=>/^https:\/\//.test(url)?url:'#';
function toast(s){const e=$('#toast');e.textContent=s;clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.textContent='',3300)}
function translate(){
 document.documentElement.lang=language;
 $$('[data-t]').forEach(node=>{
  const val=T(node.dataset.t);node.textContent=val;
 });
 $('#search').placeholder=T('searchHint');
 $$('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===language)));
 $('#store option[value=all]').textContent=T('allStore');
 $('#store option[value=Supermärkte]').textContent=T('otherStore');
 $('#mode option[value=all]').textContent=T('allProducts');
 $('#mode option[value=unrated]').textContent=T('notRated');
 $('#mode option[value=graded]').textContent=T('rated');
 $('#mode option[value=saved]').textContent=T('savedOnly');
 renderCategoryBar();
 document.title='GOOD THINGS · '+(language==='de'?'Mikel & Huongs Vegan Tier List':language==='vi'?'Mikel & Huong · Danh sách đồ chay':'Mikel & Huong · Vegan Tier List');
}
function renderCategoryBar(){
 $('#category-bar').innerHTML=cats.map(cat=>{
  const count=cat==='all'?products.length:products.filter(p=>p.cat===cat).length;
  return '<button type="button" class="category" data-category="'+cat+'" aria-pressed="'+(cat===filter)+'">'+esc(format(cat))+' <span>'+count+'</span></button>';
 }).join('');
}
function ratingSelect(who,p){
 const old=state[who]?.[p.id]||'';
 return '<label>'+who.toUpperCase()+'<select data-grade="'+who+'" data-id="'+esc(p.id)+'" aria-label="'+who+' · '+esc(p.brand+' '+p.name)+'">'+choices.map((grade,i)=>'<option value="'+grade+'" '+(grade===old?'selected':'')+'>'+(grade||'—')+'</option>').join('')+'</select></label>';
}
function renderCard(p){
 const region=p.region==='DE'?'':T('variant')+p.region+'. ';
 const variant=region+(p.note||T('outdated'));
 const saved=state.saved.includes(p.id);
 return '<article class="product-card" data-product="'+esc(p.id)+'">'+
  '<div class="product-image"><img src="'+esc(sanitizeUrl(p.img))+'" alt="'+esc(p.brand+' '+p.name+' · Produktpackung')+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="500" height="500">'+
  '<div class="photo-unavailable"><strong>'+esc(p.brand+' '+p.name)+'</strong><span>'+esc(T('photoMissing'))+'</span><a target="_blank" rel="noopener noreferrer" href="'+esc(sanitizeUrl(p.img))+'">'+esc(T('photoOpen'))+' ↗</a></div>'+
  '<a class="image-ref" target="_blank" rel="noopener noreferrer" href="'+esc(sanitizeUrl(p.img))+'">'+esc(T('photo'))+': '+esc(imageHost(p.img))+' ↗</a></div>'+
  '<div class="product-body"><div class="card-overline"><span>'+esc(p.brand.toUpperCase())+'</span><span>'+esc(format(p.cat).toUpperCase())+'</span></div>'+
  '<h3>'+esc(p.name)+'</h3><p class="product-sub">'+esc(p.store)+'</p>'+
  '<p class="variant-note">'+esc(variant)+'</p><a class="source-link" target="_blank" rel="noopener noreferrer" href="'+esc(sanitizeUrl(p.source))+'">'+esc(T('source'))+' ↗</a></div>'+
  '<div class="ratings">'+ratingSelect('mikel',p)+ratingSelect('huong',p)+
  '<div class="rating-save"><button data-save="'+esc(p.id)+'" aria-pressed="'+saved+'" type="button">'+(saved?'♥':'♡')+' '+esc(saved?T('unmark'):T('mark'))+'</button><span>'+esc(T('pack'))+'</span></div></div></article>';
}
function list(){
 let arr=products.filter(p=>{
  if(filter!=='all'&&p.cat!==filter)return false;
  if(store!=='all'&&!p.store.toLowerCase().includes(store.toLowerCase()))return false;
  if(view==='unrated'&&(state.mikel[p.id]||state.huong[p.id]))return false;
  if(view==='graded'&&!(state.mikel[p.id]||state.huong[p.id]))return false;
  if(view==='saved'&&!state.saved.includes(p.id))return false;
  const hay=(p.brand+' '+p.name+' '+p.store+' '+p.cat+' '+p.note).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const search=term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return hay.includes(search);
 });
 $('#visible-count').innerHTML=String(arr.length)+' <small>'+esc(T('items'))+'</small>';
 const box=$('#products-grid');box.innerHTML=arr.slice(0,limit).map(renderCard).join('');
 box.setAttribute('aria-busy','false');
 $('#empty-state').hidden=arr.length>0;$('#empty-state').textContent=T('emptyText');
 $('#pagination').innerHTML=arr.length>limit?'<button type="button" id="load-more">'+esc(T('more'))+' ('+(arr.length-limit)+')</button>':'';
 $('img',box).forEach(img=>{
   const p=products.find(p=>p.id===img.closest('[data-product]')?.dataset.product);
   const alternates=(p?.imgAlternates||[]).filter(url=>/^https:\/\//.test(url));
   let attempt=0;
   const onFail=()=>{
     if(attempt<alternates.length){
       const next=alternates[attempt++];
       img.closest('.product-image').classList.remove('missing');
       img.src=next;
       const credit=img.closest('.product-image').querySelector('.image-ref');
       if(credit){credit.href=next;credit.textContent=T('photo')+': '+imageHost(next)+' ↗'}
     }else img.closest('.product-image').classList.add('missing');
   };
   img.addEventListener('error',onFail);
   if(img.complete&&!img.naturalWidth)onFail();
 });
 renderSummary();
}
function renderSummary(){
 for(const who of ['mikel','huong']){
  const rows=products.filter(p=>state[who]?.[p.id]).sort((a,b)=>choices.indexOf(state[who][a.id])-choices.indexOf(state[who][b.id]));
  $('#'+who+'-ranking').innerHTML=rows.length?rows.map(p=>'<div class="duo-row"><b>'+esc(state[who][p.id])+'</b><span>'+esc(p.brand+' '+p.name)+'</span></div>').join(''):'<p class="duo-empty">'+esc(T('unratedText'))+'</p>';
 }
 const saved=products.filter(p=>state.saved.includes(p.id));
 $('#saved-list').innerHTML=saved.length?saved.map(p=>'<span>'+esc(p.brand+' '+p.name)+'</span>').join(''):'<p class="duo-empty">'+esc(T('nothingSaved'))+'</p>';
}
function showWarning(){
 if(!watch)return;
 $('#warning-product').innerHTML='<article class="warning-card">'+
  '<img src="'+esc(watch.img)+'" loading="lazy" decoding="async" alt="'+esc(watch.name)+'" width="150" height="150">'+
  '<div><h3>'+esc(watch.name)+'</h3><p>'+esc(watch.note)+'</p><a target="_blank" rel="noopener noreferrer" href="'+esc(watch.source)+'">'+esc(T('source'))+' ↗</a></div></article>';
}
function resetFilters(){filter=store=view='all';term='';limit=24;$('#search').value='';$('#store').value='all';$('#mode').value='all';renderCategoryBar();list()}
function setLanguage(l){
 language=validLang.includes(l)?l:'de';
 putStore('gq-atlas-lang',language);
 const u=new URL(location.href);u.searchParams.set('lang',language);
 try{history.replaceState(null,'',u)}catch{}
 translate();list();
}
function sharingURL(){
 const u=new URL(location.href);u.hash='our-tiers';u.searchParams.set('lang',language);
 const codes=products.map(p=>{
  const a=state.mikel[p.id]||'-',b=state.huong[p.id]||'-';
  return a==='-'&&b==='-'?null:p.id+':'+a+b;
 }).filter(Boolean);
 if(codes.length)u.searchParams.set('ratings',codes.join(','));else u.searchParams.delete('ratings');
 return u.href;
}
function openShare(){
 const dlg=$('#share-dialog');$('#share-url').value=sharingURL();
 if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
}
async function copy(text){
 try{if(!navigator.clipboard)throw Error('no clipboard');await navigator.clipboard.writeText(text);toast(T('copied'))}
 catch{openShare();$('#share-url').value=text;$('#share-url').focus();$('#share-url').select()}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.category){filter=b.dataset.category;limit=24;renderCategoryBar();list()}
 if(b.dataset.lang)setLanguage(b.dataset.lang);
 if(b.dataset.save){const id=b.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];saveState();list()}
 if(b.id==='load-more'){limit+=24;list()}
 if(b.id==='clear-filters')resetFilters();
 if(b.id==='share-list'||b.id==='share-list-top')openShare();
 if(b.id==='close-dialog')$('#share-dialog').close();
 if(b.id==='copy-url')copy($('#share-url').value);
 if(b.id==='copy-list'){const selected=products.filter(p=>state.saved.includes(p.id));const list=selected.map(p=>p.brand+' · '+p.name+' — '+p.store).join('\n');if(list)copy('GOOD THINGS · Einkaufsliste\n'+list);else toast(T('nothingSaved'))}
 if(b.id==='reset-ratings'&&confirm(T('resetConfirm'))){state={mikel:{},huong:{},saved:[]};saveState();list()}
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.grade){
  if(!ids.has(t.dataset.id)||!choices.includes(t.value))return;
  const who=t.dataset.grade;if(!['mikel','huong'].includes(who))return;
  if(t.value)state[who][t.dataset.id]=t.value;else delete state[who][t.dataset.id];
  saveState();renderSummary();
  if(view==='unrated'||view==='graded')list();
 }
 if(t.id==='store'){store=t.value;limit=24;list()}
 if(t.id==='mode'){view=t.value;limit=24;list()}
});
$('#search').addEventListener('input',e=>{term=e.target.value.trim();limit=24;list()});
$('#share-dialog').addEventListener('click',e=>{if(e.target.id==='share-dialog')$('#share-dialog').close()});
translate();list();showWarning();
window.GQ_ATLAS_TEST={count:()=>products.length,imageCount:()=>data.items.filter(x=>x.img.startsWith('https://')).length,grades:()=>JSON.parse(JSON.stringify({mikel:state.mikel,huong:state.huong})),saved:()=>[...state.saved],shareURL:sharingURL,filter:c=>{filter=c;limit=products.length;renderCategoryBar();list()},all:()=>{filter='all';limit=products.length;renderCategoryBar();list()},currentLang:()=>language,provenance:()=>data.items.map(p=>({id:p.id,source:p.source,img:p.img,region:p.region}))};
})();