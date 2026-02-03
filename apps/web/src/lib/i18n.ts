'use client';

import { createContext, useContext } from 'react';

export type Locale = 'en' | 'ar';

export const translations = {
  en: {
    // Navbar
    nav: {
      about: 'About',
      features: 'Features',
      pricing: 'Pricing',
      platform: 'Platform',
      forOffices: 'For Offices',
      contact: 'Contact',
      adminLogin: 'Admin Login',
      downloadApp: 'Download App',
    },
    // Hero Section
    hero: {
      title: 'The App, Families Love',
      subtitle: 'Find trusted housemaids, nannies, and domestic helpers from verified recruitment offices across UAE',
      downloadNow: 'Download Now',
      forOffices: 'For Recruitment Offices',
      trustedBy: 'Trusted by thousands of families in UAE',
    },
    // Value Props
    valueProps: {
      forCustomers: 'For Customers',
      forCustomersDesc: 'Browse verified profiles, compare options, and hire with confidence',
      forOffices: 'For Offices',
      forOfficesDesc: 'Manage your workforce, reach more customers, grow your business',
    },
    // Features
    features: {
      title: 'Everything You Need',
      subtitle: 'A complete platform for finding and hiring domestic workers',
      search: {
        title: 'Smart Search',
        description: 'Filter by nationality, experience, skills, salary range, and more',
      },
      verified: {
        title: 'Verified Profiles',
        description: 'All workers are verified through licensed recruitment offices',
      },
      quotations: {
        title: 'Easy Quotations',
        description: 'Request and compare quotes from multiple offices instantly',
      },
      payments: {
        title: 'Secure Payments',
        description: 'Pay safely with Stripe or Tabby buy-now-pay-later',
      },
      bilingual: {
        title: 'Bilingual Support',
        description: 'Full Arabic and English support throughout the app',
      },
      support: {
        title: '24/7 Support',
        description: 'Get help anytime with our dedicated support team',
      },
    },
    // How It Works
    howItWorks: {
      title: 'How It Works',
      subtitle: 'Find your perfect domestic helper in 3 simple steps',
      step1: {
        title: 'Browse & Search',
        description: 'Explore profiles of verified domestic workers from trusted agencies',
      },
      step2: {
        title: 'Request Quotations',
        description: 'Get competitive quotes from multiple recruitment offices',
      },
      step3: {
        title: 'Hire with Confidence',
        description: 'Complete secure payment and welcome your new helper',
      },
    },
    // Stats
    stats: {
      maids: 'Domestic Workers',
      offices: 'Verified Offices',
      nationalities: 'Nationalities',
      satisfaction: 'Customer Satisfaction',
    },
    // Download
    download: {
      title: 'Download the App',
      subtitle: 'Available on iOS and Android',
      scanQr: 'Scan QR code to download',
      appStore: 'Download on App Store',
      playStore: 'Get it on Google Play',
    },
    // Footer
    footer: {
      company: 'Company',
      about: 'About Us',
      careers: 'Careers',
      press: 'Press',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      support: 'Support',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      faq: 'FAQ',
      followUs: 'Follow Us',
      copyright: '© 2025 Tadbeer. All rights reserved.',
      madeWith: 'Made with',
      inUAE: 'in UAE',
    },
    // Pricing Page
    pricing: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that fits your needs',
      cvUnlock: 'CV Unlock',
      cvUnlockDesc: 'Unlock contact details for any maid profile',
      perProfile: 'per profile',
      oneTime: 'One-time payment',
      includesContact: 'Includes phone number & full details',
      validForever: 'Valid forever once unlocked',
      officeSubscriptions: 'Office Subscriptions',
      officeSubscriptionsDesc: 'For recruitment offices',
      perMonth: '/month',
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise',
      maidsLimit: 'Up to {count} maid profiles',
      unlimitedMaids: 'Unlimited maid profiles',
      prioritySupport: 'Priority support',
      analytics: 'Analytics dashboard',
      apiAccess: 'API access',
      dedicatedManager: 'Dedicated account manager',
      getStarted: 'Get Started',
      contactSales: 'Contact Sales',
      currentPlan: 'Current Plan',
    },
    // For Offices Page
    forOfficesPage: {
      title: 'Grow Your Recruitment Business',
      subtitle: 'Partner with Domestic to reach thousands of customers across the Emirates',
      benefits: {
        title: 'Why Partner With Us',
        reach: {
          title: 'Expanded Reach',
          description: 'Access thousands of customers actively searching for domestic workers',
        },
        tools: {
          title: 'Powerful Tools',
          description: 'Manage your entire workforce from one easy-to-use dashboard',
        },
        payments: {
          title: 'Secure Payments',
          description: 'Get paid faster with integrated payment processing',
        },
        support: {
          title: 'Dedicated Support',
          description: 'Get a dedicated account manager to help grow your business',
        },
      },
      cta: {
        title: 'Ready to Get Started?',
        description: 'Join hundreds of recruitment offices already growing with Domestic',
        button: 'Register Your Office',
      },
    },
    // Contact Page
    contact: {
      title: 'Get in Touch',
      subtitle: 'Have questions? We\'d love to hear from you.',
      form: {
        name: 'Your Name',
        email: 'Email Address',
        subject: 'Subject',
        message: 'Message',
        submit: 'Send Message',
        sending: 'Sending...',
        success: 'Message sent successfully!',
        error: 'Failed to send message. Please try again.',
      },
      info: {
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        hours: 'Business Hours',
        hoursValue: 'Sunday - Thursday, 9AM - 6PM GST',
      },
    },
    // Testimonials
    testimonials: {
      title: 'Reviews',
      subtitle: 'Real Stories',
      description: 'Hear from families who found their perfect domestic helper through our platform',
      watermark: 'TRUSTED BY',
      categories: {
        customers: 'Customers',
        offices: 'Offices',
        partners: 'Partners',
      },
      items: [
        {
          id: '1',
          name: 'Sarah Al-Mahmoud',
          role: 'Working Mother',
          company: 'Dubai',
          category: 'customers',
          quote: 'Finding a reliable nanny was so easy through this platform. Within a week, we found someone perfect for our family. The verification process gave us complete peace of mind.',
          emojis: ['👶', '💝'],
        },
        {
          id: '2',
          name: 'Ahmed Hassan',
          role: 'Business Owner',
          company: 'Abu Dhabi',
          category: 'customers',
          quote: 'We needed a housekeeper who could manage our large home. The detailed profiles and video introductions helped us make the right choice. Highly recommended!',
          emojis: ['🏠', '⭐'],
        },
        {
          id: '3',
          name: 'Fatima Al-Rashid',
          role: 'HR Manager',
          company: 'Al Noor Recruitment',
          category: 'offices',
          quote: 'As a recruitment office, this platform has transformed how we connect with families. Our reach has expanded significantly and the process is so smooth.',
          emojis: ['📈', '🤝'],
        },
        {
          id: '4',
          name: 'Mohammed Al-Sayed',
          role: 'Operations Director',
          company: 'Gulf Staffing Solutions',
          category: 'offices',
          quote: 'The dashboard makes managing our workforce incredibly efficient. We can track applications, update profiles, and communicate with clients all in one place.',
          emojis: ['💼', '✨'],
        },
        {
          id: '5',
          name: 'Layla Khouri',
          role: 'New Mother',
          company: 'Sharjah',
          category: 'customers',
          quote: 'After my baby was born, I was overwhelmed trying to find help. This app made it simple to compare options and find a caring nanny. She has become part of our family.',
          emojis: ['👨‍👩‍👧', '❤️'],
        },
        {
          id: '6',
          name: 'Omar Al-Farsi',
          role: 'CEO',
          company: 'Premium Care Agency',
          category: 'partners',
          quote: 'Partnering with this platform has been a game-changer for our agency. The technology integration and support team are exceptional.',
          emojis: ['🚀', '💎'],
        },
        {
          id: '7',
          name: 'Nadia Ibrahim',
          role: 'Entrepreneur',
          company: 'Dubai Marina',
          category: 'customers',
          quote: 'As a busy entrepreneur, I needed someone trustworthy to help at home. The background checks and verified reviews gave me confidence in my choice.',
          emojis: ['👩‍💼', '🌟'],
        },
        {
          id: '8',
          name: 'Khalid Al-Mansoori',
          role: 'Partnership Manager',
          company: 'Tadbeer Centers',
          category: 'partners',
          quote: 'The collaboration with this platform has streamlined our operations. We can now serve families faster and more efficiently than ever before.',
          emojis: ['🏢', '🤝'],
        },
      ],
    },
    // Common
    common: {
      learnMore: 'Learn More',
      getStarted: 'Get Started',
      viewAll: 'View All',
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Try Again',
    },
  },
  ar: {
    // Navbar
    nav: {
      about: 'حول',
      features: 'المميزات',
      pricing: 'الأسعار',
      platform: 'المنصة',
      forOffices: 'للمكاتب',
      contact: 'اتصل بنا',
      adminLogin: 'دخول الإدارة',
      downloadApp: 'حمّل التطبيق',
    },
    // Hero Section
    hero: {
      title: 'التطبيق الذي تحبه العائلات',
      subtitle: 'ابحث عن خادمات وجليسات أطفال ومساعدات منزليات موثوقات من مكاتب توظيف معتمدة في جميع أنحاء الإمارات',
      downloadNow: 'حمّل الآن',
      forOffices: 'لمكاتب التوظيف',
      trustedBy: 'موثوق به من آلاف العائلات في الإمارات',
    },
    // Value Props
    valueProps: {
      forCustomers: 'للعملاء',
      forCustomersDesc: 'تصفح الملفات الموثقة، قارن الخيارات، ووظف بثقة',
      forOffices: 'للمكاتب',
      forOfficesDesc: 'أدر قوتك العاملة، ووصل لمزيد من العملاء، ونمِّ عملك',
    },
    // Features
    features: {
      title: 'كل ما تحتاجه',
      subtitle: 'منصة متكاملة للبحث عن العمالة المنزلية وتوظيفها',
      search: {
        title: 'بحث ذكي',
        description: 'فلترة حسب الجنسية والخبرة والمهارات ونطاق الراتب والمزيد',
      },
      verified: {
        title: 'ملفات موثقة',
        description: 'جميع العمال موثقون من خلال مكاتب توظيف مرخصة',
      },
      quotations: {
        title: 'عروض أسعار سهلة',
        description: 'اطلب وقارن عروض الأسعار من مكاتب متعددة فوراً',
      },
      payments: {
        title: 'دفع آمن',
        description: 'ادفع بأمان باستخدام Stripe أو تابي للدفع بالتقسيط',
      },
      bilingual: {
        title: 'دعم ثنائي اللغة',
        description: 'دعم كامل للعربية والإنجليزية في جميع أنحاء التطبيق',
      },
      support: {
        title: 'دعم 24/7',
        description: 'احصل على المساعدة في أي وقت مع فريق الدعم المتخصص',
      },
    },
    // How It Works
    howItWorks: {
      title: 'كيف يعمل',
      subtitle: 'ابحث عن المساعد المنزلي المثالي في 3 خطوات بسيطة',
      step1: {
        title: 'تصفح وابحث',
        description: 'استكشف ملفات العمالة المنزلية الموثقة من الوكالات الموثوقة',
      },
      step2: {
        title: 'اطلب عروض الأسعار',
        description: 'احصل على عروض تنافسية من مكاتب توظيف متعددة',
      },
      step3: {
        title: 'وظّف بثقة',
        description: 'أكمل الدفع الآمن ورحب بمساعدك الجديد',
      },
    },
    // Stats
    stats: {
      maids: 'عمالة منزلية',
      offices: 'مكاتب موثقة',
      nationalities: 'جنسيات',
      satisfaction: 'رضا العملاء',
    },
    // Download
    download: {
      title: 'حمّل التطبيق',
      subtitle: 'متوفر على iOS و Android',
      scanQr: 'امسح رمز QR للتحميل',
      appStore: 'حمّل من App Store',
      playStore: 'احصل عليه من Google Play',
    },
    // Footer
    footer: {
      company: 'الشركة',
      about: 'من نحن',
      careers: 'الوظائف',
      press: 'الصحافة',
      legal: 'قانوني',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      support: 'الدعم',
      helpCenter: 'مركز المساعدة',
      contactUs: 'اتصل بنا',
      faq: 'الأسئلة الشائعة',
      followUs: 'تابعنا',
      copyright: '© 2025 Tadbeer. جميع الحقوق محفوظة.',
      madeWith: 'صنع بـ',
      inUAE: 'في الإمارات',
    },
    // Pricing Page
    pricing: {
      title: 'أسعار بسيطة وشفافة',
      subtitle: 'اختر الخطة التي تناسب احتياجاتك',
      cvUnlock: 'فتح السيرة الذاتية',
      cvUnlockDesc: 'افتح تفاصيل الاتصال لأي ملف خادمة',
      perProfile: 'لكل ملف',
      oneTime: 'دفعة واحدة',
      includesContact: 'يتضمن رقم الهاتف والتفاصيل الكاملة',
      validForever: 'صالح للأبد بمجرد الفتح',
      officeSubscriptions: 'اشتراكات المكاتب',
      officeSubscriptionsDesc: 'لمكاتب التوظيف',
      perMonth: '/شهر',
      basic: 'أساسي',
      professional: 'احترافي',
      enterprise: 'مؤسسات',
      maidsLimit: 'حتى {count} ملف خادمة',
      unlimitedMaids: 'ملفات خادمات غير محدودة',
      prioritySupport: 'دعم ذو أولوية',
      analytics: 'لوحة التحليلات',
      apiAccess: 'وصول API',
      dedicatedManager: 'مدير حساب مخصص',
      getStarted: 'ابدأ الآن',
      contactSales: 'تواصل مع المبيعات',
      currentPlan: 'الخطة الحالية',
    },
    // For Offices Page
    forOfficesPage: {
      title: 'نمِّ أعمال التوظيف الخاصة بك',
      subtitle: 'شارك مع Domestic للوصول إلى آلاف العملاء في جميع أنحاء الإمارات',
      benefits: {
        title: 'لماذا الشراكة معنا',
        reach: {
          title: 'وصول موسع',
          description: 'وصول إلى آلاف العملاء الذين يبحثون بنشاط عن عمالة منزلية',
        },
        tools: {
          title: 'أدوات قوية',
          description: 'أدر قوتك العاملة بالكامل من لوحة تحكم سهلة الاستخدام',
        },
        payments: {
          title: 'دفع آمن',
          description: 'احصل على أموالك بشكل أسرع مع معالجة الدفع المتكاملة',
        },
        support: {
          title: 'دعم مخصص',
          description: 'احصل على مدير حساب مخصص لمساعدتك في تنمية أعمالك',
        },
      },
      cta: {
        title: 'مستعد للبدء؟',
        description: 'انضم إلى مئات مكاتب التوظيف التي تنمو بالفعل مع Domestic',
        button: 'سجل مكتبك',
      },
    },
    // Contact Page
    contact: {
      title: 'تواصل معنا',
      subtitle: 'هل لديك أسئلة؟ يسعدنا أن نسمع منك.',
      form: {
        name: 'اسمك',
        email: 'البريد الإلكتروني',
        subject: 'الموضوع',
        message: 'الرسالة',
        submit: 'إرسال الرسالة',
        sending: 'جارٍ الإرسال...',
        success: 'تم إرسال الرسالة بنجاح!',
        error: 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.',
      },
      info: {
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان',
        hours: 'ساعات العمل',
        hoursValue: 'الأحد - الخميس، 9 صباحاً - 6 مساءً بتوقيت الخليج',
      },
    },
    // Testimonials
    testimonials: {
      title: 'التقييمات',
      subtitle: 'قصص حقيقية',
      description: 'استمع إلى العائلات التي وجدت مساعدها المنزلي المثالي من خلال منصتنا',
      watermark: 'موثوق به',
      categories: {
        customers: 'العملاء',
        offices: 'المكاتب',
        partners: 'الشركاء',
      },
      items: [
        {
          id: '1',
          name: 'سارة المحمود',
          role: 'أم عاملة',
          company: 'دبي',
          category: 'customers',
          quote: 'كان العثور على مربية موثوقة سهلاً للغاية من خلال هذه المنصة. في غضون أسبوع، وجدنا شخصاً مثالياً لعائلتنا. عملية التحقق منحتنا راحة البال الكاملة.',
          emojis: ['👶', '💝'],
        },
        {
          id: '2',
          name: 'أحمد حسن',
          role: 'صاحب أعمال',
          company: 'أبوظبي',
          category: 'customers',
          quote: 'احتجنا إلى مدبرة منزل يمكنها إدارة منزلنا الكبير. ساعدتنا الملفات التفصيلية ومقاطع الفيديو التعريفية على اتخاذ القرار الصحيح. موصى به بشدة!',
          emojis: ['🏠', '⭐'],
        },
        {
          id: '3',
          name: 'فاطمة الراشد',
          role: 'مديرة الموارد البشرية',
          company: 'النور للتوظيف',
          category: 'offices',
          quote: 'كمكتب توظيف، غيرت هذه المنصة طريقة تواصلنا مع العائلات. توسع نطاق وصولنا بشكل كبير والعملية سلسة للغاية.',
          emojis: ['📈', '🤝'],
        },
        {
          id: '4',
          name: 'محمد السيد',
          role: 'مدير العمليات',
          company: 'حلول الخليج للتوظيف',
          category: 'offices',
          quote: 'لوحة التحكم تجعل إدارة قوتنا العاملة فعالة بشكل لا يصدق. يمكننا تتبع الطلبات وتحديث الملفات والتواصل مع العملاء في مكان واحد.',
          emojis: ['💼', '✨'],
        },
        {
          id: '5',
          name: 'ليلى خوري',
          role: 'أم جديدة',
          company: 'الشارقة',
          category: 'customers',
          quote: 'بعد ولادة طفلي، كنت مرهقة في محاولة إيجاد المساعدة. هذا التطبيق جعل من السهل مقارنة الخيارات والعثور على مربية حنونة. أصبحت جزءاً من عائلتنا.',
          emojis: ['👨‍👩‍👧', '❤️'],
        },
        {
          id: '6',
          name: 'عمر الفارسي',
          role: 'الرئيس التنفيذي',
          company: 'وكالة بريميوم كير',
          category: 'partners',
          quote: 'كانت الشراكة مع هذه المنصة نقطة تحول لوكالتنا. التكامل التقني وفريق الدعم استثنائيان.',
          emojis: ['🚀', '💎'],
        },
        {
          id: '7',
          name: 'نادية إبراهيم',
          role: 'رائدة أعمال',
          company: 'دبي مارينا',
          category: 'customers',
          quote: 'كرائدة أعمال مشغولة، احتجت إلى شخص جدير بالثقة للمساعدة في المنزل. فحوصات الخلفية والتقييمات الموثقة أعطتني الثقة في اختياري.',
          emojis: ['👩‍💼', '🌟'],
        },
        {
          id: '8',
          name: 'خالد المنصوري',
          role: 'مدير الشراكات',
          company: 'مراكز تدبير',
          category: 'partners',
          quote: 'التعاون مع هذه المنصة بسط عملياتنا. يمكننا الآن خدمة العائلات بشكل أسرع وأكثر كفاءة من أي وقت مضى.',
          emojis: ['🏢', '🤝'],
        },
      ],
    },
    // Common
    common: {
      learnMore: 'اعرف المزيد',
      getStarted: 'ابدأ الآن',
      viewAll: 'عرض الكل',
      loading: 'جارٍ التحميل...',
      error: 'حدث خطأ ما',
      retry: 'حاول مرة أخرى',
    },
  },
} as const;

// Deep readonly type for translations
type DeepString<T> = T extends string
  ? string
  : T extends object
  ? { [K in keyof T]: DeepString<T[K]> }
  : T;

export type Translations = DeepString<typeof translations.en>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

export const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
