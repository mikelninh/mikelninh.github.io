(function(){
'use strict';
const KEY='chess-command-piece-skin-v21';
const BASE='https://raw.githubusercontent.com/lichess-org/lila/master/public/piece';
const legacyMap={'♔':'K','♕':'Q','♖':'R','♗':'B','♘':'N','♙':'P','♚':'K','♛':'Q','♜':'R','♝':'B','♞':'N','♟':'P'};
const SKINS={
  chessnut:{name:'Command Classic',set:'chessnut',note:'Crisp tournament shapes',license:'Apache-2.0'},
  spatial:{name:'Spatial',set:'spatial',note:'Polished dimensional set',license:'MIT'},
  fantasy:{name:'Fantasy',set:'fantasy',note:'Elegant sculpted character',license:'MIT'},
  celtic:{name:'Celtic',set:'celtic',note:'Distinctive classic detail',license:'MIT'}
};
let current=(()=>{try{const s=localStorage.getItem(KEY);return SKINS[s]?s:'chessnut'}catch{return'chessnut'}})();
function asset(skin,color,type){const s=SKINS[skin]||SKINS.chessnut;return `${BASE}/${s.set}/${color}${type}.svg`}
function fallbackSvg(el,type){el.innerHTML='';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','./pieces.svg#'+type);svg.appendChild(use);el.appendChild(svg);el.dataset.skinPainted='fallback'}
function identity(el){let type=el.dataset.svgPiece;const text=(el.textContent||'').trim();if(!type&&text)type=legacyMap[text];if(!type)return null;el.dataset.svgPiece=type;const color=el.classList.contains('white')?'w':el.classList.contains('black')?'b':null;if(!color)return null;return{type,color}}
function paint(el,force=false){if(!el?.classList?.contains('piece'))return;const id=identity(el);if(!id)return;if(!force&&el.dataset.skinPainted===current&&el.querySelector('img.piece-art'))return;el.textContent='';const img=document.createElement('img');img.className='piece-art';img.alt='';img.draggable=false;img.decoding='async';img.src=asset(current,id.color,id.type);let fallbackTried=false;img.onerror=()=>{if(!fallbackTried&&current!=='chessnut'){fallbackTried=true;img.src=asset('chessnut',id.color,id.type);return}fallbackSvg(el,id.type)};el.appendChild(img);el.dataset.skinPainted=current}
function paintAll(root=document){if(root?.matches?.('.piece'))paint(root);root?.querySelectorAll?.('.piece').forEach(el=>paint(el))}
function preview(skin,color='w'){return ['N','Q','K'].map(t=>`<img src="${asset(skin,color,t)}" alt="" draggable="false">`).join('')}
function choose(key){if(!SKINS[key])return;current=key;try{localStorage.setItem(KEY,key)}catch{}document.body.dataset.pieceSkin=key;document.querySelectorAll('[data-piece-skin-choice]').forEach(b=>b.classList.toggle('active',b.dataset.pieceSkinChoice===key));document.querySelectorAll('.piece').forEach(el=>paint(el,true));document.dispatchEvent(new CustomEvent('cc:pieceskin',{detail:{skin:key,name:SKINS[key].name}}));const t=document.getElementById('toast');if(t){t.textContent=`Pieces · ${SKINS[key].name}`;t.classList.add('show');clearTimeout(choose.timer);choose.timer=setTimeout(()=>t.classList.remove('show'),1500)}}
function cards(){return Object.entries(SKINS).map(([key,s])=>`<button type="button" class="premium-skin-card ${key===current?'active':''}" data-piece-skin-choice="${key}"><span class="premium-skin-preview">${preview(key)}</span><span><b>${s.name}</b><small>${s.note}</small></span><em>${s.license}</em></button>`).join('')}
function wire(root=document){root.querySelectorAll?.('[data-piece-skin-choice]').forEach(b=>{b.onclick=()=>choose(b.dataset.pieceSkinChoice)})}
function buildThemeChooser(){const grid=document.querySelector('.piece-theme-grid');if(!grid)return;grid.classList.add('premium-piece-grid');grid.innerHTML=cards();wire(grid)}
function buildQuickChooser(){if(document.getElementById('pieceSkinQuick'))return;const actions=document.querySelector('.top-actions');if(!actions)return;const btn=document.createElement('button');btn.id='pieceSkinQuick';btn.className='icon-btn';btn.title='Piece skins';btn.setAttribute('aria-label','Choose chess piece skin');btn.textContent='♞';actions.prepend(btn);const sheet=document.createElement('div');sheet.id='pieceSkinSheet';sheet.className='piece-skin-sheet';sheet.hidden=true;sheet.innerHTML=`<button class="piece-skin-backdrop" data-piece-close aria-label="Close piece skins"></button><section><div class="piece-skin-sheet-head"><div><small>PIECE SKINS</small><h3>Choose your set.</h3></div><button type="button" data-piece-close aria-label="Close">×</button></div><div class="piece-skin-sheet-grid">${cards()}</div><p>Command Classic uses Chessnut (Apache-2.0). Spatial, Fantasy and Celtic are MIT-licensed Lichess piece assets.</p></section>`;document.body.appendChild(sheet);wire(sheet);btn.onclick=()=>{document.querySelectorAll('[data-piece-skin-choice]').forEach(b=>b.classList.toggle('active',b.dataset.pieceSkinChoice===current));sheet.hidden=false};sheet.querySelectorAll('[data-piece-close]').forEach(b=>b.onclick=()=>sheet.hidden=true)}
function init(){document.body.dataset.pieceSkin=current;paintAll();buildThemeChooser();buildQuickChooser()}
window.ChessPieceSkins={paint,paintAll,set:choose,current:()=>current,skins:SKINS,asset};
const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)paintAll(n)});
if(document.body)observer.observe(document.body,{childList:true,subtree:true});
init();
})();
