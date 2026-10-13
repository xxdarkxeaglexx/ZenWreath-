# Real-device release tests

Run on at least one current and one older supported Android phone, a supported
iPhone, and iPad if the build includes it. Repeat portrait and both landscapes.

1. Fresh install: one splash/welcome flow; unchecked Terms gate; decline prevents
   gameplay; acceptance remembers version; full text scrolls at small sizes.
2. Airplane mode cold launch: terrain, enemies, local journal, sound and saves work.
3. Drag and tap movement; two-finger joystick/combat; slide outside buttons;
   release/cancel/app-switch never leaves stuck movement or charging.
4. Tap slash; charge stays still; release spin hits in all directions for +3;
   cancelled charge does no damage; shield raises; bosses and enemies fight back.
5. Health, magic, Light, spell costs, recharge, defeat and camp restoration.
6. Rotate during gameplay/menus/keyboard entry; safe areas and system gestures;
   no center controls obstruct the view. Confirm soft keyboard does not trap menus.
7. Background, lock, incoming call, low memory and forced close: resume safely;
   durable local save; no duplicate startup/animation loops.
8. Audio starts only after user action; volume controls and interruption handling.
9. Optional journal opt-in, bounds, empty fields, consent, erasure, no network upload.
10. Native share and Browser plugins on both systems; no embedded external login.
11. Privacy/terms and support links; local erasure confirmed with no cloud claims.
12. Inspect Android merged permissions and release AAB; iOS privacy report and
    all required-reason SDK entries; verify no debug flags or signing secrets.
13. Web-only regression: authenticated/public deletion removes related records;
    unauthorized/CSRF attempts fail; support queue and reply operation monitored.
14. Capture actual native screenshots and crash-free test records for submission.

Current automated Canvas/VM/SQLite tests do not substitute for these tests.
