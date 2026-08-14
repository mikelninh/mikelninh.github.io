const levels=["case","trace","relevant","space","external"];
const levelCopy={
  case:["CASE LAYER","Immediate case context first.","The thread, actors and attached evidence are enough to classify the issue before broader organisational memory is pulled in."],
  trace:["TRACE LAYER","See what already happened.","Actions, inputs and outputs make the current state inspectable — useful for recovery, handoff and later evaluation."],
  relevant:["RELEVANT LAYER","Bring in precedent, not noise.","Similar resolved cases surface the decisions and artifacts that mattered before. Here, FM-5088 is a 94% match but the after-hours condition changes the route."],
  space:["SPACE LAYER","Add the team’s operating knowledge.","The Reactive Repair procedure and building access notes constrain what the next worker should do without loading the whole workspace."],
  external:["EXTERNAL LAYER","Use live systems only when action needs them.","The contractor panel enters when availability and dispatch become relevant. Context stays scoped to the decision instead of becoming an indiscriminate data dump."]
};
const layers=[...document.querySelectorAll('.layer')];
const nodes=[...document.querySelectorAll('.node')];
const edges=[...document.querySelectorAll('.edge')];
function renderLayer(level){
  const idx=levels.indexOf(level);
  layers.forEach(b=>b.classList.toggle('active',b.dataset.layer===level));
  nodes.forEach(n=>n.classList.toggle('visible',levels.indexOf(n.dataset.level)<=idx));
  edges.forEach(e=>{
    const type=levels.find(l=>e.classList.contains(`${l}-edge`))||'case';
    e.classList.toggle('on',levels.indexOf(type)<=idx);
  });
  const [status,title,copy]=levelCopy[level];
  document.querySelector('#layer-status').textContent=status;
  document.querySelector('#context-title').textContent=title;
  document.querySelector('#context-copy').textContent=copy;
}
layers.forEach(b=>b.addEventListener('click',()=>renderLayer(b.dataset.layer)));
renderLayer('case');

const flow={
  precedent:["MEMORYRANK","Start from a path that already worked.","FM-5088 is the closest successful precedent: same building type, same fault family, same access constraints. The current case differs because it is after hours, so the route adds an escalation check."],
  procedure:["PROCEDURE","Turn precedent into an explicit path.","Verify severity → confirm access → select approved contractor → dispatch → verify repair → reconcile the case. Evidence requirements and the emergency-spend boundary stay visible."],
  route:["ORCHESTRATION","Use the cheapest competent worker for each step.","An agent handles intake and follow-up, the contractor system performs deterministic dispatch, and a facilities manager enters only if the spend threshold or ambiguity requires judgment."],
  verify:["RELIABILITY GATE","Do not confuse activity with resolution.","A contractor visit is not enough. The case cannot conclude until repair evidence, contractor notes and tenant confirmation support the outcome."],
  learn:["OUTCOME SIGNAL","Completed cases strengthen future routing.","Once the outcome is graded, the successful relationships — precedent, procedure, contractor, human decision and evidence — become stronger context for the next similar case."]
};
const flowButtons=[...document.querySelectorAll('.flow-step')];
function renderFlow(key){
  flowButtons.forEach(b=>b.classList.toggle('active',b.dataset.step===key));
  const [k,t,c]=flow[key];
  document.querySelector('#flow-kicker').textContent=k;
  document.querySelector('#flow-title').textContent=t;
  document.querySelector('#flow-copy').textContent=c;
}
flowButtons.forEach(b=>b.addEventListener('click',()=>renderFlow(b.dataset.step)));
renderFlow('precedent');