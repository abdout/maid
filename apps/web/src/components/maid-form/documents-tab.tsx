'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Upload, FileImage, FileText } from 'lucide-react';

interface Document {
  id: string;
  type: string;
  url: string;
  createdAt: string;
}

interface DocumentsTabProps {
  documents?: Document[];
  onDeleteDocument?: (documentId: string) => void;
  onUploadDocument?: (type: string, file: File) => Promise<void>;
  isUploading?: boolean;
}

export function DocumentsTab({
  documents = [],
  onDeleteDocument,
  onUploadDocument,
  isUploading,
}: DocumentsTabProps) {
  const form = useFormContext();
  const [uploadType, setUploadType] = useState<string>('photo');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadDocument) {
      await onUploadDocument(uploadType, file);
      e.target.value = '';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Photo URL field */}
      <FormField
        control={form.control}
        name="photoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Photo URL</FormLabel>
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={field.value || undefined} />
                <AvatarFallback>Photo</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormControl>
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="mt-1">
                  Enter a direct URL to the worker&apos;s photo
                </FormDescription>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Existing documents */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Documents</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <p className="font-medium capitalize">{doc.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </a>
                      {onDeleteDocument && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload new document (only for edit mode) */}
      {onUploadDocument && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload New Document</h3>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="photo">Photo</option>
                <option value="passport">Passport</option>
                <option value="visa">Visa</option>
                <option value="medical">Medical Certificate</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">File</label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="mt-2"
              />
            </div>
            <Button type="button" disabled={isUploading} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Accepted formats: Images (JPG, PNG) and PDF. Max size: 5MB.
          </p>
        </div>
      )}
    </div>
  );
}
