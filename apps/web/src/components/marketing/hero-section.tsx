'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { BigSearch } from './big-search';
import { ServiceIcons } from './service-icons';

export function HeroSection() {
  const { locale } = useI18n();
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const isArabic = locale === 'ar';

  const handleSearch = (params: { service?: string; location?: string; budget?: string }) => {
    // Build URL and navigate to search results
    const searchParams = new URLSearchParams();
    if (params.service) searchParams.set('service', params.service);
    if (params.location) searchParams.set('location', params.location);
    if (params.budget) searchParams.set('budget', params.budget);

    // For now, just log - later can navigate to mobile app or search page
    console.log('Search params:', params);
  };

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Video Background - full screen on mobile, half screen on desktop */}
      <div className="absolute inset-x-0 top-0 h-screen md:h-[50vh] z-0 overflow-hidden bg-[#1a1a2e]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content overlay - on top of video */}
      <div className="relative z-20 h-screen md:h-[50vh] container flex flex-col justify-between pt-32 pb-0">
        {/* Hero Text */}
        <div className="text-center max-w-3xl mx-auto mt-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            <span className="block">{isArabic ? 'التطبيق' : 'The App'}</span>
            <span className="block">{isArabic ? 'الذي تحبه العائلات' : 'Families Love'}</span>
          </h1>
        </div>

        {/* BigSearch Component - at very bottom of video */}
        <div className="mb-4">
          <BigSearch onSearch={handleSearch} />
        </div>
      </div>

      {/* Service Icons - right below video */}
      <div className="relative z-10 bg-background">
        <ServiceIcons
          selectedIcon={selectedService}
          onIconClick={(id) => setSelectedService(id === selectedService ? undefined : id)}
        />
      </div>
    </section>
  );
}
