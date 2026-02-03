'use client';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2 } from 'lucide-react';

export function ValuePropsSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For Customers */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.valueProps.forCustomers}</h3>
              <p className="text-muted-foreground text-lg">
                {t.valueProps.forCustomersDesc}
              </p>
            </CardContent>
          </Card>

          {/* For Offices */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.valueProps.forOffices}</h3>
              <p className="text-muted-foreground text-lg">
                {t.valueProps.forOfficesDesc}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
