import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTRACT, MATERIAL_ID, parseJson, checkSchemaSupport, validatePackage, validateCatalog, validateEntry, formatDuration, fail } from '../lib/content.mjs';
export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function json(file) { try { return parseJson(await fs.readFile(file, 'utf8'), file); } catch (error) { if (error.code) fail(file, '$', error.code === 'ENOENT' ? 'archivo ausente' : error.code); throw error; } }
async function normalDirectory(file) { const stat = await fs.lstat(file); if (!stat.isDirectory() || stat.isSymbolicLink()) fail(file, '$', 'se requiere una carpeta local sin enlace simbólico'); }
async function normalFile(file) { const stat = await fs.lstat(file).catch(() => null); if (!stat?.isFile() || stat.isSymbolicLink()) fail(file, '$', 'archivo ausente o enlace no permitido'); }
export async function inspect(root = projectRoot, { sync = false } = {}) {
  const directory = path.join(root, 'materials');
  await normalDirectory(directory); await normalDirectory(path.join(directory, 'schema'));
  const schemas = {};
  for (const name of ['source','material','lessons']) { const file = path.join(directory,'schema',name + '.schema.json'); await normalFile(file); schemas[name] = await json(file); checkSchemaSupport(schemas[name], file); }
  await normalFile(path.join(directory,'catalog.json'));
  const catalog = await json(path.join(directory,'catalog.json'));
  const entries = validateCatalog(catalog);
  const packages = new Map();
  for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a,b) => a.name < b.name ? -1 : 1)) {
    if (['catalog.json','schema'].includes(entry.name)) continue;
    if (!MATERIAL_ID.test(entry.name) || !entry.isDirectory() || entry.isSymbolicLink()) fail(directory, entry.name, 'contenido inesperado; solo se admiten carpetas de paquetes');
    const folder = path.join(directory,entry.name);
    const names = await fs.readdir(folder);
    for (const name of names) if (!['source.json','material.json','lessons.json'].includes(name)) fail(folder,name,'archivo adicional no autorizado por el contrato 1.0.0');
    for (const name of ['source.json','material.json','lessons.json']) await normalFile(path.join(folder,name));
    const bundle = { source: await json(path.join(folder,'source.json')), material: await json(path.join(folder,'material.json')), document: await json(path.join(folder,'lessons.json')) };
    packages.set(entry.name, validatePackage(bundle, schemas, entry.name));
  }
  for (const entry of entries) {
    const bundle = packages.get(entry.id);
    if (!bundle) fail('catalog.json',entry.id,'carpeta ausente; no se elimina automáticamente');
    if (!sync) validateEntry(entry,bundle.material);
  }
  return { catalog, entries, packages, candidates: [...packages.keys()].filter(id => !entries.some(e => e.id === id)) };
}
export async function run(args, root = projectRoot, log = console.log) {
  const [command, ...options] = args;
  if (!['check','sync'].includes(command)) throw Error('Uso: node scripts/materials.mjs check | sync --dry-run [--include ID] | sync --include ID');
  let dryRun = false; const include = [];
  for (let i=0; i<options.length; i++) {
    if (options[i] === '--dry-run' && command === 'sync') dryRun = true;
    else if (options[i] === '--include' && command === 'sync' && MATERIAL_ID.test(options[i+1] || '')) include.push(options[++i]);
    else throw Error('Opción no válida: ' + options[i]);
  }
  if (command === 'sync' && !dryRun && !include.length) throw Error('sync requiere --dry-run o IDs explícitos mediante --include');
  const result = await inspect(root, { sync: command === 'sync' });
  for (const [id, bundle] of result.packages) {
    log('OK ' + id + ': ' + bundle.stats.count + ' lecciones; ' + formatDuration(bundle.stats.selectedSeconds) + '; prioritario ' + formatDuration(bundle.stats.prioritySeconds));
    log('  Atribución estructural presente; no certifica título ni autor oficiales.' + (!bundle.source.durationSeconds ? ' Duración completa de la fuente no informada.' : ''));
  }
  log('Candidatos sin incluir: ' + (result.candidates.join(', ') || 'ninguno'));
  if (command === 'check') return result;
  const entries = result.entries.map(entry => ({ ...entry, contentVersion: result.packages.get(entry.id).material.contentVersion }));
  for (const id of [...new Set(include)].sort()) {
    if (!result.packages.has(id)) fail('catalog.json',id,'candidato inexistente');
    if (!entries.some(e => e.id === id)) entries.push({id,manifest:'./'+id+'/material.json',order:Math.max(0,...entries.map(e=>e.order))+1,status:'published',contentVersion:result.packages.get(id).material.contentVersion});
  }
  const next = { schemaVersion: CONTRACT, materials: entries };
  validateCatalog(next);
  const file = path.join(root,'materials/catalog.json');
  const before = await fs.readFile(file,'utf8'), after = JSON.stringify(next,null,2)+'\n';
  log('Catálogo resultante:\n' + after);
  log(before === after ? 'Sin diferencias.' : '--- catalog.json actual\n+++ catalog.json propuesto\n' + before.trimEnd().split('\n').map(l=>'-'+l).join('\n') + '\n' + after.trimEnd().split('\n').map(l=>'+'+l).join('\n'));
  if (!dryRun && before !== after) {
    const temporary = file + '.' + process.pid + '.tmp';
    try {
      await fs.writeFile(temporary,after,{flag:'wx'});
      if (await fs.readFile(file,'utf8') !== before) throw Error('El catálogo cambió durante la validación; no se sobrescribe.');
      await fs.rename(temporary,file);
    } finally { await fs.rm(temporary,{force:true}); }
    log('Catálogo actualizado. No se realizó commit, push ni despliegue.');
  }
  return { ...result, next };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run(process.argv.slice(2)).catch(error => { console.error('ERROR ' + error.message + '\nCatálogo sin cambios.'); process.exitCode = 1; });
