'use client';

import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FeaturedCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  image: string;
  backgroundColor: string;
}

const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: 'cleaning',
    titleEn: 'Cleaning',
    titleAr: 'تنظيف',
    subtitleEn: 'Professional housekeeping',
    subtitleAr: 'تنظيف منزلي احترافي',
    image: '/cleaning.jpg',
    backgroundColor: '#CC2D4A',
  },
  {
    id: 'cooking',
    titleEn: 'Cooking',
    titleAr: 'طبخ',
    subtitleEn: 'Culinary experts',
    subtitleAr: 'خبراء في الطهي',
    image: '/cooking.jpg',
    backgroundColor: '#BC1A6E',
  },
  {
    id: 'babysitter',
    titleEn: 'Babysitter',
    titleAr: 'مربية',
    subtitleEn: 'Childcare specialists',
    subtitleAr: 'متخصصات برعاية الأطفال',
    image: '/babysitting.jpg',
    backgroundColor: '#DE3151',
  },
  {
    id: 'elderly',
    titleEn: 'Elderly Care',
    titleAr: 'رعاية المسنين',
    subtitleEn: 'Compassionate care',
    subtitleAr: 'رعاية حانية',
    image: '/eldery.jpg',
    backgroundColor: '#D93B30',
  },
];

interface InspirationSectionProps {
  className?: string;
}

export function InspirationSection({ className }: InspirationSectionProps) {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';

  return (
    <section className={cn('py-16 bg-background', className)}>
      <div className="container">
        {/* Section Title */}
        <h2 className={cn(
          'text-2xl md:text-3xl font-semibold text-foreground mb-8',
          isArabic && 'text-end'
        )}>
          {isArabic ? 'الفئات المميزة' : 'Featured Categories'}
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="cursor-pointer rounded-sm overflow-hidden flex flex-col h-80 group transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Image Section - Golden ratio (1.618 portion) */}
              <div className="relative flex-[1.618] overflow-hidden">
                <Image
                  src={category.image}
                  alt={isArabic ? category.titleAr : category.titleEn}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-300 group-hover:scale-105',
                    category.id === 'elderly' && 'object-[center_70%]'
                  )}
                />
              </div>

              {/* Info Section with Custom Color - Golden ratio (1 portion) */}
              <div
                className="flex-1 p-5 text-white flex flex-col justify-start"
                style={{ backgroundColor: category.backgroundColor }}
              >
                <h3 className={cn(
                  'text-lg font-semibold mb-1',
                  isArabic && 'text-end'
                )}>
                  {isArabic ? category.titleAr : category.titleEn}
                </h3>
                <p className={cn(
                  'text-sm opacity-90',
                  isArabic && 'text-end'
                )}>
                  {isArabic ? category.subtitleAr : category.subtitleEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
