// CHOICE LAB v1: public, opt-in experiment API.
// No raw response reads; aggregate counts only. RLS remains in force.
const ALLOWED = "https://mikelninh.github.io";
const url = Deno.env.get("SUPABASE_URL");
const key = Deno.env.get("SUPABASE_ANON_KEY");
const base = url + "/rest/v1/";
function cors(req) {
  const origin=req.headers.get("origin")||"";
  const allowed = origin===ALLOWED || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  };
}
function reply(body,status,headers){return new Response(JSON.stringify(body),{status,headers});}
Deno.serve(async(req)=>{
  const headers=cors(req);
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers});
  if(!url||!key) return reply({error:"Configuration unavailable"},503,headers);
  const path=new URL(req.url).pathname;
  const origin=req.headers.get("origin")||"";
  const allowPost=origin===ALLOWED||/^http:\/\/localhost(:\d+)?$/.test(origin)||/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
  const auth={"apikey":key,"Authorization":"Bearer "+key};
  try {
    if(req.method==="GET") {
      const r=await fetch(base+"choice_lab_v1_totals?select=arm,choice,responses,confidence_sum,confidence_count&order=arm.asc,choice.asc",{headers:auth});
      if(!r.ok) return reply({error:"Metrics temporarily unavailable"},502,headers);
      const rows=await r.json();
      return reply({status:"ok",source:"live",metric:"hypothetical choices, not real purchases",arms:rows},200,headers);
    }
    if(req.method==="POST" && allowPost) {
      if(Number(req.headers.get("content-length")||"0")>2000) return reply({error:"Request too large"},413,headers);
      const data=await req.json();
      const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const valid=data&&typeof data==="object"&&uuid.test(data.token||"")&&
        ["control","discount","default"].includes(data.arm)&&["plant","beef"].includes(data.choice)&&
        (data.reason===null||["taste","price","habit","curiosity","values","other"].includes(data.reason))&&
        (data.confidence===null||(Number.isInteger(data.confidence)&&data.confidence>=1&&data.confidence<=5));
      if(!valid) return reply({error:"Invalid trial response"},400,headers);
      const payload={trial_token:data.token,arm:data.arm,choice:data.choice,reason:data.reason,confidence:data.confidence};
      const r=await fetch(base+"choice_lab_v1_responses",{method:"POST",headers:{...auth,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(payload)});
      if(r.status===201||r.status===204) return reply({status:"recorded",message:"One hypothetical choice recorded"},201,headers);
      if(r.status===409) return reply({status:"already_recorded"},409,headers);
      return reply({error:"Could not save response",code:r.status},502,headers);
    }
    return reply({error:"Method or origin not allowed"},405,headers);
  }catch(e){return reply({error:"The experiment service is temporarily unavailable"},503,headers);}
});