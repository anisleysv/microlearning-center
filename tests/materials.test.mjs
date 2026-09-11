import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { inspect, run, projectRoot } from '../scripts/materials.mjs';
import { parseJson, validatePackage, validateCatalog, validateSchema, checkSchemaSupport } from '../lib/content.mjs';
import { createStateStore } from '../lib/storage.mjs';
const id='youtube-S6up3AnyARo';
const names=['source','material','lessons'];
// Hashes of the authorized files; tests do not depend on the ignored skill folder.
const authorizedSchemaHashes={"source":"b70a41051fb0da126936219f4acf2474522e2f197d59b221fed9089c7245eef8","material":"995867c89d5f397b1d3156596329a19a4ca72deb23455aec7e4fb0b0109d528e","lessons":"fe2ea81d69e15cc4ca8c383978ecbd9c37b75c70000f47523e54fcffe74d7464"};
const schemas=Object.fromEntries(await Promise.all(names.map(async n=>[n,JSON.parse(await fs.readFile(new URL('../materials/schema/'+n+'.schema.json',import.meta.url),'utf8'))])));
const read=async p=>JSON.parse(await fs.readFile(path.join(projectRoot,p),'utf8'));
const original={source:await read('materials/'+id+'/source.json'),material:await read('materials/'+id+'/material.json'),document:await read('materials/'+id+'/lessons.json')};
const clone=()=>structuredClone(original);
const old=execFileSync('git',['show','a8c826966d9e11cd9e23096b5961b08aea558812:app.js'],{cwd:projectRoot,encoding:'utf8'});
const oldLessons=JSON.parse(JSON.stringify(vm.runInNewContext(old.slice(0,old.indexOf('\nlet player;'))+'\nlessons')));
test('exact editorial preservation and required totals',()=>{
 const result=validatePackage(clone(),schemas,id);
 assert.equal(result.stats.count,15);assert.equal(result.stats.selectedSeconds,3496);assert.equal(result.stats.prioritySeconds,1039);
 assert.deepEqual(result.lessons.filter(l=>l.priority==='high').map(l=>l.order),[1,7,10,12,14]);
 const migrated=result.lessons.map(l=>({id:l.order,start:l.startSeconds,end:l.endSeconds,time:oldLessons[l.order-1].time,priority:l.priority==='high',title:l.title,summary:l.summary,takeaways:l.retentionPoints,...(l.prompt!==undefined?{prompt:l.prompt}:{})}));
 assert.deepEqual(migrated,oldLessons);
});
test('schemas are exact copies; all supplied keywords supported',async()=>{
 for(const n of names){assert.equal(createHash('sha256').update(await fs.readFile(path.join(projectRoot,'materials/schema/'+n+'.schema.json'))).digest('hex'),authorizedSchemaHashes[n]);checkSchemaSupport(schemas[n]);}
});
for(const [name,mutate,pattern] of [
 ['incompatible version',b=>b.material.schemaVersion='2.0.0',/schemaVersion/],
 ['duplicate ID',b=>b.document.lessons[1].id=b.document.lessons[0].id,/duplicado/],
 ['wrong source reference',b=>b.material.sourceId='youtube:abcdefghijk',/sourceId/],
 ['wrong file reference',b=>b.material.sourceFile='../source.json',/sourceFile/],
 ['negative interval',b=>b.document.lessons[0].startSeconds=-1,/startSeconds/],
 ['equal interval',b=>b.document.lessons[0].endSeconds=b.document.lessons[0].startSeconds,/endSeconds/],
 ['reversed interval',b=>b.document.lessons[0].endSeconds=1,/endSeconds/],
 ['overlap',b=>b.document.lessons[1].startSeconds=1600,/solapado/],
 ['repeated order',b=>b.document.lessons[1].order=1,/order/],
 ['revision mismatch',b=>b.source.contentVersion=2,/contentVersion/],
 ['invalid priority',b=>b.document.lessons[0].priority=true,/priority/],
 ['missing attribution',b=>delete b.source.attribution.text,/text/],
 ['wrong stable prefix',b=>b.document.lessons[0].id='lesson-01',/estable/],
 ['unsafe tool URL',b=>b.document.lessons[0].tools=[{name:'Tool',url:'javascript:alert(1)'}],/URL web/]
])test(name,()=>{const b=clone();mutate(b);assert.throws(()=>validatePackage(b,schemas,id),pattern);});
test('no high priorities is valid',()=>{const b=clone();b.document.lessons.forEach(l=>l.priority='standard');assert.equal(validatePackage(b,schemas,id).stats.prioritySeconds,0);});
test('JSON corruption and duplicate properties rejected',()=>{assert.throws(()=>parseJson('{','test'),/JSON inválido/);assert.throws(()=>parseJson('{"x":1,"x":2}','test'),/duplicada/);assert.deepEqual(parseJson('{"x":[{},[],{"k":"x"}]}','test'),{x:[{},[],{k:'x'}]});});
test('catalog rejects duplicates and traversal; empty supported',()=>{
 assert.deepEqual(validateCatalog({schemaVersion:'1.0.0',materials:[]}),[]);
 const e={id,manifest:'./'+id+'/material.json',order:1,status:'published',contentVersion:1};
 assert.throws(()=>validateCatalog({schemaVersion:'1.0.0',materials:[e,e]}),/duplicado/);
 assert.throws(()=>validateCatalog({schemaVersion:'1.0.0',materials:[{...e,manifest:'../escape'}]}),/referencia/);
});
async function fixture() {
 const review=path.join(projectRoot,'.local-review');await fs.mkdir(review,{recursive:true});
 const root=await fs.mkdtemp(path.join(review,'validator-'));
 await fs.cp(path.join(projectRoot,'materials'),path.join(root,'materials'),{recursive:true});return root;
}
test('missing file and JSON corruption leave catalog intact',async()=>{
 for(const corrupt of [false,true]){
  const root=await fixture(), catalog=path.join(root,'materials/catalog.json');const before=await fs.readFile(catalog);
  const file=path.join(root,'materials',id,'source.json');if(corrupt)await fs.writeFile(file,'{');else await fs.unlink(file);
  await assert.rejects(run(['sync','--include',id],root,()=>{}),corrupt?/JSON inválido/:/ausente/);
  assert.deepEqual(await fs.readFile(catalog),before);
 }
});
test('absent catalog folder is not removed automatically',async()=>{
 const root=await fixture(),file=path.join(root,'materials/catalog.json');const catalog=JSON.parse(await fs.readFile(file));catalog.materials[0].id='youtube-abcdefghijk';catalog.materials[0].manifest='./youtube-abcdefghijk/material.json';await fs.writeFile(file,JSON.stringify(catalog));
 await assert.rejects(run(['sync','--include',id],root,()=>{}),/carpeta ausente/);
 assert.deepEqual(JSON.parse(await fs.readFile(file)),catalog);
});
test('sync is explicit, deterministic, preserves order and dry-run never writes',async()=>{
 const root=await fixture(),file=path.join(root,'materials/catalog.json');
 const second='youtube-abcdefghijk';const b=JSON.parse(JSON.stringify(original).replaceAll('S6up3AnyARo','abcdefghijk'));await fs.mkdir(path.join(root,'materials',second));
 for(const [name,value]of [['source',b.source],['material',b.material],['lessons',b.document]])await fs.writeFile(path.join(root,'materials',second,name+'.json'),JSON.stringify(value));
 const before=await fs.readFile(file);const dry=await run(['sync','--dry-run'],root,()=>{});assert.deepEqual(await fs.readFile(file),before);assert.equal(dry.next.materials.length,1);assert.deepEqual(dry.candidates,[second]);
 await run(['sync','--dry-run','--include',second],root,()=>{});assert.deepEqual(await fs.readFile(file),before);
 await assert.rejects(run(['sync'],root,()=>{}),/explícitos/);
 await run(['sync','--include',second],root,()=>{});const after=await fs.readFile(file);assert.equal(JSON.parse(after).materials[1].order,2);
 await run(['sync','--include',second],root,()=>{});assert.deepEqual(await fs.readFile(file),after);
});
function storage(seed={}) {const values=new Map(Object.entries(seed));return{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),values};}
const stateKey='microlearning-center:state:v2:'+id;
test('legacy migration deduplicates and only targets original material',()=>{
 const s=storage({'ia58-progress-v1':'[1,1,7,99,"2"]','ia58-favorites-v1':'[7,10]'});const store=createStateStore(()=>s);
 const state=store.load(id,original.document.lessons);assert.equal(state.completed.size,2);assert.equal(state.likes.size,2);assert.ok(s.values.has(stateKey));assert.equal(s.getItem('ia58-progress-v1'),'[1,1,7,99,"2"]');
 const other=store.load('youtube-abcdefghijk',[]);assert.equal(other.completed.size,0);
});
test('v2 is never overwritten by legacy and reset never imports again',()=>{
 const s=storage({'ia58-progress-v1':'[1]'});let store=createStateStore(()=>s),state=store.load(id,original.document.lessons);state.completed.clear();store.save(id,state);
 store=createStateStore(()=>s);assert.equal(store.load(id,original.document.lessons).completed.size,0);
 const before=s.getItem(stateKey);store=createStateStore(()=>s);store.load(id,original.document.lessons);assert.equal(s.getItem(stateKey),before);
});
test('corrupt legacy data and corrupt preexisting v2 are safe',()=>{
 const s=storage({'ia58-progress-v1':'{','ia58-favorites-v1':'42'});assert.equal(createStateStore(()=>s).load(id,original.document.lessons).completed.size,0);
 const t=storage({[stateKey]:'{','ia58-progress-v1':'[1]'});assert.equal(createStateStore(()=>t).load(id,original.document.lessons).completed.size,0);assert.equal(t.getItem(stateKey),'{');
});
test('storage unavailable stays usable in memory including material switches',()=>{
 const store=createStateStore(()=>{throw Error('blocked');});const state=store.load(id,original.document.lessons);state.completed.add(original.document.lessons[0].id);assert.equal(store.save(id,state),false);assert.equal(store.load(id,original.document.lessons).completed.size,1);
});
test('quota failure keeps migrated memory; migration marked only on successful write',()=>{
 const s=storage({'ia58-progress-v1':'[1]'});s.setItem=()=>{throw Error('quota');};const store=createStateStore(()=>s);const state=store.load(id,original.document.lessons);assert.equal(state.completed.size,1);assert.equal(state.persistent,false);assert.equal(s.getItem(stateKey),null);
});
test('global preferences migration preserves theme and speed and existing v2',async()=>{
 const code=await fs.readFile(path.join(projectRoot,'preferences.js'),'utf8'),key='microlearning-center:preferences:v2';
 const s=storage({'ia58-theme-v1':'dark','ia58-speed-v1':'1.75'}),window={};vm.runInNewContext(code,{window,localStorage:s});assert.equal(window.MicrolearningPreferences.get().theme,'dark');assert.equal(window.MicrolearningPreferences.get().playbackSpeed,1.75);
 window.MicrolearningPreferences.update({theme:'light'});assert.equal(JSON.parse(s.getItem(key)).playbackSpeed,1.75);
 window.MicrolearningPreferences.update({playbackSpeed:2});assert.equal(JSON.parse(s.getItem(key)).theme,'light');
 const other={};vm.runInNewContext(code,{window:other,localStorage:s});assert.equal(other.MicrolearningPreferences.get().theme,'light');assert.equal(other.MicrolearningPreferences.get().playbackSpeed,2);
});

