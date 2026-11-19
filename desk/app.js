(() => {
  'use strict';
  const KEY = 'side-side-spaces-v1';
  const TYPES = ['ai', 'community', 'agent', 'personal'];
  const STATUSES = ['next', 'doing', 'blocked', 'review', 'done'];
  const previews = Object.freeze({
    inca: '../assets/project-shots/inca-benchmark.png',
    medtech: null,
    together: '../assets/project-shots/projecttogether.png',
    voices: '../assets/project-shots/animal-voices.png',
    vietkieu: null,
    goods: '../assets/project-shots/good-things.png',
    gitlaw: '../assets/project-shots/gitlaw.png',
    kiss: null,
    studio: null
  });
  const defaults = [
    {id:'inca', name:'INCA Evidence Lab',type:'ai',status:'doing',project:'https://mikelninh.github.io/inca/impact-benchmark.html',chat:'',next:'Review the 30 synthetic cases with a qualified expert, fix two proposed-policy safety escapes, then run a fresh held-out set.',notes:'24/30 authored-route matches. 2 unsafe continuations. Expert review and time savings still unmeasured.'},
    {id:'medtech', name:'MEDTECH COPILOT',type:'ai',status:'next',project:'',chat:'',next:'Verify the MPBetreibV source flow and time 20 actual lookup questions against manual research.',notes:'Source selection → question → original passage side-by-side.'},
    {id:'together', name:'TOGETHER OS',type:'community',status:'doing',project:'https://mikelninh.github.io/projecttogether/',chat:'',next:'Invite 7 people to complete one real shared community activity. Track contributions and organiser time.',notes:'Turn good intentions into completed shared projects.'},
    {id:'voices', name:'Animal Voices',type:'community',status:'review',project:'https://animal-voices-os.vercel.app/try.html',chat:'',next:'Run 20 blind answer comparisons and independently check claims before expanding the pilot.',notes:'Public demo exists. Real dialogue outcomes not yet measured.'},
    {id:'vietkieu', name:'Vietkieu Community',type:'community',status:'next',project:'',chat:'',next:'Organise our first ROLL TOGETHER evening; verify one small collective win and follow-up interest.',notes:'Build belonging and a shared place to create, cook and play.'},
    {id:'goods', name:'GOOD THINGS',type:'community',status:'doing',project:'https://mikelninh.github.io/good-things/?view=duo',chat:'',next:'Observe 20 real shoppers choosing plant-based products; record price, satisfaction and verified swaps.',notes:'Vegan product tier list, discovery and shared tasting.'},
    {id:'gitlaw',name:'GitLaw',type:'ai',status:'doing',project:'https://mikelninh.github.io/gitlaw/',chat:'',next:'Evaluate 30 unfamiliar questions against official sources, including abstentions and citation correctness.',notes:'Inspect sources rather than trusting an unsupported legal answer.'},
    {id:'kiss',name:'kiss.exe · Agent',type:'agent',status:'next',project:'',chat:'',next:'Define a bounded, verifiable next mission and record actions, mistakes and human intervention.',notes:'An experimental agent identity, not autonomous access to your other chats.'},
    {id:'studio',name:'Studio / Personal',type:'personal',status:'next',project:'https://mikelninh.github.io/',chat:'',next:'Choose one useful outcome for today. Link the related ChatGPT conversation to this space.',notes:'Ideas, portfolio, writing and the little things that matter.'}
  ];
  const byId = id => document.getElementById(id);
  const board = byId('board');
  const template = byId('card-template');
  let spaces = load();
  let visible = 'all';
  let search = '';
  let selectedId = null;
  let editingId = null;
  let saveEnabled = true;

  function safeUrl(value, chat = false) {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
      if (url.username || url.password) return '';
      if (chat) {
        if (url.protocol !== 'https:') return '';
        const host = url.hostname.toLowerCase();
        if (!['chatgpt.com','chat.openai.com'].includes(host)) return '';
        if (!/^\/(?:c\/|share\/|g\/)/.test(url.pathname)) return '';
      }
      return url.href;
    } catch { return ''; }
  }
  function clean(item, index) {
    if (!item || typeof item !== 'object') return null;
    const name = String(item.name || '').trim().slice(0,75);
    if (!name) return null;
    return {
      id: String(item.id || 'space-' + index).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,70) || 'space-' + index,
      name, type:TYPES.includes(item.type) ? item.type : 'personal',
      status:STATUSES.includes(item.status) ? item.status : 'next',
      chat:safeUrl(item.chat, true), project:safeUrl(item.project),
      next:String(item.next || '').slice(0,700),notes:String(item.notes || '').slice(0,4000)
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults.map((x,i)=>clean(x,i));
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('Not an array');
      return data.slice(0,50).map(clean).filter(Boolean);
    } catch {
      return defaults.map((x,i)=>clean(x,i));
    }
  }
  function commit({rerender = false} = {}) {
    try { localStorage.setItem(KEY,JSON.stringify(spaces)); }
    catch { byId('world-status').textContent = 'Local saving unavailable in this browser'; }
    if (rerender) render();
    window.dispatchEvent(new CustomEvent('sideside:changed',{detail:{spaces:getSpaces()}}));
  }
  const getSpaces = () => spaces.map(s=>({...s}));
  const patch = (id, diff, opts = {}) => {
    const i=spaces.findIndex(s=>s.id===id);
    if(i<0)return false;
    spaces[i]=clean({...spaces[i],...diff},i);
    commit(opts);
    return true;
  };
  const choose = id => {
    selectedId=id;
    const s=spaces.find(s=>s.id===id);
    if(!s)return;
    byId('world-inspector').hidden=false;
    byId('inspector-name').textContent=s.name;
    byId('inspector-type').textContent=s.type.toUpperCase();
    byId('inspector-summary').textContent='Status: '+({next:'Next up',doing:'In progress',blocked:'Blocked',review:'To review',done:'Done'}[s.status] || s.status);
    byId('inspector-next').value=s.next;
    for(const [key,value] of [['inspector-chat',s.chat],['inspector-project',s.project]]) {
      const a=byId(key); a.hidden=!value; if(value)a.href=value;else a.removeAttribute('href');
    }
    window.dispatchEvent(new CustomEvent('sideside:selected',{detail:{id}}));
  };
  window.SideDesk = {getSpaces, patch, choose, showDesk(){
    byId('desk-mode').click();byId('control-panel-anchor')?.scrollIntoView({behavior:'smooth',block:'start'});
  }, selectCard(id) {
    byId('desk-mode').click();
    const card=Array.from(board.querySelectorAll('.space')).find(el=>el.dataset.id===id);
    if(card){card.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});card.querySelector('.next-input')?.focus({preventScroll:true});}
  }};
  function displayFilter(s) {
    if(search && !(s.name+' '+s.next+' '+s.notes).toLowerCase().includes(search)) return false;
    if(visible==='chat')return !!s.chat;
    if(visible==='active')return s.status==='doing';
    if(visible==='attention')return ['next','blocked','review'].includes(s.status);
    return true;
  }
  function setChatLink(card, room) {
    const input=card.querySelector('.chat-input'),error=card.querySelector('.field-error');
    const raw=input.value.trim(),url=safeUrl(raw,true);
    if(raw && !url){error.hidden=false;error.textContent='Use a valid ChatGPT conversation URL (chatgpt.com/c/…, /share/… or /g/…).';return;}
    patch(room.id,{chat:url},{rerender:true});
  }
  function createCard(s,index) {
    const el=template.content.firstElementChild.cloneNode(true);
    el.dataset.id=s.id;
    el.querySelector('.card-index').textContent=String(index+1).padStart(2,'0')+' / '+String(spaces.length).padStart(2,'0');
    el.querySelector('.card-mark').textContent={ai:'⌘',community:'✳',agent:'◇',personal:'☼'}[s.type];
    el.querySelector('.card-kind').textContent={ai:'AI / EVIDENCE',community:'COMMUNITY / IMPACT',agent:'AGENT / EXPERIMENT',personal:'PERSONAL / STUDIO'}[s.type];
    el.querySelector('.card-title').textContent=s.name;
    const status=el.querySelector('.status-select');status.value=s.status;
    status.addEventListener('change',()=>patch(s.id,{status:status.value},{rerender:true}));
    const image=previews[s.id],preview=el.querySelector('.project-preview');
    if(image){preview.hidden=false;const pic=preview.querySelector('img');pic.src=image;pic.alt='Saved screenshot of '+s.name+' application';}
    const open=el.querySelector('.open-chat'),addChat=el.querySelector('.set-chat'),indicator=el.querySelector('.chat-indicator'),input=el.querySelector('.chat-input'),error=el.querySelector('.field-error');
    open.hidden=!s.chat;if(s.chat)open.href=s.chat;else open.removeAttribute('href');
    indicator.classList.toggle('linked',!!s.chat);indicator.textContent=s.chat?'LINKED':'NOT LINKED';
    addChat.textContent=s.chat?'Edit chat link':'＋ Paste chat link';
    addChat.addEventListener('click',()=>{input.hidden=!input.hidden;error.hidden=true;input.value=s.chat;if(!input.hidden)input.focus();});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();setChatLink(el,s);}if(e.key==='Escape'){input.hidden=true;error.hidden=true;}});
    input.addEventListener('change',()=>setChatLink(el,s));
    const next=el.querySelector('.next-input'),notes=el.querySelector('.notes-input');
    next.value=s.next;notes.value=s.notes;
    next.addEventListener('input',()=>patch(s.id,{next:next.value}));
    notes.addEventListener('input',()=>patch(s.id,{notes:notes.value}));
    const link=el.querySelector('.project-link'),edit=el.querySelector('.edit-link'),panel=el.querySelector('.project-edit'),projectInput=el.querySelector('.project-input');
    link.hidden=!s.project;if(s.project)link.href=s.project;else link.removeAttribute('href');
    edit.textContent=s.project?'Edit project link':'＋ Project link';
    edit.addEventListener('click',()=>{panel.hidden=false;projectInput.value=s.project;projectInput.focus();});
    panel.querySelector('.cancel-project').addEventListener('click',()=>{panel.hidden=true;});
    panel.querySelector('.save-project').addEventListener('click',()=>{
      const raw=projectInput.value.trim(),url=safeUrl(raw);
      if(raw&&!url){alert('Use an http:// or https:// URL.');return;}
      patch(s.id,{project:url},{rerender:true});
    });
    el.querySelector('.rename-space').addEventListener('click',()=>{
      const name=prompt('Rename this space:',s.name)?.trim();
      if(name)patch(s.id,{name:name.slice(0,75)},{rerender:true});
    });
    el.querySelector('.move-left').disabled=index===0;
    el.querySelector('.move-right').disabled=index===spaces.length-1;
    el.querySelector('.move-left').addEventListener('click',()=>move(index,-1));
    el.querySelector('.move-right').addEventListener('click',()=>move(index,1));
    el.querySelector('.remove-space').addEventListener('click',()=>{
      if(confirm('Remove '+s.name+' from this browser workspace?')){spaces=spaces.filter(x=>x.id!==s.id);if(selectedId===s.id)byId('world-inspector').hidden=true;commit({rerender:true});}
    });
    return el;
  }
  function move(i,direction) {
    const j=i+direction;if(j<0||j>=spaces.length)return;
    [spaces[i],spaces[j]]=[spaces[j],spaces[i]];commit({rerender:true});
  }
  function render() {
    board.replaceChildren();
    spaces.forEach((s,i)=>{if(displayFilter(s))board.appendChild(createCard(s,i));});
    byId('space-count').textContent=String(spaces.length);
    const count=board.children.length;byId('visible-count').textContent=String(count);
    byId('empty').hidden=count>0;byId('board').hidden=count===0;
  }
  function addSpace(name,chat='',project='',next='',type='personal') {
    if(spaces.length>=50){alert('Maximum 50 spaces per local board. Export first.');return false;}
    const id='space-'+(crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    spaces.unshift(clean({id,name,type,status:'next',chat,project,next,notes:''},0));commit({rerender:true});return true;
  }
  function openModal(dialog) {
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
  }
  const modal=byId('space-dialog');
  byId('add-space').addEventListener('click',()=>{byId('space-form').reset();byId('form-error').hidden=true;openModal(modal);});
  modal.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>modal.close()));
  byId('space-form').addEventListener('submit',e=>{
    e.preventDefault();
    const name=byId('space-name').value.trim(),rawChat=byId('space-chat').value.trim(),rawProject=byId('space-project').value.trim();
    const chat=safeUrl(rawChat,true),project=safeUrl(rawProject),error=byId('form-error');
    if(!name||rawChat&&!chat||rawProject&&!project){error.textContent='Please add a name and valid URLs. Chat links must point to chatgpt.com conversations.';error.hidden=false;return;}
    if(addSpace(name,chat,project,byId('space-next').value,byId('space-type').value))modal.close();
  });
  const help=byId('help-dialog');
  for(const id of ['split-help','show-shortcuts'])byId(id).addEventListener('click',()=>openModal(help));
  help.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>help.close()));
  function quickAdd() {
    const raw=byId('quick-add').value.trim();if(!raw)return;
    const chat=safeUrl(raw,true);
    if(chat){addSpace('ChatGPT conversation',chat,'','Add the next useful action from this chat.');}
    else if(/^https?:\/\//i.test(raw)) {
      const project=safeUrl(raw);if(!project){alert('Use a valid HTTP(S) URL.');return;}
      addSpace(new URL(project).hostname,'',project,'Decide what to do with this link.');
    }else addSpace(raw.slice(0,75));
    byId('quick-add').value='';
  }
  byId('quick-add-btn').addEventListener('click',quickAdd);
  byId('quick-add').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();quickAdd();}});
  byId('search').addEventListener('input',e=>{search=e.target.value.toLowerCase().trim();render();});
  byId('filter').addEventListener('change',e=>{visible=e.target.value;render();});
  byId('clear-filters').addEventListener('click',()=>{visible='all';search='';byId('search').value='';byId('filter').value='all';render();});
  byId('export-data').addEventListener('click',()=>{
    const data={schema:'SIDE-SIDE-LOCAL-V1',exportedAt:new Date().toISOString(),spaces:getSpaces()};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='side-side-spaces.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  byId('import-data').addEventListener('click',()=>byId('import-file').click());
  byId('import-file').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>1000000){alert('File is too large (max 1 MB).');e.target.value='';return;}
    try {
      const data=JSON.parse(await file.text()),list=Array.isArray(data)?data:data?.spaces;
      if(!Array.isArray(list)||list.length>50)throw Error('Expected up to 50 spaces');
      const fresh=list.map(clean).filter(Boolean);
      if(!confirm('Replace this browser\'s current '+spaces.length+' spaces with '+fresh.length+' imported spaces?'))return;
      const seen=new Set();fresh.forEach(s=>{while(seen.has(s.id))s.id+='-2';seen.add(s.id);});
      spaces=fresh;commit({rerender:true});
    }catch(err){alert('Import failed: '+err.message);}
    finally{e.target.value='';}
  });
  byId('reset-data').addEventListener('click',()=>{
    if(!confirm('Reset to starter spaces? Your local notes and chat links will be lost unless exported.'))return;
    spaces=defaults.map(clean);commit({rerender:true});
  });
  byId('close-inspector').addEventListener('click',()=>{byId('world-inspector').hidden=true;selectedId=null;});
  byId('inspector-next').addEventListener('input',e=>{
    if(!selectedId)return;
    patch(selectedId,{next:e.target.value});
    const card=Array.from(board.querySelectorAll('.space')).find(el=>el.dataset.id===selectedId);
    if(card)card.querySelector('.next-input').value=e.target.value;
  });
  byId('inspector-card').addEventListener('click',()=>{if(selectedId)window.SideDesk.selectCard(selectedId);});
  byId('desk-mode').addEventListener('click',()=>{
    byId('world-mode').setAttribute('aria-pressed','false');byId('desk-mode').setAttribute('aria-pressed','true');
    byId('world').classList.add('desk-focus');
    byId('world-stage').hidden=true;byId('world').querySelector('.world-footer').hidden=true;
  });
  byId('world-mode').addEventListener('click',()=>{
    byId('world-mode').setAttribute('aria-pressed','true');byId('desk-mode').setAttribute('aria-pressed','false');
    byId('world').classList.remove('desk-focus');
    byId('world-stage').hidden=false;byId('world').querySelector('.world-footer').hidden=false;
    window.dispatchEvent(new Event('sideside:resize-world'));
  });
  render();
  // Reliable fallback if optional Three.js or WebGL never starts.
  setTimeout(() => {
    const loading=byId('world-loading');
    if (window.__sideSideWorldReady || !loading || loading.hidden) return;
    loading.replaceChildren();loading.classList.add('fallback-world');
    const heading=document.createElement('strong');heading.textContent='Your spaces are ready — in map mode.';
    const note=document.createElement('p');note.textContent='3D graphics are unavailable here. Select a room or use the side-by-side desk below.';
    const grid=document.createElement('div');grid.className='fallback-world-grid';
    for(const room of spaces.slice(0,30)){
      const btn=document.createElement('button');btn.type='button';btn.className='fallback-room';
      const kind=document.createElement('small');kind.textContent=room.type.toUpperCase();
      const name=document.createElement('span');name.textContent=room.name;
      btn.append(kind,name);btn.addEventListener('click',()=>choose(room.id));grid.append(btn);
    }
    loading.append(heading,note,grid);
    byId('world-status').textContent='2D map fallback · editable rooms';
  },12000);
  window.dispatchEvent(new CustomEvent('sideside:ready',{detail:{spaces:getSpaces()}}));
})();
