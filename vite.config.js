import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync, chmodSync, readdirSync, unlinkSync } from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'feed-seeker.ts'),
        cli: resolve(__dirname, 'feed-seeker-cli.ts')
      },
      name: 'FeedSeeker',
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `feed-seeker.${format === 'es' ? 'js' : 'cjs'}`;
        }
        if (entryName === 'cli') {
          return `feed-seeker-cli.${format === 'es' ? 'js' : 'cjs'}`;
        }
        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'linkedom',
        'async',
        'isurl-module',
        'normalize-url',
        'parse5',
        'tldts',
        'truncate-url',
        'node:events',
        'node:path',
        'node:fs',
        'node:process',
        'node:child_process',
        'node:util',
        'node:stream',
        'fs',
        'path',
        'url'
      ],
      output: {
        globals: {
          linkedom: 'linkedom',
          async: 'async',
          chalk: 'chalk',
          'isurl-module': 'isurlModule',
          'normalize-url': 'normalizeUrl',
          parse5: 'parse5',
          tldts: 'tldts',
          'truncate-url': 'truncateUrl'
        }
      }
    }
  },
  plugins: [
    {
      name: 'add-shebang-and-cleanup',
      closeBundle() {
        const cliPath = resolve(__dirname, 'dist/feed-seeker-cli.cjs');
        const content = readFileSync(cliPath, 'utf-8');
        if (!content.startsWith('#!/usr/bin/env node')) {
          writeFileSync(cliPath, '#!/usr/bin/env node\n' + content, 'utf-8');
        }
        // Make the CLI executable (755 permissions)
        chmodSync(cliPath, 0o755);

        // Remove unnecessary package files that Vite generates
        const distDir = resolve(__dirname, 'dist');
        const files = readdirSync(distDir);
        files.forEach(file => {
          if (file.startsWith('package-') && (file.endsWith('.js') || file.endsWith('.cjs'))) {
            const filePath = resolve(distDir, file);
            unlinkSync(filePath);
          }
        });
      }
    }
  ]
});