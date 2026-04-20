# Telegram Kanal/Grup Dizin Sitesi — Full-Stack Geliştirme Prompt'u

## Proje Özeti

Telegram kanal ve gruplarını listeleyen, kategorize eden ve canlı istatistiklerle sunan profesyonel bir dizin (directory) web sitesi oluştur. Site, combot.org/telegram/top/groups benzeri bir yapıda olacak ancak çok daha gelişmiş özelliklere sahip olacak. Proje full-stack olarak geliştirilecek.

---

## Teknoloji Yığını (Tech Stack)

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (veya ayrı Node.js/Express sunucu)
- **Veritabanı:** PostgreSQL (Prisma ORM ile)
- **Kimlik Doğrulama:** NextAuth.js (admin + kullanıcı kimlik doğrulama, Google OAuth, Telegram Login)
- **State Management:** Zustand veya React Context
- **Canlı Veri:** Telegram Bot API entegrasyonu (kanal/grup istatistikleri için)
- **Ödeme Altyapısı:** Stripe, PayPal, Coinbase Commerce (kripto), Papara
- **E-posta Servisi:** Resend veya Nodemailer (SMTP) — doğrulama, bildirim, fatura e-postaları
- **Önbellekleme:** Redis (isteğe bağlı, performans için)
- **Deployment:** Vercel / Docker

---

## 1. Veritabanı Şeması (Prisma)

Aşağıdaki tabloları ve ilişkileri oluştur:

### Tablolar:

