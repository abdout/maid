'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  CreditCard,
  HeadphonesIcon,
  Building2,
  TrendingUp,
  Shield,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

export default function ForOfficesPage() {
  const { t } = useI18n();

  const benefits = [
    {
      icon: Users,
      title: t.forOfficesPage.benefits.reach.title,
      description: t.forOfficesPage.benefits.reach.description,
    },
    {
      icon: BarChart3,
      title: t.forOfficesPage.benefits.tools.title,
      description: t.forOfficesPage.benefits.tools.description,
    },
    {
      icon: CreditCard,
      title: t.forOfficesPage.benefits.payments.title,
      description: t.forOfficesPage.benefits.payments.description,
    },
    {
      icon: HeadphonesIcon,
      title: t.forOfficesPage.benefits.support.title,
      description: t.forOfficesPage.benefits.support.description,
    },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Office Dashboard',
      description: 'Manage all your maid profiles, quotations, and customer interactions from one place',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track your performance with detailed analytics on views, inquiries, and conversions',
    },
    {
      icon: Shield,
      title: 'Verified Badge',
      description: 'Get a verified badge to build trust with customers and stand out from competitors',
    },
    {
      icon: Globe,
      title: 'Wider Reach',
      description: 'Reach customers across all Emirates through our growing platform',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Monthly Active Users' },
    { value: '500+', label: 'Quotations Per Month' },
    { value: '200+', label: 'Partner Offices' },
    { value: '98%', label: 'Customer Satisfaction' },
  ];

  return (
    <div className="py-20">
      <div className="container">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.forOfficesPage.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.forOfficesPage.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t.forOfficesPage.benefits.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8 flex gap-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Powerful Tools for Your Business
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t.forOfficesPage.cta.title}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            {t.forOfficesPage.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={process.env.NEXT_PUBLIC_IOS_APP_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="secondary">
                {t.forOfficesPage.cta.button}
              </Button>
            </a>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                {t.pricing.contactSales}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
