import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { add } from 'sv';
import { addPnpmBuildDependencies, createProject, setup } from 'sv/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import addon from '../src/index.js';
import prismaAddon from '../../prisma/src/index.js';

const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-better-auth-prisma-test-'));
const testName = 'better-auth-prisma';

type Case = { variant: 'kit-js' | 'kit-ts'; options: { admin: boolean; demo: string[] } };
const cases: Case[] = [
	{ variant: 'kit-ts', options: { admin: true, demo: ['password'] } },
	{ variant: 'kit-js', options: { admin: false, demo: ['password', 'github'] } }
];

const { templatesDir } = setup({
	cwd: TEST_DIR,
	clean: false,
	variants: cases.map((c) => c.variant)
});
const create = createProject({ cwd: TEST_DIR, testName, templatesDir });

let projectCwds: Record<Case['variant'], string> = {} as Record<Case['variant'], string>;

beforeAll(async () => {
	const root = path.resolve(TEST_DIR, testName);
	fs.mkdirSync(root, { recursive: true });
	fs.writeFileSync(
		path.resolve(root, 'pnpm-workspace.yaml'),
		"packages:\n  - '**/*'",
		'utf8'
	);
	fs.writeFileSync(
		path.resolve(root, 'package.json'),
		JSON.stringify({ name: `${testName}-workspace-root`, private: true }),
		'utf8'
	);

	for (const c of cases) {
		const cwd = create({ testId: c.variant, variant: c.variant });
		projectCwds[c.variant] = cwd;

		const { pnpmBuildDependencies } = await add({
			cwd,
			addons: { prisma: prismaAddon, addon },
			options: {
				prisma: { dialect: 'postgresql', adapter: 'pg', output: 'src/lib/generated/prisma' },
				'better-auth-prisma': c.options
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

describe('better-auth-prisma addon (kit-ts)', () => {
	const cwd = () => projectCwds['kit-ts'];

	it('creates $lib/server/auth.ts with betterAuth + prismaAdapter', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/lib/server/auth.ts'), 'utf8');
		expect(f).toContain('betterAuth');
		expect(f).toContain('prismaAdapter');
		expect(f).toContain('postgresql');
		expect(f).toContain('import { prisma } from "$lib/server/db";');
		expect(f).not.toContain('src/lib/');
	});

	it('generates valid +page.svelte files (no placeholder artifacts like $<{ ... })', () => {
		const login = fs.readFileSync(
			path.resolve(cwd(), 'src/routes/demo/better-auth/login/+page.svelte'),
			'utf8'
		);
		const index = fs.readFileSync(
			path.resolve(cwd(), 'src/routes/demo/better-auth/+page.svelte'),
			'utf8'
		);
		expect(login).not.toContain('$<');
		expect(index).not.toContain('$<');
		expect(login).toContain('let { form }: { form: ActionData } = $props();');
		expect(index).toContain('let { data }: { data: PageServerData } = $props();');
	});

	it('writes env vars to .env and .env.example', () => {
		const env = fs.readFileSync(path.resolve(cwd(), '.env'), 'utf8');
		expect(env).toContain('BETTER_AUTH_SECRET');
		expect(env).toContain('ORIGIN');
	});

	it('updates src/app.d.ts with Locals.user and Locals.session', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/app.d.ts'), 'utf8');
		expect(f).toContain('user?: User');
		expect(f).toContain('session?: Session');
	});

	it('adds auth:schema script to package.json', () => {
		const pkg = JSON.parse(fs.readFileSync(path.resolve(cwd(), 'package.json'), 'utf8'));
		expect(pkg.scripts['auth:schema']).toContain('auth generate');
	});

	it('wires hooks.server.ts with $lib/server/auth (not $lib/lib/server/auth)', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/hooks.server.ts'), 'utf8');
		expect(f).toContain("from '$lib/server/auth'");
		expect(f).not.toContain('$lib/lib/');
		expect(f).toContain('svelteKitHandler');
	});
});

describe('better-auth-prisma addon (kit-js)', () => {
	const cwd = () => projectCwds['kit-js'];

	it('creates .js auth file (not .ts)', () => {
		expect(fs.existsSync(path.resolve(cwd(), 'src/lib/server/auth.js'))).toBe(true);
		expect(fs.existsSync(path.resolve(cwd(), 'src/lib/server/auth.ts'))).toBe(false);
	});

	it('includes github demo env vars when github option is set', () => {
		const env = fs.readFileSync(path.resolve(cwd(), '.env'), 'utf8');
		expect(env).toContain('GITHUB_CLIENT_ID');
		expect(env).toContain('GITHUB_CLIENT_SECRET');
	});

	it('does not include admin plugin when admin=false', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/lib/server/auth.js'), 'utf8');
		expect(f).not.toContain('adminPlugin');
	});
});
