# ChimeraMiND Data — data.chimeramind.com

71 webdatatools Actor için statik katalog, 17 rehber ve Lead/RAG/SEO/Hiring workflow sayfaları.
Fiyat ve örnek çıktılar katalog snapshot'ıdır; yayın öncesinde Apify'dan salt okunur olarak doğrulanır.

## Yerel kontrol

Node.js 24 gerekir. `npm ci --ignore-scripts`, ardından `npm run check:secrets`, `npm run check:data`,
`npm test`, `npm run build`, `npm run check:dist`, `npm run smoke` çalıştırın.
`npm run preview` siteyi `http://127.0.0.1:4321` adresinde açar. Offline build canlıya yayınlanmaz.

Rehber placeholder'ları: `{{sample}}`, `{{code}}`, `{{pricing}}`, `{{cta}}`, `{{price}}`.
`## FAQ` içindeki `### Question` blokları FAQPage JSON-LD üretir. Eski rehber URL'leri korunur.

## Kimlik bilgileri

`APIFY_TOKEN` yalnız environment veya GitHub Actions secret olarak verilir. Token'ı repoya, `.env` dosyasına,
komut argümanına veya API URL'sine yazmayın. Fetch Authorization header kullanır; token ve API hata gövdesi loglanmaz.
CI'da keyring fallback yapılmaz. `APIFY_TOKEN` eksikse fetch ve deploy yazma işlemlerinden önce durur.

Yerel keyring seçeneği: güvenilir Python ortamında `keyring` kurulu olmalı. Bir defa interaktif olarak
`python -m keyring set chimeramind-data APIFY_TOKEN` çalıştırın; token'ı yalnız gizli parola sorusunda girin.
Ardından `APIFY_USE_KEYRING=1` ile `npm run fetch` çalıştırın. Gerekirse Python yolunu `APIFY_KEYRING_PYTHON`
ile seçin. Eski düz metin secret dosyası otomatik okunmaz, taşınmaz veya silinmez.

Bu repo dosyalarında ve incelenen Git geçmişinde gömülü Apify token bulunmadı; parent `actors/.secrets`
referansı kaldırıldı. Başka repolardaki veya eski Git geçmişindeki sızıntılar bu paket tarafından temizlenmez.
Önceden ifşa olmuş token'ın revoke/rotate işlemi hesap sahibine aittir.

## Veri ve davranış koruması

`data/catalog-lock.json`, başlangıç commit'indeki 71 Actor'ın tüm fiyat katmanlarını ve kod örneği girdilerini kilitler.
Eksik/fazladan Actor, null fiyat, tier değişikliği veya girdi değişikliği fetch/build'i durdurur. Bu dosyayı
fiyat değişikliğini geçirmek için otomatik güncellemeyin; ayrı kullanıcı onayı ve inceleme gerekir.

Fetch yalnız mevcut başarılı run ve dataset'leri okur. Actor başlatmaz, push yapmaz, fiyat veya input schema değiştirmez.
`--run-missing` reddedilir. Yeni başarılı sample yoksa eski çıktı korunur ve tarihi değiştirilmez.
7 gün ve daha eski sample **Archived example** olarak yaş ve run tarihiyle görünür. Geçersiz/gelecekteki
tarihler build'i bloklar; renderer bu çıktıları göstermez. Tarayıcı yaş etiketini her dakika günceller.
Sample bulunmayan tool sayfalarında örnek uydurulmaz. Workflow'lar önerilen adımlardır; otomatik entegrasyon değildir.

## Kontrollü GitHub Pages yayını

`.github/workflows/growth-v2.yml` PR ve geliştirme branch'inde offline test/build/smoke ve preview artifact üretir.
Yayın yalnız `main` üzerinde çalışır. Repo Actions secret'ı `APIFY_TOKEN` zorunludur. GitHub'ın otomatik
`GITHUB_TOKEN` kimliği `contents: write` ve `pages: write` yetkisiyle kullanılır; ek PAT secret gerekmez.
Pages mevcut `gh-pages` kaynak branch'i ve `data.chimeramind.com` CNAME ile çalışmalıdır.

Sıra: secret kontrolü → canlı salt okunur fetch → veri/fiyat/secret/test kontrolleri → release build →
canonical/sitemap/title/link kontrolleri → HTTP smoke → normal `gh-pages` commit'i ve rollback tag'i →
Pages build isteği → canlı build kimliği, URL ve sitemap kontrolü → IndexNow.
`GITHUB_TOKEN` branch push'ları Pages build tetiklemediği için ayrıca Pages build API çağrısı yapılır.
Kaynaklar: [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
[Pages build API](https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build).

Main ilerlemişse veya yayın branch'i eşzamanlı değişmişse işlem durur. Force push yoktur. Canlı veri doğrulama
marker'ı 24 saatten yeni ve katalog/sample hash'leriyle uyumlu olmalıdır. Marker git'e yazılmaz.
Deploy receipt ve denenmiş `dist` artifact'i 30 gün saklanır. Başarısız yayından sonra IndexNow çalışmaz.
IndexNow yalnız son başarılı bildirimden beri içerik hash'i değişen URL'leri yollar; state Actions cache'te korunur.
Cache kaybolursa bir sonraki başarılı yayında tüm mevcut URL'ler bir defa yeniden bildirilebilir.

## Geri alma

Başlangıç kaynak commit'i: `f394eef796ed589cd6a075be0287a7604bc79d23`.
Başlangıç yayın commit'i: `177bb3f2daa7a4a79c8618c607edab9fb8626ef3`.
Her deploy, önceki yayın için `rollback/gh-pages-<sha>` tag'ini atomik push ile saklar.
`data/deploy-receipt.json` artifact'inden previousSha ve publishedSha değerlerini kontrol edin.
Yayın branch'i başka bir işlemle ilerlediyse otomatik geri almayın; önce o değişikliği inceleyin.

Eski içeriği yeni bir commit olarak geri getirin: ayrı checkout'ta `git switch gh-pages`, `git pull --ff-only`,
`git restore --source=<previousSha> --staged --worktree -- .`, `git commit -m "Restore previous Pages content"`,
`git push origin gh-pages`. Bu yöntem Git geçmişini korur. GITHUB_TOKEN kullanıldıysa Pages build API'sini yeniden
çağırın. Canlı URL'ler ve sitemap doğrulanana kadar IndexNow bildirimi yapmayın.
Kaynak değişikliğini geri almak için Growth v2 commit'ini `git revert` ile geri alın; kullanıcı değişikliklerini reset etmeyin.