```
Channel (Kanal/Grup)
├── id                  (Int, auto-increment, PK)
├── telegramId          (String, unique) — Telegram'dan gelen ID
├── username            (String, unique) — @kullaniciadi
├── title               (String) — Kanal/grup adı
├── description         (Text, nullable) — Açıklama
├── type                (Enum: CHANNEL | GROUP | SUPERGROUP)
├── avatarUrl           (String, nullable) — Profil fotoğrafı URL
├── memberCount         (Int, default: 0) — Anlık üye sayısı
├── language            (String) — Dil kodu (tr, en, ru, zh, id, vi, es, ar, de, fr vb.)
├── categoryId          (Int, FK → Category)
├── isVerified          (Boolean, default: false)
├── isFeatured          (Boolean, default: false) — Öne çıkan
├── isActive            (Boolean, default: true)
├── inviteLink          (String, nullable)
├── websiteUrl          (String, nullable)
├── rank                (Int, nullable) — Sıralama
├── previousRank        (Int, nullable) — Önceki sıralama (▲▼ göstergesi için)
├── dailyGrowth         (Int, default: 0) — Günlük büyüme
├── weeklyGrowth        (Int, default: 0) — Haftalık büyüme
├── monthlyGrowth       (Int, default: 0) — Aylık büyüme
├── tags                (Many-to-Many → Tag)
├── submittedBy         (Int, nullable, FK → User) — Kanalı ekleyen kullanıcı
├── isPremium           (Boolean, default: false) — Premium ilan mı?
├── premiumUntil        (DateTime, nullable) — Premium bitiş tarihi
├── premiumPlanId       (Int, nullable, FK → PremiumPlan) — Aktif premium paket
├── premiumPosition     (Int, nullable) — Premium sıralama (üste çıkma)
├── highlightColor      (String, nullable) — Premium satır vurgu rengi
├── hasBadge            (Boolean, default: false) — Premium rozeti
├── createdAt           (DateTime)
├── updatedAt           (DateTime)
└── statistics          (One-to-Many → ChannelStatistic)

Category (Kategori)
├── id                  (Int, auto-increment, PK)
├── name                (JSON) — Çok dilli isim {"tr": "Eğlence", "en": "Entertainment"}
├── slug                (String, unique)
├── icon                (String, nullable) — İkon adı veya SVG
├── description         (JSON, nullable) — Çok dilli açıklama
├── parentId            (Int, nullable, self-FK) — Alt kategori desteği
├── order               (Int, default: 0) — Sıralama
├── isActive            (Boolean, default: true)
├── channelCount        (Int, default: 0) — Kategorideki kanal sayısı
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

Tag (Etiket)
├── id                  (Int, auto-increment, PK)
├── name                (JSON) — Çok dilli isim
├── slug                (String, unique)
├── channels            (Many-to-Many → Channel)
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

ChannelStatistic (İstatistik Geçmişi)
├── id                  (Int, auto-increment, PK)
├── channelId           (Int, FK → Channel)
├── memberCount         (Int)
├── viewCount           (Int, nullable)
├── postCount           (Int, nullable)
├── date                (DateTime) — Snapshot tarihi
└── createdAt           (DateTime)

User (Tüm Kullanıcılar — Admin + Kayıtlı Üyeler)
├── id                  (Int, auto-increment, PK)
├── email               (String, unique)
├── password            (String, hashed)
├── name                (String)
├── username            (String, unique) — Kullanıcı adı (profil URL'si için)
├── role                (Enum: SUPER_ADMIN | ADMIN | EDITOR | USER)
├── avatar              (String, nullable)
├── bio                 (Text, nullable) — Kullanıcı hakkında kısa bilgi
├── telegramUsername    (String, nullable) — Telegram @kullanıcıadı (doğrulama için)
├── isEmailVerified     (Boolean, default: false)
├── isBanned            (Boolean, default: false)
├── banReason           (String, nullable)
├── isActive            (Boolean, default: true)
├── lastLogin           (DateTime, nullable)
├── channels            (One-to-Many → Channel) — Kullanıcının eklediği kanallar
├── premiumOrders       (One-to-Many → PremiumOrder)
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

ChannelSubmission (Kanal Başvurusu / Moderasyon Kuyruğu)
├── id                  (Int, auto-increment, PK)
├── userId              (Int, FK → User) — Başvuruyu yapan kullanıcı
├── telegramUsername    (String) — @kanaladı
├── title               (String, nullable) — Kullanıcının girdiği başlık
├── description         (Text, nullable) — Kullanıcının girdiği açıklama
├── type                (Enum: CHANNEL | GROUP | SUPERGROUP)
├── language            (String) — Dil kodu
├── categoryId          (Int, FK → Category)
├── tags                (JSON, nullable) — Önerilen etiketler
├── inviteLink          (String, nullable)
├── status              (Enum: PENDING | APPROVED | REJECTED | REVISION_REQUESTED)
├── reviewNote          (Text, nullable) — Admin'in red/revizyon açıklaması
├── reviewedBy          (Int, nullable, FK → User) — İnceleyen admin
├── reviewedAt          (DateTime, nullable)
├── channelId           (Int, nullable, FK → Channel) — Onaylandıysa oluşturulan kanal
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

PremiumPlan (Premium Paketler)
├── id                  (Int, auto-increment, PK)
├── name                (JSON) — Çok dilli paket adı {"tr": "Bronz", "en": "Bronze"}
├── slug                (String, unique) — bronze, silver, gold, platinum
├── description         (JSON) — Çok dilli açıklama
├── durationDays        (Int) — Süre (gün): 7, 30, 90, 365
├── price               (Decimal) — Fiyat (USD veya TRY)
├── currency            (String, default: "USD") — Para birimi
├── features            (JSON) — Paket özellikleri listesi
│                         {
│                           "listingPosition": "top",        — Listeleme pozisyonu (top/highlighted/normal)
│                           "featuredBadge": true,            — Öne çıkan rozeti
│                           "highlightColor": "#FFD700",      — Satır vurgu rengi
│                           "bannerSlot": false,              — Sponsorlu banner alanı
│                           "priorityInCategory": true,       — Kategori içinde öncelik
│                           "detailedStats": true,            — Detaylı istatistik erişimi
│                           "maxChannels": 3                  — Bu paketle kaç kanal öne çıkarılabilir
│                         }
├── isActive            (Boolean, default: true)
├── order               (Int, default: 0) — Görüntüleme sırası
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

PremiumOrder (Premium Siparişler)
├── id                  (Int, auto-increment, PK)
├── orderNumber         (String, unique) — Sipariş numarası (PRE-20260413-0001)
├── userId              (Int, FK → User) — Satın alan kullanıcı
├── channelId           (Int, FK → Channel) — Premium yapılan kanal
├── planId              (Int, FK → PremiumPlan) — Seçilen paket
├── amount              (Decimal) — Ödenen tutar
├── currency            (String) — Para birimi
├── status              (Enum: PENDING_PAYMENT | PAID | ACTIVE | EXPIRED | CANCELLED | REFUNDED)
├── paymentMethod       (Enum: STRIPE | PAYPAL | CRYPTO | BANK_TRANSFER | PAPARA | MANUAL)
├── paymentId           (String, nullable) — Ödeme sağlayıcı işlem ID'si
├── paymentData         (JSON, nullable) — Ödeme sağlayıcıdan gelen ek veriler
├── startDate           (DateTime, nullable) — Premium başlangıç tarihi
├── endDate             (DateTime, nullable) — Premium bitiş tarihi
├── autoRenew           (Boolean, default: false) — Otomatik yenileme
├── invoiceUrl          (String, nullable) — Fatura PDF linki
├── notes               (Text, nullable) — Admin notu
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

PremiumTransaction (Ödeme Geçmişi / Finansal Log)
├── id                  (Int, auto-increment, PK)
├── orderId             (Int, FK → PremiumOrder)
├── type                (Enum: PAYMENT | REFUND | RENEWAL | CANCELLATION)
├── amount              (Decimal)
├── currency            (String)
├── status              (Enum: SUCCESS | FAILED | PENDING)
├── paymentMethod       (String)
├── providerResponse    (JSON, nullable) — Ödeme sağlayıcı ham yanıtı
├── createdAt           (DateTime)
└── updatedAt           (DateTime)

SiteSettings (Site Ayarları)
├── id                  (Int, PK)
├── siteName            (String)
├── siteDescription     (JSON) — Çok dilli
├── logo                (String, nullable)
├── favicon             (String, nullable)
├── defaultLanguage     (String, default: "tr")
├── supportedLanguages  (JSON) — ["tr","en","ru","zh","es","id","vi","ar"]
├── socialLinks         (JSON) — {telegram, twitter, instagram}
├── analyticsId         (String, nullable) — Google Analytics
├── metaKeywords        (JSON) — Çok dilli SEO anahtar kelimeleri
├── metaDescription     (JSON) — Çok dilli SEO açıklamaları
├── footerText          (JSON) — Çok dilli footer metni
├── adsEnabled          (Boolean, default: false)
├── maintenanceMode     (Boolean, default: false)
└── updatedAt           (DateTime)

Page (SEO Sayfaları)
├── id                  (Int, auto-increment, PK)
├── title               (JSON) — Çok dilli başlık
├── slug                (String, unique)
├── content             (JSON) — Çok dilli içerik
├── metaTitle           (JSON)
├── metaDescription     (JSON)
├── metaKeywords        (JSON)
├── isPublished         (Boolean, default: true)
├── createdAt           (DateTime)
└── updatedAt           (DateTime)
```

---

## 2. Frontend — Kullanıcı Arayüzü (Public)

### 2.1 Header

- Sol tarafta site logosu ve site adı
- Ortada navigasyon menüsü: Ana Sayfa, Kanallar, Gruplar, Kategoriler, Hakkında
- Sağ tarafta:
  - Dil seçici dropdown (bayrak ikonu ile birlikte: 🇹🇷 Türkçe, 🇬🇧 English, 🇷🇺 Русский, 🇨🇳 中文, vb.)
  - Gece/Gündüz modu toggle butonu (güneş/ay ikonu)
  - Arama ikonu (tıklanınca genişleyen arama çubuğu)
  - **Giriş yapılmamışsa:** "Giriş Yap" ve "Kayıt Ol" butonları
  - **Giriş yapılmışsa:** Kullanıcı avatar dropdown menüsü → Kanallarım, Kanal Ekle, Premium, Hesap Ayarları, Çıkış Yap
- Header sticky (sabit) olacak, scroll edildiğinde hafif blur/shadow efekti alacak
- Mobilde hamburger menü

### 2.2 Ana Sayfa (Homepage)

**Hero/Banner Alanı:**
- Gradient arka planlı, büyük başlık: "Telegram Kanal ve Grup Dizini" (çok dilli)
- Alt başlık: "Binlerce Telegram kanalı ve grubunu keşfedin" (çok dilli)
- Büyük arama çubuğu (placeholder: "Kanal veya grup ara...")
- Toplam kanal/grup sayısı, toplam üye sayısı gibi istatistikler (animasyonlu counter)

