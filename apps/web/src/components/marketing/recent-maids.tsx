'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
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
  'from-cyan-400 to-blue-500',
  'from-green-400 to-teal-500',
  'from-purple-400 to-indigo-500',
  'from-orange-400 to-red-500',
];

function formatTimeAgo(dateString: string, isArabic: boolean): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return isArabic ? 'اليوم' : 'Today';
  } else if (diffDays === 1) {
    return isArabic ? 'أمس' : 'Yesterday';
  } else if (diffDays < 7) {
    return isArabic ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return isArabic ? `منذ ${weeks} أسابيع` : `${weeks} weeks ago`;
  }
  return isArabic ? 'منذ فترة' : 'A while ago';
}

function RecentMaidCard({ maid, index }: { maid: Maid; index: number }) {
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
        {/* New badge */}
        <div className="absolute top-2 start-2 bg-green-500 text-white px-2 py-1 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-medium">
            {isArabic ? 'جديد' : 'New'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className={cn(isArabic && 'text-end')}>
        <h3 className="font-semibold text-foreground truncate">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{skillName} • {nationality}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(maid.createdAt, isArabic)}</span>
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

interface RecentMaidsProps {
  className?: string;
}

export function RecentMaids({ className }: RecentMaidsProps) {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaids() {
      try {
        // Sort by createdAt descending to get most recent
        const response = await fetch(`${API_URL}/maids?limit=4&status=available&sort=createdAt&order=desc`);
        const data = await response.json();
        if (data.success && data.data?.items) {
          setMaids(data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch recent maids:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaids();
  }, []);

  return (
    <section className={cn('py-16 bg-muted/30', className)}>
      <div className="container">
        {/* Section Header */}
        <Link
          href="/maids?sort=newest"
          className={cn(
            'text-xl md:text-2xl font-semibold text-foreground mb-8 flex items-center gap-2 hover:text-primary transition-colors w-fit',
            isArabic && 'flex-row-reverse'
          )}
        >
          {isArabic ? 'أضيفت مؤخراً' : 'Recently Added'}
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
            maids.map((maid, index) => (
              <RecentMaidCard key={maid.id} maid={maid} index={index} />
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
                    {isArabic ? 'قريباً' : 'Coming Soon'}
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
              href="/maids?sort=newest"
              className="text-sm text-primary hover:underline"
            >
              {isArabic ? 'عرض كل الملفات الجديدة' : 'View all new profiles'} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
