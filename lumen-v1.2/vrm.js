import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';

const canvas=document.querySelector('#vrmCanvas');
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.92;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(24,1,.05,100);
camera.position.set(0,1.42,1.58);
scene.add(camera);

const hemi=new THREE.HemisphereLight(0xb9c5ff,0x120b1e,1.05);
const key=new THREE.DirectionalLight(0xffe8f5,2.15);key.position.set(1.8,2.8,2.4);key.castShadow=true;
const fill=new THREE.DirectionalLight(0x8a78d8,.72);fill.position.set(-2.4,1.5,2.1);
const rim=new THREE.DirectionalLight(0x9d65ff,2.65);rim.position.set(-1.4,2.2,-2.1);
scene.add(hemi,key,fill,rim);

const loader=new GLTFLoader();
loader.register(p=>new VRMLoaderPlugin(p));

const MODELS={
 A:'https://cdn.jsdelivr.net/gh/madjin/vrm-samples@master/vroid/stable/AvatarSample_A.vrm',
 B:'https://cdn.jsdelivr.net/gh/madjin/vrm-samples@master/vroid/stable/AvatarSample_B.vrm',
 C:'https://cdn.jsdelivr.net/gh/madjin/vrm-samples@master/vroid/stable/AvatarSample_C.vrm'
};

const PALETTES={
 nyra:{hair:0x160f25,skin:0xf1d7e3,cloth:0x21132e,accent:0x9d73ff,eye:0xa77cff,metal:0xc9c4df},
 lumen:{hair:0x18282a,skin:0xead8cd,cloth:0x17302f,accent:0x70cdb4,eye:0x86e1c9,metal:0xc9e5dc},
 hikari:{hair:0x5b3417,skin:0xf4d7c4,cloth:0x6a3516,accent:0xf2c25f,eye:0xffd36f,metal:0xffe8a6},
 yume:{hair:0x18233d,skin:0xead9e5,cloth:0x1a2948,accent:0x7da7f2,eye:0x95baff,metal:0xd5e2ff},
 vexa:{hair:0x27101d,skin:0xf0ced8,cloth:0x3a1122,accent:0xe55d86,eye:0xff7ca4,metal:0xf1becd}
};

let vrm=null,currentModel='',currentCharacter='nyra';
let mouth=0,targetMouth=0,pointer={x:0,y:0};
let state={phase:'offline',emotion:'calm',gesture:'still'};
let clock=new THREE.Clock(),blinkAt=performance.now()+1800,blink=0;
let headBase=null,chestBase=null,leftArmBase=null,rightArmBase=null;
const clamp=v=>Math.max(0,Math.min(1,v));

