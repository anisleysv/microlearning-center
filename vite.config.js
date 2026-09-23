import { defineConfig } from 'vite';

export default defineConfig({
  // Relative URLs make one static build work on DigitalOcean and GitHub Pages.
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});