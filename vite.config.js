import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'feed-seeker.ts'),
        'feed-seeker-cli': resolve(__dirname, 'feed-seeker-cli.ts'),
        'modules/metaLinks': resolve(__dirname, 'modules/metaLinks.ts'),
        'modules/anchors': resolve(__dirname, 'modules/anchors.ts'),
        'modules/blindsearch': resolve(__dirname, 'modules/blindsearch.ts'),
        'modules/deepSearch': resolve(__dirname, 'modules/deepSearch.ts'),
        'modules/eventEmitter': resolve(__dirname, 'modules/eventEmitter.ts'),
        'modules/fetchWithTimeout': resolve(__dirname, 'modules/fetchWithTimeout.ts')
      },
      name: 'FeedSeeker',
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `feed-seeker.${format === 'es' ? 'js' : 'cjs'}`;
        }
        if (entryName === 'feed-seeker-cli') {
          return `feed-seeker-cli.js`;
        }
        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'linkedom',
        'async',
        'chalk',
        'commander',
        'isurl-module',
        'normalize-url',
        'parse5',
        'tldts',
        'truncate-url',
        'node:util',
        'module'
      ],
      output: {
        globals: {
          linkedom: 'linkedom',
          async: 'async',
          chalk: 'chalk',
          commander: 'commander',
          'isurl-module': 'isurlModule',
          'normalize-url': 'normalizeUrl',
          parse5: 'parse5',
          tldts: 'tldts',
          'truncate-url': 'truncateUrl'
        }
      }
    }
  }
});