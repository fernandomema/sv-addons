import { transforms, color, dedent } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

const options = defineAddonOptions()
	.add('locales', {
		question: 'Which locales do you want to support?',
		type: 'multiselect',
		default: ['en', 'es'],
		options: [
			{ value: 'en', label: 'English' },
			{ value: 'es', label: 'Spanish' },
			{ value: 'ca', label: 'Catalan' },
			{ value: 'pt', label: 'Portuguese' },
			{ value: 'fr', label: 'French' },
			{ value: 'de', label: 'German' },
			{ value: 'it', label: 'Italian' },
			{ value: 'zh', label: 'Chinese' },
			{ value: 'ja', label: 'Japanese' },
			{ value: 'ar', label: 'Arabic' }
		]
	})
	.add('adapters', {
		question: 'Which Wuchale adapters do you need?',
		type: 'multiselect',
		default: ['svelte'],
		options: [
			{ value: 'svelte', label: 'Svelte (reactive components)' },
			{ value: 'vanilla', label: 'Vanilla JS (for .ts files)' }
		]
	})
	.add('ai', {
		question: 'Enable AI-powered translation with OpenCode?',
		type: 'boolean',
		default: true
	})
	.build();

export default defineAddon({
	id: 'wuchale',
	shortDescription: 'i18n with AI-powered translations via Wuchale',
	homepage: 'https://wuchale.dev',
	options,
	setup: ({ isKit, unsupported }) => {
		if (!isKit) unsupported('Requires SvelteKit');
	},
	run: ({ sv, options, language, file, directory }) => {
		sv.dependency('wuchale', '^0.25.0');
		sv.dependency('@wuchale/svelte', '^0.20.0');

		if (options.adapters.includes('vanilla')) {
			sv.dependency('wuchale', '^0.25.0');
		}

		if (options.ai) {
			sv.devDependency('dotenv', '^17.0.0');
		}

		const svelteAdapter = options.adapters.includes('svelte');
		const vanillaAdapter = options.adapters.includes('vanilla');

		const adapterImports: string[] = [];
		const adapterConfig: string[] = [];

		if (svelteAdapter) {
			adapterImports.push(`import { adapter as svelte } from "@wuchale/svelte";`);
			adapterConfig.push(`
		main: svelte({
			loader: 'sveltekit',
		}),`);
		}

		if (vanillaAdapter) {
			adapterImports.push(`import { adapter as js } from 'wuchale/adapter-vanilla';`);
			adapterConfig.push(`
		js: js({
			loader: 'vite',
			loading: {
				direct: true,
			},
			files: [
				'src/**/+{page,layout}.{js,ts}',
				'src/**/+{page,layout}.server.{js,ts}',
			],
		})`);
		}

		const aiConfig = options.ai
			? `
	import 'dotenv/config';

	const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY;
	const OPENCODE_BASE_URL = 'https://opencode.ai/zen/go/v1';
	const MODEL = 'deepseek-v4-flash';`
			: '';

		const aiTranslate = options.ai
			? `
	ai: {
		name: 'DeepSeek V4 Flash (OpenCode Go)',
		batchSize: 40,
		parallel: 5,
		group: {},
		translate: async (content, instruction) => {
			const response = await fetch(\`\${OPENCODE_BASE_URL}/chat/completions\`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': \`Bearer \${OPENCODE_API_KEY}\`
				},
				body: JSON.stringify({
					model: MODEL,
					messages: [
						{ role: 'system', content: instruction },
						{ role: 'user', content }
					]
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(\`OpenCode API error (\${response.status}): \${errorText}\`);
			}

			const data = await response.json();
			return data.choices[0].message.content;
		}
	}`
			: '';

		sv.file(
			'wuchale.config.js',
			transforms.text(({ content }) => {
				if (content) return false;
				return dedent`
					// @ts-check
					${aiConfig}
					${adapterImports.join('\n')}
					import { defineConfig } from "wuchale";

					export default defineConfig({
						locales: [${options.locales.map((l) => `'${l}'`).join(', ')}],
						adapters: {${adapterConfig.join('')}
						},${aiTranslate ? `\n\t${aiTranslate}` : ''}
					});
				`;
			})
		);

		sv.file(
			file.gitignore,
			transforms.text(({ content }) => {
				const text = content || '';
				if (text.includes('.wuchale')) return false;
				const separator = text.length > 0 && text[text.length - 1] !== '\n' ? '\n' : '';
				return `${text}${separator}.wuchale\n`;
			})
		);

		if (options.ai) {
			sv.file('.env', (content) => {
				const text = content || '';
				if (text.includes('OPENCODE_API_KEY')) return false;
				const separator = text.length > 0 && text[text.length - 1] !== '\n' ? '\n' : '';
				return `${text}${separator}# OpenCode AI (Wuchale translations)\nOPENCODE_API_KEY=""\n`;
			});

			sv.file('.env.example', (content) => {
				const text = content || '';
				if (text.includes('OPENCODE_API_KEY')) return false;
				const separator = text.length > 0 && text[text.length - 1] !== '\n' ? '\n' : '';
				return `${text}${separator}# OpenCode AI (Wuchale translations)\nOPENCODE_API_KEY=""\n`;
			});
		}

		sv.file(
			file.viteConfig,
			transforms.script(({ ast, js }) => {
				const hasWuchale = js.common.contains(ast, (node) => {
					return (
						node.type === 'CallExpression' &&
						node.callee.type === 'Identifier' &&
						node.callee.name === 'wuchale'
					);
				});
				if (hasWuchale) return false;

				js.vite.addPlugin(ast, { code: 'wuchale()', mode: 'prepend' });
				js.imports.addNamed(ast, { from: 'wuchale/vite', imports: ['wuchale'] });
			})
		);

		sv.file(
			file.package,
			transforms.json(({ data, json }) => {
				json.packageScriptsUpsert(data, 'i18n', 'npx wuchale');
				json.packageScriptsUpsert(data, 'i18n:extract', 'npx wuchale --extract-only');
			})
		);

		if (svelteAdapter) {
			const svelteDir = `${directory.lib}/locales`;
			sv.file(
				`${svelteDir}/main.loader.svelte.js`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						// Wuchale Svelte loader - auto-generated
						// See https://wuchale.dev for documentation
						export {};
					`;
				})
			);

			sv.file(
				`${svelteDir}/main.loader.server.svelte.js`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						// Wuchale Svelte server loader - auto-generated
						// See https://wuchale.dev for documentation
						export {};
					`;
				})
			);
		}

		if (vanillaAdapter) {
			const jsDir = `${directory.lib}/locales`;
			sv.file(
				`${jsDir}/js.loader.js`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						// Wuchale vanilla JS loader - auto-generated
						// See https://wuchale.dev for documentation
						export {};
					`;
				})
			);

			sv.file(
				`${jsDir}/js.loader.server.js`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						// Wuchale vanilla JS server loader - auto-generated
						// See https://wuchale.dev for documentation
						export {};
					`;
				})
			);
		}
	},
	nextSteps: ({ options, packageManager }) => {
		const steps = [];
		const pm = packageManager === 'npm' ? 'npx' : packageManager === 'pnpm' ? 'pnpm' : 'yarn';

		if (options.ai) {
			steps.push(
				`Set ${color.env('OPENCODE_API_KEY')} in ${color.path('.env')} for AI translations`
			);
		}
		steps.push(
			`Run ${color.command(`${pm} wuchale`)} to extract and translate strings`,
			`Use ${color.command(`${pm} wuchale --extract-only`)} to extract without translating`,
			`Name your Svelte files with .svelte.ts extension for automatic string extraction`
		);

		return steps;
	}
});
