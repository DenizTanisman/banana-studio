# macOS release procedure

No official signed macOS release is currently available. Passing development tests does not authorize publishing an ad hoc signed app as an official download.

## Maintainer setup

Use a Mac with Xcode, a valid **Developer ID Application** certificate and its private key in Keychain, and a notarization profile stored with `xcrun notarytool store-credentials`. Enter Apple credentials interactively; never put them in a shell history, repository, issue, chat, app bundle or CI log. Apple Developer membership and notarization setup are separate from provider API keys.

The Sparkle Ed25519 private key is a separate Keychain entry, under account `banana-studio`. Only its public key is tracked in `desktop/macos/Resources/SparklePublicKey.txt`. Preserve the signing Keychain securely across maintainer Mac changes. Do not regenerate the update key for routine releases. See [Sparkle's key management documentation](https://sparkle-project.org/documentation/#3-seal-your-app-contents-and-secure-your-updates).

Fork maintainers must use their own app bundle identifier, Keychain service, Sparkle key pair and release repository. Update the feed/download URLs in the packaging and signing scripts, and the repository default in `scripts/release-signatures.mjs`, before distributing a fork. A copy of this repository's public key cannot sign updates.

## Build and verify

Build from a clean committed revision. Increment `package.json` version and choose a positive `BANANA_BUILD_NUMBER` greater than every previously released build. Build separately on each supported Mac architecture; the packager rejects a Node runtime for a different architecture.

Run the source tests, TypeScript checks, web and local backend builds, Swift tests, isolated fresh-database tests, source/history audit and an independent Git history secret scan as documented in the README and CI workflow. Build a development app first, then run:

```sh
node scripts/test-local-generation.mjs '.build/staging/Banana Studio.app'
node scripts/test-update-signatures.mjs
```

The first command uses synthetic images and a mocked provider to exercise the packaged backend, local queue, SQLite gallery and native raster codec. It proves that protected edits preserve source pixels outside the selection and reference-only generations keep the entire new canvas. It does not call a paid provider. The second command uses an ephemeral in-memory test key to verify signatures and reject modified archives/feeds. It never reads the maintainer's Keychain, publishes anything or proves installation works. Official packaging separately requires that the maintainer's Keychain signing key matches the app's tracked public key.

After all checks pass, package the official build with the verified, unmodified official Node runtime for the current architecture:

```sh
BANANA_NODE_RUNTIME=/absolute/path/to/verified/node \
BANANA_BUILD_NUMBER=1 \
BANANA_SIGNING_IDENTITY='Developer ID Application: Your Name (TEAMID)' \
BANANA_NOTARY_PROFILE='your-keychain-profile' \
node scripts/package-macos.mjs
```

Use the next build number, rather than `1`, for subsequent releases. The identity and profile above are names, not private credentials. The script signs nested executables, notarizes, staples, checks Gatekeeper, audits the completed bundle, signs the final archive and signed feed, and writes a verification record under ignored `release-artifacts/<version>/`. It stops on any failed check.

Recheck the completed files without granting access to the signing Keychain:

```sh
node scripts/verify-macos-release.mjs release-artifacts/0.1.0 arm64
```

Use the actual version and architecture. This read-only command verifies the signed feed and exact archive against the tracked public key, checks the intended GitHub download URL/version/build/architecture, and compares SHA-256 hashes with `verification-<architecture>.json`. The signed feed also links to the source commit; changing only the record's commit is rejected. It rejects changed files, missing signatures and mismatched metadata without printing file contents. It does not replace Apple's notarization/Gatekeeper checks or an actual installation/update test.

## Installation and update gate

Before an official release, test a quarantined download on a clean Mac without development dependencies. Confirm first launch, Keychain save/remove, image generation with the tester's own provider account, reference uploads and local gallery persistence. Keep the app open while AI jobs run; the local worker stops when the app quits. A dispatched OpenAI request interrupted by a quit/crash is retained but never automatically submitted again, because doing so could charge twice.

Test an actual older signed app updating to the newer signed app through Sparkle. Confirm both the new build number and continued access to the same local gallery and Keychain keys after restart. Confirm a modified archive/feed is rejected and no test feed or fixture is included in the final bundle. These installation checks remain required even when the signature test passes.

Publish a GitHub release tagged `v<version>` at the tested source commit. Attach only the notarized archive and its matching signed `appcast-arm64.xml` or `appcast-x64.xml`, plus the corresponding reviewed `verification-arm64.json` or `verification-x64.json` record. Do not attach `.env` files, databases, test outputs, signing keys, certificates or local logs. Keep feed assets for every supported architecture on the latest release; the installed app uses the architecture-specific latest-release URL. After publishing, download those exact public assets into a version-named directory and run the read-only verifier again. Test the public update path before claiming automatic updates are live.

Follow [Sparkle's publishing guide](https://sparkle-project.org/documentation/publishing/) when changing archive formats, feed structure or signing policy.
