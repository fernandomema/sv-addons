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
			{ value: 'mysql', label: 'MySQL' },
			{ value: 'sqlite', label: 'SQLite' }
		]
	})
	.add('adapter', {
		question: 'Which Prisma adapter would you like to use?',
		type: 'select',
		default: 'none',
		options: [
			{ value: 'none', label: 'None (standard client)' },
			{ value: 'pg', label: '@prisma/adapter-pg (PostgreSQL driver adapter)' },
			{ value: 'mysql', label: '@prisma/adapter-mysql (MySQL driver adapter)' },
			{ value: 'libsql', label: '@prisma/adapter-libsql (LibSQL/Turso driver adapter)' }
		],
		condition: ({ dialect }) => dialect === 'postgresql'
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

		sv.dependency('prisma', '^6.0.0');
		sv.devDependency('prisma', '^6.0.0');

		if (options.adapter === 'pg') {
			sv.dependency('@prisma/adapter-pg', '^6.0.0');
			sv.dependency('pg', '^8.0.0');
			sv.devDependency('@types/pg', '^8.0.0');
		} else if (options.adapter === 'mysql') {
			sv.dependency('@prisma/adapter-mysql', '^6.0.0');
			sv.dependency('mysql2', '^3.0.0');
		} else if (options.adapter === 'libsql') {
			sv.dependency('@prisma/adapter-libsql', '^6.0.0');
			sv.dependency('@libsql/client', '^0.14.0');
		}

		sv.file('.env', generateEnv(false));
		sv.file('.env.example', generateEnv(true));

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
					import "dotenv/config";
					import { defineConfig } from "prisma/config";

					export default defineConfig({
						schema: "prisma/schema.prisma",
						migrations: {
							path: "prisma/migrations",
						},
						datasource: {
							url: process.env["DATABASE_URL"],
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
							const adapter = new PrismaPg(DATABASE_URL);
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

type GenerateEnv = (isExample: boolean) => (content: string) => string;
const generateEnv: GenerateEnv = (isExample) => (content) => {
	const text = content || '';
	const lines = text.split('\n');
	const hasDbUrl = lines.some((l) => l.startsWith('DATABASE_URL='));

	if (!hasDbUrl) {
		const value = isExample ? '""' : '"postgresql://user:password@localhost:5432/mydb?schema=public"';
		const separator = lines.length > 0 && lines[lines.length - 1] !== '' ? '\n' : '';
		return `${text}${separator}# Database\nDATABASE_URL=${value}\n`;
	}
	return text;
};
