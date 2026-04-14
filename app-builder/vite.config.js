import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/asljs/',
  publicDir: '../public',
  server: {
    fs: {
      allow: [ resolve(import.meta.dirname, '..') ],
    },
  },
  build: {
    outDir: '../../docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'src/index.html'),
        app: resolve(import.meta.dirname, 'src/app-builder/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      'asljs-components': resolve(import.meta.dirname, '../components/src/index.ts'),
      'asljs-data-binding': resolve(import.meta.dirname, '../data-binding/src/index.ts'),
      'asljs-observable': resolve(import.meta.dirname, '../observable/src/index.ts'),
      'asljs-eventful': resolve(import.meta.dirname, '../eventful/src/index.ts'),
      'asljs-dali': resolve(import.meta.dirname, '../dali/src/index.ts'),
    },
  },
});
