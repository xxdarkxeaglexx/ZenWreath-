# ZenWreath store release gate

Prepared October 11, 2026. Publisher label supplied: ZenWreath. Intended audience:
general 13+; NOT the Apple Kids Category. A target audience is not an assigned
store age rating. Do not submit until all unchecked gates below are complete.

## What was prepared

- Public Terms: https://lantern-grove.xxdarkxeaglexx.chatgpt.site/terms.html
- Public Privacy: https://lantern-grove.xxdarkxeaglexx.chatgpt.site/privacy.html
- Support/privacy contact mechanism: https://lantern-grove.xxdarkxeaglexx.chatgpt.site/support.html
- Public account deletion: https://lantern-grove.xxdarkxeaglexx.chatgpt.site/delete-account.html
- In-app privacy/data controls, signed-in deletion and voluntary journal disclosure.
- Offline native Capacitor 8 source starter and local-bundle preparation script.
- Draft metadata, privacy worksheet, rating facts and test plan.

## Submission blockers you must finish

- [ ] Enroll and verify legal seller/developer identities on Apple and Google.
- [ ] Supply the public support email required by the store listing. No address was
  supplied; the functional web form is not a replacement for every console field.
- [ ] Establish an operator process to review support/privacy/report tickets and
  respond promptly. Tickets are in the `support_requests` table in the owner’s
  Sites Settings database viewer. No outgoing-email service is configured.
- [ ] Confirm unique bundle/package ID; scaffold ID is only a suggestion.
- [x] Install native dependencies and generate actual Android/iOS projects.
  Capacitor sync succeeded for both; neither project is compiled or signed.
- [ ] Android: SDK/target API 36+, release keystore, signed AAB and physical tests.
- [ ] iOS: macOS, Xcode 26+/iOS 26 SDK, team/certificates, signed archive, privacy
  manifests and TestFlight. This Linux container cannot produce an iOS archive.
- [x] Insert original native app icons (Android densities and iOS 1024px).
- [ ] Obtain screenshots of the actual release binary on
  supported device sizes. Canvas previews are not verified native screenshots.
- [ ] Inspect all compiled SDKs/permissions, backup behavior, encryption disclosures,
  crash logs and required-reason API reports. The manifest provided is a starter.
- [ ] Complete content ratings from actual fantasy violence and journal references.
- [ ] Complete Apple privacy labels, Play Data safety and Health apps declaration
  from the exact binary. The web edition and offline native edition differ.
- [ ] Meet Google’s new-personal-account closed test when applicable: 12 testers
  continuously opted in for 14 days, then apply for production access.
- [ ] Verify real-device onboarding, consent, touches, spin attack, boss damage,
  audio, orientation, offline start, sharing, interruptions, save durability and
  local erasure. Review every legal/support link inside native WebViews.
- [ ] Verify rights/provenance for all code/art/music/dependencies. Copyright and
  terms do not make gameplay ideas exclusive or all AI output copyrightable.
- [ ] Submit and await each store’s decision. Approval and 24–72h review timing
  cannot be guaranteed. Review these live rules again before upload.

## Scope boundary

Native 1.0 has bundled offline gameplay and an optional local journal. It does not
include web accounts, friends, cloud save, Bluetooth or multiplayer. Do not list
those as native features. The web game keeps online features. An online native
release remains blocked on authentication/Apple login-policy evaluation,
moderation/filtering/reporting/blocking plus timely operational response, native
redirect flows, current SDK audits and revised store privacy declarations.
The current ChatGPT-hosted sign-in must not be assumed sufficient for Apple 4.8.

## Official references checked

- Apple review: https://developer.apple.com/app-store/review/guidelines/
- Apple account deletion: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple SDK deadline: https://developer.apple.com/news/upcoming-requirements/
- Google target API: https://developer.android.com/google/play/requirements/target-sdk
- Google deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google health: https://support.google.com/googleplay/android-developer/answer/16679511
- Google personal testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Capacitor 8 requirements: https://capacitorjs.com/docs/updating/8-0
