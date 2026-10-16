/* Interbeing 2.0 — qualitative atlas; no inferred personal data or causal weights. */
'use strict';
window.ROOT_ATLAS=(()=>{
const sources={};
[
['who-sdh','Social determinants of health','WHO · 2025','https://www.who.int/news-room/fact-sheets/detail/social-determinants-of-health','Scientific overview','Population-level conditions and health inequity; not an individual diagnosis.'],
['who-uhc','Universal health coverage','WHO','https://www.who.int/news-room/fact-sheets/detail/universal-health-coverage-(uhc)','Scientific overview','Access to care and financial hardship. No local effect size inferred.'],
['ipcc','Food security · Special Report on Climate Change and Land, chapter 5','IPCC · 2019','https://www.ipcc.ch/srccl/chapter/chapter-5/','Scientific assessment','Sections 5.5 and 5.7: dietary change, resource pressures and just transitions.'],
['ipbes','Transformative Change Assessment','IPBES · 2024','https://www.ipbes.net/transformative-change/media-release','Assessment summary','Underlying causes of biodiversity loss, not a universal theory of suffering.'],
['ny','New York Declaration on Animal Consciousness','Researcher declaration · 2024','https://sites.google.com/nyu.edu/nydeclaration/declaration','Scientific declaration','Acknowledges uncertainty across taxa. Not proof that every species is sentient.'],
['efsa','Welfare of pigs on farm','EFSA · 2022','https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2022.7421','Scientific assessment','Species-specific hazards and responses. Findings should not be universalised.'],
['iucn','Guidelines on human–wildlife conflict and coexistence','IUCN SSC · 2023','https://iucn.org/resources/publication/iucn-ssc-guidelines-human-wildlife-conflict-and-coexistence-first-edition','Practice framework','Local analysis, participation and decision-making; no universal protective measure.'],
['nps','Lamar Valley: predators and prey','US National Park Service','https://www.nps.gov/places/000/lamar-valley-predators-and-prey.htm','Local observations','Yellowstone observations; not a global welfare or population model.'],
['cash-study','Unconditional cash transfers in Kenya','J-PAL · Haushofer & Shapiro evaluation','https://www.povertyactionlab.org/evaluation/improving-economic-and-psychological-well-being-through-unconditional-cash-transfer','Randomised evaluation','Short-run economic and psychological gains; no effect found on health or education measures. Not a guarantee elsewhere.'],
['gfi','Alternative-protein science, policy and industry work','Good Food Institute','https://gfi.org/about/','Organisation self-description','Describes activities, not independent verification of impact.'],
['wai','Wild-animal welfare research','Wild Animal Initiative','https://www.wildanimalinitiative.org/mission','Organisation self-description','Research mission, not proof of a welfare-improving intervention.'],
['gd','Cash transfer programmes','GiveDirectly','https://www.givedirectly.org/','Organisation self-description','Programme description; evaluation evidence is linked separately.'],
['ocp','Open contracting implementation','Open Contracting Partnership','https://www.open-contracting.org/what-is-open-contracting/','Organisation self-description','Procurement reform support; no blanket claim of reduced corruption.'],
['fb','Community-based talk therapy','Friendship Bench','https://www.friendshipbenchzimbabwe.org/','Organisation self-description','Service model; specific clinical effectiveness is not reviewed here.'],
['sfcg','Peacebuilding and dialogue','Search for Common Ground','https://www.sfcg.org/what-we-do/','Organisation self-description','Activity description, not a guarantee of conflict resolution.'],
['msf','Medical humanitarian work','Médecins Sans Frontières','https://www.msf.org/who-we-are','Organisation self-description','Charter and activity description; specific local programmes require separate verification.']
].forEach(([id,title,publisher,url,type,limit])=>sources[id]={id,title,publisher,url,type,limit,checked:'2026-10-16',review:'Editorial source check; no independent expert review'});
const nodes={},edges=[];
function n(id,label,type,text,refs=[],extra={}){nodes[id]={id,label,type,text,sources:refs,status:'Preliminary',lives:['human','animal','future'],...extra};}
function e(fromId,to,label,kind='Organising link',refs=[],text=''){edges.push({id:fromId+'--'+to,fromId,to,label,kind,sources:refs,claim:text||label,scope:'Conceptual, context-dependent',checked:refs.length?'2026-10-16':null,independentReview:false,weight:null});}
[
['vulnerability','Biological vulnerability','Bodies can be injured, become ill, age and die. Not all suffering comes from social failures.','body'],
['access','Unequal access','Distinguish material shortage from barriers of affordability, distribution and service capacity.','key'],
['incentives','Harmful incentives','Investigate where a decision rewards its maker while moving costs onto other lives.','gear'],
['power','Unaccountable power','Ask who sets the rules, who can challenge them, and whose needs are excluded.','scales'],
['knowledge','Knowledge gaps','What is unknown, misunderstood, concealed or inadequately tested?','eye'],
['cooperation','Failures of cooperation','Where do responsibility, coordination, capacity or implementation break down?','nodes'],
['threat','Fear & disconnection','A working family for threat, trauma and damaged relationships; not an explanation for every illness.','heart'],
['concern','Narrow concern','Whose experience and which future consequences are left out of a decision?','sun']
].forEach(([id,label,text,icon])=>n(id,label,'root',text,[],{icon,status:'Working taxonomy'}));
[
['poverty','Poverty & insecurity','Unmet material needs, insecure livelihoods and barriers to essential goods and services.',['who-sdh'],'hand',['human']],
['illness','Illness & lack of care','Disease, pain and disability, alongside preventable suffering from inaccessible care.',['who-uhc'],'cross',['human','animal']],
['distress','Distress & loneliness','Mental suffering and unmet needs for safety, connection and appropriate support.',['who-sdh'],'heart',['human']],
['violence','Violence & displacement','Injury, fear, forced movement and disrupted lives. This broad branch needs more local evidence.',['who-sdh'],'burst',['human','animal']],
['exclusion','Injustice & exclusion','Needs and opportunities can be denied through structural discrimination and unequal voice.',['who-sdh'],'scales',['human']],
['farmed','Farmed-animal suffering','Animal welfare concerns in production. The worked example examines pigs, not every species or farm.',['ny','efsa'],'paw',['animal']],
['wild','Wild-animal suffering','Individual welfare in the wild: predation, illness and exposure deserve attention alongside species conservation.',['nps','wai'],'fox',['animal']],
['ecology','Ecological harm','Damage to life-support systems. Ecosystems are included without assuming they are sentient.',['ipbes'],'leaf',['human','animal','future']],
['information','Failures of understanding','Misleading information, inadequate learning and unresolved uncertainty. This branch is an organising placeholder, not a causal finding.',[],'book',['human','future']],
['future-risk','Risks to future lives','A horizon for severe, lasting harm. Specific catastrophic risks and probabilities are not assessed in this release.',[],'sun',['human','animal','future']]
].forEach(([id,label,text,refs,icon,lives])=>n(id,label,'problem',text,refs,{icon,lives,status:['poverty','illness','farmed','wild'].includes(id)?'Worked example':'Broad coverage'}));
[
['cash','Direct cash support','Immediate relief','Provide resources recipients can allocate to their own needs.',['cash-study'],['human'],'Households facing poverty.','Funding and programme targeting matter; cash cannot by itself create missing public services.','Kenyan evaluation found short-run economic and psychological gains, not improved health measures.'],
['protection-social','Social protection','Prevention & systems','Consider income security and public support alongside essential services.',['who-sdh'],['human'],'People facing insecure income or shocks.','Financing, eligibility, accessibility and implementation can exclude people.','Local programme effects need separate evaluation.'],
['care-access','Accessible healthcare','Relief & prevention','Reduce barriers to essential, appropriate care and financial protection.',['who-uhc'],['human'],'People unable to obtain or afford care.','Requires staff, quality, sustainable financing and appropriate service design.','A system-level goal, not a treatment recommendation.'],
['water-safe','Safer living conditions','Prevention','Investigate local housing, water and working conditions that influence health.',['who-sdh'],['human'],'People exposed to unsafe living and working conditions.','Infrastructure and maintenance take resources; distribution matters.','The atlas does not prescribe a specific water treatment or building intervention.'],
['mental-care','Community mental care','Relief & support','Explore accessible, supported routes to appropriate mental-health care.',['fb'],['human'],'People experiencing distress.','Training, safeguarding, referral and supervision are essential questions.','A programme example is not personal medical advice.'],
['dialogue','Shared decisions','Process & systems','Bring local knowledge and affected interests into coexistence planning.',['iucn'],['human','animal'],'Affected communities, with animal interests explicitly represented.','Participation costs time; unequal influence may persist.','Consultation alone does not guarantee effective or fair outcomes.'],
['accountability','Open & accountable rules','Systems change','Explore transparent procurement, participation and public accountability.',['ocp'],['human','future'],'People depending on public resources and services.','Information needs people able to act on it; transparency is not enforcement.','Effects depend on actual reforms and their setting.'],
['plant','Plant-rich provision','Prevention & systems','Consider nutritionally adequate alternatives that replace some animal-sourced provision.',['ipcc'],['human','animal','future'],'Potential benefits for resource use and the animals whose production is displaced.','Affordability, nutritional adequacy, acceptance and what is actually replaced matter.','No personal footprint or number of animals spared is calculated.'],
['transition','Worker transition support','Design proposal','Pair food-system changes with support designed with affected workers.',['ipcc'],['human','animal'],'Workers and communities carrying transition costs.','Funding, choice, local opportunities and fair access must be tested.','No evaluated local programme is asserted.'],
['welfare','Species-specific welfare','Relief & prevention','Assess husbandry changes addressing documented hazards for pigs.',['efsa'],['animal'],'Pigs exposed to avoidable welfare hazards.','Costs, enforcement and hazards displaced elsewhere need consideration.','Welfare improvement does not resolve every ethical objection to animal use.'],
['coexist','Local protective measures','Design proposal','Assess context-appropriate protective measures with local experts.',['iucn'],['human','animal'],'Livestock, keepers and wildlife whose conflicts might be reduced.','Labour, costs, maintenance and displacement of risk matter.','Do not manage or approach wildlife based on this map.'],
['research','Wild-welfare research','Research','Investigate animal wellbeing and uncertain consequences before claiming a solution.',['wai'],['animal','future'],'Overlooked individual animals, including prey.','Research uses resources and may itself need welfare safeguards.','Not a validated intervention or a substitute for urgent care.'],
['restoration','Living systems & climate','Systems proposal','Investigate coordinated responses to ecological pressures and their wider consequences.',['ipbes'],['human','animal','future'],'Lives dependent on functioning ecological systems.','Ecological gains do not automatically improve every individual animal’s welfare.','Location-specific outcomes are not modelled.'],
['learning','Better knowledge & foresight','Research & learning','Seek evidence, test assumptions and include longer-term consequences.',[],['human','animal','future'],'Those affected by poorly informed decisions.','Who defines success, whose knowledge counts, and what might research miss?','A proposal; no quantified risk reduction is claimed.']
].forEach(([id,label,role,text,refs,lives,benefit,cost,limit])=>n(id,label,'response',text,refs,{role,lives,benefit,cost,limit,status:refs.length?'Evidence-linked':'Design proposal',icon:'leaf'}));
[
['gd','GiveDirectly','Cash transfer programmes','cash','gd','Provides direct cash transfers; a Kenyan evaluation is linked separately.'],
['who','WHO','Health-equity guidance','care-access','who-uhc','Publishes health-system guidance. Guidance is not proof of local implementation.'],
['msf','Médecins Sans Frontières','Medical humanitarian work','care-access','msf','An example provider of medical humanitarian assistance. The charter describes its remit; specific programmes need local verification.'],
['fb','Friendship Bench','Community talk therapy','mental-care','fb','Describes community-based problem-solving support; outcomes are not reviewed here.'],
['gfi','Good Food Institute','Alternative-protein programmes','plant','gfi','Works on science, policy and industry enabling conditions for alternative proteins.'],
['wai','Wild Animal Initiative','Welfare research support','research','wai','Supports researchers studying the lives and welfare of wild animals.'],
['iucn','IUCN SSC','Coexistence guidance','coexist','iucn','Provides a framework for analysis and decision-making in human–wildlife conflict.'],
['ocp','Open Contracting Partnership','Procurement reform support','accountability','ocp','Works with partners on open contracting and implementation.'],
['sfcg','Search for Common Ground','Dialogue & peacebuilding','dialogue','sfcg','Works on peacebuilding and conflict transformation; no universal effectiveness claimed.']
].forEach(([id,label,programme,response,ref,text])=>{const aid='actor-'+id;n(aid,label,'actor',text,[ref],{programme,status:'Activity mapped',icon:'nodes',lives:nodes[response].lives,limit:'Relevant activity is not an endorsement or a ranking. No partner relationship with Interbeing is implied.'});e(aid,response,'works on','Organisation activity',[ref],text);});
[
['unmet','Unmet basic needs','access','poverty','Affordability and access can constrain essential living conditions.',['who-sdh'],'Evidence-informed'],
['barrier','Financial barriers to care','access','illness','Care that cannot be afforded may be forgone.',['who-uhc'],'Evidence-informed'],
['costs','Out-of-pocket care costs','access','poverty','Paying for care can create financial hardship.',['who-uhc'],'Evidence-informed'],
['hazards','Disease & injury exposure','vulnerability','illness','Bodies remain vulnerable to disease and injury.',[],'Conceptual relation'],
['restriction','Restricted behaviour','incentives','farmed','Insufficient space and unsuitable housing can compromise pig welfare.',['efsa'],'Evidence-informed'],
['demand','Animal-sourced demand','incentives','ecology','At scale, demand for animal-sourced food contributes to land and emissions pressures.',['ipcc'],'Evidence-informed'],
['no-voice','Unrepresented interests','concern','farmed','Our ethical lens asks whose experience is omitted when production decisions are made.',['ny'],'Ethical lens'],
['predation','Predation','vulnerability','wild','Predators kill prey; caring for one does not erase the interests of the other.',['nps'],'Observed mechanism'],
['shared-land','Overlapping land use','cooperation','wild','A context for investigating conflict between livelihoods, livestock and wildlife.',['iucn'],'Contextual relation'],
['blindspots','Unknown welfare effects','knowledge','wild','Conservation outcomes do not by themselves tell us about every individual’s wellbeing.',['wai'],'Research question'],
['discrimination','Structural discrimination','power','exclusion','Resource allocation and structural discrimination contribute to unequal opportunities and health.',['who-sdh'],'Evidence-informed'],
['short-term','Short-term rewards','concern','ecology','IPBES identifies short-term individual and material gains among underlying causes of biodiversity loss.',['ipbes'],'Evidence-informed'],
['fragile-trust','Threat & damaged trust','threat','violence','A proposed mechanism to investigate, not a claim that trauma causes violence in a particular person.',[],'Hypothesis'],
['distorted','Distorted information','knowledge','information','A candidate pathway between information quality and decisions; specific effects need evidence.',[],'Hypothesis']
].forEach(([id,label,family,problem,text,refs,kind])=>{n(id,label,'mechanism',text,refs,{family,status:kind,icon:'root',lives:nodes[problem].lives});e(family,id,'contains a research question','Organising link',[],'This groups a mechanism under a working family; it does not establish causation.');e(id,problem,kind==='Evidence-informed'?'contributes to':'is relevant to',kind,refs,text);});
[
['cash','poverty','can relieve material deprivation','Evidence from evaluation',['cash-study'],'The Kenyan randomised evaluation found short-run gains in consumption, assets and food security; effects are not universal.'],
['protection-social','unmet','aims to improve security','Response proposal',['who-sdh'],''],
['care-access','barrier','aims to lower access barriers','Response proposal',['who-uhc'],''],
['care-access','costs','aims to reduce hardship','Response proposal',['who-uhc'],''],
['water-safe','hazards','targets harmful conditions','Response proposal',['who-sdh'],''],
['mental-care','distress','offers care','Organisation activity',['fb'],''],
['dialogue','shared-land','guides local planning','Practice framework',['iucn'],''],
['accountability','discrimination','opens an accountability question','Hypothesis',[],'Procurement transparency alone does not demonstrate reduced discrimination.'],
['plant','demand','can reduce resource pressure','Evidence-informed',['ipcc'],'Replacing some animal-sourced food at scale can reduce land requirements and emissions, depending on production and substitution.'],
['plant','farmed','offers an alternative pathway','Ethical lens',[],'Animal welfare implications depend on actual displacement of production; no lives-saved estimate is made.'],
['welfare','restriction','addresses pig-welfare hazards','Evidence-informed',['efsa'],'Species-specific measures include more space and suitable enrichment; local implementation matters.'],
['transition','poverty','aims to support workers','Design proposal',['ipcc'],''],
['coexist','shared-land','aims to reduce conflict','Design proposal',['iucn'],''],
['coexist','wild','aims to avoid unnecessary harm','Design proposal',['iucn'],''],
['research','blindspots','investigates uncertainty','Organisation activity',['wai'],''],
['restoration','ecology','targets ecological damage','Response proposal',['ipbes'],''],
['learning','information','investigates knowledge gaps','Design proposal',[],''],
['learning','future-risk','includes long-term questions','Ethical lens',[],''],
['plant','transition','may require worker support','Trade-off',[],'This is a transition-design question, not an estimated employment effect.'],
['coexist','poverty','requires resources and labour','Trade-off',[],'Who pays for protective measures and carries any remaining losses?'],
['restoration','wild','may change individual welfare','Uncertain effect',[],'Ecological restoration is not automatic proof of improved welfare for all individual animals.']
].forEach(row=>e(...row));
e('poverty','barrier','can make care unaffordable','Evidence-informed',['who-uhc'],'Financial access barriers connect resource scarcity with care access.');
e('illness','costs','can require spending on care','Contextual mechanism',['who-uhc'],'Illness requiring care can expose households to out-of-pocket costs; exposure depends on coverage.');
e('poverty','distress','is linked to unequal living conditions','Contextual relation',['who-sdh'],'Investigate material and social conditions without attributing an individual mental-health outcome.');
e('ecology','poverty','can harm livelihoods','Evidence-informed',['who-sdh'],'Climate disruption can damage the living conditions and livelihoods of disadvantaged groups.');
e('violence','illness','can disrupt living conditions','Evidence-informed',['who-sdh'],'Conflict and displacement affect access to services and the conditions supporting health.');
const overview={vulnerability:['illness','wild'],access:['poverty','illness'],incentives:['farmed','ecology'],power:['exclusion','violence'],knowledge:['information','wild'],cooperation:['ecology','violence'],threat:['distress','violence'],concern:['farmed','future-risk']};
Object.entries(overview).forEach(([r,ps])=>ps.forEach(p=>e(r,p,'explore this family','Organising link',[],'A broad correspondence used to navigate the atlas. Trace the roots to inspect specific claims.')));
[
['security','Basic security',['cash','protection-social'],['poverty']],
['health','Health & care',['care-access','water-safe'],['illness']],
['together','Care & shared decisions',['mental-care','dialogue'],['distress','violence','wild']],
['rules','Accountable systems',['accountability','learning'],['exclusion','information','future-risk']],
['food','A fair food transition',['plant','transition'],['farmed','ecology','poverty']],
['animals','Animal protection',['welfare','coexist'],['farmed','wild']],
['living','Living systems & research',['research','restoration'],['wild','ecology','future-risk']]
].forEach(([id,label,rs,ps])=>{const gid='group-'+id;n(gid,label,'group','Explore two distinct responses. Shared goals do not mean identical effects.',[],{children:rs,icon:'leaf',status:'Navigation group'});rs.forEach(r=>e(gid,r,'contains response','Organising link'));ps.forEach(p=>e(gid,p,'possible response family','Organising link',[],'A navigation link, not evidence of effectiveness.'));});
const paths={
food:{label:'Food & animals',title:'Whose life is missing from the price?',description:'Follow a practice, the pressure around it, and responses that must also consider workers.',seed:'farmed',nodes:['incentives','concern','restriction','demand','no-voice','farmed','ecology','poverty','plant','transition','welfare','actor-gfi'],compare:['plant','welfare','transition'],steps:[['farmed','Begin with a life','The worked example examines pig-welfare hazards. It is not a judgement of every farm.'],['restriction','Name the mechanism','More specific than “bad incentives”: inspect movement and behavioural restrictions and the EFSA evidence.'],['plant','Find another pathway','Alternative provision can change demand. Nutritional adequacy, actual substitution and affordability matter.'],['transition','Include the transition','A proposal is not a result. Ask affected workers what support would actually help.']]},
care:{label:'Poverty & care',title:'When the cost of care deepens the need.',description:'Explore a context-dependent loop between resources, access, illness and out-of-pocket costs.',seed:'illness',nodes:['access','vulnerability','unmet','barrier','hazards','costs','poverty','illness','cash','care-access','protection-social','actor-gd','actor-who','actor-msf'],compare:['cash','care-access','protection-social'],steps:[['poverty','Start with material conditions','A person can need care and lack the resources to obtain it.'],['barrier','Trace the barrier','Financial protection and service availability are different questions.'],['costs','Notice what feeds back','Paying out of pocket can deepen hardship. Not all illness creates this cycle.'],['care-access','Interrupt more than one link','Combine immediate support with questions about how care is financed and delivered.']]},
wild:{label:'Coexistence',title:'Can we protect one life without overlooking another?',description:'Hold predator, prey, livestock and human interests together without assuming a perfect win-win.',seed:'wild',nodes:['vulnerability','cooperation','knowledge','predation','shared-land','blindspots','wild','poverty','coexist','dialogue','research','actor-iucn','actor-wai'],compare:['coexist','dialogue','research'],steps:[['wild','Begin beyond our own species','A habitat can flourish while individual animals suffer.'],['predation','Keep the conflict visible','Predator and prey interests cannot always align. This is not an easy-villain story.'],['coexist','Find a local possibility','Assess protective measures with communities and experts, not from a generic map.'],['research','Stay honest about the unknowns','Welfare research is valuable without pretending it already delivers an intervention.']]}
};
return {version:'2.0.0',title:'Interbeing — The Root Atlas',tagline:'From interconnected suffering to shared solutions.',nodes,edges,sources,paths,loop:['poverty--barrier','barrier--illness','illness--costs','costs--poverty'],release:'2026-10-16',coverage:{root:8,problem:10,response:14,actor:9},limitations:['Working taxonomy; not a complete ontology or a universal theory.','Links preserve evidence type, scope and uncertainty; no causal weights or moral scores.','All potentially sentient beings are within scope; represented branches are not exhaustive.','Source checks are editorial, not independent expert review.','No personal information is inferred; your optional role is a lens, not an impact assessment.']};
})();
