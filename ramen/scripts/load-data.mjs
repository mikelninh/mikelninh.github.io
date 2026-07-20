import fs from 'node:fs/promises';
import vm from 'node:vm';

export async function loadRamenData() {
  const ramenRoot = new URL('../', import.meta.url);
  const files = [
    new URL('../vegan/ramen-data.js', ramenRoot),
    new URL('germany-overrides.js', ramenRoot),
    new URL('germany-round2.js', ramenRoot),
    new URL('germany-round3.js', ramenRoot),
    new URL('germany-round4.js', ramenRoot),
    new URL('image-round4.js', ramenRoot)
  ];
  const context = {window:{}};
  vm.createContext(context);
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    vm.runInContext(source, context, {filename:file.pathname});
  }
  return context.window.RAMEN_DATA;
}
