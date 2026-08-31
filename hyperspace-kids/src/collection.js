export const RARITY_ORDER=['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC'];
export const STORY_PACK=[
 {id:'HK-0046',slot:'SIGNAL',name:'UNMAPPED MERIDIAN',category:'WORLD_KEY',rarity:'UNCOMMON',origin:'ORBITAL-3',lore:'A route appears only after it is remembered.',glyph:'⌁'},
 {id:'HK-0042',slot:'GEAR',name:'PARALLAX VISOR',category:'WEARABLE',rarity:'RARE',origin:'NEON-7',lore:'Reveals the transit lines between visible things.',glyph:'◒'},
 {id:'HK-0043',slot:'LIFE',name:'VOID FOX',category:'COMPANION',rarity:'EPIC',origin:'THE VOID',lore:'Always one heartbeat ahead of danger.',glyph:'✦'},
 {id:'HK-0044',slot:'MEMORY',name:'THE FIRST REPLY',category:'MEMORY',rarity:'LEGENDARY',origin:'THE NEXUS',lore:'Proof that the silence was listening.',glyph:'◌'},
 {id:'HK-0045',slot:'RIFT',name:'RIFT SEED',category:'RELIC',rarity:'MYTHIC',origin:'THE NEXUS',lore:'A world compressed to the size of a thought.',glyph:'◇',effect:'UNLOCK_NEXUS'}
];
const WORDS={WEARABLE:['PRISM VEIL','RIFT JACKET','ORBIT BOOTS','ECHO MASK','SOLAR GLOVES'],COMPANION:['MOON MOTH','SIGNAL KOI','PRISM CAT','ECHO CROW','RIFT SPRITE'],RELIC:['GLASS COMPASS','ORBIT SHARD','SIGNAL LENS','LUNAR CORE','RIFT COIN'],MEMORY:['BLUE HOUR','GRAVITY LESSON','HOME FREQUENCY','AFTERIMAGE','KINDNESS LOOP'],WORLD_KEY:['EDEN SIGIL','VOID PASS','SOLARA STAMP','KAIROS THREAD','AQUARIA TOKEN']};
const GLYPHS={WEARABLE:'◒',COMPANION:'✦',RELIC:'◇',MEMORY:'◌',WORLD_KEY:'⌁'};
const RARITIES=[['COMMON',56],['UNCOMMON',25],['RARE',11],['EPIC',5.5],['LEGENDARY',2.1],['MYTHIC',.4]];
function pickWeighted(){let x=Math.random()*100;for(const [r,w] of RARITIES){x-=w;if(x<=0)return r}return'COMMON'}
export function randomPack(packCount=0){const categories=['WORLD_KEY','WEARABLE','COMPANION','MEMORY','RELIC'];return categories.map((category,i)=>{let rarity=pickWeighted();if(i===4&&['COMMON','UNCOMMON'].includes(rarity))rarity='RARE';if(packCount>0&&packCount%8===7&&i===4)rarity=Math.random()<.9?'LEGENDARY':'MYTHIC';const names=WORDS[category];return{id:`HK-${Math.floor(1000+Math.random()*8999)}`,slot:['SIGNAL','GEAR','LIFE','MEMORY','RIFT'][i],name:names[Math.floor(Math.random()*names.length)],category,rarity,origin:['NEON-7','EDEN','THE VOID','SOLARA','KAIROS','AQUARIA'][Math.floor(Math.random()*6)],lore:'Recovered from a signal beyond mapped space.',glyph:GLYPHS[category]}})}
