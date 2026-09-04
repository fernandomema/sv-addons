# Conventions for AI agents working on sv-addons

## Publishing

- Bump the package version (`packages/<pkg>/package.json`) **in the same commit** as the code changes. Never split "fix" + "chore: bump" into two commits — the version bump is part of the change being published, not a follow-up.
- Commit message format: `feat/fix/chore(<pkg>): <summary>` (matches the existing log style on `main`).
- Push order: commit → push → publish. Never publish before the commit+push are visible on `origin/main`.
- npm 2FA OTP must be pasted by the user directly in their terminal — do not request it through chat. Trigger the publish command (which blocks on OTP) and instruct the user to run the same command in their own terminal.

## Testing

- Run the tests from the **repo root**, not from inside a package: `pnpm exec vitest run --root /home/fernando/gitProjects/sv-addons packages/<pkg>`. Running vitest from `packages/<pkg>` makes the workspace-level `include: 'packages/*/tests/**'` glob miss everything.
- `sv/testing`'s `createSetupTest` has bugs with vitest 2/3 — it calls `test.beforeAll` on the result of `test.extend({})`, which does not inherit hooks in modern vitest. **Bypass it**: use `setup`, `createProject`, `add` (from `sv`), and `addPnpmBuildDependencies` (from `sv/testing`) directly inside a vitest top-level `beforeAll`. See `packages/sentry/tests/index.test.ts` for the working pattern.
- `vitest.config.ts` should **not** include `globalSetup: ['tests/setup/global.js']` once the bypass is in place — that global setup exists only to feed fixtures into `createSetupTest`, which we no longer use.

## sv@0.13.2 API gotchas

- `Workspace.file` keys: `viteConfig`, `svelteConfig`, `typeConfig`, `stylesheet`, `package`, `gitignore`, `prettierignore`, `prettierrc`, `eslintConfig`, `vscodeSettings`, `vscodeExtensions`. There is **no** `file.app` — for `src/app.html` and `src/app.d.ts`, pass the literal relative path string instead. Passing `undefined` (e.g. `file.app` when it doesn't exist) crashes sv with `paths[1] must be of type string. Received undefined`.
- The `run` callback receives `cwd` as a parameter. Pass it to `defineEnv({ sv, cwd, dependencyVersion })`. Do **not** use `process.cwd()` — that resolves to the host process, not the target project.

## Commits

- Never commit without explicit user instruction.
- Before any commit/push, show `git status --short` so the user sees exactly what is about to land.
