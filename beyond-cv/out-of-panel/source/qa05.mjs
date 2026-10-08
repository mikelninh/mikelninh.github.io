/* Browser release gate. Runs locally with Playwright, or in the scoped CI job. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'qa05-artifacts');
await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const html=await fs.readFile(path.join(here,'../index.html'));
const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html)});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const tests=[],errors=[];
const check=(name,ok,detail='')=>{tests.push({name,pass:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail?' — '+detail:''));};
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,1600));});
try {
 await page.goto(base,{waitUntil:'load'});
 await page.waitForFunction(()=>window.OutOfPanelJourney?.getState().status!=='idle');
 await page.waitForTimeout(700);
 let state=await page.evaluate(()=>OutOfPanelJourney.getState());
 check('Three.js initializes and renders the actual WebGL2 journey',state.status==='ready'&&state.threeRevision==='180'&&state.renders>0,JSON.stringify(state));
 check('Default route starts on the coin',await page.evaluate(()=>OutOfPanel.getState().view)==='object');
 check('No network dependency in the portable release',!html.toString().includes('<script src=')&&!html.toString().includes('rel="stylesheet"'));
 const coinPNG=await page.locator('#stage').screenshot();await fs.writeFile(path.join(out,'coin-desktop.png'),coinPNG);
 check('Coin render produces a detailed image',coinPNG.length>10000,coinPNG.length+' bytes');
 await page.waitForFunction(()=>Math.abs(coin.yaw-coin.tyaw)<.002);
 const initial=await page.evaluate(()=>{window.spinFrames=[];window.recordSpin=true;function record(){if(!window.recordSpin)return;window.spinFrames.push(coin.yaw);requestAnimationFrame(record)}requestAnimationFrame(record);return coin.yaw});
 const spinStart=Date.now();await page.locator('#spin-object').click();await page.waitForFunction(()=>Math.abs(coin.yaw-coin.tyaw)<.002,{}, {timeout:12000});
 const spin=await page.evaluate(()=>{window.recordSpin=false;return {frames:window.spinFrames,end:coin.yaw,target:coin.tyaw}});
 check('Spin has a real intermediate frame',spin.frames.some(v=>v>initial+.1&&v<spin.target-.1),JSON.stringify({initial,frames:spin.frames}));
 check('Spin completes the full rotation',Math.abs(spin.end-initial-Math.PI*2)<.04,JSON.stringify({initial,end:spin.end,target:spin.target,elapsedMs:Date.now()-spinStart}));
 await page.locator('#coin').focus();const yaw=await page.evaluate(()=>coin.tyaw);await page.keyboard.press('ArrowRight');
 check('Coin retains keyboard rotation',await page.evaluate(()=>coin.tyaw)>yaw+.2);
 const bounds=await page.locator('#coin').boundingBox();await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width/2+70,bounds.y+bounds.height/2+18,{steps:8});await page.mouse.up();
 check('Coin drag releases cleanly',await page.evaluate(()=>coin.drag===null));
 await page.locator('#look-inside').click();await page.waitForFunction(()=>OutOfPanelJourney.getState().progress>0);
 state=await page.evaluate(()=>OutOfPanelJourney.getState());check('The portal has an intermediate transition',state.progress>0&&state.progress<1,JSON.stringify(state));
 await page.waitForFunction(()=>OutOfPanelJourney.getState().progress>=.999,{},{timeout:20000});
 check('Arrival reveals the interactive rooftop',await page.locator('#rooftop-details').isVisible());
 check('Rooftop has an accessible description',(await page.locator('#journey-canvas').getAttribute('aria-label')).includes('black cat'));
 await page.screenshot({path:path.join(out,'rooftop-desktop.png'),fullPage:true});
 for(const [id,expected] of [['mia','Mia looks up'],['tea','Still warm'],['note','A little promise']]){
  await page.locator('[data-rooftop='+id+']').click();check('Discover '+id,(await page.locator('#rooftop-caption').innerText()).includes(expected));
 }
 check('All three discoveries are remembered for the visit',(await page.evaluate(()=>OutOfPanelJourney.getState().seen)).length===3);
 await page.locator('#journey-canvas').focus();await page.keyboard.press('ArrowLeft');check('Rooftop supports keyboard exploration',(await page.evaluate(()=>OutOfPanelJourney.getState().orbit.x))<0);
 await page.keyboard.press('Home');check('Keyboard Home restores the view',(await page.evaluate(()=>OutOfPanelJourney.getState().orbit.x))===0);
 await page.keyboard.press('Escape');await page.waitForTimeout(250);check('Escape returns focus to Look inside',await page.locator('#look-inside').evaluate(el=>document.activeElement===el));
 await page.locator('#return-page').click();await page.locator('#give-back').click();await page.waitForTimeout(1300);
 check('Page 04 exchange still returns the coin',await page.evaluate(()=>OutOfPanelWonder.getState().returned));
 const downloadEvent=page.waitForEvent('download');await page.locator('#keep-star').click();const star=await downloadEvent;await star.saveAs(path.join(out,'paper-star.svg'));check('The paper star remains a real downloadable SVG',(await fs.readFile(path.join(out,'paper-star.svg'),'utf8')).includes('Not everything. Something.'));
 await page.locator('#return-replay').click();check('Return exchange remains replayable',!(await page.evaluate(()=>OutOfPanelWonder.getState().returned)));
 await page.locator('.main-nav [data-view=read]').click();
 await page.locator('#page-dots [data-page=\"0\"]').click();
 for(let i=0;i<8;i++){if(i)await page.locator('#next-page').click();await page.waitForFunction(n=>document.querySelector('#page-count').textContent.startsWith(String(n+1).padStart(2,'0')),i);check('Comic page '+(i+1)+' is readable',await page.locator('#comic-page svg').isVisible());}
 await page.locator('#focus-read').click();check('Focused reader opens',await page.locator('#reader-dialog').evaluate(el=>el.open));await page.locator('#reader-zoom').click();check('Reader zoom still works',(await page.locator('#reader-zoom').getAttribute('aria-pressed'))==='true');await page.locator('#close-reader').click();
 await page.evaluate(()=>{OutOfPanel.switchView('play');OutOfPanel.newLocalGame();});
 await page.waitForTimeout(250);await page.locator('#board').focus();await page.waitForFunction(()=>document.activeElement===document.querySelector('#board'));await page.keyboard.press('Home');await page.keyboard.press('Enter');await page.waitForFunction(()=>OutOfPanel.getState().moves.length===1);await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');
 const played=await page.evaluate(()=>({state:OutOfPanel.getState(),focus:document.activeElement.id,cursor}));check('Real keyboard input places game pieces',played.state.moves.length===2,JSON.stringify(played));
 const gameRules=await page.evaluate(()=>[[1,0],[0,1],[1,1],[1,-1]].map(([dx,dy])=>{const b=new Map();for(let n=0;n<4;n++)b.set(n*dx+','+n*dy,1);return !!OutOfPanel.winAt(b,0,0,1)}));check('All four game win directions remain valid',gameRules.every(Boolean));
 await page.locator('#feedback-open').click();await page.locator('#feedback-note').fill('A review test — do not send.');
 check('Feedback still requires a user-reviewed email draft',(await page.locator('#feedback-state').innerText()).includes('Nothing is sent'));check('Device details stay opt-in',!(await page.locator('#feedback-device').isChecked()));await page.locator('#dialog-close').click();
 for(const width of [320,360,390,768,1440]){
  await page.setViewportSize({width,height:width<760?844:1000});await page.evaluate(()=>OutOfPanel.switchView('object'));await page.waitForTimeout(700);
  check('No horizontal overflow at '+width+'px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check('Coin actions remain available at '+width+'px',await page.locator('#look-inside').isVisible()&&await page.locator('#spin-object').isVisible());
  if(width===390){await page.screenshot({path:path.join(out,'coin-mobile.png'),fullPage:true});await page.locator('#look-inside').click();await page.waitForFunction(()=>OutOfPanelJourney.getState().progress>=.999,{},{timeout:20000});await page.screenshot({path:path.join(out,'rooftop-mobile.png'),fullPage:true});check('Phone viewport exposes all three rooftop discoveries',await page.locator('[data-rooftop=mia]').isVisible()&&await page.locator('[data-rooftop=tea]').isVisible()&&await page.locator('[data-rooftop=note]').isVisible());await page.locator('#close-world').click();}
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>OutOfPanel.switchView('object'));await page.waitForTimeout(250);await page.locator('#look-inside').click();await page.waitForTimeout(150);
 check('Reduced motion enters without a camera flight',(await page.evaluate(()=>OutOfPanelJourney.getState().progress))===1);
 await page.waitForFunction(()=>document.body.classList.contains('rooftop-arrived'));await page.waitForTimeout(250);
 const stillA=await page.locator('#journey-canvas').screenshot();const stillStateA=await page.evaluate(()=>OutOfPanelJourney.getState());await page.waitForTimeout(350);const stillB=await page.locator('#journey-canvas').screenshot();const stillStateB=await page.evaluate(()=>OutOfPanelJourney.getState());check('Reduced-motion scene remains visually still',hash(stillA)===hash(stillB),JSON.stringify({hashA:hash(stillA),hashB:hash(stillB),before:stillStateA,after:stillStateB}));check('Unchanged reduced-motion frames do not redraw',stillStateA.renders===stillStateB.renders);if(hash(stillA)!==hash(stillB)){await fs.writeFile(path.join(out,'still-A.png'),stillA);await fs.writeFile(path.join(out,'still-B.png'),stillB);}
 await page.locator('[data-rooftop=tea]').click();check('Reduced-motion discoveries remain accessible',(await page.locator('#rooftop-caption').innerText()).includes('Still warm'));
 await page.locator('#close-world').click();const before=await page.evaluate(()=>coin.tyaw);await page.locator('#spin-object').click();await page.waitForTimeout(120);check('Reduced motion gives a discrete half-turn',Math.abs(await page.evaluate(()=>coin.yaw)-before-Math.PI)<.02);
 await page.reload({waitUntil:'load'});check('Story discoveries persist across reload',await page.evaluate(()=>session.discovered===true));check('Game survives reload',(await page.evaluate(()=>OutOfPanel.getState().moves.length))===2);
 await page.locator('#share').click();const invitationEvent=page.waitForEvent('download');await page.locator('#save-gift').click();const invitationDownload=await invitationEvent;const invitationPath=path.join(out,'HERE-CATCH-OUT-OF-PANEL.html');await invitationDownload.saveAs(invitationPath);const invitationText=await fs.readFile(invitationPath,'utf8');check('Offline invitation embeds its renderer and recipient greeting',invitationText.includes('window.FirstLightThree=')&&invitationText.includes('gift-arrival')&&!invitationText.includes('<script src='));await page.locator('#dialog-close').click();
 const offlinePage=await context.newPage();offlinePage.on('pageerror',e=>errors.push('Offline: '+e.message));await offlinePage.goto(pathToFileURL(invitationPath).href);await offlinePage.waitForFunction(()=>window.OutOfPanelJourney&&OutOfPanelJourney.getState().status!=='idle');check('Saved invitation opens the real Three.js scene offline',(await offlinePage.evaluate(()=>OutOfPanelJourney.getState().status))==='ready');check('Saved invitation carries its greeting',(await offlinePage.locator('#wonder-title').innerText()).includes('They sent'));await offlinePage.locator('#look-inside').click();await offlinePage.waitForFunction(()=>OutOfPanelJourney.getState().progress===1);check('Offline invitation supports rooftop discoveries',await offlinePage.locator('[data-rooftop=mia]').isVisible());await offlinePage.close();
 const giftPage=await context.newPage();await giftPage.goto(base+'/?gift=window#object');await giftPage.waitForTimeout(700);check('Shared invitation preserves its recipient greeting',(await giftPage.locator('#wonder-title').innerText()).includes('They sent'));await giftPage.close();
 const fallbackContext=await browser.newContext({viewport:{width:390,height:844}});await fallbackContext.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args)};});
 const fallbackPage=await fallbackContext.newPage();await fallbackPage.goto(base);await fallbackPage.waitForFunction(()=>OutOfPanelJourney.getState().status!=='idle');check('Missing WebGL2 retains the working original renderer',(await fallbackPage.evaluate(()=>OutOfPanelJourney.getState().status))==='fallback');await fallbackPage.locator('#look-inside').click();check('Fallback still opens the hidden world',await fallbackPage.evaluate(()=>OutOfPanelWonder.getState().inside));await fallbackPage.screenshot({path:path.join(out,'fallback-mobile.png'),fullPage:true});await fallbackContext.close();
 check('No browser or shader errors across the tested flows',errors.length===0,JSON.stringify(errors));
} catch(error){errors.push(error.message);check('Browser release gate completed',false,error.message);await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});}
const report={release:'0.5.0',environment:'Chromium with SwiftShader WebGL2; real browser interactions, viewport emulation, and explicit WebGL2-unavailable fallback. No Safari or physical-phone validation. No feedback email sent.',passed:tests.filter(t=>t.pass).length,failed:tests.filter(t=>!t.pass).length,tests,errors};
await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors}));
await browser.close();await new Promise(resolve=>server.close(resolve));if(report.failed)process.exitCode=1;
