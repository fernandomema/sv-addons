import { transforms, color, dedent, defineEnv } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

const options = defineAddonOptions()
	.add('browser', {
		question: 'Enable Sentry for browser (client-side)?',
		type: 'boolean',
		default: true
	})
	.add('server', {
		question: 'Enable Sentry for server (server-side)?',
		type: 'boolean',
		default: true
	})
	.add('replays', {
		question: 'Enable Session Replays?',
		type: 'boolean',
		default: false,
		condition: ({ browser }) => browser === true
	})
	.add('dsn', {
		question: 'Sentry DSN (paste from Sentry → Project Settings → Client Keys, leave empty to fill later)',
		type: 'string',
		default: '',
		placeholder: 'https://...@o123.ingest.sentry.io/456'
	})
	.add('authToken', {
		question: 'Sentry auth token for source maps (leave empty to fill later)',
		type: 'string',
		default: '',
		placeholder: 'sntrys_...'
	})
	.add('org', {
		question: 'Sentry organization slug (leave empty to fill later)',
		type: 'string',
		default: '',
		placeholder: 'my-org'
	})
	.add('project', {
		question: 'Sentry project slug (leave empty to fill later)',
		type: 'string',
		default: '',
		placeholder: 'my-project'
	})
	.build();

export default defineAddon({
	id: 'sentry',
	shortDescription: 'Error tracking with Sentry',
	homepage: 'https://sentry.io',
	options,
	setup: ({ isKit, unsupported }) => {
		if (!isKit) unsupported('Requires SvelteKit');
	},
	run: ({ sv, options, language, file, directory, dependencyVersion }) => {
		const env = defineEnv({ sv, cwd: process.cwd(), dependencyVersion });

		env.define({
			name: 'PUBLIC_SENTRY_DSN',
			description: 'Sentry DSN for client-side error tracking.'
		});
		env.define({
			name: 'SENTRY_AUTH_TOKEN',
			description: 'Sentry auth token for source maps upload.'
		});
		env.define({
			name: 'SENTRY_ORG',
			description: 'Sentry organization slug.'
		});
		env.define({
			name: 'SENTRY_PROJECT',
			description: 'Sentry project slug.'
		});

		sv.dependency('@sentry/sveltekit', '^8.0.0');
		sv.dependency('@sentry/core', '^8.0.0');

		if (options.browser) {
			sv.dependency('@sentry/sveltekit', '^8.0.0');
		}

		sv.file('.env', generateEnv(false, options));
		sv.file('.env.example', generateEnv(true, options));

		if (options.browser) {
			sv.file(
				`${directory.lib}/sentry.client.${language}`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						import * as Sentry from '@sentry/sveltekit';

						Sentry.init({
							dsn: import.meta.env.PUBLIC_SENTRY_DSN,
							tracesSampleRate: 0.1,
							replaysSessionSampleRate: 0.1,
							replaysOnErrorSampleRate: 1.0${options.replays ? ',\n\t\t\tintegrations: [Sentry.replayIntegration()]' : ''}
						});
					`;
				})
			);
		}

		if (options.server) {
			sv.file(
				`${directory.lib}/sentry.server.${language}`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						import * as Sentry from '@sentry/sveltekit';

						Sentry.init({
							dsn: import.meta.env.PUBLIC_SENTRY_DSN,
							tracesSampleRate: 0.1
						});
					`;
				})
			);
		}

		sv.file(
			`src/hooks.server.${language}`,
			transforms.script(({ ast, comments, js }) => {
				const hasSentryHandle = js.common.contains(ast, (node) => {
					return (
						node.type === 'CallExpression' &&
						node.callee.type === 'MemberExpression' &&
						node.callee.property.type === 'Identifier' &&
						node.callee.property.name === 'sentryHandle'
					);
				});
				if (hasSentryHandle) return false;

				if (options.server) {
					js.imports.addNamed(ast, {
						from: '@sentry/sveltekit',
						imports: ['sentryHandle']
					});
					js.kit.addHooksHandle(ast, {
						language,
						newHandleName: 'handleSentry',
						handleContent: 'sentryHandle()',
						comments
					});
				}
			})
		);

		if (options.browser) {
			sv.file(
				`src/hooks.client.${language}`,
				transforms.script(({ ast, js }) => {
					const hasSentryInit = js.common.contains(ast, (node) => {
						return (
							node.type === 'ImportDeclaration' &&
							node.source.value === '$lib/sentry.client'
						);
					});
					if (hasSentryInit) return false;

					js.imports.addEmpty(ast, { from: `$lib/sentry.client` });
				})
			);
		}

		sv.file(
			file.viteConfig,
			transforms.script(({ ast, js }) => {
				if (options.server) {
					const hasSentry = js.common.contains(ast, (node) => {
						return (
							node.type === 'CallExpression' &&
							node.callee.type === 'Identifier' &&
							node.callee.name === 'sentrySvelteKitPlugin'
						);
					});
					if (hasSentry) return false;

					js.vite.addPlugin(ast, { code: 'sentrySvelteKitPlugin()' });
					js.imports.addNamed(ast, {
						from: '@sentry/sveltekit/plugin/vite',
						imports: ['sentrySvelteKitPlugin']
					});
				}
			})
		);

		sv.file(
			file.package,
			transforms.json(({ data, json }) => {
				json.packageScriptsUpsert(
					data,
					'sentry:sourcemaps',
					'sentry-upload-sourcemaps --org $SENTRY_ORG --project $SENTRY_PROJECT'
				);
			})
		);
	},
	nextSteps: ({ options }) => {
		const missing: string[] = [];
		if (!options.dsn) missing.push(color.env('PUBLIC_SENTRY_DSN'));
		if (!options.authToken) missing.push(color.env('SENTRY_AUTH_TOKEN'));
		if (!options.org) missing.push(color.env('SENTRY_ORG'));
		if (!options.project) missing.push(color.env('SENTRY_PROJECT'));

		const steps: string[] = [];
		if (missing.length > 0) {
			steps.push(`Fill in ${missing.join(', ')} in ${color.path('.env')}`);
		} else {
			steps.push('Sentry env vars are already set. Restart your dev server to pick them up.');
		}
		if (options.replays) {
			steps.push('Session Replays are enabled - check the Sentry dashboard for recordings');
		}
		steps.push(
			`Run ${color.command('npm run sentry:sourcemaps')} to upload source maps after building`
		);
		return steps;
	}
});

