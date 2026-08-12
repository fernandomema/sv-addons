# Contributing to SV Addons

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

## Setup

```bash
# Clone the repository
git clone https://github.com/your-org/sv-addons.git
cd sv-addons

# Install dependencies
pnpm install

# Build all addons
pnpm build
```

## Project Structure

```
sv-addons/
├── packages/
│   ├── prisma/              # @sv-addon/prisma
│   ├── better-auth-prisma/  # @sv-addon/better-auth-prisma
│   ├── wuchale/             # @sv-addon/wuchale
│   ├── sentry/              # @sv-addon/sentry
│   └── iconify-tailwind4/   # @sv-addon/iconify-tailwind4
├── tests/
│   └── setup/
│       └── global.js        # Test global setup
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── vitest.config.ts
```

## Creating an Addon

Each addon follows the same structure:

```
packages/my-addon/
├── src/
│   └── index.ts        # Addon entry point
├── package.json
├── tsdown.config.ts    # Build configuration
└── tests/
    └── index.test.ts   # Tests
```

### Addon Entry Point

Every addon exports a default object via `defineAddon()`:

```typescript
import { defineAddon, defineAddonOptions } from 'sv';
import { transforms, color, dedent } from '@sveltejs/sv-utils';

const options = defineAddonOptions()
  .add('myOption', {
    question: 'Do you want X?',
    type: 'boolean',
    default: true
  })
  .build();

export default defineAddon({
  id: 'my-addon',
  shortDescription: 'What it does',
  homepage: 'https://docs.example.com',
  options,
  setup: ({ isKit, unsupported }) => {
    if (!isKit) unsupported('Requires SvelteKit');
  },
  run: ({ sv, options, file, directory, language }) => {
    // Add dependencies
    sv.dependency('my-package', '^1.0.0');

    // Edit files with transforms
    sv.file(
      `${directory.lib}/server/db.ts`,
      transforms.text(({ content }) => {
        if (content) return false; // Skip if exists
        return dedent`
          export const db = createDb();
        `;
      })
    );
  },
  nextSteps: ({ packageManager }) => [
    `Run ${color.command('npm run db:push')} to apply changes`
  ]
});
```

### Available Transforms

- `transforms.script()` - JS/TS AST manipulation
- `transforms.svelteScript()` - Svelte file script blocks
- `transforms.json()` - JSON config files
- `transforms.text()` - Plain text files
- `transforms.css()` - CSS files
- `transforms.toml()` - TOML files

### Common Operations

```typescript
// Add imports
js.imports.addNamed(ast, { from: 'pkg', imports: ['foo'] });
js.imports.addDefault(ast, { from: 'pkg', as: 'name' });

// Add Vite plugin
js.vite.addPlugin(ast, { code: 'tailwindcss()', mode: 'prepend' });

// Add SvelteKit hook
js.kit.addHooksHandle(ast, { language, newHandleName, handleContent, comments });

// Edit JSON
json.packageScriptsUpsert(data, 'db:push', 'prisma db push');

// Edit text
text.upsert(content, 'DATABASE_URL', { value: '"postgres://..."' });
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

Tests use the `sv/testing` module which creates real SvelteKit projects and runs your addon against them.

## Publishing

1. Update version in `package.json`
2. Build: `pnpm build`
3. Publish: `npm publish --access public`

## Code Style

- Use TypeScript
- Follow existing patterns in the codebase
- Use AST transforms, not string templates
- Make transforms idempotent (return `false` if already applied)
- Use `dedent` for multiline strings

## Questions?

Open an issue or start a discussion on GitHub.
