'use client';

import { Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type ActiveButton = 'service' | 'location' | 'budget' | null;

const SERVICE_TYPES = [
  { id: 'housemaid', en: 'Housemaid', ar: 'خادمة منزلية' },
  { id: 'nanny', en: 'Nanny', ar: 'مربية أطفال' },
  { id: 'cook', en: 'Cook', ar: 'طباخة' },
  { id: 'driver', en: 'Driver', ar: 'سائق' },
  { id: 'elderly-care', en: 'Elderly Care', ar: 'رعاية كبار السن' },
  { id: 'babysitter', en: 'Babysitter', ar: 'جليسة أطفال' },
];

const LOCATIONS = [
  { id: 'dubai', en: 'Dubai', ar: 'دبي' },
  { id: 'abu-dhabi', en: 'Abu Dhabi', ar: 'أبو ظبي' },
  { id: 'sharjah', en: 'Sharjah', ar: 'الشارقة' },
  { id: 'ajman', en: 'Ajman', ar: 'عجمان' },
  { id: 'rak', en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  { id: 'fujairah', en: 'Fujairah', ar: 'الفجيرة' },
  { id: 'uaq', en: 'Umm Al Quwain', ar: 'أم القيوين' },
];

const BUDGET_RANGES = [
  { id: 'under-2000', en: 'Under 2,000 AED', ar: 'أقل من 2,000 درهم' },
  { id: '2000-3000', en: '2,000 - 3,000 AED', ar: '2,000 - 3,000 درهم' },
  { id: '3000-4000', en: '3,000 - 4,000 AED', ar: '3,000 - 4,000 درهم' },
  { id: 'over-4000', en: '4,000+ AED', ar: '4,000+ درهم' },
];

interface BigSearchProps {
  className?: string;
  onSearch?: (params: { service?: string; location?: string; budget?: string }) => void;
}

export function BigSearch({ className, onSearch }: BigSearchProps) {
  const { locale, t } = useI18n();
  const isArabic = locale === 'ar';

  const [activeButton, setActiveButton] = useState<ActiveButton>(null);
  const [hoveredButton, setHoveredButton] = useState<ActiveButton>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const handleButtonClick = (button: ActiveButton) => {
    setActiveButton(activeButton === button ? null : button);
  };

  // Click outside to reset
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveButton(null);
        setHoveredButton(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isLineHidden = (position: 'service-location' | 'location-budget') => {
    switch (position) {
      case 'service-location':
        return (
          hoveredButton === 'service' ||
          hoveredButton === 'location' ||
          activeButton === 'service' ||
          activeButton === 'location'
        );
      case 'location-budget':
        return (
          hoveredButton === 'location' ||
          hoveredButton === 'budget' ||
          activeButton === 'location' ||
          activeButton === 'budget'
        );
      default:
        return false;
    }
  };

  const getButtonStyling = (button: ActiveButton) => {
    const isActive = activeButton === button;
    const isHovered = hoveredButton === button;
    const hasActiveButton = activeButton !== null;

    let bgClass = 'bg-transparent';
    if (isActive) {
      bgClass = 'bg-white/30 backdrop-blur-md shadow-lg';
    } else if (hasActiveButton) {
      bgClass = 'bg-white/10 backdrop-blur-sm';
      if (isHovered) {
        bgClass = 'bg-white/20 backdrop-blur-md';
      }
    } else if (isHovered) {
      bgClass = 'bg-white/20 backdrop-blur-md';
    } else {
      bgClass = 'bg-transparent hover:bg-white/20 hover:backdrop-blur-md';
    }

    return `${bgClass} rounded-full transition-all duration-200`;
  };

  const getDisplayText = (
    selected: string | null,
    items: { id: string; en: string; ar: string }[],
    placeholder: string
  ) => {
    if (!selected) return placeholder;
    const item = items.find((i) => i.id === selected);
    return item ? (isArabic ? item.ar : item.en) : placeholder;
  };

  const handleSearch = () => {
    onSearch?.({
      service: selectedService || undefined,
      location: selectedLocation || undefined,
      budget: selectedBudget || undefined,
    });
  };

  return (
    <div className={cn('relative w-full max-w-4xl mx-auto', className)} ref={searchBarRef}>
      {/* Desktop Layout */}
      <div
        className={cn(
          'hidden md:flex items-center rounded-full shadow-sm transition-colors liquid-glass',
          activeButton ? 'bg-[#e5e7eb]/80' : 'bg-white/20'
        )}
      >
        {/* Service Type Button */}
        <div className="relative flex-[1.5]">
          <button
            className={cn('w-full px-6 py-3', getButtonStyling('service'))}
            onMouseEnter={() => setHoveredButton('service')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick('service')}
          >
            <div className={cn('text-start', isArabic && 'text-end')}>
              <div className="text-sm font-semibold text-white mb-1">
                {isArabic ? 'نوع الخدمة' : 'Service Type'}
              </div>
              <div className="text-sm text-white/70 flex items-center gap-1">
                {getDisplayText(selectedService, SERVICE_TYPES, isArabic ? 'اختر نوع الخدمة' : 'Select service')}
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </button>

          {/* Service Dropdown */}
          {activeButton === 'service' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-2 z-50">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.id);
                    setActiveButton(null);
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-black hover:bg-white/20 transition-colors',
                    isArabic ? 'text-end' : 'text-start',
                    selectedService === service.id && 'bg-white/30 font-semibold'
                  )}
                >
                  {isArabic ? service.ar : service.en}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider 1 */}
        <div
          className={cn(
            'w-px h-8 bg-white/30 transition-opacity duration-200',
            isLineHidden('service-location') ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Location Button */}
        <div className="relative flex-[1.5]">
          <button
            className={cn('w-full px-6 py-3', getButtonStyling('location'))}
            onMouseEnter={() => setHoveredButton('location')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick('location')}
          >
            <div className={cn('text-start', isArabic && 'text-end')}>
              <div className="text-sm font-semibold text-white mb-1">
                {isArabic ? 'الموقع' : 'Location'}
              </div>
              <div className="text-sm text-white/70 flex items-center gap-1">
                {getDisplayText(selectedLocation, LOCATIONS, isArabic ? 'اختر الموقع' : 'Select location')}
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </button>

          {/* Location Dropdown */}
          {activeButton === 'location' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-2 z-50">
              {LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedLocation(location.id);
                    setActiveButton(null);
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-black hover:bg-white/20 transition-colors',
                    isArabic ? 'text-end' : 'text-start',
                    selectedLocation === location.id && 'bg-white/30 font-semibold'
                  )}
                >
                  {isArabic ? location.ar : location.en}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider 2 */}
        <div
          className={cn(
            'w-px h-8 bg-white/30 transition-opacity duration-200',
            isLineHidden('location-budget') ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Budget + Search Button Container */}
        <div className="relative flex-[2]">
          <div
            className={cn('flex items-center', getButtonStyling('budget'))}
            onMouseEnter={() => setHoveredButton('budget')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {/* Budget Button */}
            <div
              className={cn('flex-1 px-6 py-3', isArabic ? 'text-end' : 'text-start')}
              onClick={() => handleButtonClick('budget')}
            >
              <div className="text-sm font-semibold text-white mb-1">
                {isArabic ? 'الميزانية' : 'Budget'}
              </div>
              <div className="text-sm text-white/70 flex items-center gap-1">
                {getDisplayText(selectedBudget, BUDGET_RANGES, isArabic ? 'اختر الميزانية' : 'Select budget')}
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {/* Search Button */}
            <div className={cn(isArabic ? 'pl-2' : 'pr-2')}>
              <Button
                onClick={handleSearch}
                size="icon"
                className={cn(
                  'rounded-full bg-[#de3151] hover:bg-[#de3151]/90 text-white transition-all duration-300',
                  activeButton ? 'w-28 h-14 px-4' : 'w-12 h-12'
                )}
              >
                <Search className="w-4 h-4" />
                {activeButton && (
                  <span className={cn('text-sm font-medium', isArabic ? 'mr-2' : 'ml-2')}>
                    {isArabic ? 'بحث' : 'Search'}
                  </span>
                )}
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </div>

          {/* Budget Dropdown */}
          {activeButton === 'budget' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-2 z-50">
              {BUDGET_RANGES.map((budget) => (
                <button
                  key={budget.id}
                  onClick={() => {
                    setSelectedBudget(budget.id);
                    setActiveButton(null);
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-black hover:bg-white/20 transition-colors',
                    isArabic ? 'text-end' : 'text-start',
                    selectedBudget === budget.id && 'bg-white/30 font-semibold'
                  )}
                >
                  {isArabic ? budget.ar : budget.en}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden bg-white rounded-2xl shadow-lg border border-[#e5e7eb] p-4 space-y-3">
        {/* Service Type */}
        <button
          onClick={() => handleButtonClick(activeButton === 'service' ? null : 'service')}
          className="w-full p-3 rounded-xl border border-[#e5e7eb] hover:border-[#de3151] transition-colors"
        >
          <div className={cn('flex justify-between items-center', isArabic && 'flex-row-reverse')}>
            <div className={cn(isArabic ? 'text-end' : 'text-start')}>
              <div className="text-xs text-[#6b7280]">{isArabic ? 'نوع الخدمة' : 'Service Type'}</div>
              <div className="text-sm font-medium">
                {getDisplayText(selectedService, SERVICE_TYPES, isArabic ? 'اختر نوع الخدمة' : 'Select service')}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6b7280]" />
          </div>
        </button>

        {/* Location */}
        <button
          onClick={() => handleButtonClick(activeButton === 'location' ? null : 'location')}
          className="w-full p-3 rounded-xl border border-[#e5e7eb] hover:border-[#de3151] transition-colors"
        >
          <div className={cn('flex justify-between items-center', isArabic && 'flex-row-reverse')}>
            <div className={cn(isArabic ? 'text-end' : 'text-start')}>
              <div className="text-xs text-[#6b7280]">{isArabic ? 'الموقع' : 'Location'}</div>
              <div className="text-sm font-medium">
                {getDisplayText(selectedLocation, LOCATIONS, isArabic ? 'اختر الموقع' : 'Select location')}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6b7280]" />
          </div>
        </button>

        {/* Budget */}
        <button
          onClick={() => handleButtonClick(activeButton === 'budget' ? null : 'budget')}
          className="w-full p-3 rounded-xl border border-[#e5e7eb] hover:border-[#de3151] transition-colors"
        >
          <div className={cn('flex justify-between items-center', isArabic && 'flex-row-reverse')}>
            <div className={cn(isArabic ? 'text-end' : 'text-start')}>
              <div className="text-xs text-[#6b7280]">{isArabic ? 'الميزانية' : 'Budget'}</div>
              <div className="text-sm font-medium">
                {getDisplayText(selectedBudget, BUDGET_RANGES, isArabic ? 'اختر الميزانية' : 'Select budget')}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6b7280]" />
          </div>
        </button>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-full bg-[#de3151] hover:bg-[#de3151]/90 text-white rounded-xl h-12"
        >
          <Search className="w-4 h-4" />
          <span className={cn(isArabic ? 'mr-2' : 'ml-2')}>{isArabic ? 'بحث' : 'Search'}</span>
        </Button>
      </div>

      {/* Mobile Dropdown Menus */}
      {activeButton === 'service' && (
        <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50">
          {SERVICE_TYPES.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                setSelectedService(service.id);
                setActiveButton(null);
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-black hover:bg-gray-100 transition-colors',
                isArabic ? 'text-end' : 'text-start',
                selectedService === service.id && 'bg-gray-100 font-semibold'
              )}
            >
              {isArabic ? service.ar : service.en}
            </button>
          ))}
        </div>
      )}

      {activeButton === 'location' && (
        <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50">
          {LOCATIONS.map((location) => (
            <button
              key={location.id}
              onClick={() => {
                setSelectedLocation(location.id);
                setActiveButton(null);
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-black hover:bg-gray-100 transition-colors',
                isArabic ? 'text-end' : 'text-start',
                selectedLocation === location.id && 'bg-gray-100 font-semibold'
              )}
            >
              {isArabic ? location.ar : location.en}
            </button>
          ))}
        </div>
      )}

      {activeButton === 'budget' && (
        <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50">
          {BUDGET_RANGES.map((budget) => (
            <button
              key={budget.id}
              onClick={() => {
                setSelectedBudget(budget.id);
                setActiveButton(null);
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-black hover:bg-gray-100 transition-colors',
                isArabic ? 'text-end' : 'text-start',
                selectedBudget === budget.id && 'bg-gray-100 font-semibold'
              )}
            >
              {isArabic ? budget.ar : budget.en}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
