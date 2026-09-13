import fs from 'node:fs'

const path = 'cohere-fde/index.html'
let html = fs.readFileSync(path, 'utf8')

const css = `
<style id="cohere-readability-pass">
/* Final readability pass: executive-readable default, engineering depth on demand. */
body{font-size:16px;line-height:1.6}
.wrap{width:min(1180px,calc(100% - 56px))}
.top .wrap{height:68px}.brand{font-size:15px}.nav a{font-size:13px}
.hero{padding:78px 0 58px}.eyebrow,.label{font-size:11px}.lead{font-size:clamp(20px,2vw,25px);line-height:1.5}.chip{font-size:11px;padding:7px 11px}.btn{font-size:13px;min-height:46px;padding:0 18px}
.section{padding:68px 0}.sectionHead{grid-template-columns:1.08fr .92fr;gap:56px;margin-bottom:30px}.sectionHead h2{font-size:clamp(38px,4vw,52px);line-height:1.04}.sectionHead p{font-size:16px;line-height:1.7;max-width:520px}.sectionHead p strong{color:var(--ink)}
.request{padding:26px 28px;border-radius:18px}.request strong{font-size:21px;line-height:1.45}.request small{font-size:13px;margin-top:12px}.risk{font-size:11px;padding:8px 11px}
.workspace{gap:18px;margin-top:18px}.card{padding:24px;border-radius:18px}.source{padding:15px 0}.source b{font-size:15px}.source span{font-size:13px;margin-top:4px}.source i{font-size:12px}.authority{padding-top:16px}.authority b{font-size:14px}.authority p{font-size:14px;line-height:1.6}.controls{margin-top:20px;gap:9px}.controls button{font-size:12px;padding:10px 13px}.runtimeNote{font-size:12px;line-height:1.6;margin-top:15px}
.console{padding:20px;border-radius:18px}.consoleHead{font-size:12px}.steps{gap:9px;margin-top:20px}.step{padding:13px;min-height:86px}.step small{font-size:10px}.step b{font-size:13px}.step em{font-size:11px;line-height:1.35}.receipt{font-size:13px;line-height:1.65;min-height:100px;padding-top:16px;margin-top:18px}.approval{padding:15px}.approval strong{font-size:15px}.approval p{font-size:13px;line-height:1.55}.approval button{font-size:12px;padding:10px 12px}.recovery{padding:15px}.recovery b{font-size:11px}.stateChip{font-size:11px;padding:7px 9px}.arrow{font-size:13px}
.inspect{margin-top:20px;border-radius:18px}.inspectHead{padding:16px 18px}.inspectHead strong{font-size:16px}.inspectHead span{font-size:12px}.tabs{padding:13px 16px;gap:8px}.tab{font-size:12px;padding:8px 11px}.panel{font-size:12.5px;line-height:1.65;padding:18px;min-height:190px}
.audit{gap:18px;margin-top:18px}.audit h3{font-size:24px;line-height:1.2;margin:5px 0 14px}.audit p{font-size:15px!important;line-height:1.65!important}.evalRow{padding:12px 0;font-size:13px}.evalRow b{font-size:12px}
.evidence{gap:10px;margin-top:20px}.metric{padding:16px;border-radius:14px}.metric strong{font-size:30px}.metric span{font-size:13px;line-height:1.45}.handoff div{padding:21px}.handoff b{font-size:13px}.handoff p{font-size:14px;line-height:1.6}.boundary{font-size:12px;line-height:1.6}.closingLinks a{font-size:13px}.footer{font-size:12px}
@media(max-width:860px){.sectionHead{gap:18px}.sectionHead p{max-width:none}}
@media(max-width:560px){.wrap{width:calc(100% - 30px)}.hero{padding:54px 0 40px}.lead{font-size:19px}.section{padding:52px 0}}
</style>`

if (html.includes('<style id="cohere-readability-pass">')) {
  html = html.replace(/<style id="cohere-readability-pass">[\s\S]*?<\/style>/, css.trim())
} else {
  html = html.replace('</head>', `${css}\n</head>`)
}

html = html.replace(
  'The UI no longer decides the outcome. It calls a serverless endpoint backed by the Digital Worker Factory runtime. The returned evidence, tool receipts and policy decision render the trace.',
  '<strong>Server-backed, not simulated.</strong><br>Every run hits the bounded Digital Worker Factory runtime. Evidence, tool receipts and the server-side policy decision render the trace.'
)
html = html.replace(
  'The consequential capability is evaluated by the real gateway. Missing evidence stops the workflow before prepare/release; human approval changes the server-side decision, not just the UI.',
  'Missing evidence stops the workflow before prepare/release. Human approval changes the server-side decision — not merely the interface.'
)
html = html.replace('TASK SUCCESS</b><span>correct outcome</span></div><div class="evalRow"><b>', '')
html = html.replace('TOOL ACCURACY', 'TOOL USE')
html = html.replace('APPROVAL</b><span>no gate bypass', 'HUMAN GATE</b><span>no bypass')
html = html.replace('The demo sits on top of executable engineering evidence.', 'Executable evidence beneath the demo.')
html = html.replace(
  'The live case remains synthetic. It does not turn a demo into a production claim; it proves the runtime path, authority boundary and observable failure semantics are executable.',
  'The case is synthetic by design. The proof is that the runtime path, authority boundary and failure semantics are actually executable and inspectable.'
)

fs.writeFileSync(path, html)
console.log('Cohere readability pass applied.')
