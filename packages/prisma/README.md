<a id="readme-top"></a>

[![NPM Version][npm-version-shield]][npm-version-url]
[![MIT License][license-shield]][license-url]
[![Svelte CLI][svelte-cli-shield]][svelte-cli-url]

<br />
<div align="center">
  <h3>@fernando.mema/sv-prisma</h3>
  <p>
    Prisma ORM 7.10+ setup for SvelteKit with PostgreSQL, MySQL/MariaDB, SQLite, and driver adapter support
  </p>

  > **Note:** Prisma 8 is currently in RC. This addon targets the stable 7.10 line to avoid RC-only peer conflicts. The classic `prisma-client` generator + driver-adapter flow used here is identical across 7.x and 8, so generated code is forward-compatible.

  <a href="https://www.prisma.io/">View Prisma Docs</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &middot;
  <a href="https://github.com/fernandomema/sv-addons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

<!-- ABOUT -->
## About

This addon sets up [Prisma](https://www.prisma.io/) **v7.10** in your SvelteKit project with:

- Prisma schema using the `prisma-client` generator (the modern, `output`-required generator)
- Prisma client singleton with dev hot-reload support
- `prisma.config.ts` wired to `dotenv` + `env()` helper
- Database scripts (generate, push, migrate, studio)
- Environment variable configuration
- Optional driver adapter support (PostgreSQL via `pg`, MySQL/MariaDB via `mariadb`, LibSQL/Turso)

> **Note:** Prisma 8 is currently in RC and pulls beta transitive dependencies (e.g. `alchemy`) that break `npm install` in some environments due to peer conflicts with `vite`. This addon targets the latest stable 7.10 line until Prisma 8 ships GA. The classic `prisma-client` generator + driver-adapter flow works identically on both versions, so nothing in your generated code needs to change when you bump later.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- INSTALLATION -->
## Installation

```bash
npx sv add @fernandomema/sv-prisma
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- OPTIONS -->
## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|/MariaDB, or SQLite |
| `adapter` | select | `none` | Driver adapter: none, pg, mariadb, or libsql |
| `output` | string | `src/lib/generated/prisma` | Prisma client output path |

### Adapter Options

| Adapter | Use Case |
|---------|----------|
| None | Standard Prisma client (recommended for most cases) |
| `@prisma/adapter-pg` | PostgreSQL driver adapter for connection pooling (Neon, etc.) |
| `@prisma/adapter-mariadb` | MySQL/MariaDB driver adapter (uses the official `mariadb` driver) |
| `@prisma/adapter-libsql` | LibSQL/Turso driver adapter (optional `TURSO_AUTH_TOKEN`)
| `@prisma/adapter-libsql` | LibSQL/Turso driver adapter |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- WHAT IT DOES -->
## What It Does

### Files Created

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Prisma schema using the `prisma-client` generator with required `output` |
| `prisma.config.ts` | Prisma 7+ configuration file (`defineConfig` + `env('DATABASE_URL')`) |
| `src/lib/server/db.ts` | Prisma client singleton with global caching |

### Files Modified

| File | Changes |
|------|---------|
| `.env` | Adds `DATABASE_URL` (and `TURSO_AUTH_TOKEN` when using libsql) |
| `.env.example` | Adds `DATABASE_URL` template (and `TURSO_AUTH_TOKEN` when using libsql) |
| `package.json` | Adds scripts: `db:generate`, `db:push`, `db:migrate`, `db:studio` |

### Scripts Added

| Script | Command | Description |
|--------|---------|-------------|
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:push` | `prisma db push` | Push schema to database |
| `db:migrate` | `prisma migrate dev` | Create and run migrations |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |
| `build` | `prisma generate && vite build` | Generate client before build |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ENVIRONMENT VARIABLES -->
## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@localhost:5432/mydb?schema=public` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- NEXT STEPS -->
## Next Steps

After installation:

1. Run `npx prisma generate` to generate the Prisma client
2. Run `npm run db:push` to sync your schema to the database
3. Check `DATABASE_URL` in `.env` and adjust it to your needs
4. Add your models to `prisma/schema.prisma`

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

- [Prisma](https://www.prisma.io/) - Database ORM
- [Svelte CLI](https://svelte.dev/docs/cli) - Official Svelte tooling
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[npm-version-shield]: https://img.shields.io/npm/v/@fernando.mema/sv-prisma.svg?style=for-the-badge
[npm-version-url]: https://www.npmjs.com/package/@fernando.mema/sv-prisma
[license-shield]: https://img.shields.io/github/license/fernandomema/sv-addons.svg?style=for-the-badge
[license-url]: https://github.com/fernandomema/sv-addons/blob/master/LICENSE.txt
[svelte-cli-shield]: https://img.shields.io/badge/Svelte%20CLI-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[svelte-cli-url]: https://svelte.dev/docs/cli