**Dil Sekmeleri:**
- Ekran görüntüsündeki gibi yatay tab bar: Global (36155), English (9792), Türkçe (2462), 中文 (2021)...
- Her dil sekmesinin yanında o dildeki kanal sayısı parantez içinde gösterilecek
- Seçili sekme altı çizgili (active state) olacak
- Mobilde yatay scroll yapılabilir olacak

**Kanal/Grup Listesi (Tablo Görünümü):**
- Görseldeki düzene sadık kal:
  - Sıra numarası (#)
  - Profil fotoğrafı (yuvarlak avatar)
  - Kanal/Grup adı (kalın) + @username (altında gri renkte)
  - Üye sayısı (33.3K formatında) — MEMBERS sütunu
  - Dil kodu (TR, EN, RU vb.) — LANGUAGE sütunu
  - Sıralama değişim göstergesi: ▲ yeşil (yükseldi), ▼ kırmızı (düştü), — gri (değişmedi)
- Tablo satırları hover'da hafif arka plan rengi değişimi
- Sayfalama (pagination): Her sayfada 20-50 kanal, sayfa numaraları veya "Daha fazla yükle" butonu
- Sıralama seçenekleri: Üye sayısına göre, büyüme hızına göre, yeni eklenenlere göre

**Sponsorlu/Öne Çıkan Alan:**
- Görseldeki sarı/turuncu gradient banner gibi, öne çıkan kanal veya reklam alanı
- Liste içinde 1-2. sıra arasında veya listenin üstünde konumlandırılabilir

**Kategori Grid'i:**
- Popüler kategoriler kart görünümünde: Eğlence, Teknoloji, Haberler, Eğitim, Kripto, Oyun, Müzik, Spor vb.
- Her kart: ikon + kategori adı + kanal sayısı
- Hover efekti: hafif büyüme (scale) ve gölge

### 2.3 Kanal/Grup Detay Sayfası

- Büyük profil fotoğrafı + kanal adı + @username
- Açıklama metni
- "Telegram'da Aç" veya "Kanala Katıl" butonu (mavi, Telegram branded)
- İstatistik kartları:
  - Toplam Üye Sayısı
  - Günlük Büyüme (+/-%)
  - Haftalık Büyüme (+/-%)
  - Aylık Büyüme (+/-%)
- Üye sayısı grafiği (çizgi grafik, son 30 gün / 90 gün / 1 yıl seçenekleri)
- Etiketler (tag'ler)
- Kategori bilgisi
- Benzer kanallar bölümü

### 2.4 Kategori Sayfası

- Tüm kategoriler grid düzeninde
- Her kategori kartı: ikon, ad, açıklama, kanal sayısı
- Kategoriye tıklanınca o kategorideki kanallar listelenir (aynı tablo formatında)

### 2.5 Arama Sayfası

- Gelişmiş arama: isim, açıklama, etiket, kategori, dil, üye aralığı filtresi
- Autocomplete/suggestion desteği
- Arama sonuçları aynı tablo formatında

### 2.6 Footer

- 4 sütunlu layout:
  - **Sütun 1 — Hakkında:** Site logosu, kısa açıklama
  - **Sütun 2 — Hızlı Bağlantılar:** Ana Sayfa, Kanallar, Gruplar, Kategoriler, İletişim
  - **Sütun 3 — Kategoriler:** Popüler 6-8 kategori linki
  - **Sütun 4 — İletişim & Sosyal:** Telegram, Twitter/X, Email, Instagram ikonları
- Alt satır: Telif hakkı metni + Gizlilik Politikası / Kullanım Şartları linkleri
- Koyu arka plan (gece modunda daha koyu)

### 2.7 Kullanıcı Kayıt & Giriş Sayfaları

**Kayıt Ol (/register):**
- Form alanları: Ad Soyad, Kullanıcı Adı, E-posta, Şifre, Şifre Tekrar
- İsteğe bağlı: Telegram @kullanıcıadı
- Google ile kayıt (OAuth) butonu
- Telegram ile giriş butonu (Telegram Login Widget)
- Kullanım şartları ve gizlilik politikası onay kutusu
- CAPTCHA (reCAPTCHA veya hCaptcha)
- E-posta doğrulama akışı: kayıt sonrası doğrulama linki gönderilir

**Giriş Yap (/login):**
- E-posta + Şifre ile giriş
- Google ile giriş
- Telegram ile giriş
- "Beni hatırla" onay kutusu
- "Şifremi unuttum" linki → şifre sıfırlama e-postası

**Şifre Sıfırlama (/forgot-password):**
- E-posta giriş formu → sıfırlama linki gönderilir
- Yeni şifre belirleme sayfası (token doğrulamalı)

### 2.8 Kullanıcı Paneli (/dashboard)

Giriş yapmış kullanıcıların erişebildiği panel. Üstte breadcrumb, solda basit sidebar veya tab navigasyonu.

**Kanallarım (/dashboard/channels):**
- Kullanıcının eklediği tüm kanalların listesi (tablo görünümü)
- Sütunlar: Avatar, İsim, Üye Sayısı, Durum (Beklemede/Onaylı/Reddedildi), Premium Durumu, İşlemler
- "Yeni Kanal Ekle" butonu
- Her kanal satırında: Düzenle, Premium Yap, Sil butonları
- Reddedilmiş kanallar için admin'in red açıklaması görüntülenecek

**Kanal Ekle (/dashboard/channels/new):**
- Adım 1 — Telegram Bilgisi: @username veya davet linki girişi → "Bilgileri Çek" butonu ile Telegram Bot API'den otomatik veri çekme (avatar, ad, üye sayısı, açıklama)
- Adım 2 — Detaylar: Kategori seçimi (dropdown), dil seçimi, etiket ekleme (autocomplete), ek açıklama
- Adım 3 — Önizleme: Kanalın listede nasıl görüneceğinin önizlemesi
- Adım 4 — Gönder: "İncelemeye Gönder" butonu → Moderasyon kuyruğuna alınır
- Başvuru sonrası durum takibi: "Başvurunuz inceleniyor..." bilgi mesajı
- E-posta bildirimi: Onaylandığında / reddedildiğinde kullanıcıya e-posta gönderilir

**Kanal Düzenle (/dashboard/channels/:id/edit):**
- Yalnızca açıklama, kategori, etiket, dil bilgilerini düzenleyebilir
- Telegram @username değiştirilemez (yeniden başvuru gerekir)
- Değişiklikler anında veya moderasyon sonrası uygulanır (admin ayarına bağlı)

**Premium Satın Al (/dashboard/premium):**
- Kullanıcının kanallarını listele, premium yapılacak kanalı seçtir
- Paket karşılaştırma tablosu (pricing table):

  | Özellik              | Bronz (7 gün) | Gümüş (30 gün) | Altın (90 gün) | Platin (365 gün) |
  |----------------------|---------------|-----------------|----------------|-------------------|
  | Fiyat                | $9.99         | $29.99          | $74.99         | $249.99           |
  | Üste Çıkma           | ✓             | ✓               | ✓              | ✓                 |
  | Öne Çıkan Rozeti     | ✗             | ✓               | ✓              | ✓                 |
  | Satır Vurgu Rengi    | ✗             | ✗               | ✓              | ✓                 |
  | Sponsorlu Banner     | ✗             | ✗               | ✗              | ✓                 |
  | Kategori Önceliği    | ✗             | ✓               | ✓              | ✓                 |
  | Detaylı İstatistik   | ✗             | ✗               | ✓              | ✓                 |

- "Satın Al" butonuna tıklayınca ödeme sayfasına yönlendir
- Aktif premium abonelikleri listesi (kalan süre ile)
- Geçmiş siparişler ve faturalar

**Ödeme Sayfası (/dashboard/premium/checkout):**
- Sipariş özeti: Seçilen kanal + paket + tutar
- Ödeme yöntemleri:
  - Stripe (Kredi/Banka kartı)
  - PayPal
  - Kripto para (Coinbase Commerce veya NOWPayments)
  - Papara (Türk kullanıcılar için)
  - Banka havale/EFT (manuel onay)
- Kupon kodu girişi (indirim uygulama)
- Ödeme başarılı sayfası: konfeti animasyonu + sipariş detayları + fatura indirme linki
- Ödeme başarısız sayfası: hata açıklaması + tekrar dene butonu

**Hesap Ayarları (/dashboard/settings):**
- Profil düzenleme: Ad, kullanıcı adı, bio, avatar yükleme, Telegram kullanıcı adı
- Şifre değiştirme
- E-posta değiştirme (yeniden doğrulama gerekir)
- Bildirim tercihleri: E-posta bildirimleri açma/kapama (kanal onayı, premium bitiş hatırlatma vb.)
- Hesabı silme (soft delete, 30 gün sonra kalıcı)

### 2.9 Premium Kanalların Listede Görünümü

Premium kanallar listede aşağıdaki şekillerde ayrışacak:
- **Üste Sabitleme:** Premium kanallar listenin en üstünde, normal sıralamadan bağımsız gösterilir. Birden fazla premium kanal varsa kendi aralarında premium paket seviyesine ve satın alma tarihine göre sıralanır.
- **Öne Çıkan Rozeti:** Kanal adının yanında altın yıldız (★) veya "PREMIUM" rozeti
- **Satır Vurgu:** Tablo satırının arka planı hafif gradient (altın/sarı ton, görseldeki sponsorlu banner benzeri)
- **Sponsorlu Banner:** Platin paket sahipleri için, görseldeki sarı banner gibi tam genişlik reklam alanı (liste içinde)
- **Premium etiketi:** LANGUAGE sütununun yanında küçük "PRO" veya taç ikonu

### 2.10 Premium Tanıtım Sayfası (/premium)

Herkese açık landing page:
- Hero bölümü: "Kanalınızı Öne Çıkarın" başlığı, alt başlık, CTA butonu
- Avantajlar listesi (ikonlu kartlar): Daha fazla görünürlük, daha fazla üye, detaylı istatistik vb.
- Paket karşılaştırma tablosu (yukarıdaki gibi)
- Müşteri referansları / başarı hikayeleri (opsiyonel)
- SSS (Sıkça Sorulan Sorular) accordion
- "Hemen Başla" CTA butonu → kayıt/giriş sayfasına yönlendir

---

## 3. Gece / Gündüz Modu (Dark / Light Theme)

- Tailwind CSS `dark:` sınıflarıyla implementasyon
- `localStorage` ile kullanıcının tema tercihi kaydedilecek
- Sistem temasını otomatik algılama (`prefers-color-scheme`)
- Geçiş animasyonu (smooth transition)
- Renk paleti:
  - **Gündüz:** Beyaz arka plan (#FFFFFF), koyu metin (#1A1A2E), mavi vurgu (#3B82F6), açık gri kenarlıklar
  - **Gece:** Koyu arka plan (#0F172A veya #1E293B), açık metin (#E2E8F0), mavi vurgu (#60A5FA), koyu kenarlıklar

---

## 4. Çok Dil Desteği (i18n)

- `next-intl` veya `next-i18next` kütüphanesi ile
- Desteklenen diller: Türkçe (tr), English (en), Русский (ru), 中文 (zh), Bahasa Indonesia (id), Tiếng Việt (vi), Español (es), العربية (ar), Deutsch (de), Français (fr)
- URL yapısı: `/tr/kanallar`, `/en/channels`, `/ru/каналы` vb.
- Dil seçimi header'daki dropdown ile yapılacak, tercih `localStorage` ve cookie ile saklanacak
- Tüm UI metinleri, butonlar, placeholder'lar, hata mesajları çevrilecek
- Admin panelinde içerikler (kategori adları, etiketler, SEO metinleri) her dil için ayrı ayrı girilebilecek
- Dil sekmelerindeki kanal sayıları dinamik olarak veritabanından çekilecek

---

## 5. Admin Paneli (/admin)

Admin paneli login ile korunacak, yalnızca yetkili kullanıcılar erişebilecek. Sol tarafta sidebar navigasyon (menü öğeleri: Dashboard, Kanal Yönetimi, Moderasyon Kuyruğu, Kategoriler, Etiketler, Trend & Sıralama, Kullanıcılar, Premium & Finans, Site Ayarları, SEO Ayarları), üstte topbar (kullanıcı adı, bekleyen başvuru sayısı badge, bildirimler, çıkış) olacak.

### 5.1 Gösterge Paneli (Dashboard)

- **Özet Kartlar (üst kısım):**
  - Toplam Kanal Sayısı (ikon + sayı + değişim yüzdesi)
  - Toplam Grup Sayısı
  - Toplam Üye Sayısı (tüm kanalların toplamı)
  - Bugün Eklenen Kanal Sayısı
  - Kayıtlı Kullanıcı Sayısı
  - Bekleyen Başvurular (kırmızı badge ile vurgulu)
  - Aktif Premium Kanallar
  - Bu Ayki Gelir
- **Grafikler:**
  - Son 30 günlük yeni kanal ekleme trendi (çizgi grafik)
  - Dillere göre kanal dağılımı (pasta grafik)
  - Kategorilere göre kanal dağılımı (bar grafik)
  - En hızlı büyüyen 10 kanal (yatay bar grafik)
- **Son Aktiviteler:**
  - Son eklenen 10 kanal listesi
  - Son düzenleme logları

### 5.2 Kanal Yönetimi (Channel Management)

- **Kanal Listesi Tablosu:**
  - Sütunlar: Avatar, İsim, @Username, Tür (Kanal/Grup), Üye Sayısı, Dil, Kategori, Durum (Aktif/Pasif), Öne Çıkan, İşlemler
  - Filtreleme: Dil, kategori, tür, durum, üye aralığı
  - Toplu işlem: Seçili kanalları aktif/pasif yap, sil, kategori değiştir
  - Arama çubuğu
  - Dışa aktarma: CSV / Excel
- **Kanal Ekleme/Düzenleme Formu:**
  - Telegram @username veya link ile otomatik veri çekme (Telegram Bot API)
  - Manuel giriş alanları: Başlık, açıklama, tür, dil, kategori, etiketler
  - Profil fotoğrafı yükleme veya otomatik çekme
  - Davet linki
  - Öne çıkan olarak işaretle
  - SEO alanları: Meta başlık, meta açıklama (her dil için)
- **Toplu Kanal Ekleme:**
  - CSV/Excel dosyasından toplu import
  - Telegram username listesi ile toplu ekleme

### 5.3 Kategori Yönetimi

- Kategori listesi (sürükle-bırak ile sıralama)
- Kategori ekleme/düzenleme formu:
  - Ad (her dil için ayrı)
  - Slug (otomatik oluşturma)
  - Açıklama (her dil için ayrı)
  - İkon seçimi
  - Üst kategori seçimi (alt kategori oluşturma)
  - Aktif/Pasif durumu
- Kategori silme (bağlı kanalları "Kategorisiz" e taşı)

### 5.4 Etiket Yönetimi

- Etiket listesi tablosu (etiket adı, kullanım sayısı)
- Etiket ekleme/düzenleme (her dil için ad)
- Etiket birleştirme (iki etiketi tek etikette birleştir)
- Kullanılmayan etiketleri temizle

### 5.5 Trend ve Sıralama Yönetimi

- Sıralama algoritması ayarları:
  - Ağırlıklar: Üye sayısı (%40), büyüme hızı (%30), aktivite (%20), doğrulama (%10)
  - Ağırlıkları admin panelinden ayarlayabilme
- Trend kanalları listesi (en hızlı büyüyen)
- Manuel sıralama override (belirli kanalları sabitleyebilme)
- Öne çıkan kanal yönetimi (hangi kanalın sponsorlu banner'da görüneceği)

### 5.6 Kullanıcı Yönetimi

- **Tüm kullanıcı listesi** (admin + kayıtlı üyeler)
- Filtreleme: Role göre (Super Admin, Admin, Editor, User), durum (aktif/banlı), premium müşteri
- Yeni admin ekleme (Email, şifre, ad, rol)
- Roller: Super Admin (tam yetki), Admin (içerik yönetimi), Editor (sadece kanal ekleme/düzenleme), User (kayıtlı üye)
- Kullanıcı aktif/pasif yapma, banlama (ban sebebi girişi ile)
- Kullanıcı detay sayfası: profil bilgileri, eklediği kanallar, premium siparişleri, giriş geçmişi
- Son giriş bilgisi
- Toplu kullanıcı dışa aktarma (CSV)

### 5.7 Moderasyon Kuyruğu (Kanal Başvuruları)

- **Bekleyen başvurular listesi** (öncelik sırasıyla: en eski en üstte)
- Her başvuru kartı/satırı:
  - Başvuran kullanıcı bilgisi (ad, e-posta, kayıt tarihi, toplam başvuru sayısı)
  - Kanal bilgileri: @username, başlık, açıklama, kategori, dil
  - Telegram'dan çekilen canlı veriler: üye sayısı, profil fotoğrafı
  - Başvuru tarihi
- **İnceleme aksiyonları:**
  - ✅ Onayla → Kanal otomatik olarak Channel tablosuna eklenir, kullanıcıya e-posta gönderilir
  - ❌ Reddet → Red sebebi girişi (zorunlu), kullanıcıya e-posta ile bildirilir
  - 🔄 Revizyon İste → Açıklama yazılır, kullanıcı düzenleme yapıp tekrar gönderebilir
  - 🔍 Telegram'da Kontrol Et → Kanalı Telegram'da yeni sekmede açar
- **Toplu moderasyon:** Birden fazla başvuruyu seçip topluca onayla/reddet
- **Filtreler:** Durum (bekleyen/onaylanan/reddedilen), tarih aralığı, kategori, dil
- **İstatistikler:** Bugün bekleyen, bu hafta onaylanan, ortalama inceleme süresi

### 5.8 Premium & Finansal Yönetim

**Premium Paket Yönetimi:**
- Paket listesi (CRUD): Bronz, Gümüş, Altın, Platin
- Her paket için düzenleme:
  - Ad (çok dilli), açıklama (çok dilli)
  - Süre (gün), fiyat, para birimi
  - Özellikler (JSON editör): listeleme pozisyonu, rozet, vurgu rengi, banner hakkı, kategori önceliği, istatistik erişimi, maksimum kanal sayısı
  - Aktif/pasif durumu
- Yeni paket oluşturma
- Paketleri sürükle-bırak ile sıralama (fiyatlandırma sayfasındaki görüntüleme sırası)

**Sipariş Yönetimi:**
- Tüm premium siparişlerin listesi (tablo görünümü)
- Sütunlar: Sipariş No, Kullanıcı, Kanal, Paket, Tutar, Ödeme Yöntemi, Durum, Tarih
- Filtreler: Durum (ödeme bekliyor/aktif/süresi dolmuş/iptal), tarih aralığı, ödeme yöntemi
- Sipariş detay sayfası: tam sipariş bilgisi, ödeme geçmişi, kullanıcı bilgisi
- Manuel aksiyonlar:
  - Manuel ödeme onayı (banka havalesi için)
  - Süre uzatma
  - İptal / İade işlemi
  - Premium'u anında aktif et / durdur
  - Admin notu ekleme

**Kupon Kodu Yönetimi:**
- Kupon oluşturma: kod, indirim tipi (yüzde/sabit tutar), indirim miktarı, geçerlilik tarihi, kullanım limiti, minimum tutar, geçerli paketler
- Kupon listesi: kod, indirim, kullanım sayısı/limiti, durum, bitiş tarihi
- Kupon aktif/pasif yapma, silme

**Finansal Gösterge Paneli:**
- Toplam gelir (bugün, bu hafta, bu ay, tüm zamanlar)
- Gelir grafiği (çizgi grafik, son 30 gün / 12 ay)
- Ödeme yöntemlerine göre dağılım (pasta grafik)
- Paketlere göre satış dağılımı (bar grafik)
- Aktif premium kanal sayısı
- Süresi yakında dolacak premium kanallar listesi (7 gün içinde)
- Yenileme oranı (%)
- Ortalama sipariş tutarı
- En çok gelir getiren kanallar/kullanıcılar

### 5.7 Site Ayarları

- **Genel Ayarlar:**
  - Site adı, açıklama (çok dilli)
  - Logo yükleme, favicon yükleme
  - Varsayılan dil seçimi
  - Desteklenen dilleri etkinleştir/devre dışı bırak
  - Bakım modu açma/kapama
- **Sosyal Medya Bağlantıları:**
  - Telegram, Twitter/X, Instagram, Facebook linkleri
- **Reklam Ayarları:**
  - Reklam alanlarını etkinleştir/devre dışı bırak
  - Banner reklam alanı yönetimi (üst, liste arası, sidebar)
  - Reklam kodu (HTML/JS) girişi
- **Ödeme Ayarları:**
  - Stripe API anahtarları (publishable + secret)
  - PayPal client ID ve secret
  - Coinbase Commerce API key
  - Papara API anahtarı
  - Banka havale bilgileri (hesap adı, IBAN, açıklama şablonu)
  - Varsayılan para birimi (USD / TRY / EUR)
  - Fatura bilgileri (şirket adı, adres, vergi no)
- **Moderasyon Ayarları:**
  - Kanal düzenlemeleri moderasyon gerektirsin mi? (açma/kapama)
  - Otomatik onay: belirli üye sayısının üstündeki kanalları otomatik onayla (isteğe bağlı)
  - Yasaklı kelime listesi (başvurularda otomatik filtre)
  - Maksimum kanal ekleme limiti (kullanıcı başına)

### 5.8 Gelişmiş SEO Ayarları

- **Global SEO:**
  - Her dil için ayrı meta başlık şablonu (örn: "{kanal_adı} — Telegram Kanal Dizini")
  - Her dil için ayrı meta açıklama şablonu
  - Her dil için ayrı anahtar kelimeler
  - Open Graph varsayılan görseli yükleme
  - Twitter Card ayarları
  - Google Analytics / Tag Manager ID
  - Google Search Console doğrulama kodu
- **Sayfa Bazlı SEO:**
  - Ana sayfa, kategori sayfaları, detay sayfaları için ayrı ayrı meta bilgileri
  - Canonical URL ayarları
  - Robots.txt düzenleme
  - Sitemap.xml otomatik oluşturma (tüm diller için hreflang etiketleriyle)
- **Yapılandırılmış Veri (Structured Data):**
  - JSON-LD şeması: Organization, WebSite, BreadcrumbList, ItemList
- **Statik Sayfa Yönetimi:**
  - Hakkında, Gizlilik Politikası, Kullanım Şartları, İletişim sayfaları oluşturma/düzenleme
  - WYSIWYG editör ile içerik girişi
  - Her dil için ayrı içerik

---

## 6. Telegram Canlı Veri Entegrasyonu

### Telegram Bot API Kullanımı:

- Bir Telegram Bot oluşturulacak (BotFather ile)
- Bot üzerinden kanal/grup bilgileri çekilecek:
  - `getChat` → Kanal adı, açıklama, profil fotoğrafı
  - `getChatMemberCount` → Üye sayısı
- **Zamanlanmış Görevler (Cron Jobs):**
  - Her 6 saatte bir tüm kanalların üye sayıları güncellenir
  - Günlük/haftalık/aylık büyüme oranları hesaplanır
  - Sıralama yeniden hesaplanır
  - İstatistik geçmişi `ChannelStatistic` tablosuna kaydedilir
  - **Premium süre kontrolü:** Her saat süresi dolan premium'ları deaktif et (isPremium=false, vurgu/rozet kaldır)
  - **Premium hatırlatma:** Süresi 3 gün ve 1 gün kala kullanıcıya e-posta gönder
  - **Bekleyen başvuru hatırlatma:** 48 saatten fazla bekleyen başvurular için admin'e bildirim
- **Veri İşleme:**
  - Üye sayısı formatı: 1000 → 1K, 1000000 → 1M
  - Büyüme hesaplama: (bugünkü_üye - dünkü_üye) = günlük büyüme
  - Sıralama değişimi: önceki_sıra - mevcut_sıra (pozitif = yükseldi ▲, negatif = düştü ▼)

---

## 7. API Endpoint'leri

### Public API:

```
GET    /api/channels                 — Kanal listesi (filtre, sıralama, sayfalama)
GET    /api/channels/:username       — Tekil kanal detayı
GET    /api/channels/:id/stats       — Kanal istatistik geçmişi
GET    /api/categories                — Kategori listesi
GET    /api/categories/:slug         — Kategorideki kanallar
GET    /api/tags                      — Etiket listesi
GET    /api/search?q=                 — Arama
GET    /api/languages                 — Dil listesi ve kanal sayıları
GET    /api/trending                  — Trend kanallar
GET    /api/premium/plans             — Premium paket listesi (fiyatlandırma sayfası için)
```

### Kullanıcı Kimlik Doğrulama API:

```
POST   /api/auth/register            — Kayıt ol (ad, email, şifre, kullanıcı adı)
POST   /api/auth/login               — Giriş yap (email + şifre)
POST   /api/auth/logout              — Çıkış yap
POST   /api/auth/forgot-password     — Şifre sıfırlama e-postası gönder
POST   /api/auth/reset-password      — Yeni şifre belirle (token ile)
POST   /api/auth/verify-email        — E-posta doğrulama (token ile)
POST   /api/auth/google              — Google OAuth ile giriş/kayıt
POST   /api/auth/telegram            — Telegram Login Widget ile giriş/kayıt
GET    /api/auth/me                   — Mevcut kullanıcı bilgisi (session)
```

### Kullanıcı Paneli API (Giriş Yapmış Kullanıcılar):

```
GET    /api/user/channels             — Kullanıcının kanalları listesi
POST   /api/user/channels/submit      — Yeni kanal başvurusu gönder
PUT    /api/user/channels/:id         — Kanal bilgilerini düzenle
DELETE /api/user/channels/:id         — Kanalı kaldır
GET    /api/user/channels/:id/status  — Başvuru durumu sorgula

POST   /api/user/channels/fetch-telegram — Telegram @username ile veri çek (başvuru formu için)

GET    /api/user/premium/plans        — Mevcut premium paketler
POST   /api/user/premium/checkout     — Ödeme başlat (kanal + paket seçimi)
GET    /api/user/premium/orders       — Sipariş geçmişi
GET    /api/user/premium/orders/:id   — Sipariş detayı
POST   /api/user/premium/apply-coupon — Kupon kodu uygula
GET    /api/user/premium/active       — Aktif premium abonelikler

PUT    /api/user/settings/profile     — Profil güncelle
PUT    /api/user/settings/password    — Şifre değiştir
PUT    /api/user/settings/email       — E-posta değiştir
PUT    /api/user/settings/notifications — Bildirim tercihleri güncelle
DELETE /api/user/settings/account     — Hesabı sil
```

### Ödeme Webhook'ları:

```
POST   /api/webhooks/stripe           — Stripe ödeme bildirimleri
POST   /api/webhooks/paypal           — PayPal IPN bildirimleri
POST   /api/webhooks/coinbase         — Coinbase Commerce webhook
```

### Admin API (Korumalı):

```
POST   /api/admin/auth/login         — Giriş
POST   /api/admin/auth/logout        — Çıkış

GET    /api/admin/dashboard/stats    — Dashboard istatistikleri

CRUD   /api/admin/channels           — Kanal CRUD
POST   /api/admin/channels/import    — Toplu import
POST   /api/admin/channels/fetch     — Telegram'dan veri çek

GET    /api/admin/submissions         — Kanal başvuruları listesi
PUT    /api/admin/submissions/:id/approve   — Başvuru onayla
PUT    /api/admin/submissions/:id/reject    — Başvuru reddet
PUT    /api/admin/submissions/:id/revision  — Revizyon iste

CRUD   /api/admin/categories         — Kategori CRUD
POST   /api/admin/categories/reorder — Sıralama güncelle

CRUD   /api/admin/tags               — Etiket CRUD
POST   /api/admin/tags/merge         — Etiket birleştirme
DELETE /api/admin/tags/cleanup       — Kullanılmayan etiketleri sil

GET    /api/admin/trends/settings    — Trend ayarları
PUT    /api/admin/trends/settings    — Trend ayarları güncelle

CRUD   /api/admin/users              — Kullanıcı CRUD (tüm roller)
PUT    /api/admin/users/:id/ban      — Kullanıcı banla
PUT    /api/admin/users/:id/unban    — Ban kaldır

CRUD   /api/admin/premium/plans      — Premium paket CRUD
GET    /api/admin/premium/orders     — Tüm siparişler
PUT    /api/admin/premium/orders/:id — Sipariş güncelle (manuel onay, iptal, iade)
CRUD   /api/admin/premium/coupons    — Kupon kodu CRUD
GET    /api/admin/premium/revenue    — Gelir raporu / finansal dashboard verileri

GET    /api/admin/settings           — Site ayarları
PUT    /api/admin/settings           — Site ayarları güncelle

CRUD   /api/admin/pages              — Statik sayfa CRUD
GET    /api/admin/seo                — SEO ayarları
PUT    /api/admin/seo                — SEO ayarları güncelle
```

---

## 8. Responsive Tasarım

- **Desktop (1280px+):** Tam genişlik tablo, sidebar filtreler
- **Tablet (768px-1279px):** Daraltılmış tablo, filtreler üstte
- **Mobil (< 768px):** Kart görünümüne geçiş, hamburger menü, alt navigasyon çubuğu
- Tüm görseller lazy loading ile yüklenecek
- İskelet (skeleton) yükleme animasyonları

---

## 9. Performans Gereksinimleri

- Lighthouse skoru: 90+ (Performance, Accessibility, Best Practices, SEO)
- İlk anlamlı çizim (FCP): < 1.5s
- Sayfa boyutu: < 500KB (ilk yükleme)
- Görüntü optimizasyonu: WebP formatı, next/image kullanımı
- API yanıt süresi: < 200ms (önbellekli)
- ISR (Incremental Static Regeneration): Kanal listesi sayfaları için 5 dakika revalidate

---

## 10. Güvenlik

- Admin ve kullanıcı API'leri JWT token ile korunacak
- Rate limiting: API isteklerinde sınırlama (login: 5 deneme/15 dk, kayıt: 3/saat, kanal başvuru: 10/gün)
- CSRF koruması
- XSS koruması (input sanitization)
- SQL injection koruması (Prisma ORM kullanıldığı için otomatik)
- Helmet.js (HTTP güvenlik başlıkları)
- Şifreler bcrypt ile hash'lenecek (salt rounds: 12)
- E-posta doğrulama token'ları: kriptografik olarak güvenli, 24 saat geçerli
- Şifre sıfırlama token'ları: tek kullanımlık, 1 saat geçerli
- Ödeme güvenliği:
  - Stripe webhook imza doğrulaması (stripe-signature header)
  - PayPal IPN doğrulaması
  - Ödeme tutarları sunucu tarafında doğrulanacak (client tarafından manipüle edilemez)
  - PCI DSS uyumluluğu: kart bilgileri asla sunucuya ulaşmaz (Stripe Elements / PayPal JS SDK)
  - Hassas ödeme verileri veritabanında şifrelenmiş saklanacak
- CAPTCHA: kayıt ve giriş formlarında bot koruması
- Kullanıcı dosya yüklemelerinde: boyut limiti (2MB), dosya tipi kontrolü, virus tarama (isteğe bağlı)

---

## 11. Dosya/Klasör Yapısı

```
telegram-directory/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── locales/           — Çeviri dosyaları
│   │   ├── tr/
│   │   ├── en/
│   │   ├── ru/
│   │   └── ...
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx           — Ana sayfa
│   │   │   ├── channels/
│   │   │   │   ├── page.tsx       — Kanal listesi
│   │   │   │   └── [username]/
│   │   │   │       └── page.tsx   — Kanal detay
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── premium/
│   │   │   │   └── page.tsx       — Premium tanıtım sayfası
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── dashboard/             — Kullanıcı paneli (korumalı)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           — Dashboard özet
│   │   │   ├── channels/
│   │   │   │   ├── page.tsx       — Kanallarım
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   — Kanal ekle (çok adımlı form)
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── premium/
│   │   │   │   ├── page.tsx       — Premium paketler & aktif abonelikler
│   │   │   │   ├── checkout/
│   │   │   │   │   └── page.tsx   — Ödeme sayfası
│   │   │   │   └── orders/
│   │   │   │       └── page.tsx   — Sipariş geçmişi
│   │   │   └── settings/
│   │   │       └── page.tsx       — Hesap ayarları
│   │   ├── admin/                 — Admin paneli (korumalı, RBAC)
│   │   │   ├── layout.tsx         — Admin layout (sidebar)
│   │   │   ├── page.tsx           — Dashboard
│   │   │   ├── channels/
│   │   │   ├── submissions/       — Moderasyon kuyruğu
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── trends/
│   │   │   ├── users/
│   │   │   ├── premium/           — Premium paket, sipariş, kupon, gelir yönetimi
│   │   │   ├── settings/
│   │   │   └── seo/
│   │   ├── api/
│   │   │   ├── auth/              — Kayıt, giriş, şifre sıfırlama, OAuth
│   │   │   ├── user/              — Kullanıcı paneli API'leri
│   │   │   ├── channels/
│   │   │   ├── categories/
│   │   │   ├── search/
│   │   │   ├── premium/           — Ödeme, paket, kupon API'leri
│   │   │   ├── webhooks/          — Stripe, PayPal, Coinbase webhook'ları
│   │   │   ├── admin/
│   │   │   └── cron/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    — Temel UI bileşenleri
│   │   ├── layout/                — Header, Footer, Sidebar
│   │   ├── channels/              — Kanal kartı, tablo, liste
│   │   ├── auth/                  — Login, Register, ForgotPassword formları
│   │   ├── dashboard/             — Kullanıcı paneli bileşenleri
│   │   ├── premium/               — Pricing table, checkout, order card
│   │   ├── admin/                 — Admin bileşenleri
│   │   └── charts/                — Grafik bileşenleri
│   ├── hooks/                     — Custom hooks
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── telegram.ts            — Telegram Bot API yardımcıları
│   │   ├── auth.ts
│   │   ├── stripe.ts              — Stripe ödeme yardımcıları
│   │   ├── email.ts               — E-posta gönderim servisi
│   │   ├── payments.ts            — Ödeme işleme ortak katmanı
│   │   └── utils.ts
│   ├── emails/                    — E-posta şablonları (React Email)
│   │   ├── welcome.tsx
│   │   ├── verify-email.tsx
│   │   ├── reset-password.tsx
│   │   ├── channel-approved.tsx
│   │   ├── channel-rejected.tsx
│   │   ├── premium-activated.tsx
│   │   ├── premium-expiring.tsx
│   │   └── payment-receipt.tsx
│   ├── types/                     — TypeScript tipleri
│   └── styles/
│       └── globals.css
├── .env
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 12. Örnek Seed Verileri

İlk kurulumda veritabanına eklenecek örnek veriler:

**Kategoriler:** Sohbet, Eğlence, Teknoloji, Haberler, Eğitim, Kripto/Finans, Oyun, Müzik, Spor, Alışveriş, +18, Sanat, Yemek, Seyahat, Sağlık, İş/Kariyer

**Diller:** Türkçe (TR), English (EN), Русский (RU), 中文 (ZH), Bahasa Indonesia (ID), Tiếng Việt (VI), Español (ES), العربية (AR), Deutsch (DE), Français (FR)

**Örnek Kanallar:** Her dil için en az 10 örnek kanal/grup (gerçekçi isimler ve üye sayılarıyla)

---

## Notlar

- Görseldeki tasarıma sadık kal: temiz tablo düzeni, yuvarlak avatarlar, dil sekmeleri, sıralama numaraları.
- Premium kanallar listede açıkça ayrışmalı: rozet, vurgu rengi, üste sabitleme görsel olarak belirgin olmalı.
- Tüm metinler çok dilli altyapı ile sunulacak; hardcoded Türkçe/İngilizce metin kullanma.
- Admin paneli modern ve temiz olmalı; shadcn/ui veya benzeri bir component library kullan.
- Ödeme akışı sorunsuz ve güvenli olmalı; her adımda kullanıcıya geri bildirim ver (loading, başarılı, hata).
- Moderasyon kuyruğu hızlı çalışmalı; admin tek tıkla onayla/reddet yapabilmeli.
- E-posta şablonları profesyonel görünümde olmalı (React Email veya MJML ile).
- Kodlar temiz, yorumlu ve best practice'lere uygun olmalı.
- Her adımı ayrı commit mesajlarıyla oluştur.
