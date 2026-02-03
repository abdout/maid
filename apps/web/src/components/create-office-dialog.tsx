'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi, type CreateOfficeResult } from '@/lib/api';

const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

const SCOPES = [
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'leasing', label: 'Leasing' },
  { value: 'typing', label: 'Typing' },
] as const;

interface CreateOfficeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOfficeDialog({ open, onOpenChange }: CreateOfficeDialogProps) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<CreateOfficeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [officeName, setOfficeName] = useState('');
  const [officeNameAr, setOfficeNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emirate, setEmirate] = useState('');
  const [scopes, setScopes] = useState<string[]>(['recruitment']);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [autoVerify, setAutoVerify] = useState(true);

  const resetForm = () => {
    setOfficeName('');
    setOfficeNameAr('');
    setPhone('');
    setEmail('');
    setEmirate('');
    setScopes(['recruitment']);
    setAdminEmail('');
    setAdminName('');
    setAdminPassword('');
    setAutoVerify(true);
    setResult(null);
    setCopied(false);
  };

  const createOfficeMutation = useMutation({
    mutationFn: adminApi.createOffice,
    onSuccess: (response) => {
      setResult(response.data);
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
    },
  });

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createOfficeMutation.mutate({
      office: {
        name: officeName,
        nameAr: officeNameAr || undefined,
        phone,
        email: email || undefined,
        scopes: scopes as ('recruitment' | 'leasing' | 'typing')[],
        emirate: emirate || undefined,
      },
      admin: {
        email: adminEmail,
        password: adminPassword || undefined,
        name: adminName || undefined,
      },
      autoVerify,
    });
  };

  const handleCopyCredentials = () => {
    if (!result) return;
    const text = `Office: ${result.office.name}\nAdmin Email: ${result.admin.email}\nPassword: ${result.admin.temporaryPassword || adminPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      if (scopes.length > 1) {
        setScopes(scopes.filter((s) => s !== scope));
      }
    } else {
      setScopes([...scopes, scope]);
    }
  };

  // Success view
  if (result) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Office Created Successfully</DialogTitle>
            <DialogDescription>
              The office and admin account have been created. Copy the credentials below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Office Name</p>
                <p className="font-medium">{result.office.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Email</p>
                <p className="font-medium">{result.admin.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Password</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-background px-2 py-1 rounded text-sm">
                    {showPassword
                      ? result.admin.temporaryPassword || adminPassword
                      : '••••••••••••'}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-medium">
                  {result.office.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCopyCredentials}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Credentials
                </>
              )}
            </Button>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Form view
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Office</DialogTitle>
          <DialogDescription>
            Create a new office with an admin account. The admin will be able to log in
            and manage maids.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Office Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Office Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officeName">Office Name *</Label>
                <Input
                  id="officeName"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="Al Nahda Office"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeNameAr">Office Name (Arabic)</Label>
                <Input
                  id="officeNameAr"
                  value={officeNameAr}
                  onChange={(e) => setOfficeNameAr(e.target.value)}
                  placeholder="مكتب النهضة"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971501234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Office Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@office.ae"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emirate">Emirate</Label>
              <Select value={emirate} onValueChange={setEmirate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emirate" />
                </SelectTrigger>
                <SelectContent>
                  {EMIRATES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service Scopes *</Label>
              <div className="flex gap-4">
                {SCOPES.map((scope) => (
                  <label
                    key={scope.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={scopes.includes(scope.value)}
                      onCheckedChange={() => toggleScope(scope.value)}
                    />
                    <span className="text-sm">{scope.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Account */}
          <div className="space-y-4">
            <h3 className="font-medium">Admin Account</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@office.ae"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ahmed Al Khalifa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Leave empty to auto-generate"
                  className="flex-1"
                />
                <Button
                  type="button"
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
                <Button type="button" variant="outline" onClick={generatePassword}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If left empty, a secure password will be generated automatically
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={autoVerify}
                onCheckedChange={(checked) => setAutoVerify(checked === true)}
              />
              <span className="text-sm">Auto-verify office (skip approval)</span>
            </label>
          </div>

          {createOfficeMutation.error && (
            <div className="text-sm text-destructive">
              {createOfficeMutation.error instanceof Error
                ? createOfficeMutation.error.message
                : 'Failed to create office'}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOfficeMutation.isPending}>
              {createOfficeMutation.isPending ? 'Creating...' : 'Create Office'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
