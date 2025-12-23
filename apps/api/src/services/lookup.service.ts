import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { nationalities, languages } from '../db/schema';

export class LookupService {
  constructor(private db: Database) {}

  async getAllNationalities() {
    return this.db.select().from(nationalities).orderBy(nationalities.nameEn);
  }

  async getAllLanguages() {
    return this.db.select().from(languages).orderBy(languages.nameEn);
  }

  async seedDefaults() {
    // Check if already seeded
    const existing = await this.db.select().from(nationalities).limit(1);
    if (existing.length > 0) return;

    // Seed nationalities
    await this.db.insert(nationalities).values([
      { code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين' },
      { code: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا' },
      { code: 'ET', nameEn: 'Ethiopia', nameAr: 'إثيوبيا' },
      { code: 'IN', nameEn: 'India', nameAr: 'الهند' },
      { code: 'LK', nameEn: 'Sri Lanka', nameAr: 'سريلانكا' },
      { code: 'NP', nameEn: 'Nepal', nameAr: 'نيبال' },
      { code: 'BD', nameEn: 'Bangladesh', nameAr: 'بنغلاديش' },
      { code: 'KE', nameEn: 'Kenya', nameAr: 'كينيا' },
      { code: 'UG', nameEn: 'Uganda', nameAr: 'أوغندا' },
      { code: 'GH', nameEn: 'Ghana', nameAr: 'غانا' },
    ]);

    // Seed languages
    await this.db.insert(languages).values([
      { code: 'ar', nameEn: 'Arabic', nameAr: 'العربية' },
      { code: 'en', nameEn: 'English', nameAr: 'الإنجليزية' },
      { code: 'tl', nameEn: 'Tagalog', nameAr: 'التغالوغية' },
      { code: 'id', nameEn: 'Indonesian', nameAr: 'الإندونيسية' },
      { code: 'hi', nameEn: 'Hindi', nameAr: 'الهندية' },
      { code: 'ur', nameEn: 'Urdu', nameAr: 'الأردية' },
      { code: 'bn', nameEn: 'Bengali', nameAr: 'البنغالية' },
      { code: 'ne', nameEn: 'Nepali', nameAr: 'النيبالية' },
      { code: 'am', nameEn: 'Amharic', nameAr: 'الأمهرية' },
      { code: 'sw', nameEn: 'Swahili', nameAr: 'السواحيلية' },
    ]);
  }
}
