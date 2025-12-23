'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, CheckCircle, XCircle, Ban, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminApi, type OfficeListItem } from '@/lib/api';

function OfficeActions({
  office,
  onVerify,
  onUnverify,
  onSuspend,
  onUnsuspend,
}: {
  office: OfficeListItem;
  onVerify: (id: string) => void;
  onUnverify: (id: string) => void;
  onSuspend: (id: string) => void;
  onUnsuspend: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {office.isVerified ? (
          <DropdownMenuItem onClick={() => onUnverify(office.id)}>
            <XCircle className="mr-2 h-4 w-4" />
            Remove Verification
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onVerify(office.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Verify Office
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {office.isSuspended ? (
          <DropdownMenuItem onClick={() => onUnsuspend(office.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Unsuspend
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onSuspend(office.id)}
            className="text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function OfficesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-offices', page, search, verifiedFilter],
    queryFn: () =>
      adminApi.listOffices({
        page,
        pageSize: 20,
        ...(search && { search }),
        ...(verifiedFilter && { isVerified: verifiedFilter }),
      }),
  });

  const updateOfficeMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { isVerified?: boolean; isSuspended?: boolean };
    }) => adminApi.updateOffice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
    },
  });

  const handleVerify = (id: string) => {
    updateOfficeMutation.mutate({ id, data: { isVerified: true } });
  };

  const handleUnverify = (id: string) => {
    updateOfficeMutation.mutate({ id, data: { isVerified: false } });
  };

  const handleSuspend = (id: string) => {
    updateOfficeMutation.mutate({ id, data: { isSuspended: true } });
  };

  const handleUnsuspend = (id: string) => {
    updateOfficeMutation.mutate({ id, data: { isSuspended: false } });
  };

  const offices = data?.data.items || [];
  const totalPages = data?.data.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Offices</h1>
        <p className="text-muted-foreground">
          Manage recruitment offices on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Offices</option>
          <option value="true">Verified Only</option>
          <option value="false">Unverified Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Maids</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : offices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No offices found
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{office.name}</span>
                      {office.nameAr && (
                        <span className="block text-sm text-muted-foreground">
                          {office.nameAr}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{office.phone || '-'}</TableCell>
                  <TableCell>{office.email || '-'}</TableCell>
                  <TableCell>{office.maidCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {office.isVerified && (
                        <Badge variant="success">Verified</Badge>
                      )}
                      {office.isSuspended && (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                      {!office.isVerified && !office.isSuspended && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(office.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <OfficeActions
                      office={office}
                      onVerify={handleVerify}
                      onUnverify={handleUnverify}
                      onSuspend={handleSuspend}
                      onUnsuspend={handleUnsuspend}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
