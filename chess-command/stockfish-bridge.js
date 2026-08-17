(function(global){
'use strict';
const ASM_URL='https://cdn.jsdelivr.net/npm/stockfish@18.0.8/bin/stockfish-18-asm.js';
class StockfishBridge{
 constructor(){this.worker=null;this.ready=false;this.loading=null;this.waiters=[];this.mode='fallback';}
 async init(){if(this.ready)return true;if(this.loading)return this.loading;this.loading=(async()=>{try{const res=await fetch(ASM_URL,{cache:'force-cache'});if(!res.ok)throw new Error('engine download failed');const code=await res.text();const blob=new Blob([code],{type:'text/javascript'});this.worker=new Worker(URL.createObjectURL(blob));this.worker.onmessage=e=>this._line(typeof e.data==='string'?e.data:String(e.data));this.worker.postMessage('uci');await this._wait('uciok',12000);this.worker.postMessage('isready');await this._wait('readyok',12000);this.ready=true;this.mode='stockfish-18';return true}catch(err){console.warn('Stockfish unavailable; using local practice bot.',err);this.mode='fallback';return false}})();return this.loading}
 _line(line){for(const w of [...this.waiters])if(line.includes(w.token)){this.waiters.splice(this.waiters.indexOf(w),1);w.resolve(line)}}
 _wait(token,ms=8000){return new Promise((resolve,reject)=>{const w={token,resolve};this.waiters.push(w);setTimeout(()=>{const i=this.waiters.indexOf(w);if(i>=0){this.waiters.splice(i,1);reject(new Error('timeout '+token))}},ms)})}
 async bestMove(fen,elo){const ok=await this.init();if(!ok)return null;this.worker.postMessage('stop');this.worker.postMessage('ucinewgame');if(elo===9999){this.worker.postMessage('setoption name UCI_LimitStrength value false')}else{this.worker.postMessage('setoption name UCI_LimitStrength value true');this.worker.postMessage('setoption name UCI_Elo value '+Math.max(1320,Math.min(3190,elo)))}this.worker.postMessage('position fen '+fen);this.worker.postMessage('go movetime '+(elo>=2400?550:elo>=1800?380:260));const line=await this._wait('bestmove',10000);const m=line.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);return m?m[1]:null}
}
global.StockfishBridge=StockfishBridge;
})(window);
