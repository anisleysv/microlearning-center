import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFile(path.join(root, file), 'utf8');
const [html, robots, sitemap] = await Promise.all([
  read('index.html'),
  read('public/robots.txt'),
  read('public/sitemap.xml')
]);
const requiredHtml = [
  `<link rel="canonical" href="${site.url}" />`,
  '<meta property="og:type" content="website" />',
  `<meta property="og:url" content="${site.url}" />`,
  '<meta name="twitter:card" content="summary" />'
];
for (const value of requiredHtml) if (!html.includes(value)) throw Error('Missing required page metadata: ' + value);
if (!robots.includes('Sitemap: ' + site.url + 'sitemap.xml')) throw Error('robots.txt does not reference the canonical sitemap.');
if (!sitemap.includes('<loc>' + site.url + '</loc>')) throw Error('sitemap.xml does not reference the canonical site URL.');
console.log('SEO metadata validation passed.');