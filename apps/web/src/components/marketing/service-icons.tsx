'use client';

import { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom Driver SVG icon - thin stroke to match PNG icons
function DriverIcon({ className, color = '#9ca3af' }: { className?: string; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M240 108h-13.4l-28.83-64.87a12 12 0 0 0-11-7.13H69.2a12 12 0 0 0-11 7.13L29.4 108H16a4 4 0 0 0 0 8h12v84a12 12 0 0 0 12 12h24a12 12 0 0 0 12-12v-20h104v20a12 12 0 0 0 12 12h24a12 12 0 0 0 12-12v-84h12a4 4 0 0 0 0-8M65.54 46.38A4 4 0 0 1 69.2 44h117.6a4 4 0 0 1 3.66 2.38L217.84 108H38.16ZM220 200a4 4 0 0 1-4 4h-24a4 4 0 0 1-4-4v-24a4 4 0 0 0-4-4H72a4 4 0 0 0-4 4v24a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4v-84h184Z"/>
    </svg>
  );
}

// Custom Babysitting SVG icon - thin stroke to match PNG icons
function BabysittingIcon({ className, color = '#9ca3af' }: { className?: string; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeLinecap="round" strokeWidth="1">
      <path d="M2 14.5c0-3.287 0-4.931.908-6.038a4 4 0 0 1 .554-.554C4.57 7 6.212 7 9.5 7h5c3.288 0 4.931 0 6.038.908a4 4 0 0 1 .554.554C22 9.57 22 11.212 22 14.5s0 4.931-.908 6.038a4 4 0 0 1-.554.554C19.43 22 17.788 22 14.5 22h-5c-3.287 0-4.931 0-6.038-.908a4 4 0 0 1-.554-.554C2 19.43 2 17.788 2 14.5Z"/>
      <path strokeLinejoin="round" d="M12 7V5a1 1 0 0 1 1-1a1 1 0 0 0 1-1V2"/>
      <path d="m10 16l-1.5-1.5m0 0L7 13m1.5 1.5L7 16m1.5-1.5L10 13"/>
      <path strokeLinejoin="round" d="M17 15.5v-2"/>
    </svg>
  );
}
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ServiceIcon {
  id: string;
  labelEn: string;
  labelAr: string;
  image?: string;
  icon?: React.ElementType;
}

const SERVICE_ICONS: ServiceIcon[] = [
  { id: 'clean', labelEn: 'Clean', labelAr: 'تنظيف', image: '/icons/wipe.png' },
  { id: 'nanny', labelEn: 'Nanny', labelAr: 'مربية', image: '/icons/baby-stroller.png' },
  { id: 'cook', labelEn: 'Cook', labelAr: 'طبخ', image: '/icons/chef-hat.png' },
  { id: 'driver', labelEn: 'Driver', labelAr: 'سائق', icon: DriverIcon },
  { id: 'elderly', labelEn: 'Elderly', labelAr: 'مسنين', image: '/icons/old-people.png' },
  { id: 'babysitter', labelEn: 'Babysitter', labelAr: 'جليسة', icon: BabysittingIcon },
];

interface ServiceIconsProps {
  className?: string;
  onIconClick?: (serviceId: string) => void;
  selectedIcon?: string;
}

export function ServiceIcons({ className, onIconClick, selectedIcon }: ServiceIconsProps) {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const renderIcon = (service: ServiceIcon, isSelected: boolean, size: 'sm' | 'lg') => {
    const sizeClass = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
    const imgSize = size === 'lg' ? 48 : 40;

    if (service.image) {
      return (
        <Image
          src={service.image}
          alt={service.labelEn}
          width={imgSize}
          height={imgSize}
          className={cn(
            sizeClass,
            'object-contain transition-all duration-200',
            isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
          )}
        />
      );
    }

    if (service.icon) {
      const Icon = service.icon;
      return (
        <Icon
          className={cn(sizeClass, 'transition-all duration-200')}
          color={isSelected ? '#de3151' : '#9ca3af'}
        />
      );
    }

    return null;
  };

  return (
    <section className={cn('py-4 bg-background border-b', className)}>
      <div className="w-full px-4 md:px-8">
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-around py-4 max-w-6xl mx-auto">
            {SERVICE_ICONS.map((service) => {
              const isSelected = selectedIcon === service.id;

              return (
                <button
                  key={service.id}
                  onClick={() => onIconClick?.(service.id)}
                  className="flex flex-col items-center cursor-pointer group transition-all duration-200 px-6 py-3"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-16 h-16 rounded-lg transition-all duration-200'
                    )}
                  >
                    {renderIcon(service, isSelected, 'lg')}
                  </div>

                  {/* Label */}
                  <div className="mt-1 text-center">
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors duration-200',
                        isSelected ? 'text-[#de3151]' : 'text-gray-600 group-hover:text-gray-900'
                      )}
                    >
                      {isArabic ? service.labelAr : service.labelEn}
                    </span>
                  </div>

                  {/* Underline */}
                  <div
                    className={cn(
                      'mt-2 h-0.5 bg-[#de3151] transition-all duration-200 w-full',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Mobile Layout with Horizontal Scroll */}
          <div className="md:hidden relative">
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow-md border',
                  isArabic ? 'right-0' : 'left-0'
                )}
                onClick={() => scroll(isArabic ? 'right' : 'left')}
              >
                {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              onScroll={updateScrollButtons}
              className={cn(
                'flex gap-2 overflow-x-auto scrollbar-hide px-2 py-2',
                isArabic && 'flex-row-reverse'
              )}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {SERVICE_ICONS.map((service) => {
                const isSelected = selectedIcon === service.id;

                return (
                  <button
                    key={service.id}
                    onClick={() => onIconClick?.(service.id)}
                    className={cn(
                      'flex-shrink-0 flex flex-col items-center cursor-pointer group transition-all duration-200 px-5 py-3 rounded-xl',
                      isSelected
                        ? 'bg-[#de3151]/10 border border-[#de3151]'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-14 h-14 rounded-lg transition-all duration-200'
                      )}
                    >
                      {renderIcon(service, isSelected, 'sm')}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        'text-sm font-medium whitespace-nowrap transition-colors duration-200 mt-1',
                        isSelected ? 'text-[#de3151]' : 'text-gray-600'
                      )}
                    >
                      {isArabic ? service.labelAr : service.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow-md border',
                  isArabic ? 'left-0' : 'right-0'
                )}
                onClick={() => scroll(isArabic ? 'left' : 'right')}
              >
                {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
