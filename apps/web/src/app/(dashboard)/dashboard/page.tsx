'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  UserCircle2,
  TrendingUp,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import Link from 'next/link';

// Mock chart data - in real app would come from API
const revenueData = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 1398 },
  { name: 'Wed', value: 3800 },
  { name: 'Thu', value: 3908 },
  { name: 'Fri', value: 4800 },
  { name: 'Sat', value: 3800 },
  { name: 'Sun', value: 4300 },
];

const userGrowthData = [
  { name: 'Week 1', users: 120 },
  { name: 'Week 2', users: 185 },
  { name: 'Week 3', users: 250 },
  { name: 'Week 4', users: 340 },
];

// Mock recent activity
const recentActivity = [
  { id: 1, type: 'new_user', message: 'New user registered: Ahmed M.', time: '5 min ago' },
  { id: 2, type: 'cv_unlock', message: 'CV unlocked for Maria S.', time: '12 min ago' },
  { id: 3, type: 'quotation', message: 'New quotation request from Sara K.', time: '25 min ago' },
  { id: 4, type: 'office_verified', message: 'Office verified: Premium Recruitment', time: '1 hour ago' },
  { id: 5, type: 'new_maid', message: 'New maid profile added by Global Services', time: '2 hours ago' },
];

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1">
          {trend && (
            <>
              {trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs ${
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trendValue}
              </span>
            </>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your platform overview.
          </p>
        </div>
        <Link href="/analytics">
          <Button>View Analytics</Button>
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={UserCircle2}
          trend="up"
          trendValue="+12%"
          description="from last month"
        />
        <StatCard
          title="Total Offices"
          value={stats?.totalOffices || 0}
          icon={Building2}
          trend="up"
          trendValue="+4%"
          description="from last month"
        />
        <StatCard
          title="Total Maids"
          value={stats?.totalMaids || 0}
          icon={Users}
          trend="up"
          trendValue="+8%"
          description="from last month"
        />
        <StatCard
          title="Quotations"
          value={stats?.totalQuotations || 0}
          icon={TrendingUp}
          trend="up"
          trendValue="+23%"
          description="from last month"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
          trend="up"
          trendValue="+18%"
          description="from last month"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={TrendingUp}
          description="Office subscriptions"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} AED`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/offices?filter=pending" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Review pending office verifications
              </Button>
            </Link>
            <Link href="/maids?filter=flagged" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Check flagged maid profiles
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Update CV unlock pricing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