test('source attribution and logo remain consistent with published content',()=>{
 const html=execFileSync('git',['show','a8c826966d9e11cd9e23096b5961b08aea558812:index.html'],{cwd:projectRoot,encoding:'utf8'});
 assert.equal(original.source.officialTitle,html.match(/id="sourceTitle">([^<]+)/)[1]);
 assert.equal(original.source.author.name,html.match(/id="sourceAuthor">([^<]+)/)[1]);
 assert.equal(original.material.title,html.match(/<title>Microlearning Center · ([^<]+)/)[1]);
 assert.equal(original.source.attribution.text,html.match(/<footer>\s*<p>([^<]+)/)[1]);
 assert.equal(original.source.author.url,'https://www.youtube.com/@centeia-education');
 const before=execFileSync('git',['show','a8c826966d9e11cd9e23096b5961b08aea558812:assets/branding/microlearning-center-logo.svg'],{cwd:projectRoot});
 const after=execFileSync('git',['hash-object','assets/branding/microlearning-center-logo.svg'],{cwd:projectRoot,encoding:'utf8'}).trim();
 const expected=execFileSync('git',['rev-parse','HEAD:assets/branding/microlearning-center-logo.svg'],{cwd:projectRoot,encoding:'utf8'}).trim();assert.equal(after,expected);assert.ok(before.length>0);
});
test('content revision updates retain the stable lesson state',()=>{
 const s=storage(),first=createStateStore(()=>s);const state=first.load(id,original.document.lessons);state.completed.add(original.document.lessons[0].id);first.save(id,state);
 const revised=clone();revised.source.contentVersion=revised.material.contentVersion=revised.document.contentVersion=2;
 const bundle=validatePackage(revised,schemas,id);assert.equal(createStateStore(()=>s).load(id,bundle.lessons).completed.size,1);
});
test('new schema keywords are rejected instead of silently ignored',()=>{assert.throws(()=>checkSchemaSupport({type:'string',maxLength:3}),/no soportada/);});
