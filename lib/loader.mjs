import { validateLibraryIndex } from './library.mjs';
import { parseJson, checkSchemaSupport, validateCatalog, validateManifest, validateEntry, validatePackage } from './content.mjs';
export const catalogUrl = new URL('./materials/catalog.json', document.baseURI);
export async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw Error(url.pathname + ': HTTP ' + response.status);
  return parseJson(await response.text(), url.pathname);
}
export async function loadLibrary(signal) {
  const [catalog, ...values] = await Promise.all([fetchJson(catalogUrl,signal), ...['source','material','lessons'].map(name=>fetchJson(new URL('./schema/'+name+'.schema.json',catalogUrl),signal))]);
  const schemas = Object.fromEntries(['source','material','lessons'].map((name,i)=>[name,values[i]]));
  for (const [name,schema] of Object.entries(schemas)) checkSchemaSupport(schema,name+'.schema.json');
  const entries = validateCatalog(catalog);
  const materials = await Promise.all(entries.map(async entry => {
    const manifestUrl = new URL(entry.manifest,catalogUrl);
    const material = await fetchJson(manifestUrl,signal);
    validateManifest(material,schemas,entry.manifest); validateEntry(entry,material);
    return { entry, material, manifestUrl };
  }));
  const response = await fetch(new URL('./library.json',catalogUrl),{signal,cache:'no-cache'});
  if (!response.ok && response.status !== 404) throw Error('library.json: HTTP '+response.status);
  const index = validateLibraryIndex(response.status===404 ? null : parseJson(await response.text(),'library.json'));
  // Search uses validated package data, never inferred topics or duplicated metrics.
  await Promise.all(materials.map(async item=>{ item.bundle = await loadPackage(item,schemas,signal); }));
  return { materials, schemas, index };
}
export async function loadPackage(item, schemas, signal) {
  // Read the manifest again so a cached menu cannot silently mix content revisions.
  const material = await fetchJson(item.manifestUrl,signal);
  validateManifest(material,schemas,item.entry.manifest); validateEntry(item.entry,material);
  const [source, document] = await Promise.all([fetchJson(new URL(material.sourceFile,item.manifestUrl),signal),fetchJson(new URL(material.lessonsFile,item.manifestUrl),signal)]);
  return validatePackage({source,material,document},schemas,item.entry.id);
}
