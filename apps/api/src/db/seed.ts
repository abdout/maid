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

  // Seed Nationalities
  console.log('🌍 Seeding nationalities...');
  const nationalitiesData = [
    { code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين' },
    { code: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا' },
    { code: 'ET', nameEn: 'Ethiopia', nameAr: 'إثيوبيا' },
    { code: 'IN', nameEn: 'India', nameAr: 'الهند' },
    { code: 'LK', nameEn: 'Sri Lanka', nameAr: 'سريلانكا' },
    { code: 'NP', nameEn: 'Nepal', nameAr: 'نيبال' },
    { code: 'BD', nameEn: 'Bangladesh', nameAr: 'بنغلاديش' },
    { code: 'KE', nameEn: 'Kenya', nameAr: 'كينيا' },
    { code: 'UG', nameEn: 'Uganda', nameAr: 'أوغندا' },
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
    { code: 'ur', nameEn: 'Urdu', nameAr: 'الأردية' },
    { code: 'sw', nameEn: 'Swahili', nameAr: 'السواحلية' },
    { code: 'ne', nameEn: 'Nepali', nameAr: 'النيبالية' },
    { code: 'bn', nameEn: 'Bengali', nameAr: 'البنغالية' },
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
      isVerified: true,
    },
    {
      name: 'Mubarak Recruitment',
      nameAr: 'مبارك للتوظيف',
      phone: '+971502345678',
      email: 'contact@mubarak.ae',
      address: 'Deira, Dubai, UAE',
      addressAr: 'ديرة، دبي، الإمارات',
      isVerified: true,
    },
    {
      name: 'Emirates Manpower',
      nameAr: 'القوى العاملة الإماراتية',
      phone: '+971503456789',
      email: 'hr@emiratesmanpower.ae',
      address: 'Abu Dhabi, UAE',
      addressAr: 'أبوظبي، الإمارات',
      isVerified: true,
    },
    {
      name: 'Gulf Workers Agency',
      nameAr: 'وكالة عمال الخليج',
      phone: '+971504567890',
      email: 'info@gulfworkers.ae',
      address: 'Sharjah, UAE',
      addressAr: 'الشارقة، الإمارات',
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
    email: 'admin@hotmail.com',
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

  // Office Admin with email/password
  await db.insert(schema.users).values({
    email: 'office@hotmail.com',
    password: hashedPassword,
    name: 'Demo Office Admin',
    nameAr: 'مدير مكتب تجريبي',
    role: 'office_admin',
    officeId: offices[0].id,
    isDemo: true,
  });
  console.log(`   ✓ 3 email/password demo users`);

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
  const natCodes = ['PH', 'ID', 'ET', 'IN', 'LK', 'NP', 'BD', 'KE', 'UG'];
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed'] as const;
  const religions = ['muslim', 'non_muslim'] as const;

  // Names grouped by nationality
  const namesByNationality: Record<string, { en: string; ar: string }[]> = {
    PH: [
      { en: 'Maria Santos', ar: 'ماريا سانتوس' },
      { en: 'Ana Reyes', ar: 'آنا رييس' },
      { en: 'Rosa Mendoza', ar: 'روزا ميندوزا' },
      { en: 'Carmen Cruz', ar: 'كارمن كروز' },
      { en: 'Luz Garcia', ar: 'لوز غارسيا' },
    ],
    ID: [
      { en: 'Siti Rahayu', ar: 'سيتي راهايو' },
      { en: 'Dewi Kusuma', ar: 'ديوي كوسوما' },
      { en: 'Rina Wati', ar: 'رينا واتي' },
      { en: 'Yuni Astuti', ar: 'يوني أستوتي' },
      { en: 'Mega Sari', ar: 'ميغا ساري' },
    ],
    ET: [
      { en: 'Tigist Bekele', ar: 'تيجيست بيكيلي' },
      { en: 'Amina Hassan', ar: 'أمينة حسن' },
      { en: 'Hana Desta', ar: 'هنا ديستا' },
      { en: 'Sara Tesfaye', ar: 'سارة تسفاي' },
      { en: 'Meron Abebe', ar: 'ميرون أبيبي' },
    ],
    IN: [
      { en: 'Priya Sharma', ar: 'بريا شارما' },
      { en: 'Nirmala Devi', ar: 'نيرمالا ديفي' },
      { en: 'Sunita Kumari', ar: 'سونيتا كوماري' },
      { en: 'Lakshmi Patel', ar: 'لاكشمي باتيل' },
      { en: 'Meena Gupta', ar: 'مينا غوبتا' },
    ],
    LK: [
      { en: 'Lakshmi Perera', ar: 'لاكشمي بيريرا' },
      { en: 'Chamari Silva', ar: 'شاماري سيلفا' },
      { en: 'Nimali Fernando', ar: 'نيمالي فرناندو' },
      { en: 'Kumari Jayawardena', ar: 'كوماري جايوردينا' },
    ],
    NP: [
      { en: 'Sunita Gurung', ar: 'سونيتا جورونج' },
      { en: 'Asha Tamang', ar: 'آشا تامانج' },
      { en: 'Maya Thapa', ar: 'مايا تابا' },
      { en: 'Sita Rai', ar: 'سيتا راي' },
    ],
    BD: [
      { en: 'Fatima Rahman', ar: 'فاطمة رحمن' },
      { en: 'Roksana Begum', ar: 'روكسانا بيجوم' },
      { en: 'Nasreen Akter', ar: 'نسرين أختر' },
      { en: 'Salma Khatun', ar: 'سلمى خاتون' },
    ],
    KE: [
      { en: 'Grace Wanjiku', ar: 'غريس وانجيكو' },
      { en: 'Joyce Adhiambo', ar: 'جويس أديامبو' },
      { en: 'Mary Njeri', ar: 'ماري نجيري' },
      { en: 'Faith Muthoni', ar: 'فيث موثوني' },
    ],
    UG: [
      { en: 'Sarah Nakato', ar: 'سارة ناكاتو' },
      { en: 'Peace Nambi', ar: 'بيس نامبي' },
      { en: 'Hope Achieng', ar: 'هوب أشينغ' },
      { en: 'Ruth Nalwanga', ar: 'روث نالوانغا' },
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

  // Generate 40 maids - 10 per category
  for (let i = 0; i < 40; i++) {
    const serviceType = serviceTypes[i % 4]; // Distribute evenly: 10 per category
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

    // Random attributes
    const birthYear = 1985 + (i % 15); // Ages 25-40
    const birthMonth = (i % 12) + 1;
    const birthDay = (i % 28) + 1;
    const experience = 2 + (i % 10); // 2-11 years
    const baseSalary = 2000 + (experience * 100) + ((i % 5) * 50);
    const maritalStatus = maritalStatuses[i % maritalStatuses.length];
    const religion = religions[i % religions.length];

    // Status: mostly available, some busy/reserved
    let status: 'available' | 'busy' | 'reserved' = 'available';
    if (i === 5 || i === 15) status = 'busy';
    if (i === 8 || i === 28) status = 'reserved';

    maidsData.push({
      officeId: offices[officeIndex].id,
      name: nameData.en,
      nameAr: nameData.ar,
      nationalityId: natMap[natCode],
      dateOfBirth: new Date(`${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`),
      maritalStatus,
      religion,
      experienceYears: experience,
      salary: `${baseSalary}.00`,
      status,
      serviceType,
      photoUrl: femalePhotos[photoIndex % femalePhotos.length],
      bio: bioData.en,
      bioAr: bioData.ar,
    });

    photoIndex++;
  }

  const maids = await db.insert(schema.maids).values(maidsData).returning();
  console.log(`   ✓ ${maids.length} maids (10 cleaning, 10 cooking, 10 babysitter, 10 elderly)`);

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
      PH: 'tl',
      ID: 'id',
      IN: 'hi',
      NP: 'ne',
      BD: 'bn',
      KE: 'sw',
      UG: 'sw',
    };

    if (nativeLanguages[natCode]) {
      maidLanguagesData.push({ maidId: maid.id, languageId: langMap[nativeLanguages[natCode]] });
    }

    // Some speak Arabic
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

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${nationalities.length} nationalities`);
  console.log(`   - ${languages.length} languages`);
  console.log(`   - ${offices.length} offices`);
  console.log(`   - 1 super admin`);
  console.log(`   - ${officeAdmins.length} office admins`);
  console.log(`   - ${maids.length} maids (10 per category)`);
  console.log(`   - 1 customer`);
  console.log(`   - 3 email/password demo users`);

  console.log('\n📂 Service Types Distribution:');
  console.log('   - 🧹 Cleaning: 10 maids');
  console.log('   - 🍳 Cooking: 10 maids');
  console.log('   - 👶 Babysitter: 10 maids');
  console.log('   - 👴 Elderly: 10 maids');

  console.log('\n🔐 Email/Password Demo Login (Password: 1234):');
  console.log('   ┌─────────────────┬───────────────────────────┬──────────────────────────┐');
  console.log('   │ Role            │ Email                     │ Office                   │');
  console.log('   ├─────────────────┼───────────────────────────┼──────────────────────────┤');
  console.log('   │ Super Admin     │ admin@hotmail.com         │ -                        │');
  console.log('   │ Customer        │ customer@hotmail.com      │ -                        │');
  console.log('   │ Office Admin    │ office@hotmail.com        │ Al Tadbeer Services      │');
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
