#!/usr/bin/env node

import { Command, Option } from 'commander';
import FeedScout, { type FeedScoutOptions } from './feed-scout.js';
import { createRequire } from 'module';
import { styleText } from 'node:util';
import { type Feed } from './modules/metaLinks.js';

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

function start(data: any): void {
	process.stdout.write(`Starting ${data.niceName} `);
}

function end(data: { feeds: Feed[] }): void {
	if (data.feeds.length === 0) {
		process.stdout.write(styleText('yellow', ' No feeds found.\n'));
	} else {
		process.stdout.write(styleText('green', ` Found ${data.feeds.length} feeds.\n`));
	}
}

async function log(data: any): Promise<void> {
	if (data.module === 'metalinks') {
		process.stdout.write('.');
	}
	if (data.module === 'blindsearch' || data.module === 'anchors') {
		process.stdout.write(`\x1b[${counterLength}D`);
		const counter = ` (${data.totalCount}/${data.totalEndpoints})`;
		process.stdout.write(counter);
		counterLength = counter.length;
	}
}

function initializeFeedFinder(site: string, options: FeedScoutOptions): FeedScout {
	const FeedFinder = new FeedScout(site, options);
	FeedFinder.site = site;
	FeedFinder.options = options;

	FeedFinder.on('start', start);
	FeedFinder.on('log', log);
	FeedFinder.on('end', end);

	return FeedFinder;
}

async function getFeeds(site: string, options: FeedScoutOptions): Promise<Feed[]> {
	// Add https:// if no protocol is specified
	if (!site.includes('://')) {
		site = `https://${site}`;
	}

	const FeedFinder = initializeFeedFinder(site, options);
	const strategies = [() => FeedFinder.metaLinks(), () => FeedFinder.checkAllAnchors(), () => FeedFinder.blindSearch()];

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
program.name(`feed-scout`).description('Find RSS, Atom, and JSON feeds on any website with FeedScout.');
program
	.command('version')
	.description('Get version')
	.action(() => {
		const require = createRequire(import.meta.url);
		const packageConfig = require('./package.json');
		process.stdout.write(`${packageConfig.version}\n`);
	});

program
	.argument('[site]', 'The website URL to search for feeds')
	.option('-m, --metasearch', 'Meta search only')
	.option('-b, --blindsearch', 'Blind search only')
	.option('-a, --anchorsonly', 'Anchors search only')
	.option('-d, --deepsearch', 'Enable deep search')
	.option('--deepsearch-only', 'Deep search only')
	.option('--depth <number>', 'Depth of deep search', '3')
	.option('--max-links <number>', 'Maximum number of links to process during deep search', '1000')
	.option('--timeout <seconds>', 'Timeout for fetch requests in seconds', '5')
	.option('--keep-query-params', 'Keep query parameters from the original URL when searching')
	.option('--check-foreign-feeds', "Check if foreign domain URLs are feeds (but don't crawl them)")
	.option('--max-errors <number>', 'Stop after a certain number of errors', '5')
	.option('--max-feeds <number>', 'Stop search after finding a certain number of feeds', '0')
	.description('Find feeds for site\n')
	.action(async (site: string, options: FeedScoutOptions) => {
		if (!site) {
			program.help();
		} else {
			// Store the result directly on the program object
			program.feeds = await getFeeds(site, options);
		}
	});

// add hidden option '--display-errors' to program
program.addOption(new Option('--display-errors', 'Display errors').hideHelp());

// exceute program
program.parseAsync(process.argv).then(() => {
	console.log(program.feeds);
});
