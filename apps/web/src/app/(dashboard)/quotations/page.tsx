'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi, type QuotationListItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, AlertCircle, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500', icon: <Clock className="h-3 w-3" /> },
  sent: { label: 'Sent', color: 'bg-blue-500/10 text-blue-500', icon: <Send className="h-3 w-3" /> },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500', icon: <XCircle className="h-3 w-3" /> },
  expired: { label: 'Expired', color: 'bg-gray-500/10 text-gray-500', icon: <AlertCircle className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge className={`${config.color} gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export default function QuotationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationListItem | null>(null);
  const pageSize = 20;

  const { data: quotations, isLoading } = useQuery({
    queryKey: ['quotations', page, pageSize, statusFilter],
    queryFn: () =>
      adminApi.listQuotations({
        page,
        pageSize,
        ...(statusFilter && { status: statusFilter }),
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateQuotationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: 'Status updated',
        description: 'The quotation status has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (quotationId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: quotationId, status: newStatus });
  };

  const filteredQuotations = quotations?.data?.items?.filter((q) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      q.customer?.name?.toLowerCase().includes(searchLower) ||
      q.customer?.phone?.includes(search) ||
      q.maid?.name?.toLowerCase().includes(searchLower) ||
      q.office?.name?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calculate stats
  const stats = {
    total: quotations?.data?.total || 0,
    pending: quotations?.data?.items?.filter((q) => q.status === 'pending').length || 0,
    accepted: quotations?.data?.items?.filter((q) => q.status === 'accepted').length || 0,
    rejected: quotations?.data?.items?.filter((q) => q.status === 'rejected').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">
          Manage customer quotation requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.pending}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.accepted}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.rejected}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotations Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No quotations found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Maid</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quotation.customer?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{quotation.customer?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={quotation.maid?.photoUrl || undefined} />
                            <AvatarFallback>
                              {quotation.maid?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{quotation.maid?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {quotation.office?.name || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(quotation.salary).toLocaleString()} AED
                      </TableCell>
                      <TableCell>{quotation.contractMonths} months</TableCell>
                      <TableCell>
                        <StatusBadge status={quotation.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={quotation.status}
                            onValueChange={(value) => handleStatusChange(quotation.id, value)}
                          >
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuotation(quotation)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {quotations?.data && quotations.data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {quotations.data.page} of {quotations.data.totalPages} ({quotations.data.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= quotations.data.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quotation Detail Dialog */}
      <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
            <DialogDescription>
              Created on {selectedQuotation && new Date(selectedQuotation.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedQuotation.customer?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuotation.customer?.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Office</p>
                  <p className="font-medium">{selectedQuotation.office?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedQuotation.maid?.photoUrl || undefined} />
                  <AvatarFallback>
                    {selectedQuotation.maid?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maid</p>
                  <p className="font-medium">{selectedQuotation.maid?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Salary</p>
                  <p className="font-medium">{parseFloat(selectedQuotation.salary).toLocaleString()} AED/month</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contract Duration</p>
                  <p className="font-medium">{selectedQuotation.contractMonths} months</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <StatusBadge status={selectedQuotation.status} />
              </div>
              {selectedQuotation.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedQuotation.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
