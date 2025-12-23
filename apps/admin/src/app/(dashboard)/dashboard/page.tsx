'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  UserCircle2,
  CreditCard,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={UserCircle2}
          description="All registered users"
        />
        <StatCard
          title="Total Offices"
          value={stats?.totalOffices || 0}
          icon={Building2}
          description="Recruitment offices"
        />
        <StatCard
          title="Total Maids"
          value={stats?.totalMaids || 0}
          icon={Users}
          description="Listed domestic workers"
        />
        <StatCard
          title="Total Quotations"
          value={stats?.totalQuotations || 0}
          icon={TrendingUp}
          description="Quote requests"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Payments"
          value={stats?.totalPayments || 0}
          icon={CreditCard}
          description="CV unlocks processed"
        />
        <StatCard
          title="Revenue"
          value={`${(stats?.revenue || 0).toLocaleString()} AED`}
          icon={DollarSign}
          description="Total earnings"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={TrendingUp}
          description="Office subscriptions"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Activity feed coming soon...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">
              • Review pending office verifications
            </p>
            <p className="text-muted-foreground text-sm">
              • Check flagged maid profiles
            </p>
            <p className="text-muted-foreground text-sm">
              • Send mass notifications
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
