/* OUT OF PANEL for Beyond the CV. Original 0.3 coin engine, isolated and lazy-initialised. */
(()=>{
'use strict';
/* First Light / 002. Self-contained material study and mesh.
   WebGL renderer with a deliberately lightweight studio-lighting approximation.
   No network, tracking, external 3D library or wallet integration. */
function makeCoinStudio(){
 const PI=Math.PI,TAU=PI*2;
 const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
 const mm=(a,b)=>{const r=Array(16).fill(0);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r};
 const rx=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]};
 const ry=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]};
 const rz=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
 const groups=Array.from({length:5},()=>({p:[],n:[],uv:[],kind:[]}));
 function tri(g,a,b,c,na,nb=na,nc=na,face=-1){const dst=groups[g];for(let i=0;i<3;i++){let pt=[a,b,c][i],nn=[na,nb,nc][i];dst.p.push(...pt);dst.n.push(...nn);dst.uv.push((face===1?-pt[0]:pt[0])/2.1+.5,.5-pt[1]/2.1);dst.kind.push(face)}}
 function quad(g,a,b,c,d,na,nb=na,nc=na,nd=na,face=-1){tri(g,a,b,c,na,nb,nc,face);tri(g,a,c,d,na,nc,nd,face)}
 const N=192;
 function ring(g,r1,r2,z1,z2,n1,n2,off1=[0,0],off2=[0,0],face=-1){for(let i=0;i<N;i++){let a=TAU*i/N,b=TAU*(i+1)/N;let pt=(r,z,of,t)=>[of[0]+r*Math.cos(t),of[1]+r*Math.sin(t),z];let nr=(n,t)=>norm([n[0]*Math.cos(t),n[0]*Math.sin(t),n[1]]);quad(g,pt(r1,z1,off1,a),pt(r2,z2,off2,a),pt(r2,z2,off2,b),pt(r1,z1,off1,b),nr(n1,a),nr(n2,a),nr(n2,b),nr(n1,b),face)}}
 // Off-centre aperture, real thickness and chamfered metal transitions.
 const H=[.235,.25];
 ring(2,.22,.247,.092,.13,[-1,0],[-.5,.8],H,H);
 ring(0,.247,.875,.13,.13,[0,1],[0,1],H,[0,0],0);
 ring(1,.875,.898,.13,.145,[0,1],[0,1]);
 ring(1,.898,.951,.145,.145,[0,1],[0,1]);
 ring(1,.951,.985,.145,.117,[.2,1],[.8,.5]);
 ring(2,.985,1,.117,.084,[.8,.5],[1,0]);
 ring(2,1,1,.084,-.084,[1,0],[1,0]);
 ring(1,1,.982,-.084,-.12,[1,0],[.7,-.7]);
 ring(1,.982,.953,-.12,-.145,[.7,-.7],[0,-1]);
 ring(1,.953,.875,-.145,-.145,[0,-1],[0,-1]);
 ring(3,.875,.247,-.145,-.13,[0,-1],[0,-1],[0,0],H,1);
 ring(2,.247,.22,-.13,-.092,[-.5,-.8],[-1,0],H,H);
 ring(2,.22,.22,-.092,.092,[-1,0],[-1,0],H,H);
 // Edge milling: separate glints rather than a perfectly smooth cylinder.
 for(let i=0;i<112;i++){const a=TAU*i/112,b=a+.017;const pos=(t,z,r)=>[r*Math.cos(t),r*Math.sin(t),z],n1=[Math.cos(a),Math.sin(a),0],n2=[Math.cos(b),Math.sin(b),0];quad(4,pos(a,-.058,1.001),pos(a,.058,1.001),pos(b,.058,1.001),pos(b,-.058,1.001),n1,n1,n2,n2)}
 function texture(back=false){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d'),S=1024,cx=512,cy=512,R=S/2.1;
  let seed=72;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  x.fillStyle=back?'#55492e':'#45432b';x.fillRect(0,0,S,S);
  const pat=x.createRadialGradient(280,230,0,512,512,680);pat.addColorStop(0,'#958151');pat.addColorStop(.4,back?'#79683e':'#666039');pat.addColorStop(1,'#343c29');x.fillStyle=pat;x.fillRect(0,0,S,S);
  for(let i=0;i<13000;i++){let px=rng()*S,py=rng()*S,v=rng();x.fillStyle=v>.52?`rgba(239,216,148,${rng()*.06})`:`rgba(12,24,16,${rng()*.14})`;x.fillRect(px,py,rng()*6+.4,rng()*2+.4)}
  for(let i=0;i<130;i++){let a=rng()*TAU,r=(.3+rng()*.67)*R,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;x.strokeStyle=`rgba(233,206,135,${rng()*.15})`;x.lineWidth=.7;x.beginPath();x.moveTo(px,py);x.lineTo(px+(rng()-.5)*50,py+(rng()-.5)*55);x.stroke()}
  function arcText(text,r,mid,sz){x.save();x.font=`500 ${sz}px Georgia,serif`;x.fillStyle='#c5ad6a';x.textAlign='center';x.textBaseline='middle';const adv=sz*.63/r,total=(text.length-1)*adv;for(let i=0;i<text.length;i++){let a=mid-total/2+i*adv;x.save();x.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);x.rotate(a+PI/2);x.fillText(text[i],0,0);x.restore()}x.restore()}
  x.strokeStyle='#b7a060';x.lineWidth=2;x.beginPath();x.arc(cx,cy,R*.823,0,TAU);x.stroke();x.strokeStyle='#b7a06055';x.lineWidth=1;x.beginPath();x.arc(cx,cy,R*.80,0,TAU);x.stroke();
  if(!back){arcText('PLEASE RETURN TO PAGE 04',R*.752,-PI/2,22);arcText('H Y P E R S P A C E',R*.728,PI/2,17);const hx=cx+H[0]*R,hy=cy-H[1]*R;
   x.strokeStyle='#bfa364';x.lineWidth=3;x.beginPath();x.arc(hx,hy,.32*R,PI,TAU);x.stroke();x.beginPath();x.moveTo(cx-.53*R,cy+.11*R);x.lineTo(cx+.56*R,cy+.11*R);x.moveTo(cx-.44*R,cy+.15*R);x.lineTo(cx+.47*R,cy+.15*R);x.stroke();
   for(let i=0;i<7;i++){const t=PI+(i/6)*PI,rr=.36*R,rr2=.4*R;x.beginPath();x.moveTo(hx+Math.cos(t)*rr,hy+Math.sin(t)*rr);x.lineTo(hx+Math.cos(t)*rr2,hy+Math.sin(t)*rr2);x.stroke()}
   x.font='italic 46px Georgia,serif';x.textAlign='center';x.fillStyle='#c5ad70';x.fillText('first light',cx,cy+.33*R);x.font='15px Arial,sans-serif';x.fillText('O B J E C T   0 0 1',cx,cy+.47*R);
   // A little offset spark, part of the engraving, not a separate particle effect.
   const sx=cx-.39*R,sy=cy-.25*R;x.beginPath();x.moveTo(sx,sy-19);x.lineTo(sx+4,sy-4);x.lineTo(sx+19,sy);x.lineTo(sx+4,sy+4);x.lineTo(sx,sy+19);x.lineTo(sx-4,sy+4);x.lineTo(sx-19,sy);x.lineTo(sx-4,sy-4);x.closePath();x.fill();
  }else{arcText('NOT EVERYTHING. SOMETHING.',R*.75,-PI/2,20);arcText('A  S M A L L  B E G I N N I N G',R*.73,PI/2,15);x.strokeStyle='#cbb274';x.lineWidth=4;let y=cy+.12*R;x.beginPath();x.moveTo(cx,y);x.bezierCurveTo(cx+170,y-120,cx+200,y+120,cx,y);x.bezierCurveTo(cx-170,y-120,cx-200,y+120,cx,y);x.stroke();x.textAlign='center';x.fillStyle='#cbb274';x.font='17px Arial,sans-serif';x.fillText('F I R S T   L I G H T',cx,cy+.40*R);x.font='italic 21px Georgia,serif';x.fillText('Out of the story.',cx,cy+.53*R)}
  return c;
 }
 const front=texture(),back=texture(true);
 const VS=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;attribute float aFace;uniform mat4 uModel;uniform mat4 uMVP;varying vec3 vP;varying vec3 vN;varying vec2 vUV;varying float vFace;void main(){vP=(uModel*vec4(aPosition,1.)).xyz;vN=mat3(uModel)*aNormal;vUV=aUV;vFace=aFace;gl_Position=uMVP*vec4(aPosition,1.);}`;
 const FS=`precision highp float;varying vec3 vP;varying vec3 vN;varying vec2 vUV;varying float vFace;uniform sampler2D uFront;uniform sampler2D uBack;uniform vec3 uColor;uniform float uRough;uniform float uMetal;uniform float uInk;uniform float uJade;
 const float PI=3.14159265;
 vec3 fresnel(float h,vec3 f){return f+(1.-f)*pow(1.-h,5.);}
 vec3 light(vec3 N,vec3 V,vec3 L,vec3 radiance,vec3 base,float rough,float metal){vec3 H=normalize(V+L);float nv=max(dot(N,V),0.001),nl=max(dot(N,L),0.0),nh=max(dot(N,H),0.),vh=max(dot(V,H),0.);float a=rough*rough,a2=a*a,den=nh*nh*(a2-1.)+1.;float D=a2/max(PI*den*den,.0001);float k=(rough+1.)*(rough+1.)/8.;float G=nv/(nv*(1.-k)+k)*nl/(nl*(1.-k)+k);vec3 F=fresnel(vh,mix(vec3(.04),base,metal));vec3 spec=D*G*F/max(4.*nv*nl,.001);return ((1.-F)*(1.-metal)*base/PI+spec)*radiance*nl;}
 void main(){vec3 N=normalize(vN),V=normalize(vec3(0.,0.,4.3)-vP);if(dot(N,V)<0.)N=-N;vec3 tex=vFace>.5?texture2D(uBack,vUV).rgb:texture2D(uFront,vUV).rgb;vec3 base=uColor;if(vFace>-.5)base=pow(tex,vec3(2.2));base=mix(base,base*vec3(.69,1.07,.97)+vec3(.015,.029,.018),uJade);float rough=uRough;
 float grain=sin(vP.x*330.+vP.y*153.)*sin(vP.y*275.+vP.x*53.);rough=clamp(rough+grain*.025,.2,.95);
 vec3 col=light(N,V,normalize(vec3(-2.,4.,5.)),vec3(7.,6.2,4.8),base,rough,uMetal);
 col+=light(N,V,normalize(vec3(4.,1.,2.)),vec3(2.1,2.5,2.7),base,rough,uMetal);
 col+=light(N,V,normalize(vec3(-3.,-2.,1.)),vec3(1.5,1.25,.8),base,rough,uMetal);
 vec3 R=reflect(-V,N);float top=pow(max(dot(R,normalize(vec3(-.25,.8,.9))),0.),mix(45.,5.,rough));float side=pow(max(dot(R,normalize(vec3(.9,.15,.6))),0.),mix(70.,9.,rough));float under=pow(max(dot(R,normalize(vec3(-.7,-.4,.3))),0.),15.);
 vec3 env=vec3(.15,.19,.12)+vec3(1.6,1.4,.94)*top+vec3(.7,.83,.92)*side+vec3(.24,.18,.09)*under;
 col+=env*mix(vec3(.06),base,uMetal)*(1.-rough*.4)+base*.16;
 col=col/(col+vec3(.75));col=pow(max(col,0.),vec3(1./2.2));
 vec3 ink=vec3(.65,.53,.31)*(.65+.35*max(dot(N,normalize(vec3(-.4,.6,1.))),0.));if(vFace>-.5)ink=mix(ink,tex,.6);col=mix(col,ink,uInk);gl_FragColor=vec4(col,1.);}`;
 function create(canvas){let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'})}catch{}if(!gl)return fallback(canvas);
  let prog;try{const shader=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh};prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,VS));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));}catch(err){canvas.dataset.rendererError=String(err).slice(0,100);return fallback(canvas,true)}
  const loc={};for(const name of ['uModel','uMVP','uColor','uRough','uMetal','uInk','uJade','uFront','uBack'])loc[name]=gl.getUniformLocation(prog,name);
  const buffers=groups.map(g=>{let o={count:g.p.length/3};for(const [name,arr,size]of[['aPosition',g.p,3],['aNormal',g.n,3],['aUV',g.uv,2],['aFace',g.kind,1]]){const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);o[name]={buf,size,loc:gl.getAttribLocation(prog,name)}}return o});
  [front,back].forEach((im,i)=>{gl.activeTexture(gl.TEXTURE0+i);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.generateMipmap(gl.TEXTURE_2D)});
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);let lost=false;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;canvas.dispatchEvent(new CustomEvent('renderer-lost',{bubbles:true}))});canvas.addEventListener('webglcontextrestored',()=>{canvas.dispatchEvent(new CustomEvent('renderer-restored',{bubbles:true}))});
  function render(yaw=.3,pitch=-.25,ink=0,jade=0,roll=-.08){if(lost)return;const size=canvas.width;gl.viewport(0,0,size,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(prog);let model=mm(rz(roll),mm(ry(yaw),rx(pitch)));let view=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,-4.3,1];const near=.1,far=40,f=3.0;let proj=[f,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];gl.uniformMatrix4fv(loc.uModel,false,new Float32Array(model));gl.uniformMatrix4fv(loc.uMVP,false,new Float32Array(mm(proj,mm(view,model))));gl.uniform1i(loc.uFront,0);gl.uniform1i(loc.uBack,1);gl.uniform1f(loc.uInk,ink);gl.uniform1f(loc.uJade,jade);
   const colors=[[.34,.27,.13],[.58,.40,.15],[.22,.19,.1],[.32,.25,.12],[.49,.35,.15]],rough=[.54,.30,.49,.52,.34];buffers.forEach((o,i)=>{for(const name of ['aPosition','aNormal','aUV','aFace']){const a=o[name];if(a.loc<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,a.buf);gl.enableVertexAttribArray(a.loc);gl.vertexAttribPointer(a.loc,a.size,gl.FLOAT,false,0,0)}gl.uniform3fv(loc.uColor,colors[i]);gl.uniform1f(loc.uRough,rough[i]);gl.uniform1f(loc.uMetal,.88);gl.drawArrays(gl.TRIANGLES,0,o.count)});
  }
  render();return{render,kind:'WebGL',gl};
 }
 // Geometry-based software renderer. Runs without a GPU and shares the master mesh.
 // Orthographic texture projection is used here; WebGL uses perspective lighting.
 const softwareFaces=groups.flatMap((g,gi)=>{
  if(gi===0||gi===3)return[];
  const fs=[];for(let i=0;i<g.p.length;i+=18){let vertices=[0,1,2,5].map(j=>g.p.slice(i+j*3,i+j*3+3));let normal=norm([0,1,2].map(k=>(g.n[i+k]+g.n[i+3+k]+g.n[i+6+k]+g.n[i+15+k])/4));fs.push({vertices,normal,gi})}return fs;
 });
 const jadeTextures=[front,back].map(im=>{const c=document.createElement('canvas');c.width=c.height=1024;let x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='color';x.fillStyle='#619789';x.fillRect(0,0,1024,1024);x.globalCompositeOperation='source-atop';x.fillStyle='#89b3a225';x.fillRect(0,0,1024,1024);return c});
 function fallback(canvas,replaced=false){let target=canvas;if(replaced){target=document.createElement('canvas');target.id=canvas.id;target.className=canvas.className;target.width=canvas.width;target.height=canvas.height;canvas.replaceWith(target)}const x=target.getContext('2d');
  function render(yaw=.3,pitch=-.25,ink=0,jade=0,roll=-.08){if(!x)return;const s=target.width,r=s*.355,c=s*.5;let m=mm(rz(roll),mm(ry(yaw),rx(pitch)));const tr=p=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2],m[1]*p[0]+m[5]*p[1]+m[9]*p[2],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]];
   x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,s,s);
   const lights=[[...norm([-.5,.8,1]),1],[...norm([.8,.1,.6]),.45],[...norm([-.5,-.5,.6]),.18]];
   const base=jade?[[104,145,125],[147,174,153],[48,69,59],[104,145,125],[129,156,137]]:[[114,99,58],[170,137,70],[61,57,36],[114,99,58],[144,116,58]];
   const things=[];
   for(const f of softwareFaces){const n=tr(f.normal);if(n[2]<-.02)continue;let v=f.vertices.map(tr),z=v.reduce((a,t)=>a+t[2],0)/4;let light=.18;for(const L of lights)light+=Math.max(0,n[0]*L[0]+n[1]*L[1]+n[2]*L[2])*L[3]*.64;let spec=Math.pow(Math.max(0,n[0]*-.2+n[1]*.3+n[2]*.94),f.gi===1?24:50)*.55;const bc=base[f.gi];const rgb=bc.map((v,k)=>Math.min(255,Math.round(v*light+[205,187,131][k]*spec)));things.push({v,z,fill:`rgb(${rgb.join(',')})`})}
   const backFacing=tr([0,0,1])[2]<0,faceZ=backFacing?-.145:.13;
   things.push({plane:true,z:tr([0,0,faceZ])[2]});things.sort((a,b)=>a.z-b.z);
   for(const t of things){if(!t.plane){x.beginPath();t.v.forEach((v,i)=>i?x.lineTo(c+v[0]*r,c-v[1]*r):x.moveTo(c+v[0]*r,c-v[1]*r));x.closePath();x.fillStyle=t.fill;x.fill();continue}
    const p0=tr([0,0,faceZ]);x.save();x.setTransform(m[0]*r,-m[1]*r,-m[4]*r,m[5]*r,c+p0[0]*r,c-p0[1]*r);
    // Texture coordinates are x to the right and y down, unlike model coordinates.
    x.beginPath();x.arc(0,0,.876,0,TAU);x.moveTo(H[0]+.247,-H[1]);x.arc(H[0],-H[1],.247,0,TAU,true);x.clip('evenodd');
    const im=jade?jadeTextures[backFacing?1:0]:backFacing?back:front;
    if(backFacing){x.scale(-1,1);x.drawImage(im,-1.05,-1.05,2.1,2.1);x.scale(-1,1)}else x.drawImage(im,-1.05,-1.05,2.1,2.1);
    const specStrength=(1-ink)*(.13+Math.max(0,Math.sin(yaw-.1))*.18);let g=x.createLinearGradient(-1,-1,1,1);g.addColorStop(0,`rgba(255,239,187,${specStrength})`);g.addColorStop(.43,'rgba(248,229,179,0)');g.addColorStop(1,'rgba(5,17,9,.3)');x.fillStyle=g;x.fillRect(-1,-1,2,2);x.restore();
   }
  }
  render();return{render,kind:'Software 3D',canvas:target};}

 let sprites;
 function getSprites(){if(sprites)return sprites;const c=document.createElement('canvas');c.width=c.height=192;const r=create(c);sprites=[0,1].map(jade=>{r.render(jade?Math.PI+.02:.02,-.07,0,jade,0);const im=document.createElement('canvas');im.width=im.height=192;im.getContext('2d').drawImage(r.canvas||c,0,0);return im});return sprites}
 async function exportGLB(){const views=[],accessors=[],chunks=[],primitives=[];let offset=0;function add(data,target){const bytes=data instanceof ArrayBuffer?new Uint8Array(data):data;const start=offset;chunks.push({start,data:bytes});offset+=bytes.byteLength;offset=(offset+3)&~3;const index=views.length;views.push({buffer:0,byteOffset:start,byteLength:bytes.byteLength,...(target?{target}:{})});return index}
  groups.forEach((g,gi)=>{const attrs={};for(const [nm,arr,components]of[['POSITION',g.p,3],['NORMAL',g.n,3],['TEXCOORD_0',g.uv,2]]){const f=new Float32Array(arr),vi=add(new Uint8Array(f.buffer),34962),a={bufferView:vi,componentType:5126,count:arr.length/components,type:components===3?'VEC3':'VEC2'};if(nm==='POSITION'){a.min=[0,1,2].map(i=>Math.min(...arr.filter((_,j)=>j%3===i)));a.max=[0,1,2].map(i=>Math.max(...arr.filter((_,j)=>j%3===i)))}attrs[nm]=accessors.length;accessors.push(a)}primitives.push({attributes:attrs,material:gi})});
  const ims=[];for(const img of[front,back]){const blob=await new Promise(resolve=>img.toBlob(resolve,'image/png'));ims.push({bufferView:add(new Uint8Array(await blob.arrayBuffer())),mimeType:'image/png'})}
  const cols=[[1,1,1,1],[.58,.40,.15,1],[.22,.19,.1,1],[1,1,1,1],[.49,.35,.15,1]];const materials=cols.map((c,i)=>({name:['Patinated front','Milled brass rim','Aperture and edge','Reverse engraving','Reeded edge'][i],pbrMetallicRoughness:{baseColorFactor:c,metallicFactor:.88,roughnessFactor:i===1?.30:.51,...((i===0||i===3)?{baseColorTexture:{index:i===0?0:1}}:{})},doubleSided:true}));
  const json={asset:{version:'2.0',generator:'HYPERSPACE Out of Panel 0.3 / visual study, not manufacturing CAD'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:'First Light — Object Study 002'}],meshes:[{primitives}],materials,buffers:[{byteLength:offset}],bufferViews:views,accessors,images:ims,textures:[{source:0},{source:1}]};let j=new TextEncoder().encode(JSON.stringify(json)),jl=(j.length+3)&~3,buf=new ArrayBuffer(12+8+jl+8+offset),v=new DataView(buf),u=new Uint8Array(buf);v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,buf.byteLength,true);v.setUint32(12,jl,true);v.setUint32(16,0x4e4f534a,true);u.fill(32,20,20+jl);u.set(j,20);v.setUint32(20+jl,offset,true);v.setUint32(24+jl,0x004e4942,true);for(const c of chunks)u.set(c.data,28+jl+c.start);return buf;
 }
 return{create,getSprites,exportGLB,groups,textures:[front,back]};
}
let CoinStudio;

function mountCoinStudy() {
  const anchor = document.querySelector('#work') || document.querySelector('#future');
  if (!anchor || document.getElementById('out-of-panel')) return;
  const host = document.createElement('section');
  host.id = 'out-of-panel';
  host.setAttribute('aria-label', 'Currently making: Out of Panel, an interactive coin study');
  host.style.cssText = 'padding:48px 0;scroll-margin-top:96px;';
  anchor.before(host);
  const root = host.attachShadow({mode: 'open'});
  root.innerHTML = `<style>
