'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Search, Filter, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';

const actionTypes = [
  'create_maid',
  'update_maid',
  'delete_maid',
  'update_maid_status',
  'bulk_update_maid_status',
  'update_office',
  'send_notification',
  'update_quotation_status',
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const pageSize = 20;

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', page, pageSize, selectedActions.length > 0 ? selectedActions[0] : undefined],
    queryFn: () => adminApi.listAuditLogs({
      page,
      pageSize,
      ...(selectedActions.length > 0 ? { action: selectedActions[0] } : {})
    }),
  });

  const filteredLogs = logs?.data?.items?.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.admin?.name?.toLowerCase().includes(searchLower) ||
      log.targetType.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getActionBadge = (action: string) => {
    if (action.includes('delete') || action.includes('suspend')) {
      return <Badge className="bg-red-500/10 text-red-500">{action}</Badge>;
    }
    if (action.includes('create') || action.includes('verify')) {
      return <Badge className="bg-green-500/10 text-green-500">{action}</Badge>;
    }
    if (action.includes('update')) {
      return <Badge className="bg-blue-500/10 text-blue-500">{action}</Badge>;
    }
    if (action.includes('send') || action.includes('notification')) {
      return <Badge className="bg-purple-500/10 text-purple-500">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const getTargetBadge = (targetType: string) => {
    switch (targetType) {
      case 'maid':
        return <Badge variant="outline" className="border-pink-500 text-pink-500">Maid</Badge>;
      case 'office':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Office</Badge>;
      case 'user':
        return <Badge variant="outline" className="border-green-500 text-green-500">User</Badge>;
      case 'quotation':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Quotation</Badge>;
      default:
        return <Badge variant="outline">{targetType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all administrative actions on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{logs?.data?.total || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{logs?.data?.items?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Showing on this page</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{logs?.data?.totalPages || 0}</div>
                <p className="text-xs text-muted-foreground">Total pages</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {selectedActions.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedActions.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {actionTypes.map((action) => (
                    <DropdownMenuCheckboxItem
                      key={action}
                      checked={selectedActions.includes(action)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedActions([action]);
                        } else {
                          setSelectedActions([]);
                        }
                      }}
                    >
                      {action.replace(/_/g, ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{log.admin?.name || 'System'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTargetBadge(log.targetType)}
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.targetId.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details || undefined}>
                        {log.details ? (
                          <span className="text-sm">{log.details.slice(0, 50)}{log.details.length > 50 ? '...' : ''}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleDateString('en-US', {
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
              {logs?.data && logs.data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {logs.data.page} of {logs.data.totalPages} ({logs.data.total} total)
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
                      disabled={page >= logs.data.totalPages}
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
