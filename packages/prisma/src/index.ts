import { transforms, color, dedent, defineEnv } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

type Dialect = 'postgresql' | 'mysql' | 'sqlite';

const options = defineAddonOptions()
	.add('dialect', {
		question: 'Which database dialect?',
		type: 'select',
		default: 'postgresql',
		options: [
			{ value: 'postgresql', label: 'PostgreSQL' },
			{ value: 'mysql', label: 'MySQL / MariaDB' },
			{ value: 'sqlite', label: 'SQLite' }
		]
	})
	.add('adapter', {
		question: 'Which Prisma driver adapter would you like to use?',
		type: 'select',
		default: 'none',
		options: [
			{ value: 'none', label: 'None (standard client)' },
			{ value: 'pg', label: '@prisma/adapter-pg (PostgreSQL driver adapter)' },
			{ value: 'mariadb', label: '@prisma/adapter-mariadb (MySQL/MariaDB driver adapter)' },
			{ value: 'libsql', label: '@prisma/adapter-libsql (LibSQL / Turso driver adapter)' }
		],
		condition: ({ dialect }) => dialect === 'postgresql' || dialect === 'mysql'
	})
	.add('output', {
		question: 'Where should the Prisma client be generated?',
		type: 'string',
		default: 'src/lib/generated/prisma'
	})
	.build();

