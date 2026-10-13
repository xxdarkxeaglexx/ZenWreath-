# Source repair and verification — 2026-10-13

## Fixed

- Development startup now prepares the versioned game scripts and styles. A clean clone no longer needs a manual asset-preparation step before `npm run dev`.
- Runtime and layout tests import declared esbuild/PostCSS dependencies instead of scanning pnpm internal directory names. The dependency lockfile includes both direct test dependencies.
- `npm test` runs all 25 existing regression files.
- Multiplayer presence and action position validation rejects solid-wall tile positions; array-shaped room requests are rejected. A regression check confirms rejected presence cannot change stored player coordinates.
- Source package is named zenwreath. Compiler caches and native build outputs are excluded from Git. There is no README file; setup documentation is in START_HERE.md, docs/framework-setup.md, and native/SETUP.md.

## Verified

- Node 24.19.0 and pnpm 11.25.0.
- `pnpm install --frozen-lockfile`: passed using the repository lockfile.
- `npm test`: all 25 test files passed with the installed locked dependencies.
- `npm run build`: passed; all game and API routes compiled.
- Two simulated clients exercise create/join, movement synchronization, travel, magic effects, expired invites, stale updates, and progression persistence against the actual room handlers and SQLite. DOM and canvas are mocked.

## Still needs work or external access

- No physical two-phone playtest or visual browser playthrough was performed for this repair. Passing regression tests does not prove the game is bug-free.
- Multiplayer is HTTP polling with interpolation, not WebSockets or instantaneous networking. Latency, load, and real-device disconnect recovery need field testing.
- Player progression and parts of combat still accept client-provided state. This is a cooperative beta, not a cheat-resistant authoritative competitive server. The new wall check is destination validation, not full movement path or speed validation.
- Android/iOS source is included; native builds and signing were not tested here.
- The live Sites deployment was not changed. GitHub alone does not host the multiplayer backend. Independent hosting needs a database and trusted authentication.
- GitHub rejected the initial file upload with HTTP 403, Resource not accessible by integration. No files or commits were uploaded. Reauthorize the GitHub connection for repository contents write access before retrying.

## Share with a collaborator

Extract this archive and open the ZenWreath directory. Follow START_HERE.md. The repository target is https://github.com/xxdarkxeaglexx/ZenWreath- . To upload manually, commit the extracted source files, not just this ZIP. Add your friend's GitHub username under the repository's collaborator settings if they need direct write access.
