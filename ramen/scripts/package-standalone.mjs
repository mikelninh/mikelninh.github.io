import fs from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('ramen');
const outputRoot = path.resolve('dist');
const output = path.join(outputRoot,'ramen-passport');

await fs.rm(outputRoot,{recursive:true,force:true});
await fs.mkdir(outputRoot,{recursive:true});
await fs.cp(source,output,{recursive:true,filter:(entry)=>{
  const relative=path.relative(source,entry);
  return !relative.startsWith('node_modules') && !relative.startsWith('.git');
}});

await replace(path.join(output,'index.html'),[
  ['../vegan/ramen-data.js','ramen-data.js'],
  ['href="../" aria-label="Michael Ninh home"','href="./" aria-label="Ramen Passport home"'],
  ['https://github.com/mikelninh/mikelninh.github.io/tree/main/ramen','https://github.com/mikelninh/ramen-passport']
]);

await replace(path.join(output,'package.json'),[
  ['python -m http.server 8000 --directory ..','python -m http.server 8000 --directory .']
]);

await replace(path.join(output,'scripts','check-ui.mjs'),[
  ["const root = path.resolve('ramen');","const root = path.resolve('.');"],
  ["const legacyData = await fs.readFile(path.resolve('vegan/ramen-data.js'),'utf8');\nif (localData !== legacyData) errors.push('ramen/ramen-data.js and vegan/ramen-data.js differ. Keep them synchronized until the standalone repository becomes canonical.');\n",'']
]);

await fs.mkdir(path.join(output,'.github','workflows'),{recursive:true});
await fs.writeFile(path.join(output,'.github','workflows','quality.yml'),`name: Ramen Passport quality\n\non:\n  push:\n  pull_request:\n  schedule:\n    - cron: '17 7 * * 1'\n  workflow_dispatch:\n\npermissions:\n  contents: read\n\njobs:\n  validate:\n    runs-on: ubuntu-latest\n    timeout-minutes: 25\n    env:\n      OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}\n      OPENAI_FACT_CHECK_MODEL: \${{ vars.OPENAI_FACT_CHECK_MODEL || 'gpt-5' }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n      - name: Check UI and local assets\n        run: npm run check:ui\n      - name: Validate product records, sources and images\n        run: npm run check:data\n      - name: Optional independent AI contradiction review\n        if: \${{ env.OPENAI_API_KEY != '' }}\n        run: node scripts/agent-fact-check.mjs\n`);

await fs.writeFile(path.join(output,'.gitignore'),`node_modules/\ndist/\n.DS_Store\nramen-validation-report.md\nramen-image-resolution-report.json\nramen-image-overrides.generated.js\nramen-agent-review.json\n`);

await fs.writeFile(path.join(output,'MIGRATION_STATUS.md'),`# Migration status\n\nThis package was generated from the tested Ramen Passport v3 implementation.\n\nBefore public launch from the new repository:\n\n1. replace placeholder repository links with the final remote URL;\n2. choose the public deployment URL and update share-card URLs;\n3. add OPENAI_API_KEY as a repository secret only when optional AI review is desired;\n4. run npm run check;\n5. enable GitHub Pages or connect the repository to Vercel.\n`);

console.log(`Standalone repository prepared at ${output}`);

async function replace(file,replacements){
  let content=await fs.readFile(file,'utf8');
  for(const [from,to] of replacements){
    if(!content.includes(from)) throw new Error(`${path.relative(process.cwd(),file)} does not contain expected text: ${from}`);
    content=content.replace(from,to);
  }
  await fs.writeFile(file,content);
}
