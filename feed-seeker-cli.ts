#!/usr/bin/env node

import { Command, Option } from 'commander';
import FeedSeeker, { type FeedSeekerOptions } from './feed-seeker.js';
import { styleText } from 'node:util';
import { type Feed } from './modules/metaLinks.js';
import type { StartEventData, EndEventData, LogEventData } from './types/events.js';

// CLI-specific options that extend FeedSeekerOptions
interface CLIOptions extends FeedSeekerOptions {
	displayErrors?: boolean;
}

let counterLength = 0; // needed for fancy blindsearch log display

// Create a gradient banner with tagline
function displayBanner(): void {
	const bannerText = ` \x1b[38;2;255;17;0m_\x1b[0m\x1b[38;2;255;34;0m_\x1b[0m\x1b[38;2;255;51;0m_\x1b[0m\x1b[38;2;255;69;0m_\x1b[0m\x1b[38;2;255;86;0m_\x1b[0m             \x1b[38;2;130;255;0m_\x1b[0m \x1b[38;2;65;255;0m_\x1b[0m\x1b[38;2;32;255;0m_\x1b[0m\x1b[38;2;0;255;0m_\x1b[0m\x1b[38;2;0;220;34m_\x1b[0m                  \x1b[38;2;119;0;179m_\x1b[0m
\x1b[38;2;255;0;0m|\x1b[0m  \x1b[38;2;255;51;0m_\x1b[0m\x1b[38;2;255;69;0m_\x1b[0m\x1b[38;2;255;86;0m_\x1b[0m\x1b[38;2;255;103;0m|\x1b[0m\x1b[38;2;255;120;0m_\x1b[0m\x1b[38;2;255;137;0m_\x1b[0m  \x1b[38;2;255;186;0m_\x1b[0m\x1b[38;2;255;202;0m_\x1b[0m\x1b[38;2;255;219;0m_\x1b[0m  \x1b[38;2;228;255;0m_\x1b[0m\x1b[38;2;195;255;0m_\x1b[0m\x1b[38;2;163;255;0m|\x1b[0m \x1b[38;2;97;255;0m/\x1b[0m \x1b[38;2;32;255;0m_\x1b[0m\x1b[38;2;0;255;0m_\x1b[0m\x1b[38;2;0;220;34m_\x1b[0m\x1b[38;2;0;185;69m|\x1b[0m  \x1b[38;2;0;81;173m_\x1b[0m\x1b[38;2;0;47;207m_\x1b[0m\x1b[38;2;0;12;242m_\x1b[0m \x1b[38;2;15;0;228m_\x1b[0m\x1b[38;2;25;0;212m_\x1b[0m\x1b[38;2;34;0;196m_\x1b[0m  \x1b[38;2;63;0;148m_\x1b[0m   \x1b[38;2;101;0;159m_\x1b[0m\x1b[38;2;110;0;169m|\x1b[0m \x1b[38;2;129;0;190m|\x1b[0m\x1b[38;2;138;0;200m_\x1b[0m
\x1b[38;2;255;0;0m|\x1b[0m \x1b[38;2;255;34;0m|\x1b[0m\x1b[38;2;255;51;0m_\x1b[0m \x1b[38;2;255;86;0m/\x1b[0m \x1b[38;2;255;120;0m_\x1b[0m \x1b[38;2;255;153;0m\\\x1b[0m\x1b[38;2;255;170;0m/\x1b[0m \x1b[38;2;255;202;0m_\x1b[0m \x1b[38;2;255;235;0m\\\x1b[0m\x1b[38;2;255;252;0m/\x1b[0m \x1b[38;2;195;255;0m_\x1b[0m\x1b[38;2;163;255;0m\`\x1b[0m \x1b[38;2;97;255;0m\\\x1b[0m\x1b[38;2;65;255;0m_\x1b[0m\x1b[38;2;32;255;0m_\x1b[0m\x1b[38;2;0;255;0m_\x1b[0m \x1b[38;2;0;185;69m\\\x1b[0m \x1b[38;2;0;116;138m/\x1b[0m \x1b[38;2;0;47;207m_\x1b[0m\x1b[38;2;0;12;242m_\x1b[0m\x1b[38;2;6;0;244m/\x1b[0m \x1b[38;2;25;0;212m_\x1b[0m \x1b[38;2;44;0;180m\\\x1b[0m\x1b[38;2;54;0;164m|\x1b[0m \x1b[38;2;73;0;132m|\x1b[0m \x1b[38;2;91;0;148m|\x1b[0m \x1b[38;2;110;0;169m|\x1b[0m \x1b[38;2;129;0;190m_\x1b[0m\x1b[38;2;138;0;200m_\x1b[0m\x1b[38;2;148;0;211m|\x1b[0m
\x1b[38;2;255;0;0m|\x1b[0m  \x1b[38;2;255;51;0m_\x1b[0m\x1b[38;2;255;69;0m|\x1b[0m  \x1b[38;2;255;120;0m_\x1b[0m\x1b[38;2;255;137;0m_\x1b[0m\x1b[38;2;255;153;0m/\x1b[0m  \x1b[38;2;255;202;0m_\x1b[0m\x1b[38;2;255;219;0m_\x1b[0m\x1b[38;2;255;235;0m/\x1b[0m \x1b[38;2;228;255;0m(\x1b[0m\x1b[38;2;195;255;0m_\x1b[0m\x1b[38;2;163;255;0m|\x1b[0m \x1b[38;2;97;255;0m|\x1b[0m\x1b[38;2;65;255;0m_\x1b[0m\x1b[38;2;32;255;0m_\x1b[0m\x1b[38;2;0;255;0m_\x1b[0m\x1b[38;2;0;220;34m)\x1b[0m \x1b[38;2;0;151;103m|\x1b[0m \x1b[38;2;0;81;173m(\x1b[0m\x1b[38;2;0;47;207m_\x1b[0m\x1b[38;2;0;12;242m|\x1b[0m \x1b[38;2;15;0;228m(\x1b[0m\x1b[38;2;25;0;212m_\x1b[0m\x1b[38;2;34;0;196m)\x1b[0m \x1b[38;2;54;0;164m|\x1b[0m \x1b[38;2;73;0;132m|\x1b[0m\x1b[38;2;82;0;138m_\x1b[0m\x1b[38;2;91;0;148m|\x1b[0m \x1b[38;2;110;0;169m|\x1b[0m \x1b[38;2;129;0;190m|\x1b[0m\x1b[38;2;138;0;200m_\x1b[0m
\x1b[38;2;255;0;0m|\x1b[0m\x1b[38;2;255;17;0m_\x1b[0m\x1b[38;2;255;34;0m|\x1b[0m  \x1b[38;2;255;86;0m\\\x1b[0m\x1b[38;2;255;103;0m_\x1b[0m\x1b[38;2;255;120;0m_\x1b[0m\x1b[38;2;255;137;0m_\x1b[0m\x1b[38;2;255;153;0m|\x1b[0m\x1b[38;2;255;170;0m\\\x1b[0m\x1b[38;2;255;186;0m_\x1b[0m\x1b[38;2;255;202;0m_\x1b[0m\x1b[38;2;255;219;0m_\x1b[0m\x1b[38;2;255;235;0m|\x1b[0m\x1b[38;2;255;252;0m\\\x1b[0m\x1b[38;2;228;255;0m_\x1b[0m\x1b[38;2;195;255;0m_\x1b[0m\x1b[38;2;163;255;0m,\x1b[0m\x1b[38;2;130;255;0m_\x1b[0m\x1b[38;2;97;255;0m|\x1b[0m\x1b[38;2;65;255;0m_\x1b[0m\x1b[38;2;32;255;0m_\x1b[0m\x1b[38;2;0;255;0m_\x1b[0m\x1b[38;2;0;220;34m_\x1b[0m\x1b[38;2;0;185;69m/\x1b[0m \x1b[38;2;0;116;138m\\\x1b[0m\x1b[38;2;0;81;173m_\x1b[0m\x1b[38;2;0;47;207m_\x1b[0m\x1b[38;2;0;12;242m_\x1b[0m\x1b[38;2;6;0;244m\\\x1b[0m\x1b[38;2;15;0;228m_\x1b[0m\x1b[38;2;25;0;212m_\x1b[0m\x1b[38;2;34;0;196m_\x1b[0m\x1b[38;2;44;0;180m/\x1b[0m \x1b[38;2;63;0;148m\\\x1b[0m\x1b[38;2;73;0;132m_\x1b[0m\x1b[38;2;82;0;138m_\x1b[0m\x1b[38;2;91;0;148m,\x1b[0m\x1b[38;2;101;0;159m_\x1b[0m\x1b[38;2;110;0;169m|\x1b[0m\x1b[38;2;119;0;179m\\\x1b[0m\x1b[38;2;129;0;190m_\x1b[0m\x1b[38;2;138;0;200m_\x1b[0m\x1b[38;2;148;0;211m|\x1b[0m

     \x1b[1;31m---> On the trail of every feed <---\x1b[0m`;

	console.log(`${bannerText}\n`);
}

