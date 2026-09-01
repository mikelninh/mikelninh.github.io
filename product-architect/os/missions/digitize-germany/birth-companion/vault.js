const VAULT_KEY='geburtslotse-vault-v1';
const enc=new TextEncoder();
const dec=new TextDecoder();
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));

async function derive(passphrase,salt){
  const material=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}

export function vaultExists(){return !!localStorage.getItem(VAULT_KEY)}

export async function saveVault(passphrase,data){
  if(!passphrase||passphrase.length<8)throw new Error('Passphrase must have at least 8 characters.');
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await derive(passphrase,salt);
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(data)));
  localStorage.setItem(VAULT_KEY,JSON.stringify({v:1,kdf:'PBKDF2-SHA256',iterations:250000,cipher:'AES-GCM-256',salt:b64(salt),iv:b64(iv),data:b64(ciphertext)}));
  return data;
}

export async function loadVault(passphrase){
  const raw=localStorage.getItem(VAULT_KEY);if(!raw)throw new Error('No vault exists.');
  const blob=JSON.parse(raw);
  try{
    const key=await derive(passphrase,unb64(blob.salt));
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(blob.iv)},key,unb64(blob.data));
    return JSON.parse(dec.decode(plain));
  }catch{throw new Error('Could not unlock vault. Check your passphrase.')}
}

export function clearVault(){localStorage.removeItem(VAULT_KEY)}
export function vaultInfo(){
  const raw=localStorage.getItem(VAULT_KEY);if(!raw)return null;
  try{const b=JSON.parse(raw);return {v:b.v,kdf:b.kdf,cipher:b.cipher,iterations:b.iterations}}catch{return null}
}