type GenerateEnv = (
	isExample: boolean,
	options: { dsn: string; authToken: string; org: string; project: string }
) => (content: string) => string;
const generateEnv: GenerateEnv = (isExample, options) => (content) => {
	const text = content || '';
	const lines = text.split('\n');

	// In .env (real values) the user-provided literal is used; in .env.example we always
	// emit empty double-quoted placeholders so the file is never a leak of a real token.
	const valueFor = (
		key: 'PUBLIC_SENTRY_DSN' | 'SENTRY_AUTH_TOKEN' | 'SENTRY_ORG' | 'SENTRY_PROJECT'
	) => {
		if (isExample) return '""';
		switch (key) {
			case 'PUBLIC_SENTRY_DSN':
				return options.dsn ? `"${options.dsn}"` : '""';
			case 'SENTRY_AUTH_TOKEN':
				return options.authToken ? `"${options.authToken}"` : '""';
			case 'SENTRY_ORG':
				return options.org || '""';
			case 'SENTRY_PROJECT':
				return options.project || '""';
		}
	};

	const upsert = (key: string, value: string, comment?: string) => {
		const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
		if (idx === -1) {
			if (comment) lines.push(`# ${comment}`);
			lines.push(`${key}=${value}`);
		}
	};

	upsert('PUBLIC_SENTRY_DSN', valueFor('PUBLIC_SENTRY_DSN'), 'Sentry DSN');
	upsert('SENTRY_AUTH_TOKEN', valueFor('SENTRY_AUTH_TOKEN'), 'Sentry auth token for source maps');
	upsert('SENTRY_ORG', valueFor('SENTRY_ORG'), 'Sentry organization slug');
	upsert('SENTRY_PROJECT', valueFor('SENTRY_PROJECT'), 'Sentry project slug');

	return lines.join('\n');
};
