'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface Maid {
  id: string;
  name: string;
  nameAr: string | null;
  photoUrl: string | null;
  experienceYears: number;
  salary: string;
  nationality: { id: string; nameEn: string; nameAr: string } | null;
  jobType?: string;
  createdAt: string;
}

// Job type labels for display (matches db schema job_type enum)
const JOB_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  domestic_worker: { en: 'Housemaid', ar: 'خادمة' },
  nurse_caregiver: { en: 'Nurse/Caregiver', ar: 'ممرضة/مقدمة رعاية' },
  driver: { en: 'Driver', ar: 'سائق' },
};

// Gradient colors for placeholders
const GRADIENT_COLORS = [
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-indigo-400 to-blue-500',
  'from-fuchsia-400 to-pink-500',
  'from-green-400 to-emerald-500',
];

function MaidPreviewCard({ maid, index }: { maid: Maid; index: number }) {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';
  const gradientClass = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

  const displayName = isArabic && maid.nameAr ? maid.nameAr : maid.name;
  const nationality = maid.nationality
    ? isArabic
      ? maid.nationality.nameAr
      : maid.nationality.nameEn
    : '';

  const label = maid.jobType ? JOB_TYPE_LABELS[maid.jobType] : null;
  const skillName = label
    ? (isArabic ? label.ar : label.en)
    : (isArabic ? 'خادمة' : 'Housemaid');

  return (
    <div className="group cursor-pointer">
      {/* Image/Placeholder */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
        {maid.photoUrl ? (
          <img
            src={maid.photoUrl}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full bg-gradient-to-br flex items-center justify-center',
              gradientClass
            )}
          >
            <span className="text-white text-4xl font-bold opacity-50">
              {displayName.charAt(0)}
            </span>
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute top-2 end-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
          <span className="text-xs font-medium text-gray-900">4.9</span>
        </div>
      </div>

      {/* Info */}
      <div className={cn(isArabic && 'text-end')}>
        <h3 className="font-semibold text-foreground truncate">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{skillName}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={cn('text-sm text-muted-foreground', isArabic && 'order-2')}>
            {nationality}
          </span>
          <span className="text-sm font-medium text-foreground">
            {maid.experienceYears} {isArabic ? 'سنوات' : 'yrs'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-xl bg-gray-200 mb-3" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

interface PopularMaidsProps {
  className?: string;
}

export function PopularMaids({ className }: PopularMaidsProps) {
  const { locale, t } = useI18n();
  const isArabic = locale === 'ar';
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaids() {
      try {
        const response = await fetch(`${API_URL}/maids?limit=8&status=available`);
        const data = await response.json();
        if (data.success && data.data?.items) {
          setMaids(data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch popular maids:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaids();
  }, []);

  return (
    <section className={cn('py-16 bg-background', className)}>
      <div className="container">
        {/* Section Header */}
        <Link
          href="/maids"
          className={cn(
            'text-xl md:text-2xl font-semibold text-foreground mb-8 flex items-center gap-2 hover:text-primary transition-colors w-fit',
            isArabic && 'flex-row-reverse'
          )}
        >
          {isArabic ? 'خادمات شائعات في دبي' : 'Popular Maids in Dubai'}
          <ChevronRight className={cn('w-5 h-5', isArabic && 'rotate-180')} />
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : maids.length > 0 ? (
            maids.slice(0, 8).map((maid, index) => (
              <MaidPreviewCard key={maid.id} maid={maid} index={index} />
            ))
          ) : (
            // Fallback with placeholder cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                  <div
                    className={cn(
                      'w-full h-full bg-gradient-to-br flex items-center justify-center',
                      GRADIENT_COLORS[index]
                    )}
                  >
                    <span className="text-white text-4xl font-bold opacity-50">?</span>
                  </div>
                </div>
                <div className={cn(isArabic && 'text-end')}>
                  <h3 className="font-semibold text-foreground">
                    {isArabic ? 'جارٍ التحميل...' : 'Coming Soon'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'خادمة' : 'Housemaid'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Link */}
        {maids.length > 0 && (
          <div className={cn('mt-8', isArabic ? 'text-start' : 'text-end')}>
            <Link
              href="/maids"
              className="text-sm text-primary hover:underline"
            >
              {t.common.viewAll} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
