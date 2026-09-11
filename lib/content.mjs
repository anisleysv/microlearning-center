// Shared by the browser and local CLI. Only contract 1.0.0 is supported.
export const CONTRACT = '1.0.0';
export const MATERIAL_ID = /^youtube-[A-Za-z0-9_-]{11}$/;
export function fail(file, field, reason) { throw new Error(file + ' — ' + field + ': ' + reason); }
export function parseJson(text, file) {
  let value;
  try { value = JSON.parse(text); } catch { fail(file, '$', 'JSON inválido'); }
  // JSON.parse accepts duplicate keys; reject them before interpreting a package.
  const tokens = text.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g) || [];
  let position = 0;
  function walk() {
    const token = tokens[position++];
    if (token === '{') {
      const keys = new Set();
      while (tokens[position] !== '}') {
        const key = JSON.parse(tokens[position++]);
        if (keys.has(key)) fail(file, key, 'clave JSON duplicada');
        keys.add(key); position++; walk();
        if (tokens[position] !== ',') break;
        position++;
      }
      position++;
    } else if (token === '[') {
      while (tokens[position] !== ']') { walk(); if (tokens[position] !== ',') break; position++; }
      position++;
    }
  }
  walk(); return value;
}
const keywords = new Set(['$schema', 'type', 'additionalProperties', 'required', 'properties', 'const', 'minimum', 'minLength', 'pattern', 'format', 'minItems', 'items', 'enum']);
export function checkSchemaSupport(schema, file = 'schema') {
  for (const key of Object.keys(schema)) if (!keywords.has(key)) fail(file, key, 'palabra de esquema no soportada; requiere revisar el validador');
  if (schema.format && !['uri', 'date-time'].includes(schema.format)) fail(file, 'format', 'formato no soportado');
  if (schema.items) checkSchemaSupport(schema.items, file);
  for (const child of Object.values(schema.properties || {})) checkSchemaSupport(child, file);
}
// This interpreter implements every keyword used by the three supplied schemas;
// it is not a general-purpose JSON Schema implementation. Unsupported keywords fail closed.
export function validateSchema(value, schema, file, field = '$') {
  const accepts = type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'integer' ? Number.isSafeInteger(value) : typeof value === type;
  if (schema.type && !(Array.isArray(schema.type) ? schema.type : [schema.type]).some(accepts)) fail(file, field, 'tipo incorrecto');
  if ('const' in schema && value !== schema.const) fail(file, field, 'valor incompatible; se esperaba ' + schema.const);
  if (schema.enum && !schema.enum.includes(value)) fail(file, field, 'valor fuera de la enumeración');
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) fail(file, field, 'valor menor que ' + schema.minimum);
  if (typeof value === 'string') {
    if (schema.minLength && [...value].length < schema.minLength) fail(file, field, 'texto demasiado corto');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(file, field, 'formato de identificador incorrecto');
    if (schema.format === 'uri') { try { new URL(value); } catch { fail(file, field, 'URI inválida'); } }
    if (schema.format === 'date-time' && (!/^\d{4}-\d\d-\d\d[Tt]\d\d:\d\d:\d\d(?:\.\d+)?(?:[Zz]|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value)))) fail(file, field, 'fecha y hora inválidas');
  }
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) fail(file, field, 'faltan elementos');
    if (schema.items) value.forEach((item, i) => validateSchema(item, schema.items, file, field + '[' + i + ']'));
  } else if (value !== null && typeof value === 'object') {
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) fail(file, field + '.' + key, 'campo obligatorio ausente');
    for (const key of Object.keys(value)) {
      if (schema.properties?.[key]) validateSchema(value[key], schema.properties[key], file, field + '.' + key);
      else if (schema.additionalProperties === false) fail(file, field + '.' + key, 'campo no permitido');
    }
  }
}
export function webUrl(value, file, field) {
  let url; try { url = new URL(value); } catch { fail(file, field, 'URL inválida'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail(file, field, 'se requiere una URL web sin credenciales');
  return url;
}
function language(value, file) { try { if (!Intl.getCanonicalLocales(value).length) throw Error(); } catch { fail(file, 'language', 'idioma BCP 47 inválido'); } }
export function validateManifest(material, schemas, file) {
  validateSchema(material, schemas.material, file);
  if (material.sourceId !== 'youtube:' + material.id.slice(8)) fail(file, 'sourceId', 'no coincide con el material');
  language(material.language, file);
}
export function validatePackage(bundle, schemas, folderId = bundle.material.id) {
  const { source, material, document } = bundle;
  const path = folderId + '/';
  validateManifest(material, schemas, path + 'material.json');
  validateSchema(source, schemas.source, path + 'source.json');
  validateSchema(document, schemas.lessons, path + 'lessons.json');
  if (material.id !== folderId || folderId !== 'youtube-' + source.videoId) fail(path, 'id', 'carpeta, material y video no coinciden');
  if (source.id !== 'youtube:' + source.videoId || material.sourceId !== source.id || document.materialId !== material.id) fail(path, 'id', 'referencias de identidad incompatibles');
  if (source.contentVersion !== material.contentVersion || document.contentVersion !== material.contentVersion) fail(path, 'contentVersion', 'las revisiones del paquete no coinciden');
  const official = webUrl(source.url, path + 'source.json', 'url');
  if (official.protocol !== 'https:' || !['www.youtube.com', 'youtube.com'].includes(official.hostname) || official.pathname !== '/watch' || official.searchParams.get('v') !== source.videoId) fail(path + 'source.json', 'url', 'no corresponde a la URL oficial del video');
  const channel = webUrl(source.author.url, path + 'source.json', 'author.url');
  if (channel.protocol !== 'https:' || !['www.youtube.com', 'youtube.com'].includes(channel.hostname) || !/^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)\/?$/.test(channel.pathname)) fail(path + 'source.json', 'author.url', 'se requiere una URL de canal YouTube');
  if (source.attribution.licenseUrl) webUrl(source.attribution.licenseUrl, path + 'source.json', 'attribution.licenseUrl');
  language(source.language, path + 'source.json');
  const ids = new Set();
  const lessons = [...document.lessons].sort((a, b) => a.order - b.order);
  lessons.forEach((lesson, index) => {
    const field = 'lessons[' + document.lessons.indexOf(lesson) + ']';
    if (ids.has(lesson.id)) fail(path + 'lessons.json', field + '.id', 'ID duplicado');
    ids.add(lesson.id);
    const prefix = material.id + '-lesson-';
    if (!lesson.id.startsWith(prefix) || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(lesson.id.slice(prefix.length))) fail(path + 'lessons.json', field + '.id', 'ID estable incompatible con el material');
    if (lesson.order !== index + 1) fail(path + 'lessons.json', field + '.order', 'el orden debe ser único y consecutivo desde 1');
    if (lesson.endSeconds <= lesson.startSeconds) fail(path + 'lessons.json', field + '.endSeconds', 'el final debe ser mayor que el inicio');
    if (index && lesson.startSeconds < lessons[index - 1].endSeconds) fail(path + 'lessons.json', field + '.startSeconds', 'intervalo solapado o no cronológico');
    if (source.durationSeconds && lesson.endSeconds > source.durationSeconds) fail(path + 'lessons.json', field + '.endSeconds', 'supera la duración de la fuente');
    for (const tool of lesson.tools || []) if (tool.url) webUrl(tool.url, path + 'lessons.json', field + '.tools.url');
  });
  const selectedSeconds = lessons.reduce((sum, lesson) => sum + lesson.endSeconds - lesson.startSeconds, 0);
  if (!Number.isSafeInteger(selectedSeconds)) fail(path, 'lessons', 'duración fuera del rango entero seguro');
  return { ...bundle, lessons, stats: { count: lessons.length, selectedSeconds, prioritySeconds: lessons.filter(l => l.priority === 'high').reduce((sum, l) => sum + l.endSeconds - l.startSeconds, 0) } };
}
export function validateCatalog(catalog) {
  const file = 'catalog.json';
  if (!catalog || catalog.schemaVersion !== CONTRACT || !Array.isArray(catalog.materials)) fail(file, '$', 'catálogo o versión incompatible');
  if (Object.keys(catalog).some(k => !['schemaVersion', 'materials'].includes(k))) fail(file, '$', 'campo no permitido');
  const ids = new Set(), orders = new Set();
  catalog.materials.forEach((entry, i) => {
    const field = 'materials[' + i + ']';
    if (!entry || !MATERIAL_ID.test(entry.id)) fail(file, field + '.id', 'identificador inválido');
    if (Object.keys(entry).some(k => !['id','manifest','order','status','contentVersion'].includes(k))) fail(file, field, 'campo no permitido');
    if (ids.has(entry.id) || orders.has(entry.order)) fail(file, field, 'ID u orden duplicado');
    ids.add(entry.id); orders.add(entry.order);
    if (entry.manifest !== './' + entry.id + '/material.json') fail(file, field + '.manifest', 'referencia incorrecta');
    if (entry.status !== 'published' || !Number.isSafeInteger(entry.order) || entry.order < 1 || !Number.isSafeInteger(entry.contentVersion) || entry.contentVersion < 1) fail(file, field, 'estado, orden o revisión inválidos');
  });
  return [...catalog.materials].sort((a,b) => a.order - b.order);
}
export function validateEntry(entry, material) {
  if (entry.id !== material.id || entry.contentVersion !== material.contentVersion) fail('catalog.json', entry.id, 'identidad o revisión diferente del manifiesto');
}
export function formatDuration(seconds) { return String(Math.floor(seconds / 60)).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0'); }
export function formatTimestamp(seconds) { return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2,'0')).join(':'); }
export function intervalLabel(lesson) { return formatTimestamp(lesson.startSeconds) + '–' + formatTimestamp(lesson.endSeconds); }
