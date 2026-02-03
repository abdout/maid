'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Building2,
  Pencil,
  Pause,
  Play,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { adminApi, type OfficeListItem, type OfficeDetail } from '@/lib/api';
import { OfficeFormSheet } from '@/components/office-form-sheet';
import { useToast } from '@/hooks/use-toast';

function OfficeStatusBadge({ office }: { office: OfficeListItem }) {
  if (office.isSuspended) {
    return <Badge variant="destructive">Suspended</Badge>;
  }
  if (office.isVerified) {
    return <Badge variant="success">Verified</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

function OfficeActions({
  office,
  onEdit,
  onVerify,
  onReject,
  onSuspend,
  onResume,
  onDelete,
}: {
  office: OfficeListItem;
  onEdit: (office: OfficeListItem) => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (office: OfficeListItem) => void;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(office)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/offices/${office.id}`)}>
          <Building2 className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Verification Actions */}
        {!office.isVerified && (
          <DropdownMenuItem onClick={() => onVerify(office.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Office
          </DropdownMenuItem>
        )}
        {office.isVerified && !office.isSuspended && (
          <DropdownMenuItem onClick={() => onReject(office.id)}>
            <XCircle className="mr-2 h-4 w-4" />
            Revoke Verification
          </DropdownMenuItem>
        )}
        {/* Suspension Actions */}
        <DropdownMenuSeparator />
        {office.isSuspended ? (
          <DropdownMenuItem onClick={() => onResume(office.id)}>
            <Play className="mr-2 h-4 w-4" />
            Resume Office
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onSuspend(office.id)}>
            <Pause className="mr-2 h-4 w-4" />
            Suspend Office
          </DropdownMenuItem>
        )}
        {/* Delete Action */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(office)}
          className="text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete Office
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function OfficesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all');
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeDetail | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<OfficeListItem | null>(null);

  // Derive filter from active tab
  const verifiedFilter =
    activeTab === 'pending' ? 'false' : activeTab === 'verified' ? 'true' : '';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-offices', page, search, verifiedFilter, activeTab],
    queryFn: () =>
      adminApi.listOffices({
        page,
        pageSize: 20,
        ...(search && { search }),
        ...(verifiedFilter && { isVerified: verifiedFilter }),
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      adminApi.approveOffice(id, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
      toast({
        title: 'Office updated',
        description: 'The office status has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update office',
        variant: 'destructive',
      });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) =>
      adminApi.suspendOffice(id, suspended),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
      toast({
        title: variables.suspended ? 'Office suspended' : 'Office resumed',
        description: variables.suspended
          ? 'The office has been suspended'
          : 'The office has been resumed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update office',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
      setDeleteDialogOpen(false);
      setOfficeToDelete(null);
      toast({
        title: 'Office deleted',
        description: 'The office and all associated data have been deleted',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete office',
        variant: 'destructive',
      });
    },
  });

  const handleVerify = (id: string) => {
    approveMutation.mutate({ id, approved: true });
  };

  const handleReject = (id: string) => {
    approveMutation.mutate({ id, approved: false });
  };

  const handleSuspend = (id: string) => {
    suspendMutation.mutate({ id, suspended: true });
  };

  const handleResume = (id: string) => {
    suspendMutation.mutate({ id, suspended: false });
  };

  const handleEdit = async (office: OfficeListItem) => {
    // Fetch full office details for editing
    try {
      const response = await adminApi.getOffice(office.id);
      setEditingOffice(response.data);
      setFormSheetOpen(true);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load office details',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (office: OfficeListItem) => {
    setOfficeToDelete(office);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (officeToDelete) {
      deleteMutation.mutate(officeToDelete.id);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingOffice(null);
    setFormSheetOpen(true);
  };

  const handleRowClick = (officeId: string) => {
    router.push(`/offices/${officeId}`);
  };

  // Filter for suspended tab
  let offices = data?.data.items || [];
  if (activeTab === 'suspended') {
    offices = offices.filter((o) => o.isSuspended);
  }

  const totalPages = data?.data.totalPages || 1;
  const total = data?.data.total || 0;

  // Count pending offices for badge
  const { data: pendingData } = useQuery({
    queryKey: ['admin-offices-pending-count'],
    queryFn: () =>
      adminApi.listOffices({
        page: 1,
        pageSize: 1,
        isVerified: 'false',
      }),
  });
  const pendingCount = pendingData?.data.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offices</h1>
          <p className="text-muted-foreground">
            Manage recruitment offices on the platform
          </p>
        </div>
        <Button onClick={handleOpenCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Office
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as 'all' | 'pending' | 'verified' | 'suspended');
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All Offices</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending Approval
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 min-w-5 px-1.5 text-xs"
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offices..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {activeTab === 'suspended' ? offices.length : total} office{(activeTab === 'suspended' ? offices.length : total) !== 1 ? 's' : ''} found
        </p>
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
                  {activeTab === 'pending'
                    ? 'No pending offices'
                    : activeTab === 'suspended'
                      ? 'No suspended offices'
                      : 'No offices found'}
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow
                  key={office.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(office.id)}
                >
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
                    <OfficeStatusBadge office={office} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(office.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <OfficeActions
                      office={office}
                      onEdit={handleEdit}
                      onVerify={handleVerify}
                      onReject={handleReject}
                      onSuspend={handleSuspend}
                      onResume={handleResume}
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

      {/* Office Form Sheet */}
      <OfficeFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        office={editingOffice}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Office?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the office{' '}
              <strong>{officeToDelete?.name}</strong> and all associated data including:
              <ul className="list-disc ml-6 mt-2">
                <li>{officeToDelete?.maidCount || 0} maid profiles</li>
                <li>All quotations for this office</li>
                <li>Office admin accounts</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Office'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
