'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HostingCtaProps {
  className?: string;
}

export function HostingCta({ className }: HostingCtaProps) {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';

  return (
    <section className={cn('py-16 bg-background', className)}>
      <div className="container">
        <div className="relative w-full h-96 overflow-hidden rounded-2xl">
          {/* Background Image */}
          <Image
            src="/help.jpg"
            alt=""
            fill
            className="object-cover object-[center_30%]"
            priority
          />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className={cn(
            'relative z-10 flex flex-col justify-center h-full px-8 sm:px-12 lg:px-16',
            isArabic && 'items-end text-end'
          )}>
            <div className="max-w-md">
              <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-8">
                {isArabic ? (
                  <>
                    أسئلة
                    <br />
                    حول
                    <br />
                    التوظيف؟
                  </>
                ) : (
                  <>
                    Questions
                    <br />
                    about
                    <br />
                    recruiting?
                  </>
                )}
              </h2>

              <Button
                asChild
                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-lg font-semibold transition-colors duration-200"
                size="lg"
              >
                <Link href="/for-offices">
                  {isArabic ? 'تحدث مع خبير' : 'Talk to an Expert'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
