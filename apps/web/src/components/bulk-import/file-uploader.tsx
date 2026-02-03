'use client';

import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function FileUploader({ onFileSelect, isLoading, error }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setFileError('Please upload an Excel (.xlsx, .xls) or CSV file');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 5MB');
      return false;
    }

    return true;
  }, []);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
  }, []);

  const displayError = fileError || error;

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center p-8 rounded-lg transition-colors
            ${dragActive ? 'bg-primary/10 border-primary' : 'bg-muted/50'}
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {selectedFile ? (
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="h-12 w-12 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports Excel (.xlsx, .xls) and CSV files up to 5MB
              </p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Button variant="outline" asChild disabled={isLoading}>
                  <span>Browse Files</span>
                </Button>
              </label>
            </>
          )}
        </div>

        {displayError && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{displayError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
