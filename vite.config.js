import { defineConfig } from 'vite';
import { resolve } from 'path';

const rollupOptionsPlugin = {
  name: 'rollup-options-plugin',
  apply: 'build',
  enforce: 'post',
  generateBundle(options, bundle) {
    // If building CJS and this is the CLI, skip it
    if (options.format === 'cjs' && Object.keys(bundle).some(key => key.includes('feed-seeker-cli'))) {
      // Remove CLI from CJS build
      for (const key of Object.keys(bundle)) {
        if (key.includes('feed-seeker-cli')) {
          delete bundle[key];
        }
      }
    }

    // Remove bundled package.json files
    for (const key of Object.keys(bundle)) {
      if (key.includes('package-')) {
        delete bundle[key];
      }
    }
  }
};

export default defineConfig({
  plugins: [rollupOptionsPlugin],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['tests/anchors.test.js', 'tests/anchors-helpers.test.js', 'tests/feed-seeker-cli.test.js', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/'
      ]
    }
  },
  build: {
    // Enable minification with terser for maximum compression
    minify: 'terser',

    // Terser options for extreme minification
    terserOptions: {
      compress: {
        // Maximum compression passes
        passes: 3,
        // Remove console statements
        drop_console: true,
        // Remove debugger statements
        drop_debugger: true,
        // Evaluate constant expressions
        evaluate: true,
        // Inline functions
        inline: true,
        // Join consecutive var statements
        join_vars: true,
        // Collapse single-use variables
        collapse_vars: true,
        // Reduce variables
        reduce_vars: true,
        // Remove unused variables
        unused: true,
        // Remove dead code
        dead_code: true,
        // Optimize if statements
        if_return: true,
        // Evaluate expressions
        conditionals: true,
        // Remove unreachable code
        loops: true,
        // Hoist function declarations
        hoist_funs: true,
        // Hoist variable declarations
        hoist_vars: false,
        // Remove duplicate code
        sequences: true,
        // Optimize property access
        properties: true,
        // Unsafe optimizations (use with caution)
        unsafe: false,
        unsafe_arrows: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_math: false,
        unsafe_symbols: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false
      },
      mangle: {
        // Mangle all names
        toplevel: true,
        // Mangle properties (be careful with this)
        properties: false,
        // Keep class names for better debugging (set to false for more compression)
        keep_classnames: false,
        // Keep function names (set to false for more compression)
        keep_fnames: false
      },
      format: {
        // Remove comments
        comments: false,
        // ASCII only output
        ascii_only: true,
        // Beautify output (set to false for minification)
        beautify: false,
        // Use single quotes
        quote_style: 1
      }
    },

    // Disable source maps for smaller output
    sourcemap: false,

    lib: {
      entry: {
        'feed-seeker': resolve(__dirname, 'feed-seeker.ts'),
        'feed-seeker-cli': resolve(__dirname, 'feed-seeker-cli.ts')
      },
      name: 'FeedSeeker',
      fileName: (format, entryName) => {
        if (entryName === 'feed-seeker-cli') {
          return 'feed-seeker-cli.js'; // Only ES for CLI
        }
        return `feed-seeker.${format === 'es' ? 'js' : 'cjs'}`;
      },
      formats: ['es', 'cjs']
    },

    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020'
      }
    },

    rollupOptions: {
      // Enable tree-shaking
      treeshake: {
        // Maximum tree-shaking
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        // Assume no side effects in annotations
        annotations: true,
        // Unknown globals as false (for better tree-shaking)
        unknownGlobalSideEffects: false
      },

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
        'module',
        'ora',
        'progress-estimator',
        'eta'
      ],

      output: {
        // Compact output
        compact: true,
        // Minify internal export names
        minifyInternalExports: true,
        // Hoist transitive imports
        hoistTransitiveImports: true,
        // Use const instead of var
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          arrowFunctions: true
        },
        globals: {
          linkedom: 'linkedom',
          async: 'async',
          chalk: 'chalk',
          commander: 'commander',
          'isurl-module': 'isurlModule',
          'normalize-url': 'normalizeUrl',
          parse5: 'parse5',
          tldts: 'tldts',
          'truncate-url': 'truncateUrl',
          ora: 'ora',
          'progress-estimator': 'progressEstimator',
          eta: 'eta'
        }
      }
    }
  }
});