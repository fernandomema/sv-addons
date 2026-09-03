import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createSetupTest } from 'sv/testing';
import * as vitest from 'vitest';
import addon from '../src/index.js';

const { test, testCases } = createSetupTest(vitest)(
	{ addon },
	{
		kinds: [
			{
				type: 'default',
				options: {
					'@fernando.mema/sv-umami': {
						hostUrl: 'https://cloud.umami.is',
						domains: '',
						tag: '',
						doNotTrack: false,
						server: true
					}
				}
			}
		],
		filter: (testCase) => testCase.variant.includes('kit'),
		browser: false
	}
);

test.concurrent.for(testCases)('umami addon $kind.type $variant', async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const helperFile = fs.readFileSync(path.resolve(cwd, 'src/lib/umami/index.ts'), 'utf8');
	expect(helperFile).toContain('export function track');
	expect(helperFile).toContain('export function identify');
	expect(helperFile).toContain('export function trackByAttr');
	expect(helperFile).toContain("interface Window");
	expect(helperFile).toContain('umami?:');

	const trackerFile = fs.readFileSync(path.resolve(cwd, 'src/lib/umami/Tracker.svelte'), 'utf8');
	expect(trackerFile).toContain('data-website-id');

	const serverFile = fs.readFileSync(
		path.resolve(cwd, 'src/lib/umami/server.ts'),
		'utf8'
	);
	expect(serverFile).toContain('umamiHandle');
	expect(serverFile).toContain('sendEvent');

	const appHtml = fs.readFileSync(path.resolve(cwd, 'src/app.html'), 'utf8');
	expect(appHtml).toContain('data-website-id');
	expect(appHtml).toContain('script.js');

	const envFile = fs.readFileSync(path.resolve(cwd, '.env'), 'utf8');
	expect(envFile).toContain('PUBLIC_UMAMI_WEBSITE_ID');
	expect(envFile).toContain('PUBLIC_UMAMI_SCRIPT_URL');
});
