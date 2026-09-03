<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/fernandomema/sv-addons">
    <img src="https://socialify.git.ci/fernandomema/sv-addons/image?font=KoHo&language=1&name=1&owner=1&stargazers=1&theme=Light" alt="SV Addons" width="640" height="320">
  </a>

  <h3 align="center">SV Addons</h3>

  <p align="center">
    Community add-ons for the <a href="https://svelte.dev/docs/cli">Svelte CLI</a>
    <br />
    <a href="https://github.com/fernandomema/sv-addons"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/fernandomema/sv-addons">View Demo</a>
    &middot;
    <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#available-addons">Available Addons</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#development">Development</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#publishing">Publishing</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

**SV Addons** is a collection of community add-ons for the [Svelte CLI](https://svelte.dev/docs/cli/community). These addons automate the setup of common integrations in SvelteKit projects, saving you time from repetitive configuration tasks.

Each addon follows the official [community addon specification](https://svelte.dev/docs/cli/community) and uses the `sv` CLI's built-in file transformation API to safely modify your project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Svelte][Svelte.dev]][Svelte-url]
- [![SvelteKit][SvelteKit]][SvelteKit-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![tsdown][tsdown]][tsdown-url]
- [![pnpm][pnpm]][pnpm-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AVAILABLE ADDONS -->
## Available Addons

| Addon | Description | Install |
|-------|-------------|---------|
| `@fernando.mema/sv-prisma` | Prisma ORM setup with PostgreSQL/MySQL/SQLite and driver adapter support | `npx sv add @fernando.mema/sv-prisma` |
| `@fernando.mema/sv-better-auth-prisma` | Better Auth with Prisma adapter, admin plugin, and demo pages | `npx sv add @fernando.mema/sv-better-auth-prisma` |
| `@fernando.mema/sv-wuchale` | i18n with AI-powered translations via OpenCode (DeepSeek V4 Flash) | `npx sv add @fernando.mema/sv-wuchale` |
| `@fernando.mema/sv-sentry` | Error tracking with Sentry (browser + server + session replays) | `npx sv add @fernando.mema/sv-sentry` |
| `@fernando.mema/sv-iconify-tailwind4` | Iconify icons integration for Tailwind CSS v4 | `npx sv add @fernando.mema/sv-iconify-tailwind4` |
| `@fernando.mema/sv-umami` | Privacy-friendly analytics with Umami (page views + custom events + server-side tracking) | `npx sv add @fernando.mema/sv-umami` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- A SvelteKit project created with `sv`

### Installation

Create a new SvelteKit project and add addons:

```bash
# Create a new SvelteKit project
npx sv create my-app --template minimal --types ts

# Navigate to the project
cd my-app

# Add any combination of addons
npx sv add @fernando.mema/sv-prisma
npx sv add @fernando.mema/sv-better-auth-prisma
npx sv add @fernando.mema/sv-wuchale
npx sv add @fernando.mema/sv-sentry
npx sv add @fernando.mema/sv-iconify-tailwind4
npx sv add @fernando.mema/sv-umami
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

Each addon is interactive and will ask you configuration questions during installation. For example:

```bash
# Add Prisma with PostgreSQL
npx sv add @fernando.mema/sv-prisma
# ? Which database dialect? PostgreSQL
# ? Which Prisma adapter? @prisma/adapter-pg
# ? Where should the Prisma client be generated? src/lib/generated/prisma

# Add Better Auth with Prisma (requires prisma addon first)
npx sv add @fernando.mema/sv-better-auth-prisma
# ? Include the Better Auth admin plugin? Yes
# ? Which demo would you like to include? Email & Password

# Add Wuchale i18n with AI translations
npx sv add @fernando.mema/sv-wuchale
# ? Which locales? en, es
# ? Which adapters? Svelte
# ? Enable AI-powered translation? Yes
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEVELOPMENT -->
## Development

```bash
# Clone the repository
git clone https://github.com/fernandomema/sv-addons.git
cd sv-addons

# Install dependencies
pnpm install

# Build all addons
pnpm build

# Build in watch mode
pnpm build:watch
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TESTING -->
## Testing

Test addons locally using the `file:` protocol:

```bash
# Create a test project
npx sv create test-project --template minimal --types ts

# Test an addon
cd test-project
npx sv add file:../sv-addons/packages/prisma
```

Run the automated test suite:

```bash
pnpm test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PUBLISHING -->
## Publishing

```bash
# Build all packages
pnpm build

# Publish all packages to npm
pnpm -r publish --access public

# Or publish individual packages
cd packages/prisma
pnpm build
npm publish --access public
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Prisma addon
- [x] Better Auth + Prisma addon
- [x] Wuchale i18n addon
- [x] Sentry addon
- [x] Iconify Tailwind CSS v4 addon
- [ ] S3 Object Storage addon
- [ ] Email (Resend) addon
- [ ] Generic CRUD framework addon
- [ ] Capacitor mobile wrapper addon
- [ ] Web Push notifications addon

See the [open issues](https://github.com/fernandomema/sv-addons/issues) for a full list of proposed features (and known issues).

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

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

- [Svelte Team](https://svelte.dev/) - For the amazing framework and CLI
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - For the README template
- [Svelte CLI Community Addons](https://svelte.dev/docs/cli/community) - For the addon specification
- [Better Auth](https://www.better-auth.com/) - Auth framework
- [Wuchale](https://wuchale.dev/) - i18n framework with AI translations
- [Sentry](https://sentry.io/) - Error tracking
- [Iconify](https://iconify.design/) - Icon framework
- [Prisma](https://www.prisma.io/) - Database ORM

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/fernandomema/sv-addons.svg?style=for-the-badge
[contributors-url]: https://github.com/fernandomema/sv-addons/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/fernandomema/sv-addons.svg?style=for-the-badge
[forks-url]: https://github.com/fernandomema/sv-addons/network/members
[stars-shield]: https://img.shields.io/github/stars/fernandomema/sv-addons.svg?style=for-the-badge
[stars-url]: https://github.com/fernandomema/sv-addons/stargazers
[issues-shield]: https://img.shields.io/github/issues/fernandomema/sv-addons.svg?style=for-the-badge
[issues-url]: https://github.com/fernandomema/sv-addons/issues
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/fernandomema
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[SvelteKit]: https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[SvelteKit-url]: https://kit.svelte.dev/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[tsdown]: https://img.shields.io/badge/tsdown-FF6B35?style=for-the-badge&logo=node.js&logoColor=white
[tsdown-url]: https://tsdown.dev/
[pnpm]: https://img.shields.io/badge/pnpm-FF6C37?style=for-the-badge&logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io/
