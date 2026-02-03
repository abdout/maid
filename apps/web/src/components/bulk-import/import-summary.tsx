'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { ImportResult } from '@/lib/api';

interface ImportSummaryProps {
  result: ImportResult;
  onDone: () => void;
  onRetry?: () => void;
}

export function ImportSummary({ result, onDone, onRetry }: ImportSummaryProps) {
  const hasErrors = result.errors.length > 0;
  const allFailed = result.created === 0 && result.failed > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allFailed ? (
            <>
              <XCircle className="h-6 w-6 text-destructive" />
              Import Failed
            </>
          ) : hasErrors ? (
            <>
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              Import Completed with Errors
            </>
          ) : (
            <>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Import Successful
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-green-600">{result.created}</p>
            <p className="text-sm text-muted-foreground">Maids Created</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-destructive">{result.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold">{result.created + result.failed}</p>
            <p className="text-sm text-muted-foreground">Total Processed</p>
          </div>
        </div>

        {/* Error Details */}
        {hasErrors && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Failed Rows
            </h4>
            <div className="rounded-md border max-h-48 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono">{err.row_number}</TableCell>
                      <TableCell className="text-destructive">{err.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onRetry && hasErrors && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
          <Button onClick={onDone}>
            {result.created > 0 ? 'View Maids' : 'Done'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
