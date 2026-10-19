# Banana Studio

An MIT-licensed studio for reference-based image generation, protected area edits, YouTube thumbnail brainstorming and video generation.

**Status:** [v0.1.0 is available for macOS](https://github.com/orkunisitmak/banana-studio/releases/tag/v0.1.0). Source, self-hosting and standalone builds for Apple silicon and Intel pass CI. Community builds use Sparkle signatures for updates and are not notarized by Apple. See [SECURITY.md](SECURITY.md) for data boundaries and [RELEASING.md](RELEASING.md) for distribution checks.

## macOS app

The app runs its own local workspace. It does not require Supabase, Vercel, a hosted Banana Studio account or a separately installed Node runtime. Provider API keys are entered through **Provider keys** and stored in macOS Keychain. Gallery data stays in `~/Library/Application Support/Banana Studio/`. AI requests still require internet access and a paid account with the chosen provider.

The native shell uses AppKit and WKWebView. It bundles the same React interface, a local Node backend and SQLite storage. Sparkle handles signed application updates; user data and Keychain entries live outside the application bundle. Keep the app open while AI jobs run; minimizing its window is fine. See [RELEASING.md](RELEASING.md) for signing, distribution and the update verification gates.

### Build a development app

Requires macOS 13.5+, Xcode/Swift, Node.js 24 and npm. The runtime helper downloads the official Node.js runtime for the current Mac architecture and checks the pinned archive, executable and license checksums before packaging.

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
npm run build:desktop
swift build --package-path desktop/macos -c release
node scripts/fetch-node-runtime.mjs
BANANA_NODE_RUNTIME="$PWD/.build/node-runtime/bin/node" node scripts/package-macos.mjs --development
node scripts/test-local-generation.mjs '.build/staging/Banana Studio.app'
node scripts/test-update-signatures.mjs
open '.build/staging/Banana Studio.app'
```

The current packager builds for the host architecture. Development packages use local ad hoc signatures and disable automatic update checks. They must not be published as official downloads.

### Installing a community download

Download v0.1.0 for [Apple silicon (M1 and newer)](https://github.com/orkunisitmak/banana-studio/releases/download/v0.1.0/Banana-Studio-0.1.0-macos-arm64.zip) or [Intel](https://github.com/orkunisitmak/banana-studio/releases/download/v0.1.0/Banana-Studio-0.1.0-macos-x64.zip). Requires macOS 13.5 or later. The [release page](https://github.com/orkunisitmak/banana-studio/releases/tag/v0.1.0) includes signed feeds and verification records for both architectures.

Download the archive for your Mac from this repository's Releases, unzip it and move **Banana Studio.app** into Applications before opening it. Community downloads are not signed with an Apple Developer ID or notarized by Apple. After attempting to open the app, approve **Banana Studio** in **System Settings → Privacy & Security → Open Anyway**. This creates an exception for this app; no global Gatekeeper or SIP change is needed. See [Apple's instructions](https://support.apple.com/102445).

Sparkle checks signed update feeds and verifies update archives against the public key bundled in the app. Apple notarization and Sparkle update signatures are separate. macOS may also request permission to access your saved Keychain entries after a new community build is installed.

## Self-hosting

Use a **new Supabase project** and your own provider accounts. No production database, account list, media or project credentials are supplied. The supported web deployment uses Vercel Functions, Queues and a scheduled outbox sweep; serving `dist/` by itself does not run the backend.

1. Fork this repository and create your Supabase project. Enable Google OAuth with your own Google OAuth application; configure its callback URL in Supabase and your final app origin in Auth's allowed redirects.
2. Install the Supabase CLI, link it to **your** project and apply `supabase/migrations/` using `supabase db push`. Review the migration before applying it; it is a fresh-install schema, not a migration for an unrelated existing database. The `media` bucket is private.
3. Create your Vercel project from the fork. Use `npm ci --ignore-scripts` to install, `npm run build` to build, and `dist` as output. Keep the checked-in Functions, Queue trigger and Cron configuration. Provision the queue features required by your Vercel plan.
4. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as server environment variables in Vercel. `.env.example` contains empty placeholders; never put provider keys or the service-role key in `VITE_*`, browser code, commits or build arguments.
5. Add the provider keys you need: `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `FAL_KEY`, `EVOLINK_API_KEY` and optionally `YOUTUBE_API_KEY`. Not every feature uses every provider. Set a strong random `CRON_SECRET` for the outbox sweep. Redeploy after configuring server variables.
6. Sign in once with your own Google account. Access is initially denied. In your Supabase SQL editor, run the reviewed [owner bootstrap](scripts/bootstrap-owner.sql) with your own verified email. This grants the selected account admin access. Refresh the app, then invite other users from the admin settings.

The frontend reads only the Supabase URL and publishable key from `/api/workspace-config`. Missing configuration opens a setup screen and never falls back to another installation. The default creative text model is Opus 5.5 Medium; choose a configured provider in AI settings. Gemini is used to read YouTube footage before the final creative brief.

For local web development, use Vercel's local Functions runtime with your own Development environment variables. The Vite-only dev server does not emulate Functions, OAuth, the durable queue or scheduled jobs.

## Verification

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
npm run build:desktop
PG_TEST_BIN=/path/to/postgresql/bin npm run test:database
node scripts/audit-public-release.mjs --history
```

The database test creates an isolated, temporary PostgreSQL cluster and uses synthetic accounts. It never connects to a configured workspace. The release audit examines source and reachable Git history, including deleted secrets and accidentally tracked build products. It reports finding locations without printing credentials. An independent secret scanner and manual artifact review are also required before publication.

## License

Application source: [MIT](LICENSE). Bundled dependencies retain their own licenses. Provider services and their model outputs are subject to the providers' terms.
