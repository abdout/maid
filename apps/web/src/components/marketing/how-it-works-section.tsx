'use client';

import { useI18n } from '@/lib/i18n';
import { Search, FileText, CheckCircle } from 'lucide-react';

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    {
      number: 1,
      icon: Search,
      title: t.howItWorks.step1.title,
      description: t.howItWorks.step1.description,
    },
    {
      number: 2,
      icon: FileText,
      title: t.howItWorks.step2.title,
      description: t.howItWorks.step2.description,
    },
    {
      number: 3,
      icon: CheckCircle,
      title: t.howItWorks.step3.title,
      description: t.howItWorks.step3.description,
    },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.howItWorks.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 start-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Step */}
              <div className="relative z-10">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute -top-2 -end-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  {step.number}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
