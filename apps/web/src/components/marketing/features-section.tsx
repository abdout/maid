'use client';

import { useI18n } from '@/lib/i18n';

export function FeaturesSection() {
  const { t } = useI18n();

  const stats = [
    { value: '5,000+', label: t.stats.maids },
    { value: '200+', label: t.stats.offices },
    { value: '15+', label: t.stats.nationalities },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Trust Badge */}
        <p className="text-center text-sm text-muted-foreground mb-10">
          {t.hero.trustedBy}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-24">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