:host{display:block;color:#f4f1e9;font:16px/1.6 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}[hidden]{display:none!important}button,input{font:inherit}button,a{-webkit-tap-highlight-color:transparent}button{cursor:pointer;touch-action:manipulation}a{color:inherit;text-underline-offset:5px}button:focus-visible,a:focus-visible,input:focus-visible,[tabindex]:focus-visible{outline:3px solid #ffcf4a;outline-offset:5px}.study{display:grid;grid-template-columns:1fr 1.08fr;border:1px solid #343c33;border-radius:26px;overflow:hidden;background:#19251e}.copy{padding:48px 14px 38px 40px;display:flex;flex-direction:column;justify-content:center}.eyebrow,.meta{font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:600}.eyebrow{color:#d1b47a;margin:0 0 25px;display:flex;align-items:center;gap:10px}.dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#d1b47a}h2{font-size:clamp(29px,3.5vw,43px);line-height:1.13;letter-spacing:-.04em;margin:0 0 23px;font-weight:600}h2 em{font:italic 1.1em/1 Georgia,serif;font-weight:400;color:#e6cca0}p{margin:0 0 19px}.intro{color:#d0d6c9;font-size:15px;line-height:1.8;max-width:400px}.invitation{font:italic 20px/1.5 Georgia,serif;color:#e6cca0}.credit{font-size:11px;color:#bbc4b5;line-height:1.65;margin:20px 0 0;max-width:330px}details{border-top:1px solid #52604b;margin:7px 0 0;padding-top:14px;max-width:390px}summary{font-size:12px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;min-height:38px}summary::-webkit-details-marker{display:none}summary:after{content:'+';font-size:20px;color:#dcc395}details[open] summary:after{content:'−'}details p{color:#c6cebf;font-size:13px;line-height:1.8;margin:14px 0}.save{border:0;background:none;padding:10px 0;color:#f0d6a7;text-decoration:underline;text-underline-offset:5px;font-size:12px;min-height:44px}.save:disabled{opacity:.5}.visual{position:relative;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:26px 24px 24px;background:radial-gradient(ellipse at 43% 36%,#334332 0%,#263425 32%,#1c291f 72%);isolation:isolate}.visual:before{content:'';position:absolute;inset:16px;border:1px solid #bdc3a91a;border-radius:14px;pointer-events:none;z-index:-1}.top{width:100%;display:flex;justify-content:space-between;gap:20px;color:#c2ccb8;font-size:9px;letter-spacing:.16em;line-height:1.6}.desk{position:relative;width:100%;aspect-ratio:1/1;display:grid;place-items:center;max-width:500px;touch-action:pan-y}.desk:after{content:'';position:absolute;bottom:9%;width:48%;height:6%;background:#080e098a;filter:blur(14px);border-radius:50%;z-index:-1}.object{border:0;background:none;padding:0;width:90%;aspect-ratio:1;position:relative;cursor:grab;touch-action:none;user-select:none;border-radius:50%;display:grid;place-items:center}.object.dragging{cursor:grabbing}.object canvas{width:100%;height:100%;display:block;pointer-events:none}.hint{position:absolute;bottom:2%;left:0;width:100%;text-align:center;font-size:10px;letter-spacing:.15em;color:#c4cebb;pointer-events:none}.controls{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin:16px 0 0}.controls button{min-height:44px;border:1px solid #66725b;border-radius:99px;background:#ffffff06;padding:10px 16px;color:#f4efdd;font-size:12px;transition:background .2s}.controls button:hover{background:#ffffff12}.controls .main{background:#e1c58f;border-color:#e1c58f;color:#172319}.controls .main:hover{background:#f0d9b1}.status{font:italic 14px/1.5 Georgia,serif;color:#d3dcbf;text-align:center;min-height:42px;margin:15px 0 0;max-width:330px}.share{color:#bfccb5;text-decoration:underline;text-underline-offset:4px;background:none;border:0;font-size:11px;min-height:44px;padding:8px 12px}.fallback{width:100%;color:#eee;background:#18241b;border:1px solid #687b5c;padding:10px;border-radius:8px;font-size:12px}.error{color:#f3dfb2;font-size:13px;max-width:280px;text-align:center}.visual[data-ready=false] .controls{visibility:hidden}@media(max-width:760px){.study{grid-template-columns:1fr}.visual{order:-1;padding:22px 22px 16px}.desk{max-width:360px}.copy{padding:30px 27px}.top{font-size:9px}.eyebrow{margin-bottom:17px}h2{font-size:35px}.intro{font-size:14px;max-width:none}.status{min-height:22px}.credit{max-width:none}.visual:before{inset:12px}.controls{margin-top:10px}.share{margin-top:0}}@media(max-width:380px){.copy{padding:25px 21px}h2{font-size:30px}.visual{padding:20px 14px 15px}.controls{gap:6px}.controls button{padding:10px 13px}.object{width:91%}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}
</style>
<article class="study">
<div class="copy"><p class="eyebrow"><span class="dot" aria-hidden="true"></span>Currently making / HYPERSPACE</p>
<h2>What if a story could<br><em>leave the page?</em></h2>
<p class="intro">I’m writing a comic, designing its front and back, and exploring how objects from its world can become things you can play with — and eventually hold.</p>
<p class="invitation">Start with this coin.<br>Turn it over. Give it a spin.</p>
<details><summary>Behind the little experiment</summary><p><strong>OUT OF PANEL</strong> connects a comic, a collectible and a game. The first object is the First Light coin: a tiny piece of a story, made to be used rather than just looked at.</p><p>I’m shaping the world, the story and how it should feel, with AI helping me design and build. This is the live object study from the playable prototype — not an NFT sale.</p><p>The imagined next chapter: a printed comic with the real coin waiting inside. No physical edition has been made yet.</p><button class="save" type="button" id="save">Save the 3D study (.glb) ↓</button></details>
<p class="credit">An AI-assisted work in progress. No account, wallet or purchase. Just a little curiosity.</p></div>
<div class="visual" data-ready="false"><div class="top"><span>FIRST LIGHT<br>OBJECT STUDY / 002</span><span>OUT OF PANEL<br>FROM MY ATELIER</span></div>
<div class="desk"><button type="button" class="object" id="object" aria-label="First Light coin. Drag to rotate, use arrow keys, or press Enter to turn over." aria-describedby="hint"><canvas width="512" height="512" aria-hidden="true"></canvas></button><span class="hint" id="hint">DRAG TO TURN · TAP TO FLIP</span></div>
<p class="error" hidden></p><div class="controls"><button type="button" class="main" id="flip">Turn it over ↻</button><button type="button" id="spin">Give it a spin ✧</button><button type="button" id="reset" aria-label="Reset coin to its original view">Reset</button></div>
<p class="status" role="status" aria-live="polite">A small object. A much bigger world.</p><button class="share" type="button" id="share">Share this little moment ↗</button><input class="fallback" readonly hidden aria-label="Link to this interactive coin study">
</div></article>`;
  const $ = s => root.querySelector(s);
  const object = $('#object'), canvas = $('canvas'), status = $('.status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer, active = false, visible = false, frameId = 0, last = 0, dirty = true;
  let yaw = .28, pitch = -.22, tyaw = yaw, tpitch = pitch, drag = null, suppress = false;
  const clean = () => { if (frameId) cancelAnimationFrame(frameId); frameId = 0; last = 0; };
  function start() { if (active && visible && !document.hidden && !frameId) frameId = requestAnimationFrame(frame); }
  function frame(t) {
    frameId = 0;
    if (!visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((t - last) / 1000, .06) : 1 / 60; last = t;
    const r = motion.matches ? 1 : 1 - Math.exp(-dt * 12);
    yaw += (tyaw - yaw) * r; pitch += (tpitch - pitch) * r;
    const moving = Math.abs(tyaw - yaw) > .0008 || Math.abs(tpitch - pitch) > .0008;
    if (!moving) { yaw = tyaw; pitch = tpitch; }
    if (dirty || moving) renderer.render(yaw, pitch, 0, 0, -.06);
    dirty = false;
    object.dataset.yaw = yaw.toFixed(5);
    object.dataset.pitch = pitch.toFixed(5);
    if (moving) start(); else last = 0;
  }
  function resize() {
    if (!renderer) return;
    const target = renderer.canvas || canvas;
    const size = Math.max(192, Math.min(720, Math.ceil(object.clientWidth * Math.min(devicePixelRatio || 1, 1.65))));
    if (target.width !== size) target.width = target.height = size;
    dirty = true; start();
  }
  function init() {
    if (active) return;
    try { CoinStudio ||= makeCoinStudio(); renderer = CoinStudio.create(canvas); active = true; $('.visual').dataset.ready = 'true'; host.dataset.renderer = renderer.kind; resize(); }
    catch (err) { $('.error').hidden = false; $('.error').textContent = 'The 3D view could not start in this browser. The rest of Beyond the CV still works.'; object.hidden = true; $('.hint').hidden = true; }
  }
  function announce(text) { status.textContent = text; }
  function flip() { init(); tyaw += Math.PI; tpitch = -.18; dirty = true; announce('“Not everything. Something.” — on the reverse.'); start(); }
  $('#flip').onclick = flip;
  $('#spin').onclick = () => { init(); tyaw += motion.matches ? Math.PI : Math.PI * 2; tpitch = -.18; dirty = true; announce(motion.matches ? 'Turned over with reduced motion.' : 'A little spin. A little wonder.'); start(); };
  $('#reset').onclick = () => { cancelDrag(); tyaw = .28; tpitch = -.22; dirty = true; announce('Back to the beginning.'); start(); };
  object.addEventListener('pointerdown', e => {
    if (drag || e.button !== 0 || e.isPrimary === false) return;
    init(); if (!active) return;
    object.focus({preventScroll: true});
    drag = {id: e.pointerId, x: e.clientX, y: e.clientY, yaw: tyaw, pitch: tpitch, moved: false};
    object.setPointerCapture(e.pointerId); object.classList.add('dragging');
  });
  object.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    tyaw = drag.yaw + dx * .009; tpitch = Math.max(-1.1, Math.min(1.1, drag.pitch + dy * .007));
    dirty = true; start();
  });
  function release(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null; object.classList.remove('dragging');
    try { if (object.hasPointerCapture(d.id)) object.releasePointerCapture(d.id); } catch (_) {}
    suppress = true; setTimeout(() => suppress = false, 120);
    if (cancelled) { tyaw = d.yaw; tpitch = d.pitch; dirty = true; start(); return; }
    if (!d.moved) flip();
  }
  function cancelDrag() { if (drag) release({pointerId: drag.id}, true); }
  object.addEventListener('pointerup', e => release(e, false));
  object.addEventListener('pointercancel', e => release(e, true));
  object.addEventListener('lostpointercapture', e => release(e, true));
  object.addEventListener('click', e => { if (!suppress && e.detail === 0) flip(); });
  object.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault(); init();
    if (e.key === 'ArrowLeft') tyaw -= .25;
    if (e.key === 'ArrowRight') tyaw += .25;
    if (e.key === 'ArrowUp') tpitch = Math.max(-1.1, tpitch - .16);
    if (e.key === 'ArrowDown') tpitch = Math.min(1.1, tpitch + .16);
    dirty = true; start();
  });
  $('#save').onclick = async () => {
    const b = $('#save'); b.disabled = true;
    try { CoinStudio ||= makeCoinStudio(); const data = await CoinStudio.exportGLB(); const url = URL.createObjectURL(new Blob([data], {type: 'model/gltf-binary'})); const a = document.createElement('a'); a.href = url; a.download = 'FIRST-LIGHT-Object-Study-002.glb'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); announce('3D study saved. A visual model, not manufacturing CAD.'); }
    catch (_) { announce('The export did not complete. You can still turn and inspect the coin.'); }
    finally { b.disabled = false; }
  };
  $('#share').onclick = async () => {
    const url = new URL(location.href); url.hash = 'out-of-panel'; url.search = '';
    const text = !['http:', 'https:'].includes(url.protocol) ? 'https://mikelninh.github.io/beyond-cv/atelier/#out-of-panel' : url.href;
    try { if (!navigator.clipboard) throw Error('Clipboard unavailable'); await navigator.clipboard.writeText(text); announce('Link copied. Ready to pass on.'); }
    catch (_) { const f = $('.fallback'); f.hidden = false; f.value = text; f.focus(); f.select(); announce('Select and copy this link to share the moment.'); }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelDrag(); clean(); } else { dirty = true; start(); } });
  object.addEventListener('renderer-lost', () => { active = false; clean(); $('.error').hidden = false; $('.error').textContent = '3D rendering paused. Reload the page to restore the coin.'; });
  const onMotion = () => { dirty = true; start(); }; motion.addEventListener?.('change', onMotion);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(object);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) { init(); dirty = true; start(); } else { cancelDrag(); clean(); } }, {rootMargin: '80px'}).observe(host);
  else { visible = true; init(); }
  if (location.hash === '#out-of-panel') requestAnimationFrame(() => host.scrollIntoView({block: 'start', behavior: 'instant'}));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountCoinStudy, {once: true});
else mountCoinStudy();

})();
