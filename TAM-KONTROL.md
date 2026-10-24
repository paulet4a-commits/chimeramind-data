# ChimeraMiND Data — dağıtım kaynağı

Tek kimlik: `data-site` (takma ad `chimeramind-data`), aile `yan-pc`.
Canlı: https://data.chimeramind.com — native repo: `paulet4a-commits/chimeramind-data`.
Bu site Apify araçlarının içerik/dağıtım kanalıdır; ayrı Actor, SaaS veya gelir sayılmaz.

- Kimlik ve yol: Tam Kontrol `90-system/income-projects.json`, `income-route.mjs data-site`.
- Kanal durumu: üst native `channels.json` içindeki `data-site`; ana kayıt başka landing page ile karıştırılmaz.
- İçerik: `data/actors.json`, `content/guides/`, `src/quickstarts.mjs`, `src/growth.mjs`.
- Yönetici keşfi: build tarafından üretilen `/distribution-manifest.json`. Her Actor için mevcut starter, guide, tool ve workflow URL'leri. Elle ikinci katalog tutma.
- Dağıtım: mevcut VPS yönetici operasyonu; `dist_products` / `dist_coverage` içindeki `distribution` ve seçilen sayfanın `dist_page` kaynağı.
- Yayın: README'deki mevcut GitHub Actions / Pages hattı. `dist` yerel build olması canlı kabul değildir. Yan PC genel VPS kodlama bağlantısı yok; Tam Kontrol runner'ına bu site kodunu verme.
- Kabul: birim testleri, veri/link/manifest/OG kontrolü, HTTP smoke, Actions sonucu, canlı manifest ve sayfaların geri okunması.
- Ölçüm: Cloudflare beacon siteye ekli; hesap raporu okunmadan trafik sayısı söylenmez. Gelen kampanya etiketleri site içinde ve Apify çıkışında korunur; bu kod tıklama toplamı veya ücretli dönüşüm toplamaz. Apify'nin ek parametreleri raporladığı varsayılmaz.

Sır dosyası okuma yok. Harcama yok. Kullanıcının mevcut kendi katalog/SEO yayın yetkisi geçerlidir.
