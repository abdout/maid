'use client';

import { useI18n } from '@/lib/i18n';

export function StatsSection() {
  const { t } = useI18n();

  const stats = [
    { value: '5,000+', label: t.stats.maids },
    { value: '200+', label: t.stats.offices },
    { value: '25+', label: t.stats.nationalities },
    { value: '98%', label: t.stats.satisfaction },
  ];

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
