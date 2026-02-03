'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileSpreadsheet, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileUploader,
  ValidationTable,
  ImportProgress,
  ImportSummary,
} from '@/components/bulk-import';
import { adminApi, type RowValidationResult, type ValidatedRow, type ImportResult } from '@/lib/api';
import { parseFile, generateTemplate, downloadBlob, type RawRow } from '@/lib/excel-parser';
import { useToast } from '@/hooks/use-toast';

type Step = 'upload' | 'validate' | 'review' | 'import' | 'complete';

export default function MaidsImportPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Wizard state
  const [step, setStep] = useState<Step>('upload');
  const [parsedRows, setParsedRows] = useState<RawRow[]>([]);
  const [validationResults, setValidationResults] = useState<RowValidationResult[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Fetch template columns
  const { data: templateData } = useQuery({
    queryKey: ['bulk-import-template'],
    queryFn: () => adminApi.getBulkImportTemplate(),
  });

  // Validate mutation
  const validateMutation = useMutation({
    mutationFn: (rows: RawRow[]) => adminApi.validateBulkImport(rows),
    onSuccess: (data) => {
      setValidationResults(data.data.rows);
      // Auto-select all valid rows
      const validRowNumbers = data.data.rows
        .filter(r => r.valid)
        .map(r => r.row_number);
      setSelectedRows(new Set(validRowNumbers));
      setStep('review');
    },
    onError: (error: Error) => {
      toast({
        title: 'Validation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (rows: ValidatedRow[]) => adminApi.executeBulkImport(rows),
    onSuccess: (data) => {
      setImportResult(data.data);
      setStep('complete');
    },
    onError: (error: Error) => {
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
      setStep('review');
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setParseError(null);
    const result = await parseFile(file);

    if (!result.success) {
      setParseError(result.errors.join('. '));
      return;
    }

    setParsedRows(result.rows);
    setStep('validate');
  }, []);

  // Handle validation
  const handleValidate = useCallback(() => {
    validateMutation.mutate(parsedRows);
  }, [parsedRows, validateMutation]);

  // Handle import
  const handleImport = useCallback(() => {
    const rowsToImport = validationResults
      .filter(r => r.valid && selectedRows.has(r.row_number))
      .map(r => r.data!)
      .filter(Boolean);

    if (rowsToImport.length === 0) {
      toast({
        title: 'No rows selected',
        description: 'Please select at least one valid row to import.',
        variant: 'destructive',
      });
      return;
    }

    setStep('import');
    importMutation.mutate(rowsToImport);
  }, [validationResults, selectedRows, importMutation, toast]);

  // Handle template download
  const handleDownloadTemplate = useCallback(() => {
    if (!templateData?.data.columns) return;
    const blob = generateTemplate(templateData.data.columns);
    downloadBlob(blob, 'maids-import-template.xlsx');
  }, [templateData]);

  // Handle done
  const handleDone = useCallback(() => {
    router.push('/maids');
  }, [router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setStep('upload');
    setParsedRows([]);
    setValidationResults([]);
    setSelectedRows(new Set());
    setImportResult(null);
    setParseError(null);
  }, []);

  // Step indicators
  const steps = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'validate', label: 'Validate', icon: FileSpreadsheet },
    { key: 'review', label: 'Review', icon: CheckCircle },
    { key: 'import', label: 'Import', icon: Loader2 },
    { key: 'complete', label: 'Done', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/maids')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Import Maids from Excel</h1>
            <p className="text-muted-foreground">
              Bulk import maid profiles from an Excel or CSV file
            </p>
          </div>
        </div>
        {step === 'upload' && (
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {steps.slice(0, -1).map((s, index) => {
          const Icon = s.icon;
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;

          return (
            <div key={s.key} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                  ${isActive ? 'bg-primary text-primary-foreground' : ''}
                  ${!isActive && !isComplete ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                {isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className={`h-5 w-5 ${isActive && s.key === 'import' ? 'animate-spin' : ''}`} />
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive || isComplete ? '' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
              {index < steps.length - 2 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <FileUploader
            onFileSelect={handleFileSelect}
            error={parseError}
          />

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                Follow these steps to import maids in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Download the template file using the button above</li>
                <li>Fill in the maid details in the spreadsheet</li>
                <li>Save the file and upload it here</li>
                <li>Review validation results and fix any errors</li>
                <li>Select the rows you want to import</li>
                <li>Click Import to create the maid profiles</li>
              </ol>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <strong>Note:</strong> Maximum 500 rows per import. Office names and
                nationalities must match existing records in the system.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'validate' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Validating Data</CardTitle>
              <CardDescription>
                Checking {parsedRows.length} rows for errors...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Please wait while we validate your data
              </p>
              <Button
                className="mt-4"
                onClick={handleValidate}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending ? 'Validating...' : 'Start Validation'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <ValidationTable
            rows={validationResults}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            showOnlyInvalid={showOnlyInvalid}
            onToggleInvalid={() => setShowOnlyInvalid(!showOnlyInvalid)}
          />

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleRetry}>
              Start Over
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={selectedRows.size === 0 || importMutation.isPending}
              >
                Import {selectedRows.size} Maid{selectedRows.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'import' && (
        <div className="max-w-2xl mx-auto">
          <ImportProgress
            current={importMutation.isPending ? Math.floor(selectedRows.size * 0.5) : selectedRows.size}
            total={selectedRows.size}
            isComplete={false}
          />
        </div>
      )}

      {step === 'complete' && importResult && (
        <div className="max-w-2xl mx-auto">
          <ImportSummary
            result={importResult}
            onDone={handleDone}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
}
