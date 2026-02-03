'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';
import { cn } from '@/lib/utils';

export function Footer() {
  const { t, locale } = useI18n();
  const isArabic = locale === 'ar';

  const footerLinks = {
    company: [
      { href: '/about', label: t.footer.about },
      { href: '/careers', label: t.footer.careers },
      { href: '/press', label: t.footer.press },
    ],
    legal: [
      { href: '/privacy', label: t.footer.privacy },
      { href: '/terms', label: t.footer.terms },
    ],
    support: [
      { href: '/help', label: t.footer.helpCenter },
      { href: '/contact', label: t.footer.contactUs },
      { href: '/faq', label: t.footer.faq },
    ],
  };

  const socialLinks = [
    { href: 'https://twitter.com/maiduae', label: 'Twitter', icon: TwitterIcon },
    { href: 'https://instagram.com/maiduae', label: 'Instagram', icon: InstagramIcon },
    { href: 'https://facebook.com/maiduae', label: 'Facebook', icon: FacebookIcon },
    { href: 'https://linkedin.com/company/maiduae', label: 'LinkedIn', icon: LinkedInIcon },
  ];

  return (
    <footer className="border-t bg-muted/30">
      {/* Download Section */}
      <div className="container py-12 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{t.download.title}</h2>
          <p className="text-muted-foreground mb-6">{t.download.subtitle}</p>

          <div className={cn(
            'flex flex-col sm:flex-row gap-4 justify-center',
            isArabic && 'sm:flex-row-reverse'
          )}>
            {/* App Store Button */}
            <a
              href={process.env.NEXT_PUBLIC_IOS_APP_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 h-14 px-6 bg-black text-white rounded-xl hover:bg-black/90 transition-colors"
            >
              <AppleIcon className="h-8 w-8" />
              <div className={cn('text-start', isArabic && 'text-end')}>
                <div className="text-[10px] opacity-80">
                  {isArabic ? 'حمّل من' : 'Download on the'}
                </div>
                <div className="text-lg font-semibold leading-tight">App Store</div>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href={process.env.NEXT_PUBLIC_ANDROID_APP_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 h-14 px-6 bg-black text-white rounded-xl hover:bg-black/90 transition-colors"
            >
              <GooglePlayIcon className="h-7 w-7" />
              <div className={cn('text-start', isArabic && 'text-end')}>
                <div className="text-[10px] opacity-80">
                  {isArabic ? 'احصل عليه من' : 'GET IT ON'}
                </div>
                <div className="text-lg font-semibold leading-tight">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-[#de3151]">Tadbeer</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t.hero.subtitle.slice(0, 80)}...
            </p>
            <LanguageSwitcher />
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.support}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.followUs}</h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

// Simple social icons
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Apple Icon (Official App Store style)
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// Google Play Icon (Official style with colors)
function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z" />
      <path fill="#34A853" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z" />
      <path fill="#FBBC04" d="M12.504 12.022l3.086-3.068L3.786.453A1.48 1.48 0 0 0 2.65.2l9.854 11.822z" />
      <path fill="#EA4335" d="M12.504 12.022l-9.854 9.797a1.48 1.48 0 0 0 1.136-.253l11.804-6.681-3.086-2.863z" />
    </svg>
  );
}
