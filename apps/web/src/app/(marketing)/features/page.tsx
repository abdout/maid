'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShieldCheck,
  FileText,
  CreditCard,
  Languages,
  HeadphonesIcon,
  Bell,
  Filter,
  Star,
  MapPin,
  Clock,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const { t } = useI18n();

  const mainFeatures = [
    {
      icon: Search,
      title: t.features.search.title,
      description: t.features.search.description,
    },
    {
      icon: ShieldCheck,
      title: t.features.verified.title,
      description: t.features.verified.description,
    },
    {
      icon: FileText,
      title: t.features.quotations.title,
      description: t.features.quotations.description,
    },
    {
      icon: CreditCard,
      title: t.features.payments.title,
      description: t.features.payments.description,
    },
    {
      icon: Languages,
      title: t.features.bilingual.title,
      description: t.features.bilingual.description,
    },
    {
      icon: HeadphonesIcon,
      title: t.features.support.title,
      description: t.features.support.description,
    },
  ];

  const additionalFeatures = [
    {
      icon: Filter,
      title: 'Advanced Filters',
      description: 'Filter by nationality, age, experience, skills, salary range, and more',
    },
    {
      icon: Star,
      title: 'Favorites List',
      description: 'Save profiles to your favorites for easy comparison later',
    },
    {
      icon: MapPin,
      title: 'Location-Based',
      description: 'Find recruitment offices and workers near your location',
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get notified when new workers matching your criteria are available',
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Stay updated with quotation responses and important updates',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Designed for the best mobile experience on iOS and Android',
    },
  ];

  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.features.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            And Much More...
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find your perfect helper?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Download the app now and start browsing thousands of verified domestic workers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={process.env.NEXT_PUBLIC_IOS_APP_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">{t.hero.downloadNow}</Button>
            </a>
            <Link href="/for-offices">
              <Button size="lg" variant="outline">
                {t.hero.forOffices}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
