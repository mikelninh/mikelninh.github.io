'use strict';
/* First Light / 002. Self-contained material study and mesh.
   WebGL renderer with a deliberately lightweight studio-lighting approximation.
   No network, tracking, external 3D library or wallet integration. */
const CoinStudio=(()=>{
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
})();
