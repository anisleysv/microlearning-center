import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {inspect} from '../scripts/materials.mjs';
import {libraryEntry,filterLibrary,validateLibraryIndex,normalizeSearch} from '../lib/library.mjs';
import {formatDuration} from '../lib/content.mjs';
const hashes={"source":"af0b59f76a68b280e61e5e1922981af86d31880276caf1855cb05a5ada1e25b2","material":"13b006f5b81276547596d658b9860310825e9037c3d7a870891a493ddc77fdcc","lessons":"bed32297c446e4f82f03c7b8ef2b33c2455bb872f1d40e4bab959bb30cb5e87b"};
const inspection=await inspect();
const index=JSON.parse(await fs.readFile(new URL('../public/materials/library.json',import.meta.url),'utf8'));
const empty={completed:new Set(),likes:new Set()};
const entries=[...inspection.packages.values()].map(bundle=>libraryEntry({bundle},index,empty));
test('approved second package is byte-identical and retains all metrics and lesson 29 safeguard',async()=>{
 for(const name of ['source','material','lessons'])assert.equal(createHash('sha256').update(await fs.readFile(new URL('../public/materials/youtube-6h6306mA3bQ/'+name+'.json',import.meta.url))).digest('hex'),hashes[name]);
 const b=inspection.packages.get('youtube-6h6306mA3bQ');assert.equal(b.lessons.length,30);assert.equal(b.stats.selectedSeconds,4884);assert.equal(b.stats.prioritySeconds,1850);assert.equal(formatDuration(4884),'01:21:24');assert.deepEqual(b.lessons.filter(l=>l.priority==='high').map(l=>l.order),[2,3,5,6,7,11,17,19,20,24,26,27]);assert.match(b.lessons[28].summary,/consentimiento explícito/);
});
test('optional index preserves contract 1.0.0 and derived metrics are calculated',()=>{
 assert.equal(validateLibraryIndex(null).materials.length,0);validateLibraryIndex(index,new Set(inspection.packages.keys()));
 for(const b of inspection.packages.values()){assert.equal(b.material.schemaVersion,'1.0.0');assert.equal(b.source.schemaVersion,'1.0.0');assert.equal(b.document.schemaVersion,'1.0.0');}
 assert.equal(entries.find(e=>e.id==='youtube-S6up3AnyARo').selectedDurationSeconds,3496);
 assert.ok(index.materials.every(m=>!('lessonCount'in m)&&!('selectedDurationSeconds'in m)));
});
test('normalized search matches accents and official/author/lesson fields without inferring topics',()=>{
 assert.equal(normalizeSearch('  VÍDEO '),'video');assert.equal(filterLibrary(entries,{query:'CenteIA'}).length,4);assert.equal(filterLibrary(entries,{query:'CLASE 2:'}).length,1);const hit=filterLibrary(entries,{query:'avatares'});assert.equal(hit.length,1);assert.equal(hit[0].matchingLessons[0].order,29);assert.equal(filterLibrary(entries,{query:'zzzz'}).length,0);
});
test('combined filters and personal progress are material-specific',()=>{
 assert.equal(filterLibrary(entries,{language:'es',topic:'generacion-video',status:'not-started'}).length,1);assert.equal(filterLibrary(entries,{liked:true}).length,0);
 const b=inspection.packages.get('youtube-S6up3AnyARo');const state={completed:new Set([b.lessons[0].id]),likes:new Set([b.lessons[1].id])};const e=libraryEntry({bundle:b},index,state);assert.equal(e.status,'in-progress');assert.equal(filterLibrary([e],{liked:true,status:'in-progress'}).length,1);
 state.completed=new Set(b.lessons.map(l=>l.id));assert.equal(libraryEntry({bundle:b},index,state).status,'completed');
});
test('index rejects unknown topics, duplicate materials and incompatible versions',()=>{
 for(const mutate of [i=>delete i.topics[0].id,i=>i.topics[0].id=1,i=>i.indexVersion=2,i=>i.materials.push(i.materials[0]),i=>i.materials[0].topics=['unknown']]){const data=structuredClone(index);mutate(data);assert.throws(()=>validateLibraryIndex(data,new Set(inspection.packages.keys())));}
});

