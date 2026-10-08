/* OUT OF PANEL 0.5 — Through the aperture.
 * The portable build embeds pinned Three.js r180. No runtime network requests.
 * Original coin geometry, game, reader, invitations and software path are retained.
 */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = t => t * t * (3 - 2 * t);
  const legacy = window.OutOfPanelWonder;
  const canvas = $('#journey-canvas');
  const tray = $('#rooftop-details');
  const caption = $('#rooftop-caption');
  const places = {
    mia: { title: 'Oh. Hello.', copy: 'Mia looks up. You seem to have passed inspection.', point: [1.13, .8, .65] },
    tea: { title: 'Someone saved you a cup.', copy: 'Still warm. There is no hurry here.', point: [-.75, .7, .63] },
    note: { title: 'Not everything. Something.', copy: 'A little promise, folded small enough to keep.', point: [-.36, .59, .19] }
  };
  let status = 'idle', reason = '', T, renderer, rooftop, studio, camera, worldCamera, target;
  let coinGroup, portal, materials, catHead, catBody, catTail, catEyes = [], cloths = [], steam;
  let progress = 0, destination = 0, entered = false, selected = null, elapsed = 0, lastTime = 0, lastDraw = 0;
  let w = 1, h = 1, ratio = 1, drag = null, aim = { x: 0, y: 0 }, drift = { x: 0, y: 0 }, orbit = { x: 0, y: 0 };
  let opening = null, cameraPosition, cameraLook, raycaster, seen = new Set(), renders = 0, stillFrame = '', lastPeek = -Infinity, fullTarget = false;

  function fallback(message) {
    status = 'fallback'; reason = message; entered = false; destination = progress = 0;
    document.body.classList.remove('journey-ready', 'rooftop-arrived');
    tray.hidden = true; canvas.setAttribute('aria-hidden', 'true');
    $('#coin').tabIndex = view === 'read' ? -1 : 0; coin.renderDirty = true;
    if (document.body.classList.contains('world-open')) legacy.enterWorld();
  }

  function ensure() {
    if (status !== 'idle') return status === 'ready';
    if (!window.FirstLightThree || !canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' })) {
      fallback('WebGL2 unavailable; original software experience retained.'); return false;
    }
    try {
      T = window.FirstLightThree();
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      camera = new T.PerspectiveCamera(36.8699, 1, .002, 80);
      camera.position.set(0, 0, 4.3);
      worldCamera = new T.PerspectiveCamera(43, 1, .08, 170);
      cameraPosition = new T.Vector3(); cameraLook = new T.Vector3();
      raycaster = new T.Raycaster();
      target = new T.WebGLRenderTarget(512, 512, { type: T.UnsignedByteType, depthBuffer: true });
      buildRooftop(); buildCoin(); resize();
      renderer.shadowMap.needsUpdate = true;
      renderer.setRenderTarget(target); renderer.render(rooftop, worldCamera); renderer.setRenderTarget(null);
      status = 'ready';
      document.body.classList.add('journey-ready');
      canvas.setAttribute('aria-hidden', 'false');
      $('#renderer-note').textContent = 'FIRST LIGHT / OBJECT 001';
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fallback('3D context lost; original experience retained.'); });
      return true;
    } catch (error) { fallback('3D initialization unavailable: ' + error.message); return false; }
  }

  function material(color, roughness = .85, extra = {}) {
    return new T.MeshStandardMaterial({ color, roughness, ...extra });
  }

  function buildRooftop() {
    rooftop = new T.Scene();
    rooftop.fog = new T.FogExp2(0xc89b87, .024);
    const skyMaterial = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: {},
      vertexShader: 'varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec3 vPosition;void main(){float y=normalize(vPosition).y;vec3 low=vec3(.89,.60,.40);vec3 high=vec3(.10,.27,.32);vec3 col=mix(low,high,smoothstep(-.02,.55,y));gl_FragColor=vec4(col,1.);#include <colorspace_fragment>}'.replace('#include', '\n#include') });
    const sky = new T.Mesh(new T.SphereGeometry(130, 32, 16), skyMaterial); rooftop.add(sky);
    rooftop.add(new T.HemisphereLight(0xcbd4dd, 0xa36840, 2.0));
    const sunLight = new T.DirectionalLight(0xffd9a6, 3.5); sunLight.position.set(-6, 9, -7);
    sunLight.castShadow = true; sunLight.shadow.mapSize.set(1024, 1024);
    Object.assign(sunLight.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .1, far: 30 });
    sunLight.shadow.bias = -.001; sunLight.shadow.normalBias = .025; rooftop.add(sunLight);
    const sun = new T.Mesh(new T.CircleGeometry(3.0, 64), new T.MeshBasicMaterial({ color: 0xffd9aa, fog: false }));
    sun.position.set(-24, 4.8, -38); sun.lookAt(new T.Vector3(4.1,2.9,5.8)); rooftop.add(sun);
    const haloCanvas = document.createElement('canvas'); haloCanvas.width = haloCanvas.height = 128;
    const hx = haloCanvas.getContext('2d'), hg = hx.createRadialGradient(64, 64, 5, 64, 64, 64);
    hg.addColorStop(0, '#ffe4b26f'); hg.addColorStop(.4, '#f5c29422'); hg.addColorStop(1, '#f5c29400'); hx.fillStyle = hg; hx.fillRect(0, 0, 128, 128);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(haloCanvas), transparent: true, depthWrite: false, fog: false })); halo.position.copy(sun.position); halo.scale.set(15, 15, 1); rooftop.add(halo);

    const boxGeo = new T.BoxGeometry(1, 1, 1), sphereGeo = new T.SphereGeometry(1, 24, 16);
    const teal = material(0x456b69), trim = material(0xa3afa0), tile = material(0xb38467), dark = material(0x25413f), wood = material(0x9d7049), brass = material(0xb99d68, .42, { metalness: .55 });
    function box(parent, x, y, z, sx, sy, sz, mat = teal, shadow = true) {
      const mesh = new T.Mesh(boxGeo, mat); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz);
      mesh.castShadow = shadow; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    }
    function ellipsoid(parent, x, y, z, sx, sy, sz, mat, shadow = true) {
      const mesh = new T.Mesh(sphereGeo, mat); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz);
      mesh.castShadow = shadow; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    }
    function tube(parent, points, radius, mat, shadow = false) {
      const mesh = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 20, radius, 6, false), mat);
      mesh.castShadow = shadow; parent.add(mesh); return mesh;
    }

    let seed = 923; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const city = new T.InstancedMesh(boxGeo, material(0xffffff), 140), buildings = [], dummy = new T.Object3D();
    for (let i = 0; i < 140; i++) {
      const row = Math.floor(i / 28), x = (i % 28 - 14) * 2.4 + random(), z = -12 - row * 5.0, height = 1.1 + random() * (row ? 4.6 : 2.9), width = 1.0 + random() * 1.1;
      dummy.position.set(x, height / 2 - 1.0, z); dummy.scale.set(width, height, 1.1 + random() * 1.2); dummy.updateMatrix(); city.setMatrixAt(i, dummy.matrix);
      city.setColorAt(i, new T.Color().setHSL(.47 + random() * .04, .13, .24 + row * .012 + random() * .11)); buildings.push({ x, z, height, width });
    }
    rooftop.add(city);
    box(rooftop, 0, -1.14, -24, 100, .15, 68, material(0x344a4b), false);
    const neighbours=new T.InstancedMesh(boxGeo,material(0xffffff),90);
    for(let i=0;i<90;i++){
      const height=.35+random()*.85;
      dummy.position.set((i%18-9)*1.95+random()*.3,height/2-1, -5.3-Math.floor(i/18)*1.6);
      dummy.scale.set(1.5+random()*.4,height,1.25+random()*.25);dummy.updateMatrix();neighbours.setMatrixAt(i,dummy.matrix);
      neighbours.setColorAt(i,new T.Color().setHSL(.47,.11,.24+random()*.12));
    }
    rooftop.add(neighbours);
    const windows = new T.InstancedMesh(boxGeo, new T.MeshBasicMaterial({ color: 0xeac398 }), 1700); let wi = 0;
    for (const b of buildings) {
      for (let y = .0; y < b.height - 1.25 && wi < 1700; y += .65) for (let col = -1; col <= 1 && wi < 1700; col++) {
        if (random() > .54) continue;
        dummy.position.set(b.x + col * b.width * .24, y, b.z + 1.2); dummy.scale.set(.10, .21, .014); dummy.updateMatrix(); windows.setMatrixAt(wi, dummy.matrix);
        windows.setColorAt(wi++, new T.Color(random() > .65 ? 0xf6c488 : 0x839e99));
      }
    }
    windows.count = wi; rooftop.add(windows);
    // A few recognisable rooftop water tanks and aerials; the city stays secondary.
    for (const i of [5, 9, 16, 20]) {
      const b = buildings[i]; box(rooftop, b.x, b.height -.6, b.z, .7, .25, .6, dark, false);
      const tank = new T.Mesh(new T.CylinderGeometry(.22, .22, .65, 12), material(0x8caba6, .48, { metalness: .35 })); tank.position.set(b.x, b.height -.18, b.z); rooftop.add(tank);
      tube(rooftop, [[b.x+.5,b.height-1,b.z],[b.x+.5,b.height+1,b.z]], .018, dark);
      tube(rooftop, [[b.x+.17,b.height+.8,b.z],[b.x+.9,b.height+.8,b.z]], .018, dark);
    }

    const home = new T.Group(); rooftop.add(home);
    box(home, 0, -.15, 0, 5.2, .30, 4.8, material(0x636d60));
    const floorTiles = new T.InstancedMesh(boxGeo, tile, 144); let ti = 0;
    for (let x = 0; x < 12; x++) for (let z = 0; z < 12; z++) {
      dummy.position.set(-2.39 + x * .434, .018, -2.19 + z * .40); dummy.scale.set(.420, .038, .388); dummy.updateMatrix(); floorTiles.setMatrixAt(ti, dummy.matrix);
      floorTiles.setColorAt(ti++, new T.Color().setHSL(.07 + random()*.025, .25, .44 + random() * .08));
    }
    floorTiles.receiveShadow = true; home.add(floorTiles);
    box(home, 0, .36, -2.36, 5.25, .67, .20, teal); box(home, 0, .73, -2.36, 5.30, .10, .25, trim);
    box(home, -2.52, .34, -.1, .18, .65, 4.4, teal); box(home, -2.52, .71, -.1, .24, .09, 4.5, trim);
    box(home, 2.52, .23, -.7, .18, .44, 3.0, teal); box(home, 2.52, .49, -.7, .24, .09, 3.1, trim);
    // Stairwell door and the lamp that says someone is home.
    box(home, -1.42, 1.22, -2.13, 1.65, 2.44, .25, teal);
    box(home, -1.42, 1.2, -1.97, 1.16, 2.08, .035, dark);
    box(home, -1.42, 1.53, -1.935, .88, .92, .022, material(0xf8c68d, .75, { emissive: 0xe8a663, emissiveIntensity: .45 }));
    box(home, -1.42, 1.53, -1.912, .04, .93, .027, wood); box(home, -1.42, 1.53, -1.909, .87, .035, .028, wood);
    ellipsoid(home, -.96, .8, -1.89, .034, .034, .025, brass);
    box(home, -1.42, 2.47, -2.12, 1.84, .11, .40, trim);
    tube(home, [[-.49, 2.22,-2.03],[-.22,2.22,-2.03],[-.22,1.85,-1.85]], .022, dark);
    const lamp = new T.Mesh(new T.ConeGeometry(.18, .17, 24, 1, true), brass); lamp.position.set(-.22, 1.85, -1.85); home.add(lamp);
    const bulbMat = new T.MeshBasicMaterial({ color: 0xffdfa2 }); ellipsoid(home, -.22, 1.77, -1.85, .075, .075, .075, bulbMat, false);
    const lampLight = new T.PointLight(0xffbd74, 4.5, 4.2, 2); lampLight.position.set(-.22, 1.72, -1.75); rooftop.add(lampLight);

    // A low tea table, two stools, and a folded note.
    const table = new T.Group(); table.position.set(-.7, 0, .55); home.add(table);
    const tableTop = new T.Mesh(new T.CylinderGeometry(.60, .59, .07, 48), wood); tableTop.position.y = .52; tableTop.castShadow = true; tableTop.receiveShadow = true; table.add(tableTop);
    for (const a of [.35, 2.45, 4.54]) box(table, Math.cos(a)*.39, .26, Math.sin(a)*.39, .06, .48, .06, dark);
    for (const [x, z] of [[-1.62,.8],[-.34,1.55]]) {
      box(home,x,.31,z,.47,.075,.39,wood); for (const [dx,dz] of [[-.16,-.12],[.16,-.12],[-.16,.12],[.16,.12]]) box(home,x+dx,.15,z+dz,.035,.27,.035,dark);
    }
    const ceramic = material(0xd5d8bc, .33), teaColor = material(0x513a20, .25);
    const cup = new T.Mesh(new T.CylinderGeometry(.105, .084, .13, 32), ceramic); cup.position.set(-.78,.622,.66); home.add(cup);
    const tea = new T.Mesh(new T.CircleGeometry(.093,32),teaColor); tea.rotation.x = -Math.PI/2; tea.position.set(-.78,.689,.66); home.add(tea);
    const handle = new T.Mesh(new T.TorusGeometry(.058,.013,6,20,Math.PI*1.75),ceramic); handle.position.set(-.675,.625,.66); handle.rotation.y = Math.PI/2; home.add(handle);
    const saucer = new T.Mesh(new T.CylinderGeometry(.153,.15,.019,32),ceramic); saucer.position.set(-.78,.568,.66); home.add(saucer);
    const note = box(home,-.38,.571,.23,.28,.016,.22,material(0xe6d2a2)); note.rotation.y = -.23;
    const fold = new T.Mesh(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([-.12,0,-.10,.12,0,-.10,0,.055,.08],3)),material(0xf4e4bc,.9,{side:T.DoubleSide})); fold.geometry.computeVertexNormals(); fold.position.set(-.38,.579,.23); home.add(fold);
    steam = new T.Group(); steam.position.set(-.78,.70,.66); home.add(steam);
    for (let i=0;i<3;i++) { const s=tube(steam,[[i*.025,0,0],[-.018+i*.015,.12,0],[.025+i*.01,.25,0]],.004,new T.MeshBasicMaterial({color:0xffe8c6,transparent:true,opacity:.20,depthWrite:false})); s.userData.phase=i; }

    const foliage=new T.InstancedMesh(sphereGeo,material(0xffffff),96);let leafCount=0;foliage.castShadow=true;foliage.receiveShadow=true;home.add(foliage);
    function plant(x,z,height=.8) {
      const p = new T.Group(); p.position.set(x,.04,z); home.add(p);
      const pot=new T.Mesh(new T.CylinderGeometry(.22,.16,.31,20),material(0xb87955)); pot.position.y=.155; pot.castShadow=true; p.add(pot);
      const soil=new T.Mesh(new T.CircleGeometry(.20,20),dark); soil.rotation.x=-Math.PI/2; soil.position.y=.312; p.add(soil);
      tube(p,[[0,.30,0],[.025,height*.70,0],[-.035,height,0]],.012,material(0x63815c));
      for (let i=0;i<9;i++){const a=i*2.4;dummy.position.set(x+Math.cos(a)*.13,.40+i*(height-.36)/10,z+Math.sin(a)*.12);dummy.scale.set(.16,.035,.068);dummy.rotation.set(Math.sin(a)*.25,-a,Math.cos(a)*.48);dummy.updateMatrix();foliage.setMatrixAt(leafCount,dummy.matrix);foliage.setColorAt(leafCount++,new T.Color(i%2?0x719466:0x547c62));}foliage.count=leafCount;
    }
    plant(1.90,-1.59,1.15); plant(2.04,-.82,.79); plant(-2.07,-.45,.87); plant(1.91,1.3,.63);
    box(home, 1.27,.20,-1.95,.82,.38,.45,wood); box(home,1.27,.412,-1.95,.72,.022,.35,dark);
    for (const x of [1.02,1.22,1.46]) plant(x,-1.92,.66);

    // Real cloth meshes share one quiet breeze. No random frame-to-frame noise.
    const ropeMat=material(0x657063); tube(home,[[-2.32,2.67,-1.47],[0,2.42,-1.45],[2.36,2.70,-1.40]],.013,ropeMat);
    for (const [x,color,len] of [[-.47,0xe0cba6,.63],[.26,0x9cbbb0,.82],[1.02,0xc59270,.56]]) {
      const geo=new T.PlaneGeometry(.52,len,8,8), pos=geo.attributes.position;
      for(let i=0;i<pos.count;i++) pos.setZ(i,Math.sin(pos.getX(i)*23)*.023);
      const cloth=new T.Mesh(geo,material(color,.96,{side:T.DoubleSide})); cloth.position.set(x,2.46-len/2,-1.42); cloth.castShadow=true;
      cloth.userData={base:Array.from(pos.array),phase:x*2}; home.add(cloth); cloths.push(cloth);
      for(const dx of [-.18,.18]) box(home,x+dx,2.49,-1.42,.025,.11,.032,wood);
    }
    tube(home,[[-2.31,.5,-1.9],[-2.31,2.9,-1.9]],.023,dark); tube(home,[[2.36,.5,-1.9],[2.36,2.9,-1.9]],.023,dark);

    // Mia: restrained shapes, warm eyes, a softly curled tail.
    const cat=new T.Group(); cat.position.set(1.13,.06,.65); cat.rotation.y=-.22; home.add(cat);
    const fur=material(0x202f32,.87), earMat=material(0x8b726d), eyesMat=material(0xd6b15f,.4,{emissive:0xd1a048,emissiveIntensity:.18});
    catBody=ellipsoid(cat,0,.34,0,.23,.34,.24,fur);
    ellipsoid(cat,-.13,.045,.16,.106,.056,.17,fur); ellipsoid(cat,.14,.045,.16,.106,.056,.17,fur);
    catHead=new T.Group(); catHead.position.set(0,.75,.035); cat.add(catHead);
    ellipsoid(catHead,0,0,0,.25,.22,.215,fur);
    for(const sign of [-1,1]) {
      const ear=new T.Mesh(new T.ConeGeometry(.105,.23,3),fur); ear.position.set(sign*.167,.216,-.025); ear.rotation.z=-sign*.15; ear.castShadow=true; catHead.add(ear);
      const inner=new T.Mesh(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([sign*.075,.14,.069,sign*.24,.14,.057,sign*.17,.31,.03],3)),earMat); inner.geometry.computeVertexNormals(); catHead.add(inner);
      const eye=new T.Group(); eye.position.set(sign*.096,.018,.197); catHead.add(eye); catEyes.push(eye);
      ellipsoid(eye,0,0,0,.051,.032,.010,eyesMat,false); ellipsoid(eye,0,0,.010,.010,.029,.003,material(0x19262a),false); ellipsoid(eye,-.015,.011,.014,.008,.008,.003,bulbMat,false);
      ellipsoid(catHead,sign*.046,-.056,.194,.064,.043,.044,fur,false);
      for(const dy of [-.025,.012]) tube(catHead,[[sign*.08,-.075+dy,.209],[sign*.20,-.069+dy,.21],[sign*.30,-.056+dy,.20]],.0018,new T.MeshBasicMaterial({color:0xa6ad9e,transparent:true,opacity:.56}));
    }
    ellipsoid(catHead,0,-.05,.232,.019,.013,.008,material(0xb99883),false);
    catTail=new T.Group(); cat.add(catTail); tube(catTail,[[.16,.10,-.13],[.42,.08,-.12],[.50,.09,.15],[.39,.14,.24]],.05,fur,true);
    cat.traverse(obj=>{if(obj.isMesh)obj.userData.detail='mia';}); cup.userData.detail='tea'; saucer.userData.detail='tea'; handle.userData.detail='tea'; note.userData.detail='note'; fold.userData.detail='note';

    // A sunset studio environment gives the original brass mesh moving reflections.
    const envScene=new T.Scene(); envScene.background=new T.Color(0x697477);
    for(const [x,y,z,sx,sy,sz,color] of [[-3,3,1,2,4,.15,0xffe8be],[3,1,2,1,5,.15,0xb7d3cf],[0,4,-3,5,1,.15,0xf1bc89]]) box(envScene,x,y,z,sx,sy,sz,new T.MeshBasicMaterial({color}),false);
    const pmrem=new T.PMREMGenerator(renderer); const environment=pmrem.fromScene(envScene,.045, .1, 30); pmrem.dispose();
    studio=new T.Scene(); studio.environment=environment.texture; studio.add(new T.HemisphereLight(0xffedd0,0x344f4d,2.2));
    const keyLight=new T.DirectionalLight(0xffd9a7,3.0); keyLight.position.set(-2,4,5); studio.add(keyLight);
    const edgeLight=new T.DirectionalLight(0xbde1dd,2.0); edgeLight.position.set(4,1,2); studio.add(edgeLight);
  }

  function buildCoin() {
    coinGroup=new T.Group(); studio.add(coinGroup);
    const textures=CoinStudio.textures.map(c=>{const t=new T.CanvasTexture(c);t.flipY=false;t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;});
    materials=[
      new T.MeshStandardMaterial({map:textures[0],bumpMap:textures[0],bumpScale:.018,metalness:.79,roughness:.47,side:T.DoubleSide,envMapIntensity:1.45}),
      material(0xc9a76a,.26,{metalness:.91,envMapIntensity:1.4}),
      material(0x7e6944,.43,{metalness:.84,envMapIntensity:1.1}),
      new T.MeshStandardMaterial({map:textures[1],bumpMap:textures[1],bumpScale:.014,metalness:.81,roughness:.45,side:T.DoubleSide,envMapIntensity:1.35}),
      material(0xb39863,.33,{metalness:.92})
    ];
    CoinStudio.groups.forEach((group,i)=>{
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(group.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(group.n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(group.uv,2));
      coinGroup.add(new T.Mesh(geo,materials[i]));
    });
    portal=new T.Mesh(new T.CircleGeometry(.221,64),new T.ShaderMaterial({side:T.DoubleSide,uniforms:{map:{value:target.texture},resolution:{value:new T.Vector2(1,1)}},
      vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform sampler2D map;uniform vec2 resolution;void main(){gl_FragColor=texture2D(map,gl_FragCoord.xy/resolution);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }));
    portal.position.set(.235,.25,0); coinGroup.add(portal);
  }

  function resize() {
    const bounds=stage.getBoundingClientRect(); w=Math.max(1,bounds.width); h=Math.max(1,bounds.height);
    ratio=Math.min(devicePixelRatio||1,innerWidth<760?1.3:1.5);
    renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);camera.aspect=worldCamera.aspect=w/h;camera.updateProjectionMatrix();worldCamera.updateProjectionMatrix();
    sizeTarget(fullTarget);
    portal.material.uniforms.resolution.value.set(Math.round(w*ratio),Math.round(h*ratio));
    lastPeek=-Infinity;stillFrame='';
  }

  function sizeTarget(full) {
    fullTarget=full;
    const scale=full?ratio:Math.min(ratio,(innerWidth<760?320:512)/Math.max(w,h));
    target.setSize(Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale)));
  }

  function enter() {
    if(view!=='object')switchView('object');
    if(!ensure()){legacy.enterWorld();return;}
    opening={x:coin.x,y:coin.y,size:coin.size,yaw:coin.yaw,pitch:coin.pitch,roll:coin.roll};
    entered=true;destination=1; selected=null; orbit={x:0,y:0};aim={x:0,y:0};
    tray.querySelectorAll('[data-rooftop]').forEach(b=>b.setAttribute('aria-pressed','false'));
    legacy.enterWorld(); $('#coin').tabIndex=-1; $('#close-world').focus({preventScroll:true});
    $('#wonder-title').innerHTML='Stay a<br><em>little while.</em>';
    $('#wonder-lead').innerHTML='A rooftop above the city. <br>Someone saved you a place.';
    $('#wonder-note').innerHTML='Meet Mia. Find the tea.<br>Take a moment before page 04.';
    caption.innerHTML='<em>“Oh. Hello.”</em><span>A small place to stay a little while.</span>';
    if(reduced())progress=1;
    session.discovered=true;save();
  }

  function exit(focus=true) {
    entered=false;destination=0;drag=null;
    document.body.classList.remove('rooftop-arrived');tray.hidden=true;canvas.tabIndex=-1;
    legacy.exitWorld();$('#coin').tabIndex=view==='read'?-1:0;
    if(reduced()||view!=='object')progress=0;
    if(focus&&view==='object')$('#look-inside').focus({preventScroll:true});
  }

  function discover(name,focus=false) {
    if(!entered||progress<.98||!places[name])return;
    selected=name;seen.add(name);const place=places[name];
    caption.innerHTML='';const title=document.createElement('em'),copy=document.createElement('span');title.textContent=place.title;copy.textContent=place.copy;caption.append(title,copy);
    tray.querySelectorAll('[data-rooftop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rooftop===name)));
    if(name==='mia')contact('paper');
    if(focus)tray.querySelector('[data-rooftop="'+name+'"]').focus({preventScroll:true});
    announce(place.title+' '+place.copy);
  }

  function animateScene(t) {
    const motion=reduced()?0:t;
    catBody.scale.y=.34*(1+Math.sin(motion*1.4)*.012);
    catTail.rotation.y=Math.sin(motion*.8)*.055;
    catHead.rotation.y=clamp(drift.x*.28+orbit.x*.10,-.30,.30)+(selected==='mia'?Math.sin(motion*.65)*.07:0);
    catHead.rotation.z=selected==='mia'?.10:0;
    const blink=reduced()?1:(Math.sin(motion*.76)>.994?.10:1); catEyes.forEach(eye=>eye.scale.y=blink);
    for(const cloth of cloths){const pos=cloth.geometry.attributes.position,base=cloth.userData.base;for(let i=0;i<pos.count;i++){const weight=(.5-pos.getY(i))*.5;pos.setZ(i,base[i*3+2]+(reduced()?0:Math.sin(motion*.72+cloth.userData.phase+base[i*3]*3)*.056*weight));}pos.needsUpdate=true;cloth.geometry.computeVertexNormals();}
    steam.children.forEach((s,i)=>{s.rotation.y=motion*.14+i;s.position.y=reduced()?0:(Math.sin(motion*.65+i)+1)*.035;s.material.opacity=reduced()?0:.16+Math.sin(motion*.6+i)*.04;});
  }

  function tick(t) {
    if(view!=='object') { if(entered||progress){exit(false);progress=0;} legacy.tick(t);lastTime=t;return; }
    if(!ensure()){legacy.tick(t);return;}
    const dt=lastTime?Math.min(.06,Math.max(0,(t-lastTime)/1000)):0;lastTime=t;
    if(Math.abs(w-stage.clientWidth)>.8||Math.abs(h-stage.clientHeight)>.8)resize();
    if(reduced()) {progress=destination;drift={x:0,y:0};}
    else {progress=clamp(progress+(destination?1:-1)*dt/.1/20,0,1);drift.x+=(aim.x-drift.x)*(1-Math.exp(-dt*5));drift.y+=(aim.y-drift.y)*(1-Math.exp(-dt*5));elapsed+=dt;}
    const arrived=entered&&progress>=.999;
    document.body.classList.toggle('rooftop-arrived',arrived);tray.hidden=!arrived;canvas.tabIndex=arrived?0:-1;
    if(!arrived&&drag){try{canvas.releasePointerCapture(drag.id)}catch{}drag=null;}
    const rate=innerWidth<760?1000/30:1000/45;if(t-lastDraw<rate&&!reduced())return;lastDraw=t;
    if(reduced()){const signature=JSON.stringify([coin.x,coin.y,coin.size,coin.yaw,coin.pitch,coin.roll,progress,orbit,selected,w,h]);if(signature===stillFrame)return;stillFrame=signature;}else stillFrame='';
    const e=smooth(progress),source=opening&&progress>0?opening:coin;
    const pixelScale=source.size/h*1.4333333;
    coinGroup.scale.setScalar(pixelScale);
    coinGroup.position.set((source.x-w/2)*2.8666667/h,(h/2-source.y)*2.8666667/h,0);
    coinGroup.rotation.set(source.pitch*(1-e),source.yaw*(1-e),source.roll*(1-e),'ZYX');
    // Peek through the real aperture. As we approach, its projection fills the frame.
    const aperture=new T.Vector3(.235,.25,0).applyMatrix4(coinGroup.matrixWorld);
    coinGroup.updateMatrixWorld(true);aperture.set(.235,.25,0).applyMatrix4(coinGroup.matrixWorld);
    camera.position.set(aperture.x*e,aperture.y*e,4.3*(1-e)+.018*e);camera.lookAt(aperture.x*e,aperture.y*e,-.10);
    const peekYaw=entered?0:clamp(Math.sin(coin.yaw)*.6,-.65,.65),peekPitch=entered?0:coin.pitch*.25;
    const near=new T.Vector3(4.1,2.90,5.8),far=new T.Vector3(5.0+peekYaw,3.6+peekPitch,7.4);
    cameraPosition.lerpVectors(far,near,e);cameraPosition.x+=drift.x*.20+orbit.x;cameraPosition.y+=drift.y*.12+orbit.y;
    cameraLook.set(.25*(1-e),.10+.80*e,.60-.80*e);
    if(selected&&arrived){const p=places[selected].point;cameraLook.x=p[0]*.26;cameraLook.y=.88+p[1]*.07;cameraLook.z=p[2]*.16;}
    worldCamera.position.copy(cameraPosition);worldCamera.lookAt(cameraLook);
    animateScene(elapsed);
    if(progress>=.995){renderer.render(rooftop,worldCamera);}else {
      const full=progress>0;
      if(full!==fullTarget){sizeTarget(full);lastPeek=-Infinity;}
      const turning=Math.abs(coin.tyaw-coin.yaw)>.003||Math.abs(coin.tpitch-coin.pitch)>.003||!!coin.drag;
      if(full||(!turning&&t-lastPeek>=100)||reduced()){
        renderer.setRenderTarget(target);renderer.render(rooftop,worldCamera);renderer.setRenderTarget(null);lastPeek=t;
      }
      renderer.render(studio,camera);
    }
    renders++;
  }

  $('#look-inside').onclick=enter;
  $('#close-world').onclick=()=>exit();
  tray.querySelectorAll('[data-rooftop]').forEach(b=>b.onclick=()=>discover(b.dataset.rooftop));
  canvas.addEventListener('pointermove',e=>{
    if(!entered)return;const r=canvas.getBoundingClientRect();aim.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);aim.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);
    if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;
    orbit.x=clamp(drag.ox-dx*.006,-.85,.85);orbit.y=clamp(drag.oy+dy*.004,-.35,.50);
  });
  canvas.addEventListener('pointerleave',()=>{if(!drag)aim={x:0,y:0};});
  canvas.addEventListener('pointerdown',e=>{if(!entered||progress<.99||drag||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:orbit.x,oy:orbit.y,moved:false};canvas.setPointerCapture(e.pointerId);});
  function finishPointer(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;try{canvas.releasePointerCapture(d.id)}catch{}if(cancel){orbit.x=d.ox;orbit.y=d.oy;return;}if(!d.moved){const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),worldCamera);const hit=raycaster.intersectObjects(rooftop.children,true).find(i=>i.object.userData.detail);if(hit)discover(hit.object.userData.detail);}}
  canvas.addEventListener('pointerup',e=>finishPointer(e));canvas.addEventListener('pointercancel',e=>finishPointer(e,true));canvas.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)finishPointer(e,true);});
  canvas.addEventListener('keydown',e=>{if(!entered)return;const delta=.12;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')orbit.x=clamp(orbit.x-delta,-.85,.85);if(e.key==='ArrowRight')orbit.x=clamp(orbit.x+delta,-.85,.85);if(e.key==='ArrowUp')orbit.y=clamp(orbit.y+delta,-.35,.5);if(e.key==='ArrowDown')orbit.y=clamp(orbit.y-delta,-.35,.5);if(e.key==='Home')orbit={x:0,y:0};}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&entered&&!dialog.open&&!readerDialog.open)exit();});
  window.addEventListener('oop-view',e=>{if(e.detail.view!=='object')exit(false);});
  window.addEventListener('oop-reset',()=>{exit(false);selected=null;seen.clear();});
  window.addEventListener('resize',()=>{if(status==='ready')resize();});
  document.addEventListener('visibilitychange',()=>{lastTime=0;});
  // Capture after the final script has been parsed, so the saved invitation
  // contains the pinned renderer and this journey as well as the original story.
  const capturePortable=()=>{if(IS_PORTABLE)PORTABLE_SOURCE='<!doctype html>'+document.documentElement.outerHTML;};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',capturePortable,{once:true});else capturePortable();
  window.OutOfPanelJourney=Object.freeze({version:'0.5.0',enter,exit,discover,tick,getState:()=>({status,reason,entered,progress,selected,seen:[...seen],renders,orbit:{...orbit},camera:worldCamera?worldCamera.position.toArray():null,threeRevision:T?.REVISION||null,drawCalls:renderer?.info.render.calls||0})});
})();
