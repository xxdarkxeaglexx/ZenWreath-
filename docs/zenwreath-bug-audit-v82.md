# ZenWreath Beta v82 — multiplayer repair and game audit

Reviewed October 13, 2026. Site: https://lantern-grove.xxdarkxeaglexx.chatgpt.site

**This is a source audit and automated runtime test, not a full hands-on playthrough.** Supported browser controls were unavailable. Touch feel, actual phone rendering, browser sign-in redirects, network latency, and a two-phone session still need device testing. This report lists the bugs and gaps found; it cannot certify that no others exist.

## The reported link

`https://lantern-grove.xxdarkxeaglexx.chatgpt.site/?room=RW32HC37`

The production database showed this room as playing, with one membership record and an expiry of **October 14 at 1:18 a.m. America/Chicago**. It was not expired when checked. Recent production Worker error logs were empty. Those logs do not capture browser JavaScript exceptions. The available evidence does not identify the exact screen or sign-in state encountered by the friend.

## Confirmed bugs repaired

| Severity | Finding | Repair and evidence |
| --- | --- | --- |
| Critical | `towns.js` and `town-life.js` both declared `townCast` and `townUpdate` at global scope. Loading the shipped scripts together raised a SyntaxError and stopped the entire town-life module from loading. | Renamed the conflicting bindings. Added a regression that evaluates every shipped script in the page's actual order. Previously, isolated module tests missed this failure. |
| High | Peaceful mode blocked social/auth functions and redirected an attempted room join to Difficulty & Controls. Startup also deliberately ignored invites with this preference. | Removed the social lock, honor incoming invites, and use the party's combat difficulty while connected. The solo Peaceful preference is retained for leaving the party. Reproduced and verified in the combined runtime. |
| High | Host co-op checkpoints copied the pre-party world. Closing or reloading without a clean leave could restore old quest state, despite saving the latest character. | Host checkpoints now preserve the current shared realm. Guest checkpoints continue to preserve the guest's separate solo world. Tested local saves and normal leave. |
| High | Stale room replies were rejected by the base updater, but outer inventory, song and town hooks could still apply them. | Reject stale or unrelated replies before any wrapper executes. A deliberately stale reply is now ignored by the whole chain. |
| Medium | The outer page discarded `?play=1`, which is the multiplayer sign-in return flag. Lowercase room query values were also discarded. | Forward the multiplayer flag and normalize room codes before creating the game iframe. |
| Medium | Joining through a pasted code while signed out could lose that specific room during sign-in. | The join sign-in link now explicitly returns to the chosen room. Tested the rendered return URL. Actual browser authentication remains unverified. |
| Medium | A failed automatic join offered only Back, and room requests had no timeout. The polling badge described every failure as reconnecting, including expired rooms. | Added a 12-second request timeout, visible failure messages, Retry, Cancel, and Reconnect controls. Expired rooms are identified. An expired party can be replaced when the player requests a fresh invite. Tested failure/retry and expired-room replacement. |
| Medium | Startup invite handling depended on the welcome dialog still being open after account loading. A player who moved to another screen could miss the invite. | Route the explicit invite after terms/account readiness without requiring that particular dialog. |
| Medium | Loading a different cloud quest remained available during an active party, allowing the local world to be replaced while connected. | Block that switch during co-op, with an explanation. Party progress continues to save. |
| Low | An existing member's last-seen timestamp was not refreshed by rejoining. They could appear away until the next tick. | Refresh presence on successful join. |

All join entry points now use the same join flow: incoming links, pasted codes, and online-party buttons.

## Remaining bugs, gaps, and limitations

