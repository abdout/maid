'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { Unlock, Search, User, Users, AlertCircle, Calendar, TrendingUp } from 'lucide-react';

export default function CvUnlocksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 20;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['cv-unlock-stats'],
    queryFn: () => adminApi.getCvUnlockStats(),
  });

  const { data: unlocks, isLoading: unlocksLoading } = useQuery({
    queryKey: ['cv-unlocks', page, pageSize],
    queryFn: () => adminApi.listCvUnlocks({ page, pageSize }),
  });

  const filteredUnlocks = unlocks?.data?.items?.filter(
    (unlock) =>
      unlock.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      unlock.customer?.phone?.includes(search) ||
      unlock.maid?.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CV Unlocks</h1>
        <p className="text-muted-foreground">
          Track CV unlock transactions and revenue
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unlocks</CardTitle>
            <Unlock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.totalUnlocks || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.todayUnlocks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.data?.weekUnlocks || 0} this week
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.uniqueCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">Who unlocked CVs</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unlocked Maids</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.uniqueMaids || 0}</div>
                <p className="text-xs text-muted-foreground">Unique profiles viewed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unlocks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Unlocks</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search unlocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unlocksLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredUnlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No CV unlocks found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Maid</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnlocks.map((unlock) => (
                    <TableRow key={unlock.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{unlock.customer?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{unlock.customer?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={unlock.maid?.photoUrl || undefined} />
                            <AvatarFallback>
                              {unlock.maid?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{unlock.maid?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {unlock.payment ? (
                          <span className="font-medium">
                            {parseFloat(unlock.payment.amount).toLocaleString()} AED
                          </span>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {unlock.payment?.status === 'succeeded' ? (
                          <Badge className="bg-green-500/10 text-green-500">Paid</Badge>
                        ) : unlock.payment ? (
                          <Badge variant="secondary">{unlock.payment.status}</Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(unlock.unlockedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {unlocks?.data && unlocks.data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {unlocks.data.page} of {unlocks.data.totalPages} ({unlocks.data.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= unlocks.data.totalPages}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
