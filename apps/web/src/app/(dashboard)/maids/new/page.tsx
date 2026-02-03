'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MaidForm } from '@/components/maid-form';
import { adminApi, type CreateMaidInput } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewMaidPage() {
  const router = useRouter();
  const { toast } = useToast();

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

  const createMutation = useMutation({
    mutationFn: (data: CreateMaidInput) => adminApi.createMaid(data),
    onSuccess: (result) => {
      toast({
        title: 'Maid created',
        description: `Successfully created ${result.data.name}`,
      });
      router.push('/maids');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create maid',
        variant: 'destructive',
      });
    },
  });

  const isLoading = natLoading || langLoading || officesLoading;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/maids">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Maid</h1>
          <p className="text-muted-foreground">
            Create a new maid profile
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maid Details</CardTitle>
          <CardDescription>
            Fill in all required fields to create a new maid profile. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaidForm
            nationalities={nationalities?.data || []}
            languages={languages?.data || []}
            offices={offices?.data?.items?.map((o) => ({ id: o.id, name: o.name })) || []}
            onSubmit={(data) => createMutation.mutate(data)}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
