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
				'@fernando.mema/sv-iconify-tailwind4': { iconSets: ['tabler'], prefix: 'i' }
			}
		}
	],
	filter: (testCase) => testCase.variant.includes('kit'),
	browser: false
});

test.concurrent.for(testCases)('iconify-tailwind4 addon $kind.type $variant', async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const cssFile = fs.readFileSync(path.resolve(cwd, 'src/routes/layout.css'), 'utf8');
	expect(cssFile).toContain('@plugin "@iconify/tailwind4"');

	const iconComponent = fs.readFileSync(path.resolve(cwd, 'src/lib/components/Icon.svelte'), 'utf8');
	expect(iconComponent).toContain('name');
});
