'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, type MaidListItem } from '@/lib/api';

export default function OfficeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const officeId = params.id as string;

  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Fetch office details
  const { data: officeData, isLoading: officeLoading } = useQuery({
    queryKey: ['admin-office', officeId],
    queryFn: () => adminApi.getOffice(officeId),
  });

  // Fetch maids for this office
  const { data: maidsData, isLoading: maidsLoading } = useQuery({
    queryKey: ['admin-maids', { officeId }],
    queryFn: () => adminApi.listMaids({ officeId, pageSize: 10 }),
  });

  const office = officeData?.data;
  const maids = maidsData?.data.items || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (approved: boolean) =>
      adminApi.approveOffice(officeId, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-office', officeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ adminUserId, password }: { adminUserId: string; password?: string }) =>
      adminApi.resetOfficePassword(officeId, {
        adminUserId,
        newPassword: password || undefined,
      }),
    onSuccess: (response) => {
      if (response.data.temporaryPassword) {
        setGeneratedPassword(response.data.temporaryPassword);
      } else {
        setGeneratedPassword(newPassword);
      }
    },
  });

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleResetPassword = () => {
    if (!selectedAdminId) return;
    resetPasswordMutation.mutate({
      adminUserId: selectedAdminId,
      password: newPassword || undefined,
    });
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeResetDialog = () => {
    setResetPasswordDialogOpen(false);
    setSelectedAdminId(null);
    setNewPassword('');
    setGeneratedPassword(null);
    setShowPassword(false);
  };

  if (officeLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Office not found</p>
        <Button variant="outline" onClick={() => router.push('/offices')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Offices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/offices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{office.name}</h1>
              {office.isVerified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="secondary">Pending</Badge>
              )}
            </div>
            {office.nameAr && (
              <p className="text-muted-foreground" dir="rtl">
                {office.nameAr}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!office.isVerified && (
            <>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => setApproveDialogOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
          {office.isVerified && (
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Revoke Verification
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Maids</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{office.stats.totalMaids}</div>
            <p className="text-xs text-muted-foreground">
              {office.stats.activeMaids} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{office.stats.quotations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{office.adminUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Office Details */}
      <Card>
        <CardHeader>
          <CardTitle>Office Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="font-medium">{office.phone}</p>
            </div>
            {office.email && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="font-medium">{office.email}</p>
              </div>
            )}
            {office.emirate && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Emirate
                </div>
                <p className="font-medium">{office.emirate}</p>
              </div>
            )}
            {office.website && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Website
                </div>
                <a
                  href={office.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {office.website}
                </a>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Scopes</div>
              <div className="flex gap-1">
                {office.scopes.map((scope) => (
                  <Badge key={scope} variant="outline">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
            {office.createdByAdmin && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Created By</div>
                <p className="font-medium">
                  {office.createdByAdmin.name || 'Admin'}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Joined</div>
              <p className="font-medium">
                {new Date(office.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>
            Users who can manage this office and its maids
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {office.adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No admin users
                  </TableCell>
                </TableRow>
              ) : (
                office.adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name || '-'}</TableCell>
                    <TableCell>{admin.email || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAdminId(admin.id);
                              setResetPasswordDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Maids List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Maids</CardTitle>
            <CardDescription>
              Workers managed by this office
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/maids/new?officeId=${officeId}`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Maid
          </Button>
        </CardHeader>
        <CardContent>
          {maidsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : maids.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No maids registered yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maids.map((maid) => (
                  <TableRow
                    key={maid.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/maids/${maid.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {maid.photoUrl ? (
                          <img
                            src={maid.photoUrl}
                            alt={maid.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{maid.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {maid.nationality?.nameEn || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          maid.status === 'available'
                            ? 'success'
                            : maid.status === 'inactive'
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {maid.status}
                      </Badge>
                    </TableCell>
                    <TableCell>AED {maid.salary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {maidsData && maidsData.data.total > 10 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/maids?officeId=${officeId}`)}
              >
                View All {maidsData.data.total} Maids
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={closeResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {generatedPassword ? 'Password Reset Successfully' : 'Reset Admin Password'}
            </DialogTitle>
            <DialogDescription>
              {generatedPassword
                ? 'Copy the new password and share it securely with the admin.'
                : 'Generate a new password for this admin user.'}
            </DialogDescription>
          </DialogHeader>

          {generatedPassword ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">New Password</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-background px-2 py-1 rounded text-sm flex-1">
                    {showPassword ? generatedPassword : '••••••••••••'}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCopyPassword}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Password
                    </>
                  )}
                </Button>
                <Button onClick={closeResetDialog}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave empty to auto-generate"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" onClick={generatePassword}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeResetDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Office</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{office.name}"? The office will be able
              to manage maids and receive quotations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveMutation.mutate(true)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {office.isVerified ? 'Revoke Verification' : 'Reject Office'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {office.isVerified
                ? `Are you sure you want to revoke verification for "${office.name}"?`
                : `Are you sure you want to reject "${office.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveMutation.mutate(false)}
              disabled={approveMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {approveMutation.isPending
                ? office.isVerified
                  ? 'Revoking...'
                  : 'Rejecting...'
                : office.isVerified
                ? 'Revoke'
                : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
