<a id="readme-top"></a>

[![NPM Version][npm-version-shield]][npm-version-url]
[![MIT License][license-shield]][license-url]
[![Svelte CLI][svelte-cli-shield]][svelte-cli-url]

<br />
<div align="center">
  <h3>@fernando.mema/sv-better-auth-prisma</h3>
  <p>
    Better Auth setup with Prisma adapter, admin plugin, and demo pages for SvelteKit
  </p>

  <a href="https://www.better-auth.com/">View Better Auth Docs</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

<!-- ABOUT -->
## About

This addon sets up [Better Auth](https://www.better-auth.com/) in your SvelteKit project with:

- Better Auth server configuration with Prisma adapter
- SvelteKit hooks for session management
- Admin plugin with role-based access control
- Email & password authentication
- Optional GitHub OAuth demo
- Demo pages for login/logout flow

**Requires:** `@fernandomema/sv-prisma` (or manual Prisma setup)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- INSTALLATION -->
## Installation

```bash
npx sv add @fernandomema/sv-better-auth-prisma
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- OPTIONS -->
## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `admin` | boolean | `true` | Include the Better Auth admin plugin |
| `demo` | multiselect | `['password']` | Demo pages to include: Email & Password, GitHub OAuth |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHAT IT DOES -->
## What It Does

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/server/auth.ts` | Better Auth server configuration |
| `src/lib/server/db/auth.schema.ts` | Auth schema placeholder |
| `src/routes/demo/better-auth/+page.svelte` | Demo page (if selected) |
| `src/routes/demo/better-auth/login/+page.svelte` | Login demo page (if selected) |

### Files Modified

| File | Changes |
|------|---------|
| `.env` | Adds `ORIGIN`, `BETTER_AUTH_SECRET`, `GITHUB_*` vars |
| `.env.example` | Adds environment variable templates |
| `src/app.d.ts` | Adds `User` and `Session` types to `App.Locals` |
| `src/hooks.server.ts` | Adds Better Auth session handler |
| `package.json` | Adds `auth:schema` script |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ENVIRONMENT VARIABLES -->
## Environment Variables

| Variable | Description |
|----------|-------------|
| `ORIGIN` | The app origin (base URL), e.g. `http://localhost:5173` |
| `BETTER_AUTH_SECRET` | Secret for signing tokens (32+ chars for production) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID (if GitHub demo selected) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (if GitHub demo selected) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- NEXT STEPS -->
## Next Steps

After installation:

1. Run `npm run auth:schema` to generate the auth schema
2. Run `npm run db:push` to update your database
3. Check `ORIGIN` & `BETTER_AUTH_SECRET` in `.env`
4. If using GitHub OAuth, set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`
5. Visit `/demo/better-auth` route to view the demo (if selected)

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

- [Better Auth](https://www.better-auth.com/) - Authentication framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Svelte CLI](https://svelte.dev/docs/cli) - Official Svelte tooling
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[npm-version-shield]: https://img.shields.io/npm/v/@fernando.mema/sv-better-auth-prisma.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/@fernando.mema/sv-better-auth-prisma
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/master/LICENSE.txt
[svelte-cli-shield]: https://img.shields.io/badge/Svelte%20CLI-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[svelte-cli-url]: https://svelte.dev/docs/cli
