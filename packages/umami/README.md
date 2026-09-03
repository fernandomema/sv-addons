<a id="readme-top"></a>

[![NPM Version][npm-version-shield]][npm-version-url]
[![MIT License][license-shield]][license-url]
[![Svelte CLI][svelte-cli-shield]][svelte-cli-shield-url]

<br />
<div align="center">
  <h3>@fernando.mema/sv-umami</h3>
  <p>
    Privacy-friendly analytics with <a href="https://umami.is/">Umami</a> for SvelteKit
  </p>

  <a href="https://umami.is/">View Umami Docs</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

---

<!-- ABOUT -->
## About

This addon integrates [Umami](https://umami.is/) — the privacy-friendly, self-hostable Google Analytics alternative — into your SvelteKit project. It installs the official tracker script and wires up:

- ✅ Automatic page view tracking
- ✅ Helpers for custom events (`track`, `identify`, `getSession`)
- ✅ A `use:trackByAttr` Svelte action for declarative event tracking via `data-umami-event` attributes
- ✅ A `<Tracker />` component for full control over script attributes
- ✅ Optional **server-side page view tracking** in `hooks.server.ts` (no client JS needed)
- ✅ `window.umami` global types for TypeScript autocomplete

No third-party Umami SDK is required — this addon speaks directly to the official `script.js` and `/api/send` endpoint.

---

<!-- INSTALLATION -->
## Installation

```bash
npx sv add @fernando.mema/sv-umami
```

---

<!-- OPTIONS -->
## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hostUrl` | string | `https://cloud.umami.is` | Where your Umami instance is hosted (Cloud or self-hosted). |
| `domains` | string | `""` | Comma-separated list of domains the tracker should record. |
| `tag` | string | `""` | Optional tag attached to every event (`"production"`, `"staging"`, …). |
| `doNotTrack` | boolean | `false` | Respect the browser `Do-Not-Track` header. |
| `server` | boolean | `false` | Also record page views from `hooks.server.ts`. |

---

<!-- WHAT IT DOES -->
## What It Does

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/umami/index.ts` | `track`, `identify`, `getSession`, `trackByAttr` action + `window.umami` typings |
| `src/lib/umami/Tracker.svelte` | Declarative `<Tracker />` component (drop in your root layout) |
| `src/lib/umami/server.ts` | `umamiHandle` + `sendEvent` for server-side tracking (only when `server: true`) |

### Files Modified

| File | Changes |
|------|---------|
| `src/app.html` | Injects the `<script defer src="…/script.js" data-website-id="…">` tag |
| `src/app.d.ts` | Adds `window.umami` global types |
| `src/hooks.server.ts` | Adds `umamiHandle` (only when `server: true`) |
| `.env` / `.env.example` | Adds `PUBLIC_UMAMI_WEBSITE_ID` and `PUBLIC_UMAMI_SCRIPT_URL` |

---

<!-- USAGE -->
## Usage

### Page views (automatic)

Once the script tag is injected into `src/app.html`, Umami automatically records every page view. Nothing else to do.

### Custom events

```svelte
<script lang="ts">
  import { track, identify } from '$lib/umami';

  function onSignup(plan: string) {
    identify('user-123', { plan });
    track('signup', { plan });
  }
</script>

<button onclick={() => onSignup('pro')}>Sign up</button>
```

### Declarative events with `use:trackByAttr`

```svelte
<script>
  import { trackByAttr } from '$lib/umami';
</script>

<button use:trackByAttr data-umami-event="cta-click">Click me</button>

<!-- with extra event data -->
<button
  use:trackByAttr
  data-umami-event="pricing-cta"
  data-umami-event-plan="pro"
  data-umami-event-source="hero"
>
  Start free trial
</button>
```

### Override script attributes with `<Tracker />`

```svelte
<script>
  import { PUBLIC_UMAMI_SCRIPT_URL } from '$env/static/public';
  import { env } from '$env/dynamic/public';
  import Tracker from '$lib/umami/Tracker.svelte';
</script>

<Tracker
  websiteId={env.PUBLIC_UMAMI_WEBSITE_ID}
  scriptUrl={PUBLIC_UMAMI_SCRIPT_URL}
  domains="example.com,www.example.com"
  tag="production"
  doNotTrack={true}
  cache={true}
/>
```

### Server-side tracking

Enable the `server` option to also record page views in `hooks.server.ts`. The server posts to Umami's `/api/send` endpoint using the request's `User-Agent`, `Referer`, and `Accept-Language` headers, so analytics still work for crawlers, RSS readers, and any client that blocks the tracker script.

You can also call `sendEvent` directly from any `+page.server.ts` load function:

```ts
import { sendEvent } from '$lib/umami/server';

export async function load({ url }) {
  await sendEvent({ url: url.pathname, name: 'docs-view' });
}
```

---

<!-- ENVIRONMENT VARIABLES -->
## Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_UMAMI_WEBSITE_ID` | The Umami website UUID (Settings → Websites → Website ID) |
| `PUBLIC_UMAMI_SCRIPT_URL` | Full URL to your tracker script. Defaults to `<hostUrl>/script.js` |

---

<!-- NEXT STEPS -->
## Next Steps

1. Set `PUBLIC_UMAMI_WEBSITE_ID` in `.env`.
2. Restart your dev server so the env var is picked up by Vite.
3. Open your Umami dashboard and confirm page views are arriving.
4. Add `track('event-name', { key: 'value' })` calls where you need fine-grained events.

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[npm-version-shield]: https://img.shields.io/npm/v/@fernando.mema/sv-umami.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/@fernando.mema/sv-umami
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/main/LICENSE
[svelte-cli-shield]: https://img.shields.io/badge/Svelte-CLI-ff3e00.svg?style=for-the-badge
[svelte-cli-shield-url]: https://svelte.dev/docs/cli
