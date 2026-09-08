import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { add } from 'sv';
import { addPnpmBuildDependencies, createProject, setup } from 'sv/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import addon from '../src/index.js';

const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-prisma-test-'));
const testName = 'prisma';

type Case = {
	id: string;
	variant: 'kit-js' | 'kit-ts' | 'vite-js' | 'vite-ts';
	options: Record<string, unknown>;
};

const cases: Case[] = [
	{
		id: 'kit-ts-default',
		variant: 'kit-ts',
		options: { dialect: 'postgresql', adapter: 'none', output: 'src/lib/generated/prisma' }
	},
	{
		id: 'kit-ts-pg',
		variant: 'kit-ts',
		options: { dialect: 'postgresql', adapter: 'pg', output: 'src/lib/generated/prisma' }
	},
	{
		id: 'kit-ts-mariadb',
		variant: 'kit-ts',
		options: { dialect: 'mysql', adapter: 'mariadb', output: 'src/lib/generated/prisma' }
	},
	{
		id: 'kit-ts-libsql',
		variant: 'kit-ts',
		options: { dialect: 'postgresql', adapter: 'libsql', output: 'src/lib/generated/prisma' }
	},
	{
		id: 'kit-ts-sqlite',
		variant: 'kit-ts',
		options: { dialect: 'sqlite', adapter: 'none', output: 'src/lib/generated/prisma' }
	},
	{
		id: 'kit-js-default',
		variant: 'kit-js',
		options: { dialect: 'postgresql', adapter: 'none', output: 'src/lib/generated/prisma' }
	}
];

const variants = Array.from(new Set(cases.map((c) => c.variant)));

const { templatesDir } = setup({
	cwd: TEST_DIR,
	clean: false,
	variants
});
const create = createProject({ cwd: TEST_DIR, testName, templatesDir });

let projectCwds: Record<string, string> = {};

beforeAll(async () => {
	const root = path.resolve(TEST_DIR, testName);
	fs.mkdirSync(root, { recursive: true });
	fs.writeFileSync(
		path.resolve(root, 'pnpm-workspace.yaml'),
		'packages:\n  - \'**/*\'',
		'utf8'
	);
	fs.writeFileSync(
		path.resolve(root, 'package.json'),
		JSON.stringify({ name: `${testName}-workspace-root`, private: true }),
		'utf8'
	);

	for (const c of cases) {
		const cwd = create({ testId: c.id, variant: c.variant });
		projectCwds[c.id] = cwd;

		const { pnpmBuildDependencies } = await add({
			cwd,
			addons: { addon },
			options: {
				prisma: c.options
			} as never,
			packageManager: 'pnpm'
		});
		await addPnpmBuildDependencies(cwd, 'pnpm', ['esbuild', ...pnpmBuildDependencies]);
	}

	execSync('pnpm install', { cwd: root, stdio: 'pipe' });
}, 600_000);

afterAll(() => {
	fs.rmSync(TEST_DIR, { force: true, recursive: true });
});

function read(cwd: string, rel: string): string {
	return fs.readFileSync(path.resolve(cwd, rel), 'utf8');
}

describe('prisma addon (default: postgresql, no adapter)', () => {
	const cwd = () => projectCwds['kit-ts-default'];

	it('writes DATABASE_URL to .env and .env.example', () => {
		const env = read(cwd(), '.env');
		const envEx = read(cwd(), '.env.example');
		expect(env).toContain('DATABASE_URL=');
		expect(env).toContain(
			'DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"'
		);
		expect(envEx).toContain('DATABASE_URL=""');
		expect(env).not.toContain('TURSO_AUTH_TOKEN=');
	});

	it('creates prisma/schema.prisma with v8 prisma-client generator + output', () => {
		const schema = read(cwd(), 'prisma/schema.prisma');
		expect(schema).toContain('provider = "prisma-client"');
		expect(schema).toContain('output   = "../src/lib/generated/prisma"');
		expect(schema).toContain('provider = "postgresql"');
	});

	it('creates prisma.config.ts using defineConfig + env()', () => {
		const cfg = read(cwd(), 'prisma.config.ts');
		expect(cfg).toContain("import { defineConfig, env } from 'prisma/config'");
		expect(cfg).toContain("import 'dotenv/config'");
		expect(cfg).toContain("url: env('DATABASE_URL')");
		expect(cfg).not.toContain('directUrl');
	});

	it('creates a PrismaClient singleton without an adapter', () => {
		const db = read(cwd(), 'src/lib/server/db.ts');
		expect(db).toContain("from '../generated/prisma/client'");
		expect(db).toContain('new PrismaClient()');
		expect(db).not.toContain('@prisma/adapter-');
		expect(db).not.toContain("from 'src/");
	});

	it('installs prisma 7.10+', () => {
		const pkg = JSON.parse(read(cwd(), 'package.json'));
		expect(pkg.devDependencies?.prisma).toMatch(/\^7\./);
		expect(pkg.dependencies?.prisma).toMatch(/\^7\./);
		expect(pkg.dependencies?.['@prisma/client']).toMatch(/\^7\./);
	});

	it('adds the db:* scripts and wires build to run prisma generate', () => {
		const pkg = JSON.parse(read(cwd(), 'package.json'));
		expect(pkg.scripts?.['db:generate']).toBe('prisma generate');
		expect(pkg.scripts?.['db:push']).toBe('prisma db push');
		expect(pkg.scripts?.['db:migrate']).toBe('prisma migrate dev');
		expect(pkg.scripts?.['db:studio']).toBe('prisma studio');
		expect(pkg.scripts?.build).toContain('prisma generate');
	});
});