export default defineAddon({
	id: 'prisma',
	shortDescription: 'Prisma ORM for database access',
	homepage: 'https://www.prisma.io',
	options,
	setup: ({ isKit, unsupported }) => {
		if (!isKit) unsupported('Requires SvelteKit');
	},
	run: ({ sv, options, language, file, directory, dependencyVersion }) => {
		const env = defineEnv({ sv, cwd: process.cwd(), dependencyVersion });

		env.define({
			name: 'DATABASE_URL',
			description: 'Database connection string. See https://www.prisma.io/docs/orm/database-connection-urls'
		});

		// Prisma 7.10 is the latest GA line for the classic `prisma-client`
		// generator + driver-adapter setup this addon scaffolds. Prisma 8 is
		// currently in RC and drags in beta transitive deps (e.g. alchemy) that
		// break `npm install` in some environments via peer conflicts; we pin to
		// the stable 7.x line so installs are reliable.
		sv.dependency('prisma', '^7.10.0');
		sv.devDependency('prisma', '^7.10.0');

		if (options.adapter === 'pg') {
			sv.dependency('@prisma/adapter-pg', '^7.10.0');
		} else if (options.adapter === 'mariadb') {
			sv.dependency('@prisma/adapter-mariadb', '^7.10.0');
			sv.dependency('mariadb', '^3.0.0');
		} else if (options.adapter === 'libsql') {
			sv.dependency('@prisma/adapter-libsql', '^7.10.0');
			sv.dependency('@libsql/client', '^0.14.0');
			env.define({
				name: 'TURSO_AUTH_TOKEN',
				description: 'Optional auth token for Turso (leave empty for local libSQL files)'
			});
		}

		sv.file('.env', generateEnv(false, options.adapter === 'libsql'));
		sv.file('.env.example', generateEnv(true, options.adapter === 'libsql'));

		sv.file(
			`prisma/schema.prisma`,
			transforms.text(({ content }) => {
				if (content) return false;
				const providerMap: Record<Dialect, string> = {
					postgresql: 'postgresql',
					mysql: 'mysql',
					sqlite: 'sqlite'
				};
				return dedent`
					generator client {
						provider = "prisma-client"
						output   = "../${options.output}"
					}

					datasource db {
						provider = "${providerMap[options.dialect]}"
					}
				`;
			})
		);

		sv.file(
			`prisma.config.${language}`,
			transforms.text(({ content }) => {
				if (content) return false;
				return dedent`
					import 'dotenv/config';
					import { defineConfig, env } from 'prisma/config';

					export default defineConfig({
						schema: 'prisma/schema.prisma',
						migrations: {
							path: 'prisma/migrations',
						},
						datasource: {
							url: env('DATABASE_URL'),
						},
					});
				`;
			})
		);

		sv.file(
			`${directory.lib}/server/db.${language}`,
			transforms.text(({ content }) => {
				if (content) return false;

				if (options.adapter === 'pg') {
					return dedent`
						import { PrismaClient } from '${options.output}/client';
						import { PrismaPg } from '@prisma/adapter-pg';
						import { dev } from '$app/environment';
						import { DATABASE_URL } from '$env/static/private';

						const globalForPrisma = globalThis as unknown as {
							prisma: PrismaClient | undefined
						};

						function createPrismaClient() {
							const adapter = new PrismaPg({ connectionString: DATABASE_URL });
							return new PrismaClient({ adapter });
						}

						export const prisma = globalForPrisma.prisma ?? createPrismaClient();

						if (dev) globalForPrisma.prisma = prisma;
					`;
				}

				if (options.adapter === 'mariadb') {
					return dedent`
						import { PrismaClient } from '${options.output}/client';
						import { PrismaMariaDb } from '@prisma/adapter-mariadb';
						import { dev } from '$app/environment';
						import { DATABASE_URL } from '$env/static/private';

						const globalForPrisma = globalThis as unknown as {
							prisma: PrismaClient | undefined
						};

						function createPrismaClient() {
							const adapter = new PrismaMariaDb({ url: DATABASE_URL });
							return new PrismaClient({ adapter });
						}

						export const prisma = globalForPrisma.prisma ?? createPrismaClient();

						if (dev) globalForPrisma.prisma = prisma;
					`;
				}

				if (options.adapter === 'libsql') {
					return dedent`
						import { PrismaClient } from '${options.output}/client';
						import { PrismaLibSql } from '@prisma/adapter-libsql';
						import { dev } from '$app/environment';
						import { DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

						const globalForPrisma = globalThis as unknown as {
							prisma: PrismaClient | undefined
						};

						function createPrismaClient() {
							const adapter = new PrismaLibSql({
								url: DATABASE_URL,
								authToken: TURSO_AUTH_TOKEN || undefined
							});
							return new PrismaClient({ adapter });
						}

						export const prisma = globalForPrisma.prisma ?? createPrismaClient();

						if (dev) globalForPrisma.prisma = prisma;
					`;
				}

				return dedent`
					import { PrismaClient } from '${options.output}/client';
					import { dev } from '$app/environment';

					const globalForPrisma = globalThis as unknown as {
						prisma: PrismaClient | undefined
					};

					export const prisma = globalForPrisma.prisma ?? new PrismaClient();

					if (dev) globalForPrisma.prisma = prisma;
				`;
			})
		);

		sv.file(
			file.package,
			transforms.json(({ data, json }) => {
				json.packageScriptsUpsert(data, 'db:generate', 'prisma generate');
				json.packageScriptsUpsert(data, 'db:push', 'prisma db push');
				json.packageScriptsUpsert(data, 'db:migrate', 'prisma migrate dev');
				json.packageScriptsUpsert(data, 'db:studio', 'prisma studio');

				const currentBuild = (data.scripts?.build as string) || 'vite build';
				if (!currentBuild.includes('prisma generate')) {
					data.scripts = data.scripts || {};
					data.scripts.build = `prisma generate && ${currentBuild}`;
				}
			})
		);

	},
	nextSteps: ({ options, packageManager }) => {
		const pm = packageManager === 'npm' ? 'npx' : packageManager === 'pnpm' ? 'pnpm' : 'yarn';
		const runCmd = packageManager === 'npm' ? 'npm run' : packageManager;
		return [
			`Run ${color.command(`${pm} prisma generate`)} to generate the Prisma client`,
			`Run ${color.command(`${runCmd} db:push`)} to sync your schema to the database`,
			`Check ${color.env('DATABASE_URL')} in ${color.path('.env')} and adjust it to your needs`,
			`Add your models to ${color.path('prisma/schema.prisma')}`
		];
	}
});

type GenerateEnv = (isExample: boolean, includeTursoToken: boolean) => (content: string) => string;
const generateEnv: GenerateEnv = (isExample, includeTursoToken) => (content) => {
	const text = content || '';
	const lines = text.split('\n');
	const hasDbUrl = lines.some((l) => l.startsWith('DATABASE_URL='));
	const hasTursoToken = lines.some((l) => l.startsWith('TURSO_AUTH_TOKEN='));

	const dbPlaceholder = isExample
		? '""'
		: '"postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0"';
	const tursoPlaceholder = '""';

	const additions: string[] = [];
	if (!hasDbUrl) {
		additions.push('# Database');
		additions.push(`DATABASE_URL=${dbPlaceholder}`);
	}
	if (includeTursoToken && !hasTursoToken) {
		if (additions.length === 0) additions.push('# Turso (optional)');
		additions.push(`TURSO_AUTH_TOKEN=${tursoPlaceholder}`);
	}

	if (additions.length === 0) return text;

	const separator = lines.length > 0 && lines[lines.length - 1] !== '' ? '\n' : '';
	return `${text}${separator}${additions.join('\n')}\n`;
};
