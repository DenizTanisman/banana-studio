# Modeller, sağlayıcılar ve API anahtarları

[Ana sayfa](README.md) · [English](../en/models.md) · [Mac kurulumu](desktop.md) · [Web kurulumu](deploy.md)

**Model** içeriği üretir. **Sağlayıcı** isteği alır ve hesabından ücretlendirir. **API anahtarı** Banana Studio'nun o sağlayıcıyı kullanmasını sağlar. Modelin adını tanıyor olman, her anahtarın onu açacağı anlamına gelmez.

Tablolar uygulamanın kullandığı bağlantıları gösterir. Model erişimi, fiyat ve kotalar sağlayıcı tarafında değişebilir. Paket kredi veya önceden ayarlanmış özel hesap içermez.

## Görsel üretimi ve korumalı alan düzenleme

| Model menüsündeki ad | Sağlayıcı | Mac'teki kutu | Sunucu ortam değişkeni |
| --- | --- | --- | --- |
| GPT Image 2.5 | OpenAI | OpenAI | `OPENAI_API_KEY` |
| Nano Banana Pro | fal.ai | fal.ai | `FAL_KEY` |
| Nano Banana 2.1 | fal.ai | fal.ai | `FAL_KEY` |

Nano Banana Pro ve 2.1 mevcut görsel üretim akışında fal.ai kullanır. Yalnızca `GEMINI_API_KEY` eklemek bunları açmaz. GPT Image 2.5 doğrudan OpenAI'a gider. Eski kayıtlarda emekli model adları görünebilir; yeni istekleri mevcut model menüsü ve bağlantısı belirler.

## Enhance, Brainstorm ve varyasyonlar

| Metin modeli | Sağlayıcı | Mac'teki kutu | Değişken |
| --- | --- | --- | --- |
| Claude Opus 5.5 — başlangıç varsayılanı, Medium | OpenRouter | OpenRouter | `OPENROUTER_API_KEY` |
| GPT-6.1 Sol | OpenAI | OpenAI | `OPENAI_API_KEY` |
| Gemini 3.8 Flash | Google Gemini | Google Gemini | `GEMINI_API_KEY` |

Modeli ve düşünme seviyesini **AI settings** bölümünden seç. Anthropic hesabının anahtarı OpenRouter anahtarı değildir. Anahtarı kaydettikten sonra da model erişimi ve sağlayıcı bakiyesi gerekir.

## Video ve YouTube

| Özellik | Gereken sağlayıcı / anahtar |
| --- | --- |
| Seedance 2.0 / Seedance 2.5 Relaxed | EvoLink — `EVOLINK_API_KEY` |
| MiniMax H3 Max: Text to Video, Image to Video, Reference to Video, Extend, Lip Sync, Recast | fal.ai — `FAL_KEY` |
| Gerektiğinde video referansı boyutlandırma/hazırlama | Üretim sağlayıcısına ek olarak fal.ai — `FAL_KEY` |
| YouTube kanal/video araması ve bilgileri | Google YouTube Data API v3 — `YOUTUBE_API_KEY` |
| YouTube görüntüsünü okuma | Gemini — `GEMINI_API_KEY` |
| Son yaratıcı video brief'i ve Brainstorm | Seçili metin modelinin sağlayıcı anahtarı |

Tam varsayılan YouTube akışı için **YouTube Data API + Gemini + OpenRouter**, ardından görseli üretecek sağlayıcı gerekir. Gemini videodan bilgi çıkarırken kendisine ayrılan analiz ayarını kullanır; yaratıcı düşünme tercihi seçili yaratıcı metin modelini yönetir.

Web girişindeki Google OAuth client ID/secret, YouTube ve Gemini API anahtarlarından ayrıdır. Masaüstü uygulamasına Google OAuth kurman gerekmez.

## Anahtar oluştur

