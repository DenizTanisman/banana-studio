# Install and use Banana Studio

[Home](../../README.md) · [Türkçe](../tr/desktop.md) · [User guide](guide.md) · [Keys](models.md)

## Mac: download and open

The current release is **v0.1.0** and requires **macOS 13.5 or later**. It includes its own runtime: you do not install Node.js, Supabase, Vercel or a database.

1. In the Apple menu, open **About This Mac**. If it says **Chip: Apple M…**, choose Apple Silicon; if it says **Intel**, choose Intel.
2. Download the matching file:

   | Mac | Download |
   | --- | --- |
   | Apple Silicon — M1 and newer | [Banana-Studio-0.1.0-macos-arm64.zip](https://github.com/orkunisitmak/banana-studio/releases/download/v0.1.0/Banana-Studio-0.1.0-macos-arm64.zip) |
   | Intel | [Banana-Studio-0.1.0-macos-x64.zip](https://github.com/orkunisitmak/banana-studio/releases/download/v0.1.0/Banana-Studio-0.1.0-macos-x64.zip) |

3. Double-click the zip, then drag **Banana Studio.app** into **Applications**. Open it from there.
4. These community builds are not notarized by Apple. After trying to open the app, if macOS blocks it, go to **System Settings → Privacy & Security → Open Anyway** for Banana Studio and complete the system confirmation. Follow [Apple's instructions](https://support.apple.com/102445); leave system-wide protections enabled.
5. The local gallery opens. No Google sign-in or Banana Studio account is needed.

**Checkpoint:** you can see **Local workspace · This Mac**, an empty gallery and the generation controls. Download the release zip, not GitHub's **Source code** zip, if you just want to use the app.

## Add the keys you need

1. Select **Provider keys** in the top bar, or **Banana Studio → Provider API Keys…** in the Mac menu.
2. Create a key with your chosen provider using the [provider links](models.md). The provider may require billing or model access before it accepts requests.
3. Paste it into the matching field and select **Save**. Do not paste API keys into the generation prompt.
4. Select the corresponding image/video model. If you use Enhance or Brainstorm, open **AI settings** and select a configured text model too.

The initial pairing is GPT Image 2.5 + Opus 5.5 / Medium, so it needs OpenAI + OpenRouter. For an OpenAI-only setup, select GPT-6.1 Sol for the text model as well, if your provider account can access it. You can also skip Enhance/Brainstorm and write image prompts directly.

**Checkpoint:** a saved field says **Saved in Keychain** when you reopen it. Blank fields keep an existing key; the **Remove** checkbox clears only that provider's saved key. Keys are stored in macOS Keychain and are not sent to a Banana Studio cloud account.

## Save, back up and update

| What | Where / how |
| --- | --- |
| Gallery, folders, references, templates and job records | Local SQLite database and media under `~/Library/Application Support/Banana Studio/` |
| API keys | macOS Keychain, separate from the gallery and app bundle |
| Find local data | **File → Open Local Data Folder** |
| Export a result | Download it from the gallery |
| Back up the workspace | Quit the app, then back up the whole local data folder. Include media as well as the database. |
| App updates | Sparkle checks the signed GitHub feed. Use **Banana Studio → Check for Updates…** for a manual check. |

Keep the application open during generation; minimizing it is fine. Let running jobs finish before quitting or installing an update. The app verifies signed feeds and update archives before extraction. Your workspace and Keychain items live outside the app bundle and are retained across updates. macOS may ask for renewed Keychain permission after a community update; check that the request names Banana Studio.

The local database is not separately encrypted; macOS account protection, FileVault and your backup settings protect local files. Reinstalling the app is not a gallery backup. AI generation still sends selected prompts and references to the chosen provider. [Full data policy](../../SECURITY.md).

## Windows: use the web workspace

**There is no native Windows `.exe` or `.msi` in the current release.** The published desktop archives are Mac applications and cannot be installed on Windows.

1. Obtain the URL of a deployed Banana Studio workspace from its owner, or [deploy your own](deploy.md).
2. Open it in a current browser such as Edge or Chrome.
3. Sign in with Google. The workspace owner must authorize your email.
4. Use the gallery, image editor, Brainstorm and video controls in the browser.

In the web version, the owner puts provider keys on the server. Visitors do not enter a Supabase service-role key or install a database on their PC. A self-hosted workspace starts empty; this repository does not give access to anyone else's private workspace.

## Common questions

| Symptom | What to check |
| --- | --- |
| Mac says the app cannot be opened | Download the right architecture, move it to Applications, then follow the app-specific Open Anyway flow above. |
| A model says its provider is not configured | Add that provider's key; a Gemini key does not replace `FAL_KEY` for Nano Banana in this app. |
| Brainstorm fails after image generation worked | The image model and text model may use different providers. Check **AI settings**. |
| The key is saved but a request is rejected | Check provider billing, available credits, model permissions, limits and the exact error. |
| The gallery looks different from your web account | Mac and hosted web workspaces store separate data. |
| You downloaded the source zip | Use the architecture-specific application zip on the [release page](https://github.com/orkunisitmak/banana-studio/releases/latest). |

Developers: [build a development app](development.md#build-the-mac-app). Maintainers: [signed release procedure](../RELEASING.md).
