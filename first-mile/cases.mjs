import {sampleDocs} from './samples.mjs';
export const demoCases = [
  {
    id:'asterion', name:'Asterion Energy', sector:'Energy software', label:'3 conflicting figures',
    category:'CONTRADICTIONS', icon:'↔',
    lesson:'A pitch deck and founder update disagree on ARR, customers and funding. Those differences demand clarification, not an automatic rejection.',
    before:'Compare the original deck against a later founder update. Locate the changed numbers, their source pages and the questions they raise.',
    docs:sampleDocs
  },
  {
    id:'heliogrid', name:'HelioGrid Labs', sector:'Climate technology', label:'Consistent first pass',
    category:'CLEAN CASE', icon:'✓',
    lesson:'All eight tracked topics are present and the headline figures are consistent. This still does not make the founder claims independently verified.',
    before:'Read a complete pitch deck and prepare useful questions even though no obvious tracked figures conflict.',
    docs:[{name:'HelioGrid Labs · clean deck (fictional fixture)',pages:[
      {number:1,text:'Problem: Industrial parks lose money through unpredictable solar output.\nTechnology: Battery-aware control software integrates with existing industrial equipment.\nFounders: two energy engineers and a former industrial software product lead.'},
      {number:2,text:'Paying customers: 24\nARR: €420k reported September 2026.\nFunding ask: raising €1.7m for implementation and certification.\nMarket size: €950m target serviceable market, company estimate.\nIP strategy: software know-how and a licensed optimisation library.'}
    ]}]
  },
  {
    id:'bioweave', name:'BioWeave Research', sector:'Bio-engineering', label:'4 topics not found',
    category:'MISSING EVIDENCE', icon:'?',
    lesson:'Technology, team, problem and market appear; funding, revenue, customers and IP are not found by the current extraction rules.',
    before:'Review a promising technical story without treating information gaps as proof that the company lacks traction or intellectual property.',
    docs:[{name:'BioWeave Research · incomplete deck (fictional fixture)',pages:[
      {number:1,text:'Problem: Laboratory-scale bio-based materials are difficult to scale for industrial packaging.\nTechnology: Engineered fermentation with low-temperature downstream processing.\nFounders: a materials scientist, a fermentation engineer and a product designer.'},
      {number:2,text:'Market size: Global biopolymer packaging market is expanding, independent validation still required.\nPilot samples shipped to three research partners. No audited financial statements included.'}
    ]}]
  },
  {
    id:'orchid', name:'Orchid Robotics', sector:'Industrial robotics', label:'Forecast ≠ actual',
    category:'FORECAST TRAP', icon:'!',
    lesson:'The ARR amount is explicitly a 2028 forecast. It must not be described as current recurring revenue.',
    before:'Read a robotics deck with a large projected revenue number and ask for current actuals rather than repeating a forecast as traction.',
    docs:[{name:'Orchid Robotics · forecast deck (fictional fixture)',pages:[
      {number:1,text:'Problem: SME warehouses struggle to adopt flexible industrial robots.\nTechnology: Vision-guided mobile robotics designed for changing layouts.\nFounders: a robotics engineer and an industrial operations lead.'},
      {number:2,text:'ARR: €1.5m forecast for 2028; not current revenue.\nFunding ask: raising €3m to commercialise pilots.\nMarket size: €2bn addressable segment, internal company assumption.\nCustomer trials completed, but paying customer count not included.'}
    ]}]
  }
];
export const getDemoCase=id=>demoCases.find(c=>c.id===id)||demoCases[0];
