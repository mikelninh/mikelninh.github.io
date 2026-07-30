(()=>{
const svg=document.querySelector('#avatarSvg');
const NS='http://www.w3.org/2000/svg';
const CHARACTERS={
 nyra:{skin:'#f1d7e3',skinShadow:'#cfa9bc',hair:'#171022',hair2:'#4c2b6c',iris:'#a878ff',cloth:'#21132e',cloth2:'#6e4599',accent:'#d7b8ff',lip:'#7a405e',role:'The midnight guide',hair:'long'},
 lumen:{skin:'#ead8cd',skinShadow:'#c2a99b',hair:'#15282b',hair2:'#346b67',iris:'#6dd8bd',cloth:'#17302f',cloth2:'#4a8f83',accent:'#b7f5df',lip:'#8c5c61',role:'The honest mirror',hair:'short'},
 hikari:{skin:'#f4d7c4',skinShadow:'#cba68e',hair:'#5a3417',hair2:'#d28b32',iris:'#ffd36f',cloth:'#6b3516',cloth2:'#d88b2e',accent:'#fff0a7',lip:'#a75b4f',role:'The radiant quest spark',hair:'pony'},
 yume:{skin:'#ead9e5',skinShadow:'#c0abc2',hair:'#17233c',hair2:'#4c6ea7',iris:'#8eb5ff',cloth:'#1a2948',cloth2:'#557db8',accent:'#dbe8ff',lip:'#806071',role:'The quiet dream guide',hair:'bob'},
 vexa:{skin:'#f0ced8',skinShadow:'#c697a6',hair:'#28101d',hair2:'#8d264c',iris:'#ff7ca4',cloth:'#3a1122',cloth2:'#a63256',accent:'#ffd0de',lip:'#9d3757',role:'The dramatic guardian',hair:'wing'}
};
let active='nyra',mouthTarget=0,mouth=0,phase='offline',emotion='calm',gesture='still',pointer={x:0,y:0},blink=0,blinkAt=performance.now()+1700,last=performance.now();
function esc(s){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function hairBack(type,c){
 if(type==='short')return `<path d="M215 343 C213 190 302 105 431 129 C529 145 565 233 542 386 C510 339 500 291 478 249 C427 312 332 319 263 277 C245 310 232 340 215 343Z" fill="url(#hairBack)"/>`;
 if(type==='pony')return `<path d="M222 349 C196 216 286 112 416 124 C507 133 557 198 549 317 C594 255 642 249 657 298 C674 355 617 410 553 392 C532 359 515 312 488 260 C426 308 331 313 260 275 C241 305 230 334 222 349Z" fill="url(#hairBack)"/><path d="M541 247 C618 209 673 247 659 322 C642 382 585 408 538 379 C565 333 570 292 541 247Z" fill="${c.hair2}" opacity=".85"/>`;
 if(type==='bob')return `<path d="M208 357 C194 210 286 112 420 128 C531 141 575 228 546 401 C500 439 266 443 206 383 C207 374 208 365 208 357Z" fill="url(#hairBack)"/>`;
 if(type==='wing')return `<path d="M205 359 C190 205 285 105 421 125 C526 141 578 231 548 388 C518 352 505 309 481 260 C420 313 327 316 255 274 C237 306 221 342 205 359Z" fill="url(#hairBack)"/><path d="M214 222 C142 224 111 278 139 340 C158 382 198 403 242 382 C214 344 203 293 214 222Z" fill="${c.hair2}" opacity=".78"/><path d="M527 219 C605 218 647 277 617 343 C598 385 554 404 514 380 C541 335 546 282 527 219Z" fill="${c.hair2}" opacity=".78"/>`;
 return `<path d="M207 361 C192 201 286 104 422 125 C536 143 582 239 547 426 C502 474 254 467 205 409 C208 393 208 377 207 361Z" fill="url(#hairBack)"/>`;
}
function hairFront(type,c){
 if(type==='short')return `<path d="M246 246 C278 165 353 133 438 149 C488 158 517 191 528 235 C475 215 430 219 391 246 C354 269 304 275 246 246Z" fill="url(#hairFront)"/><path d="M434 150 C457 208 430 251 393 285 C403 220 370 181 341 151Z" fill="${c.hair2}" opacity=".76"/>`;
 if(type==='pony')return `<path d="M244 247 C277 163 355 129 443 150 C493 162 519 195 531 237 C474 215 424 224 385 254 C345 282 299 277 244 247Z" fill="url(#hairFront)"/><path d="M329 147 C357 191 338 245 301 298 C300 224 280 183 257 169Z" fill="${c.hair2}" opacity=".76"/><path d="M451 157 C471 204 451 246 420 285 C426 223 397 180 368 151Z" fill="${c.hair2}" opacity=".67"/>`;
 if(type==='bob')return `<path d="M239 244 C280 157 361 130 446 154 C491 167 518 198 529 237 C472 219 421 227 382 258 C339 288 291 276 239 244Z" fill="url(#hairFront)"/><path d="M343 143 C371 183 354 234 318 291 C316 221 294 180 268 161Z" fill="${c.hair2}" opacity=".72"/>`;
 if(type==='wing')return `<path d="M239 247 C275 157 356 126 447 151 C494 164 522 198 531 240 C474 216 421 226 382 258 C338 292 288 279 239 247Z" fill="url(#hairFront)"/><path d="M350 144 C384 177 374 227 337 299 C329 226 303 179 270 157Z" fill="${c.hair2}" opacity=".75"/><path d="M438 153 C460 200 441 244 406 287 C413 223 383 178 356 149Z" fill="${c.hair2}" opacity=".66"/>`;
 return `<path d="M237 248 C271 156 352 123 448 150 C499 165 526 201 533 244 C469 213 415 230 375 267 C332 307 282 279 237 248Z" fill="url(#hairFront)"/><path d="M330 143 C381 175 369 235 314 318 C310 228 286 175 255 155Z" fill="${c.hair2}" opacity=".8"/><path d="M453 157 C478 207 455 258 410 306 C420 229 391 178 358 147Z" fill="${c.hair2}" opacity=".68"/>`;
}
function accessory(type,c){
 if(type==='long')return `<g transform="translate(488 222)"><circle r="19" fill="#0b0911" stroke="${c.accent}" stroke-width="4"/><path d="M-3-11 A13 13 0 1 0 8 10 A10 10 0 1 1-3-11" fill="${c.accent}"/></g>`;
 if(type==='pony')return `<g transform="translate(531 221)"><path d="M0-22 L7-7 L23 0 L7 7 L0 23 L-7 7 L-23 0 L-7-7Z" fill="${c.accent}"/><circle r="6" fill="#fff5c8"/></g>`;
 if(type==='bob')return `<g transform="translate(499 229)"><path d="M-16 0 Q0-18 16 0 Q0 18-16 0Z" fill="none" stroke="${c.accent}" stroke-width="5"/><circle r="5" fill="${c.accent}"/></g>`;
 if(type==='wing')return `<g transform="translate(490 215)"><path d="M-22 6 Q-2-20 18-5 Q2 2 20 20 Q-2 17-22 6Z" fill="${c.accent}"/><circle cx="3" cy="2" r="5" fill="#fff0f6"/></g>`;
 return `<g transform="translate(485 221)"><circle r="13" fill="${c.accent}" opacity=".85"/></g>`;
}
function build(character){
 const c=CHARACTERS[character];active=character;
 svg.innerHTML=`
 <defs>
  <radialGradient id="halo" cx="50%" cy="42%"><stop offset="0" stop-color="${c.accent}" stop-opacity=".34"/><stop offset=".55" stop-color="${c.hair2}" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="hairBack" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.hair2}"/><stop offset=".45" stop-color="${c.hair}"/><stop offset="1" stop-color="#07060c"/></linearGradient>
  <linearGradient id="hairFront" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.hair2}"/><stop offset=".5" stop-color="${c.hair}"/><stop offset="1" stop-color="#0a0710"/></linearGradient>
  <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.cloth2}"/><stop offset=".48" stop-color="${c.cloth}"/><stop offset="1" stop-color="#09070d"/></linearGradient>
  <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff5f7"/><stop offset=".45" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.skinShadow}"/></linearGradient>
  <filter id="softGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity=".42"/></filter>
 </defs>
 <circle cx="360" cy="355" r="310" fill="url(#halo)"/>
 <g opacity=".32" fill="${c.accent}">${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<circle cx="${80+(i*97)%580}" cy="${80+(i*71)%520}" r="${i%3===0?3:1.7}"/>`).join('')}</g>
 <g id="body" filter="url(#shadow)">
  <path d="M82 820 C104 652 212 595 307 576 L413 576 C508 595 616 652 638 820Z" fill="url(#cloth)"/>
  <path d="M279 597 Q360 660 441 597 L420 571 L300 571Z" fill="${c.accent}" opacity=".22"/>
  <path d="M316 518 L404 518 L413 595 Q360 632 307 595Z" fill="url(#skin)"/>
  ${hairBack(c.hair,c)}
  <g id="head">
   <path d="M244 241 C252 160 303 116 371 116 C454 116 505 174 503 264 L493 379 C486 454 436 505 360 510 C284 505 234 454 227 379 L217 271 C214 260 225 248 244 241Z" fill="url(#skin)"/>
   <path d="M226 330 C198 309 193 356 220 385" fill="none" stroke="${c.skinShadow}" stroke-width="13" stroke-linecap="round"/><path d="M494 330 C522 309 527 356 500 385" fill="none" stroke="${c.skinShadow}" stroke-width="13" stroke-linecap="round"/>
   <g id="eyes">
    <g id="leftEye" transform="translate(304 329)"><path d="M-48 0 Q0-37 50-2 Q0 30-48 0Z" fill="#fff8fb"/><ellipse class="iris" cx="4" cy="-1" rx="19" ry="23" fill="${c.iris}"/><ellipse cx="5" cy="1" rx="8" ry="13" fill="#171020"/><circle cx="-2" cy="-10" r="6" fill="#fff"/><path class="lid" d="M-52-2 Q0-41 53-4" fill="none" stroke="${c.hair}" stroke-width="12" stroke-linecap="round"/></g>
    <g id="rightEye" transform="translate(418 329)"><path d="M-50-2 Q0-37 48 0 Q0 30-50-2Z" fill="#fff8fb"/><ellipse class="iris" cx="-4" cy="-1" rx="19" ry="23" fill="${c.iris}"/><ellipse cx="-5" cy="1" rx="8" ry="13" fill="#171020"/><circle cx="2" cy="-10" r="6" fill="#fff"/><path class="lid" d="M-53-4 Q0-41 52-2" fill="none" stroke="${c.hair}" stroke-width="12" stroke-linecap="round"/></g>
   </g>
   <path id="leftBrow" d="M255 276 Q304 250 346 275" fill="none" stroke="${c.hair}" stroke-width="11" stroke-linecap="round"/><path id="rightBrow" d="M374 275 Q416 250 465 276" fill="none" stroke="${c.hair}" stroke-width="11" stroke-linecap="round"/>
   <path d="M354 335 Q342 382 360 388 Q374 388 379 379" fill="none" stroke="${c.skinShadow}" stroke-width="7" stroke-linecap="round" opacity=".65"/>
   <ellipse cx="283" cy="399" rx="34" ry="13" fill="#ed8ca1" opacity=".12"/><ellipse cx="437" cy="399" rx="34" ry="13" fill="#ed8ca1" opacity=".12"/>
   <g id="mouth" transform="translate(360 431)"><path id="mouthLine" d="M-29 0 Q0 14 29 0" fill="none" stroke="${c.lip}" stroke-width="7" stroke-linecap="round"/><ellipse id="mouthOpen" cx="0" cy="6" rx="24" ry="2" fill="#401525" opacity="0"/><ellipse id="tongue" cx="0" cy="12" rx="14" ry="3" fill="#d77f95" opacity="0"/></g>
   ${hairFront(c.hair,c)}
   ${accessory(c.hair,c)}
  </g>
  <path d="M264 604 Q360 675 456 604 L477 820 L243 820Z" fill="none" stroke="${c.accent}" stroke-width="8" opacity=".42"/>
  <path d="M327 616 Q360 651 393 616 L378 678 L342 678Z" fill="${c.accent}" opacity=".72"/>
 </g>`;
 document.querySelector('#characterRole').textContent=c.role;
}
function setCharacter(id){build(CHARACTERS[id]?id:'nyra')}
function setState(s={}){phase=s.phase||phase;emotion=s.emotion||emotion;gesture=s.gesture||gesture}
function setMouth(v){mouthTarget=Math.max(0,Math.min(1,Number(v)||0))}
function frame(){return true}
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
 mouth+=(mouthTarget-mouth)*.28;mouthTarget*=.9;
 const head=svg.querySelector('#head'),body=svg.querySelector('#body'),leftEye=svg.querySelector('#leftEye'),rightEye=svg.querySelector('#rightEye');
 if(head){const energy=phase==='speaking'?1:phase==='listening'?.7:.35;const tilt=emotion==='playful'?.018:emotion==='compassionate'?-.012:0;head.style.transformOrigin='360px 360px';head.style.transform=`translate(${pointer.x*5}px,${Math.sin(t*1.2)*2.2}px) rotate(${(pointer.x*.8+Math.sin(t*.55)*.35+tilt*15)*energy}deg)`}
 if(body){body.style.transformOrigin='360px 700px';body.style.transform=`translateY(${Math.sin(t*1.15)*2.4}px)`}
 if(now>blinkAt&&blink===0){blink=.01;blinkAt=now+1800+Math.random()*2600}
 if(blink>0){blink+=dt*5.6;if(blink>1.25)blink=0}
 const blinkScale=blink?Math.max(.07,Math.abs(Math.cos(blink*Math.PI))):1;
 [leftEye,rightEye].forEach((eye,i)=>{if(!eye)return;eye.style.transformOrigin=i===0?'304px 329px':'418px 329px';const base=i===0?'translate(304px,329px)':'translate(418px,329px)';eye.setAttribute('transform',`${base} scale(1 ${blinkScale}) translate(${pointer.x*2} ${pointer.y*1.5})`)});
 const open=svg.querySelector('#mouthOpen'),tongue=svg.querySelector('#tongue'),line=svg.querySelector('#mouthLine');if(open){const v=Math.max(0,mouth);open.setAttribute('ry',String(2+v*21));open.setAttribute('rx',String(22+v*7));open.setAttribute('opacity',String(.1+v*.9));tongue.setAttribute('opacity',String(v>.32?.7:0));line.setAttribute('opacity',String(1-v*.82))}
 const brows=[svg.querySelector('#leftBrow'),svg.querySelector('#rightBrow')];brows.forEach((b,i)=>{if(!b)return;let y=0,rot=0;if(emotion==='curious'){y=-5;rot=i===0?-3:3}else if(emotion==='compassionate'){y=-2;rot=i===0?4:-4}else if(emotion==='playful'){y=i===0?1:-5;rot=i===0?-1:5}else if(emotion==='solemn'){y=3;rot=i===0?-5:5}b.style.transformOrigin=i===0?'300px 276px':'420px 276px';b.style.transform=`translateY(${y}px) rotate(${rot}deg)`});
}
addEventListener('pointermove',e=>{const r=svg.getBoundingClientRect();pointer={x:Math.max(-1,Math.min(1,((e.clientX-r.left)/Math.max(1,r.width)-.5)*2)),y:Math.max(-1,Math.min(1,((e.clientY-r.top)/Math.max(1,r.height)-.5)*2))}});
build('nyra');requestAnimationFrame(animate);
window.SoulAvatar={setCharacter,setState,setMouth,frame,get loaded(){return true}};
})();
