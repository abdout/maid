'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Eye, EyeOff, Trash, Search, Plus, Pencil, Upload } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminApi, type MaidListItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
  onDelete,
}: {
  maid: MaidListItem;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (maid: MaidListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/maids/${maid.id}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
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
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(maid)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MaidsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maidToDelete, setMaidToDelete] = useState<MaidListItem | null>(null);

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
      toast({
        title: 'Status updated',
        description: 'The maid status has been updated',
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

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      adminApi.bulkUpdateMaidStatus(ids, status),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-maids'] });
      setSelectedIds([]);
      toast({
        title: 'Bulk update complete',
        description: `Updated ${result.data.updated} maids`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to bulk update',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maids'] });
      setDeleteDialogOpen(false);
      setMaidToDelete(null);
      toast({
        title: 'Maid deleted',
        description: 'The maid profile has been deleted',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete maid',
        variant: 'destructive',
      });
    },
  });

  const handlePublish = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'available' });
  };

  const handleUnpublish = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'inactive' });
  };

  const handleDelete = (maid: MaidListItem) => {
    setMaidToDelete(maid);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (maidToDelete) {
      deleteMutation.mutate(maidToDelete.id);
    }
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

  const handleRowClick = (maidId: string) => {
    router.push(`/maids/${maidId}`);
  };

  const maids = data?.data.items || [];
  const totalPages = data?.data.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maids</h1>
          <p className="text-muted-foreground">
            Manage all maid listings across offices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/maids/import">
              <Upload className="mr-2 h-4 w-4" />
              Import from Excel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/maids/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Maid
            </Link>
          </Button>
        </div>
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
                <TableRow
                  key={maid.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(maid.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <MaidActions
                      maid={maid}
                      onPublish={handlePublish}
                      onUnpublish={handleUnpublish}
                      onDelete={handleDelete}
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
          Page {page} of {totalPages} ({data?.data?.total || 0} total)
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maid profile
              for <strong>{maidToDelete?.name}</strong> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
