import { resolve }
  from 'path';
import { defineConfig }
  from 'vite';

export default defineConfig(
  { root: 'src',
    base: '/asljs/',
    publicDir: '../public',
    server: {
      fs: {
        allow: [
          resolve(
            import.meta.dirname,
            '../..')
          ]
      }
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main:
            resolve(
              import.meta.dirname,
              'src/index.html'),
          app:
            resolve(
              import.meta.dirname,
              'src/app-builder/index.html')
        }
      }
    },
    resolve: {
      alias: {
        'asljs-components':
          resolve(
            import.meta.dirname,
            '../../libs/components/src/index.ts'),
        'asljs-data-binding':
          resolve(
            import.meta.dirname,
            '../../libs/data-binding/src/index.ts'),
        'asljs-observable':
          resolve(
            import.meta.dirname,
            '../../libs/observable/src/index.ts'),
        'asljs-eventful':
          resolve(
            import.meta.dirname,
            '../../libs/eventful/src/index.ts'),
        'asljs-dali':
          resolve(
            import.meta.dirname,
            '../../libs/dali/src/index.ts')
      }
    }
  });
