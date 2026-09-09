export function cloneControls(v){ return JSON.parse(JSON.stringify(v)) }

export function simulate(template, scenario, controls){
  const totals={identities:0,services:0,datasets:0,dataGB:0,downtimeHours:0}
  const steps=[]
  let stopped=false
  let firstBlocked=null
  for(const step of scenario.steps){
    if(stopped){
      steps.push({...step,status:'not-reached'})
      continue
    }
    if(step.blockedBy && controls[step.blockedBy]){
      stopped=true
      firstBlocked=step.blockedBy
      steps.push({...step,status:'blocked'})
      continue
    }
    for(const k of Object.keys(totals)) totals[k]+=Number(step.impact?.[k]||0)
    steps.push({...step,status:'escaped'})
  }
  const scaled={...totals}
  scaled.dataGB=Math.round(totals.dataGB*template.scale*10)/10
  scaled.downtimeHours=Math.round(totals.downtimeHours*Math.max(.45,template.scale)*10)/10
  scaled.identities=Math.max(totals.identities?1:0,Math.round(totals.identities*Math.max(.55,template.scale)))
  scaled.services=Math.min(6,totals.services)
  scaled.datasets=Math.min(6,totals.datasets)
  const escaped=steps.filter(x=>x.status==='escaped').length
  const blocked=steps.some(x=>x.status==='blocked')
  const status=!blocked?'uncontained':escaped===0?'contained':'contained-after-impact'
  return {templateId:template.id,scenarioId:scenario.id,steps,metrics:scaled,status,firstBlocked,escapedSteps:escaped,totalSteps:scenario.steps.length}
}

export function impactUnits(metrics){
  return (metrics.identities*8)+(metrics.services*28)+(metrics.datasets*24)+(metrics.dataGB*.8)+(metrics.downtimeHours*7)
}

export function compareRuns(before,after){
  const out={}
  for(const key of Object.keys(before.metrics)) out[key]=Math.round((before.metrics[key]-after.metrics[key])*10)/10
  out.impactUnits=Math.round((impactUnits(before.metrics)-impactUnits(after.metrics))*10)/10
  return out
}

export function recommendations(template, scenarios, controls){
  const current=scenarios.map(s=>simulate(template,s,controls))
  const baseImpact=current.reduce((sum,r)=>sum+impactUnits(r.metrics),0)
  const keys=Object.keys(controls).filter(k=>!controls[k])
  return keys.map(control=>{
    const next={...controls,[control]:true}
    const improved=scenarios.map(s=>simulate(template,s,next))
    const nextImpact=improved.reduce((sum,r)=>sum+impactUnits(r.metrics),0)
    const scenariosImproved=improved.filter((r,i)=>impactUnits(r.metrics)<impactUnits(current[i].metrics)).length
    return {control,prevented:Math.max(0,Math.round((baseImpact-nextImpact)*10)/10),scenariosImproved}
  }).filter(x=>x.prevented>0).sort((a,b)=>b.prevented-a.prevented || b.scenariosImproved-a.scenariosImproved)
}

export function recoveryPlan(controls){
  return {
    detectAndIsolateMinutes: controls.detection ? 20 : 180,
    revokeSessionsMinutes: controls.sessionRevocation ? 30 : 240,
    restoreCriticalServiceHours: controls.backups ? 4 : 48,
    confidence: controls.detection && controls.backups && controls.sessionRevocation ? 'stronger' : 'needs-work'
  }
}

export function controlCoverage(scenarios){
  const count={}
  for(const s of scenarios){
    for(const step of s.steps){ if(step.blockedBy) count[step.blockedBy]=(count[step.blockedBy]||0)+1 }
  }
  return count
}
