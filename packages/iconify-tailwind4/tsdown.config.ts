import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/index.ts'],
	format: 'esm',
	dts: false,
	treeshake: true,
	minify: false,
	external: ['sv', '@sveltejs/sv-utils']
});
