import { transforms, color, dedent, defineEnv } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

const options = defineAddonOptions()
	.add('hostUrl', {
		question: 'What is your Umami script host URL?',
		type: 'string',
		default: 'https://cloud.umami.is'
	})
	.add('domains', {
		question: 'Comma-separated list of domains to track (leave empty to track current hostname)',
		type: 'string',
		default: ''
	})
	.add('tag', {
		question: 'Optional tag attached to all events (e.g. "production", "staging")',
		type: 'string',
		default: ''
	})
	.add('doNotTrack', {
		question: 'Respect the browser Do-Not-Track header?',
		type: 'boolean',
		default: false
	})
	.add('server', {
		question: 'Also track server-side page views in hooks.server.ts?',
		type: 'boolean',
		default: false
	})
	.build();

export default defineAddon({
	id: 'umami',
	shortDescription: 'Privacy-friendly analytics with Umami',
	homepage: 'https://umami.is',
	options,
	setup: ({ isKit, unsupported }) => {
		if (!isKit) unsupported('Requires SvelteKit');
	},
	run: ({ sv, options, language, file, directory, dependencyVersion }) => {
		const env = defineEnv({ sv, cwd: process.cwd(), dependencyVersion });

		env.define({
			name: 'PUBLIC_UMAMI_WEBSITE_ID',
			description: 'Umami website ID (UUID) for this project.'
		});
		env.define({
			name: 'PUBLIC_UMAMI_SCRIPT_URL',
			description: 'Full URL to the Umami tracker script. Defaults to <hostUrl>/script.js.'
		});

		// 1. Helper module — track / identify / getSession / trackByAttr action + window.umami types
		sv.file(
			`${directory.lib}/umami/index.ts`,
			transforms.text(({ content }) => {
				if (content) return false;
				return dedent`
					// Umami analytics helpers
					// Docs: https://umami.is/docs/tracker-functions

					export type UmamiEventData = Record<string, string | number | boolean | null | undefined>;

					export type UmamiPayload = {
						hostname?: string;
						language?: string;
						referrer?: string;
						screen?: string;
						title?: string;
						url?: string;
						website?: string;
						name?: string;
						data?: UmamiEventData;
						id?: string;
						tag?: string;
					};

					export {};

					declare global {
						interface Window {
							umami?: {
								track: ((payload: UmamiPayload) => Promise<void>) & {
									(name: string, data?: UmamiEventData): Promise<void>;
									(fn: (props: UmamiPayload) => UmamiPayload): Promise<void>;
								};
								identify: ((id: string, data?: UmamiEventData) => Promise<void>) & ((
									data: UmamiEventData & { id: string }
								) => Promise<void>);
								getSession: () => { cache?: string; website: string | null };
							};
						}
					}

					function getTracker() {
						if (typeof window === 'undefined') return undefined;
						return window.umami;
					}

					function defaultPayload(): UmamiPayload {
						return {
							hostname: location.hostname,
							language: navigator.language,
							referrer: document.referrer,
							screen: \`\${screen.width}x\${screen.height}\`,
							title: document.title,
							url: location.pathname + location.search
						};
					}

					/**
					 * Track a page view or custom event.
					 *
					 * @example
					 *   track();                                  // pageview
					 *   track('signup');                          // event "signup"
					 *   track('signup', { plan: 'pro' });         // event with data
					 *   track((p) => ({ ...p, url: '/x' }));      // dynamic payload
					 */
					export function track(
						event?: string | UmamiPayload | ((payload: UmamiPayload) => UmamiPayload),
						data?: UmamiEventData
					): Promise<void> | void {
						const tracker = getTracker();
						if (!tracker) return;
						if (event === undefined) {
							return tracker.track(defaultPayload());
						}
						if (typeof event === 'string') return tracker.track(event, data);
						if (typeof event === 'function') return tracker.track(event);
						return tracker.track({ ...defaultPayload(), ...event });
					}

					/**
					 * Identify a visitor with optional data.
					 *
					 * @example
					 *   identify('user-123', { plan: 'pro' });
					 */
					export function identify(id: string, data?: UmamiEventData): Promise<void> | void {
						const tracker = getTracker();
						if (!tracker) return;
						return data ? tracker.identify(id, data) : tracker.identify(id);
					}

					/**
					 * Read the current Umami session (cache + website id), or null when unavailable.
					 */
					export function getSession(): { cache?: string; website: string | null } | null {
						const tracker = getTracker();
						return tracker ? tracker.getSession() : null;
					}

					/**
					 * Svelte action that tracks clicks on any element with a
					 * \`data-umami-event\` attribute (and optional \`data-umami-event-{key}\` payloads).
					 *
					 * @example
					 *   <button use:trackByAttr>Click me</button>
					 *   <button use:trackByAttr={{ eventName: 'signup', data: { plan: 'pro' } }}>Sign up</button>
					 */
					export function trackByAttr(
						node: HTMLElement,
						options: { eventName?: string; data?: UmamiEventData } = {}
					) {
						const handle = (e: Event) => {
							if (options.eventName) {
								track(options.eventName, options.data);
								return;
							}
							const target = e.currentTarget as HTMLElement;
							const eventName = target.getAttribute('data-umami-event');
							if (!eventName) return;
							const data: UmamiEventData = {};
							for (const attr of Array.from(target.attributes)) {
								const match = attr.name.match(/^data-umami-event-(.+)$/);
								if (match) data[match[1]] = attr.value;
							}
							track(eventName, data);
						};

						node.addEventListener('click', handle);
						return {
							destroy() {
								node.removeEventListener('click', handle);
							}
						};
					}
				`;
			})
		);

		// 2. Declarative Tracker component
		sv.file(
			`${directory.lib}/umami/Tracker.svelte`,
			transforms.text(({ content }) => {
				if (content) return false;
				return dedent`
					<script lang="ts">
						type Props = {
							websiteId: string;
							scriptUrl: string;
							domains?: string;
							tag?: string;
							doNotTrack?: boolean;
							autoTrack?: boolean;
							cache?: boolean;
						};

						let {
							websiteId,
							scriptUrl,
							domains = '',
							tag = '',
							doNotTrack = false,
							autoTrack = true,
							cache = false
						}: Props = $props();
					</script>

					<svelte:head>
						<script
							defer
							src={scriptUrl}
							data-website-id={websiteId}
							data-domains={domains || undefined}
							data-tag={tag || undefined}
							data-auto-track={autoTrack ? 'true' : 'false'}
							data-do-not-track={doNotTrack ? 'true' : 'false'}
							data-cache={cache ? 'true' : 'false'}
						></script>
					</svelte:head>
				`;
			})
		);

		// 3. Inject the Umami tracker script into app.html (just before </head>)
		sv.file(
			'app.html',
			transforms.text(({ content }) => {
				const text = content || '';
				if (text.includes('data-website-id')) return false;
				if (!text.includes('</head>')) return false;

				const tagAttr = options.tag ? ` data-tag="${options.tag}"` : '';
				const domainsAttr = options.domains ? ` data-domains="${options.domains}"` : '';
				const dntAttr = options.doNotTrack ? ' data-do-not-track="true"' : '';
				const scriptUrl = options.hostUrl.replace(/\/$/, '');

				const snippet = `\t<script
\t\tdefer
\t\tsrc="${scriptUrl}/script.js"
\t\tdata-website-id="%PUBLIC_UMAMI_WEBSITE_ID%"${domainsAttr}${tagAttr}${dntAttr}
\t></script>`;

				return text.replace('</head>', `\n${snippet}\n\t</head>`);
			})
		);

		// 4. Extend src/app.d.ts with window.umami typing (only if file exists)
		sv.file(
			file.app,
			transforms.text(({ content }) => {
				const text = content || '';
				if (!text) return false; // app.d.ts may not exist in some templates
				if (text.includes('umami')) return false;
				const snippet = `\n// Umami tracker global types\ndeclare global {\n\tinterface Window {\n\t\tumami?: import('$lib/umami').Window['umami'];\n\t}\n}\n\nexport {};\n`;
				return `${text}\n${snippet}`;
			})
		);

		// 5. Server-side tracking (optional)
		if (options.server) {
			sv.file(
				`${directory.lib}/umami/server.ts`,
				transforms.text(({ content }) => {
					if (content) return false;
					return dedent`
						// Server-side Umami tracking via the Collect API.
						// Docs: https://umami.is/docs/api/website-stats

						import type { Handle } from '@sveltejs/kit';
						import { env } from '$env/dynamic/public';

						export type CollectPayload = {
							hostname?: string;
							language?: string;
							referrer?: string;
							screen?: string;
							title?: string;
							url: string;
							name?: string;
							data?: Record<string, unknown>;
							tag?: string;
							id?: string;
						};

						function getEndpoint(): string {
							const explicit = env.PUBLIC_UMAMI_SCRIPT_URL;
							const source = explicit ?? '${options.hostUrl}/script.js';
							// script.js lives next to api/send on a standard Umami deployment
							return source.replace(/\\/script\\.js$/, '/api/send');
						}

						/**
						 * Fire-and-forget server-side event. Failures are logged, never thrown,
						 * so analytics can never break a request.
						 */
						export async function sendEvent(
							payload: CollectPayload,
							websiteId: string = env.PUBLIC_UMAMI_WEBSITE_ID ?? ''
						): Promise<void> {
							if (!websiteId) return;
							try {
								await fetch(getEndpoint(), {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'User-Agent': 'umami-sveltekit/0.1'
									},
									body: JSON.stringify({ ...payload, website: websiteId })
								});
							} catch (err) {
								console.error('[umami] failed to send event', err);
							}
						}

						/**
						 * SvelteKit handle that records a page view for every GET request that
						 * returns HTML. Uses the request UA + referer + path.
						 */
						export const umamiHandle: Handle = async ({ event, resolve }) => {
							const response = await resolve(event);

							const method = event.request.method;
							const accept = event.request.headers.get('accept') ?? '';
							if (method === 'GET' && accept.includes('text/html')) {
								const url = event.url.pathname + event.url.search;
								void sendEvent({
									hostname: event.url.hostname,
									language: event.request.headers.get('accept-language') ?? undefined,
									referrer: event.request.headers.get('referer') ?? undefined,
									url
								});
							}

							return response;
						};
					`;
				})
			);

			sv.file(
				`src/hooks.server.${language}`,
				transforms.script(({ ast, comments, js }) => {
					const hasUmamiHandle = js.common.contains(ast, (node) => {
						return (
							node.type === 'CallExpression' &&
							node.callee.type === 'MemberExpression' &&
							node.callee.property.type === 'Identifier' &&
							node.callee.property.name === 'umamiHandle'
						);
					});
					if (hasUmamiHandle) return false;

					js.imports.addNamed(ast, {
						from: '$lib/umami/server',
						imports: ['umamiHandle']
					});
					js.kit.addHooksHandle(ast, {
						language,
						newHandleName: 'handleUmami',
						handleContent: 'umamiHandle()',
						comments
					});
				})
			);
		}

		sv.file(
			'.env',
			generateEnv(false, options)
		);
		sv.file(
			'.env.example',
			generateEnv(true, options)
		);
	},
	nextSteps: ({ options }) => {
		const steps = [
			`Set ${color.env('PUBLIC_UMAMI_WEBSITE_ID')} in ${color.path('.env')} (your Umami website UUID)`,
			`Set ${color.env('PUBLIC_UMAMI_SCRIPT_URL')} in ${color.path('.env')} if you self-host Umami (default: ${options.hostUrl}/script.js)`,
			`Open ${color.path('src/app.html')} and replace ${color.env('%PUBLIC_UMAMI_WEBSITE_ID%')} with the value of ${color.env('PUBLIC_UMAMI_WEBSITE_ID')}`,
			`Track events with ${color.command(`import { track } from '$lib/umami'; track('signup', { plan: 'pro' })`)}`,
			`Or use the action ${color.command('<button use:trackByAttr data-umami-event="cta-click">…</button>')}`
		];

		if (options.server) {
			steps.push(`Server-side tracking is enabled — page views are recorded in ${color.path('hooks.server.ts')}`);
		}

		return steps;
	}
});

type GenerateEnv = (isExample: boolean, opts: { hostUrl: string }) => (content: string) => string;
const generateEnv: GenerateEnv = (isExample, opts) => (content) => {
	const text = content || '';
	const lines = text.split('\n');

	const upsert = (key: string, value: string, comment?: string) => {
		const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
		if (idx === -1) {
			if (comment) lines.push(`# ${comment}`);
			lines.push(`${key}=${value}`);
		}
	};

	upsert('PUBLIC_UMAMI_WEBSITE_ID', isExample ? '""' : '""', 'Umami website ID');
	upsert(
		'PUBLIC_UMAMI_SCRIPT_URL',
		isExample ? '""' : `"${opts.hostUrl.replace(/\/$/, '')}/script.js"`,
		'Umami tracker script URL'
	);

	return lines.join('\n');
};