function start(...args: unknown[]): void {
	const data = args[0] as StartEventData;
	process.stdout.write(`Starting ${data.niceName} `);
}

function end(...args: unknown[]): void {
	const data = args[0] as EndEventData;
	if (data.feeds.length === 0) {
		process.stdout.write(styleText('yellow', ' No feeds found.\n'));
	} else {
		process.stdout.write(styleText('green', ` Found ${data.feeds.length} feeds.\n`));
	}
}

async function log(...args: unknown[]): Promise<void> {
	const data = args[0] as LogEventData;
	if (data.module === 'metalinks') {
		process.stdout.write('.');
	}
	if (data.module === 'blindsearch' || data.module === 'anchors') {
		if ('totalCount' in data && 'totalEndpoints' in data) {
			process.stdout.write(`\x1b[${counterLength}D`);
			const counter = ` (${data.totalCount}/${data.totalEndpoints})`;
			process.stdout.write(counter);
			counterLength = counter.length;
		}
	}
	if (data.module === 'deepSearch') {
		// Display deep search progress: [depth/processed+remaining] current-url
		if ('url' in data && 'depth' in data && 'progress' in data) {
			const progress = data.progress as Record<string, number>;
			const processed = progress.processed || 0;
			const remaining = progress.remaining || 0;
			const total = processed + remaining;

			// Extract domain from URL for cleaner display
			try {
				const urlObj = new URL(data.url as string);
				const domain = urlObj.hostname;
				const path = urlObj.pathname.length > 30 ? urlObj.pathname.substring(0, 27) + '...' : urlObj.pathname;
				const displayUrl = `${domain}${path}`;

				// Log on a new line
				process.stdout.write(`  [depth:${data.depth} ${processed}/${total}] ${displayUrl}\n`);
			} catch {
				// Fallback if URL parsing fails
				process.stdout.write(`  [depth:${data.depth} ${processed}/${total}]\n`);
			}
		}
	}
}

