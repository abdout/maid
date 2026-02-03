'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { t, locale } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isArabic = locale === 'ar';

  // Handle scroll for liquid glass effect - activates after passing video
  // Mobile: full screen (100vh), Desktop: half screen (50vh)
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const videoHeight = isMobile ? window.innerHeight : window.innerHeight * 0.5;
      setIsScrolled(window.scrollY > videoHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const navLinks = [
    { href: '/about', label: t.nav.about },
    { href: '/features', label: t.nav.features },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/login', label: t.nav.platform },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b border-white/10 bg-white/10 backdrop-blur-xl'
          : 'bg-transparent border-transparent'
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Desktop Navigation (left-aligned) */}
          <div className={cn('flex items-center gap-8', isArabic && 'flex-row-reverse')}>
            <Link href="/" className="flex items-center gap-2">
              <span className={cn(
                'text-2xl font-bold transition-colors duration-300',
                isScrolled ? 'text-[#de3151]' : 'text-white'
              )}>
                Tadbeer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className={cn('hidden md:flex items-center gap-6', isArabic && 'flex-row-reverse')}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/80 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions - Language switcher only */}
          <div className="hidden md:flex items-center">
            <LanguageSwitcher variant={isScrolled ? 'default' : 'transparent'} />
          </div>

          {/* Mobile: Language + Menu Button */}
          <div className={cn('md:hidden flex items-center gap-2', isArabic && 'flex-row-reverse')}>
            <LanguageSwitcher variant={isScrolled ? 'default' : 'transparent'} />
            <button
              className={cn('p-2 transition-colors', isScrolled ? 'text-black' : 'text-white')}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={cn(
            'md:hidden py-4 border-t',
            isScrolled
              ? 'border-gray-200 bg-white/80 backdrop-blur-xl'
              : 'border-white/10 bg-white/10 backdrop-blur-xl'
          )}>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors px-2 py-2 rounded-lg',
                    isScrolled
                      ? 'text-gray-600 hover:text-black hover:bg-gray-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
