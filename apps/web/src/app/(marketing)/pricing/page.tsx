'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Unlock } from 'lucide-react';

export default function PricingPage() {
  const { t } = useI18n();

  const cvUnlockFeatures = [
    t.pricing.oneTime,
    t.pricing.includesContact,
    t.pricing.validForever,
  ];

  const officePlans = [
    {
      name: t.pricing.basic,
      price: 99,
      features: [
        t.pricing.maidsLimit.replace('{count}', '25'),
        'Basic support',
        'Standard listing',
      ],
      popular: false,
    },
    {
      name: t.pricing.professional,
      price: 249,
      features: [
        t.pricing.maidsLimit.replace('{count}', '100'),
        t.pricing.prioritySupport,
        'Featured listings',
        t.pricing.analytics,
      ],
      popular: true,
    },
    {
      name: t.pricing.enterprise,
      price: 499,
      features: [
        t.pricing.unlimitedMaids,
        t.pricing.prioritySupport,
        'Premium listings',
        t.pricing.analytics,
        t.pricing.apiAccess,
        t.pricing.dedicatedManager,
      ],
      popular: false,
    },
  ];

  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.pricing.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* CV Unlock Pricing */}
        <div className="max-w-md mx-auto mb-20">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Unlock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t.pricing.cvUnlock}</CardTitle>
              <p className="text-muted-foreground">{t.pricing.cvUnlockDesc}</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">25</span>
                <span className="text-xl text-muted-foreground"> AED</span>
                <span className="text-sm text-muted-foreground block">{t.pricing.perProfile}</span>
              </div>
              <ul className="space-y-3 mb-6 text-start">
                {cvUnlockFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={process.env.NEXT_PUBLIC_IOS_APP_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full" size="lg">
                  {t.pricing.getStarted}
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Office Subscriptions */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {t.pricing.officeSubscriptions}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {t.pricing.officeSubscriptionsDesc}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {officePlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'border-2 border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> AED{t.pricing.perMonth}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.name === t.pricing.enterprise
                    ? t.pricing.contactSales
                    : t.pricing.getStarted}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">
            Have questions about pricing?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
