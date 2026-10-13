# ZenWreath native build starter — not a signed store binary

This packages the actual playable game locally, with portrait/landscape play,
touch combat, original sound, randomized realms, local saves and an optional
on-device journal. Version 1.0 is deliberately offline: it has no ChatGPT
login, web multiplayer, cloud save or profile collection. The hosted web edition
keeps those features. Do not advertise them as native features. Restoring online
features is a separate release requiring native authentication, Apple login
policy evaluation, moderation and updated privacy disclosures.

## Build prerequisites and identity

Use Node supported by Capacitor 8 (verify its current engine requirement), Android
Studio with Android SDK 36, and macOS/Xcode 26+ for iOS. Native dependencies were installed and actual Android/Xcode projects generated.
No Android SDK or Xcode toolchain was available, so these projects have NOT
been compiled, signed or device-tested here.

`com.zenwreath.game` is a suggested bundle ID. Confirm availability/ownership and
replace it before creating store records. Set your real legal seller name, developer
team, store support email, signing certificate and Android keystore locally.
Never include signing credentials in this repository or chat.

From this directory:

```sh
npm ci
npm run sync
npx cap open android
```

Generate a signed Android App Bundle in Android Studio. Inspect generated
`android/variables.gradle`: min SDK 24, compile and target SDK 36 for Capacitor 8.
Do not request location, camera, microphone, contacts, Bluetooth or health-sensor
permissions. Core may include INTERNET for its local transport/support links;
audit the merged manifest and dependencies. Disable WebView debug for release.

On a Mac, from the same prepared source:

```sh
npm ci
npm run sync
npx cap open ios
```

Select your developer team and unique bundle ID. The supplied `PrivacyInfo.xcprivacy` is attached to
the app target's Copy Bundle Resources. Its API reason is a starter for app-owned
preferences only, not a substitute for auditing all SDK privacy manifests and
binary API reports. Keep iOS deployment minimum compatible with Capacitor 8
(current documented minimum iOS 15); build with Xcode 26 / iOS 26 SDK or newer.
Set portrait, landscape left/right support; verify iPad scenes and safe areas.
Archive, validate and upload through Xcode Organizer, then TestFlight.

Native icons are inserted for Android launcher densities and iOS 1024px.
Before release: verify icon masking, run the device test matrix, inspect the
built privacy report, audit device backups for local journal data, verify share
and browser plugins, keyboard/import controls, pause/resume, and every legal link.
Use `store-release/RELEASE_GATE.md` in the repository root. The native features and
disclosures must match the final binary, not this uncompiled source scaffold.
