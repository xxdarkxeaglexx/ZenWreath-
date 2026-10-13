# ZenWreath — repaired v84 GitHub source

This is the editable v84 source, with development setup and server validation fixes.
Base export: ee55bae4850944dd718ae91e11ad0bbf2fe7769b.
See docs/FIXES.md for verification and remaining limitations.
Live game: https://lantern-grove.xxdarkxeaglexx.chatgpt.site

## Start here

For a conversation that accepts file attachments, attach this ZIP and ask Codex to read
this file before editing. For the GitHub plugin, first extract the ZIP, create a
repository under your GitHub account, and upload the contents of the ZenWreath
folder to that repository. The package.json file should be at the repository root.
Include dotfiles such as .gitignore, .npmrc and .openai/hosting.json.
Connect/authorize that repository for the GitHub plugin and send Codex its URL.
Uploading a ZIP attachment does not itself create or connect a GitHub repository.
If uploading through GitHub's website, upload extracted files in batches if needed;
do not commit only the ZIP. A private repository keeps the source private.

Suggested first task:
“Read START_HERE.md and inspect ZenWreath. Preserve the existing game and character
progress. Improve multiplayer synchronization, test two clients, and explain any
hosting or authentication changes before deploying.”

## What is included

- Complete tracked web game code, UI, images and original game assets.
- Multiplayer, account, beta dashboard and server routes.
- Database schema and SQL migrations; tests and dependency lockfile.
- Existing Android/iOS native starter, with its separate native/SETUP.md.
- Original hosting configuration for the existing ZenWreath Site.

No player database, saved user accounts, runtime secrets, Git history, installed
dependencies, build cache or signing credentials are included. The native starter
is an offline edition, not an APK and not equivalent to the hosted multiplayer game.

## Development

Use Node.js 24 (the tested runtime) and pnpm 11.25.0 (packageManager in package.json).
From this folder:

    pnpm install --frozen-lockfile
    node scripts/prepare-launch-assets.mjs
    pnpm run build

The build prepares versioned /launch/v84 assets. To initialize the local DB after
building, apply every drizzle/*.sql migration in filename order. For each file:

    node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/NAME.sql

Replace NAME.sql with each actual migration filename. Apply each migration only
once per local database. Then run:

    pnpm run dev

Use the local URL printed by the dev server. The portable development server has
mock sign-in at /signin-with-chatgpt?return_to=/ . It does not log you into production.
See docs/framework-setup.md for the original framework setup and deployment architecture.

Relevant regression check:

    npm test

This exercises two simulated clients against the real server handlers and an
in-memory SQLite database; DOM/canvas are mocked. It is not a real-phone playtest.

## Code map

- public/game.html: main game, startup, base world and render loop.
- public/*.js: gameplay, art, controls, equipment, rooms and feature layers.
- public/multiplayer.js: room requests, gameplay snapshots, base multiplayer.
- public/quantum-link.js: lightweight presence, interpolation, short prediction.
- server/rooms.ts: authenticated room membership, movement and combat state.
- app/api/rooms/route.ts: multiplayer HTTP endpoint.
- public/realm-invites.js: invitation and joining flow.
- server/grove.ts and app/api/grove: profiles and saved game operations.
- drizzle/: database migrations. tests/: regression checks.

## Current multiplayer limits

v84 uses HTTP polling, not WebSockets or WebRTC. Presence is single-flight with a
120ms minimum interval while active; real latency depends on network and server.
Full world snapshots are requested about every 300ms. Short prediction is capped
at 100ms. Current clients let presence own shared positions so delayed action/tick
requests do not rewind them. This is a stability fix, not instant synchronization.
A persistent transport requires a supported room service and reconnect/state
recovery design. Do not label the current transport instant or quantum networking.

## Hosting and continuity

The included .openai/hosting.json identifies the EXISTING live ZenWreath Site.
Keep it when continuing this exact Site with Sites tools. Do not deploy over that
Site when merely testing a copy. GitHub commits do not automatically update it.
For an independent deployment, explicitly configure new hosting, a database and
real authentication. GitHub Pages alone cannot run these server routes or the
multiplayer database. Never trust user-supplied identity headers on a new host.
Production ChatGPT identity headers are provided by the existing hosting platform.

Beta v84 passed the source runtime integration test and production build, and was
published successfully. Two physical phones were not tested during this export.
