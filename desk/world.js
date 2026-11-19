import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.getElementById('world-stage');
const loading = document.getElementById('world-loading');
const status = document.getElementById('world-status');
const desk = window.SideDesk;
if (!stage || !desk) throw new Error('SIDE / SIDE workbench is not initialised');

const CATEGORY = {
  ai: {color:0xb9e77c, x:-8.5,z:-2, label:'AI & TRUST'},
  community: {color:0xf0b783, x:0,z:0, label:'COMMUNITY'},
  agent: {color:0x81b6f4, x:8.5,z:-2, label:'AGENTS'},
  personal: {color:0xc49aed, x:8,z:6.2, label:'STUDIO'}
};
let renderer, scene, camera, controls, raycaster, pointer;
let rooms = [], networks = [], textures = [];
let highlight = null, selected = null, lastSignature = '', pressed = null;
let disposed = false;
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const clock = new THREE.Clock();

function labelTexture(text,fg='#e8f5df',bg='rgba(15,33,21,.92)',width=512,height=128){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const c=canvas.getContext('2d');c.clearRect(0,0,width,height);
  c.fillStyle=bg;c.beginPath();c.roundRect(4,4,width-8,height-8,20);c.fill();
  c.strokeStyle='#62856a';c.lineWidth=2;c.stroke();
  c.fillStyle=fg;c.font='700 35px Inter, Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';
  const label=text.length>23?text.slice(0,21)+'…':text;
  c.fillText(label,width/2,height/2,width-40);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  return texture;
}
function addLabel(group,title,x=0,y=2.35,z=0,scale=2.9){
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(title),transparent:true,depthWrite:false}));
  sprite.position.set(x,y,z);sprite.scale.set(scale,.73,1);group.add(sprite);
}
function createRoom(space,position,index){
  const config=CATEGORY[space.type]||CATEGORY.personal;
  const color=new THREE.Color(config.color);
  const g=new THREE.Group();g.position.copy(position);g.userData={roomId:space.id};
  // Each room is a physical micro-building on its own illuminated island.
  const island=new THREE.Mesh(new THREE.CylinderGeometry(1.82,1.9,.27,6),new THREE.MeshStandardMaterial({color:0x183322,metalness:.38,roughness:.55}));
  island.position.y=.12;island.rotation.y=Math.PI/6;g.add(island);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(1.79,.055,8,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.48}));
  halo.rotation.x=Math.PI/2;halo.position.y=.24;g.add(halo);
  const house=new THREE.Mesh(new THREE.BoxGeometry(2.3,.95,1.65),new THREE.MeshStandardMaterial({color:0x223b2b,metalness:.18,roughness:.39,emissive:color,emissiveIntensity:.055}));
  house.position.y=.92;g.add(house);
  const walls=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.31,.97,1.67)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.72}));walls.position.y=.92;g.add(walls);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(2.48,.1,1.82),new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.12}));
  roof.position.y=1.46;g.add(roof);
  const entry=new THREE.Mesh(new THREE.PlaneGeometry(.65,.75),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.58,side:THREE.DoubleSide}));
  entry.position.set(0,.75,.831);g.add(entry);
  const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.22,0),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.15,metalness:.05,roughness:.3}));
  beacon.position.y=1.92;g.add(beacon);
  const signal=new THREE.Mesh(new THREE.SphereGeometry(.065,12,8),new THREE.MeshBasicMaterial({color:space.status==='blocked'?0xff8e80:space.status==='done'?0xc9f998:0xeef8d7}));
  signal.position.set(.8,1.74,.3);g.add(signal);
  addLabel(g,space.name,0,2.75,.05,space.name.length>18?3.2:2.9);
  // From here raycasting can resolve clicked child meshes to the associated room.
  roomHitTargets.push(island,house,roof,entry,beacon);
  scene.add(g);
  return {id:space.id,group:g,halo,roof,beacon,baseY:position.y,position:g.position,phase:index*.93};
}
let roomHitTargets=[];
function line(a,b,color,opacity=.24){
  const points=[a.clone().add(new THREE.Vector3(0,.2,0)),new THREE.Vector3((a.x+b.x)/2,.28,(a.z+b.z)/2),b.clone().add(new THREE.Vector3(0,.2,0))];
  const curve=new THREE.CatmullRomCurve3(points);
  const geometry=new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
  const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity}));
  scene.add(line);networks.push(line);
}
function clearRooms(){
  for(const r of rooms){scene.remove(r.group);r.group.traverse(o=>{if(o.isMesh||o.isLine||o.isSprite){o.geometry?.dispose?.();if(o.material?.isMaterial)o.material.dispose();}});}
  for(const n of networks){scene.remove(n);n.geometry.dispose();n.material.dispose();}
  for(const t of textures)t.dispose();
  roomHitTargets=[];rooms=[];networks=[];textures=[];
}
function rebuild(){
  const items=desk.getSpaces();
  clearRooms();
  const counts={ai:0,community:0,agent:0,personal:0};
  const indices={ai:0,community:0,agent:0,personal:0};
  for(const s of items)counts[s.type]=(counts[s.type]||0)+1;
  let i=0;
  for(const s of items){
    const c=CATEGORY[s.type]||CATEGORY.personal, n=counts[s.type]||1, k=indices[s.type]++;
    const radius=n===1?0:Math.max(2.4,Math.min(5.5,n*.85));
    const angle=n===1?0:k/n*Math.PI*2-Math.PI/2;
    const p=new THREE.Vector3(c.x+Math.cos(angle)*radius,0,c.z+Math.sin(angle)*radius);
    rooms.push(createRoom(s,p,i++));
  }
  // Connections are conceptual pathways, not data flows or hidden conversation access.
  for(const type of Object.keys(CATEGORY)){
    const group=rooms.filter(r=>items.find(s=>s.id===r.id)?.type===type);
    for(let i=1;i<group.length;i++)line(group[i-1].position,group[i].position,CATEGORY[type].color,.17);
  }
  const nodes=rooms;
  for(const [a,b] of [[0,2],[1,3],[2,7],[3,5]]){
    if(nodes[a]&&nodes[b])line(nodes[a].position,nodes[b].position,0x5a9a6a,.1);
  }
  status.textContent=items.length+' living spaces · click a room to enter';
}
function findRoom(object) {
  while(object){if(object.userData?.roomId)return object.userData.roomId;object=object.parent;}
  return null;
}
function pointerRay(event){
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(pointer,camera);
  return raycaster.intersectObjects(roomHitTargets,false)[0]||null;
}
function selectedRoom(id){
  selected=id;
  desk.choose(id);
  const room=rooms.find(r=>r.id===id);
  if(!room)return;
  controls.target.copy(room.position).add(new THREE.Vector3(0,.5,0));
  camera.position.copy(room.position).add(new THREE.Vector3(3.6,6.6,8.2));
  controls.update();
}
function fallback(message){
  loading.hidden=false;
  loading.replaceChildren();
  const box=document.createElement('div'),head=document.createElement('strong'),desc=document.createElement('p');
  head.textContent='Your workspaces are still here.';
  desc.textContent=message+' Use the 2D desk below, or retry the 3D view in a WebGL-enabled browser.';
  const btn=document.createElement('button');btn.className='btn btn-bright';btn.textContent='Open the 2D desk';
  btn.addEventListener('click',()=>document.getElementById('desk-mode').click());
  box.append(head,desc,btn);loading.append(box);status.textContent='3D unavailable · 2D desk works';
}
try{
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0b1510);scene.fog=new THREE.FogExp2(0x0b1510,.027);
  camera=new THREE.PerspectiveCamera(45,1,.1,160);camera.position.set(0,15.5,21);
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(Math.max(stage.clientWidth,300),Math.max(stage.clientHeight,340));
  renderer.domElement.setAttribute('aria-label','Interactive spatial map of projects, chats and agents; click a room or use the accessible 2D list below.');
  renderer.domElement.tabIndex=0;
  stage.prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;
  controls.minDistance=7;controls.maxDistance=56;controls.maxPolarAngle=Math.PI*.46;
  controls.target.set(0,0,0);controls.update();
  scene.add(new THREE.AmbientLight(0xc9efcd,1.1));
  const sun=new THREE.DirectionalLight(0xe9ffda,2.05);sun.position.set(-8,24,13);scene.add(sun);
  const cool=new THREE.PointLight(0x6a9ffa,30,48);cool.position.set(11,7,-4);scene.add(cool);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x0d1e14,roughness:.95,metalness:.05}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.14;scene.add(floor);
  const grid=new THREE.GridHelper(65,52,0x3c6242,0x203725);
  grid.position.y=-.12;grid.material.transparent=true;grid.material.opacity=.34;scene.add(grid);
  const points=[],colors=[];
  for(let i=0;i<400;i++){
    const a=i*2.39996,r=14+Math.sqrt(i)*1.4;
    points.push(Math.cos(a)*r,(i%17)*.35+.2,Math.sin(a)*r);
    const col=new THREE.Color(i%5===0?0x6b9b6f:0x2b5138);colors.push(col.r,col.g,col.b);
  }
  const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(points,3));stars.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  scene.add(new THREE.Points(stars,new THREE.PointsMaterial({size:.11,vertexColors:true,transparent:true,opacity:.72})));
  raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
  rebuild();
  const resize=()=>{
    if(disposed||!renderer||stage.hidden)return;
    const w=Math.max(stage.clientWidth,100),h=Math.max(stage.clientHeight,100);
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  };
  new ResizeObserver(resize).observe(stage);
  window.addEventListener('sideside:resize-world',resize);
  let moving=false;
  renderer.domElement.addEventListener('pointerdown',e=>{pressed={x:e.clientX,y:e.clientY,time:performance.now()};moving=false;});
  renderer.domElement.addEventListener('pointermove',e=>{
    if(pressed&&Math.hypot(e.clientX-pressed.x,e.clientY-pressed.y)>7)moving=true;
    const hit=pointerRay(e);
    highlight=hit?findRoom(hit.object):null;
    renderer.domElement.style.cursor=hit?'pointer':'grab';
  });
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!pressed)return;const click=!moving&&Math.hypot(e.clientX-pressed.x,e.clientY-pressed.y)<7;pressed=null;
    if(click){const hit=pointerRay(e);if(hit){const id=findRoom(hit.object);if(id)selectedRoom(id);}}
  });
  renderer.domElement.addEventListener('dblclick',e=>{
    const hit=pointerRay(e);if(!hit)return;
    const s=desk.getSpaces().find(s=>s.id===findRoom(hit.object));
    if(s?.project)window.open(s.project,'_blank','noopener,noreferrer');
  });
  document.getElementById('reset-camera').addEventListener('click',()=>{
    selected=null;document.getElementById('world-inspector').hidden=true;
    controls.target.set(0,0,0);camera.position.set(0,15.5,21);controls.update();
  });
  window.addEventListener('sideside:changed',()=>{
    const signature=desk.getSpaces().map(s=>[s.id,s.name,s.type,s.status].join('|')).join(';');
    if(signature!==lastSignature){lastSignature=signature;rebuild();}
  });
  window.addEventListener('sideside:selected',e=>{selected=e.detail.id;});
  lastSignature=desk.getSpaces().map(s=>[s.id,s.name,s.type,s.status].join('|')).join(';');
  loading.hidden=true;window.__sideSideWorldReady=true;resize();
  window.dispatchEvent(new Event('sideside:world-ready'));
  function render(){
    if(disposed)return;
    requestAnimationFrame(render);
    if(stage.hidden||document.hidden)return;
    const t=clock.getElapsedTime();
    for(const room of rooms){
      const active=room.id===highlight||room.id===selected;
      room.halo.material.opacity=active?.91:.42+.08*Math.sin(t*1.15+room.phase);
      room.halo.scale.setScalar(active?1.05:1);
      room.beacon.position.y=1.9+(reduceMotion?0:.09*Math.sin(t*1.45+room.phase));
      room.beacon.rotation.y=t*.4;
      room.roof.material.emissiveIntensity=active?.4:.05;
    }
    controls.update();
    renderer.render(scene,camera);
  }
  render();
}catch(err){
  console.error('3D map unavailable:',err);
  fallback('3D graphics could not start ('+String(err?.message||'WebGL error').slice(0,80)+').');
}
