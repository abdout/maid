'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { RowValidationResult } from '@/lib/api';

interface ValidationTableProps {
  rows: RowValidationResult[];
  selectedRows: Set<number>;
  onSelectionChange: (selected: Set<number>) => void;
  showOnlyInvalid?: boolean;
  onToggleInvalid: () => void;
}

export function ValidationTable({
  rows,
  selectedRows,
  onSelectionChange,
  showOnlyInvalid,
  onToggleInvalid,
}: ValidationTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const filteredRows = showOnlyInvalid ? rows.filter(r => !r.valid) : rows;
  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const validRowNumbers = rows
        .filter(r => r.valid)
        .map(r => r.row_number);
      onSelectionChange(new Set(validRowNumbers));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (rowNumber: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowNumber);
    } else {
      newSelected.delete(rowNumber);
    }
    onSelectionChange(newSelected);
  };

  const toggleExpandRow = (rowNumber: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowNumber)) {
      newExpanded.delete(rowNumber);
    } else {
      newExpanded.add(rowNumber);
    }
    setExpandedRows(newExpanded);
  };

  const allValidSelected = rows
    .filter(r => r.valid)
    .every(r => selectedRows.has(r.row_number));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          Validation Results
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="default" className="bg-green-600">
              {validCount} Valid
            </Badge>
            <Badge variant="destructive">
              {invalidCount} Invalid
            </Badge>
          </div>
          {invalidCount > 0 && (
            <Button variant="outline" size="sm" onClick={onToggleInvalid}>
              {showOnlyInvalid ? 'Show All' : 'Show Invalid Only'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allValidSelected && validCount > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    disabled={validCount === 0}
                  />
                </TableHead>
                <TableHead className="w-16">Row</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {showOnlyInvalid ? 'No invalid rows' : 'No rows to display'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <>
                    <TableRow
                      key={row.row_number}
                      className={row.valid ? '' : 'bg-destructive/5'}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row.row_number)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row.row_number, !!checked)
                          }
                          disabled={!row.valid}
                        />
                      </TableCell>
                      <TableCell className="font-mono">{row.row_number}</TableCell>
                      <TableCell>
                        {row.valid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>{row.data?.name || '-'}</TableCell>
                      <TableCell>{row.data?.officeId ? 'Matched' : '-'}</TableCell>
                      <TableCell>{row.data?.nationalityId ? 'Matched' : '-'}</TableCell>
                      <TableCell>
                        {row.data?.salary ? `AED ${row.data.salary}` : '-'}
                      </TableCell>
                      <TableCell>
                        {row.errors.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpandRow(row.row_number)}
                          >
                            {expandedRows.has(row.row_number) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(row.row_number) && row.errors.length > 0 && (
                      <TableRow key={`${row.row_number}-errors`}>
                        <TableCell colSpan={8} className="bg-muted/50 py-2">
                          <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                            {row.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected for import
        </div>
      </CardContent>
    </Card>
  );
}
