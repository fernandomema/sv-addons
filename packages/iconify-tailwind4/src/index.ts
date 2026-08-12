import { transforms, color, dedent } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

const ICON_SETS = [
	{ value: 'tabler', label: 'Tabler Icons' },
	{ value: 'lucide', label: 'Lucide Icons' },
	{ value: 'heroicons', label: 'Heroicons' },
	{ value: 'ph', label: 'Phosphor Icons' },
	{ value: 'mdi', label: 'Material Design Icons' },
	{ value: 'fa6-solid', label: 'Font Awesome 6 Solid' },
	{ value: 'fa6-regular', label: 'Font Awesome 6 Regular' },
	{ value: 'bi', label: 'Bootstrap Icons' },
	{ value: 'codicon', label: 'Codicon' },
	{ value: 'octicon', label: 'Octicon' }
] as const;

const options = defineAddonOptions()
	.add('iconSets', {
		question: 'Which icon sets do you want to install?',
		type: 'multiselect',
		default: ['tabler'],
		options: ICON_SETS.map((s) => ({ value: s.value, label: s.label }))
	})
	.add('prefix', {
		question: 'What prefix should be used for icons?',
		type: 'string',
		default: 'i'
	})
	.build();

export default defineAddon({
	id: 'iconify-tailwind4',
	shortDescription: 'Iconify icons for Tailwind CSS v4',
	homepage: 'https://iconify.design',
	options,
	setup: ({ isKit, unsupported, dependsOn, dependencyVersion }) => {
		if (!isKit) unsupported('Requires SvelteKit');
		if (!dependencyVersion('@tailwindcss/vite')) dependsOn('tailwindcss');
	},
	run: ({ sv, options, language, file, directory }) => {
		for (const iconSet of options.iconSets) {
			const pkg = iconSet.includes('/') ? `@iconify-json/${iconSet.split('/')[0]}` : `@iconify-json/${iconSet}`;
			const version = iconSet === 'tabler' ? '^1.2.38' : '^1.0.0';
			sv.dependency(pkg, version);
		}

		sv.dependency('@iconify/tailwind4', '^1.2.3');

		sv.file(
			file.stylesheet,
			transforms.text(({ content }) => {
				const text = content || '';
				if (text.includes('@plugin "@iconify/tailwind4"')) return false;
				const separator = text.length > 0 && text[text.length - 1] !== '\n' ? '\n' : '';
				return `${text}${separator}\n@plugin "@iconify/tailwind4";\n`;
			})
		);

		sv.file(
			`${directory.lib}/components/Icon.svelte`,
			transforms.text(({ content }) => {
				if (content) return false;
				return dedent`
					<script lang="ts">
						import type { Snippet } from 'svelte';

						let {
							name,
							class: className = '',
							children
						}: {
							name: string;
							class?: string;
							children?: Snippet;
						} = $props();
					</script>

					<span class="{options.prefix}-{name} {className}">
						{#if children}
							{@render children()}
						{/if}
					</span>
				`;
			})
		);

		sv.file(
			file.package,
			transforms.json(({ data }) => {
				const deps = (data.dependencies as Record<string, string>) || {};
				for (const iconSet of options.iconSets) {
					const pkg = `@iconify-json/${iconSet}`;
					if (!deps[pkg]) {
						data.dependencies = data.dependencies || {};
						(data.dependencies as Record<string, string>)[pkg] = '^1.0.0';
					}
				}
			})
		);

		sv.file(
			file.viteConfig,
			transforms.script(({ ast, js }) => {
				const hasIconify = js.common.contains(ast, (node) => {
					return (
						node.type === 'CallExpression' &&
						node.callee.type === 'Identifier' &&
						node.callee.name === 'tailwindcss'
					);
				});
				if (!hasIconify) return false;

				return false;
			})
		);
	},
	nextSteps: ({ options }) => {
		const steps = [
			`Use icons in your templates with: ${color.command(`<span class="${options.prefix}-{icon-name}"></span>`)}`,
			`Or with the Icon component: ${color.command(`<Icon name="icon-name" />`)}`
		];

		if (options.iconSets.includes('tabler')) {
			steps.push(
				`Browse Tabler icons at ${color.website('https://icon-sets.iconify.design/tabler/')}`
			);
		}

		steps.push(
			`Find all available icons at ${color.website('https://icon-sets.iconify.design/')}`,
			`Icon sets: ${options.iconSets.join(', ')}`
		);

		return steps;
	}
});
