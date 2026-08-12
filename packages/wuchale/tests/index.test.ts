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
				'@fernando.mema/sv-wuchale': { locales: ['en', 'es'], adapters: ['svelte'], ai: true }
			}
		}
	],
	filter: (testCase) => testCase.variant.includes('kit'),
	browser: false
});

test.concurrent.for(testCases)('wuchale addon $kind.type $variant', async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const configFile = fs.readFileSync(path.resolve(cwd, 'wuchale.config.js'), 'utf8');
	expect(configFile).toContain('defineConfig');
	expect(configFile).toContain("'en'");
	expect(configFile).toContain("'es'");
	expect(configFile).toContain('OPENCODE_API_KEY');

	const envFile = fs.readFileSync(path.resolve(cwd, '.env'), 'utf8');
	expect(envFile).toContain('OPENCODE_API_KEY');
});
