import fs from 'node:fs/promises';
import {loadRamenData} from './load-data.mjs';

if (!process.env.OPENAI_API_KEY) {
  console.log('OPENAI_API_KEY is not configured; optional agent review skipped.');
  process.exit(0);
}

const ramenRoot = new URL('../', import.meta.url);
const data = await loadRamenData();
const model = process.env.OPENAI_FACT_CHECK_MODEL || 'gpt-5';
const batches = chunk(data, 10);
const findings = [];

for (let index = 0; index < batches.length; index++) {
  const input = batches[index].map(item => ({
    id:item.id,
    brand:item.brand,
    product:item.name,
    claimed_market:item.market,
    gtin:item.gtin,
    claimed_vegan_status:item.vegan,
    claimed_verification_level:item.verificationLevel,
    evidence:item.evidence?.en,
    source:item.source,
    buy:item.buy,
    image:item.image,
    image_source:item.imageSource
  }));

  const response = await fetch('https://api.openai.com/v1/responses', {
    method:'POST',
    headers:{
      'authorization':`Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type':'application/json'
    },
    body:JSON.stringify({
      model,
      store:false,
      tools:[{type:'web_search'}],
      input:[{
        role:'user',
        content:[{
          type:'input_text',
          text:`You are the independent release reviewer for a Germany-first instant-ramen database. Verify every item below using the supplied source first and web search only when needed. Do not infer vegan status from a flavour name or from the absence of obvious animal ingredients. Distinguish German/EU packs from US and Asian recipes. Check whether the source supports the exact claim, whether links resolve, whether the image appears to match the named product, and whether a Germany buy link really offers that version. Return PASS only when the displayed claim is supported. Return REVIEW for insufficient or market-ambiguous evidence. Return FAIL for contradictions, wrong products, dead domains, misleading vegan labels or mismatched images.\n\nITEMS:\n${JSON.stringify(input,null,2)}`
        }]
      }],
      text:{
        format:{
          type:'json_schema',
          name:'ramen_fact_check',
          strict:true,
          schema:{
            type:'object',
            additionalProperties:false,
            properties:{
              results:{
                type:'array',
                items:{
                  type:'object',
                  additionalProperties:false,
                  properties:{
                    id:{type:'string'},
                    verdict:{type:'string',enum:['PASS','REVIEW','FAIL']},
                    source_supports_claim:{type:'boolean'},
                    market_match:{type:'boolean'},
                    vegan_status_supported:{type:'boolean'},
                    image_match:{type:'boolean'},
                    buy_link_match:{type:'boolean'},
                    explanation:{type:'string'},
                    recommended_change:{type:'string'}
                  },
                  required:['id','verdict','source_supports_claim','market_match','vegan_status_supported','image_match','buy_link_match','explanation','recommended_change']
                }
              }
            },
            required:['results']
          }
        }
      }
    })
  });

  if (!response.ok) throw new Error(`OpenAI review failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const output = payload.output_text || extractOutputText(payload);
  const parsed = JSON.parse(output);
  findings.push(...parsed.results);
  console.log(`Reviewed batch ${index + 1}/${batches.length}.`);
}

const failures = findings.filter(item => item.verdict === 'FAIL');
const reviews = findings.filter(item => item.verdict === 'REVIEW');
const report = [
  '# AI ramen fact-check',
  '',
  `- Model: ${model}`,
  `- Products reviewed: ${findings.length}`,
  `- PASS: ${findings.filter(x => x.verdict === 'PASS').length}`,
  `- REVIEW: ${reviews.length}`,
  `- FAIL: ${failures.length}`,
  '',
  ...findings.map(item => `## ${item.id} — ${item.verdict}\n${item.explanation}\n\nRecommended change: ${item.recommended_change || 'None.'}`)
].join('\n');

await fs.writeFile(new URL('../fact-check-report.md', ramenRoot), report + '\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, '\n' + report + '\n');
if (failures.length) process.exit(1);

function chunk(array, size) {
  return Array.from({length:Math.ceil(array.length/size)},(_,i)=>array.slice(i*size,i*size+size));
}

function extractOutputText(payload) {
  return (payload.output || [])
    .flatMap(item => item.content || [])
    .filter(item => item.type === 'output_text')
    .map(item => item.text)
    .join('');
}