| Priority | Finding | Suggested fix |
| --- | --- | --- |
| High | Co-op spending still uses the shared room's light balance, while personal checkpoints charge only the buyer. A guest's visible spending power can therefore differ from the balance they retain afterward. | Make wallets server-owned and per player, or explicitly design and display a separate party fund. Migrate existing balances without duplicating money. |
| High | This checkout contains self-reported activity/habit rewards, but no implemented Google Health/Health Connect step-reading integration was found. The native dependencies and current privacy text also describe no health-sensor access. | Locate any separate integration you already have, then connect it to this project and test real device permissions, daily reward deduplication, and sync. Do not describe manual check-ins as verified physical activity. |
| High | The native release entry point explicitly disables network requests, profiles, cloud saves, and rooms. This repair updates the hosted web game; it does not turn that offline native edition into multiplayer. | Choose an online-capable native build, share its account/save contract with the web game, and test deep-link handoff and upgrades on devices. |
| Medium | The multiplayer server accepts client-reported character XP and positions. It is not hardened against altered clients or dishonest imported saves. | Before competitive features, add server-owned rewards, movement validation, and versioned save reconciliation. Keep legitimate offline progress migration explicit. |
| Medium | Room state is polled about every 450 ms, with full world snapshots. There is no verified two-phone latency or disconnect stress test. | Measure on real mobile connections; use incremental updates and a persistent connection if needed. Add latency and disconnect diagnostics before increasing the player cap. |
| Medium | Simultaneous cross-device play still uses whole-save cloud writes. No cross-device conflict-resolution test establishes that two active sessions cannot overwrite each other. | Add save revisions and conflict detection; offer a recovery choice before replacing divergent progress. |
| Low | Rooms expire after 24 hours and support four players. This is a temporary party system, not a persistent realm server. | Show invite expiry in the lobby and consider renewable invitations or persistent realms as a separate feature. |

## Validation performed

- Loaded all game scripts together in the exact HTML order with mocked DOM/canvas APIs. This exposed the duplicate global declarations that every isolated test missed.
- Ran two independent JavaScript client contexts against the actual room/account handlers and an in-memory SQLite database using the project's migrations.
- Created the host's current-realm invite, joined with a different profile, synchronized both players, rendered both game states, and traveled together through the shop, inn, dungeon, and outdoors.
- Checked separate XP, weapon, armor, local save, cloud save, guest solo-world restoration, host current-world persistence, stale-response rejection, and return from co-op.
- Rendered all five realms under Medium and Hard through the combined game runtime; tested startup joining with a Peaceful preference and cloud-restored character.
- Tested expired-room errors, retry, pasted-code sign-in returns, and replacement invitations.
- Ran the existing suites covering combat, ranged weapons, inventories, class progression, safe towns, missions, friend consent, natural discoveries, fishing, navigation, fullscreen logic, dungeon layouts, geometry, and terms/beta gates.
- Built the production release successfully.

The canvas mock checks execution, not visual quality. Automated position changes and API actions are not a manual traversal or a substitute for real controls. Browser authentication, clipboard/share sheets, installed-app links, audio, frame rate, and real touch controls remain device-test items.

## Suggested improvements, in order

1. **Connection clarity:** show the signed-in adventurer, party members, connection state, and invite expiry in one compact party panel.
2. **Progress confidence:** show local/cloud save status, retain recoverable save revisions, and separate personal money from party resources.
3. **One invitation flow:** make Invite and Join the primary actions everywhere; retain a readable eight-character code as a fallback.
4. **Real-device release checks:** test two distinct accounts on Android and iPhone, including messaging-app browsers, rotation, background/resume, weak networks, and a full five-realm run.
5. **A guided first mission:** teach moving, attacking, dodging, healing, using a cactus/pond, shopping, and joining a friend in one short safe-town sequence.
6. **Scalable graphics:** add quality presets with a frame-rate target and reduced-effects option before adding more lighting effects. Keep combat warnings and touch targets readable.
7. **Co-op identity:** add teammate pings, a party objective tracker, and clear per-player loot notices before expanding beyond four players.
8. **Reliable activity rewards:** connect the actual activity source with permission and once-per-day reward accounting, then explain in-game exactly what earns rewards.
9. **Safer code structure:** migrate the growing stack of global wrappers into explicit modules. Keep the combined-runtime regression in every release gate.
