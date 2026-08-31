const KEY='hyperspace_kids_signal_lux_v04';
export const defaultState={firstOpened:false,packCount:0,stardust:0,nexusUnlocked:false,awakened:false,inventory:[{id:'GENESIS-CORE',name:'GENESIS CORE',category:'CORE',rarity:'GENESIS',origin:'THE NEXUS',glyph:'◎'}],ledger:[]};
export function loadState(){try{return{...defaultState,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaultState)}}
export function saveState(s){localStorage.setItem(KEY,JSON.stringify(s))}
export function addEvent(s,type,data={}){s.ledger=[{id:crypto.randomUUID?.()||String(Date.now()),type,at:new Date().toISOString(),...data},...(s.ledger||[])].slice(0,100);saveState(s)}
