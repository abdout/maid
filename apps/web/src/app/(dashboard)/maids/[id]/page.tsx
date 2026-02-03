'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MaidForm } from '@/components/maid-form';
import { adminApi, type CreateMaidInput } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditMaidPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const maidId = params.id as string;

  const { data: maid, isLoading: maidLoading } = useQuery({
    queryKey: ['maid', maidId],
    queryFn: () => adminApi.getMaid(maidId),
  });

  const { data: nationalities, isLoading: natLoading } = useQuery({
    queryKey: ['nationalities'],
    queryFn: () => adminApi.listNationalities(),
  });

  const { data: languages, isLoading: langLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => adminApi.listLanguages(),
  });

  const { data: offices, isLoading: officesLoading } = useQuery({
    queryKey: ['offices-simple'],
    queryFn: () => adminApi.listOffices({ pageSize: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateMaidInput>) => adminApi.updateMaid(maidId, data),
    onSuccess: (result) => {
      toast({
        title: 'Maid updated',
        description: `Successfully updated ${result.data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['maid', maidId] });
      queryClient.invalidateQueries({ queryKey: ['maids'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update maid',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteMaid(maidId),
    onSuccess: () => {
      toast({
        title: 'Maid deleted',
        description: 'The maid profile has been deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['maids'] });
      router.push('/maids');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete maid',
        variant: 'destructive',
      });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (documentId: string) => adminApi.deleteMaidDocument(documentId),
    onSuccess: () => {
      toast({
        title: 'Document deleted',
        description: 'The document has been removed',
      });
      queryClient.invalidateQueries({ queryKey: ['maid', maidId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      });
    },
  });

  const isLoading = maidLoading || natLoading || langLoading || officesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!maid?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Maid not found</h2>
        <p className="text-muted-foreground mb-4">The requested maid profile does not exist.</p>
        <Button asChild>
          <Link href="/maids">Back to Maids</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/maids">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Maid</h1>
            <p className="text-muted-foreground">
              {maid.data.name} - {maid.data.nationality?.nameEn}
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the maid profile
                for <strong>{maid.data.name}</strong> and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maid Details</CardTitle>
          <CardDescription>
            Update the maid profile information. Changes are saved immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaidForm
            maid={maid.data}
            nationalities={nationalities?.data || []}
            languages={languages?.data || []}
            offices={offices?.data?.items?.map((o) => ({ id: o.id, name: o.name })) || []}
            onSubmit={(data) => updateMutation.mutate(data)}
            onDeleteDocument={(documentId) => deleteDocMutation.mutate(documentId)}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
