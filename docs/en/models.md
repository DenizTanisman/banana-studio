# Models, providers and API keys

[Home](../../README.md) · [Türkçe](../tr/models.md) · [Mac setup](desktop.md) · [Web setup](deploy.md)

The **model** makes the content. The **provider** accepts the request and bills your account. The **API key** lets Banana Studio use that provider. A familiar model name does not mean every key can access it.

These tables describe the app's configured routes. Provider availability, account permissions, pricing and quotas can change independently. There are no bundled API credits or preconfigured private accounts.

## Image generation and protected edits

| In the model selector | Provider | Mac field | Server environment variable |
| --- | --- | --- | --- |
| GPT Image 2.5 | OpenAI | OpenAI | `OPENAI_API_KEY` |
| Nano Banana Pro | fal.ai | fal.ai | `FAL_KEY` |
| Nano Banana 2.1 | fal.ai | fal.ai | `FAL_KEY` |

Nano Banana Pro and 2.1 are routed through fal.ai in the current image-generation workflow. Adding `GEMINI_API_KEY` alone does not enable them. GPT Image 2.5 is routed directly to OpenAI. Legacy model names can appear in historical records; the current selector and provider routing determine new requests.

## Enhance, Brainstorm and variations

| Text model | Provider | Mac field | Variable |
| --- | --- | --- | --- |
| Claude Opus 5.5 — initial default, Medium | OpenRouter | OpenRouter | `OPENROUTER_API_KEY` |
| GPT-6.1 Sol | OpenAI | OpenAI | `OPENAI_API_KEY` |
| Gemini 3.8 Flash | Google Gemini | Google Gemini | `GEMINI_API_KEY` |

Choose the model and thinking/reasoning level in **AI settings**. An Anthropic account key is not an OpenRouter key. Model permissions and provider credit still apply after a key is saved.

## Video and YouTube

| Feature | Required provider / key |
| --- | --- |
| Seedance 2.0 / Seedance 2.5 Relaxed | EvoLink — `EVOLINK_API_KEY` |
| MiniMax H3 Max: Text to Video, Image to Video, Reference to Video, Extend, Lip Sync, Recast | fal.ai — `FAL_KEY` |
| Reference-video resizing/preprocessing when needed | fal.ai — `FAL_KEY`, in addition to the generation provider |
| YouTube channel/video search and metadata | Google YouTube Data API v3 — `YOUTUBE_API_KEY` |
| Reading YouTube footage | Gemini — `GEMINI_API_KEY` |
| Final creative video brief and Brainstorm | The selected text model's provider key |

For the full default YouTube flow, plan for **YouTube Data API + Gemini + OpenRouter**, plus the provider used to generate your final images. Gemini does the factual footage extraction with its dedicated analysis settings; the creative thinking preference controls the chosen creative text model.

Google OAuth client ID/secret used for web sign-in are separate from YouTube and Gemini API keys. The Mac app does not need Google OAuth setup.

## Create a key

Create an account with the provider, open its key dashboard, create a key and copy it into the matching **Provider keys** field on Mac. For the web version, the installation owner saves the same value under the environment variable above in Vercel, then redeploys.

| Provider | Start here | Official instructions |
| --- | --- | --- |
| OpenAI | [API keys](https://platform.openai.com/api-keys) | [OpenAI API quickstart](https://developers.openai.com/api/docs/quickstart) |
| OpenRouter | [API keys](https://openrouter.ai/settings/keys) | [Quickstart](https://openrouter.ai/docs/quickstart) |
| Google Gemini | [Google AI Studio](https://aistudio.google.com/apikey) | [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key) |
| fal.ai | [Key dashboard](https://fal.ai/dashboard/keys) | [fal quickstart](https://fal.ai/docs/documentation/quickstart) |
| EvoLink | [EvoLink account](https://evolink.ai) | [API documentation](https://docs.evolink.ai) |
| YouTube Data API | [Google Cloud credentials](https://console.cloud.google.com/apis/credentials) | [Enable YouTube Data API v3 and create credentials](https://developers.google.com/youtube/data/getting-started) |

For YouTube, create/select your own Google Cloud project, enable **YouTube Data API v3**, then create an API key for that project. A Gemini key is not a replacement for this enabled API and its quota. API billing and consumer chat subscriptions are separate products; check the provider's API account rather than assuming a chat subscription covers requests.

## Example setups

| You want… | Add and select… |
| --- | --- |
| Only GPT images, with prompts you write yourself | OpenAI key; GPT Image 2.5; no Enhance or Brainstorm required |
| GPT images + GPT text assistance | OpenAI key; GPT Image 2.5 + GPT-6.1 Sol in AI settings, if your account has access |
| The default image/creative pairing | OpenAI + OpenRouter; GPT Image 2.5 + Opus 5.5 / Medium |
| Nano Banana + Gemini text assistance | fal.ai + Gemini; Nano Banana Pro/2.1 + Gemini 3.8 Flash |
| H3 Max video | fal.ai, plus a text provider if you enhance the prompt |
| Seedance video | EvoLink, plus fal.ai if reference-video preprocessing is needed; a text provider if using Enhance |

## Costs and key safety

The app's estimates are not a provider balance or invoice. Charges can include text reasoning, references, output quality, video duration and preprocessing. Set spending limits with your providers and review their usage dashboards.

Provider keys belong in **macOS Keychain** on desktop or **server environment variables** for web. Do not put them in a prompt, screenshot, GitHub issue, public repo or `VITE_*` variable. You do not need administrator-level billing keys to generate content. `FAL_ADMIN_KEY`, `OPENAI_ADMIN_KEY` and `OPENAI_PROJECT_ID` are optional hosted billing-report settings, not starter requirements.

Developer source of truth: [model choices](../../src/types.ts), [image routing](../../src/services/geminiService.ts), [video routing](../../src/services/runwayService.ts), [YouTube extraction](../../src/services/youtubeBriefService.ts), [native key fields](../../desktop/macos/Sources/BananaStudio/KeyVault.swift).
