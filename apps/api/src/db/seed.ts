import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL!;

async function seed() {
  console.log('🌱 Starting seed...');

  const sql = postgres(DATABASE_URL, { prepare: false });
  const db = drizzle(sql, { schema });

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
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

  // Seed Maids/Domestic Workers
  console.log('👩 Seeding domestic workers...');
  const maidsData = [
    {
      officeId: offices[0].id,
      name: 'Maria Santos',
      nameAr: 'ماريا سانتوس',
      nationalityId: natMap['PH'],
      dateOfBirth: new Date('1990-05-15'),
      maritalStatus: 'single' as const,
      religion: 'non_muslim' as const,
      experienceYears: 5,
      salary: '2500.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
      bio: 'Experienced housekeeper with childcare skills. Expert in cooking Filipino and Arabic cuisine. Caring and detail-oriented with excellent references from previous employers.',
      bioAr: 'خبرة في التدبير المنزلي مع مهارات رعاية الأطفال. خبيرة في الطبخ الفلبيني والعربي. مهتمة بالتفاصيل مع مراجع ممتازة.',
    },
    {
      officeId: offices[0].id,
      name: 'Siti Rahayu',
      nameAr: 'سيتي راهايو',
      nationalityId: natMap['ID'],
      dateOfBirth: new Date('1988-08-20'),
      maritalStatus: 'married' as const,
      religion: 'muslim' as const,
      experienceYears: 8,
      salary: '2800.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
      bio: 'Senior housemaid with expertise in elderly care. Speaks fluent Arabic. Known for patience and professionalism.',
      bioAr: 'خادمة منزل أولى متخصصة في رعاية كبار السن. تتحدث العربية بطلاقة. معروفة بالصبر والاحترافية.',
    },
    {
      officeId: offices[0].id,
      name: 'Tigist Bekele',
      nameAr: 'تيجيست بيكيلي',
      nationalityId: natMap['ET'],
      dateOfBirth: new Date('1995-03-10'),
      maritalStatus: 'single' as const,
      religion: 'non_muslim' as const,
      experienceYears: 3,
      salary: '2200.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face',
      bio: 'Young and energetic housekeeper. Good with children and pets. Fast learner with positive attitude.',
      bioAr: 'خادمة منزل شابة ونشيطة. جيدة مع الأطفال والحيوانات الأليفة. سريعة التعلم بموقف إيجابي.',
    },
    {
      officeId: offices[1].id,
      name: 'Priya Sharma',
      nameAr: 'بريا شارما',
      nationalityId: natMap['IN'],
      dateOfBirth: new Date('1992-11-25'),
      maritalStatus: 'married' as const,
      religion: 'non_muslim' as const,
      experienceYears: 6,
      salary: '2600.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      bio: 'Skilled cook specializing in Indian and continental cuisine. Clean and organized. Perfect for families who appreciate good food.',
      bioAr: 'طاهية ماهرة متخصصة في المطبخ الهندي والعالمي. نظيفة ومنظمة. مثالية للعائلات التي تقدر الطعام الجيد.',
    },
    {
      officeId: offices[1].id,
      name: 'Lakshmi Perera',
      nameAr: 'لاكشمي بيريرا',
      nationalityId: natMap['LK'],
      dateOfBirth: new Date('1987-07-08'),
      maritalStatus: 'widowed' as const,
      religion: 'non_muslim' as const,
      experienceYears: 10,
      salary: '3000.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      bio: 'Highly experienced in managing large households. Excellent references from prominent families. Expert in organizing and supervision.',
      bioAr: 'خبرة عالية في إدارة المنازل الكبيرة. مراجع ممتازة من عائلات بارزة. خبيرة في التنظيم والإشراف.',
    },
    {
      officeId: offices[1].id,
      name: 'Sunita Gurung',
      nameAr: 'سونيتا جورونج',
      nationalityId: natMap['NP'],
      dateOfBirth: new Date('1993-12-03'),
      maritalStatus: 'single' as const,
      religion: 'non_muslim' as const,
      experienceYears: 4,
      salary: '2400.00',
      status: 'busy' as const,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      bio: 'Hardworking and reliable. Good at housekeeping and laundry. Known for attention to detail and cleanliness.',
      bioAr: 'مجتهدة وموثوقة. جيدة في التدبير المنزلي والغسيل. معروفة بالاهتمام بالتفاصيل والنظافة.',
    },
    {
      officeId: offices[2].id,
      name: 'Fatima Rahman',
      nameAr: 'فاطمة رحمن',
      nationalityId: natMap['BD'],
      dateOfBirth: new Date('1991-09-18'),
      maritalStatus: 'married' as const,
      religion: 'muslim' as const,
      experienceYears: 7,
      salary: '2700.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
      bio: 'Experienced in childcare and cooking. Speaks English and Arabic fluently. Warm personality, great with kids.',
      bioAr: 'خبرة في رعاية الأطفال والطبخ. تتحدث الإنجليزية والعربية بطلاقة. شخصية دافئة، رائعة مع الأطفال.',
    },
    {
      officeId: offices[2].id,
      name: 'Grace Wanjiku',
      nameAr: 'غريس وانجيكو',
      nationalityId: natMap['KE'],
      dateOfBirth: new Date('1989-04-22'),
      maritalStatus: 'single' as const,
      religion: 'non_muslim' as const,
      experienceYears: 6,
      salary: '2500.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
      bio: 'Professional cleaner with experience in luxury homes and villas. Meticulous and trustworthy.',
      bioAr: 'منظفة محترفة لديها خبرة في المنازل والفلل الفاخرة. دقيقة وجديرة بالثقة.',
    },
    {
      officeId: offices[2].id,
      name: 'Sarah Nakato',
      nameAr: 'سارة ناكاتو',
      nationalityId: natMap['UG'],
      dateOfBirth: new Date('1994-01-30'),
      maritalStatus: 'single' as const,
      religion: 'muslim' as const,
      experienceYears: 3,
      salary: '2300.00',
      status: 'reserved' as const,
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      bio: 'Friendly and caring. Specialized in infant and toddler care. First aid certified.',
      bioAr: 'ودودة ومهتمة. متخصصة في رعاية الرضع والأطفال الصغار. حاصلة على شهادة إسعافات أولية.',
    },
    {
      officeId: offices[0].id,
      name: 'Rosa Mendoza',
      nameAr: 'روزا ميندوزا',
      nationalityId: natMap['PH'],
      dateOfBirth: new Date('1985-06-12'),
      maritalStatus: 'divorced' as const,
      religion: 'non_muslim' as const,
      experienceYears: 12,
      salary: '3200.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      bio: 'Senior housekeeper with 12 years UAE experience. Expert in all household tasks. Can manage staff and supervise other helpers.',
      bioAr: 'خادمة منزل أولى مع 12 عام خبرة في الإمارات. خبيرة في جميع الأعمال المنزلية. قادرة على إدارة الموظفين.',
    },
    {
      officeId: offices[1].id,
      name: 'Dewi Kusuma',
      nameAr: 'ديوي كوسوما',
      nationalityId: natMap['ID'],
      dateOfBirth: new Date('1996-02-28'),
      maritalStatus: 'single' as const,
      religion: 'muslim' as const,
      experienceYears: 2,
      salary: '2100.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Young and eager to learn. Basic cooking and cleaning skills. Very polite and respectful.',
      bioAr: 'شابة ومتحمسة للتعلم. مهارات أساسية في الطبخ والتنظيف. مهذبة ومحترمة جداً.',
    },
    {
      officeId: offices[2].id,
      name: 'Asha Tamang',
      nameAr: 'آشا تامانج',
      nationalityId: natMap['NP'],
      dateOfBirth: new Date('1990-10-05'),
      maritalStatus: 'married' as const,
      religion: 'non_muslim' as const,
      experienceYears: 5,
      salary: '2500.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Experienced in villa maintenance and gardening. Also handles indoor plants and pet care.',
      bioAr: 'خبرة في صيانة الفلل والبستنة. تتعامل أيضاً مع النباتات الداخلية ورعاية الحيوانات الأليفة.',
    },
    {
      officeId: offices[0].id,
      name: 'Ana Reyes',
      nameAr: 'آنا رييس',
      nationalityId: natMap['PH'],
      dateOfBirth: new Date('1991-07-22'),
      maritalStatus: 'single' as const,
      religion: 'non_muslim' as const,
      experienceYears: 6,
      salary: '2700.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
      bio: 'Professional nanny with early childhood education background. CPR certified. Speaks English fluently.',
      bioAr: 'مربية محترفة مع خلفية في تعليم الطفولة المبكرة. حاصلة على شهادة إنعاش القلب. تتحدث الإنجليزية بطلاقة.',
    },
    {
      officeId: offices[1].id,
      name: 'Amina Hassan',
      nameAr: 'أمينة حسن',
      nationalityId: natMap['ET'],
      dateOfBirth: new Date('1993-04-15'),
      maritalStatus: 'married' as const,
      religion: 'muslim' as const,
      experienceYears: 4,
      salary: '2400.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
      bio: 'Excellent cook specializing in Middle Eastern and Ethiopian cuisine. Clean and organized housekeeper.',
      bioAr: 'طاهية ممتازة متخصصة في المطبخ الشرق أوسطي والإثيوبي. خادمة منزل نظيفة ومنظمة.',
    },
    {
      officeId: offices[2].id,
      name: 'Nirmala Devi',
      nameAr: 'نيرمالا ديفي',
      nationalityId: natMap['IN'],
      dateOfBirth: new Date('1988-11-08'),
      maritalStatus: 'married' as const,
      religion: 'non_muslim' as const,
      experienceYears: 9,
      salary: '2900.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=400&h=400&fit=crop&crop=face',
      bio: 'Experienced in managing large households with multiple children. Expert in Indian vegetarian cooking.',
      bioAr: 'خبرة في إدارة المنازل الكبيرة مع أطفال متعددين. خبيرة في الطبخ الهندي النباتي.',
    },
    {
      officeId: offices[0].id,
      name: 'Joyce Adhiambo',
      nameAr: 'جويس أديامبو',
      nationalityId: natMap['KE'],
      dateOfBirth: new Date('1992-08-30'),
      maritalStatus: 'single' as const,
      religion: 'non_muslim' as const,
      experienceYears: 5,
      salary: '2500.00',
      status: 'available' as const,
      photoUrl: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&h=400&fit=crop&crop=face',
      bio: 'Professional housekeeper with hotel training. Excellent ironing and laundry skills.',
      bioAr: 'خادمة منزل محترفة مع تدريب فندقي. مهارات ممتازة في الكي والغسيل.',
    },
  ];
  const maids = await db.insert(schema.maids).values(maidsData).returning();
  console.log(`   ✓ ${maids.length} maids`);

  // Seed Maid Languages
  console.log('🗣️  Seeding maid languages...');
  const maidLanguagesData = [
    // Maria (Filipino) - English, Filipino
    { maidId: maids[0].id, languageId: langMap['en'] },
    { maidId: maids[0].id, languageId: langMap['tl'] },
    // Siti (Indonesian) - Arabic, Indonesian, English
    { maidId: maids[1].id, languageId: langMap['ar'] },
    { maidId: maids[1].id, languageId: langMap['id'] },
    { maidId: maids[1].id, languageId: langMap['en'] },
    // Tigist (Ethiopian) - English
    { maidId: maids[2].id, languageId: langMap['en'] },
    // Priya (Indian) - Hindi, English
    { maidId: maids[3].id, languageId: langMap['hi'] },
    { maidId: maids[3].id, languageId: langMap['en'] },
    // Lakshmi (Sri Lankan) - English
    { maidId: maids[4].id, languageId: langMap['en'] },
    // Sunita (Nepali) - Nepali, English
    { maidId: maids[5].id, languageId: langMap['ne'] },
    { maidId: maids[5].id, languageId: langMap['en'] },
    // Fatima (Bangladeshi) - Bengali, Arabic, English
    { maidId: maids[6].id, languageId: langMap['bn'] },
    { maidId: maids[6].id, languageId: langMap['ar'] },
    { maidId: maids[6].id, languageId: langMap['en'] },
    // Grace (Kenyan) - Swahili, English
    { maidId: maids[7].id, languageId: langMap['sw'] },
    { maidId: maids[7].id, languageId: langMap['en'] },
    // Sarah (Ugandan) - Swahili, English, Arabic
    { maidId: maids[8].id, languageId: langMap['sw'] },
    { maidId: maids[8].id, languageId: langMap['en'] },
    { maidId: maids[8].id, languageId: langMap['ar'] },
    // Rosa (Filipino) - English, Filipino, Arabic
    { maidId: maids[9].id, languageId: langMap['en'] },
    { maidId: maids[9].id, languageId: langMap['tl'] },
    { maidId: maids[9].id, languageId: langMap['ar'] },
    // Dewi (Indonesian) - Indonesian, English
    { maidId: maids[10].id, languageId: langMap['id'] },
    { maidId: maids[10].id, languageId: langMap['en'] },
    // Asha (Nepali) - Nepali, English
    { maidId: maids[11].id, languageId: langMap['ne'] },
    { maidId: maids[11].id, languageId: langMap['en'] },
    // Ana (Filipino) - English, Filipino
    { maidId: maids[12].id, languageId: langMap['en'] },
    { maidId: maids[12].id, languageId: langMap['tl'] },
    // Amina (Ethiopian) - English, Arabic
    { maidId: maids[13].id, languageId: langMap['en'] },
    { maidId: maids[13].id, languageId: langMap['ar'] },
    // Nirmala (Indian) - Hindi, English
    { maidId: maids[14].id, languageId: langMap['hi'] },
    { maidId: maids[14].id, languageId: langMap['en'] },
    // Joyce (Kenyan) - Swahili, English
    { maidId: maids[15].id, languageId: langMap['sw'] },
    { maidId: maids[15].id, languageId: langMap['en'] },
  ];
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
  console.log(`   - ${maids.length} maids`);
  console.log(`   - 1 customer`);
  console.log(`   - 3 email/password demo users`);

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
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