interface FeedFinderWithError extends FeedSeeker {
	initializationError?: boolean;
}

function initializeFeedFinder(site: string, options: FeedSeekerOptions): FeedFinderWithError {
	const FeedFinder = new FeedSeeker(site, options) as FeedFinderWithError;
	FeedFinder.site = site;
	FeedFinder.options = options;
	FeedFinder.initializationError = false;

	FeedFinder.on('start', start);
	FeedFinder.on('log', log);
	FeedFinder.on('end', end);

	// Add error handler to provide user-friendly error messages with site name
	FeedFinder.on('error', (...args: unknown[]) => {
		const errorData = args[0];

		// Check if this is an initialization error (from FeedSeeker module)
		if (typeof errorData === 'object' && errorData !== null) {
			const obj = errorData as Record<string, unknown>;
			if (obj.module === 'FeedSeeker') {
				FeedFinder.initializationError = true;
			}
		}

		// Handle both Error objects and error event objects
		if (errorData instanceof Error) {
			console.error(styleText('red', `\nError for ${site}: ${errorData.message}`));
		} else if (typeof errorData === 'object' && errorData !== null) {
			const obj = errorData as Record<string, unknown>;
			const errorMessage = typeof obj.error === 'string' ? obj.error : String(errorData);
			console.error(styleText('red', `\nError for ${site}: ${errorMessage}`));
		} else {
			console.error(styleText('red', `\nError for ${site}: ${String(errorData)}`));
		}
	});

	return FeedFinder;
}

