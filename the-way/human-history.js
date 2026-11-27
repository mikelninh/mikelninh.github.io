/* THE WAY / historical geography and wellbeing. Explicit modern reference crosswalk. */
(()=>{'use strict';const $=id=>document.getElementById(id);
const codes={"Afghanistan":"004","Albania":"008","Algeria":"012","Angola":"024","Argentina":"032","Australia":"036","Azerbaijan":"031","Bangladesh":"050","Benin":"204","Bolivia":"068","Bosnia-Herzegovina":"070","Brunei":"096","Burkina Faso":"854","Burundi":"108","Cambodia (Kampuchea)":"116","Cameroon":"120","Central African Republic":"140","Chad":"148","Chile":"152","China":"156","Colombia":"170","Comoros":"174","Congo":"178","Costa Rica":"188","Croatia":"191","Cuba":"192","Cyprus":"196","DR Congo (Zaire)":"180","Djibouti":"262","Dominican Republic":"214","Ecuador":"218","Egypt":"818","El Salvador":"222","Eritrea":"232","Ethiopia":"231","France":"250","Gabon":"266","Gambia":"270","Georgia":"268","Ghana":"288","Greece":"300","Grenada":"308","Guatemala":"320","Guinea":"324","Guinea-Bissau":"624","Haiti":"332","Honduras":"340","Hungary":"348","Hyderabad":"356","India":"356","Indonesia":"360","Iran":"364","Iraq":"368","Israel":"376","Ivory Coast":"384","Jordan":"400","Kenya":"404","Kuwait":"414","Kyrgyzstan":"417","Laos":"418","Lebanon":"422","Lesotho":"426","Liberia":"430","Libya":"434","Madagascar (Malagasy)":"450","Malaysia":"458","Mali":"466","Mauritania":"478","Mexico":"484","Moldova":"498","Morocco":"504","Mozambique":"508","Myanmar (Burma)":"104","Nepal":"524","Netherlands":"528","Nicaragua":"558","Niger":"562","Nigeria":"566","North Korea":"408","North Macedonia":"807","Oman":"512","Pakistan":"586","Panama":"591","Papua New Guinea":"598","Paraguay":"600","Peru":"604","Philippines":"608","Romania":"642","Russia (Soviet Union)":"643","Rwanda":"646","Saudi Arabia":"682","Senegal":"686","Serbia (Yugoslavia)":"688","Sierra Leone":"694","Somalia":"706","South Africa":"710","South Korea":"410","South Sudan":"728","South Vietnam":"704","South Yemen":"887","Spain":"724","Sri Lanka":"144","Sudan":"729","Suriname":"740","Syria":"760","Taiwan":"158","Tajikistan":"762","Tanzania":"834","Thailand":"764","Togo":"768","Trinidad and Tobago":"780","Tunisia":"788","Turkey":"792","Uganda":"800","Ukraine":"804","United Kingdom":"826","United States of America":"840","Uruguay":"858","Uzbekistan":"860","Venezuela":"862","Vietnam (North Vietnam)":"704","Yemen (North Yemen)":"887","Zimbabwe (Rhodesia)":"716"};
const historicProxies=new Set(["Hyderabad","Russia (Soviet Union)","Serbia (Yugoslavia)","South Vietnam","Vietnam (North Vietnam)","South Yemen","Yemen (North Yemen)","Sudan","Ethiopia","Indonesia","Pakistan"]);
const elem=(tag,text)=>{const a=document.createElement(tag);if(text!=null)a.textContent=text;return a};
const data=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Source unavailable');return r.json()};
async function historicalMap(){
 try{
  const [packed,geo,totals]=await Promise.all([fetch('./history-dimensions.b64').then(r=>{if(!r.ok)throw Error('Source unavailable');return r.text()}),data('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json'),data('./time-data.json')]);
  const buf=await new Response(new Blob([Uint8Array.from(atob(packed.trim()),c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const hist=JSON.parse(new TextDecoder().decode(buf));
  if(hist.sha256!==totals.sha256||hist.years.length!==80||hist.years.some((d,i)=>d.year!==1946+i||d.locations.reduce((a,b)=>a+b[1],0)!==totals.values[i]))throw Error('Source mismatch');
  const features=topojson.feature(geo,geo.objects.countries).features, id=f=>String(f.id||'').padStart(3,'0'), name=f=>f.properties.name||id(f);
  const known=new Map(features.filter(f=>f.id).map(f=>[id(f),name(f)]));
  const projection=d3.geoNaturalEarth1().fitExtent([[8,8],[912,462]],{type:'Sphere'}), path=d3.geoPath(projection);
  const svg=d3.select('#historical-map');svg.selectAll('*').remove();svg.append('path').datum({type:'Sphere'}).attr('d',path).attr('fill','#e9eff2').attr('stroke','#cbd1d3');
  svg.append('path').datum(d3.geoGraticule10()).attr('d',path).attr('stroke','#cbd6db').attr('stroke-width',.4).attr('fill','none');
  const shapes=svg.append('g').selectAll('path').data(features).join('path').attr('d',path).attr('stroke','#fffefa').attr('stroke-width',.6);
  shapes.append('title');
  const sel=$('map-year');for(const d of hist.years){const o=elem('option',d.year);o.value=d.year;sel.append(o)}sel.disabled=false;
  function render(year){
    const row=hist.years[year-1946];if(!row)return;sel.value=year;
    const assoc=new Map(),notes=[],unmapped=[];
    let mappedLabels=0,total=0;
    for(const [label,count] of row.locations){
      const parts=label.split(', '), ids=[...new Set(parts.map(n=>codes[n]).filter(c=>known.has(c)))];
      if(ids.length) mappedLabels++;
      const lost=parts.filter(n=>!known.has(codes[n]));if(lost.length)unmapped.push(...lost);
      for(const c of ids){const v=assoc.get(c)||{count:0,labels:[]};v.count+=count;v.labels.push([label,count]);assoc.set(c,v);total+=count;}
      const proxy=parts.some(n=>historicProxies.has(n))?' · modern reference proxy (not historical territory)':'';
      notes.push(label+' · '+count+' → '+(ids.map(c=>known.get(c)).join(', ')||'No geometry matched')+proxy+(lost.length?' · unmapped: '+lost.join(', '):''));
    }
    const show=f=>{const v=assoc.get(id(f));if(!v)return;$('map-detail').replaceChildren(elem('strong',name(f)+' · '+v.count+' conflict-country associations'),elem('p',v.labels.map(([l,n])=>l+' ('+n+')').join(' · ')))};
    shapes.attr('fill',f=>{const n=assoc.get(id(f))?.count||0;return n===0?'#e2ded5':n===1?'#e5ad93':n<=3?'#c96d4e':'#93412f'}).attr('tabindex',f=>assoc.has(id(f))?0:null).attr('role',f=>assoc.has(id(f))?'button':null).attr('aria-label',f=>name(f)+': '+(assoc.get(id(f))?.count||0)+' mapped associations').on('click',(e,f)=>show(f)).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(f)}});
    shapes.select('title').text(f=>name(f)+': '+(assoc.get(id(f))?.count||0)+' associations');
    $('map-associations').textContent=String(total);$('map-coverage').textContent=year+' · '+mappedLabels+'/'+row.locations.length+' original labels mapped at least in part · '+new Set(unmapped).size+' unmatched component names.';
    $('map-detail').textContent='Select a highlighted country to inspect its original location labels.';
    $('map-labels').replaceChildren(...notes.map(s=>elem('div',s)));
    $('historical-map').dataset.ready='true';$('historical-map').dataset.year=year;$('historical-map').dataset.mappedLabels=mappedLabels;
  }
  sel.onchange=()=>{const year=Number(sel.value);const range=$('year-range');range.value=year;range.dispatchEvent(new Event('input',{bubbles:true}));render(year)};
  new MutationObserver(()=>render(Number($('year').textContent))).observe($('year'),{childList:true,subtree:true,characterData:true});
  render(Number($('year').textContent)||2025);
 }catch(e){$('map-coverage').textContent='Historical reference map unavailable. The original source labels above remain available.';$('historical-map').dataset.ready='false'}
}
async function wellbeing(){
 try{
  const p=await data('./wellbeing.json');
  if(p.geography!=='WLD'||p.indicators.length!==3||p.indicators.some(x=>x.values.length<20||x.values.some(([y,v])=>!Number.isInteger(y)||!Number.isFinite(v))))throw Error('Data validation failed');
  const controls=$('wdi-controls'),range=$('wdi-range');let index=0,point=0;
  function draw(){
   const item=p.indicators[index],values=item.values;const [yr,v]=values[point];const first=values[0],last=values[values.length-1];
   $('wdi-name').textContent=item.name;$('wdi-unit').textContent=item.unit;$('wdi-value').textContent=v.toFixed(1);$('wdi-year').textContent=yr;$('wdi-source').href=item.source;
   $('wdi-detail').textContent=first[0]+' → '+last[0]+': '+first[1].toFixed(1)+' → '+last[1].toFixed(1)+' '+item.unit+'. '+values.length+' original annual observations. Provider: '+item.provider+'.';
   const svg=d3.select('#wellbeing-chart');svg.selectAll('*').remove();const x=d3.scaleLinear().domain([first[0],last[0]]).range([52,734]), y=d3.scaleLinear().domain([0,Math.max(...values.map(r=>r[1]))*1.08]).nice().range([238,22]);
   const ticks=y.ticks(4);svg.append('g').selectAll('line').data(ticks).join('line').attr('x1',52).attr('x2',734).attr('y1',y).attr('y2',y).attr('stroke','#dfdfd7');svg.append('g').selectAll('text').data(ticks).join('text').attr('x',44).attr('y',d=>y(d)+4).attr('text-anchor','end').attr('font-size',11).attr('fill','#646973').text(d=>d);
   // No line across missing years: each continuous observed segment is separate.
   const segments=[];for(const val of values){if(!segments.length||val[0]!==segments.at(-1).at(-1)[0]+1)segments.push([]);segments.at(-1).push(val)}
   const line=d3.line().x(d=>x(d[0])).y(d=>y(d[1]));svg.selectAll('.series').data(segments).join('path').attr('class','series').attr('d',line).attr('fill','none').attr('stroke','#294967').attr('stroke-width',3);
   svg.append('line').attr('x1',x(yr)).attr('x2',x(yr)).attr('y1',y(0)).attr('y2',y(v)).attr('stroke','#ae482f').attr('stroke-dasharray','4 3');
   svg.append('circle').attr('cx',x(yr)).attr('cy',y(v)).attr('r',6).attr('fill','#ae482f').attr('stroke','#fffefa').attr('stroke-width',2);
   svg.append('g').selectAll('text').data([...new Set([first[0],...x.ticks(5).filter(y=>y>first[0]&&y<last[0]),last[0]])]).join('text').attr('x',x).attr('y',261).attr('text-anchor','middle').attr('fill','#646973').attr('font-size',11).text(d=>d);
   $('wellbeing-chart').setAttribute('aria-label',item.name+', '+yr+': '+v.toFixed(1)+' '+item.unit);$('wellbeing-chart').dataset.ready='true';
  }
  function select(i){index=i;point=p.indicators[index].values.length-1;range.max=point;range.value=point;range.disabled=false;[...controls.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));draw()}
  p.indicators.forEach((item,i)=>{const b=elem('button',item.name);b.type='button';b.onclick=()=>select(i);controls.append(b)});
  range.oninput=()=>{point=Number(range.value);draw()};$('wdi-status').textContent='Three global indicators · World Bank World Development Indicators · retrieved '+p.retrievedAt.slice(0,10)+'.';select(0);
 }catch(e){$('wdi-status').textContent='Wellbeing data could not be loaded. No estimates substituted.'}
}
historicalMap();wellbeing();
})();