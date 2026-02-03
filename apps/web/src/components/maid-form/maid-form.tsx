'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BasicInfoTab } from './basic-info-tab';
import { ExperienceTab } from './experience-tab';
import { JobDetailsTab } from './job-details-tab';
import { PricingTab } from './pricing-tab';
import { DocumentsTab } from './documents-tab';
import type { MaidDetail, Nationality, Language, CreateMaidInput } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const maidFormSchema = z.object({
  officeId: z.string().min(1, 'Office is required'),
  name: z.string().min(1, 'Name is required').max(255),
  nameAr: z.string().max(255).optional(),
  nationalityId: z.string().min(1, 'Nationality is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  religion: z.enum(['muslim', 'non_muslim']),
  experienceYears: z.number().int().min(0).optional(),
  salary: z.string().min(1, 'Salary is required'),
  photoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['available', 'inactive', 'busy', 'reserved']).optional(),
  serviceType: z.string().optional(),
  bio: z.string().optional(),
  bioAr: z.string().optional(),
  sex: z.enum(['male', 'female']).optional(),
  educationLevel: z.string().optional(),
  hasChildren: z.boolean().optional(),
  jobType: z.string().optional(),
  packageType: z.string().optional(),
  hasExperience: z.boolean().optional(),
  experienceDetails: z.string().max(70).optional(),
  skillsDetails: z.string().max(70).optional(),
  cookingSkills: z.string().optional(),
  babySitter: z.boolean().optional(),
  officeFees: z.string().optional(),
  availability: z.string().optional(),
  whatsappNumber: z.string().max(20).optional(),
  contactNumber: z.string().max(20).optional(),
  cvReference: z.string().max(50).optional(),
  languageIds: z.array(z.string()).optional(),
});

type MaidFormValues = z.infer<typeof maidFormSchema>;

interface MaidFormProps {
  maid?: MaidDetail;
  nationalities: Nationality[];
  languages: Language[];
  offices: { id: string; name: string }[];
  onSubmit: (data: CreateMaidInput) => void;
  onDeleteDocument?: (documentId: string) => void;
  onUploadDocument?: (type: string, file: File) => Promise<void>;
  isSubmitting?: boolean;
  isUploading?: boolean;
}

export function MaidForm({
  maid,
  nationalities,
  languages,
  offices,
  onSubmit,
  onDeleteDocument,
  onUploadDocument,
  isSubmitting,
  isUploading,
}: MaidFormProps) {
  const form = useForm<MaidFormValues>({
    resolver: zodResolver(maidFormSchema),
    defaultValues: {
      officeId: maid?.officeId || '',
      name: maid?.name || '',
      nameAr: maid?.nameAr || '',
      nationalityId: maid?.nationalityId || '',
      dateOfBirth: maid?.dateOfBirth ? new Date(maid.dateOfBirth).toISOString().split('T')[0] : '',
      maritalStatus: (maid?.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed') || 'single',
      religion: (maid?.religion as 'muslim' | 'non_muslim') || 'muslim',
      experienceYears: maid?.experienceYears || 0,
      salary: maid?.salary || '',
      photoUrl: maid?.photoUrl || '',
      status: (maid?.status as 'available' | 'inactive' | 'busy' | 'reserved') || 'available',
      serviceType: maid?.serviceType || 'individual',
      bio: maid?.bio || '',
      bioAr: maid?.bioAr || '',
      sex: (maid?.sex as 'male' | 'female') || 'female',
      educationLevel: maid?.educationLevel || '',
      hasChildren: maid?.hasChildren || false,
      jobType: maid?.jobType || 'domestic_worker',
      packageType: maid?.packageType || 'traditional',
      hasExperience: maid?.hasExperience || false,
      experienceDetails: maid?.experienceDetails || '',
      skillsDetails: maid?.skillsDetails || '',
      cookingSkills: maid?.cookingSkills || '',
      babySitter: maid?.babySitter || false,
      officeFees: maid?.officeFees || '',
      availability: maid?.availability || 'inside_uae',
      whatsappNumber: maid?.whatsappNumber || '',
      contactNumber: maid?.contactNumber || '',
      cvReference: maid?.cvReference || '',
      languageIds: maid?.languages?.map((l) => l.id) || [],
    },
  });

  const handleSubmit = (values: MaidFormValues) => {
    const data: CreateMaidInput = {
      ...values,
      photoUrl: values.photoUrl || undefined,
      nameAr: values.nameAr || undefined,
      experienceYears: values.experienceYears || undefined,
      bio: values.bio || undefined,
      bioAr: values.bioAr || undefined,
      educationLevel: values.educationLevel || undefined,
      experienceDetails: values.experienceDetails || undefined,
      skillsDetails: values.skillsDetails || undefined,
      cookingSkills: values.cookingSkills || undefined,
      officeFees: values.officeFees || undefined,
      whatsappNumber: values.whatsappNumber || undefined,
      contactNumber: values.contactNumber || undefined,
      cvReference: values.cvReference || undefined,
      languageIds: values.languageIds || undefined,
    };
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="job">Job Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <BasicInfoTab nationalities={nationalities} offices={offices} />
          </TabsContent>

          <TabsContent value="experience" className="mt-6">
            <ExperienceTab languages={languages} />
          </TabsContent>

          <TabsContent value="job" className="mt-6">
            <JobDetailsTab />
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <PricingTab />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentsTab
              documents={maid?.documents}
              onDeleteDocument={onDeleteDocument}
              onUploadDocument={onUploadDocument}
              isUploading={isUploading}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {maid ? 'Update Maid' : 'Create Maid'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