const newPackageHashes={
  "youtube-2BoTWGq0vjY": {
    "source": "f6ca695332bc29ab22c59446629f1b582238dac822cdec6d145c95fa57629624",
    "material": "0bb11af158eece394950dae2f27b000447c123e0fc04508747019d22bd2608b7",
    "lessons": "6439afb3ccd6a78f774da1a4e4af851fe8505578d3c5c39adba9f9606a110c19"
  },
  "youtube-V60Xr0jbthE": {
    "source": "c07c8ec2b9795cae48a13c98b9312c8ab73d3cd6aefe6d3d75764754f45b8de4",
    "material": "b169ccf16699beb91fde0e4ebfdb65e68740d9df92fc88f48416be516a677413",
    "lessons": "8e9f9af9afe0fb7acd76bf3be7be40288aa9367e8adf6c122b561f8837e0060f"
  }
};

test('lessons 3 and 4 retain approved bytes, exact metrics and approved classification',async()=>{
 for(const [id,count,total,priority,orders] of [['youtube-2BoTWGq0vjY',34,4340,1995,[3,4,5,8,11,13,17,18,19,28,31]],['youtube-V60Xr0jbthE',10,417,255,[1,2,5,8,10]]]){
  for(const name of ['source','material','lessons'])assert.equal(createHash('sha256').update(await fs.readFile(new URL('../public/materials/'+id+'/'+name+'.json',import.meta.url))).digest('hex'),newPackageHashes[id][name]);
  const b=inspection.packages.get(id);assert.equal(b.lessons.length,count);assert.equal(b.stats.selectedSeconds,total);assert.equal(b.stats.prioritySeconds,priority);assert.deepEqual(b.lessons.filter(l=>l.priority==='high').map(l=>l.order),orders);const metadata=index.materials.find(m=>m.id===id);assert.equal(metadata.editorialStatus,'approved');assert.deepEqual(metadata.tags,[]);
 }
 assert.deepEqual(inspection.entries.map(e=>e.id),['youtube-S6up3AnyARo','youtube-6h6306mA3bQ','youtube-2BoTWGq0vjY','youtube-V60Xr0jbthE']);
 for(const id of ['youtube-S6up3AnyARo','youtube-6h6306mA3bQ'])assert.equal(index.materials.find(m=>m.id===id).editorialStatus,'approved');
});
test('all four packages are searchable and new explicit topics combine with personal filters',()=>{
 for(const e of entries){assert.ok(filterLibrary(entries,{query:e.title}).some(r=>r.id===e.id));assert.ok(filterLibrary(entries,{query:e.officialTitle}).some(r=>r.id===e.id));assert.ok(filterLibrary(entries,{query:e.lessons[0].title}).some(r=>r.matchingLessons.some(l=>l.id===e.lessons[0].id)));}
 for(const [topic,id] of [['automatizacion-flujos','youtube-2BoTWGq0vjY'],['aprendizaje-ia','youtube-V60Xr0jbthE']]){assert.deepEqual(filterLibrary(entries,{language:'es',topic,status:'not-started'}).map(e=>e.id),[id]);assert.equal(filterLibrary(entries,{topic,liked:true}).length,0);}
});

test('editorial labels and assignments match human approval exactly',()=>{
 const labels=new Map(index.topics.map(t=>[t.id,t.label]));
 const expected={'youtube-2BoTWGq0vjY':['Productividad con IA','Diseño de prompts','Agentes de IA','Marketing y contenido','Automatización de flujos con IA'],'youtube-V60Xr0jbthE':['Aprendizaje aplicado de IA','Productividad con IA','Diseño de prompts','Agentes de IA']};
 for(const [id,names] of Object.entries(expected)){const m=index.materials.find(m=>m.id===id);assert.deepEqual(m.topics.map(t=>labels.get(t)),names);assert.equal(m.editorialStatus,'approved');assert.deepEqual(m.tags,[]);}
 assert.equal(labels.has('etica-gobernanza'),false);
});
