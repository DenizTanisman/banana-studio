# Banana Studio kurulumu ve kullanımı

[Ana sayfa](../../README.md#türkçe) · [English](../en/desktop.md) · [Kullanım](guide.md) · [Anahtarlar](models.md)

## Mac: indir ve aç

Mevcut sürüm **v0.1.0**, gereken sistem **macOS 13.5 veya sonrası**. Çalışma ortamı pakete dahildir; Node.js, Supabase, Vercel veya veritabanı kurmazsın.

1. Apple menüsünden **Bu Mac Hakkında / About This Mac** bölümünü aç. **Çip: Apple M…** yazıyorsa Apple Silicon; **Intel** yazıyorsa Intel indir.
2. Uygun dosyayı seç:

   | Mac | İndirme |
   | --- | --- |
   | Apple Silicon — M1 ve yenileri | [Banana-Studio-0.1.0-macos-arm64.zip](https://github.com/orkunisitmak/banana-studio/releases/download/v0.1.0/Banana-Studio-0.1.0-macos-arm64.zip) |
   | Intel | [Banana-Studio-0.1.0-macos-x64.zip](https://github.com/orkunisitmak/banana-studio/releases/download/v0.1.0/Banana-Studio-0.1.0-macos-x64.zip) |

3. Zip'e çift tıkla, **Banana Studio.app** dosyasını **Applications / Uygulamalar** klasörüne taşı ve oradan aç.
4. Bu topluluk paketleri Apple tarafından notarize edilmemiştir. İlk açma denemesinden sonra macOS engellerse **Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç / Open Anyway** bölümünden yalnızca Banana Studio için izin ver ve sistemin onayını tamamla. [Apple'ın rehberini izle](https://support.apple.com/102445); sistem genelindeki korumaları açık tut.
5. Yerel galeri açılır. Google ile giriş veya Banana Studio hesabı gerekmez.

**Kontrol:** üstte **Local workspace · This Mac**, boş galeri ve üretim kontrollerini görmelisin. Uygulamayı kullanmak için GitHub'ın **Source code** zip'ini değil, işlemcine uygun uygulama zip'ini indir.

## Gereken anahtarları ekle

1. Üstteki **Provider keys** düğmesini veya Mac menüsündeki **Banana Studio → Provider API Keys…** seçeneğini aç.
2. [Sağlayıcı bağlantılarından](models.md) kullanacağın serviste anahtar oluştur. Servisin ödeme veya model erişimi açmanı istemesi mümkündür.
3. Anahtarı ilgili kutuya yapıştır ve **Save** seç. Anahtarı üretim promptuna yazma.
4. O servise ait görsel/video modelini seç. Enhance veya Brainstorm için **AI settings** bölümünde anahtarını eklediğin bir metin modeli de seç.

Başlangıçta GPT Image 2.5 + Opus 5.5 / Medium seçilidir; OpenAI + OpenRouter gerekir. Yalnızca OpenAI kullanmak istiyorsan hesabının erişimi varsa metin modelini de GPT-6.1 Sol seç. Enhance/Brainstorm'u kullanmadan doğrudan görsel promptu da yazabilirsin.

**Kontrol:** yeniden açınca kayıtlı alan **Saved in Keychain** yazar. Boş bıraktığın alan mevcut anahtarı korur; **Remove** yalnızca o sağlayıcının kayıtlı anahtarını siler. Anahtarlar macOS Anahtar Zinciri'ndedir; Banana Studio bulut hesabına gönderilmez.

## Kaydet, yedekle ve güncelle

| Ne? | Nerede / nasıl? |
| --- | --- |
| Galeri, klasörler, referanslar, şablonlar ve iş kayıtları | `~/Library/Application Support/Banana Studio/` içindeki SQLite veritabanı ve medya dosyaları |
| API anahtarları | Galeriden ve uygulama paketinden ayrı olarak macOS Anahtar Zinciri'nde |
| Veri klasörünü bulmak | **File → Open Local Data Folder** |
| Sonucu dışarı almak | Galeriden indir |
| Alanı yedeklemek | Uygulamayı kapat, veri klasörünün tamamını yedekle. Veritabanının yanında medya dosyalarını da dahil et. |
| Uygulamayı güncellemek | Sparkle imzalı GitHub akışını kontrol eder. Elle kontrol için **Banana Studio → Check for Updates…**. |

Üretim sırasında uygulamayı açık tut; pencereyi küçültebilirsin. Kapatmadan veya güncellemeden önce işleri bitir. Uygulama, akışın ve güncelleme arşivinin imzasını açmadan önce doğrular. Çalışma alanın ve Anahtar Zinciri kayıtların paketin dışındadır; güncellemede korunur. Topluluk sürümü güncellendiğinde macOS yeniden Anahtar Zinciri erişimi isteyebilir; isteğin Banana Studio'ya ait olduğunu kontrol et.

Yerel veritabanı ayrıca şifrelenmez; dosyaları Mac hesap güvenliği, FileVault ve yedek ayarların korur. Uygulamayı yeniden kurmak galeri yedeği değildir. Yapay zekâ üretiminde seçtiğin prompt ve referanslar ilgili sağlayıcıya gönderilir. [Veri politikası](../../SECURITY.md).

## Windows: web alanını kullan

**Mevcut yayında yerel Windows `.exe` veya `.msi` paketi yok.** Yayımlanan masaüstü arşivleri Mac uygulamasıdır, Windows'a kurulmaz.

1. Kurulmuş Banana Studio web adresini alan sahibinden al veya [kendin kur](deploy.md).
2. Güncel Edge veya Chrome gibi bir tarayıcıda aç.
3. Google ile giriş yap. Alan sahibi e-posta adresine erişim vermelidir.
4. Galeri, görsel düzenleme, Brainstorm ve video kontrollerini tarayıcıda kullan.

Web sürümünde sağlayıcı anahtarlarını alan sahibi sunucuya girer. Ziyaretçiler PC'lerine Supabase service-role anahtarı girmez veya veritabanı kurmaz. Yeni kurulum boş başlar; bu repo başka birinin özel çalışma alanına erişim sağlamaz.

## Sık karşılaşılan durumlar

| Durum | Kontrol et |
| --- | --- |
| Mac uygulamayı açmıyor | Doğru işlemci paketini indir, Uygulamalar'a taşı, yukarıdaki uygulamaya özel Yine de Aç adımını izle. |
| Sağlayıcı ayarlanmamış hatası | O sağlayıcının anahtarını ekle; bu uygulamada Gemini anahtarı Nano Banana için `FAL_KEY` yerine geçmez. |
| Görsel üretildi ama Brainstorm çalışmıyor | Görsel ve metin modelleri farklı servis kullanabilir; **AI settings** bölümüne bak. |
| Anahtar kayıtlı ama istek reddediliyor | Sağlayıcı bakiyesini, ödeme ayarını, model erişimini, limitleri ve hata metnini kontrol et. |
| Webdeki galeri burada görünmüyor | Mac ve web alanları ayrı veri tutar. |
| Kaynak kod zip'ini indirdin | [Yayın sayfasındaki](https://github.com/orkunisitmak/banana-studio/releases/latest) işlemcine uygun uygulama zip'ini indir. |

Geliştiriciler: [geliştirme paketi oluşturma](development.md#mac-uygulamasını-derle). Yayın sorumluları: [imzalı yayın prosedürü](../RELEASING.md).
