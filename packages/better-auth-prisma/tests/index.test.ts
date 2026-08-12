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
				'@fernando.mema/sv-better-auth-prisma': { admin: true, demo: ['password'] }
			}
		}
	],
	filter: (testCase) => testCase.variant.includes('kit'),
	browser: false
});

test.concurrent.for(testCases)('better-auth-prisma addon $kind.type $variant', async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const authFile = fs.readFileSync(path.resolve(cwd, 'src/lib/server/auth.ts'), 'utf8');
	expect(authFile).toContain('betterAuth');
	expect(authFile).toContain('prismaAdapter');

	const envFile = fs.readFileSync(path.resolve(cwd, '.env'), 'utf8');
	expect(envFile).toContain('BETTER_AUTH_SECRET');
	expect(envFile).toContain('ORIGIN');
});
