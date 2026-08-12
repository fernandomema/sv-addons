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
				'@fernando.mema/sv-prisma': { dialect: 'postgresql', adapter: 'none', output: 'src/lib/generated/prisma' }
			}
		}
	],
	filter: (testCase) => testCase.variant.includes('kit'),
	browser: false
});

test.concurrent.for(testCases)('prisma addon $kind.type $variant', async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const dbFile = fs.readFileSync(path.resolve(cwd, 'src/lib/server/db.ts'), 'utf8');
	expect(dbFile).toContain('PrismaClient');

	const envFile = fs.readFileSync(path.resolve(cwd, '.env'), 'utf8');
	expect(envFile).toContain('DATABASE_URL');

	const schemaFile = fs.readFileSync(path.resolve(cwd, 'prisma/schema.prisma'), 'utf8');
	expect(schemaFile).toContain('generator client');
	expect(schemaFile).toContain('datasource db');
});
