import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(root, 'public');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${site.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
const robots = `User-agent: *
Allow: /

Sitemap: ${site.url}sitemap.xml
`;

await fs.mkdir(publicDirectory, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(publicDirectory, 'sitemap.xml'), sitemap, 'utf8'),
  fs.writeFile(path.join(publicDirectory, 'robots.txt'), robots, 'utf8')
]);
console.log('SEO metadata generated for ' + site.url);