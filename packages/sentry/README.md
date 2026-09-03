<a id="readme-top"></a>

[![NPM Version][npm-version-shield]][npm-version-url]
[![MIT License][license-shield]][license-url]
[![Svelte CLI][svelte-cli-shield]][svelte-cli-url]

<br />
<div align="center">
  <h3>@fernando.mema/sv-sentry</h3>
  <p>
    Error tracking with Sentry for SvelteKit (browser + server + session replays)
  </p>

  <a href="https://sentry.io/">View Sentry Docs</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

<!-- ABOUT -->
## About

This addon sets up [Sentry](https://sentry.io/) in your SvelteKit project with:

- Browser-side error tracking
- Server-side error tracking
- Session replay support
- Source map upload configuration
- Vite plugin integration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- INSTALLATION -->
## Installation

```bash
npx sv add @fernandomema/sv-sentry
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- OPTIONS -->
## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `browser` | boolean | `true` | Enable Sentry for browser (client-side) |
| `server` | boolean | `true` | Enable Sentry for server (server-side) |
| `replays` | boolean | `false` | Enable Session Replays (browser only, only asked when `browser` is on) |
| `dsn` | string | `''` | Sentry DSN for `PUBLIC_SENTRY_DSN`. Press Enter to skip and fill later. |
| `authToken` | string | `''` | Sentry auth token for source maps (`SENTRY_AUTH_TOKEN`). Press Enter to skip. |
| `org` | string | `''` | Sentry organization slug (`SENTRY_ORG`). Press Enter to skip. |
| `project` | string | `''` | Sentry project slug (`SENTRY_PROJECT`). Press Enter to skip. |

If you leave the four env options empty, the addon still creates the `.env` / `.env.example` entries with `""` placeholders so you can fill them in afterwards. If you provide values during install, they are written as literal values into `.env` (the `.env.example` file always keeps empty placeholders, never your real tokens).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHAT IT DOES -->
## What It Does

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/sentry.client.ts` | Browser-side Sentry initialization (only when `browser` is on) |
| `src/lib/sentry.server.ts` | Server-side Sentry initialization (only when `server` is on) |

### Files Modified

| File | Changes |
|------|---------|
| `.env` | Adds `PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. Skipped values are written as `""`. |
| `.env.example` | Adds the same keys, always with `""` placeholders (never your real tokens). |
| `src/hooks.server.ts` | Adds Sentry server handle (only when `server` is on) |
| `src/hooks.client.ts` | Adds client-side Sentry import (only when `browser` is on) |
| `vite.config.ts` | Adds Sentry Vite plugin (only when `server` is on) |
| `package.json` | Adds `sentry:sourcemaps` script |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ENVIRONMENT VARIABLES -->
## Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_SENTRY_DSN` | Sentry DSN for client-side error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps upload |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project slug |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- NEXT STEPS -->
## Next Steps

After installation the addon's `nextSteps` output tells you exactly what to do. In short:

1. Fill any empty env placeholders in `.env` (`PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`). If you skipped them during install they are written as `""` placeholders so nothing is broken — they just need values before Sentry can talk to your project.
2. Run `npm run sentry:sourcemaps` to upload source maps after building.
3. If Session Replays are enabled, check the Sentry dashboard for recordings.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Fernando - [@fernandomema](https://github.com/fernandomema)

Project Link: [https://github.com/fernandomema/sv-addons](https://github.com/fernandomema/sv-addons)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGATIONS -->
## Acknowledgments

- [Sentry](https://sentry.io/) - Error tracking platform
- [Svelte CLI](https://svelte.dev/docs/cli) - Official Svelte tooling
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[npm-version-shield]: https://img.shields.io/npm/v/@fernando.mema/sv-sentry.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/@fernando.mema/sv-sentry
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/master/LICENSE.txt
[svelte-cli-shield]: https://img.shields.io/badge/Svelte%20CLI-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[svelte-cli-url]: https://svelte.dev/docs/cli
