// V9 edge-case patch: a verified contribution in the current stage must not hide
// a future active responsibility for the same stakeholder.
roleTask=function(){
  const x=stageInfo();
  if(x.complete)return{kind:'done'};
  let completedMatch=null;
  for(const id of x.stage.tasks){
    const t=x.c.tasks[id],st=state(id);
    if(t.ownerRole===currentRole||t.verifierRole===currentRole){
      if(st!=='verified')return{id,t,st};
      completedMatch={id,t,st};
    }
  }
  for(let j=x.i+1;j<x.c.stages.length;j++){
    for(const id of x.c.stages[j].tasks){
      const t=x.c.tasks[id];
      if(t.ownerRole===currentRole||t.verifierRole===currentRole)return{id,t,st:'future'};
    }
  }
  return completedMatch||{kind:'none'};
};
render();