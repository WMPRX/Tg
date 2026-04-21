import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type MultiLang = Record<string, string>;

const J = (obj: MultiLang | Record<string, unknown>) => JSON.stringify(obj);

async function main() {
  console.log("➜ Seeding TgDir…");

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "TgDir",
      defaultLanguage: "tr",
      siteDescription: J({
        tr: "En iyi Telegram kanallarını keşfet.",
        en: "Discover the best Telegram channels.",
      }),
      metaDescription: J({
        tr: "TgDir — Telegram kanal ve grup dizini.",
        en: "TgDir — the Telegram channel & group directory.",
      }),
      metaKeywords: J({
        tr: ["telegram", "kanal", "grup", "dizin"],
        en: ["telegram", "channel", "group", "directory"],
      }),
      socialLinks: J({ twitter: "https://twitter.com/", telegram: "https://t.me/" }),
      footerText: J({ en: "© TgDir", tr: "© TgDir" }),
      bankTransferInfo: "IBAN: TR00 0000 0000 0000 0000 0000 00\nAccount: TgDir Ltd.",
    },
  });
  console.log("  ✓ SiteSettings");

  const categoryData: Array<{ slug: string; icon: string; name: MultiLang }> = [
    { slug: "news", icon: "📰", name: { en: "News", tr: "Haber", ru: "Новости", zh: "新闻", id: "Berita", vi: "Tin tức", es: "Noticias", ar: "أخبار", de: "Nachrichten", fr: "Actualités" } },
    { slug: "technology", icon: "💻", name: { en: "Technology", tr: "Teknoloji", ru: "Технологии", zh: "科技", id: "Teknologi", vi: "Công nghệ", es: "Tecnología", ar: "تقنية", de: "Technologie", fr: "Technologie" } },
    { slug: "crypto", icon: "₿", name: { en: "Crypto", tr: "Kripto", ru: "Крипто", zh: "加密货币", id: "Kripto", vi: "Tiền điện tử", es: "Cripto", ar: "عملات رقمية", de: "Krypto", fr: "Crypto" } },
    { slug: "finance", icon: "💹", name: { en: "Finance", tr: "Finans", ru: "Финансы", zh: "金融", id: "Keuangan", vi: "Tài chính", es: "Finanzas", ar: "مالية", de: "Finanzen", fr: "Finance" } },
    { slug: "gaming", icon: "🎮", name: { en: "Gaming", tr: "Oyun", ru: "Игры", zh: "游戏", id: "Gim", vi: "Trò chơi", es: "Juegos", ar: "ألعاب", de: "Gaming", fr: "Jeux" } },
    { slug: "memes", icon: "😂", name: { en: "Memes", tr: "Mizah", ru: "Мемы", zh: "表情包", id: "Meme", vi: "Meme", es: "Memes", ar: "ميمز", de: "Memes", fr: "Mèmes" } },
    { slug: "health", icon: "🏥", name: { en: "Health", tr: "Sağlık", ru: "Здоровье", zh: "健康", id: "Kesehatan", vi: "Sức khỏe", es: "Salud", ar: "صحة", de: "Gesundheit", fr: "Santé" } },
    { slug: "education", icon: "📚", name: { en: "Education", tr: "Eğitim", ru: "Образование", zh: "教育", id: "Pendidikan", vi: "Giáo dục", es: "Educación", ar: "تعليم", de: "Bildung", fr: "Éducation" } },
    { slug: "science", icon: "🔬", name: { en: "Science", tr: "Bilim", ru: "Наука", zh: "科学", id: "Sains", vi: "Khoa học", es: "Ciencia", ar: "علوم", de: "Wissenschaft", fr: "Science" } },
    { slug: "business", icon: "💼", name: { en: "Business", tr: "İş Dünyası", ru: "Бизнес", zh: "商业", id: "Bisnis", vi: "Kinh doanh", es: "Negocios", ar: "أعمال", de: "Wirtschaft", fr: "Affaires" } },
    { slug: "lifestyle", icon: "🌿", name: { en: "Lifestyle", tr: "Yaşam", ru: "Стиль жизни", zh: "生活", id: "Gaya Hidup", vi: "Phong cách", es: "Estilo de vida", ar: "نمط حياة", de: "Lifestyle", fr: "Mode de vie" } },
    { slug: "travel", icon: "✈️", name: { en: "Travel", tr: "Seyahat", ru: "Путешествия", zh: "旅行", id: "Perjalanan", vi: "Du lịch", es: "Viajes", ar: "سفر", de: "Reisen", fr: "Voyages" } },
    { slug: "music", icon: "🎵", name: { en: "Music", tr: "Müzik", ru: "Музыка", zh: "音乐", id: "Musik", vi: "Âm nhạc", es: "Música", ar: "موسيقى", de: "Musik", fr: "Musique" } },
    { slug: "movies", icon: "🎬", name: { en: "Movies", tr: "Film", ru: "Кино", zh: "电影", id: "Film", vi: "Phim", es: "Cine", ar: "أفلام", de: "Filme", fr: "Films" } },
    { slug: "sports", icon: "⚽", name: { en: "Sports", tr: "Spor", ru: "Спорт", zh: "体育", id: "Olahraga", vi: "Thể thao", es: "Deportes", ar: "رياضة", de: "Sport", fr: "Sports" } },
    { slug: "art", icon: "🎨", name: { en: "Art", tr: "Sanat", ru: "Искусство", zh: "艺术", id: "Seni", vi: "Nghệ thuật", es: "Arte", ar: "فن", de: "Kunst", fr: "Art" } },
  ];

  const categories: Record<string, number> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const c = categoryData[i];
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: J(c.name), icon: c.icon, order: i },
      create: { slug: c.slug, name: J(c.name), icon: c.icon, order: i },
    });
    categories[c.slug] = row.id;
  }
  console.log(`  ✓ ${categoryData.length} categories`);

  const planData = [
    {
      slug: "bronze",
      durationDays: 30,
      price: 9.99,
      name: { en: "Bronze", tr: "Bronz" },
      description: {
        en: "Listing boost, gold badge, 30 days.",
        tr: "Sıralama avantajı, altın rozet, 30 gün.",
      },
      features: {
        listingPosition: 3,
        featuredBadge: true,
        highlightColor: false,
        bannerSlot: false,
        priorityInCategory: false,
        detailedStats: false,
        maxChannels: 1,
      },
    },
    {
      slug: "silver",
      durationDays: 90,
      price: 24.99,
      name: { en: "Silver", tr: "Gümüş" },
      description: {
        en: "Priority listing, highlight, 90 days.",
        tr: "Öncelikli sıralama, vurgu, 90 gün.",
      },
      features: {
        listingPosition: 2,
        featuredBadge: true,
        highlightColor: true,
        bannerSlot: false,
        priorityInCategory: true,
        detailedStats: true,
        maxChannels: 2,
      },
    },
    {
      slug: "gold",
      durationDays: 180,
      price: 49.99,
      name: { en: "Gold", tr: "Altın" },
      description: {
        en: "Top of list, banner slot, 180 days.",
        tr: "Listenin tepesi, banner alanı, 180 gün.",
      },
      features: {
        listingPosition: 1,
        featuredBadge: true,
        highlightColor: true,
        bannerSlot: true,
        priorityInCategory: true,
        detailedStats: true,
        maxChannels: 3,
      },
    },
    {
      slug: "platinum",
      durationDays: 365,
      price: 99.99,
      name: { en: "Platinum", tr: "Platin" },
      description: {
        en: "Yearly, all features unlocked.",
        tr: "Yıllık, tüm özellikler açık.",
      },
      features: {
        listingPosition: 1,
        featuredBadge: true,
        highlightColor: true,
        bannerSlot: true,
        priorityInCategory: true,
        detailedStats: true,
        maxChannels: 5,
      },
    },
  ];
  for (let i = 0; i < planData.length; i++) {
    const p = planData[i];
    await prisma.premiumPlan.upsert({
      where: { slug: p.slug },
      update: {
        name: J(p.name),
        description: J(p.description),
        durationDays: p.durationDays,
        price: p.price,
        features: J(p.features),
        order: i,
      },
      create: {
        slug: p.slug,
        name: J(p.name),
        description: J(p.description),
        durationDays: p.durationDays,
        price: p.price,
        currency: "USD",
        features: J(p.features),
        order: i,
      },
    });
  }
  console.log("  ✓ 4 premium plans");

  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "admin12345";
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tgdir.local" },
    update: { password: adminHash, role: "SUPER_ADMIN" },
    create: {
      email: "admin@tgdir.local",
      name: "TgDir Admin",
      username: "admin",
      password: adminHash,
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      bio: "Platform administrator.",
    },
  });
  console.log(`  ✓ Admin user admin@tgdir.local (pw: ${adminPassword})`);

  const demoHash = await bcrypt.hash("demo12345", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@tgdir.local" },
    update: { password: demoHash },
    create: {
      email: "user@tgdir.local",
      name: "Demo User",
      username: "demouser",
      password: demoHash,
      role: "USER",
      isEmailVerified: true,
    },
  });
  console.log("  ✓ Demo user user@tgdir.local (pw: demo12345)");

  const channelSeed = [
    { username: "durov", title: "Pavel Durov", memberCount: 12_500_000, language: "en", categorySlug: "technology", verified: true, premium: true, previousRank: 2, description: "Founder of Telegram. Thoughts on tech, privacy, and the internet." },
    { username: "telegram", title: "Telegram News", memberCount: 9_800_000, language: "en", categorySlug: "news", verified: true, premium: true, previousRank: 1, description: "Official Telegram news channel." },
    { username: "nasa", title: "NASA Updates", memberCount: 4_200_000, language: "en", categorySlug: "science", verified: true, previousRank: 3, description: "Latest missions, discoveries, and imagery from NASA." },
    { username: "cryptosignals", title: "Crypto Signals Daily", memberCount: 3_100_000, language: "en", categorySlug: "crypto", premium: true, previousRank: 6, description: "Daily market updates and crypto signals." },
    { username: "techcrunch", title: "TechCrunch", memberCount: 2_700_000, language: "en", categorySlug: "technology", verified: true, previousRank: 4, description: "Breaking technology news and analysis." },
    { username: "memehub", title: "Meme Hub", memberCount: 2_300_000, language: "en", categorySlug: "memes", previousRank: 5, description: "The freshest memes on Telegram." },
    { username: "forexpro", title: "Forex Pro Trading", memberCount: 1_900_000, language: "en", categorySlug: "finance", premium: true, previousRank: 8, description: "Professional forex analysis and trade ideas." },
    { username: "gameleaks", title: "Game Leaks & News", memberCount: 1_500_000, language: "en", categorySlug: "gaming", previousRank: 7, description: "Leaks, announcements and gaming news." },
    { username: "codingdaily", title: "Coding Daily", memberCount: 1_200_000, language: "en", categorySlug: "technology", previousRank: 9, description: "Daily coding tips, snippets, and resources." },
    { username: "healthtips", title: "Health Tips Daily", memberCount: 980_000, language: "en", categorySlug: "health", previousRank: 10, description: "Short, evidence-based health tips every day." },
    { username: "habr_tech", title: "Хабр", memberCount: 450_000, language: "ru", categorySlug: "technology", description: "IT-сообщество Habr: статьи, новости, разборы." },
    { username: "kexue_zhongwen", title: "科技中文", memberCount: 380_000, language: "zh", categorySlug: "technology", description: "最新科技中文资讯、评测和深度文章。" },
    { username: "tiqnia_alyawm", title: "تقنية اليوم", memberCount: 310_000, language: "ar", categorySlug: "technology", description: "آخر أخبار التقنية وشروحات عربية." },
    { username: "tecnologia_hoy", title: "Tecnología Hoy", memberCount: 275_000, language: "es", categorySlug: "technology", description: "Noticias y análisis de tecnología en español." },
    { username: "teknologi_id", title: "Teknologi ID", memberCount: 240_000, language: "id", categorySlug: "technology", description: "Berita teknologi, tutorial, dan ulasan perangkat." },
    { username: "teknoloji_tr", title: "Teknoloji Türkiye", memberCount: 210_000, language: "tr", categorySlug: "technology", description: "Türkiye'den teknoloji haberleri ve incelemeler." },
    { username: "congnghe_vn", title: "Công Nghệ VN", memberCount: 180_000, language: "vi", categorySlug: "technology", description: "Tin công nghệ, đánh giá thiết bị và thủ thuật." },
  ];

  const goldPlan = await prisma.premiumPlan.findUnique({ where: { slug: "gold" } });

  for (let i = 0; i < channelSeed.length; i++) {
    const c = channelSeed[i];
    const rank = i + 1;
    await prisma.channel.upsert({
      where: { username: c.username },
      update: {
        title: c.title,
        description: c.description,
        memberCount: c.memberCount,
        language: c.language,
        categoryId: categories[c.categorySlug],
        isVerified: Boolean(c.verified),
        isPremium: Boolean(c.premium),
        premiumUntil: c.premium ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) : null,
        premiumPlanId: c.premium && goldPlan ? goldPlan.id : null,
        premiumPosition: c.premium ? 100 - i : null,
        hasBadge: Boolean(c.premium),
        rank,
        previousRank: c.previousRank ?? rank,
        submittedById: demoUser.id,
      },
      create: {
        username: c.username,
        telegramId: `-100${(1_000_000 + i * 137).toString().padStart(10, "0")}`,
        title: c.title,
        description: c.description,
        type: "CHANNEL",
        memberCount: c.memberCount,
        language: c.language,
        categoryId: categories[c.categorySlug],
        isVerified: Boolean(c.verified),
        isActive: true,
        isPremium: Boolean(c.premium),
        premiumUntil: c.premium ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) : null,
        premiumPlanId: c.premium && goldPlan ? goldPlan.id : null,
        premiumPosition: c.premium ? 100 - i : null,
        hasBadge: Boolean(c.premium),
        rank,
        previousRank: c.previousRank ?? rank,
        dailyGrowth: Math.round(c.memberCount * 0.002),
        weeklyGrowth: Math.round(c.memberCount * 0.01),
        monthlyGrowth: Math.round(c.memberCount * 0.04),
        submittedById: demoUser.id,
      },
    });
    await prisma.category.update({
      where: { slug: c.categorySlug },
      data: { channelCount: { increment: 1 } },
    });
  }
  console.log(`  ✓ ${channelSeed.length} channels`);

  const channelStatsSeed = await prisma.channel.findMany({
    where: { username: { in: channelSeed.slice(0, 5).map((c) => c.username) } },
  });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (const ch of channelStatsSeed) {
    for (let d = 29; d >= 0; d--) {
      const date = new Date(today.getTime() - d * 24 * 60 * 60 * 1000);
      const ratio = 1 - (d / 30) * 0.08;
      await prisma.channelStatistic.upsert({
        where: { id: -(ch.id * 100 + d) },
        update: {},
        create: {
          channelId: ch.id,
          memberCount: Math.round(ch.memberCount * ratio),
          date,
        },
      }).catch(async () => {
        await prisma.channelStatistic.create({
          data: {
            channelId: ch.id,
            memberCount: Math.round(ch.memberCount * ratio),
            date,
          },
        });
      });
    }
  }
  console.log("  ✓ 30 days of statistics for top 5 channels");

  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      slug: "about",
      title: J({ en: "About TgDir", tr: "TgDir Hakkında" }),
      content: J({
        en: "# About\nTgDir helps discover the best Telegram channels and groups.",
        tr: "# Hakkında\nTgDir, en iyi Telegram kanal ve gruplarını keşfetmeni sağlar.",
      }),
    },
  });
  await prisma.page.upsert({
    where: { slug: "privacy" },
    update: {},
    create: {
      slug: "privacy",
      title: J({ en: "Privacy Policy", tr: "Gizlilik Politikası" }),
      content: J({
        en: "# Privacy\nWe respect your privacy.",
        tr: "# Gizlilik\nGizliliğinize saygı duyuyoruz.",
      }),
    },
  });
  await prisma.page.upsert({
    where: { slug: "terms" },
    update: {},
    create: {
      slug: "terms",
      title: J({ en: "Terms of Service", tr: "Kullanım Koşulları" }),
      content: J({
        en: "# Terms\nBy using TgDir you accept these terms.",
        tr: "# Koşullar\nTgDir'i kullanarak bu koşulları kabul edersiniz.",
      }),
    },
  });
  console.log("  ✓ 3 static pages (about, privacy, terms)");

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENT",
      discountValue: 10,
      usageLimit: 100,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
  console.log("  ✓ Demo coupon WELCOME10 (10%)");

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
