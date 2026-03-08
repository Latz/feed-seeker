import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'text-summary'],
			reportsDirectory: 'coverage',
			include: ['feed-seeker.ts', 'modules/**/*.ts'],
			exclude: ['modules/banner.ts'],
		},
	},
});
