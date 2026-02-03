import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL!;

async function seed() {
  console.log('🌱 Starting seed...');

  const sql = postgres(DATABASE_URL, { prepare: false });
  const db = drizzle(sql, { schema });

  // Clear existing data (order matters due to foreign keys)
  console.log('🗑️  Clearing existing data...');
  // New tables first
  await db.delete(schema.walletTransactions);
  await db.delete(schema.wallets);
  await db.delete(schema.cvUnlocks);
  await db.delete(schema.payments);
  await db.delete(schema.paymentMethods);
  await db.delete(schema.notifications);
  await db.delete(schema.pushTokens);
  await db.delete(schema.customerSubscriptions);
  await db.delete(schema.officeSubscriptions);
  await db.delete(schema.auditLogs);
  await db.delete(schema.businesses);
  // Original tables
  await db.delete(schema.favorites);
  await db.delete(schema.quotations);
  await db.delete(schema.maidDocuments);
  await db.delete(schema.maidLanguages);
  await db.delete(schema.maids);
  await db.delete(schema.customers);
  await db.delete(schema.oauthAccounts);
  await db.delete(schema.otpCodes);
  await db.delete(schema.users);
  await db.delete(schema.offices);
  await db.delete(schema.languages);
  await db.delete(schema.nationalities);
  // Pricing and plans (no user deps)
  await db.delete(schema.cvUnlockPricing);
  await db.delete(schema.businessPlans);
  await db.delete(schema.subscriptionPlans);
  await db.delete(schema.platformSettings);

  // Seed Nationalities (matching filter modal options)
  // Using fixed UUIDs that match mobile app constants in apps/mobile/src/constants/nationalities.ts
  // These UUIDs are deterministic to ensure consistency between mobile app and database
  console.log('🌍 Seeding nationalities...');
  const nationalitiesData = [
    { id: '00000000-0000-0000-0000-000000000001', code: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا' },
    { id: '00000000-0000-0000-0000-000000000002', code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين' },
    { id: '00000000-0000-0000-0000-000000000003', code: 'LK', nameEn: 'Sri Lanka', nameAr: 'سريلانكا' },
    { id: '00000000-0000-0000-0000-000000000004', code: 'IN', nameEn: 'India', nameAr: 'الهند' },
    { id: '00000000-0000-0000-0000-000000000005', code: 'ET', nameEn: 'Ethiopia', nameAr: 'إثيوبيا' },
    { id: '00000000-0000-0000-0000-000000000006', code: 'MM', nameEn: 'Myanmar', nameAr: 'ميانمار' },
    { id: '00000000-0000-0000-0000-000000000007', code: 'NP', nameEn: 'Nepal', nameAr: 'نيبال' },
    { id: '00000000-0000-0000-0000-000000000008', code: 'UG', nameEn: 'Uganda', nameAr: 'أوغندا' },
    { id: '00000000-0000-0000-0000-000000000009', code: 'KE', nameEn: 'Kenya', nameAr: 'كينيا' },
    { id: '00000000-0000-0000-0000-000000000010', code: 'TZ', nameEn: 'Tanzania', nameAr: 'تنزانيا' },
    { id: '00000000-0000-0000-0000-000000000011', code: 'GH', nameEn: 'Ghana', nameAr: 'غانا' },
    { id: '00000000-0000-0000-0000-000000000012', code: 'SL', nameEn: 'Sierra Leone', nameAr: 'سيراليون' },
  ];
  const nationalities = await db.insert(schema.nationalities).values(nationalitiesData).returning();
  console.log(`   ✓ ${nationalities.length} nationalities`);

  // Seed Languages
  console.log('💬 Seeding languages...');
  const languagesData = [
    { code: 'en', nameEn: 'English', nameAr: 'الإنجليزية' },
    { code: 'ar', nameEn: 'Arabic', nameAr: 'العربية' },
    { code: 'tl', nameEn: 'Filipino', nameAr: 'الفلبينية' },
    { code: 'id', nameEn: 'Indonesian', nameAr: 'الإندونيسية' },
    { code: 'hi', nameEn: 'Hindi', nameAr: 'الهندية' },
    { code: 'si', nameEn: 'Sinhala', nameAr: 'السنهالية' },
    { code: 'ta', nameEn: 'Tamil', nameAr: 'التاميلية' },
    { code: 'am', nameEn: 'Amharic', nameAr: 'الأمهرية' },
    { code: 'my', nameEn: 'Burmese', nameAr: 'البورمية' },
    { code: 'ne', nameEn: 'Nepali', nameAr: 'النيبالية' },
    { code: 'sw', nameEn: 'Swahili', nameAr: 'السواحلية' },
    { code: 'ak', nameEn: 'Akan', nameAr: 'الأكانية' },
    { code: 'kr', nameEn: 'Krio', nameAr: 'الكريولية' },
  ];
  const languages = await db.insert(schema.languages).values(languagesData).returning();
  console.log(`   ✓ ${languages.length} languages`);

  // Create nationality and language lookup maps
  const natMap = Object.fromEntries(nationalities.map(n => [n.code, n.id]));
  const langMap = Object.fromEntries(languages.map(l => [l.code, l.id]));

  // Seed Offices
  console.log('🏢 Seeding offices...');
  const officesData = [
    {
      name: 'Al Tadbeer Services',
      nameAr: 'خدمات التدبير',
      phone: '+971501234567',
      email: 'info@tadbeer.ae',
      address: 'Al Barsha, Dubai, UAE',
      addressAr: 'البرشاء، دبي، الإمارات',
      emirate: 'dubai',
      isVerified: true,
    },
    {
      name: 'Mubarak Recruitment',
      nameAr: 'مبارك للتوظيف',
      phone: '+971502345678',
      email: 'contact@mubarak.ae',
      address: 'Deira, Dubai, UAE',
      addressAr: 'ديرة، دبي، الإمارات',
      emirate: 'dubai',
      isVerified: true,
    },
    {
      name: 'Emirates Manpower',
      nameAr: 'القوى العاملة الإماراتية',
      phone: '+971503456789',
      email: 'hr@emiratesmanpower.ae',
      address: 'Abu Dhabi, UAE',
      addressAr: 'أبوظبي، الإمارات',
      emirate: 'abu_dhabi',
      isVerified: true,
    },
    {
      name: 'Gulf Workers Agency',
      nameAr: 'وكالة عمال الخليج',
      phone: '+971504567890',
      email: 'info@gulfworkers.ae',
      address: 'Sharjah, UAE',
      addressAr: 'الشارقة، الإمارات',
      emirate: 'sharjah',
      isVerified: false,
    },
  ];
  const offices = await db.insert(schema.offices).values(officesData).returning();
  console.log(`   ✓ ${offices.length} offices`);

  // Seed Demo Users
  console.log('👤 Seeding demo users...');

  // Super Admin (demo)
  const [superAdmin] = await db.insert(schema.users).values({
    phone: '+971555000300',
    name: 'Super Admin',
    nameAr: 'المشرف العام',
    role: 'super_admin',
    isDemo: true,
  }).returning();
  console.log(`   ✓ 1 super admin (demo)`);

  // Office Admins (demo) - one per office
  const officeAdmins = await db.insert(schema.users).values([
    { phone: '+971555000201', name: 'Admin - Al Tadbeer', nameAr: 'مدير التدبير', role: 'office_admin', officeId: offices[0].id, isDemo: true },
    { phone: '+971555000202', name: 'Admin - Mubarak', nameAr: 'مدير مبارك', role: 'office_admin', officeId: offices[1].id, isDemo: true },
    { phone: '+971555000203', name: 'Admin - Emirates', nameAr: 'مدير الإمارات', role: 'office_admin', officeId: offices[2].id, isDemo: true },
    { phone: '+971555000204', name: 'Admin - Gulf Workers', nameAr: 'مدير الخليج', role: 'office_admin', officeId: offices[3].id, isDemo: true },
  ]).returning();
  console.log(`   ✓ ${officeAdmins.length} office admins (demo)`);

  // Email/Password Demo Users
  console.log('📧 Seeding email/password demo users...');
  const hashedPassword = await bcrypt.hash('1234', 10);

  // Super Admin with email/password
  await db.insert(schema.users).values({
    email: 'admin@tadbeer.com',
    password: hashedPassword,
    name: 'Super Admin',
    nameAr: 'المشرف العام',
    role: 'super_admin',
    isDemo: true,
  });

  // Customer with email/password
  await db.insert(schema.users).values({
    email: 'customer@hotmail.com',
    password: hashedPassword,
    name: 'Demo Customer',
    nameAr: 'عميل تجريبي',
    role: 'customer',
    isDemo: true,
  });

  // Office Admin with email/password (already registered office - skip onboarding)
  await db.insert(schema.users).values({
    email: 'office@tadbeer.com',
    password: hashedPassword,
    name: 'Demo Office Admin',
    nameAr: 'مدير مكتب تجريبي',
    role: 'office_admin',
    officeId: offices[0].id,
    isDemo: true,
  });

  // Company user for office registration testing (no office yet)
  await db.insert(schema.users).values({
    email: 'company@tadbeer.com',
    password: hashedPassword,
    name: 'Company Admin',
    nameAr: 'مدير الشركة',
    role: 'customer', // Customer role - will become office_admin after registration
    isDemo: true,
  });
  console.log(`   ✓ 4 email/password demo users`);

  // Female photo URLs from Unsplash
  const femalePhotos = [
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1499887142886-791eca5918cd?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1512361436605-a484bdb34b5f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531927557220-a9e23c1e4794?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1509868918748-a554ad25f858?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1513207565459-d7f36bfa1222?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=400&fit=crop&crop=face',
  ];

  // Seed 40 Maids/Domestic Workers with serviceType distribution
  console.log('👩 Seeding 40 domestic workers...');

  const serviceTypes = ['cleaning', 'cooking', 'babysitter', 'elderly'] as const;
  const hiringTypes = ['customer_visa', 'monthly_yearly', 'hourly_daily'] as const;
  const natCodes = ['ID', 'PH', 'LK', 'IN', 'ET', 'MM', 'NP', 'UG', 'KE', 'TZ', 'GH', 'SL'];
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed'] as const;
  const religions = ['muslim', 'non_muslim'] as const;

  // Age brackets: 20-30, 31-40, 40+ (birth years for 2026)
  const ageBrackets = [
    { minYear: 1996, maxYear: 2006 }, // 20-30
    { minYear: 1986, maxYear: 1995 }, // 31-40
    { minYear: 1966, maxYear: 1985 }, // 40+
  ];

  // Experience levels to cover all filter options: 0, 1, 2, 3, 5+
  const experienceLevels = [0, 1, 2, 3, 5, 6, 7, 8, 10, 12];

  // Salary ranges to cover full 0-10000 AED spectrum
  const salaryRanges = [
    1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3500, 4000,
    4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000,
  ];

  // Names grouped by nationality
  const namesByNationality: Record<string, { en: string; ar: string }[]> = {
    ID: [
      { en: 'Siti Rahayu', ar: 'سيتي راهايو' },
      { en: 'Dewi Kusuma', ar: 'ديوي كوسوما' },
      { en: 'Rina Wati', ar: 'رينا واتي' },
      { en: 'Yuni Astuti', ar: 'يوني أستوتي' },
      { en: 'Mega Sari', ar: 'ميغا ساري' },
    ],
    PH: [
      { en: 'Maria Santos', ar: 'ماريا سانتوس' },
      { en: 'Ana Reyes', ar: 'آنا رييس' },
      { en: 'Rosa Mendoza', ar: 'روزا ميندوزا' },
      { en: 'Carmen Cruz', ar: 'كارمن كروز' },
      { en: 'Luz Garcia', ar: 'لوز غارسيا' },
    ],
    LK: [
      { en: 'Lakshmi Perera', ar: 'لاكشمي بيريرا' },
      { en: 'Chamari Silva', ar: 'شاماري سيلفا' },
      { en: 'Nimali Fernando', ar: 'نيمالي فرناندو' },
      { en: 'Kumari Jayawardena', ar: 'كوماري جايوردينا' },
      { en: 'Dilani Rajapaksa', ar: 'ديلاني راجاباكسا' },
    ],
    IN: [
      { en: 'Priya Sharma', ar: 'بريا شارما' },
      { en: 'Nirmala Devi', ar: 'نيرمالا ديفي' },
      { en: 'Sunita Kumari', ar: 'سونيتا كوماري' },
      { en: 'Lakshmi Patel', ar: 'لاكشمي باتيل' },
      { en: 'Meena Gupta', ar: 'مينا غوبتا' },
    ],
    ET: [
      { en: 'Tigist Bekele', ar: 'تيجيست بيكيلي' },
      { en: 'Amina Hassan', ar: 'أمينة حسن' },
      { en: 'Hana Desta', ar: 'هنا ديستا' },
      { en: 'Sara Tesfaye', ar: 'سارة تسفاي' },
      { en: 'Meron Abebe', ar: 'ميرون أبيبي' },
    ],
    MM: [
      { en: 'Aye Myat', ar: 'آي ميات' },
      { en: 'Thandar Win', ar: 'ثاندار وين' },
      { en: 'Khin Lay', ar: 'خين لاي' },
      { en: 'Su Su', ar: 'سو سو' },
      { en: 'Mya Mya', ar: 'ميا ميا' },
    ],
    NP: [
      { en: 'Sunita Gurung', ar: 'سونيتا جورونج' },
      { en: 'Asha Tamang', ar: 'آشا تامانج' },
      { en: 'Maya Thapa', ar: 'مايا تابا' },
      { en: 'Sita Rai', ar: 'سيتا راي' },
      { en: 'Gita Sherpa', ar: 'جيتا شيربا' },
    ],
    UG: [
      { en: 'Sarah Nakato', ar: 'سارة ناكاتو' },
      { en: 'Peace Nambi', ar: 'بيس نامبي' },
      { en: 'Hope Achieng', ar: 'هوب أشينغ' },
      { en: 'Ruth Nalwanga', ar: 'روث نالوانغا' },
      { en: 'Grace Nambooze', ar: 'غريس نامبوزي' },
    ],
    KE: [
      { en: 'Grace Wanjiku', ar: 'غريس وانجيكو' },
      { en: 'Joyce Adhiambo', ar: 'جويس أديامبو' },
      { en: 'Mary Njeri', ar: 'ماري نجيري' },
      { en: 'Faith Muthoni', ar: 'فيث موثوني' },
      { en: 'Esther Wambui', ar: 'إستر وامبوي' },
    ],
    TZ: [
      { en: 'Fatuma Ally', ar: 'فاطمة علي' },
      { en: 'Zaina Mohamed', ar: 'زينة محمد' },
      { en: 'Rehema Bakari', ar: 'رحيمة بكاري' },
      { en: 'Amina Juma', ar: 'أمينة جمعة' },
      { en: 'Halima Hassan', ar: 'حليمة حسن' },
    ],
    GH: [
      { en: 'Abena Mensah', ar: 'أبينا منسا' },
      { en: 'Akosua Owusu', ar: 'أكوسوا أووسو' },
      { en: 'Ama Boateng', ar: 'أما بواتينغ' },
      { en: 'Efua Asante', ar: 'إيفوا أسانتي' },
      { en: 'Adwoa Osei', ar: 'أدوا أوسي' },
    ],
    SL: [
      { en: 'Fatmata Kamara', ar: 'فاطمة كمارا' },
      { en: 'Mariama Sesay', ar: 'مريمة سيساي' },
      { en: 'Isata Koroma', ar: 'إيساتا كوروما' },
      { en: 'Aminata Bangura', ar: 'أمينة بانغورا' },
      { en: 'Hawa Conteh', ar: 'هوا كونتيه' },
    ],
  };

  // Bios by service type
  const biosByServiceType: Record<string, { en: string; ar: string }[]> = {
    cleaning: [
      { en: 'Professional cleaner with experience in luxury homes and villas. Meticulous attention to detail.', ar: 'منظفة محترفة لديها خبرة في المنازل والفلل الفاخرة. اهتمام دقيق بالتفاصيل.' },
      { en: 'Expert in deep cleaning and organizing. Known for maintaining spotless homes.', ar: 'خبيرة في التنظيف العميق والترتيب. معروفة بالحفاظ على منازل نظيفة.' },
      { en: 'Specialized in household cleaning and laundry. Excellent ironing skills.', ar: 'متخصصة في التنظيف المنزلي والغسيل. مهارات كي ممتازة.' },
      { en: 'Thorough and efficient cleaner. Experience with all types of surfaces and materials.', ar: 'منظفة دقيقة وفعالة. خبرة في جميع أنواع الأسطح والمواد.' },
    ],
    cooking: [
      { en: 'Skilled cook specializing in Arabic, Indian, and Continental cuisine. Creative with healthy recipes.', ar: 'طاهية ماهرة متخصصة في المطبخ العربي والهندي والعالمي. مبدعة في الوصفات الصحية.' },
      { en: 'Expert chef with experience in family and party cooking. Excellent presentation skills.', ar: 'طاهية خبيرة مع خبرة في الطهي العائلي والحفلات. مهارات تقديم ممتازة.' },
      { en: 'Passionate about cooking healthy meals. Specializes in vegetarian and diet-conscious recipes.', ar: 'شغوفة بطهي وجبات صحية. متخصصة في الوصفات النباتية والحمية.' },
      { en: 'Professional cook with hotel training. Expert in multiple cuisines and baking.', ar: 'طاهية محترفة مع تدريب فندقي. خبيرة في المأكولات المتعددة والخبز.' },
    ],
    babysitter: [
      { en: 'Professional nanny with early childhood education background. CPR certified and first aid trained.', ar: 'مربية محترفة مع خلفية في تعليم الطفولة المبكرة. حاصلة على شهادة الإنعاش والإسعافات الأولية.' },
      { en: 'Loving caregiver specializing in infant and toddler care. Patient and nurturing personality.', ar: 'مقدمة رعاية محبة متخصصة في رعاية الرضع والأطفال. شخصية صبورة ورعاية.' },
      { en: 'Experienced with children of all ages. Creative in educational activities and games.', ar: 'خبرة مع الأطفال من جميع الأعمار. مبدعة في الأنشطة التعليمية والألعاب.' },
      { en: 'Dedicated babysitter with excellent references. Focused on child safety and development.', ar: 'جليسة أطفال متفانية مع مراجع ممتازة. تركز على سلامة الطفل ونموه.' },
    ],
    elderly: [
      { en: 'Compassionate caregiver specializing in elderly care. Patient and understanding with seniors.', ar: 'مقدمة رعاية عطوفة متخصصة في رعاية المسنين. صبورة ومتفهمة مع كبار السن.' },
      { en: 'Experienced in senior care including mobility assistance and medication reminders.', ar: 'خبرة في رعاية كبار السن بما في ذلك المساعدة في الحركة وتذكير الأدوية.' },
      { en: 'Trained caregiver for elderly with special needs. Gentle and attentive approach.', ar: 'مقدمة رعاية مدربة للمسنين ذوي الاحتياجات الخاصة. نهج لطيف ومنتبه.' },
      { en: 'Dedicated to providing dignified care for seniors. Experience with dementia and Alzheimer\'s patients.', ar: 'مكرسة لتقديم رعاية كريمة لكبار السن. خبرة مع مرضى الخرف والزهايمر.' },
    ],
  };

  const maidsData = [];
  let photoIndex = 0;
  let nameIndexes: Record<string, number> = {};

  // Generate 48 maids - 12 per service category, covering all filter combinations
  const totalMaids = 48;
  for (let i = 0; i < totalMaids; i++) {
    const serviceType = serviceTypes[i % 4]; // Distribute evenly: 12 per category
    const natCode = natCodes[i % natCodes.length];
    const officeIndex = i % offices.length;

    // Get name for this nationality
    if (!nameIndexes[natCode]) nameIndexes[natCode] = 0;
    const names = namesByNationality[natCode];
    const nameData = names[nameIndexes[natCode] % names.length];
    nameIndexes[natCode]++;

    // Get bio for service type
    const bios = biosByServiceType[serviceType];
    const bioData = bios[i % bios.length];

    // Age distribution: cycle through age brackets
    const ageBracket = ageBrackets[i % 3];
    const yearRange = ageBracket.maxYear - ageBracket.minYear;
    const birthYear = ageBracket.minYear + (i % (yearRange + 1));
    const birthMonth = (i % 12) + 1;
    const birthDay = (i % 28) + 1;

    // Experience: cover all filter levels (0, 1, 2, 3, 5+)
    const experience = experienceLevels[i % experienceLevels.length];

    // Salary: wide range from 1200 to 9000 AED
    const salary = salaryRanges[i % salaryRanges.length];

    // Marital status: alternate between married and not_married variants
    const maritalStatus = maritalStatuses[i % maritalStatuses.length];

    // Religion: alternate
    const religion = religions[i % religions.length];

    // Status: mostly available, some busy/reserved
    let status: 'available' | 'busy' | 'reserved' = 'available';
    if (i === 5 || i === 17 || i === 29) status = 'busy';
    if (i === 11 || i === 23 || i === 35) status = 'reserved';

    // Distribute hiring types evenly across maids
    const hiringType = hiringTypes[i % 3];

    maidsData.push({
      officeId: offices[officeIndex].id,
      name: nameData.en,
      nameAr: nameData.ar,
      nationalityId: natMap[natCode],
      dateOfBirth: new Date(`${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`),
      maritalStatus,
      religion,
      experienceYears: experience,
      salary: `${salary}.00`,
      status,
      serviceType,
      hiringType,
      photoUrl: femalePhotos[photoIndex % femalePhotos.length],
      bio: bioData.en,
      bioAr: bioData.ar,
    });

    photoIndex++;
  }

  const maids = await db.insert(schema.maids).values(maidsData).returning();
  console.log(`   ✓ ${maids.length} maids (12 per category: cleaning, cooking, babysitter, elderly)`);

  // Seed Maid Languages
  console.log('🗣️  Seeding maid languages...');
  const maidLanguagesData: { maidId: string; languageId: string }[] = [];

  for (let i = 0; i < maids.length; i++) {
    const maid = maids[i];
    const natCode = natCodes[i % natCodes.length];

    // All maids speak English
    maidLanguagesData.push({ maidId: maid.id, languageId: langMap['en'] });

    // Add native language based on nationality
    const nativeLanguages: Record<string, string> = {
      ID: 'id',
      PH: 'tl',
      LK: 'si',
      IN: 'hi',
      ET: 'am',
      MM: 'my',
      NP: 'ne',
      UG: 'sw',
      KE: 'sw',
      TZ: 'sw',
      GH: 'ak',
      SL: 'kr',
    };

    if (nativeLanguages[natCode] && langMap[nativeLanguages[natCode]]) {
      maidLanguagesData.push({ maidId: maid.id, languageId: langMap[nativeLanguages[natCode]] });
    }

    // Some speak Arabic (common in Gulf domestic worker market)
    if (i % 3 === 0) {
      maidLanguagesData.push({ maidId: maid.id, languageId: langMap['ar'] });
    }
  }

  await db.insert(schema.maidLanguages).values(maidLanguagesData);
  console.log(`   ✓ ${maidLanguagesData.length} maid language associations`);

  // Create demo customer
  console.log('👥 Seeding demo customer...');
  const [customer] = await db.insert(schema.users).values({
    phone: '+971555000100',
    name: 'Demo Customer',
    nameAr: 'عميل تجريبي',
    role: 'customer',
    isDemo: true,
  }).returning();

  await db.insert(schema.customers).values({
    userId: customer.id,
    emirate: 'Dubai',
    preferredLanguage: 'ar',
  });
  console.log(`   ✓ 1 customer (demo)`);

  // Create sample favorites
  console.log('❤️  Seeding favorites...');
  await db.insert(schema.favorites).values([
    { userId: customer.id, maidId: maids[0].id },
    { userId: customer.id, maidId: maids[4].id },
    { userId: customer.id, maidId: maids[9].id },
  ]);
  console.log(`   ✓ 3 favorites`);

  // Create sample quotation
  console.log('📋 Seeding quotation...');
  await db.insert(schema.quotations).values({
    customerId: customer.id,
    officeId: offices[0].id,
    maidId: maids[0].id,
    salary: '2500.00',
    contractMonths: 24,
    notes: 'Looking for live-in housekeeper. Need someone good with kids.',
    status: 'pending',
  });
  console.log(`   ✓ 1 quotation`);

  // Seed Businesses (Typing Offices & Visa Transfer Services)
  console.log('🏪 Seeding businesses (typing offices & visa transfer)...');
  const businessesData = [
    // Typing Offices - Dubai
    {
      type: 'typing_office' as const,
      name: 'Al Futtaim Typing Center',
      nameAr: 'مركز الفطيم للطباعة',
      phone: '+971501112233',
      whatsapp: '+971501112233',
      email: 'info@alfuttaimtyping.ae',
      address: 'Al Karama, Dubai',
      addressAr: 'الكرامة، دبي',
      emirate: 'dubai',
      description: 'Complete government services including visa processing, Emirates ID, and all typing services.',
      descriptionAr: 'خدمات حكومية شاملة تشمل معالجة التأشيرات والهوية الإماراتية وجميع خدمات الطباعة.',
      services: JSON.stringify(['Visa Processing', 'Emirates ID', 'Labor Card', 'Medical Typing', 'PRO Services']),
      servicesAr: JSON.stringify(['معالجة التأشيرات', 'الهوية الإماراتية', 'بطاقة العمل', 'الطباعة الطبية', 'خدمات PRO']),
      priceRange: '50-500 AED',
      workingHours: 'Sun-Thu: 8AM-8PM, Fri-Sat: 9AM-5PM',
      isVerified: true,
      isActive: true,
    },
    {
      type: 'typing_office' as const,
      name: 'Emirates Document Services',
      nameAr: 'خدمات الوثائق الإماراتية',
      phone: '+971502223344',
      whatsapp: '+971502223344',
      email: 'contact@emiratesdocs.ae',
      address: 'Deira, Dubai',
      addressAr: 'ديرة، دبي',
      emirate: 'dubai',
      description: 'Fast and reliable typing services for all government documents and business setup.',
      descriptionAr: 'خدمات طباعة سريعة وموثوقة لجميع المستندات الحكومية وتأسيس الأعمال.',
      services: JSON.stringify(['Business Setup', 'Trade License', 'Visa Services', 'Attestation']),
      servicesAr: JSON.stringify(['تأسيس الأعمال', 'الرخصة التجارية', 'خدمات التأشيرات', 'التصديق']),
      priceRange: '100-1000 AED',
      workingHours: 'Sun-Sat: 9AM-9PM',
      isVerified: true,
      isActive: true,
    },
    // Typing Offices - Abu Dhabi
    {
      type: 'typing_office' as const,
      name: 'Capital Typing Center',
      nameAr: 'مركز العاصمة للطباعة',
      phone: '+971503334455',
      whatsapp: '+971503334455',
      email: 'info@capitaltyping.ae',
      address: 'Khalifa City, Abu Dhabi',
      addressAr: 'مدينة خليفة، أبوظبي',
      emirate: 'abu_dhabi',
      description: 'Premier typing center serving Abu Dhabi with comprehensive government services.',
      descriptionAr: 'مركز طباعة رائد يخدم أبوظبي بخدمات حكومية شاملة.',
      services: JSON.stringify(['Visa Processing', 'Emirates ID', 'Tawtheeq', 'ADDC Services']),
      servicesAr: JSON.stringify(['معالجة التأشيرات', 'الهوية الإماراتية', 'توثيق', 'خدمات ADDC']),
      priceRange: '50-400 AED',
      workingHours: 'Sun-Thu: 8AM-6PM',
      isVerified: true,
      isActive: true,
    },
    // Typing Offices - Sharjah
    {
      type: 'typing_office' as const,
      name: 'Sharjah Express Typing',
      nameAr: 'الشارقة إكسبريس للطباعة',
      phone: '+971504445566',
      whatsapp: '+971504445566',
      email: 'sharjahexpress@typing.ae',
      address: 'Al Majaz, Sharjah',
      addressAr: 'المجاز، الشارقة',
      emirate: 'sharjah',
      description: 'Quick and affordable typing services for Sharjah residents.',
      descriptionAr: 'خدمات طباعة سريعة وبأسعار معقولة لسكان الشارقة.',
      services: JSON.stringify(['All Typing Services', 'Translation', 'Notary Public']),
      servicesAr: JSON.stringify(['جميع خدمات الطباعة', 'الترجمة', 'كاتب العدل']),
      priceRange: '30-300 AED',
      workingHours: 'Sun-Thu: 8AM-9PM, Fri: 4PM-9PM',
      isVerified: false,
      isActive: true,
    },
    // Visa Transfer Services - Dubai
    {
      type: 'visa_transfer' as const,
      name: 'Golden Visa Transfer',
      nameAr: 'جولدن لنقل الكفالة',
      phone: '+971505556677',
      whatsapp: '+971505556677',
      email: 'info@goldenvisatransfer.ae',
      address: 'Business Bay, Dubai',
      addressAr: 'الخليج التجاري، دبي',
      emirate: 'dubai',
      description: 'Specialized in domestic worker visa transfers. Fast processing with MOHRE expertise.',
      descriptionAr: 'متخصصون في نقل تأشيرات العمالة المنزلية. معالجة سريعة مع خبرة في وزارة الموارد البشرية.',
      services: JSON.stringify(['Visa Transfer', 'MOHRE Services', 'Contract Renewal', 'Cancellation']),
      servicesAr: JSON.stringify(['نقل التأشيرة', 'خدمات الوزارة', 'تجديد العقد', 'الإلغاء']),
      priceRange: '500-2000 AED',
      workingHours: 'Sun-Thu: 9AM-6PM',
      isVerified: true,
      isActive: true,
    },
    {
      type: 'visa_transfer' as const,
      name: 'Swift Sponsorship Services',
      nameAr: 'سويفت لخدمات الكفالة',
      phone: '+971506667788',
      whatsapp: '+971506667788',
      email: 'swift@sponsorship.ae',
      address: 'Jumeirah, Dubai',
      addressAr: 'جميرا، دبي',
      emirate: 'dubai',
      description: 'Complete sponsorship transfer solutions for domestic workers and employees.',
      descriptionAr: 'حلول نقل الكفالة الشاملة للعمالة المنزلية والموظفين.',
      services: JSON.stringify(['Sponsorship Transfer', 'Work Permit', 'Medical Check', 'Insurance']),
      servicesAr: JSON.stringify(['نقل الكفالة', 'تصريح العمل', 'الفحص الطبي', 'التأمين']),
      priceRange: '800-3000 AED',
      workingHours: 'Sun-Sat: 8AM-8PM',
      isVerified: true,
      isActive: true,
    },
    // Visa Transfer Services - Abu Dhabi
    {
      type: 'visa_transfer' as const,
      name: 'Abu Dhabi Visa Solutions',
      nameAr: 'حلول تأشيرات أبوظبي',
      phone: '+971507778899',
      whatsapp: '+971507778899',
      email: 'abudhabivisa@solutions.ae',
      address: 'Musaffah, Abu Dhabi',
      addressAr: 'مصفح، أبوظبي',
      emirate: 'abu_dhabi',
      description: 'Abu Dhabi based visa transfer specialists with government partnerships.',
      descriptionAr: 'متخصصون في نقل التأشيرات في أبوظبي مع شراكات حكومية.',
      services: JSON.stringify(['Visa Transfer', 'New Visa', 'Exit Permit', 'Status Change']),
      servicesAr: JSON.stringify(['نقل التأشيرة', 'تأشيرة جديدة', 'تصريح الخروج', 'تغيير الوضع']),
      priceRange: '600-2500 AED',
      workingHours: 'Sun-Thu: 8AM-5PM',
      isVerified: true,
      isActive: true,
    },
    // Visa Transfer Services - Sharjah
    {
      type: 'visa_transfer' as const,
      name: 'Sharjah Kafala Center',
      nameAr: 'مركز الشارقة للكفالة',
      phone: '+971508889900',
      whatsapp: '+971508889900',
      email: 'sharjahkafala@center.ae',
      address: 'Al Nahda, Sharjah',
      addressAr: 'النهضة، الشارقة',
      emirate: 'sharjah',
      description: 'Trusted visa transfer center serving Sharjah and Northern Emirates.',
      descriptionAr: 'مركز موثوق لنقل التأشيرات يخدم الشارقة والإمارات الشمالية.',
      services: JSON.stringify(['Visa Transfer', 'Domestic Worker Services', 'Document Clearing']),
      servicesAr: JSON.stringify(['نقل التأشيرة', 'خدمات العمالة المنزلية', 'تخليص المستندات']),
      priceRange: '400-1500 AED',
      workingHours: 'Sun-Thu: 9AM-7PM',
      isVerified: false,
      isActive: true,
    },
  ];

  const businessesResult = await db.insert(schema.businesses).values(businessesData).returning();
  console.log(`   ✓ ${businessesResult.length} businesses (4 typing offices + 4 visa transfer services)`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${nationalities.length} nationalities`);
  console.log(`   - ${languages.length} languages`);
  console.log(`   - ${offices.length} offices`);
  console.log(`   - ${businessesResult.length} businesses (typing offices & visa transfer)`);
  console.log(`   - 1 super admin`);
  console.log(`   - ${officeAdmins.length} office admins`);
  console.log(`   - ${maids.length} maids (12 per category)`);
  console.log(`   - 1 customer`);
  console.log(`   - 3 email/password demo users`);

  console.log('\n📂 Service Types Distribution:');
  console.log('   - 🧹 Cleaning: 12 maids');
  console.log('   - 🍳 Cooking: 12 maids');
  console.log('   - 👶 Babysitter: 12 maids');
  console.log('   - 👴 Elderly: 12 maids');

  console.log('\n🎯 Filter Coverage:');
  console.log('   - 12 nationalities (ID, PH, LK, IN, ET, MM, NP, UG, KE, TZ, GH, SL)');
  console.log('   - 3 age brackets (20-30, 31-40, 40+)');
  console.log('   - 4 marital statuses (single, married, divorced, widowed)');
  console.log('   - 2 religions (muslim, non_muslim)');
  console.log('   - 10 experience levels (0-12 years)');
  console.log('   - 20 salary points (1,200 - 9,000 AED)');
  console.log('   - 3 hiring types (customer_visa, monthly_yearly, hourly_daily)');

  console.log('\n🔐 Email/Password Demo Login (Password: 1234):');
  console.log('   ┌─────────────────┬───────────────────────────┬──────────────────────────┐');
  console.log('   │ Role            │ Email                     │ Office                   │');
  console.log('   ├─────────────────┼───────────────────────────┼──────────────────────────┤');
  console.log('   │ Super Admin     │ admin@tadbeer.com         │ -                        │');
  console.log('   │ Customer        │ customer@hotmail.com      │ -                        │');
  console.log('   │ Office Admin    │ office@tadbeer.com        │ Al Tadbeer Services      │');
  console.log('   │ New Company     │ company@tadbeer.com       │ (for office registration)│');
  console.log('   └─────────────────┴───────────────────────────┴──────────────────────────┘');

  console.log('\n🔐 Phone/OTP Demo Login (OTP: 1234):');
  console.log('   ┌─────────────────┬───────────────────┬──────────────────────────┐');
  console.log('   │ Role            │ Phone             │ Office                   │');
  console.log('   ├─────────────────┼───────────────────┼──────────────────────────┤');
  console.log('   │ Super Admin     │ +971555000300     │ -                        │');
  console.log('   │ Customer        │ +971555000100     │ -                        │');
  console.log('   │ Office Admin    │ +971555000201     │ Al Tadbeer Services      │');
  console.log('   │ Office Admin    │ +971555000202     │ Mubarak Recruitment      │');
  console.log('   │ Office Admin    │ +971555000203     │ Emirates Manpower        │');
  console.log('   │ Office Admin    │ +971555000204     │ Gulf Workers Agency      │');
  console.log('   └─────────────────┴───────────────────┴──────────────────────────┘');

  await sql.end();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
