import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createSetupTest } from 'sv/testing';
import * as vitest from 'vitest';
import addon from '../src/index.js';

const { test, testCases } = createSetupTest(vitest)({ addon }, {
	kinds: [
		{
			type: 'default',
			options: {
				'@fernando.mema/sv-sentry': { browser: true, server: true, replays: false }
			}
		}
	],
	filter: (testCase) => testCase.variant.includes('kit'),
	browser: false
});

test.concurrent.for(testCases)('sentry addon $kind.type $variant', async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const clientFile = fs.readFileSync(path.resolve(cwd, 'src/lib/sentry.client.ts'), 'utf8');
	expect(clientFile).toContain('Sentry.init');

	const serverFile = fs.readFileSync(path.resolve(cwd, 'src/lib/sentry.server.ts'), 'utf8');
	expect(serverFile).toContain('Sentry.init');

	const envFile = fs.readFileSync(path.resolve(cwd, '.env'), 'utf8');
	expect(envFile).toContain('PUBLIC_SENTRY_DSN');
});
