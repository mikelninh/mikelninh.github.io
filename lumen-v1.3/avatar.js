(()=>{
const svg=document.querySelector('#avatarSvg');
const CHARACTERS={
 nyra:{skin:'#f1d6df',shadow:'#c98fa9',hair:'#110c1d',hair2:'#5d3485',iris:'#b28aff',cloth:'#171020',cloth2:'#50306c',accent:'#d7b9ff',lip:'#874462',role:'The midnight guide',style:'long',eye:'sharp'},
 lumen:{skin:'#ead7cd',shadow:'#bc958a',hair:'#102326',hair2:'#3e8179',iris:'#78dec3',cloth:'#102828',cloth2:'#376f67',accent:'#c5f6e7',lip:'#885b61',role:'The honest mirror',style:'soft',eye:'calm'},
 hikari:{skin:'#f4d6c0',shadow:'#c99476',hair:'#4c2910',hair2:'#d58b2d',iris:'#ffd36f',cloth:'#4a2510',cloth2:'#b96d24',accent:'#fff1a8',lip:'#a9594b',role:'The radiant quest spark',style:'pony',eye:'round'},
 yume:{skin:'#ead9e5',shadow:'#b997bc',hair:'#111b34',hair2:'#526fa9',iris:'#9bbcff',cloth:'#14213d',cloth2:'#46699c',accent:'#dce8ff',lip:'#7f5d72',role:'The quiet dream guide',style:'bob',eye:'soft'},
 vexa:{skin:'#f0ccd7',shadow:'#c4899e',hair:'#230b17',hair2:'#a12f5a',iris:'#ff83aa',cloth:'#2d0c1b',cloth2:'#8d294e',accent:'#ffd0df',lip:'#9d3758',role:'The dramatic guardian',style:'wing',eye:'sharp'}
};
let active='nyra',mouth=0,mouthTarget=0,phase='offline',emotion='calm',gesture='still',pointer={x:0,y:0},blink=0,blinkAt=performance.now()+1800,last=performance.now();
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

function hairBack(c){
 if(c.style==='pony') return `<path d="M205 361C181 224 261 111 389 112c100 0 172 66 169 178 67-37 137-3 132 71-5 78-86 125-151 78-14-49-30-94-61-129-54 59-147 69-228 29-23 35-35 68-45 102Z" fill="url(#hairBack)"/><path d="M547 232c83-29 136 32 110 105-22 60-83 94-128 56 31-51 40-103 18-161Z" fill="${c.hair2}" opacity=".88"/>`;
 if(c.style==='bob') return `<path d="M199 360c-11-150 80-252 214-244 126 8 183 99 145 289-53 67-300 72-361-6 1-13 2-26 2-39Z" fill="url(#hairBack)"/>`;
 if(c.style==='wing') return `<path d="M197 365c-18-151 77-261 215-249 120 11 181 106 143 288-50 70-305 67-361-7 2-11 3-21 3-32Z" fill="url(#hairBack)"/><path d="M219 215c-83-12-132 50-103 124 22 58 74 84 123 47-31-48-39-104-20-171Z" fill="${c.hair2}" opacity=".8"/><path d="M528 211c88-9 139 59 105 133-25 55-79 80-127 39 34-49 42-104 22-172Z" fill="${c.hair2}" opacity=".8"/>`;
 if(c.style==='soft') return `<path d="M212 355c-10-132 70-231 193-236 118-5 178 78 157 237-28-30-43-67-57-108-57 68-165 85-248 43-19 28-31 48-45 64Z" fill="url(#hairBack)"/>`;
 return `<path d="M198 365c-21-166 79-270 220-250 129 18 183 121 137 323-61 71-291 70-361-10 5-20 6-41 4-63Z" fill="url(#hairBack)"/>`;
}
function bangs(c){
 const common=`<path d="M235 256c31-95 118-139 216-107 49 16 79 54 86 103-59-29-118-13-162 29-43 41-94 31-140-25Z" fill="url(#hairFront)"/>`;
 if(c.style==='soft') return common+`<path d="M337 143c34 35 34 80-2 138-8-59-32-100-64-124Z" fill="${c.hair2}" opacity=".64"/><path d="M430 155c18 44 7 81-27 119 7-53-16-91-42-119Z" fill="${c.hair2}" opacity=".5"/>`;
 if(c.style==='pony') return common+`<path d="M318 145c45 36 40 95-12 161-1-75-23-119-57-146Z" fill="${c.hair2}" opacity=".75"/><path d="M447 153c27 48 13 93-28 139 9-61-20-104-50-136Z" fill="${c.hair2}" opacity=".62"/>`;
 if(c.style==='bob') return common+`<path d="M329 145c38 39 31 89-10 151-4-67-28-110-60-136Z" fill="${c.hair2}" opacity=".7"/>`;
 if(c.style==='wing') return common+`<path d="M345 141c47 35 42 93-7 169-8-75-35-122-72-151Z" fill="${c.hair2}" opacity=".73"/><path d="M449 153c30 49 15 97-30 146 11-64-19-109-51-142Z" fill="${c.hair2}" opacity=".62"/>`;
 return common+`<path d="M324 139c60 34 57 103-18 194-2-92-27-145-65-177Z" fill="${c.hair2}" opacity=".82"/><path d="M451 153c31 57 6 111-48 163 17-76-15-126-51-166Z" fill="${c.hair2}" opacity=".67"/>`;
}
function accessory(c){
 if(c.style==='long') return `<g transform="translate(497 222)" filter="url(#glow)"><circle r="19" fill="#0a0710" stroke="${c.accent}" stroke-width="3"/><path d="M-3-12A14 14 0 1 0 9 10A11 11 0 1 1-3-12" fill="${c.accent}"/></g>`;
 if(c.style==='pony') return `<g transform="translate(526 214)" filter="url(#glow)"><path d="M0-22 7-7 23 0 7 7 0 23-7 7-23 0-7-7Z" fill="${c.accent}"/><circle r="5" fill="#fff8cf"/></g>`;
 if(c.style==='bob') return `<g transform="translate(500 224)"><path d="M-18 0Q0-18 18 0Q0 18-18 0Z" fill="none" stroke="${c.accent}" stroke-width="4"/><circle r="5" fill="${c.accent}"/></g>`;
 if(c.style==='wing') return `<g transform="translate(494 215)"><path d="M-23 7Q-2-20 20-5 2 3 21 21-3 17-23 7Z" fill="${c.accent}"/><circle cx="4" cy="2" r="5" fill="#fff3f8"/></g>`;
 return `<g transform="translate(493 221)"><circle r="12" fill="${c.accent}" opacity=".85"/></g>`;
}
function eye(cx,flip,c){
 const lid=c.eye==='sharp'?'M-51 2Q0-34 51-2':c.eye==='soft'?'M-49-1Q0-30 49-1':'M-49 0Q0-39 49 0';
 return `<g class="eye" data-side="${flip?'r':'l'}" transform="translate(${cx} 325)"><path d="M-49 0Q0-34 49 0Q0 31-49 0Z" fill="#fffafd"/><ellipse class="iris" cx="${flip?-3:3}" cy="0" rx="19" ry="24" fill="url(#iris)"/><ellipse cx="${flip?-3:3}" cy="2" rx="8" ry="14" fill="#140e1c"/><circle cx="${flip?3:-3}" cy="-10" r="6" fill="#fff"/><circle cx="${flip?-8:8}" cy="8" r="2.4" fill="#fff" opacity=".7"/><path class="lid" d="${lid}" fill="none" stroke="${c.hair}" stroke-width="11" stroke-linecap="round"/><path d="M${flip?47:-47} 0l${flip?12:-12} -7" stroke="${c.hair}" stroke-width="6" stroke-linecap="round"/></g>`;
}
function build(id){
 const c=CHARACTERS[id]||CHARACTERS.nyra;active=id;
 svg.innerHTML=`<defs>
  <radialGradient id="halo"><stop offset="0" stop-color="${c.accent}" stop-opacity=".4"/><stop offset=".5" stop-color="${c.hair2}" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="hairBack" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.hair2}"/><stop offset=".43" stop-color="${c.hair}"/><stop offset="1" stop-color="#050409"/></linearGradient>
  <linearGradient id="hairFront" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.hair2}"/><stop offset=".46" stop-color="${c.hair}"/><stop offset="1" stop-color="#09050d"/></linearGradient>
  <linearGradient id="skin" x1=".2" y1="0" x2=".85" y2="1"><stop stop-color="#fff8f9"/><stop offset=".44" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.shadow}"/></linearGradient>
  <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.cloth2}"/><stop offset=".5" stop-color="${c.cloth}"/><stop offset="1" stop-color="#07050a"/></linearGradient>
  <radialGradient id="iris"><stop stop-color="#fff"/><stop offset=".16" stop-color="${c.iris}"/><stop offset=".68" stop-color="${c.iris}"/><stop offset="1" stop-color="#2a153b"/></radialGradient>
  <filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000" flood-opacity=".5"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 </defs>
 <circle cx="360" cy="350" r="320" fill="url(#halo)"/>
 <g opacity=".45" fill="${c.accent}">${Array.from({length:18},(_,i)=>`<circle cx="${50+(i*109)%630}" cy="${55+(i*83)%570}" r="${i%5===0?3:1.4}"/>`).join('')}</g>
 <path d="M73 820c29-165 137-239 260-245h54c123 6 231 80 260 245Z" fill="url(#cloth)" filter="url(#shadow)"/>
 <path d="M189 817c13-106 58-174 119-208l52 73 52-73c62 34 107 102 119 208Z" fill="#0b0911" opacity=".5"/>
 <path d="M310 518h100l14 89c-18 28-42 43-64 43s-46-15-64-43Z" fill="url(#skin)"/>
 ${hairBack(c)}
 <g id="head">
  <path d="M231 248c6-90 57-143 132-147 87-5 142 52 148 148l-12 130c-8 82-62 135-139 139-77-4-131-57-139-139l-12-112c-2-13 8-20 22-19Z" fill="url(#skin)" filter="url(#shadow)"/>
  <path d="M225 333c-26-19-33 25-10 54" fill="none" stroke="${c.shadow}" stroke-width="12" stroke-linecap="round"/><path d="M495 333c26-19 33 25 10 54" fill="none" stroke="${c.shadow}" stroke-width="12" stroke-linecap="round"/>
  ${eye(302,false,c)}${eye(418,true,c)}
  <path id="leftBrow" d="M254 269Q302 243 344 268" fill="none" stroke="${c.hair}" stroke-width="10" stroke-linecap="round"/><path id="rightBrow" d="M376 268Q418 243 466 269" fill="none" stroke="${c.hair}" stroke-width="10" stroke-linecap="round"/>
  <path d="M353 337q-12 47 7 53 13 0 19-9" fill="none" stroke="${c.shadow}" stroke-width="6" stroke-linecap="round" opacity=".58"/>
  <ellipse cx="282" cy="400" rx="34" ry="12" fill="#ef8fa8" opacity=".16"/><ellipse cx="438" cy="400" rx="34" ry="12" fill="#ef8fa8" opacity=".16"/>
  <g id="mouth" transform="translate(360 436)"><path id="mouthLine" d="M-29 0Q0 15 29 0" fill="none" stroke="${c.lip}" stroke-width="6" stroke-linecap="round"/><ellipse id="mouthOpen" cx="0" cy="7" rx="24" ry="2" fill="#3d1323" opacity="0"/><ellipse id="tongue" cx="0" cy="14" rx="14" ry="3" fill="#dc8499" opacity="0"/></g>
  ${bangs(c)}${accessory(c)}
 </g>
 <path d="M278 604q82 78 164 0l38 216H240Z" fill="none" stroke="${c.accent}" stroke-width="7" opacity=".42"/>
 <path d="M318 615q42 49 84 0l-17 74h-50Z" fill="${c.accent}" opacity=".78"/>
 <circle cx="360" cy="681" r="12" fill="${c.accent}" filter="url(#glow)"/><path d="m360 692-8 36h16Z" fill="${c.accent}" opacity=".7"/>`;
 const role=document.querySelector('#characterRole');if(role)role.textContent=c.role;
}
function setCharacter(id){build(id)}
function setState(s={}){phase=s.phase||phase;emotion=s.emotion||emotion;gesture=s.gesture||gesture}
function setMouth(v){mouthTarget=clamp(Number(v)||0)}
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;mouth+=(mouthTarget-mouth)*.28;mouthTarget*=.9;
 const head=svg.querySelector('#head');if(head){const e=phase==='speaking'?1:phase==='listening'?.72:.35;const tilt=emotion==='playful'?.8:emotion==='compassionate'?-.55:0;head.style.transformOrigin='360px 350px';head.style.transform=`translate(${pointer.x*5}px,${Math.sin(t*1.1)*2}px) rotate(${(pointer.x*.8+Math.sin(t*.5)*.28+tilt)*e}deg)`}
 if(now>blinkAt&&blink===0){blink=.01;blinkAt=now+1900+Math.random()*2800}if(blink>0){blink+=dt*5.8;if(blink>1.25)blink=0}const scale=blink?Math.max(.06,Math.abs(Math.cos(blink*Math.PI))):1;
 svg.querySelectorAll('.eye').forEach((eye,i)=>{const cx=i===0?302:418;eye.setAttribute('transform',`translate(${cx} 325) scale(1 ${scale}) translate(${pointer.x*2} ${pointer.y*1.4})`)});
 const open=svg.querySelector('#mouthOpen'),tongue=svg.querySelector('#tongue'),line=svg.querySelector('#mouthLine');if(open){const v=mouth;open.setAttribute('ry',String(2+v*21));open.setAttribute('rx',String(22+v*7));open.setAttribute('opacity',String(.08+v*.92));tongue.setAttribute('opacity',String(v>.34?.7:0));line.setAttribute('opacity',String(1-v*.82))}
 [svg.querySelector('#leftBrow'),svg.querySelector('#rightBrow')].forEach((b,i)=>{if(!b)return;let y=0,r=0;if(emotion==='curious'){y=-4;r=i?-3:3}else if(emotion==='compassionate'){y=-2;r=i?-4:4}else if(emotion==='playful'){y=i?-5:1;r=i?5:-1}else if(emotion==='solemn'){y=3;r=i?5:-5}b.style.transformOrigin=i?'420px 268px':'300px 269px';b.style.transform=`translateY(${y}px) rotate(${r}deg)`});
}
addEventListener('pointermove',e=>{const r=svg.getBoundingClientRect();pointer={x:clamp(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1),y:clamp(((e.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1)}});
build('nyra');requestAnimationFrame(animate);window.SoulAvatar={setCharacter,setState,setMouth,frame:()=>true,get loaded(){return true}};
})();
