'use client';

import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function DownloadSection() {
  const { t, locale } = useI18n();
  const isArabic = locale === 'ar';

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.download.title}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.download.subtitle}</p>

          <div className={cn(
            'flex flex-col sm:flex-row gap-4 justify-center mb-12',
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

          {/* QR Code Section - Two QR codes in a row */}
          <div className={cn(
            'inline-flex flex-row gap-8 p-6 bg-card rounded-2xl border shadow-sm',
            isArabic && 'flex-row-reverse'
          )}>
            {/* iOS QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-3 p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(process.env.NEXT_PUBLIC_IOS_APP_URL || 'https://apps.apple.com/app/tadbeer')}`}
                  alt="iOS App QR Code"
                  width={120}
                  height={120}
                  className="rounded"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AppleIcon className="h-4 w-4" />
                <span>App Store</span>
              </div>
            </div>

            {/* Android QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-3 p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(process.env.NEXT_PUBLIC_ANDROID_APP_URL || 'https://play.google.com/store/apps/details?id=com.tadbeer')}`}
                  alt="Android App QR Code"
                  width={120}
                  height={120}
                  className="rounded"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GooglePlayIcon className="h-4 w-4" />
                <span>Google Play</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{t.download.scanQr}</p>
        </div>
      </div>
    </section>
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
