'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Eye, EyeOff, Trash, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminApi, type MaidListItem } from '@/lib/api';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  available: 'success',
  inactive: 'secondary',
  busy: 'warning',
  reserved: 'default',
};

function StatusBadge({ status }: { status: string }) {
  const variant = statusVariants[status] || 'default';
  return <Badge variant={variant}>{status}</Badge>;
}

function MaidActions({
  maid,
  onPublish,
  onUnpublish,
}: {
  maid: MaidListItem;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {maid.status === 'available' ? (
          <DropdownMenuItem onClick={() => onUnpublish(maid.id)}>
            <EyeOff className="mr-2 h-4 w-4" />
            Unpublish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onPublish(maid.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MaidsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-maids', page, search, statusFilter],
    queryFn: () =>
      adminApi.listMaids({
        page,
        pageSize: 20,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateMaidStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maids'] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      adminApi.bulkUpdateMaidStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maids'] });
      setSelectedIds([]);
    },
  });

  const handlePublish = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'available' });
  };

  const handleUnpublish = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'inactive' });
  };

  const handleBulkPublish = () => {
    if (selectedIds.length > 0) {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: 'available' });
    }
  };

  const handleBulkUnpublish = () => {
    if (selectedIds.length > 0) {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: 'inactive' });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (data?.data.items) {
      if (selectedIds.length === data.data.items.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(data.data.items.map((m) => m.id));
      }
    }
  };

  const maids = data?.data.items || [];
  const totalPages = data?.data.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maids</h1>
        <p className="text-muted-foreground">
          Manage all maid listings across offices
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search maids..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="available">Available (Published)</option>
          <option value="inactive">Inactive (Unpublished)</option>
          <option value="busy">Busy</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkPublish}>
            <Eye className="mr-2 h-4 w-4" />
            Publish All
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkUnpublish}>
            <EyeOff className="mr-2 h-4 w-4" />
            Unpublish All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds([])}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    maids.length > 0 && selectedIds.length === maids.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : maids.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No maids found
                </TableCell>
              </TableRow>
            ) : (
              maids.map((maid) => (
                <TableRow key={maid.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(maid.id)}
                      onChange={() => toggleSelect(maid.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={maid.photoUrl || undefined} />
                      <AvatarFallback>
                        {maid.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{maid.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {maid.office?.name || '-'}
                  </TableCell>
                  <TableCell>{maid.nationality?.nameEn || '-'}</TableCell>
                  <TableCell>{maid.salary} AED</TableCell>
                  <TableCell>
                    <StatusBadge status={maid.status} />
                  </TableCell>
                  <TableCell>
                    <MaidActions
                      maid={maid}
                      onPublish={handlePublish}
                      onUnpublish={handleUnpublish}
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