Sağlayıcıda hesap aç, anahtar panelinden yeni anahtar oluştur ve Mac'te **Provider keys** içindeki doğru kutuya yapıştır. Web sürümünde kurulumu yapan kişi aynı değeri Vercel'de yukarıdaki isimle ortam değişkenine kaydeder, ardından yeniden deploy eder.

| Sağlayıcı | Başlangıç | Resmî açıklama |
| --- | --- | --- |
| OpenAI | [API anahtarları](https://platform.openai.com/api-keys) | [OpenAI API başlangıç rehberi](https://developers.openai.com/api/docs/quickstart) |
| OpenRouter | [API anahtarları](https://openrouter.ai/settings/keys) | [Başlangıç rehberi](https://openrouter.ai/docs/quickstart) |
| Google Gemini | [Google AI Studio](https://aistudio.google.com/apikey) | [Gemini API anahtarları](https://ai.google.dev/gemini-api/docs/api-key) |
| fal.ai | [Anahtar paneli](https://fal.ai/dashboard/keys) | [fal başlangıç rehberi](https://fal.ai/docs/documentation/quickstart) |
| EvoLink | [EvoLink hesabı](https://evolink.ai) | [API dokümanları](https://docs.evolink.ai) |
| YouTube Data API | [Google Cloud kimlik bilgileri](https://console.cloud.google.com/apis/credentials) | [YouTube Data API v3 etkinleştirme ve kimlik bilgileri](https://developers.google.com/youtube/data/getting-started) |

YouTube için kendi Google Cloud projeni oluştur/seç, **YouTube Data API v3** servisini etkinleştir ve bu projeye ait API anahtarı oluştur. Gemini anahtarı, bu servisin etkinleştirilmesi ve kotasının yerine geçmez. API kullanımı ile tüketici sohbet abonelikleri ayrı ürünlerdir; sohbet aboneliğinin API isteklerini karşıladığını varsayma.

## Örnek kurulumlar

| İsteğin | Ekle ve seç |
| --- | --- |
| Promptu kendim yazıp yalnızca GPT görsel üretmek | OpenAI anahtarı; GPT Image 2.5; Enhance/Brainstorm zorunlu değil |
| GPT görsel + GPT metin desteği | OpenAI anahtarı; GPT Image 2.5 + AI settings'te GPT-6.1 Sol; hesabının model erişimi olmalı |
| Varsayılan görsel/yaratıcı ikili | OpenAI + OpenRouter; GPT Image 2.5 + Opus 5.5 / Medium |
| Nano Banana + Gemini metin desteği | fal.ai + Gemini; Nano Banana Pro/2.1 + Gemini 3.8 Flash |
| H3 Max video | fal.ai; Enhance kullanırsan metin sağlayıcısı da |
| Seedance video | EvoLink; video referansı hazırlama gerekirse fal.ai; Enhance için metin sağlayıcısı |

## Maliyet ve anahtar güvenliği

Uygulamadaki tahmin sağlayıcı bakiyesi veya fatura değildir. Metin düşünmesi, referanslar, kalite, video süresi ve ön işlem ayrıca maliyete etki edebilir. Harcama sınırlarını sağlayıcılardan belirle, kullanım panellerini takip et.

Anahtarlar masaüstünde **macOS Anahtar Zinciri'ne**, webde **sunucu ortam değişkenlerine** aittir. Prompt, ekran görüntüsü, GitHub issue'su, public repo veya `VITE_*` değişkenine koyma. Üretim için yönetici seviyesinde faturalama anahtarları gerekmez. `FAL_ADMIN_KEY`, `OPENAI_ADMIN_KEY` ve `OPENAI_PROJECT_ID`, web sürümünün isteğe bağlı faturalama raporu ayarlarıdır.

Geliştiriciler için doğruluk kaynağı: [model seçenekleri](../../src/types.ts), [görsel yönlendirme](../../src/services/geminiService.ts), [video yönlendirme](../../src/services/runwayService.ts), [YouTube analizi](../../src/services/youtubeBriefService.ts), [yerel anahtar alanları](../../desktop/macos/Sources/BananaStudio/KeyVault.swift).