async function getFeeds(site: string, options: FeedSeekerOptions): Promise<Feed[]> {
	// Add https:// if no protocol is specified
	if (!site.includes('://')) {
		site = `https://${site}`;
	}

	const FeedFinder = initializeFeedFinder(site, options);

	// Initialize the site first to check for errors
	await FeedFinder.initialize();

	// If initialization failed, return empty array and don't continue searching
	if (FeedFinder.initializationError) {
		return [];
	}

	// Build strategies array based on CLI options
	const strategies: Array<() => Promise<Feed[]>> = [];

	// If specific strategies are requested, use only those
	if (options.metasearch) {
		strategies.push(() => FeedFinder.metaLinks());
	} else if (options.anchorsonly) {
		strategies.push(() => FeedFinder.checkAllAnchors());
	} else if (options.blindsearch) {
		strategies.push(() => FeedFinder.blindSearch());
	} else if (options.deepsearchOnly) {
		strategies.push(() => FeedFinder.deepSearch());
	} else {
		// Default: try all strategies in order
		strategies.push(() => FeedFinder.metaLinks());
		strategies.push(() => FeedFinder.checkAllAnchors());
		strategies.push(() => FeedFinder.blindSearch());

		// Add deep search if enabled
		if (options.deepsearch) {
			strategies.push(() => FeedFinder.deepSearch());
		}
	}

	const findfeeds = async (): Promise<Feed[]> => {
		for (const strategy of strategies) {
			const feeds = await strategy();
			if (feeds.length > 0) return feeds;
		}
		return []; // no feeds found
	};

	const feeds = await findfeeds();
	return feeds;
}

// Extended program type to store feeds
interface ExtendedCommand extends Command {
	feeds?: Feed[];
}

// =======================================================================================================
displayBanner();

const program: ExtendedCommand = new Command();
program.name(`feed-seeker`).description('Find RSS, Atom, and JSON feeds on any website with FeedSeeker.');
program
	.command('version')
	.description('Get version')
	.action(async () => {
		const packageModule = await import('./package.json', { assert: { type: 'json' } });
		const packageConfig = packageModule.default;
		process.stdout.write(`${packageConfig.version}\n`);
	});

program
	.argument('[site]', 'The website URL to search for feeds')
	.option('-m, --metasearch', 'Meta search only')
	.option('-b, --blindsearch', 'Blind search only')
	.option('-a, --anchorsonly', 'Anchors search only')
	.option('-d, --deepsearch', 'Enable deep search')
	.option('--deepsearch-only', 'Deep search only')
	.option('--depth <number>', 'Depth of deep search', (val: string): number => {
		const num = parseInt(val, 10);
		if (isNaN(num) || num < 1) {
			throw new Error('Depth must be a positive number (minimum 1)');
		}
		return num;
	}, 3)
	.option('--max-links <number>', 'Maximum number of links to process during deep search', (val: string): number => {
		const num = parseInt(val, 10);
		if (isNaN(num) || num < 1) {
			throw new Error('Max links must be a positive number (minimum 1)');
		}
		return num;
	}, 1000)
	.option('--timeout <seconds>', 'Timeout for fetch requests in seconds', (val: string): number => {
		const num = parseInt(val, 10);
		if (isNaN(num) || num < 1) {
			throw new Error('Timeout must be a positive number (minimum 1 second)');
		}
		return num;
	}, 5)
	.option('--keep-query-params', 'Keep query parameters from the original URL when searching')
	.option('--check-foreign-feeds', "Check if foreign domain URLs are feeds (but don't crawl them)")
	.option('--max-errors <number>', 'Stop after a certain number of errors', (val: string): number => {
		const num = parseInt(val, 10);
		if (isNaN(num) || num < 0) {
			throw new Error('Max errors must be a non-negative number');
		}
		return num;
	}, 5)
	.option('--max-feeds <number>', 'Stop search after finding a certain number of feeds', (val: string): number => {
		const num = parseInt(val, 10);
		if (isNaN(num) || num < 0) {
			throw new Error('Max feeds must be a non-negative number');
		}
		return num;
	}, 0)
	.description('Find feeds for site\n')
	.action(async (site: string, options: CLIOptions) => {
		if (!site) {
			program.help();
			process.exit(0);
		}
		try {
			// Store the result directly on the program object
			program.feeds = await getFeeds(site, options);
		} catch (error) {
			if (options.displayErrors) {
				console.error('\nError details:', error);
			} else {
				const err = error as Error;
				console.error(styleText('red', `\nError: ${err.message}`));
			}
			process.exit(1);
		}
	});

// add hidden option '--display-errors' to program
program.addOption(new Option('--display-errors', 'Display errors').hideHelp());

// execute program
program.parseAsync(process.argv)
	.then(() => {
		if (program.feeds !== undefined) {
			console.log(program.feeds);
		}
	})
	.catch((error) => {
		const err = error as Error;
		console.error(styleText('red', `\nError: ${err.message}`));
		process.exit(1);
	});
