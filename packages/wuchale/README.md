<a id="readme-top"></a>

[![NPM Version][npm-version-shield]][npm-version-url]
[![MIT License][license-shield]][license-url]
[![Svelte CLI][svelte-cli-shield]][svelte-cli-url]

<br />
<div align="center">
  <h3>@fernandomema/sv-wuchale</h3>
  <p>
    i18n with AI-powered translations via OpenCode for SvelteKit
  </p>

  <a href="https://wuchale.dev/">View Wuchale Docs</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

<!-- ABOUT -->
## About

This addon sets up [Wuchale](https://wuchale.dev/) i18n in your SvelteKit project with:

- Multi-locale configuration (10 languages supported)
- Svelte reactive adapter for components
- Vanilla JS adapter for TypeScript files
- AI-powered translation via OpenCode API (DeepSeek V4 Flash)
- Vite plugin integration
- Translation extraction scripts

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- INSTALLATION -->
## Installation

```bash
npx sv add @fernandomema/sv-wuchale
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- OPTIONS -->
## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locales` | multiselect | `['en', 'es']` | Locales to support: en, es, ca, pt, fr, de, it, zh, ja, ar |
| `adapters` | multiselect | `['svelte']` | Adapters: Svelte (reactive) and/or Vanilla JS |
| `ai` | boolean | `true` | Enable AI-powered translation via OpenCode |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHAT IT DOES -->
## What It Does

### Files Created

| File | Purpose |
|------|---------|
| `wuchale.config.js` | Wuchale configuration with locales, adapters, and AI settings |
| `src/lib/locales/main.loader.svelte.js` | Svelte reactive loader (if Svelte adapter selected) |
| `src/lib/locales/main.loader.server.svelte.js` | Svelte server loader (if Svelte adapter selected) |
| `src/lib/locales/js.loader.js` | Vanilla JS loader (if Vanilla adapter selected) |
| `src/lib/locales/js.loader.server.js` | Vanilla JS server loader (if Vanilla adapter selected) |

### Files Modified

| File | Changes |
|------|---------|
| `.gitignore` | Adds `.wuchale` directory |
| `.env` | Adds `OPENCODE_API_KEY` (if AI enabled) |
| `.env.example` | Adds `OPENCODE_API_KEY` template |
| `vite.config.ts` | Adds Wuchale Vite plugin |
| `package.json` | Adds `i18n` and `i18n:extract` scripts |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ENVIRONMENT VARIABLES -->
## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENCODE_API_KEY` | OpenCode API key for AI translations (if AI enabled) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- NEXT STEPS -->
## Next Steps

After installation:

1. Set `OPENCODE_API_KEY` in `.env` for AI translations
2. Run `npx wuchale` to extract and translate strings
3. Use `npx wuchale --extract-only` to extract without translating
4. Name your Svelte files with `.svelte.ts` extension for automatic string extraction

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

- [Wuchale](https://wuchale.dev/) - i18n framework with AI translations
- [OpenCode](https://opencode.ai/) - AI translation API
- [Svelte CLI](https://svelte.dev/docs/cli) - Official Svelte tooling
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[npm-version-shield]: https://img.shields.io/npm/v/@fernandomema/sv-wuchale.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/@fernandomema/sv-wuchale
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/master/LICENSE.txt
[svelte-cli-shield]: https://img.shields.io/badge/Svelte%20CLI-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[svelte-cli-url]: https://svelte.dev/docs/cli
