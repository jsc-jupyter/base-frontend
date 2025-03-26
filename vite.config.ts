/// <reference types="vite/types/importMeta.d.ts" />

import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { Target, viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

// Specify all entry points to generate. The input will be specified as "/templates/{name}.html"
const pages = ['home', 'login'];

// Specify additinal files/directories to copy to the output directory
const additionalFiles: Target[] = [
  { src: 'templates/page.html', dest: '/' },
  { src: 'templates/macros/', dest: '/' },
];

export default defineConfig(({ mode }) => {
  const includeDebugData = mode !== 'production';

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: additionalFiles,
        structured: true,
      }),
      svgr(),
    ],
    publicDir: resolve(__dirname, 'static'),
    build: {
      rollupOptions: {
        input: Object.fromEntries(pages.map(name => [name, resolve(__dirname, 'templates', `${name}.html`)])),
      },
      minify: !includeDebugData,
      sourcemap: includeDebugData,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});
