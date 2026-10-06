(function(){
'use strict';
var byId=function(id){return document.getElementById(id);};
// Authored replay of a pinned, previously retrieved example. Not a live query.
var sources={
 climate:['PET · 14:00 · Klimaanalyse 2022','40,56 °C','Struktureller Modellwert für thermisches Empfinden — keine Messung der heutigen Lufttemperatur.','ua_klimaanalyse_2022','pb_ua_pet_str_2022.0000000001000265'],
 justice:['Umweltgerechtigkeit · 2023/24','Dreifach','Alexanderplatzviertel: Bioklima hoch, Grünversorgung mittel, mittlerer Status-Index. Das beschreibt einen Planungsraum, nicht einzelne Menschen.','ua_umweltgerechtigkeit2023','z_gesamt_umwelt2023.01100310'],
 green:['Erfasste öffentliche Grünanlage','≈ 249 m','Fernsehturmanlage zwischen Fernsehturm und Spandauer Straße. Näherung zur Geometrie; kein Gehweg und kein Nachweis nutzbaren Schattens.','gruenanlagen','gruenanlagen.00008100_0014b7f7'],
 care:['Erfasster Krankenhausstandort','≈ 1,10 km','St. Hedwig-Krankenhaus. 415 gemeldete Betten sind keine Aussage über freie Kapazität oder aktuell geeignete Versorgung.','krankenhaeuser','plankrankenhaeuser.1']
};
var buttons=Array.from(document.querySelectorAll('[data-source]'));
function activate(button,focus){
 var s=sources[button.dataset.source];if(!s)return;
 buttons.forEach(function(b){b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});
 byId('metric-label').textContent=s[0];byId('metric-value').textContent=s[1];byId('metric-caption').textContent=s[2];byId('feature-id').textContent='Feature: '+s[4];
 byId('source-link').href='https://gdi.berlin.de/services/wfs/'+s[3]+'?SERVICE=WFS&REQUEST=GetCapabilities';
 byId('evidence-panel').setAttribute('aria-labelledby',button.id);if(focus)button.focus();
}
buttons.forEach(function(button,index){
 button.addEventListener('click',function(){activate(button,false);});
 button.addEventListener('keydown',function(event){var target=index;
  if(event.key==='ArrowRight')target=(index+1)%buttons.length;
  else if(event.key==='ArrowLeft')target=(index+buttons.length-1)%buttons.length;
  else if(event.key==='Home')target=0;else if(event.key==='End')target=buttons.length-1;else return;
  event.preventDefault();activate(buttons[target],true);
 });
});
})();
