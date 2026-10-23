import { readdir, readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';

const [sourceArg, targetArg] = process.argv.slice(2);
if (!sourceArg || !targetArg) throw new Error('Usage: sync-deployment.mjs SOURCE TARGET');
const source = path.resolve(sourceArg);
const target = path.resolve(targetArg);
if (source === target || target.startsWith(source + path.sep) || source.startsWith(target + path.sep)) throw new Error('Source and target must be separate directories');
// 페이지는 국문 경로와 같은 구조의 영문(en/) 경로를 함께 허용
const PAGE = /^(?:en\/)?(?:index\.html|delivery\.html|products-(?:bridge|deck|nonslip)\.html|about\/(?:history\/|certifications\/)?index\.html|support\/(?:notice|inquiry)\/index\.html)$/;
const ASSET = /^(?:css|js|images)\/.+$/;
const allowed = p => (PAGE.test(p) || ASSET.test(p)) && !p.split('/').some(s => s === '..' || s.startsWith('.'));
async function files(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error('Symlinks not permitted: ' + name);
    if (entry.isDirectory()) result.push(...await files(root, name + '/'));
    else if (entry.isFile()) result.push(name);
  }
  return result;
}
const current = (await files(source)).sort();
if (!current.includes('index.html') || current.some(p => !allowed(p))) throw new Error('Unexpected or incomplete build output');
await mkdir(target, { recursive: true });
const manifest = path.join(target, '.hitop-build-files.json');
let previous;
try { previous = JSON.parse(await readFile(manifest, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; previous = (await files(target)).filter(allowed); }
if (!Array.isArray(previous) || previous.some(p => typeof p !== 'string' || !allowed(p))) throw new Error('Invalid deployment manifest');
for (const name of previous) if (!current.includes(name)) await rm(path.join(target, name), { force: true });
for (const name of current) {
  const dest = path.join(target, name);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(path.join(source, name), dest);
}
await writeFile(path.join(target, '.nojekyll'), '');
await writeFile(manifest, JSON.stringify(current, null, 2) + '\n');
console.log(`Synchronized ${current.length} built files.`);
