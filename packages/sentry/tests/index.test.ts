import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { add } from 'sv';
import { addPnpmBuildDependencies, createProject, setup } from 'sv/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import addon from '../src/index.js';

const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-sentry-test-'));
const testName = 'sentry';

type Case = { variant: 'kit-js' | 'kit-ts' | 'vite-js' | 'vite-ts' };
const cases: Case[] = [
	{ variant: 'kit-ts' },
	{ variant: 'kit-js' },
	{ variant: 'vite-ts' },
	{ variant: 'vite-js' }
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
		'packages:\n  - \'**/*\'',
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
			addons: { addon },
			options: {
				addon: {
					browser: true,
					server: true,
					replays: false,
					dsn: '',
					authToken: '',
					org: '',
					project: ''
				}
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

describe('sentry addon (kit-ts)', () => {
	const cwd = () => projectCwds['kit-ts'];

	it('creates $lib/sentry.client.ts', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/lib/sentry.client.ts'), 'utf8');
		expect(f).toContain('Sentry.init');
		expect(f).toContain('PUBLIC_SENTRY_DSN');
		expect(f).not.toContain('integrations:');
	});

	it('creates $lib/sentry.server.ts', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/lib/sentry.server.ts'), 'utf8');
		expect(f).toContain('Sentry.init');
	});

	it('does NOT create root-level sentry.{client,server}.config.*', () => {
		expect(fs.existsSync(path.resolve(cwd(), 'sentry.client.config.ts'))).toBe(false);
		expect(fs.existsSync(path.resolve(cwd(), 'sentry.server.config.ts'))).toBe(false);
	});

	it('writes env placeholders to .env and .env.example', () => {
		const env = fs.readFileSync(path.resolve(cwd(), '.env'), 'utf8');
		expect(env).toContain('PUBLIC_SENTRY_DSN=""');
		expect(env).toContain('SENTRY_AUTH_TOKEN=""');
		expect(env).toContain('SENTRY_ORG=""');
		expect(env).toContain('SENTRY_PROJECT=""');

		const envEx = fs.readFileSync(path.resolve(cwd(), '.env.example'), 'utf8');
		expect(envEx).toContain('PUBLIC_SENTRY_DSN=""');
		expect(envEx).toContain('SENTRY_AUTH_TOKEN=""');
		expect(envEx).toContain('SENTRY_ORG=""');
		expect(envEx).toContain('SENTRY_PROJECT=""');
	});

	it('wires hooks.server.ts with handleSentry', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/hooks.server.ts'), 'utf8');
		expect(f).toContain('handleSentry');
		expect(f).toContain('sentryHandle');
	});

	it('wires hooks.client.ts', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'src/hooks.client.ts'), 'utf8');
		expect(f).toContain('$lib/sentry.client');
	});

	it('wires vite.config.ts with sentrySvelteKitPlugin', () => {
		const f = fs.readFileSync(path.resolve(cwd(), 'vite.config.ts'), 'utf8');
		expect(f).toContain('sentrySvelteKitPlugin');
	});

	it('adds sentry:sourcemaps script + @sentry/sveltekit dep', () => {
		const pkg = JSON.parse(fs.readFileSync(path.resolve(cwd(), 'package.json'), 'utf8'));
		expect(pkg.scripts['sentry:sourcemaps']).toBeDefined();
		expect(pkg.dependencies?.['@sentry/sveltekit']).toBeDefined();
	});
});
