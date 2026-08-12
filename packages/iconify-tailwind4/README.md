<a id="readme-top"></a>

[![NPM Version][npm-version-shield]][npm-version-url]
[![MIT License][license-shield]][license-url]
[![Svelte CLI][svelte-cli-shield]][svelte-cli-url]

<br />
<div align="center">
  <h3>@fernandomema/sv-iconify-tailwind4</h3>
  <p>
    Iconify icons integration for Tailwind CSS v4 in SvelteKit
  </p>

  <a href="https://iconify.design/">View Iconify Docs</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

<!-- ABOUT -->
## About

This addon sets up [Iconify](https://iconify.design/) icons in your SvelteKit project with:

- Tailwind CSS v4 plugin integration
- Multiple icon set support (10 icon sets available)
- Customizable icon prefix
- Icon component wrapper for Svelte

**Requires:** `@tailwindcss/vite` (Tailwind CSS v4)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- INSTALLATION -->
## Installation

```bash
npx sv add @fernandomema/sv-iconify-tailwind4
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- OPTIONS -->
## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `iconSets` | multiselect | `['tabler']` | Icon sets to install |
| `prefix` | string | `i` | Prefix for icon classes |

### Available Icon Sets

| Value | Label |
|-------|-------|
| `tabler` | Tabler Icons |
| `lucide` | Lucide Icons |
| `heroicons` | Heroicons |
| `ph` | Phosphor Icons |
| `mdi` | Material Design Icons |
| `fa6-solid` | Font Awesome 6 Solid |
| `fa6-regular` | Font Awesome 6 Regular |
| `bi` | Bootstrap Icons |
| `codicon` | Codicon |
| `octicon` | Octicon |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHAT IT DOES -->
## What It Does

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/components/Icon.svelte` | Icon wrapper component for Svelte |

### Files Modified

| File | Changes |
|------|---------|
| `src/routes/layout.css` | Adds `@plugin "@iconify/tailwind4"` |
| `package.json` | Adds icon set packages and `@iconify/tailwind4` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

After installation, use icons in your templates:

```svelte
<!-- Using the Icon component -->
<Icon name="home" />
<Icon name="user" class="text-blue-500" />

<!-- Or using CSS classes directly -->
<span class="i-tabler-home"></span>
<span class="i-lucide-user"></span>
```

Browse all available icons at [Iconify](https://icon-sets.iconify.design/).

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

- [Iconify](https://iconify.design/) - Icon framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Svelte CLI](https://svelte.dev/docs/cli) - Official Svelte tooling
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[npm-version-shield]: https://img.shields.io/npm/v/@fernandomema/sv-iconify-tailwind4.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/@fernandomema/sv-iconify-tailwind4
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/master/LICENSE.txt
[svelte-cli-shield]: https://img.shields.io/badge/Svelte%20CLI-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[svelte-cli-url]: https://svelte.dev/docs/cli
