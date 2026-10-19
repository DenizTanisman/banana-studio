# Security

Report vulnerabilities through GitHub's private vulnerability reporting feature. Do not post keys, signed media URLs, database exports, screenshots of private galleries or user prompts in public issues.

## Data boundaries

The repository ships with no configured workspace, provider credentials, user accounts, saved people, reference photos or generated media. It starts a new installation; it is not an export of a production system or its Git history.

The self-hosted web app keeps provider keys and the Supabase service-role key on its server. Its public runtime configuration contains only the owner's Supabase origin and publishable key. Access requires a verified identity and an active invitation. Registration never grants admin access. The owner deliberately bootstraps the first administrator from the database console.

The macOS app stores provider keys in macOS Keychain. Its SQLite database and media live in the current user's Application Support directory with private file permissions. The app's bundled server listens only on loopback, on a random port, and requires an HttpOnly launch credential. The web interface receives configuration status, never provider keys. Host and origin checks reject cross-site writes and DNS rebinding.

AI features require network access. Prompts and selected references are sent to the provider chosen for that task. Local images are encoded for OpenAI requests. fal.ai and EvoLink video/image references may be uploaded to those providers' temporary file services; these can return bearer-like public URLs. Provider retention and billing policies apply. YouTube features contact Google. Sparkle checks for updates on GitHub. There is no analytics or first-party gallery sync in the desktop app.

Local files are not database-encrypted; protect your Mac account and backups with FileVault. Deleting a local file does not recall copies already sent to a provider or downloaded elsewhere.

## Releases

Release artifacts must pass source, history, bundle and independent secret scans. Apple Developer ID signing, notarization and stapling are required for official macOS releases. Sparkle archives and the feed are signed using the separate Ed25519 key stored in the maintainer's Keychain. Private signing material must never be committed, included in an app, or printed in CI logs.

Development builds are for local testing and are not official distribution artifacts. A successful build does not prove a release has been signed, published or tested through the update flow.