describe('prisma addon (pg adapter)', () => {
	const cwd = () => projectCwds['kit-ts-pg'];

	it('creates a PrismaPg adapter via { connectionString }', () => {
		const db = read(cwd(), 'src/lib/server/db.ts');
		expect(db).toContain("from '@prisma/adapter-pg'");
		expect(db).toContain('new PrismaPg({ connectionString: DATABASE_URL })');
	});
});

describe('prisma addon (mariadb adapter)', () => {
	const cwd = () => projectCwds['kit-ts-mariadb'];

	it('installs @prisma/adapter-mariadb + mariadb driver (not mysql2)', () => {
		const pkg = JSON.parse(read(cwd(), 'package.json'));
		expect(pkg.dependencies?.['@prisma/adapter-mariadb']).toMatch(/\^7\./);
		expect(pkg.dependencies?.mysql2).toBeUndefined();
	});

	it('creates a PrismaMariaDb adapter via { url }', () => {
		const db = read(cwd(), 'src/lib/server/db.ts');
		expect(db).toContain("from '@prisma/adapter-mariadb'");
		expect(db).toContain('new PrismaMariaDb({ url: DATABASE_URL })');
	});

	it('uses mysql provider in schema.prisma', () => {
		const schema = read(cwd(), 'prisma/schema.prisma');
		expect(schema).toContain('provider = "mysql"');
	});
});

describe('prisma addon (libsql adapter)', () => {
	const cwd = () => projectCwds['kit-ts-libsql'];

	it('installs @prisma/adapter-libsql + @libsql/client', () => {
		const pkg = JSON.parse(read(cwd(), 'package.json'));
		expect(pkg.dependencies?.['@prisma/adapter-libsql']).toMatch(/\^7\./);
		expect(pkg.dependencies?.['@libsql/client']).toMatch(/\^0\./);
	});

	it('creates a PrismaLibSql adapter with optional TURSO_AUTH_TOKEN', () => {
		const db = read(cwd(), 'src/lib/server/db.ts');
		expect(db).toContain("from '@prisma/adapter-libsql'");
		expect(db).toContain('TURSO_AUTH_TOKEN');
		expect(db).toContain('new PrismaLibSql({');
		expect(db).toContain('authToken: TURSO_AUTH_TOKEN || undefined');
	});

	it('writes TURSO_AUTH_TOKEN to .env and .env.example', () => {
		const env = read(cwd(), '.env');
		const envEx = read(cwd(), '.env.example');
		expect(env).toContain('TURSO_AUTH_TOKEN=');
		expect(envEx).toContain('TURSO_AUTH_TOKEN=""');
	});
});

describe('prisma addon (sqlite dialect)', () => {
	const cwd = () => projectCwds['kit-ts-sqlite'];

	it('uses sqlite provider and skips adapter packages', () => {
		const pkg = JSON.parse(read(cwd(), 'package.json'));
		expect(pkg.dependencies?.['@prisma/adapter-pg']).toBeUndefined();
		expect(pkg.dependencies?.['@prisma/adapter-mariadb']).toBeUndefined();
		expect(pkg.dependencies?.['@prisma/adapter-libsql']).toBeUndefined();
		const schema = read(cwd(), 'prisma/schema.prisma');
		expect(schema).toContain('provider = "sqlite"');
	});
});

describe('prisma addon (kit-js variant)', () => {
	const cwd = () => projectCwds['kit-js-default'];

	it('creates a prisma.config.js that uses require-style env()', () => {
		// JS variant resolves file.prisma to prisma.config.js
		const cfg =
			fs.existsSync(path.resolve(cwd(), 'prisma.config.js'))
				? read(cwd(), 'prisma.config.js')
				: read(cwd(), 'prisma.config.ts');
		expect(cfg).toContain('prisma/config');
		expect(cfg).toContain('env(');
	});
});