function resize(){
 const r=canvas.getBoundingClientRect();
 renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
 camera.aspect=Math.max(.1,r.width/r.height);
 camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();

function expression(name,value){try{vrm?.expressionManager?.setValue(name,clamp(value))}catch{}}
function hexColor(value){return new THREE.Color(value)}

function chooseMaterialRole(name=''){
 const n=name.toLowerCase();
 if(/iris|eyeball|eye_?iris|eyeiris/.test(n))return 'eye';
 if(/hair|bang|ponytail/.test(n))return 'hair';
 if(/face|skin|body/.test(n)&&!/cloth|shirt|tops|bottom|dress/.test(n))return 'skin';
 if(/metal|accessory|brooch|earring/.test(n))return 'metal';
 if(/cloth|shirt|tops|bottom|dress|skirt|shoe|sock|coat|jacket|hoodie/.test(n))return 'cloth';
 return 'accent';
}

function applyCharacterPalette(root,character){
 const p=PALETTES[character]||PALETTES.nyra;
 root.traverse(obj=>{
  if(!obj.isMesh)return;
  obj.frustumCulled=false;obj.castShadow=true;obj.receiveShadow=true;
  const materials=Array.isArray(obj.material)?obj.material:[obj.material];
  materials.filter(Boolean).forEach(mat=>{
   const role=chooseMaterialRole(`${obj.name} ${mat.name}`);
   const target=p[role]??p.accent;
   if(mat.color){
    mat.color.copy(hexColor(target));
    if(mat.map)mat.color.lerp(new THREE.Color(0xffffff),role==='skin'?.35:.12);
   }
   if('roughness' in mat)mat.roughness=role==='metal'?.28:.72;
   if('metalness' in mat)mat.metalness=role==='metal'?.52:0;
   if(mat.emissive){
    mat.emissive.copy(hexColor(role==='eye'?p.eye:p.accent));
    mat.emissiveIntensity=role==='eye'?.18:.025;
   }
   if('shadeColorFactor' in mat){
    const shade=new THREE.Color(target).multiplyScalar(role==='skin'?.62:.42);
    mat.shadeColorFactor=shade;
   }
   mat.needsUpdate=true;
  });
 });
}

function cacheBasePose(){
 if(!vrm?.humanoid)return;
 const h=vrm.humanoid;
 const head=h.getNormalizedBoneNode('head');
 const chest=h.getNormalizedBoneNode('chest')||h.getNormalizedBoneNode('upperChest');
 const l=h.getNormalizedBoneNode('leftUpperArm');
 const r=h.getNormalizedBoneNode('rightUpperArm');
 headBase=head?.quaternion.clone()||null;
 chestBase=chest?.quaternion.clone()||null;
 leftArmBase=l?.quaternion.clone()||null;
 rightArmBase=r?.quaternion.clone()||null;
}

function framePortrait(){
 if(!vrm)return;
 vrm.scene.updateMatrixWorld(true);
 const h=vrm.humanoid;
 const head=h?.getNormalizedBoneNode('head');
 const chest=h?.getNormalizedBoneNode('chest')||h?.getNormalizedBoneNode('upperChest');
 const hips=h?.getNormalizedBoneNode('hips');
 const hp=head?.getWorldPosition(new THREE.Vector3());
 const cp=chest?.getWorldPosition(new THREE.Vector3());
 const pp=hips?.getWorldPosition(new THREE.Vector3());
 if(hp&&cp){
  const targetY=THREE.MathUtils.lerp(cp.y,hp.y,.56);
  const torso=Math.max(.45,hp.y-(pp?.y??cp.y-.55));
  camera.position.set(.035,targetY+.025,Math.max(1.12,torso*1.62));
  camera.lookAt(0,targetY-.025,0);
  camera.fov=23;
 }else{
  const box=new THREE.Box3().setFromObject(vrm.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  camera.position.set(0,center.y+size.y*.18,Math.max(1.3,size.y*.92));
  camera.lookAt(center.x,center.y+size.y*.18,center.z);
  camera.fov=24;
 }
 camera.updateProjectionMatrix();
 vrm.scene.rotation.y=-.055;
}

function setLightTheme(character){
 const p=PALETTES[character]||PALETTES.nyra;
 key.color.copy(new THREE.Color(p.skin).lerp(new THREE.Color(0xffffff),.42));
 fill.color.copy(new THREE.Color(p.accent).lerp(new THREE.Color(0x9aa8ff),.35));
 rim.color.copy(new THREE.Color(p.accent));
}

async function loadCharacter(model,character='nyra'){
 if(currentModel===model&&vrm&&currentCharacter===character)return;
 currentModel=model;currentCharacter=character;
 window.SOULBODY?.setAvatarLoaded(false);
 try{
  const gltf=await loader.loadAsync(MODELS[model]||MODELS.A);
  const next=gltf.userData.vrm;
  if(!next)throw new Error('No VRM data');
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.removeUnnecessaryJoints(gltf.scene);
  VRMUtils.rotateVRM0(next);
  if(vrm)scene.remove(vrm.scene);
  vrm=next;
  scene.add(vrm.scene);
  vrm.update(0);
  applyCharacterPalette(vrm.scene,character);
  setLightTheme(character);
  cacheBasePose();
  framePortrait();
  window.SOULBODY?.setAvatarLoaded(true);
 }catch(e){
  console.error('VRM load failed',e);
  window.SOULBODY?.setAvatarLoaded(false);
 }
}

function setMouth(v){targetMouth=clamp(v*1.75)}
function setPointer(x,y){pointer={x:THREE.MathUtils.clamp(x,-1,1),y:THREE.MathUtils.clamp(y,-1,1)}}
function setState(v){state={...state,...v}}

function applyPose(t){
 if(!vrm?.humanoid)return;
 const h=vrm.humanoid;
 const head=h.getNormalizedBoneNode('head');
 const chest=h.getNormalizedBoneNode('chest')||h.getNormalizedBoneNode('upperChest');
 const hips=h.getNormalizedBoneNode('hips');
 const lArm=h.getNormalizedBoneNode('leftUpperArm');
 const rArm=h.getNormalizedBoneNode('rightUpperArm');
 if(head&&headBase){
  const q=headBase.clone();
  const tilt=state.emotion==='playful'?.055:state.emotion==='compassionate'?-.035:0;
  q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-pointer.y*.09+Math.sin(t*.42)*.008,pointer.x*.18,tilt)));
  head.quaternion.slerp(q,.075);
 }
 if(chest&&chestBase){
  const q=chestBase.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(t*.68)*.006,0,Math.sin(t*.51)*.012)));
  chest.quaternion.slerp(q,.045);
 }
 if(hips)hips.position.y=Math.sin(t*1.25)*.004;
 if(lArm&&rArm&&leftArmBase&&rightArmBase){
  const open=state.gesture==='open_palms';
  const heart=state.gesture==='hand_to_heart';
  const leftZ=open?.78:heart?.38:1.02;
  const rightZ=open?-.78:heart?-1.24:-1.02;
  const leftQ=leftArmBase.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(heart?.32:0,0,leftZ)));
  const rightQ=rightArmBase.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(heart?-.28:0,0,rightZ)));
  lArm.quaternion.slerp(leftQ,.065);rArm.quaternion.slerp(rightQ,.065);
 }
}

function animate(){
 requestAnimationFrame(animate);resize();
 const dt=Math.min(.05,clock.getDelta()),t=performance.now()/1000;
 mouth+=(targetMouth-mouth)*.3;targetMouth*=.88;
 if(vrm){
  applyPose(t);
  const now=performance.now();
  if(now>blinkAt&&blink===0){blink=1;blinkAt=now+1900+Math.random()*2900}
  if(blink>0){blink+=dt*7.5;const v=blink<2?Math.sin(Math.min(Math.PI,blink*Math.PI/2)):0;expression('blink',v);if(blink>2){blink=0;expression('blink',0)}}
  expression('aa',mouth);
  expression('happy',state.emotion==='joyful'?.48:state.emotion==='playful'?.32:0);
  expression('relaxed',state.emotion==='calm'?.34:state.emotion==='warm'?.3:state.emotion==='compassionate'?.22:0);
  expression('angry',state.emotion==='determined'?.12:0);
  vrm.update(dt);
 }
 renderer.render(scene,camera);
}
animate();

window.LumenVRM={loaded:false,loadCharacter,setMouth,setPointer,setState,framePortrait};
Object.defineProperty(window.LumenVRM,'loaded',{get:()=>!!vrm});
addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();setPointer(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-((e.clientY-r.top)/Math.max(1,r.height)-.5)*2)});
setTimeout(()=>loadCharacter('A','nyra'),50);
