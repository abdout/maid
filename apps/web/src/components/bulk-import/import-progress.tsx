'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ImportProgressProps {
  current: number;
  total: number;
  isComplete: boolean;
}

export function ImportProgress({ current, total, isComplete }: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {!isComplete && <Loader2 className="h-5 w-5 animate-spin" />}
          {isComplete ? 'Import Complete' : 'Importing Maids...'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>{current} of {total} maids processed</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {!isComplete && (
            <p className="text-sm text-muted-foreground">
              Please wait while we import your maids. This may take a few moments.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
